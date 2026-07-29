import { cn } from "@/lib/utils";

/**
 * Shimmering placeholder. Marked `aria-hidden` because the surrounding region
 * announces its own loading state — a screen reader should hear "Generating
 * recipes", not eight anonymous boxes.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-[shimmer_2s_linear_infinite] rounded-lg bg-[length:200%_100%]",
        "bg-[linear-gradient(90deg,var(--surface-muted)_25%,var(--border)_50%,var(--surface-muted)_75%)]",
        className,
      )}
      {...props}
    />
  );
}

/** Matches the real recipe card's geometry so the layout does not jump. */
export function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
