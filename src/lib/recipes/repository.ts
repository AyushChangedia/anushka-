import { getDb } from "@/lib/db";
import { recipeSchema, totalMinutes, type Recipe } from "@/lib/schemas/recipe";
import { SAMPLE_RECIPE_BY_ID } from "@/lib/data/sample-recipes";

/**
 * Recipe persistence.
 *
 * Every function degrades gracefully when no database is configured, because
 * guest mode is a supported way to run the whole app rather than a broken
 * state. Callers get `null`/no-op instead of an exception.
 */

/**
 * Store generated recipes so their detail pages have durable, shareable URLs.
 *
 * Best-effort by design: a recipe that fails to persist is still returned to
 * the user and still viewable from the client store, so a database blip must
 * not fail the generation request that triggered it.
 */
export async function persistRecipes(recipes: Recipe[]): Promise<void> {
  const db = getDb();
  if (!db || recipes.length === 0) return;

  try {
    await db.$transaction(
      recipes.map((recipe) =>
        db.recipe.upsert({
          where: { id: recipe.id },
          // Regenerating an identical slug should not clobber the stored copy
          // that existing links point at.
          update: {},
          create: {
            id: recipe.id,
            title: recipe.title,
            cuisine: recipe.cuisine,
            mealType: recipe.mealType,
            difficulty: recipe.difficulty,
            dietTags: recipe.dietTags,
            totalMinutes: totalMinutes(recipe),
            data: recipe,
          },
        }),
      ),
    );
  } catch (error) {
    console.error("[recipes] failed to persist batch:", error);
  }
}

/**
 * Look up a recipe by slug.
 *
 * Falls back to the built-in sample corpus so seeded recipe URLs resolve even
 * with no database — which is what makes the sample links on the landing page
 * work out of the box.
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const db = getDb();

  if (db) {
    try {
      const row = await db.recipe.findUnique({ where: { id } });
      if (row) {
        const parsed = recipeSchema.safeParse(row.data);
        if (parsed.success) return parsed.data;
        console.error(`[recipes] stored recipe ${id} failed validation`);
      }
    } catch (error) {
      console.error(`[recipes] lookup failed for ${id}:`, error);
    }
  }

  return SAMPLE_RECIPE_BY_ID.get(id) ?? null;
}

/** Slugs that should appear in the sitemap. */
export async function listPublicRecipeIds(limit = 500): Promise<string[]> {
  const db = getDb();
  const sampleIds = [...SAMPLE_RECIPE_BY_ID.keys()];
  if (!db) return sampleIds;

  try {
    const rows = await db.recipe.findMany({
      select: { id: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return [...new Set([...sampleIds, ...rows.map((r) => r.id)])];
  } catch {
    return sampleIds;
  }
}
