import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Every empty state should say what happened, why, and what to do next. The
 * `action` slot is not optional in spirit — a dead end with no way forward is
 * worse than no empty state at all.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-500/10">
        <Icon className="size-7 text-brand-600 dark:text-brand-400" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-pretty text-sm leading-relaxed text-foreground-muted">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
