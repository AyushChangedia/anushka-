import { describe, expect, it } from "vitest";
import {
  analyzeRecipe,
  buildPantry,
  computeRankScore,
  findPantryMatch,
  matchesFilters,
  matchesQuery,
  normalizeIngredient,
  rankRecipes,
} from "@/lib/recipes/matching";
import { SAMPLE_RECIPES } from "@/lib/data/sample-recipes";
import type { Recipe } from "@/lib/schemas/recipe";

/**
 * Ranking and matching are the only parts of the app where a subtle bug is
 * invisible — results still render, they are just wrong. These tests pin the
 * behaviour the UI depends on.
 */

const recipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: "test",
  title: "Test Recipe",
  description: "A recipe for testing.",
  cuisine: "Italian",
  mealType: "Dinner",
  difficulty: "Easy",
  dietTags: [],
  prepMinutes: 10,
  cookMinutes: 20,
  servings: 2,
  heroHue: 20,
  ingredients: [
    { name: "tomato", quantity: "2", amount: 2, unit: "", note: "" },
    { name: "pasta", quantity: "200g", amount: 200, unit: "g", note: "" },
  ],
  optionalIngredients: [],
  steps: [{ number: 1, title: "Cook", description: "Cook it.", durationMinutes: 5 }],
  tips: [],
  substitutions: [],
  nutrition: { calories: 400, proteinG: 12, carbsG: 60, fatG: 10, fiberG: 4, sugarG: 6 },
  ...overrides,
});

describe("normalizeIngredient", () => {
  it("strips quantities, units and preparation notes", () => {
    expect(normalizeIngredient("2 large Tomatoes, finely diced")).toBe("tomato");
    expect(normalizeIngredient("1 tbsp extra virgin olive oil")).toBe("olive oil");
    expect(normalizeIngredient("500g boneless skinless chicken breast")).toBe(
      "chicken breast",
    );
  });

  it("keeps varietal names, leaving them for the matcher to resolve", () => {
    // "roma" is not stripped — enumerating every varietal would be endless.
    // findPantryMatch handles the head-word match instead (covered below).
    expect(normalizeIngredient("2 large Roma Tomatoes, diced")).toBe("roma tomato");
  });

  it("singularizes without mangling words that legitimately end in s", () => {
    expect(normalizeIngredient("tomatoes")).toBe("tomato");
    expect(normalizeIngredient("berries")).toBe("berry");
    expect(normalizeIngredient("molasses")).toBe("molasses");
  });

  it("maps regional synonyms onto one canonical token", () => {
    expect(normalizeIngredient("cilantro")).toBe(normalizeIngredient("coriander"));
    expect(normalizeIngredient("aubergine")).toBe(normalizeIngredient("eggplant"));
    expect(normalizeIngredient("courgette")).toBe(normalizeIngredient("zucchini"));
  });

  it("drops parentheticals and stray punctuation", () => {
    expect(normalizeIngredient("chicken (free range)")).toBe("chicken");
    expect(normalizeIngredient("garlic!!!")).toBe("garlic");
  });

  it("never returns empty for a real ingredient made only of descriptors", () => {
    // "fresh" is a descriptor, but returning "" would make the item unmatchable
    // and silently drop it from the comparison.
    expect(normalizeIngredient("fresh")).not.toBe("");
  });
});

