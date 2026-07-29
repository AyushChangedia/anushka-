"use client";

import { Sparkles } from "lucide-react";
import { IngredientInput } from "@/components/ingredient-input";
import { FiltersBar } from "@/components/filters-bar";
import { SearchBar } from "@/components/search-bar";
import { RecipeResults } from "@/components/recipe-results";
import { RecentlyViewed } from "@/components/recently-viewed";
import { Button } from "@/components/ui/button";
import { usePantryStore } from "@/store/pantry-store";
import { useRecipeStore } from "@/store/recipe-store";
import { useGenerateRecipes } from "@/hooks/use-generate-recipes";

/**
 * The whole discovery flow: enter ingredients, generate, filter, search.
 *
 * Kept as one client component so the ingredient list, filters and results
 * share state without prop-drilling or a context provider.
 */
export function DiscoverPanel() {
  const ingredientCount = usePantryStore((s) => s.ingredients.length);
  const hydrated = usePantryStore((s) => s.hydrated);
  const status = useRecipeStore((s) => s.status);
  const hasResults = useRecipeStore((s) => s.results.length > 0);
  const { generate } = useGenerateRecipes();

  const loading = status === "loading";

  return (
    <div className="space-y-10">
      <section
        aria-labelledby="pantry-heading"
        className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-card sm:p-6"
      >
        <h2 id="pantry-heading" className="mb-4 text-lg font-semibold tracking-tight">
          What is in your kitchen?
        </h2>

        <IngredientInput />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            size="lg"
            onClick={generate}
            loading={loading}
            // Disabled until hydration so the button never renders enabled on
            // the server and then disabled on the client.
            disabled={!hydrated || ingredientCount === 0}
            className="w-full sm:w-auto"
          >
            {!loading && <Sparkles aria-hidden />}
            {loading ? "Generating…" : hasResults ? "Generate again" : "Generate recipes"}
          </Button>

          <p className="text-sm text-foreground-muted">
            {ingredientCount === 0
              ? "Add at least one ingredient to get started."
              : `Searching with ${ingredientCount} ingredient${ingredientCount === 1 ? "" : "s"}.`}
          </p>
        </div>
      </section>

      {hasResults && (
        <div className="space-y-4">
          <SearchBar />
          <FiltersBar />
        </div>
      )}

      <RecipeResults />

      <RecentlyViewed />
    </div>
  );
}
