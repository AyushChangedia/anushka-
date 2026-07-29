"use client";

import { Search, X } from "lucide-react";
import { useRecipeStore } from "@/store/recipe-store";

/** Free-text search across the current result set. */
export function SearchBar() {
  const query = useRecipeStore((s) => s.query);
  const setQuery = useRecipeStore((s) => s.setQuery);

  return (
    <div className="relative" data-print="hide">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
        aria-hidden
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search these recipes by name or ingredient"
        aria-label="Search recipes"
        className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-10 text-base outline-none transition-colors placeholder:text-foreground-subtle hover:border-border-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 md:text-sm"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
