"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { RecipeHeroArt } from "@/components/recipe-hero-art";
import { useRecipeStore } from "@/store/recipe-store";
import { formatMinutes } from "@/lib/utils";
import { totalMinutes } from "@/lib/schemas/recipe";

/**
 * A horizontal rail of recently opened recipes.
 *
 * Renders nothing until there is history worth showing — an empty rail with a
 * heading is noise on a first visit.
 */
export function RecentlyViewed() {
  const recentlyViewed = useRecipeStore((s) => s.recentlyViewed);
  const hydrated = useRecipeStore((s) => s.hydrated);

  if (!hydrated || recentlyViewed.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="space-y-3" data-print="hide">
      <h2
        id="recent-heading"
        className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground-subtle"
      >
        <History className="size-4" aria-hidden />
        Recently viewed
      </h2>

      {/* Horizontal scroll on small screens rather than wrapping — keeps the
          rail visually distinct from the main results grid. */}
      <ul className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {recentlyViewed.map((recipe) => (
          <li key={recipe.id} className="w-44 shrink-0">
            <Link
              href={`/recipe/${recipe.id}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-shadow hover:shadow-raised"
            >
              <RecipeHeroArt
                hue={recipe.heroHue}
                title={recipe.title}
                className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium leading-snug">
                  {recipe.title}
                </p>
                <p className="mt-1 text-xs text-foreground-subtle">
                  {formatMinutes(totalMinutes(recipe))}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
