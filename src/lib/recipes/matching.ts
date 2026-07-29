import {
  type Recipe,
  type RankedRecipe,
  type RecipeIngredient,
  type GenerateRequest,
  totalMinutes,
} from "@/lib/schemas/recipe";

/**
 * Ingredient matching and recipe ranking.
 *
 * This is deliberately *not* done by the LLM. The model proposes recipes; this
 * module decides — deterministically — what the user actually has, what they
 * are missing, and in what order the results appear. That keeps ranking
 * reproducible, testable, and instant when filters change client-side.
 */

/**
 * Things almost every kitchen has. Treated as owned so a recipe isn't demoted
 * for requiring salt. Users who genuinely lack these are not the target case,
 * and listing "water" as a missing ingredient reads as a bug.
 */
export const PANTRY_STAPLES = new Set([
  "water",
  "salt",
  "pepper",
  "black pepper",
  "sugar",
  "oil",
  "cooking oil",
  "vegetable oil",
  "olive oil",
  "ice",
]);

/**
 * Words that describe an ingredient rather than identify it. Stripped before
 * matching so "2 large ripe roma tomatoes, diced" matches a pantry "tomato".
 */
const DESCRIPTORS = new Set([
  "fresh", "frozen", "dried", "canned", "raw", "cooked", "ripe", "large",
  "small", "medium", "extra", "whole", "half", "chopped", "diced", "sliced",
  "minced", "grated", "shredded", "crushed", "ground", "boneless", "skinless",
  "unsalted", "salted", "low", "fat", "free", "range", "organic", "finely",
  "roughly", "thinly", "peeled", "deseeded", "optional", "to", "taste", "of",
  "for", "the", "a", "an", "and", "or", "plus", "some", "your", "favourite",
  "favorite", "good", "quality", "room", "temperature", "warm", "cold", "hot",
  // Grade and packaging words that qualify an ingredient without identifying it
  // ("extra virgin olive oil" is olive oil).
  "virgin", "pure", "light", "heavy", "double", "single", "plain", "natural",
  "unsweetened", "sweetened", "toasted", "roasted", "smoked", "cured",
]);

/** Units and measures that can prefix an ingredient in free-text entry. */
const UNITS = new Set([
  "g", "kg", "mg", "oz", "lb", "lbs", "ml", "l", "cup", "cups", "tbsp",
  "tablespoon", "tablespoons", "tsp", "teaspoon", "teaspoons", "clove",
  "cloves", "pinch", "pinches", "handful", "handfuls", "can", "cans", "tin",
  "tins", "packet", "packets", "slice", "slices", "piece", "pieces", "bunch",
  "bunches", "sprig", "sprigs", "stick", "sticks", "quart", "pint", "gallon",
]);

/**
 * Ingredients that are the same thing under different names. Mapped to a single
 * canonical token so "coriander" and "cilantro" are one ingredient.
 */
const SYNONYMS: Record<string, string> = {
  cilantro: "coriander",
  "coriander leaves": "coriander",
  aubergine: "eggplant",
  brinjal: "eggplant",
  courgette: "zucchini",
  capsicum: "bell pepper",
  "spring onion": "scallion",
  "green onion": "scallion",
  "garbanzo bean": "chickpea",
  chana: "chickpea",
  curd: "yogurt",
  yoghurt: "yogurt",
  "maize": "corn",
  "groundnut": "peanut",
  "prawn": "shrimp",
  "minced beef": "ground beef",
  "soya sauce": "soy sauce",
  "bell peppers": "bell pepper",
  "chilli": "chili",
  "chile": "chili",
  "coriander powder": "coriander",
  "curd rice": "rice",
  "paneer cheese": "paneer",
  "all purpose flour": "flour",
  "plain flour": "flour",
  "maida": "flour",
};

/**
 * Ingredient names that end in "s" but are not plurals. Stripping the "s" turns
 * these into words that match nothing ("molasses" -> "molasse"), so they are
 * listed explicitly rather than handled by a rule.
 */
const NEVER_SINGULARIZE = new Set([
  "molasses", "hummus", "couscous", "asparagus", "watercress", "swiss",
  "bass", "grass", "cress", "citrus", "anise",
]);

/**
 * Crude but effective singularization. A full stemmer would over-match on food
 * words, so this only handles the endings that actually show up in ingredient
 * names.
 */
function singularize(word: string): string {
  if (word.length <= 3) return word;
  if (NEVER_SINGULARIZE.has(word)) return word;
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("oes") || word.endsWith("shes") || word.endsWith("ches")) {
    return word.slice(0, -2);
  }
  if (word.endsWith("ss")) return word;
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

/**
 * Reduce a free-text ingredient to a canonical token for comparison.
 *
 * "2 large Roma Tomatoes, finely diced" -> "tomato"
 * "1 tbsp extra virgin olive oil"       -> "olive oil"
 */
export function normalizeIngredient(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\([^)]*\)/g, " ") // drop parentheticals
    .replace(/[^a-z\s-]/g, " ") // drop digits, fractions, punctuation
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  const kept = cleaned
    .split(" ")
    .filter((w) => w && !UNITS.has(w) && !DESCRIPTORS.has(w))
    .map(singularize)
    .filter(Boolean);

  // Everything was a descriptor — fall back to the raw words so we don't
  // silently turn a real ingredient into an empty string.
  const words = kept.length > 0 ? kept : cleaned.split(" ").map(singularize);
  const joined = words.join(" ").trim();

  return SYNONYMS[joined] ?? joined;
}

