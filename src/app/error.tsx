"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Catches render and data errors below this
 * segment so a single broken recipe cannot take down the whole app.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where an error reporter would receive the digest.
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-red-500/10">
        <AlertTriangle className="size-7 text-red-500" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Something broke</h1>
      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-foreground-muted">
        An unexpected error stopped this page from loading. Your saved recipes
        and shopping list are stored on your device and are unaffected.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-foreground-subtle">
          Reference: {error.digest}
        </p>
      )}
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
