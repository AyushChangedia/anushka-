import { NextResponse } from "next/server";
import { generateRecipes, hasApiKey, RecipeGenerationError } from "@/lib/ai/generate";
import { generateFallbackRecipes } from "@/lib/ai/fallback";
import { rankRecipes } from "@/lib/recipes/matching";
import { persistRecipes } from "@/lib/recipes/repository";
import {
  generateRequestSchema,
  type GenerateResponse,
  type Recipe,
} from "@/lib/schemas/recipe";

/**
 * POST /api/recipes/generate
 *
 * Turns a pantry into a ranked list of cookable recipes.
 *
 * Generation and ranking are deliberately separate: Claude proposes recipes,
 * then `rankRecipes` decides — deterministically, server-side — what the user
 * has, what they are missing, and in what order results appear.
 */

// Generation streams from the model and can take a while on a full batch.
export const maxDuration = 120;
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  let recipes: Recipe[];
  let usedFallback = false;
  let notice: string | null = null;

  if (!hasApiKey()) {
    recipes = generateFallbackRecipes(input);
    usedFallback = true;
    notice =
      "Showing sample recipes. Add an ANTHROPIC_API_KEY to generate recipes tailored to your exact ingredients.";
  } else {
    try {
      recipes = await generateRecipes(input);
    } catch (error) {
      const kind = error instanceof RecipeGenerationError ? error.kind : "upstream";
      console.error(`[generate] ${kind}:`, error);

      // A failed generation degrades to the sample corpus rather than an error
      // screen — the user still gets something cookable, clearly labelled.
      recipes = generateFallbackRecipes(input);
      usedFallback = true;
      notice =
        kind === "refusal"
          ? "That request could not be processed. Showing sample recipes instead."
          : "Recipe generation is temporarily unavailable. Showing sample recipes instead.";
    }
  }

  const ranked = rankRecipes(recipes, input.ingredients);

  // Fire-and-forget: durable recipe URLs are a nice-to-have, and waiting on the
  // write would add latency to the response the user is actually waiting for.
  void persistRecipes(recipes);

  const response: GenerateResponse = { recipes: ranked, usedFallback, notice };
  return NextResponse.json(response);
}
