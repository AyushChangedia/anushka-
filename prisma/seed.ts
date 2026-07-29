/**
 * Seeds the hand-authored recipe corpus.
 *
 * Idempotent: re-running updates existing rows rather than duplicating them, so
 * it is safe to run on every deploy.
 *
 *   npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import { SAMPLE_RECIPES } from "../src/lib/data/sample-recipes";

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Seeding requires a database — see .env.example.",
    );
    process.exit(1);
  }

  console.log(`Seeding ${SAMPLE_RECIPES.length} recipes…`);

  for (const recipe of SAMPLE_RECIPES) {
    const row = {
      title: recipe.title,
      cuisine: recipe.cuisine,
      mealType: recipe.mealType,
      difficulty: recipe.difficulty,
      dietTags: recipe.dietTags,
      totalMinutes: recipe.prepMinutes + recipe.cookMinutes,
      data: recipe,
      isSample: true,
    };

    await prisma.recipe.upsert({
      where: { id: recipe.id },
      update: row,
      create: { id: recipe.id, ...row },
    });

    console.log(`  ✓ ${recipe.title}`);
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
