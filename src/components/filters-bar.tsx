"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { ToggleChip } from "@/components/ui/toggle-chip";
import { Button } from "@/components/ui/button";
import { useRecipeStore } from "@/store/recipe-store";
import {
  CUISINES,
  DIET_TAGS,
  MEAL_TYPES,
  type Cuisine,
  type DietTag,
  type MealType,
} from "@/lib/schemas/recipe";

/**
 * Filter controls.
 *
 * The handful of filters people actually reach for are always visible; the full
 * set is behind a disclosure. Filtering is applied client-side against results
 * already in the store, so toggling is instant and costs nothing — no
 * regeneration, no spinner.
 */

const QUICK_DIETS: DietTag[] = ["Vegetarian", "Vegan", "High Protein", "Healthy"];
const QUICK_CUISINES: Cuisine[] = ["Indian", "Italian", "Chinese", "Mexican"];

export function FiltersBar() {
  const [expanded, setExpanded] = useState(false);
  const filters = useRecipeStore((s) => s.filters);
  const toggleFilter = useRecipeStore((s) => s.toggleFilter);
  const setFilters = useRecipeStore((s) => s.setFilters);
  const resetFilters = useRecipeStore((s) => s.resetFilters);

  const activeCount =
    filters.dietTags.length +
    filters.cuisines.length +
    filters.mealTypes.length +
    (filters.maxMinutes !== null ? 1 : 0);

  const isQuick = filters.maxMinutes === 30;

  return (
    <section aria-label="Filters" className="space-y-3" data-print="hide">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleChip
          label="Quick (under 30 min)"
          active={isQuick}
          onToggle={() => setFilters({ maxMinutes: isQuick ? null : 30 })}
        />

        {QUICK_DIETS.map((tag) => (
          <ToggleChip
            key={tag}
            label={tag}
            active={filters.dietTags.includes(tag)}
            onToggle={() => toggleFilter("dietTags", tag)}
          />
        ))}

        {QUICK_CUISINES.map((cuisine) => (
          <ToggleChip
            key={cuisine}
            label={cuisine}
            active={filters.cuisines.includes(cuisine)}
            onToggle={() => toggleFilter("cuisines", cuisine)}
          />
        ))}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="all-filters"
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-strong px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
        >
          <SlidersHorizontal className="size-3.5" aria-hidden />
          {expanded ? "Fewer filters" : "All filters"}
        </button>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X aria-hidden />
            Clear {activeCount}
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="all-filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-card">
              <FilterGroup label="Diet">
                {DIET_TAGS.map((tag) => (
                  <ToggleChip
                    key={tag}
                    label={tag}
                    active={filters.dietTags.includes(tag)}
                    onToggle={() => toggleFilter("dietTags", tag)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup label="Cuisine">
                {CUISINES.map((cuisine) => (
                  <ToggleChip
                    key={cuisine}
                    label={cuisine}
                    active={filters.cuisines.includes(cuisine)}
                    onToggle={() => toggleFilter("cuisines", cuisine)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup label="Meal">
                {MEAL_TYPES.map((meal) => (
                  <ToggleChip
                    key={meal}
                    label={meal}
                    active={filters.mealTypes.includes(meal)}
                    onToggle={() => toggleFilter("mealTypes", meal as MealType)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup label="Maximum total time">
                {[15, 30, 45, 60].map((minutes) => (
                  <ToggleChip
                    key={minutes}
                    label={`${minutes} min`}
                    active={filters.maxMinutes === minutes}
                    onToggle={() =>
                      setFilters({
                        maxMinutes: filters.maxMinutes === minutes ? null : minutes,
                      })
                    }
                  />
                ))}
              </FilterGroup>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
