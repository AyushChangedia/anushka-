import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { recipeSchema, totalMinutes } from "@/lib/schemas/recipe";

/**
 * Server-side saved recipes, for signed-in users.
 *
 * Guests keep their favourites in local storage — the client store is the
 * source of truth there. When a user signs in, the client pushes its local
 * saves here so nothing is lost, and from then on this endpoint is authoritative
 * across devices.
 */

export const runtime = "nodejs";

async function requireSession() {
  const session = await auth();
  const userId = session?.user?.id;
  const db = getDb();
  if (!userId || !db) return null;
  return { userId, db };
}

/** GET /api/saved — the signed-in user's saved recipes, newest first. */
export async function GET() {
  const ctx = await requireSession();
  if (!ctx) return NextResponse.json({ recipes: [] });

  const rows = await ctx.db.savedRecipe.findMany({
    where: { userId: ctx.userId },
    orderBy: { createdAt: "desc" },
    include: { recipe: true },
    take: 200,
  });

  const recipes = rows
    .map((row) => recipeSchema.safeParse(row.recipe.data))
    .filter((r) => r.success)
    .map((r) => r.data);

  return NextResponse.json({ recipes });
}

const saveSchema = z.object({ recipe: recipeSchema });

/** POST /api/saved — save a recipe, persisting the recipe itself if needed. */
export async function POST(request: Request) {
  const ctx = await requireSession();
  if (!ctx) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid recipe payload." }, { status: 400 });
  }

  const { recipe } = parsed.data;

  // The recipe may only have existed in the client's store until now, so make
  // sure the row exists before pointing a save at it.
  await ctx.db.recipe.upsert({
    where: { id: recipe.id },
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
  });

  await ctx.db.savedRecipe.upsert({
    where: { userId_recipeId: { userId: ctx.userId, recipeId: recipe.id } },
    update: {},
    create: { userId: ctx.userId, recipeId: recipe.id },
  });

  return NextResponse.json({ ok: true });
}

/** DELETE /api/saved?id=slug — remove a save. */
export async function DELETE(request: Request) {
  const ctx = await requireSession();
  if (!ctx) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing recipe id." }, { status: 400 });
  }

  await ctx.db.savedRecipe.deleteMany({
    where: { userId: ctx.userId, recipeId: id },
  });

  return NextResponse.json({ ok: true });
}
