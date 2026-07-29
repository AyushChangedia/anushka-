import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-base transition-colors",
      "placeholder:text-foreground-subtle",
      "hover:border-border-strong",
      "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // 16px minimum on mobile stops iOS Safari zooming the viewport on focus.
      "md:text-sm",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
