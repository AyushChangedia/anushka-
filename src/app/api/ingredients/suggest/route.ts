import { NextResponse } from "next/server";
import { suggestIngredients } from "@/lib/data/ingredients";

/**
 * GET /api/ingredients/suggest?q=tom&exclude=onion,garlic
 *
 * The client filters the bundled vocabulary locally for instant feedback; this
 * endpoint exists so the same suggestions are available to non-browser clients
 * and can later be swapped for a personalised source without a UI change.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const exclude = (searchParams.get("exclude") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return NextResponse.json({ suggestions: suggestIngredients(query, exclude) });
}
