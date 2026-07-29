import { z } from "zod";
import {
  CUISINES,
  DIET_TAGS,
  DIFFICULTIES,
  MEAL_TYPES,
} from "@/lib/schemas/recipe";

/**
 * The JSON Schema handed to Claude via `output_config.format`.
 *
 * This is written by hand rather than derived from the Zod schema for two
 * reasons: structured outputs reject several constraint keywords that Zod emits
 * (`minLength`, `maximum`, and friends), and every object must carry
 * `additionalProperties: false` with *all* properties listed in `required`.
 * Hand-writing it keeps those rules visible instead of hoping a converter
 * respects them.
 *
 * Because the schema is enforced server-side, the model physically cannot
 * return a malformed recipe — no retry loop, no JSON repair, no "please respond
 * with valid JSON" in the prompt.
 */

const stringField = (description: string) => ({ type: "string", description });

const ingredientSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "quantity", "amount", "unit", "note"],
  properties: {
    name: stringField(
      "Canonical ingredient name only, lowercase, no quantity or preparation. E.g. 'tomato', 'olive oil', 'chicken thigh'.",
    ),
    quantity: stringField(
      "Human-readable amount as it would appear in a recipe, e.g. '2 medium' or '1 tbsp'. Use 'to taste' where appropriate.",
    ),
    amount: {
      type: ["number", "null"],
      description:
        "Numeric magnitude of the quantity so servings can be scaled. Null for 'to taste' or 'to serve'.",
    },
    unit: stringField(
      "Unit for the amount, e.g. 'g', 'tbsp', 'cup', 'clove'. Empty string for countable items like eggs.",
    ),
    note: stringField(
      "Preparation note, e.g. 'finely chopped'. Empty string if none.",
    ),
  },
} as const;

const recipeProperties = {
  title: stringField("Short, appetising recipe name. No more than 8 words."),
  description: stringField(
    "Two or three sentences describing what the dish is and why it is worth cooking. Concrete and sensory, not marketing copy.",
  ),
  cuisine: { type: "string", enum: [...CUISINES] },
  mealType: { type: "string", enum: [...MEAL_TYPES] },
  difficulty: { type: "string", enum: [...DIFFICULTIES] },
  dietTags: {
    type: "array",
    description:
      "Every tag that genuinely applies. Be accurate: do not tag a dish Vegan if it contains dairy or eggs.",
    items: { type: "string", enum: [...DIET_TAGS] },
  },
  prepMinutes: { type: "integer", description: "Hands-on preparation time." },
  cookMinutes: { type: "integer", description: "Active and passive cooking time." },
  servings: { type: "integer", description: "Number of servings this yields." },
  heroHue: {
    type: "integer",
    description:
      "A hue from 0-360 that evokes the finished dish, used to generate its card art. Warm reds/oranges for tomato and spice, greens for herbs and vegetables, golds for baked and fried dishes.",
  },
  ingredients: {
    type: "array",
    description:
      "Everything genuinely required. Prefer ingredients from the user's list; pantry staples such as salt, pepper, oil and water may be assumed.",
    items: ingredientSchema,
  },
  optionalIngredients: {
    type: "array",
    description:
      "Ingredients that improve the dish but are not required. The recipe must work completely without every item in this list.",
    items: ingredientSchema,
  },
  steps: {
    type: "array",
    description:
      "Between 8 and 15 steps. Each one is a single discrete action with enough detail that a nervous beginner would not have to guess.",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["number", "title", "description", "durationMinutes"],
      properties: {
        number: { type: "integer", description: "1-based step number." },
        title: stringField("A short imperative label, e.g. 'Bloom the garlic'."),
        description: stringField(
          "Two to four sentences. Say what to do, what to look for, and why it matters. Include visual and sensory doneness cues rather than only timings.",
        ),
        durationMinutes: {
          type: ["integer", "null"],
          description:
            "Roughly how long this step takes, so the UI can offer a timer. Null if it is instantaneous.",
        },
      },
    },
  },
  tips: {
    type: "array",
    description:
      "Three to five tips that would change the outcome. Techniques and failure modes, not restatements of the steps.",
    items: { type: "string" },
  },
  substitutions: {
    type: "array",
    description:
      "Swaps for the ingredients most likely to be missing, especially anything the user did not list.",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["ingredient", "substitute"],
      properties: {
        ingredient: stringField("The ingredient being replaced."),
        substitute: stringField(
          "What to use instead, with quantity guidance and any technique change.",
        ),
      },
    },
  },
  nutrition: {
    type: "object",
    additionalProperties: false,
    required: ["calories", "proteinG", "carbsG", "fatG", "fiberG", "sugarG"],
    description: "Best-effort estimates, per serving.",
    properties: {
      calories: { type: "number" },
      proteinG: { type: "number" },
      carbsG: { type: "number" },
      fatG: { type: "number" },
      fiberG: { type: "number" },
      sugarG: { type: "number" },
    },
  },
} as const;

/** The complete `output_config.format.schema` payload. */
export const RECIPE_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["recipes"],
  properties: {
    recipes: {
      type: "array",
      description: "The generated recipes, best match first.",
      items: {
        type: "object",
        additionalProperties: false,
        required: Object.keys(recipeProperties),
        properties: recipeProperties,
      },
    },
  },
} as const satisfies Record<string, unknown>;

/**
 * Validates what actually came back. Structured outputs guarantee the *shape*,
 * but not that the values are sane — a model can still return 400 servings or
 * an empty steps array, and this is where that gets caught.
 */
export const aiRecipeSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(600),
  cuisine: z.enum(CUISINES),
  mealType: z.enum(MEAL_TYPES),
  difficulty: z.enum(DIFFICULTIES),
  dietTags: z.array(z.enum(DIET_TAGS)),
  prepMinutes: z.number().int().min(0).max(600),
  cookMinutes: z.number().int().min(0).max(600),
  servings: z.number().int().min(1).max(24),
  heroHue: z.number().int().min(0).max(360),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        quantity: z.string().max(60),
        amount: z.number().nonnegative().nullable(),
        unit: z.string().max(24),
        note: z.string().max(160),
      }),
    )
    .min(1),
  optionalIngredients: z.array(
    z.object({
      name: z.string().min(1).max(80),
      quantity: z.string().max(60),
      amount: z.number().nonnegative().nullable(),
      unit: z.string().max(24),
      note: z.string().max(160),
    }),
  ),
  steps: z
    .array(
      z.object({
        number: z.number().int().positive(),
        title: z.string().min(1).max(100),
        description: z.string().min(1).max(800),
        durationMinutes: z.number().int().nonnegative().nullable(),
      }),
    )
    .min(1),
  tips: z.array(z.string().min(1).max(400)),
  substitutions: z.array(
    z.object({
      ingredient: z.string().min(1).max(80),
      substitute: z.string().min(1).max(240),
    }),
  ),
  nutrition: z.object({
    calories: z.number().nonnegative(),
    proteinG: z.number().nonnegative(),
    carbsG: z.number().nonnegative(),
    fatG: z.number().nonnegative(),
    fiberG: z.number().nonnegative(),
    sugarG: z.number().nonnegative(),
  }),
});

export const aiResponseSchema = z.object({
  recipes: z.array(aiRecipeSchema).min(1),
});

export type AiRecipe = z.infer<typeof aiRecipeSchema>;