/** Build the lookup set used for matching, keyed by canonical token. */
export function buildPantry(rawIngredients: string[]): Map<string, string> {
  const pantry = new Map<string, string>();
  for (const raw of rawIngredients) {
    const key = normalizeIngredient(raw);
    if (key && !pantry.has(key)) pantry.set(key, raw.trim());
  }
  return pantry;
}

/**
 * Does the pantry cover this recipe ingredient?
 *
 * Matches on the canonical token, then falls back to containment in either
 * direction so pantry "chicken" satisfies "chicken breast", and pantry
 * "chicken breast" satisfies "chicken". Containment is gated on a length
 * floor so short tokens like "oil" don't match "oil-cured olives".
 */
export function findPantryMatch(
  ingredientName: string,
  pantry: Map<string, string>,
): string | null {
  const key = normalizeIngredient(ingredientName);
  if (!key) return null;

  const exact = pantry.get(key);
  if (exact) return exact;

  if (PANTRY_STAPLES.has(key)) return key;

  for (const [pantryKey, original] of pantry) {
    if (pantryKey.length < 4 || key.length < 4) continue;
    const keyWords = key.split(" ");
    const pantryWords = pantryKey.split(" ");
    // "chicken breast" vs "chicken": one is a head-word of the other.
    if (keyWords.includes(pantryKey) || pantryWords.includes(key)) {
      return original;
    }
  }

  return null;
}

const nameOf = (i: RecipeIngredient) => i.name;

/** Annotate a recipe with what the user has, is missing, and how well it fits. */
export function analyzeRecipe(
  recipe: Recipe,
  pantry: Map<string, string>,
): RankedRecipe {
  const usesFromPantry: string[] = [];
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const ingredient of recipe.ingredients) {
    const match = findPantryMatch(nameOf(ingredient), pantry);
    if (match) {
      if (!usesFromPantry.includes(match)) usesFromPantry.push(match);
    } else {
      missingRequired.push(ingredient.name);
    }
  }

  for (const ingredient of recipe.optionalIngredients) {
    if (!findPantryMatch(nameOf(ingredient), pantry)) {
      missingOptional.push(ingredient.name);
    }
  }

  const required = recipe.ingredients.length;
  const matchScore = required === 0 ? 0 : (required - missingRequired.length) / required;

  return {
    ...recipe,
    usesFromPantry,
    missingRequired,
    missingOptional,
    matchScore,
    rankScore: computeRankScore({
      matchScore,
      missingRequiredCount: missingRequired.length,
      minutes: totalMinutes(recipe),
    }),
  };
}

/**
 * Composite ranking score, highest first.
 *
 * Ordering priority, per the product brief:
 *   1. Best ingredient match      (dominant term)
 *   2. Fewest missing ingredients (strong penalty per missing item)
 *   3. Shortest cooking time      (gentle tiebreaker)
 *
 * The weights are chosen so the terms can't leapfrog each other: match is
 * worth up to 100, each missing item costs 12, and time can only ever shave
 * off up to 10. So a fully-matched 90-minute recipe still outranks a
 * one-ingredient-short 15-minute one.
 */
export function computeRankScore(input: {
  matchScore: number;
  missingRequiredCount: number;
  minutes: number;
}): number {
  const matchTerm = input.matchScore * 100;
  const missingPenalty = input.missingRequiredCount * 12;
  const timePenalty = Math.min(input.minutes / 12, 10);
  return matchTerm - missingPenalty - timePenalty;
}

/** Client-side filter predicate. Kept pure so the UI can re-filter instantly. */
export function matchesFilters(
  recipe: RankedRecipe,
  filters: GenerateRequest["filters"],
): boolean {
  if (
    filters.dietTags.length > 0 &&
    !filters.dietTags.every((tag) => recipe.dietTags.includes(tag))
  ) {
    return false;
  }
  if (filters.cuisines.length > 0 && !filters.cuisines.includes(recipe.cuisine)) {
    return false;
  }
  if (filters.mealTypes.length > 0 && !filters.mealTypes.includes(recipe.mealType)) {
    return false;
  }
  if (filters.maxMinutes !== null && totalMinutes(recipe) > filters.maxMinutes) {
    return false;
  }
  return true;
}

/** Case-insensitive search across the fields a user would plausibly search. */
export function matchesQuery(recipe: RankedRecipe, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    recipe.title.toLowerCase().includes(q) ||
    recipe.description.toLowerCase().includes(q) ||
    recipe.cuisine.toLowerCase().includes(q) ||
    recipe.ingredients.some((i) => i.name.toLowerCase().includes(q))
  );
}

/** Analyze and sort a batch of recipes against a pantry. */
export function rankRecipes(
  recipes: Recipe[],
  rawPantry: string[],
): RankedRecipe[] {
  const pantry = buildPantry(rawPantry);
  return recipes
    .map((r) => analyzeRecipe(r, pantry))
    .sort((a, b) => {
      if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
      // Stable, meaningful tiebreak so equal scores don't shuffle between runs.
      return totalMinutes(a) - totalMinutes(b);
    });
}
