import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DiscoverPanel } from "@/components/discover-panel";
import { RecipeHeroArt } from "@/components/recipe-hero-art";
import { SAMPLE_RECIPES } from "@/lib/data/sample-recipes";
import { formatMinutes } from "@/lib/utils";
import { totalMinutes } from "@/lib/schemas/recipe";

export default function HomePage() {
  const featured = SAMPLE_RECIPES.slice(0, 3);

  return (
    <div className="space-y-14">
      <section className="pt-4 text-center sm:pt-10">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground-muted">
          <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />
          Powered by Claude
        </p>

        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Cook with what you{" "}
          <span className="text-brand-600 dark:text-brand-400">already have</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
          List the ingredients sitting in your kitchen. Get real recipes you can
          start right now — ranked by how much of each one you already have, with
          anything missing called out up front.
        </p>
      </section>

      <DiscoverPanel />

      {/* Server-rendered so these recipes are crawlable and give the page real
          content before any client interaction. */}
      <section aria-labelledby="featured-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="featured-heading" className="text-xl font-semibold tracking-tight">
            Or browse a few to start
          </h2>
        </div>

        <ul className="grid gap-5 sm:grid-cols-3">
          {featured.map((recipe) => (
            <li key={recipe.id}>
              <Link
                href={`/recipe/${recipe.id}`}
                className="group block overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-card transition-shadow hover:shadow-raised"
              >
                <RecipeHeroArt
                  hue={recipe.heroHue}
                  title={recipe.title}
                  className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-4">
                  <h3 className="text-balance font-semibold leading-snug">
                    {recipe.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground-muted">
                    {recipe.description}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
                    {formatMinutes(totalMinutes(recipe))} · View recipe
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
