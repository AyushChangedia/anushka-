import { z } from "zod";

/**
 * The single source of truth for a recipe.
 *
 * This schema does triple duty:
 *  1. It is converted to JSON Schema and handed to the LLM via structured
 *     outputs, so the model is *constrained* to this shape rather than merely
 *     asked for it.
 *  2. It validates anything coming back over the wire before it reaches React.
 *  3. It is the inferred TypeScript type used throughout the app.
 *
 * Keep it strict. Every optional field here is a field the UI has to branch on.
 */

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export const difficultySchema = z.enum(DIFFICULTIES);
export type Difficulty = z.infer<typeof difficultySchema>;

export const CUISINES = [
  "Indian",
  "Italian",
  "Chinese",
  "Mexican",
  "Thai",
  "Japanese",
  "Mediterranean",
  "American",
  "French",
  "Middle Eastern",
  "Korean",
  "Other",
] as const;
export const cuisineSchema = z.enum(CUISINES);
export type Cuisine = z.infer<typeof cuisineSchema>;

export const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
] as const;
export const mealTypeSchema = z.enum(MEAL_TYPES);
export type MealType = z.infer<typeof mealTypeSchema>;

export const DIET_TAGS = [
  "Vegetarian",
  "Vegan",
  "High Protein",
  "Low Carb",
  "Gluten Free",
  "Dairy Free",
  "Healthy",
] as const;
export const dietTagSchema = z.enum(DIET_TAGS);
export type DietTag = z.infer<typeof dietTagSchema>;

/** A single line in the ingredients list. */
export const recipeIngredientSchema = z.object({
  /** Canonical ingredient name, e.g. "tomato". Used for pantry matching. */
  name: z.string().min(1).max(80),
  /** Human-readable amount, e.g. "2 medium" or "1 tbsp". */
  quantity: z.string().max(60).default(""),
  /** Numeric magnitude of the quantity, used for serving-size scaling. */
  amount: z.number().nonnegative().nullable().default(null),
  /** Unit for `amount`, e.g. "g", "tbsp", "cup". Empty for countable items. */
  unit: z.string().max(24).default(""),
  /** Preparation note, e.g. "finely chopped". */
  note: z.string().max(120).default(""),
});
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;

export const recipeStepSchema = z.object({
  /** 1-based step number. */
  number: z.number().int().positive(),
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(600),
  /** Optional built-in timer for this step, in minutes. */
  durationMinutes: z.number().int().nonnegative().nullable().default(null),
});
export type RecipeStep = z.infer<typeof recipeStepSchema>;

export const nutritionSchema = z.object({
  /** All values are per serving. */
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nonnegative(),
  sugarG: z.number().nonnegative(),
});
export type Nutrition = z.infer<typeof nutritionSchema>;

export const substitutionSchema = z.object({
  /** The ingredient the cook might not have. */
  ingredient: z.string().min(1).max(80),
  /** What to use instead. */
  substitute: z.string().min(1).max(160),
});
export type Substitution = z.infer<typeof substitutionSchema>;

export const recipeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  cuisine: cuisineSchema,
  mealType: mealTypeSchema,
  difficulty: difficultySchema,
  dietTags: z.array(dietTagSchema).max(7).default([]),
  prepMinutes: z.number().int().nonnegative().max(600),
  cookMinutes: z.number().int().nonnegative().max(600),
  servings: z.number().int().positive().max(24),
  /** Ingredients the cook is expected to have (or that are pantry staples). */
  ingredients: z.array(recipeIngredientSchema).min(1).max(40),
  /** Nice-to-haves. The recipe works without these. */
  optionalIngredients: z.array(recipeIngredientSchema).max(20).default([]),
  steps: z.array(recipeStepSchema).min(1).max(20),
  tips: z.array(z.string().min(1).max(300)).max(10).default([]),
  substitutions: z.array(substitutionSchema).max(12).default([]),
  nutrition: nutritionSchema,
  /** Hue (0-360) used to render the generated gradient hero art. */
  heroHue: z.number().int().min(0).max(360).default(28),
});
export type Recipe = z.infer<typeof recipeSchema>;

/**
 * A recipe plus the per-request analysis of how it lines up with the user's
 * pantry. The AI never produces this — it is computed server-side in
 * `lib/recipes/matching.ts` so the ranking is deterministic and testable.
 */
export const rankedRecipeSchema = recipeSchema.extend({
  /** Pantry items this recipe uses, in the user's own wording. */
  usesFromPantry: z.array(z.string()),
  /** Required ingredients the user does not have. */
  missingRequired: z.array(z.string()),
  /** Optional ingredients the user does not have. */
  missingOptional: z.array(z.string()),
  /** 0-1. Share of required ingredients already in the pantry. */
  matchScore: z.number().min(0).max(1),
  /** Composite ranking score. Higher sorts first. */
  rankScore: z.number(),
});
export type RankedRecipe = z.infer<typeof rankedRecipeSchema>;

export const totalMinutes = (r: Pick<Recipe, "prepMinutes" | "cookMinutes">) =>
  r.prepMinutes + r.cookMinutes;

/** The exact payload the model is constrained to return. */
export const recipeGenerationSchema = z.object({
  recipes: z
    .array(recipeSchema.omit({ id: true }).extend({ id: z.string().optional() }))
    .min(1)
    .max(10),
});
export type RecipeGeneration = z.infer<typeof recipeGenerationSchema>;

export const generateRequestSchema = z.object({
  ingredients: z
    .array(z.string().min(1).max(80))
    .min(1, "Add at least one ingredient")
    .max(40, "That is a lot of ingredients — try trimming the list"),
  filters: z
    .object({
      dietTags: z.array(dietTagSchema).default([]),
      cuisines: z.array(cuisineSchema).default([]),
      mealTypes: z.array(mealTypeSchema).default([]),
      maxMinutes: z.number().int().positive().max(600).nullable().default(null),
    })
    .default({ dietTags: [], cuisines: [], mealTypes: [], maxMinutes: null }),
  count: z.number().int().min(1).max(10).default(8),
});
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generateResponseSchema = z.object({
  recipes: z.array(rankedRecipeSchema),
  /** True when the deterministic sample generator produced these. */
  usedFallback: z.boolean(),
  /** Present when we fell back, explaining why. */
  notice: z.string().nullable().default(null),
});
export type GenerateResponse = z.infer<typeof generateResponseSchema>;
