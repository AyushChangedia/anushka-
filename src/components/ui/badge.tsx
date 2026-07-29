import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "bg-surface-muted text-foreground-muted",
        brand: "bg-brand-500/12 text-brand-700 dark:text-brand-300",
        accent: "bg-accent-500/14 text-accent-700 dark:text-accent-300",
        outline: "border border-border text-foreground-muted",
        // Reserved for "you're missing this" — the one genuinely cautionary state.
        warning: "bg-amber-500/14 text-amber-700 dark:text-amber-300",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
