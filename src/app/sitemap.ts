import type { MetadataRoute } from "next";
import { listPublicRecipeIds } from "@/lib/recipes/repository";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipeIds = await listPublicRecipeIds();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...recipeIds.map((id) => ({
      url: `${SITE_URL}/recipe/${id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
