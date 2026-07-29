"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Printer, ShoppingBasket, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePantryStore } from "@/store/pantry-store";
import { useRecipeStore } from "@/store/recipe-store";
import { cn } from "@/lib/utils";

/**
 * The shopping list.
 *
 * Items arrive from recipe pages ("add missing ingredients") or are typed
 * directly. Checking one off offers to move it into the pantry, which closes
 * the loop: shop, tick, and the next search knows you have it.
 */
export function ShoppingList() {
  const {
    shoppingList,
    hydrated,
    toggleShoppingItem,
    removeShoppingItem,
    addToShoppingList,
    clearCheckedShoppingItems,
    clearShoppingList,
  } = useRecipeStore();
  const addToPantry = usePantryStore((s) => s.addMany);

  const [draft, setDraft] = useState("");

  const { checked, unchecked } = useMemo(
    () => ({
      checked: shoppingList.filter((item) => item.checked),
      unchecked: shoppingList.filter((item) => !item.checked),
    }),
    [shoppingList],
  );

  if (!hydrated) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    addToShoppingList([draft]);
    setDraft("");
  };

  /** Move everything ticked into the pantry, then clear it from the list. */
  const moveCheckedToPantry = () => {
    addToPantry(checked.map((item) => item.name));
    clearCheckedShoppingItems();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2" data-print="hide">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add something to the list"
          aria-label="Add an item to your shopping list"
        />
        <Button type="submit" disabled={!draft.trim()}>
          <Plus aria-hidden />
          Add
        </Button>
      </form>

      {shoppingList.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="Your list is empty"
          description="Open any recipe and add its missing ingredients here, or type something in above."
          action={
            <Button asChild>
              <Link href="/">Find recipes</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2" data-print="hide">
            <p className="mr-auto text-sm text-foreground-muted">
              {unchecked.length} to buy
              {checked.length > 0 && ` · ${checked.length} in the basket`}
            </p>

            {checked.length > 0 && (
              <Button variant="secondary" size="sm" onClick={moveCheckedToPantry}>
                <Check aria-hidden />
                Move {checked.length} to my kitchen
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Printer aria-hidden />
              Print
            </Button>

            <Button variant="ghost" size="sm" onClick={clearShoppingList}>
              <Trash2 aria-hidden />
              Clear all
            </Button>
          </div>

          <ul className="space-y-2">
            <AnimatePresence mode="popLayout">
              {[...unchecked, ...checked].map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors",
                    item.checked && "opacity-60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleShoppingItem(item.id)}
                    role="checkbox"
                    aria-checked={item.checked}
                    aria-label={item.name}
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors",
                      item.checked
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-border-strong hover:border-brand-500",
                    )}
                  >
                    {item.checked && <Check className="size-3.5" aria-hidden />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        item.checked && "line-through",
                      )}
                    >
                      {item.name}
                    </p>
                    {item.sourceRecipeTitle && (
                      <p className="truncate text-xs text-foreground-subtle">
                        for {item.sourceRecipeTitle}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeShoppingItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="shrink-0 rounded-full p-1.5 text-foreground-subtle transition-colors hover:bg-red-500/12 hover:text-red-500"
                    data-print="hide"
                  >
                    <X className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </div>
  );
}
