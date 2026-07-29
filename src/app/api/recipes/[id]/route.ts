import { NextResponse } from "next/server";
import { getRecipeById } from "@/lib/recipes/repository";

/** GET /api/recipes/:id — fetch a single persisted or sample recipe. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  return NextResponse.json(
    { recipe },
    {
      // Recipes are immutable once generated, so they cache well.
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
    },
  );
}
