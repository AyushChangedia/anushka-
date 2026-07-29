"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, ChefHat, Circle, Clock, Flame, Heart, Lightbulb,
  Printer, Replace, Share2, ShoppingBasket, Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecipeHeroArt } from "@/components/recipe-hero-art";
import { CookingTimer } from "@/components/recipe-detail/cooking-timer";
import { usePantryStore } from "@/store/pantry-store";
import { useRecipeStore } from "@/store/recipe-store";
import { analyzeRecipe, buildPantry, findPantryMatch } from "@/lib/recipes/matching";
import { totalMinutes, type Recipe, type RecipeIngredient } from "@/lib/schemas/recipe";
import { cn, formatAmount, formatMinutes } from "@/lib/utils";

const SCALES = [1, 2, 4] as const;

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const ingredients = usePantryStore((s) => s.ingredients);
  const pantryHydrated = usePantryStore((s) => s.hydrated);
  const hydrated = useRecipeStore((s) => s.hydrated);
  const isSaved = useRecipeStore((s) => s.saved.some((r) => r.id === recipe.id));
  const toggleSaved = useRecipeStore((s) => s.toggleSaved);
  const recordView = useRecipeStore((s) => s.recordView);
  const addToShoppingList = useRecipeStore((s) => s.addToShoppingList);

  const [scale, setScale] = useState<(typeof SCALES)[number]>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  // Recompute the pantry match on the client, since the pantry lives in local
  // storage and the server has no idea what the user has.
  const analyzed = useMemo(
    () => analyzeRecipe(recipe, buildPantry(ingredients)),
    [recipe, ingredients],
  );

  const pantry = useMemo(() => buildPantry(ingredients), [ingredients]);

  useEffect(() => {
    if (hydrated) recordView(analyzed);
  }, [hydrated, analyzed, recordView]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleStep = (number: number) =>
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });

  const handleShare = async () => {
    const url = window.location.href;
    // The native share sheet is the better experience where it exists; the
    // clipboard is the universal fallback.
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text: recipe.description, url });
        return;
      } catch {
        // User dismissed the sheet — not an error worth reporting.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied to clipboard");
    } catch {
      setToast("Could not copy the link");
    }
  };

  const missingAll = [...analyzed.missingRequired, ...analyzed.missingOptional];

  const handleAddMissing = () => {
    const added = addToShoppingList(missingAll, recipe.title);
    setToast(
      added === 0
        ? "Everything was already on your list"
        : `Added ${added} item${added === 1 ? "" : "s"} to your shopping list`,
    );
  };

  return (
    <article className="space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
        data-print="hide"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to recipes
      </Link>

      {/* --- Hero -------------------------------------------------------- */}
      <header className="space-y-5">
        <div className="relative overflow-hidden rounded-[var(--radius-card)]">
          <RecipeHeroArt
            hue={recipe.heroHue}
            title={recipe.title}
            priority
            className="aspect-[21/9] w-full"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                {recipe.cuisine}
              </Badge>
              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                {recipe.mealType}
              </Badge>
              {recipe.dietTags.map((tag) => (
                <Badge key={tag} className="bg-white/20 text-white backdrop-blur-sm">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-balance text-3xl font-semibold leading-tight text-white drop-shadow-sm sm:text-4xl">
              {recipe.title}
            </h1>
          </div>
        </div>

        <p className="max-w-3xl text-pretty text-base leading-relaxed text-foreground-muted">
          {recipe.description}
        </p>

        {/* --- Key facts ------------------------------------------------- */}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact icon={Clock} label="Prep" value={formatMinutes(recipe.prepMinutes)} />
          <Fact icon={Flame} label="Cook" value={formatMinutes(recipe.cookMinutes)} />
          <Fact
            icon={Clock}
            label="Total"
            value={formatMinutes(totalMinutes(recipe))}
            emphasis
          />
          <Fact icon={ChefHat} label="Difficulty" value={recipe.difficulty} />
        </dl>

        {/* --- Actions --------------------------------------------------- */}
        <div className="flex flex-wrap gap-2" data-print="hide">
          {hydrated && (
            <Button
              variant={isSaved ? "primary" : "secondary"}
              onClick={() => toggleSaved(analyzed)}
              aria-pressed={isSaved}
            >
              <Heart className={cn(isSaved && "fill-current")} aria-hidden />
              {isSaved ? "Saved" : "Save recipe"}
            </Button>
          )}

          {hydrated && missingAll.length > 0 && (
            <Button variant="accent" onClick={handleAddMissing}>
              <ShoppingBasket aria-hidden />
              Add {missingAll.length} missing to list
            </Button>
          )}

          <Button variant="secondary" onClick={handleShare}>
            <Share2 aria-hidden />
            Share
          </Button>

          <Button variant="secondary" onClick={() => window.print()}>
            <Printer aria-hidden />
            Print
          </Button>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-10">
          {/* --- Ingredients -------------------------------------------- */}
          <section aria-labelledby="ingredients-heading" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="ingredients-heading" className="text-xl font-semibold tracking-tight">
                Ingredients
              </h2>

              <div
                className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
                role="group"
                aria-label="Scale quantities"
                data-print="hide"
              >
                {SCALES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScale(value)}
                    aria-pressed={scale === value}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                      scale === value
                        ? "bg-brand-500 text-white"
                        : "text-foreground-muted hover:text-foreground",
                    )}
                  >
                    {value}×
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-foreground-muted">
              <Users className="mr-1.5 inline size-4 align-text-bottom" aria-hidden />
              Serves {recipe.servings * scale}
              {scale > 1 && ` (scaled from ${recipe.servings})`}
            </p>

            <ul className="space-y-1">
              {recipe.ingredients.map((ingredient) => (
                <IngredientRow
                  key={`${ingredient.name}-${ingredient.quantity}`}
                  ingredient={ingredient}
                  scale={scale}
                  // Until the pantry has hydrated we cannot know what the user
                  // has, so nothing is marked either way.
                  have={pantryHydrated ? findPantryMatch(ingredient.name, pantry) !== null : null}
                />
              ))}
            </ul>

            {recipe.optionalIngredients.length > 0 && (
              <div className="space-y-1 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
                  Optional
                </h3>
                <ul className="space-y-1">
                  {recipe.optionalIngredients.map((ingredient) => (
                    <IngredientRow
                      key={`${ingredient.name}-${ingredient.quantity}`}
                      ingredient={ingredient}
                      scale={scale}
                      have={pantryHydrated ? findPantryMatch(ingredient.name, pantry) !== null : null}
                      optional
                    />
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* --- Steps --------------------------------------------------- */}
          <section aria-labelledby="steps-heading" className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="steps-heading" className="text-xl font-semibold tracking-tight">
                Method
              </h2>
              <p className="text-sm text-foreground-subtle" data-print="hide">
                {completedSteps.size} of {recipe.steps.length} done
              </p>
            </div>

            <ol className="space-y-3">
              {recipe.steps.map((step) => {
                const complete = completedSteps.has(step.number);

                return (
                  <li
                    key={step.number}
                    data-print="block"
                    className={cn(
                      "rounded-2xl border border-border bg-surface p-4 transition-colors",
                      complete && "border-brand-500/40 bg-brand-500/[0.06]",
                    )}
                  >
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => toggleStep(step.number)}
                        aria-pressed={complete}
                        aria-label={`Mark step ${step.number} as ${complete ? "not done" : "done"}`}
                        // `self-start` stops the button stretching to the row
                        // height — a stretched button centres its content, which
                        // floats the number against multi-line step text.
                        className="mt-0.5 shrink-0 self-start"
                        data-print="hide"
                      >
                        {complete ? (
                          <span className="grid size-7 place-items-center rounded-full bg-brand-500 text-white">
                            <Check className="size-4" aria-hidden />
                          </span>
                        ) : (
                          <span className="grid size-7 place-items-center rounded-full border border-border-strong text-sm font-semibold text-foreground-muted">
                            {step.number}
                          </span>
                        )}
                      </button>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h3
                            className={cn(
                              "font-semibold leading-snug",
                              complete && "text-foreground-muted line-through",
                            )}
                          >
                            {step.title}
                          </h3>
                          {step.durationMinutes !== null && step.durationMinutes > 0 && (
                            <CookingTimer
                              minutes={step.durationMinutes}
                              label={`${recipe.title} — ${step.title}`}
                            />
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-pretty text-sm leading-relaxed text-foreground-muted",
                            complete && "opacity-60",
                          )}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* --- Tips ---------------------------------------------------- */}
          {recipe.tips.length > 0 && (
            <section aria-labelledby="tips-heading" className="space-y-3">
              <h2
                id="tips-heading"
                className="flex items-center gap-2 text-xl font-semibold tracking-tight"
              >
                <Lightbulb className="size-5 text-accent-500" aria-hidden />
                Tips
              </h2>
              <ul className="space-y-2">
                {recipe.tips.map((tip) => (
                  <li
                    key={tip}
                    className="rounded-2xl border border-accent-500/25 bg-accent-500/[0.07] px-4 py-3 text-pretty text-sm leading-relaxed"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* --- Substitutions ------------------------------------------- */}
          {recipe.substitutions.length > 0 && (
            <section aria-labelledby="subs-heading" className="space-y-3">
              <h2
                id="subs-heading"
                className="flex items-center gap-2 text-xl font-semibold tracking-tight"
              >
                <Replace className="size-5 text-brand-500" aria-hidden />
                No {recipe.substitutions[0]?.ingredient.toLowerCase()}? Swap it
              </h2>
              <dl className="grid gap-2 sm:grid-cols-2">
                {recipe.substitutions.map((sub) => (
                  <div
                    key={sub.ingredient}
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <dt className="text-sm font-semibold">No {sub.ingredient}?</dt>
                    <dd className="mt-1 text-pretty text-sm leading-relaxed text-foreground-muted">
                      {sub.substitute}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        {/* --- Nutrition sidebar ----------------------------------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section
            aria-labelledby="nutrition-heading"
            className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-card"
          >
            <h2 id="nutrition-heading" className="text-lg font-semibold tracking-tight">
              Nutrition
            </h2>
            <p className="mt-0.5 text-xs text-foreground-subtle">
              Estimated, per serving
            </p>

            <div className="mt-4 rounded-2xl bg-brand-500/10 p-4 text-center">
              <p className="text-3xl font-semibold tabular-nums text-brand-700 dark:text-brand-300">
                {Math.round(recipe.nutrition.calories)}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                calories
              </p>
            </div>

            <dl className="mt-4 space-y-2.5">
              <NutrientRow label="Protein" grams={recipe.nutrition.proteinG} />
              <NutrientRow label="Carbohydrates" grams={recipe.nutrition.carbsG} />
              <NutrientRow label="Fat" grams={recipe.nutrition.fatG} />
              <NutrientRow label="Fibre" grams={recipe.nutrition.fiberG} />
              <NutrientRow label="Sugar" grams={recipe.nutrition.sugarG} />
            </dl>
          </section>
        </aside>
      </div>

      {/* Transient confirmation. `role="status"` announces it without stealing
          focus from whatever the user is doing. */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-raised"
          data-print="hide"
        >
          {toast}
        </div>
      )}
    </article>
  );
}

function IngredientRow({
  ingredient,
  scale,
  have,
  optional = false,
}: {
  ingredient: RecipeIngredient;
  scale: number;
  have: boolean | null;
  optional?: boolean;
}) {
  // Scale the numeric amount where we have one; "to taste" stays "to taste".
  const quantity =
    ingredient.amount !== null
      ? `${formatAmount(ingredient.amount * scale)}${ingredient.unit ? ` ${ingredient.unit}` : ""}`
      : ingredient.quantity;

  return (
    <li className="flex items-start gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-muted">
      <span className="mt-0.5 shrink-0" aria-hidden>
        {have === true ? (
          <Check className="size-4 text-brand-500" />
        ) : have === false ? (
          <Circle className="size-4 text-amber-500" />
        ) : (
          <Circle className="size-4 text-foreground-subtle" />
        )}
      </span>

      <span className="flex-1 text-sm leading-relaxed">
        {quantity && <span className="font-medium tabular-nums">{quantity} </span>}
        <span>{ingredient.name}</span>
        {ingredient.note && (
          <span className="text-foreground-muted">, {ingredient.note}</span>
        )}
        {have === false && !optional && (
          <span className="ml-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            need this
          </span>
        )}
      </span>
    </li>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
  emphasis = false,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface px-4 py-3",
        emphasis && "border-brand-500/40 bg-brand-500/[0.07]",
      )}
    >
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 text-base font-semibold">{value}</dd>
    </div>
  );
}

function NutrientRow({ label, grams }: { label: string; grams: number }) {
  // Percentages are relative to the largest macro in a typical meal rather than
  // a daily value, so the bar reads as a comparison within this dish only.
  const width = Math.min(100, (grams / 80) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <dt className="text-foreground-muted">{label}</dt>
        <dd className="font-medium tabular-nums">{grams} g</dd>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-brand-400"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
