import type { Metadata } from "next";
import { ShoppingList } from "@/components/shopping-list";

export const metadata: Metadata = {
  title: "Shopping list",
  description: "The ingredients you still need to buy.",
  robots: { index: false, follow: false },
};

export default function ShoppingListPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Shopping list</h1>
        <p className="mt-1.5 text-foreground-muted">
          Everything you are missing, collected in one place.
        </p>
      </header>

      <ShoppingList />
    </div>
  );
}
