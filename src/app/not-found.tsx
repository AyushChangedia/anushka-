import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-500/10">
        <SearchX className="size-7 text-brand-600 dark:text-brand-400" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        We could not find that recipe
      </h1>
      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-foreground-muted">
        The link may be out of date, or the recipe was generated in a session
        that has since expired. Try generating a fresh batch from your
        ingredients.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to recipes</Link>
      </Button>
    </div>
  );
}
