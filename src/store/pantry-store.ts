"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * The user's ingredient list.
 *
 * Persisted to local storage so a refresh — or a return visit tomorrow — does
 * not mean re-typing everything in the fridge. Kept separate from the recipe
 * store because it has a very different lifetime: the pantry is long-lived,
 * generated results are disposable.
 */

export interface PantryState {
  ingredients: string[];
  /** False until local storage has been read, so SSR and first paint agree. */
  hydrated: boolean;

  add: (ingredient: string) => boolean;
  addMany: (ingredients: string[]) => void;
  remove: (ingredient: string) => void;
  update: (previous: string, next: string) => boolean;
  clear: () => void;
  setHydrated: () => void;
}

const MAX_INGREDIENTS = 40;

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

/** Case-insensitive duplicate check — "Tomato" and "tomato" are one ingredient. */
const containsIngredient = (list: string[], value: string) =>
  list.some((item) => item.toLowerCase() === value.toLowerCase());

export const usePantryStore = create<PantryState>()(
  persist(
    (set, get) => ({
      ingredients: [],
      hydrated: false,

      /** Returns false when the ingredient was rejected (empty, dupe, or full). */
      add: (raw) => {
        const ingredient = normalize(raw);
        if (!ingredient) return false;

        const { ingredients } = get();
        if (ingredients.length >= MAX_INGREDIENTS) return false;
        if (containsIngredient(ingredients, ingredient)) return false;

        set({ ingredients: [...ingredients, ingredient] });
        return true;
      },

      addMany: (raw) => {
        const existing = [...get().ingredients];
        for (const item of raw) {
          const ingredient = normalize(item);
          if (!ingredient || containsIngredient(existing, ingredient)) continue;
          if (existing.length >= MAX_INGREDIENTS) break;
          existing.push(ingredient);
        }
        set({ ingredients: existing });
      },

      remove: (ingredient) =>
        set((state) => ({
          ingredients: state.ingredients.filter((item) => item !== ingredient),
        })),

      /** Edit in place, preserving list order so the chip does not jump. */
      update: (previous, nextRaw) => {
        const next = normalize(nextRaw);
        if (!next) return false;

        const { ingredients } = get();
        const index = ingredients.indexOf(previous);
        if (index === -1) return false;

        const collides = ingredients.some(
          (item, i) => i !== index && item.toLowerCase() === next.toLowerCase(),
        );
        if (collides) return false;

        const updated = [...ingredients];
        updated[index] = next;
        set({ ingredients: updated });
        return true;
      },

      clear: () => set({ ingredients: [] }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "recipe-maker:pantry",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ingredients: state.ingredients }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
