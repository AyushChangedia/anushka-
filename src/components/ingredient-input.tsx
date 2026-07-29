"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/voice-input";
import { suggestIngredients } from "@/lib/data/ingredients";
import { usePantryStore } from "@/store/pantry-store";
import { cn } from "@/lib/utils";

const QUICK_ADD = [
  "Tomato", "Onion", "Garlic", "Egg", "Rice", "Chicken", "Butter", "Potato",
];

/**
 * The ingredient entry surface: type-ahead input, editable chips, and quick-add
 * shortcuts.
 *
 * Chips are buttons that flip into an inline text field on click, so editing a
 * typo does not mean deleting and retyping. The suggestion list is a proper
 * combobox — arrow keys and Enter work, and the active option is announced.
 */
export function IngredientInput() {
  const { ingredients, add, addMany, remove, update, clear, hydrated } =
    usePantryStore();

  const [value, setValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [rejected, setRejected] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(
    () => suggestIngredients(value, ingredients),
    [value, ingredients],
  );

  // Reset the highlighted suggestion whenever the list itself changes, so the
  // highlight never points at a stale index.
  useEffect(() => setActiveIndex(-1), [value]);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  // Briefly flag a rejected entry (duplicate or empty) then clear the message.
  useEffect(() => {
    if (!rejected) return;
    const timer = setTimeout(() => setRejected(null), 2400);
    return () => clearTimeout(timer);
  }, [rejected]);

  const commit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      if (!add(trimmed)) {
        setRejected(
          ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())
            ? `"${trimmed}" is already in your list`
            : "You have reached the ingredient limit",
        );
        return;
      }

      setValue("");
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [add, ingredients],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter": {
        event.preventDefault();
        const chosen = activeIndex >= 0 ? suggestions[activeIndex] : value;
        if (chosen) commit(chosen);
        break;
      }
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(suggestions.length, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) =>
          i <= 0 ? suggestions.length - 1 : i - 1,
        );
        break;
      case "Escape":
        setActiveIndex(-1);
        break;
      case "Backspace":
        // Deleting backwards past an empty field removes the last chip — the
        // behaviour people expect from every other tag input.
        if (value === "" && ingredients.length > 0) {
          event.preventDefault();
          remove(ingredients[ingredients.length - 1]!);
        }
        break;
      case ",":
        // Comma is a natural separator when pasting or typing a list.
        event.preventDefault();
        commit(value);
        break;
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    if (!/[,\n]/.test(text)) return;

    event.preventDefault();
    addMany(text.split(/[,\n]+/));
    setValue("");
  };

  const commitEdit = () => {
    if (!editing) return;
    // A failed edit (duplicate or empty) just closes without changing anything
    // rather than trapping the user in an invalid field.
    update(editing, editValue);
    setEditing(null);
    setEditValue("");
  };

  const quickAdds = QUICK_ADD.filter(
    (item) => !ingredients.some((i) => i.toLowerCase() === item.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* --- Entry field ------------------------------------------------- */}
      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border border-border bg-surface p-2 shadow-card transition-colors",
            "focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/25",
          )}
        >
          {/* Decorative, and the placeholder already says "Add an ingredient" —
              so it yields its ~28px to the input on narrow screens. */}
          <Plus
            className="ml-2 hidden size-5 shrink-0 text-foreground-subtle sm:block"
            aria-hidden
          />

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Add an ingredient…"
            className="h-10 w-full min-w-0 flex-1 bg-transparent pl-3 text-base outline-none placeholder:text-foreground-subtle sm:pl-0 md:text-sm"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls="ingredient-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `ingredient-option-${activeIndex}` : undefined
            }
            aria-label="Add an ingredient"
            autoComplete="off"
            enterKeyHint="done"
          />

          <VoiceInput onResult={(text) => addMany(text.split(/[,\n]|\band\b/i))} />

          <Button
            size="sm"
            onClick={() => commit(value)}
            disabled={!value.trim()}
            className="shrink-0"
          >
            Add
          </Button>
        </div>

        {/* --- Suggestions ------------------------------------------------ */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              id="ingredient-suggestions"
              role="listbox"
              aria-label="Ingredient suggestions"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-surface-raised p-1.5 shadow-raised"
            >
              {suggestions.map((suggestion, index) => (
                <li key={suggestion}>
                  <button
                    id={`ingredient-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    type="button"
                    // onMouseDown, not onClick: mousedown fires before the
                    // input's blur, so the field never loses focus mid-click.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commit(suggestion);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      index === activeIndex
                        ? "bg-brand-500/12 text-brand-700 dark:text-brand-300"
                        : "text-foreground hover:bg-surface-muted",
                    )}
                  >
                    <Sparkles className="size-3.5 text-foreground-subtle" aria-hidden />
                    {suggestion}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Rejection feedback, announced politely rather than as an alert. */}
      <div aria-live="polite" className="min-h-0">
        {rejected && (
          <p className="text-sm text-amber-600 dark:text-amber-400">{rejected}</p>
        )}
      </div>

      {/* --- Chips ------------------------------------------------------- */}
      {hydrated && ingredients.length > 0 && (
        <div className="space-y-3">
          <ul className="flex flex-wrap gap-2" aria-label="Your ingredients">
            <AnimatePresence mode="popLayout">
              {ingredients.map((ingredient) => (
                <motion.li
                  key={ingredient}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18 }}
                >
                  {editing === ingredient ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-brand-500 bg-surface py-1 pl-3 pr-1">
                      <input
                        ref={editRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit();
                          if (e.key === "Escape") setEditing(null);
                        }}
                        onBlur={commitEdit}
                        className="w-28 bg-transparent text-sm outline-none"
                        aria-label={`Edit ${ingredient}`}
                      />
                      <button
                        type="button"
                        onClick={commitEdit}
                        className="rounded-full p-1 text-brand-600 hover:bg-brand-500/12"
                        aria-label="Save"
                      >
                        <Check className="size-3.5" />
                      </button>
                    </span>
                  ) : (
                    <span className="group inline-flex items-center gap-1 rounded-full border border-border bg-surface py-1 pl-3 pr-1 shadow-sm transition-colors hover:border-border-strong">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(ingredient);
                          setEditValue(ingredient);
                        }}
                        className="text-sm font-medium"
                        aria-label={`Edit ${ingredient}`}
                      >
                        {ingredient}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(ingredient)}
                        className="rounded-full p-1 text-foreground-subtle transition-colors hover:bg-red-500/12 hover:text-red-500"
                        aria-label={`Remove ${ingredient}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="flex items-center gap-3 text-xs text-foreground-muted">
            <span>
              {ingredients.length} ingredient{ingredients.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 font-medium text-foreground-muted transition-colors hover:text-red-500"
            >
              <Trash2 className="size-3.5" aria-hidden />
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* --- Quick add --------------------------------------------------- */}
      {hydrated && quickAdds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-foreground-subtle">
            Quick add
          </span>
          {quickAdds.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => add(item)}
              className="rounded-full border border-dashed border-border-strong px-2.5 py-1 text-xs text-foreground-muted transition-colors hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
            >
              + {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
