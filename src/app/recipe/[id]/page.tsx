import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipe-detail/recipe-detail";
import { getRecipeById } from "@/lib/recipes/repository";
import { totalMinutes } from "@/lib/schemas/recipe";

/**
 * Recipe detail.
 *
 * Server-rendered so the recipe is crawlable, shareable and readable before any
 * JavaScript loads. Only the genuinely interactive parts — serving scaler,
 * timers, save, shopping list — are client components.
 */

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  // Signalled here as well as in the page body. `generateMetadata` resolves
  // first, and a successful return commits a 200 before the page can call
  // `notFound()` — which would leave unknown recipes serving a soft 404 that
  // search engines happily index.
  if (!recipe) notFound();

  return {
    title: recipe.title,
    description: recipe.description.slice(0, 160),
    openGraph: {
      type: "article",
      title: recipe.title,
      description: recipe.description.slice(0, 200),
    },
    alternates: { canonical: `/recipe/${recipe.id}` },
  };
}

export default async function RecipePage({ params }: Params) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) notFound();

  /**
   * schema.org Recipe markup, so search engines can surface cook time,
   * ingredients and nutrition as a rich result rather than plain blue links.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    recipeCuisine: recipe.cuisine,
    recipeCategory: recipe.mealType,
    keywords: recipe.dietTags.join(", "),
    prepTime: `PT${recipe.prepMinutes}M`,
    cookTime: `PT${recipe.cookMinutes}M`,
    totalTime: `PT${totalMinutes(recipe)}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeIngredient: recipe.ingredients.map((i) =>
      [i.quantity, i.name, i.note].filter(Boolean).join(" ").trim(),
    ),
    recipeInstructions: recipe.steps.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: step.description,
    })),
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${Math.round(recipe.nutrition.calories)} calories`,
      proteinContent: `${recipe.nutrition.proteinG} g`,
      carbohydrateContent: `${recipe.nutrition.carbsG} g`,
      fatContent: `${recipe.nutrition.fatG} g`,
      fiberContent: `${recipe.nutrition.fiberG} g`,
      sugarContent: `${recipe.nutrition.sugarG} g`,
      servingSize: "1 serving",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from validated data we control, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecipeDetail recipe={recipe} />
    </>
  );
}
