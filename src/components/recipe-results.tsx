"use client";

import { useMemo } from "react";
import { AlertCircle, ChefHat, Info, SearchX, Sparkles } from "lucide-react";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useRecipeStore } from "@/store/recipe-store";
import { usePantryStore } from "@/store/pantry-store";
import { useGenerateRecipes } from "@/hooks/use-generate-recipes";
import { matchesFilters, matchesQuery } from "@/lib/recipes/matching";

/**
 * The results region.
 *
 * Owns every state this area can be in — idle, loading, error, empty,
 * over-filtered, and populated — so none of them can be forgotten at the page
 * level.
 */
export function RecipeResults() {
  const { results, status, error, notice, usedFallback, filters, query } =
    useRecipeStore();
  const resetFilters = useRecipeStore((s) => s.resetFilters);
  const ingredientCount = usePantryStore((s) => s.ingredients.length);
  const { generate } = useGenerateRecipes();

  // Filtering and search run over results already in memory, so this is
  // recomputed on every keystroke without a network round trip.
  const visible = useMemo(
    () =>
      results.filter(
        (recipe) => matchesFilters(recipe, filters) && matchesQuery(recipe, query),
      ),
    [results, filters, query],
  );

  if (status === "loading") {
    return (
      <section aria-busy="true" aria-live="polite" className="space-y-4">
        <p className="flex items-center gap-2 text-sm text-foreground-muted">
          <Sparkles className="size-4 animate-pulse text-brand-500" aria-hidden />
          Reading your ingredients and building recipes…
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={AlertCircle}
        title="That did not work"
        description={error ?? "Something went wrong generating recipes."}
        action={<Button onClick={generate}>Try again</Button>}
      />
    );
  }

  if (status === "idle" && results.length === 0) {
    return (
      <EmptyState
        icon={ChefHat}
        title="Tell us what is in your kitchen"
        description="Add the ingredients you already have and we will find recipes you can cook right now — no shopping trip required."
        action={
          ingredientCount > 0 ? (
            <Button onClick={generate}>Generate recipes</Button>
          ) : undefined
        }
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="Nothing matches those filters"
        description={
          query
            ? `No recipes in this batch match "${query}". Try a broader search or clear your filters.`
            : "Your filters are narrower than this batch of recipes. Loosen them, or generate a fresh set."
        }
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={resetFilters}>
              Clear filters
            </Button>
            <Button onClick={generate}>Generate more</Button>
          </div>
        }
      />
    );
  }

  return (
    <section className="space-y-4">
      {notice && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-2xl border border-accent-500/30 bg-accent-500/10 px-4 py-3 text-sm text-accent-800 dark:text-accent-200"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p className="text-pretty">{notice}</p>
        </div>
      )}

      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {visible.length} recipe{visible.length === 1 ? "" : "s"} you can make
        </h2>
        {!usedFallback && (
          <p className="hidden text-xs text-foreground-subtle sm:block">
            Sorted by best ingredient match
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            index={index}
            priority={index < 3}
          />
        ))}
      </div>
    </section>
  );
}
