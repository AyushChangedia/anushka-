"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Heart, ShoppingBasket } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRecipeStore } from "@/store/recipe-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Discover", icon: ChefHat },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/shopping-list", label: "Shopping", icon: ShoppingBasket },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const savedCount = useRecipeStore((s) => s.saved.length);
  const unpurchased = useRecipeStore(
    (s) => s.shoppingList.filter((item) => !item.checked).length,
  );
  const hydrated = useRecipeStore((s) => s.hydrated);

  const countFor = (href: string) => {
    // Counts come from local storage, so they must not render until after
    // hydration or the server and client markup disagree.
    if (!hydrated) return 0;
    if (href === "/saved") return savedCount;
    if (href === "/shopping-list") return unpurchased;
    return 0;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border glass" data-print="hide">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white shadow-sm">
            <ChefHat className="size-5" aria-hidden />
          </span>
          <span className="hidden sm:inline">Recipe Maker AI</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            const count = countFor(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-500/12 text-brand-700 dark:text-brand-300"
                    : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span className="hidden md:inline">{label}</span>
                {count > 0 && (
                  <span
                    className="grid min-w-5 place-items-center rounded-full bg-accent-500 px-1.5 text-[11px] font-semibold text-white"
                    aria-label={`${count} items`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