describe("findPantryMatch", () => {
  const pantry = buildPantry(["Tomatoes", "Chicken", "Olive Oil"]);

  it("matches regardless of case and pluralisation", () => {
    expect(findPantryMatch("tomato", pantry)).toBe("Tomatoes");
  });

  it("returns the user's original wording, not the canonical token", () => {
    // The UI shows this back to the user, so it must read as they typed it.
    expect(findPantryMatch("2 large tomatoes", pantry)).toBe("Tomatoes");
  });

  it("matches a specific recipe ingredient against a general pantry item", () => {
    expect(findPantryMatch("chicken breast", pantry)).toBe("Chicken");
  });

  it("resolves varietals against the plain ingredient", () => {
    // The counterpart to the normalization test above: "roma tomato" survives
    // normalization, and is matched here by its head word.
    expect(findPantryMatch("2 large Roma Tomatoes, diced", pantry)).toBe("Tomatoes");
  });

  it("treats pantry staples as always available", () => {
    expect(findPantryMatch("salt", pantry)).not.toBeNull();
    expect(findPantryMatch("water", pantry)).not.toBeNull();
    // Telling someone who listed "oil" that they are missing olive oil makes
    // the match look broken.
    expect(findPantryMatch("olive oil", buildPantry([]))).not.toBeNull();
  });

  it("does not match unrelated ingredients", () => {
    expect(findPantryMatch("saffron", pantry)).toBeNull();
    expect(findPantryMatch("beef", pantry)).toBeNull();
  });
});

describe("analyzeRecipe", () => {
  it("separates missing required from missing optional ingredients", () => {
    const result = analyzeRecipe(
      recipe({
        optionalIngredients: [
          { name: "basil", quantity: "handful", amount: null, unit: "", note: "" },
        ],
      }),
      buildPantry(["tomato"]),
    );

    expect(result.usesFromPantry).toEqual(["tomato"]);
    expect(result.missingRequired).toEqual(["pasta"]);
    expect(result.missingOptional).toEqual(["basil"]);
  });

  it("scores a fully-stocked recipe at 1", () => {
    const result = analyzeRecipe(recipe(), buildPantry(["tomato", "pasta"]));
    expect(result.matchScore).toBe(1);
    expect(result.missingRequired).toEqual([]);
  });

  it("scores an empty pantry at 0", () => {
    const result = analyzeRecipe(recipe(), buildPantry([]));
    expect(result.matchScore).toBe(0);
  });

  it("does not count optional ingredients against the match score", () => {
    const withOptional = analyzeRecipe(
      recipe({
        optionalIngredients: [
          { name: "truffle", quantity: "1", amount: 1, unit: "", note: "" },
        ],
      }),
      buildPantry(["tomato", "pasta"]),
    );
    expect(withOptional.matchScore).toBe(1);
  });

  it("does not double-count a pantry item used by two ingredients", () => {
    const result = analyzeRecipe(
      recipe({
        ingredients: [
          { name: "chicken breast", quantity: "2", amount: 2, unit: "", note: "" },
          { name: "chicken thigh", quantity: "2", amount: 2, unit: "", note: "" },
        ],
      }),
      buildPantry(["chicken"]),
    );
    expect(result.usesFromPantry).toEqual(["chicken"]);
  });
});

describe("computeRankScore", () => {
  it("ranks a better ingredient match above a faster recipe", () => {
    // The core product promise: cookable now beats quick-but-needs-shopping.
    const fullMatchSlow = computeRankScore({
      matchScore: 1,
      missingRequiredCount: 0,
      minutes: 90,
    });
    const partialMatchFast = computeRankScore({
      matchScore: 0.8,
      missingRequiredCount: 1,
      minutes: 15,
    });
    expect(fullMatchSlow).toBeGreaterThan(partialMatchFast);
  });

  it("prefers fewer missing ingredients at an equal match score", () => {
    const fewer = computeRankScore({
      matchScore: 0.75,
      missingRequiredCount: 1,
      minutes: 30,
    });
    const more = computeRankScore({
      matchScore: 0.75,
      missingRequiredCount: 3,
      minutes: 30,
    });
    expect(fewer).toBeGreaterThan(more);
  });

  it("uses time only as a tiebreaker between otherwise equal recipes", () => {
    const fast = computeRankScore({ matchScore: 1, missingRequiredCount: 0, minutes: 10 });
    const slow = computeRankScore({ matchScore: 1, missingRequiredCount: 0, minutes: 60 });
    expect(fast).toBeGreaterThan(slow);
  });

  it("caps the time penalty so a long recipe cannot be pushed below a worse match", () => {
    const perfectButVeryLong = computeRankScore({
      matchScore: 1,
      missingRequiredCount: 0,
      minutes: 600,
    });
    const oneMissing = computeRankScore({
      matchScore: 0.9,
      missingRequiredCount: 1,
      minutes: 0,
    });
    expect(perfectButVeryLong).toBeGreaterThan(oneMissing);
  });
});

