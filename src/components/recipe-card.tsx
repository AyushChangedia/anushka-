"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Flame, Heart, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecipeHeroArt } from "@/components/recipe-hero-art";
import { useRecipeStore } from "@/store/recipe-store";
import { formatMinutes, cn } from "@/lib/utils";
import { totalMinutes, type RankedRecipe } from "@/lib/schemas/recipe";

/**
 * A recipe result card.
 *
 * The single most useful thing on the card is the pantry match, so it gets the
 * most prominent position — a badge over the artwork — rather than being buried
 * in the metadata row.
 */
export function RecipeCard({
  recipe,
  index = 0,
  priority = false,
}: {
  recipe: RankedRecipe;
  index?: number;
  priority?: boolean;
}) {
  const isSaved = useRecipeStore((s) => s.saved.some((r) => r.id === recipe.id));
  const toggleSaved = useRecipeStore((s) => s.toggleSaved);
  const hydrated = useRecipeStore((s) => s.hydrated);

  const missing = recipe.missingRequired.length;
  const matchPercent = Math.round(recipe.matchScore * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      // Stagger, but cap it — with ten cards an uncapped delay makes the last
      // one feel broken rather than choreographed.
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card transition-shadow duration-300 hover:shadow-raised"
    >
      <Link
        href={`/recipe/${recipe.id}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <RecipeHeroArt
          hue={recipe.heroHue}
          title={recipe.title}
          priority={priority}
          className="size-full transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3">
          {missing === 0 ? (
            <Badge className="bg-brand-500 text-white shadow-sm">
              You have everything
            </Badge>
          ) : (
            <Badge className="bg-black/55 text-white shadow-sm backdrop-blur-sm">
              {matchPercent}% match · {missing} to buy
            </Badge>
          )}
        </div>

        <h3 className="absolute inset-x-3 bottom-3 text-balance text-lg font-semibold leading-snug text-white drop-shadow-sm">
          {recipe.title}
        </h3>
      </Link>

      {/* Rendered only after hydration: the saved state lives in local storage,
          so rendering it during SSR would produce a markup mismatch. */}
      {hydrated && (
        <button
          type="button"
          onClick={() => toggleSaved(recipe)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${recipe.title} from saved` : `Save ${recipe.title}`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-black/65 active:scale-90"
        >
          <Heart
            className={cn("size-4 transition-colors", isSaved && "fill-red-500 text-red-500")}
          />
        </button>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-pretty text-sm leading-relaxed text-foreground-muted">
          {recipe.description}
        </p>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-foreground-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            <dt className="sr-only">Total time</dt>
            <dd>{formatMinutes(totalMinutes(recipe))}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden />
            <dt className="sr-only">Servings</dt>
            <dd>Serves {recipe.servings}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="size-3.5" aria-hidden />
            <dt className="sr-only">Difficulty</dt>
            <dd>{recipe.difficulty}</dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap gap-1.5">
          <Badge variant="brand" size="sm">
            {recipe.cuisine}
          </Badge>
          {recipe.dietTags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="neutral" size="sm">
              {tag}
            </Badge>
          ))}
          {missing > 0 && (
            <Badge variant="warning" size="sm">
              Missing {recipe.missingRequired.slice(0, 2).join(", ")}
              {missing > 2 && ` +${missing - 2}`}
            </Badge>
          )}
        </div>
      </div>
    </motion.article>
  );
}
