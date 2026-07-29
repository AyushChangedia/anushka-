"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A pill that toggles a filter on or off.
 *
 * Rendered as a real `<button>` with `aria-pressed` rather than a styled
 * checkbox, so screen readers announce the current state and the whole pill is
 * a single tap target on mobile.
 */
export function ToggleChip({
  label,
  active,
  onToggle,
  className,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      // `switch` conveys on/off state via aria-checked. `aria-pressed` is the
      // toggle-button equivalent and is not valid alongside it.
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
        active
          ? "border-brand-500 bg-brand-500 text-white shadow-sm"
          : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:text-foreground",
        className,
      )}
    >
      {active && <Check className="size-3.5" aria-hidden />}
      {label}
    </button>
  );
}
