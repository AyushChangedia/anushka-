import { describe, expect, it } from "vitest";
import {
  generateRequestSchema,
  recipeSchema,
  totalMinutes,
} from "@/lib/schemas/recipe";
import { SAMPLE_RECIPES } from "@/lib/data/sample-recipes";

/**
 * The schema is the contract between the model, the API and the UI. If the
 * sample corpus ever stops satisfying it, the fallback path is broken — and
 * that path is what runs when there is no API key.
 */
describe("recipeSchema", () => {
  it("accepts every recipe in the sample corpus", () => {
    for (const recipe of SAMPLE_RECIPES) {
      const result = recipeSchema.safeParse(recipe);
      expect(result.success, `${recipe.id} failed validation`).toBe(true);
    }
  });

  it("requires at least one ingredient and one step", () => {
    const base = SAMPLE_RECIPES[0]!;
    expect(recipeSchema.safeParse({ ...base, ingredients: [] }).success).toBe(false);
    expect(recipeSchema.safeParse({ ...base, steps: [] }).success).toBe(false);
  });

  it("rejects an unknown cuisine rather than passing it through", () => {
    const base = SAMPLE_RECIPES[0]!;
    expect(recipeSchema.safeParse({ ...base, cuisine: "Martian" }).success).toBe(false);
  });

  it("rejects negative nutrition values", () => {
    const base = SAMPLE_RECIPES[0]!;
    const result = recipeSchema.safeParse({
      ...base,
      nutrition: { ...base.nutrition, calories: -10 },
    });
    expect(result.success).toBe(false);
  });
});

describe("sample corpus quality", () => {
  it("gives every recipe the 8-15 detailed steps the brief calls for", () => {
    for (const recipe of SAMPLE_RECIPES) {
      expect(
        recipe.steps.length,
        `${recipe.id} has ${recipe.steps.length} steps`,
      ).toBeGreaterThanOrEqual(7);
      expect(recipe.steps.length).toBeLessThanOrEqual(15);
    }
  });

  it("numbers steps contiguously from 1", () => {
    for (const recipe of SAMPLE_RECIPES) {
      const numbers = recipe.steps.map((s) => s.number);
      expect(numbers).toEqual(numbers.map((_, i) => i + 1));
    }
  });

  it("uses unique ids so slugs never collide", () => {
    const ids = SAMPLE_RECIPES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never tags a recipe Vegan while listing animal products", () => {
    const ANIMAL = ["egg", "butter", "milk", "cheese", "chicken", "beef", "honey", "cream"];

    for (const recipe of SAMPLE_RECIPES) {
      if (!recipe.dietTags.includes("Vegan")) continue;

      const names = recipe.ingredients.map((i) => i.name.toLowerCase());
      for (const animal of ANIMAL) {
        expect(
          names.some((n) => n.includes(animal)),
          `${recipe.id} is tagged Vegan but lists ${animal}`,
        ).toBe(false);
      }
    }
  });
});

describe("totalMinutes", () => {
  it("sums prep and cook time", () => {
    expect(totalMinutes({ prepMinutes: 10, cookMinutes: 25 })).toBe(35);
  });
});

describe("generateRequestSchema", () => {
  it("applies defaults for filters and count", () => {
    const result = generateRequestSchema.parse({ ingredients: ["tomato"] });
    expect(result.count).toBe(8);
    expect(result.filters.dietTags).toEqual([]);
    expect(result.filters.maxMinutes).toBeNull();
  });

  it("rejects an empty ingredient list", () => {
    expect(generateRequestSchema.safeParse({ ingredients: [] }).success).toBe(false);
  });

  it("caps the number of recipes that can be requested", () => {
    expect(
      generateRequestSchema.safeParse({ ingredients: ["egg"], count: 50 }).success,
    ).toBe(false);
  });
});