describe("rankRecipes", () => {
  it("returns recipes ordered by descending rank score", () => {
    const ranked = rankRecipes(SAMPLE_RECIPES, ["rice", "garlic", "butter", "onion", "egg"]);
    const scores = ranked.map((r) => r.rankScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("puts the best-matching recipe first", () => {
    const ranked = rankRecipes(SAMPLE_RECIPES, [
      "rice", "garlic", "butter", "onion", "egg", "soy sauce", "scallion",
    ]);
    expect(ranked[0]?.id).toBe("garlic-fried-rice");
  });

  it("is deterministic across runs with the same input", () => {
    const pantry = ["tomato", "onion", "egg", "garlic"];
    const first = rankRecipes(SAMPLE_RECIPES, pantry).map((r) => r.id);
    const second = rankRecipes(SAMPLE_RECIPES, pantry).map((r) => r.id);
    expect(first).toEqual(second);
  });

  it("returns every recipe even when the pantry is empty", () => {
    // An empty result would read as "the app is broken", not "you have nothing".
    expect(rankRecipes(SAMPLE_RECIPES, []).length).toBe(SAMPLE_RECIPES.length);
  });
});

describe("matchesFilters", () => {
  const ranked = analyzeRecipe(
    recipe({ dietTags: ["Vegetarian", "Healthy"], cuisine: "Italian" }),
    buildPantry([]),
  );

  it("requires every selected diet tag, not just one", () => {
    expect(
      matchesFilters(ranked, {
        dietTags: ["Vegetarian", "Healthy"],
        cuisines: [],
        mealTypes: [],
        maxMinutes: null,
      }),
    ).toBe(true);

    expect(
      matchesFilters(ranked, {
        dietTags: ["Vegetarian", "Vegan"],
        cuisines: [],
        mealTypes: [],
        maxMinutes: null,
      }),
    ).toBe(false);
  });

  it("treats cuisine as any-of", () => {
    expect(
      matchesFilters(ranked, {
        dietTags: [],
        cuisines: ["Italian", "Indian"],
        mealTypes: [],
        maxMinutes: null,
      }),
    ).toBe(true);
  });

  it("filters on total time, not just cook time", () => {
    // 10 prep + 20 cook = 30 total.
    const base = { dietTags: [], cuisines: [], mealTypes: [] };
    expect(matchesFilters(ranked, { ...base, maxMinutes: 30 })).toBe(true);
    expect(matchesFilters(ranked, { ...base, maxMinutes: 25 })).toBe(false);
  });

  it("passes everything when no filters are selected", () => {
    expect(
      matchesFilters(ranked, {
        dietTags: [],
        cuisines: [],
        mealTypes: [],
        maxMinutes: null,
      }),
    ).toBe(true);
  });
});

describe("matchesQuery", () => {
  const ranked = analyzeRecipe(recipe({ title: "Creamy Tomato Pasta" }), buildPantry([]));

  it("matches on title, ingredient and cuisine, case-insensitively", () => {
    expect(matchesQuery(ranked, "TOMATO")).toBe(true);
    expect(matchesQuery(ranked, "pasta")).toBe(true);
    expect(matchesQuery(ranked, "italian")).toBe(true);
  });

  it("returns everything for an empty or whitespace query", () => {
    expect(matchesQuery(ranked, "")).toBe(true);
    expect(matchesQuery(ranked, "   ")).toBe(true);
  });

  it("excludes non-matches", () => {
    expect(matchesQuery(ranked, "chocolate")).toBe(false);
  });
});
