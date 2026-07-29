"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useRecipeStore } from "@/store/recipe-store";

export function SavedRecipes() {
  const saved = useRecipeStore((s) => s.saved);
  const hydrated = useRecipeStore((s) => s.hydrated);

  // Saved recipes come from local storage, so there is genuinely nothing to
  // render until it has been read. Skeletons here are truthful, not decorative.
  if (!hydrated) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No saved recipes yet"
        description="Tap the heart on any recipe to keep it here. Saved recipes stay on this device, and sync across devices once you sign in."
        action={
          <Button asChild>
            <Link href="/">Find recipes</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {saved.map((recipe, index) => (
        <RecipeCard key={recipe.id} recipe={recipe} index={index} />
      ))}
    </div>
  );
}
