import Anthropic from "@anthropic-ai/sdk";
import { RECIPE_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompts";
import { RECIPE_OUTPUT_SCHEMA, aiResponseSchema, type AiRecipe } from "@/lib/ai/schema";
import {
  recipeSchema,
  type GenerateRequest,
  type Recipe,
} from "@/lib/schemas/recipe";

/** Claude Opus 5 — the app's reasoning model for recipe generation. */
const MODEL = "claude-opus-5";

/**
 * Generous ceiling. Eight fully-detailed recipes with 8-15 steps each is a lot
 * of output, and truncation mid-recipe is far more expensive to recover from
 * than the unused headroom costs. Requests are streamed, so a high ceiling
 * carries no timeout risk.
 */
const MAX_TOKENS = 32_000;

export class RecipeGenerationError extends Error {
  constructor(
    message: string,
    readonly kind: "no-api-key" | "refusal" | "invalid-output" | "upstream",
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RecipeGenerationError";
  }
}

let client: Anthropic | null = null;

/** Lazily constructed so importing this module never throws at build time. */
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new RecipeGenerationError(
      "ANTHROPIC_API_KEY is not configured.",
      "no-api-key",
    );
  }
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const hasApiKey = () => Boolean(process.env.ANTHROPIC_API_KEY);

/** URL-safe id derived from the title, de-duplicated within a batch. */
function slugify(title: string, taken: Set<string>): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "recipe";

  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  taken.add(id);
  return id;
}

/**
 * Map validated model output onto the app's `Recipe` type.
 *
 * Step numbers are re-derived from array position rather than trusted, since a
 * duplicated or skipped number would break the step navigation UI.
 */
function toRecipe(ai: AiRecipe, taken: Set<string>): Recipe {
  return recipeSchema.parse({
    ...ai,
    id: slugify(ai.title, taken),
    steps: ai.steps.map((step, index) => ({ ...step, number: index + 1 })),
  });
}

/**
 * Generate recipes with Claude.
 *
 * Structured outputs constrain the response to `RECIPE_OUTPUT_SCHEMA`
 * server-side, so there is no JSON repair or retry loop here — if the request
 * succeeds, the payload parses.
 */
export async function generateRecipes(request: GenerateRequest): Promise<Recipe[]> {
  const anthropic = getClient();

  let message;
  try {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Adaptive thinking lets the model reason about ingredient coverage and
      // recipe variety before committing to a batch.
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: RECIPE_OUTPUT_SCHEMA },
      },
      system: [
        {
          type: "text",
          text: RECIPE_SYSTEM_PROMPT,
          // Stable across every request, so it is served from cache after the
          // first generation instead of being re-billed each time.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildUserPrompt(request) }],
    });

    message = await stream.finalMessage();
  } catch (error) {
    throw new RecipeGenerationError(
      "The recipe service could not be reached.",
      "upstream",
      error,
    );
  }

  // Safety classifiers can decline a request; content is empty or partial when
  // that happens, so this has to be checked before reading any content block.
  if (message.stop_reason === "refusal") {
    throw new RecipeGenerationError(
      "That request was declined. Try rephrasing your ingredients.",
      "refusal",
    );
  }

  const text = message.content.find((block) => block.type === "text")?.text;
  if (!text) {
    throw new RecipeGenerationError(
      "The recipe service returned an empty response.",
      "invalid-output",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new RecipeGenerationError(
      "The recipe service returned malformed output.",
      "invalid-output",
      error,
    );
  }

  const result = aiResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new RecipeGenerationError(
      "The recipe service returned recipes that failed validation.",
      "invalid-output",
      result.error,
    );
  }

  const taken = new Set<string>();
  return result.data.recipes.map((recipe) => toRecipe(recipe, taken));
}
