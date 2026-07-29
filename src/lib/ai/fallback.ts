import { SAMPLE_RECIPES } from "@/lib/data/sample-recipes";
import { matchesFilters, rankRecipes } from "@/lib/recipes/matching";
import type { GenerateRequest, Recipe } from "@/lib/schemas/recipe";

/**
 * Deterministic stand-in for the AI generator.
 *
 * Used when no `ANTHROPIC_API_KEY` is configured, and as a graceful degradation
 * path when a live generation fails. It ranks the hand-authored sample corpus
 * against the user's pantry using exactly the same matching code as the real
 * path, so the app is completely explorable — filters, detail pages, shopping
 * list and all — without any credentials.
 *
 * Results are always returned, even when nothing matches well. An empty result
 * would be indistinguishable from a broken app.
 */
export function generateFallbackRecipes(request: GenerateRequest): Recipe[] {
  const ranked = rankRecipes(SAMPLE_RECIPES, request.ingredients);

  const withinFilters = ranked.filter((recipe) =>
    matchesFilters(recipe, request.filters),
  );

  // If the filters exclude everything in the small sample set, ignore them
  // rather than showing an empty state that implies the pantry was the problem.
  const pool = withinFilters.length > 0 ? withinFilters : ranked;

  return pool.slice(0, request.count).map((recipe) => {
    // Strip the ranking annotations — the caller re-ranks, so returning them
    // here would mean two sources of truth for the same numbers.
    const {
      usesFromPantry: _usesFromPantry,
      missingRequired: _missingRequired,
      missingOptional: _missingOptional,
      matchScore: _matchScore,
      rankScore: _rankScore,
      ...base
    } = recipe;
    return base;
  });
}
