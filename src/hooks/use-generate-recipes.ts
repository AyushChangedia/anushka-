"use client";

import { useCallback, useRef } from "react";
import { usePantryStore } from "@/store/pantry-store";
import { useRecipeStore } from "@/store/recipe-store";
import { generateResponseSchema } from "@/lib/schemas/recipe";

/**
 * Drives recipe generation.
 *
 * Filters are sent to the server so the model can honour them while generating,
 * *and* applied client-side afterwards so toggling one re-filters instantly
 * without another request. The server-side pass is what makes filtered results
 * good; the client-side pass is what makes them fast.
 */
export function useGenerateRecipes() {
  const ingredients = usePantryStore((s) => s.ingredients);
  const filters = useRecipeStore((s) => s.filters);
  const setResults = useRecipeStore((s) => s.setResults);
  const setStatus = useRecipeStore((s) => s.setStatus);
  const setError = useRecipeStore((s) => s.setError);

  // Lets a second click supersede an in-flight request instead of racing it.
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (ingredients.length === 0) {
      setError("Add at least one ingredient first.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, filters, count: 8 }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Recipe generation failed.");
      }

      const parsed = generateResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        throw new Error("The server returned an unexpected response.");
      }

      setResults({
        recipes: parsed.data.recipes,
        usedFallback: parsed.data.usedFallback,
        notice: parsed.data.notice,
      });
    } catch (error) {
      // An abort is a newer request taking over, not a failure to report.
      if (error instanceof DOMException && error.name === "AbortError") return;

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong generating recipes.",
      );
    }
  }, [ingredients, filters, setResults, setStatus, setError]);

  return { generate };
}
