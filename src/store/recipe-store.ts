"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Cuisine,
  DietTag,
  MealType,
  RankedRecipe,
} from "@/lib/schemas/recipe";

/**
 * Generated results, filters, and everything the user has collected.
 *
 * Saves, recently-viewed and the shopping list persist; the current result set
 * and filter selections do not — they belong to one session's search, and
 * restoring stale results on a return visit would be confusing.
 *
 * For signed-in users, `syncSavedToServer` mirrors saves to the API. Local
 * storage stays the write path either way so the UI never waits on a network
 * round trip to toggle a heart.
 */

export interface Filters {
  dietTags: DietTag[];
  cuisines: Cuisine[];
  mealTypes: MealType[];
  maxMinutes: number | null;
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  sourceRecipeTitle: string | null;
}

export type GenerationStatus = "idle" | "loading" | "success" | "error";

export interface RecipeState {
  results: RankedRecipe[];
  status: GenerationStatus;
  error: string | null;
  notice: string | null;
  usedFallback: boolean;

  query: string;
  filters: Filters;

  saved: RankedRecipe[];
  recentlyViewed: RankedRecipe[];
  shoppingList: ShoppingItem[];

  hydrated: boolean;

  setResults: (payload: {
    recipes: RankedRecipe[];
    usedFallback: boolean;
    notice: string | null;
  }) => void;
  setStatus: (status: GenerationStatus) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;

  setQuery: (query: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  toggleFilter: <K extends "dietTags" | "cuisines" | "mealTypes">(
    key: K,
    value: Filters[K][number],
  ) => void;
  resetFilters: () => void;

  toggleSaved: (recipe: RankedRecipe) => void;
  isSaved: (id: string) => boolean;
  mergeServerSaved: (recipes: RankedRecipe[]) => void;

  recordView: (recipe: RankedRecipe) => void;

  addToShoppingList: (names: string[], sourceRecipeTitle?: string) => number;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCheckedShoppingItems: () => void;
  clearShoppingList: () => void;

  setHydrated: () => void;
}

export const EMPTY_FILTERS: Filters = {
  dietTags: [],
  cuisines: [],
  mealTypes: [],
  maxMinutes: null,
};

const MAX_RECENTLY_VIEWED = 12;

/** Toggle a value in or out of an array without mutating it. */
function toggleInArray<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      results: [],
      status: "idle",
      error: null,
      notice: null,
      usedFallback: false,

      query: "",
      filters: EMPTY_FILTERS,

      saved: [],
      recentlyViewed: [],
      shoppingList: [],

      hydrated: false,

      setResults: ({ recipes, usedFallback, notice }) =>
        set({
          results: recipes,
          usedFallback,
          notice,
          status: "success",
          error: null,
        }),

      setStatus: (status) => set({ status }),
      setError: (error) => set({ error, status: error ? "error" : "idle" }),
      clearResults: () =>
        set({ results: [], status: "idle", error: null, notice: null }),

      setQuery: (query) => set({ query }),
      setFilters: (partial) =>
        set((state) => ({ filters: { ...state.filters, ...partial } })),

      toggleFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: toggleInArray(state.filters[key] as unknown[], value),
          } as Filters,
        })),

      resetFilters: () => set({ filters: EMPTY_FILTERS, query: "" }),

      toggleSaved: (recipe) => {
        const { saved } = get();
        const already = saved.some((item) => item.id === recipe.id);

        set({
          saved: already
            ? saved.filter((item) => item.id !== recipe.id)
            : [recipe, ...saved],
        });

        // Mirror to the server for signed-in users. Deliberately not awaited:
        // the local state is already correct, and a failed sync should not
        // block or revert the interaction.
        void syncSavedToServer(recipe, !already);
      },

      isSaved: (id) => get().saved.some((item) => item.id === id),

      /**
       * Reconcile server saves with local ones after sign-in. Union rather than
       * replace, so favourites collected as a guest survive the transition.
       */
      mergeServerSaved: (recipes) => {
        const local = get().saved;
        const byId = new Map(local.map((r) => [r.id, r]));
        for (const recipe of recipes) {
          if (!byId.has(recipe.id)) byId.set(recipe.id, recipe);
        }
        set({ saved: [...byId.values()] });
      },

      recordView: (recipe) =>
        set((state) => ({
          recentlyViewed: [
            recipe,
            ...state.recentlyViewed.filter((item) => item.id !== recipe.id),
          ].slice(0, MAX_RECENTLY_VIEWED),
        })),

      /** Returns how many items were genuinely new, for the confirmation toast. */
      addToShoppingList: (names, sourceRecipeTitle) => {
        const existing = get().shoppingList;
        const seen = new Set(existing.map((item) => item.name.toLowerCase()));
        const additions: ShoppingItem[] = [];

        for (const raw of names) {
          const name = raw.trim();
          if (!name || seen.has(name.toLowerCase())) continue;
          seen.add(name.toLowerCase());
          additions.push({
            id: `${Date.now()}-${name.toLowerCase().replace(/\s+/g, "-")}`,
            name,
            checked: false,
            sourceRecipeTitle: sourceRecipeTitle ?? null,
          });
        }

        if (additions.length > 0) {
          set({ shoppingList: [...existing, ...additions] });
        }
        return additions.length;
      },

      toggleShoppingItem: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item,
          ),
        })),

      removeShoppingItem: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((item) => item.id !== id),
        })),

      clearCheckedShoppingItems: () =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((item) => !item.checked),
        })),

      clearShoppingList: () => set({ shoppingList: [] }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "recipe-maker:collection",
      storage: createJSONStorage(() => localStorage),
      // Results and filters are session-scoped on purpose — see the note above.
      partialize: (state) => ({
        saved: state.saved,
        recentlyViewed: state.recentlyViewed,
        shoppingList: state.shoppingList,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/**
 * Push a save/unsave to the API.
 *
 * Silently no-ops for guests: the endpoint returns 401, which is the expected
 * and correct outcome rather than an error worth surfacing.
 */
async function syncSavedToServer(recipe: RankedRecipe, saving: boolean) {
  try {
    if (saving) {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: stripRanking(recipe) }),
      });
    } else {
      await fetch(`/api/saved?id=${encodeURIComponent(recipe.id)}`, {
        method: "DELETE",
      });
    }
  } catch {
    // Offline or signed out. Local storage still holds the truth.
  }
}

/** The API stores plain recipes; ranking data is per-search and not persisted. */
function stripRanking(recipe: RankedRecipe) {
  const {
    usesFromPantry: _usesFromPantry,
    missingRequired: _missingRequired,
    missingOptional: _missingOptional,
    matchScore: _matchScore,
    rankScore: _rankScore,
    ...base
  } = recipe;
  return base;
}
