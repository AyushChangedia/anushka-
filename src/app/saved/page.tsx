import type { Metadata } from "next";
import { SavedRecipes } from "@/components/saved-recipes";

export const metadata: Metadata = {
  title: "Saved recipes",
  description: "The recipes you have saved to cook later.",
  // A personal collection has nothing useful to index.
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Saved recipes</h1>
        <p className="mt-1.5 text-foreground-muted">
          Everything you have hearted, ready to cook.
        </p>
      </header>

      <SavedRecipes />
    </div>
  );
}
