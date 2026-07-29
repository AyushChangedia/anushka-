import type { Recipe } from "@/lib/schemas/recipe";

/**
 * A hand-authored recipe corpus.
 *
 * Three jobs:
 *  - Seeds the database (`prisma/seed.ts`).
 *  - Backs the deterministic fallback generator, so the app is fully
 *    demonstrable with no `ANTHROPIC_API_KEY` configured.
 *  - Provides fixtures for the ranking tests.
 *
 * Nutrition figures are per serving and are reasonable estimates, not lab
 * values — the same caveat that applies to the AI-generated ones.
 */

const ing = (
  name: string,
  quantity: string,
  amount: number | null = null,
  unit = "",
  note = "",
) => ({ name, quantity, amount, unit, note });

export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: "garlic-fried-rice",
    title: "Garlic Butter Fried Rice",
    description:
      "The weeknight hero of leftover rice: garlic bloomed in butter until nutty, onions caramelised at the edges, and every grain coated in savoury gloss. Ready before a delivery driver would even be assigned.",
    cuisine: "Chinese",
    mealType: "Dinner",
    difficulty: "Easy",
    dietTags: ["Vegetarian"],
    prepMinutes: 8,
    cookMinutes: 12,
    servings: 2,
    heroHue: 38,
    ingredients: [
      ing("rice", "3 cups cooked", 3, "cup", "preferably day-old"),
      ing("garlic", "6 cloves", 6, "clove", "finely minced"),
      ing("butter", "3 tbsp", 3, "tbsp"),
      ing("onion", "1 medium", 1, "", "finely diced"),
      ing("egg", "2 large", 2, "", "lightly beaten"),
      ing("salt", "to taste", null, ""),
      ing("black pepper", "to taste", null, ""),
    ],
    optionalIngredients: [
      ing("soy sauce", "1 tbsp", 1, "tbsp"),
      ing("scallion", "2 stalks", 2, "", "thinly sliced"),
      ing("sesame oil", "1 tsp", 1, "tsp"),
    ],
    steps: [
      {
        number: 1,
        title: "Break up the rice",
        description:
          "Tip the cooked rice into a wide bowl and separate the clumps with wet fingers or a fork until the grains are loose. Cold, dry, day-old rice fries; warm fresh rice steams and turns to paste.",
        durationMinutes: 3,
      },
      {
        number: 2,
        title: "Prep the aromatics",
        description:
          "Mince the garlic finely and dice the onion small — roughly the size of the rice grains, so every spoonful gets some of each. Beat the eggs in a small bowl and season with a pinch of salt.",
        durationMinutes: 5,
      },
      {
        number: 3,
        title: "Heat the pan properly",
        description:
          "Set your largest skillet or wok over medium-high heat and leave it for a full minute before adding fat. A properly preheated pan is the difference between frying and stewing.",
        durationMinutes: 1,
      },
      {
        number: 4,
        title: "Scramble the eggs and set aside",
        description:
          "Melt 1 tbsp of the butter, pour in the beaten eggs, and stir constantly for about 40 seconds until just set but still glossy. Scrape them onto a plate — they will finish cooking later and you do not want them rubbery.",
        durationMinutes: 2,
      },
      {
        number: 5,
        title: "Bloom the garlic",
        description:
          "Add the remaining 2 tbsp butter to the empty pan, then the garlic. Stir constantly for 45–60 seconds until fragrant and pale gold. Watch it closely: garlic goes from nutty to acrid in the space of about ten seconds.",
        durationMinutes: 1,
      },
      {
        number: 6,
        title: "Cook the onion",
        description:
          "Add the diced onion and a pinch of salt. Cook for 3–4 minutes, stirring occasionally, until the edges turn golden and translucent. The salt draws out moisture and speeds up the browning.",
        durationMinutes: 4,
      },
      {
        number: 7,
        title: "Fry the rice",
        description:
          "Add the rice and press it into an even layer. Leave it undisturbed for 45 seconds to catch some colour on the bottom, then toss. Repeat twice more — those toasted grains are the whole point of fried rice.",
        durationMinutes: 4,
      },
      {
        number: 8,
        title: "Season and combine",
        description:
          "Return the eggs to the pan, breaking them into bite-sized curds. Add soy sauce if using, pouring it around the hot edge of the pan rather than onto the rice so it sizzles and caramelises. Season with salt and a generous amount of black pepper.",
        durationMinutes: 2,
      },
      {
        number: 9,
        title: "Finish and serve",
        description:
          "Kill the heat, fold through the sliced scallions and a few drops of sesame oil if you have them, and serve straight from the pan while the grains are still separate and steaming.",
        durationMinutes: 1,
      },
    ],
    tips: [
      "Day-old refrigerated rice is genuinely better here — the grains dry out and stay separate. If you only have fresh rice, spread it on a tray and freeze it for 15 minutes.",
      "Add soy sauce gradually and taste as you go. It is much easier to add more than to rescue an over-salted pan.",
      "Do not crowd the pan. If you are doubling this, fry in two batches — steam is the enemy of a good fried rice.",
    ],
    substitutions: [
      { ingredient: "Butter", substitute: "Olive oil or any neutral cooking oil" },
      { ingredient: "Garlic", substitute: "1 tsp garlic powder, added with the rice rather than bloomed" },
      { ingredient: "Egg", substitute: "150g crumbled firm tofu, browned in step 4" },
      { ingredient: "Soy sauce", substitute: "A splash of fish sauce, or simply extra salt" },
    ],
    nutrition: { calories: 468, proteinG: 13, carbsG: 62, fatG: 18, fiberG: 2.5, sugarG: 3 },
  },
  {
    id: "tomato-egg-curry",
    title: "Everyday Tomato & Egg Curry",
    description:
      "A pantry curry that tastes like it took far longer than it did. Eggs simmered in a jammy, deeply spiced tomato base until the sauce clings. Endlessly forgiving and better the next day.",
    cuisine: "Indian",
    mealType: "Dinner",
    difficulty: "Easy",
    dietTags: ["Vegetarian", "High Protein", "Gluten Free"],
    prepMinutes: 10,
    cookMinutes: 25,
    servings: 3,
    heroHue: 8,
    ingredients: [
      ing("egg", "6 large", 6, ""),
      ing("tomato", "5 medium", 5, "", "roughly chopped"),
      ing("onion", "2 medium", 2, "", "finely sliced"),
      ing("garlic", "4 cloves", 4, "clove", "minced"),
      ing("ginger", "1 inch piece", 1, "", "grated"),
      ing("turmeric", "1/2 tsp", 0.5, "tsp"),
      ing("cumin", "1 tsp", 1, "tsp", "ground"),
      ing("chili powder", "1 tsp", 1, "tsp"),
      ing("oil", "2 tbsp", 2, "tbsp"),
      ing("salt", "to taste", null, ""),
    ],
    optionalIngredients: [
      ing("coriander", "small handful", null, "", "chopped, to finish"),
      ing("garam masala", "1/2 tsp", 0.5, "tsp"),
      ing("cream", "2 tbsp", 2, "tbsp"),
    ],
    steps: [
      {
        number: 1,
        title: "Boil the eggs",
        description:
          "Lower the eggs into boiling water and cook for 8 minutes for a set yolk that is still tender. Transfer straight to cold water — the temperature shock is what makes them peel cleanly.",
        durationMinutes: 8,
      },
      {
        number: 2,
        title: "Prep everything else",
        description:
          "While the eggs cook, slice the onions finely, chop the tomatoes, and mince the garlic and ginger. Curry moves quickly once the pan is hot, so having everything ready matters.",
        durationMinutes: 6,
      },
      {
        number: 3,
        title: "Brown the onions",
        description:
          "Heat the oil in a heavy pan over medium heat and add the onions with a pinch of salt. Cook for 8–10 minutes, stirring now and then, until deeply golden. This is the single biggest contributor to the finished flavour — do not rush it.",
        durationMinutes: 10,
      },
      {
        number: 4,
        title: "Add garlic and ginger",
        description:
          "Stir in the minced garlic and grated ginger and cook for 60 seconds until the raw edge cooks off and the mixture smells sweet rather than sharp.",
        durationMinutes: 1,
      },
      {
        number: 5,
        title: "Toast the spices",
        description:
          "Add the turmeric, cumin and chili powder and stir constantly for 30 seconds. Toasting the spices in hot oil rather than dropping them into liquid is what makes the difference between a bright curry and a dusty one.",
        durationMinutes: 1,
      },
      {
        number: 6,
        title: "Cook down the tomatoes",
        description:
          "Add the chopped tomatoes and a good pinch of salt. Cook for 10–12 minutes, mashing occasionally with the back of your spoon, until the tomatoes collapse into a thick sauce and you can see oil separating at the edges.",
        durationMinutes: 12,
      },
      {
        number: 7,
        title: "Loosen the sauce",
        description:
          "Add roughly half a cup of water — enough to bring the sauce to a coating consistency rather than a paste. Simmer for 2 minutes to bring it together.",
        durationMinutes: 2,
      },
      {
        number: 8,
        title: "Halve and add the eggs",
        description:
          "Peel the eggs and halve them lengthways. Nestle them cut-side up into the sauce and spoon a little over each. Simmer gently for 3 minutes so they warm through and take on the spice.",
        durationMinutes: 3,
      },
      {
        number: 9,
        title: "Finish and rest",
        description:
          "Stir through the garam masala and cream if using, scatter over the coriander, and let it sit off the heat for 5 minutes before serving. The resting time lets the sauce thicken and the flavours settle.",
        durationMinutes: 5,
      },
    ],
    tips: [
      "The onions are not a step to hurry. Pale onions give you a thin, sharp curry; properly browned ones give you depth you cannot fake with more spice.",
      "If the sauce tastes flat at the end, it is almost always salt or acid. Add a pinch of salt first, then a small squeeze of lemon.",
      "This genuinely improves overnight. Make it a day ahead if you can.",
    ],
    substitutions: [
      { ingredient: "Egg", substitute: "400g cubed paneer or firm tofu, added at step 8" },
      { ingredient: "Fresh tomato", substitute: "1 tin (400g) chopped tomatoes; reduce the added water" },
      { ingredient: "Ginger", substitute: "1/2 tsp ground ginger, added with the other spices" },
      { ingredient: "Cream", substitute: "A spoonful of yogurt, stirred in off the heat so it does not split" },
    ],
    nutrition: { calories: 322, proteinG: 18, carbsG: 16, fatG: 21, fiberG: 4, sugarG: 9 },
  },
  {
    id: "one-pan-lemon-chicken",
    title: "One-Pan Lemon Garlic Chicken",
    description:
      "Chicken with genuinely crisp skin, garlic gone sweet and soft in the rendered fat, and a pan sauce built from the browned bits. One pan, one tray, almost no washing up.",
    cuisine: "Mediterranean",
    mealType: "Dinner",
    difficulty: "Medium",
    dietTags: ["High Protein", "Low Carb", "Gluten Free", "Dairy Free"],
    prepMinutes: 12,
    cookMinutes: 33,
    servings: 4,
    heroHue: 48,
    ingredients: [
      ing("chicken", "8 thighs, bone-in", 8, "", "skin on, patted dry"),
      ing("garlic", "1 whole head", 1, "", "cloves separated, unpeeled"),
      ing("lemon", "2", 2, "", "one sliced, one juiced"),
      ing("olive oil", "2 tbsp", 2, "tbsp"),
      ing("onion", "1 large", 1, "", "cut into wedges"),
      ing("salt", "to taste", null, ""),
      ing("black pepper", "to taste", null, ""),
    ],
    optionalIngredients: [
      ing("rosemary", "3 sprigs", 3, "sprig"),
      ing("potato", "500g", 500, "g", "halved"),
      ing("chicken stock", "1/2 cup", 0.5, "cup"),
    ],
    steps: [
      {
        number: 1,
        title: "Dry and season the chicken",
        description:
          "Pat the chicken thighs thoroughly dry with paper towel — moisture is what stops skin from crisping. Season generously on both sides with salt and pepper and let them sit at room temperature while the oven heats.",
        durationMinutes: 5,
      },
      {
        number: 2,
        title: "Heat the oven",
        description:
          "Heat the oven to 200°C / 400°F. If you are adding potatoes, put them in a bowl with a little oil and salt now so they are ready to go in with everything else.",
        durationMinutes: 2,
      },
      {
        number: 3,
        title: "Sear skin-side down",
        description:
          "Heat the olive oil in a large ovenproof skillet over medium-high. Lay the thighs in skin-side down and do not touch them for 6–7 minutes. They will release from the pan on their own once the skin is properly browned.",
        durationMinutes: 7,
      },
      {
        number: 4,
        title: "Flip and remove",
        description:
          "Turn the thighs, give them 2 minutes on the flesh side, then lift them onto a plate. They are nowhere near cooked through — this stage is purely about the skin.",
        durationMinutes: 2,
      },
      {
        number: 5,
        title: "Soften the aromatics",
        description:
          "Pour off all but about a tablespoon of the rendered fat. Add the onion wedges and unpeeled garlic cloves and cook for 3 minutes, stirring, until they pick up some colour in the chicken fat.",
        durationMinutes: 3,
      },
      {
        number: 6,
        title: "Deglaze",
        description:
          "Add the lemon juice and the stock if using, scraping the browned bits off the base of the pan with a wooden spoon. Those bits are the most concentrated flavour in the dish and belong in the sauce, not welded to the pan.",
        durationMinutes: 2,
      },
      {
        number: 7,
        title: "Assemble and roast",
        description:
          "Return the chicken skin-side up, tuck the lemon slices and rosemary between the pieces, and add the potatoes if using. Transfer to the oven and roast for 20–22 minutes.",
        durationMinutes: 22,
      },
      {
        number: 8,
        title: "Check for doneness",
        description:
          "The chicken is ready at 74°C / 165°F at the thickest point, or when the juices run clear with no pink. If the skin needs more colour, give it 3 minutes under the grill.",
        durationMinutes: 3,
      },
      {
        number: 9,
        title: "Rest before serving",
        description:
          "Let the pan sit for 5 minutes before serving. Squeeze the softened garlic cloves out of their skins and mash them into the pan juices — they will be sweet and completely mellow. Spoon over the chicken.",
        durationMinutes: 5,
      },
    ],
    tips: [
      "Dry skin is the whole trick. If you have time, salt the chicken and leave it uncovered in the fridge for a few hours first.",
      "Leave the garlic cloves in their skins. They steam gently inside and turn sweet instead of burning.",
      "Do not skip the rest. Cutting straight in loses the juices onto the board rather than keeping them in the meat.",
    ],
    substitutions: [
      { ingredient: "Chicken thighs", substitute: "Bone-in breasts; reduce the oven time to about 16 minutes" },
      { ingredient: "Lemon", substitute: "White wine vinegar plus a little water, or a splash of dry white wine" },
      { ingredient: "Fresh rosemary", substitute: "1 tsp dried oregano or thyme" },
      { ingredient: "Chicken stock", substitute: "Water plus half a stock cube, or simply water" },
    ],
    nutrition: { calories: 512, proteinG: 42, carbsG: 9, fatG: 34, fiberG: 1.5, sugarG: 3 },
  },
  {
    id: "creamy-tomato-pasta",
    title: "15-Minute Creamy Tomato Pasta",
    description:
      "The sauce comes together in the time the pasta boils. Starchy pasta water emulsifies it into something silky that clings to every strand — no cream required, though it takes it happily.",
    cuisine: "Italian",
    mealType: "Dinner",
    difficulty: "Easy",
    dietTags: ["Vegetarian"],
    prepMinutes: 5,
    cookMinutes: 15,
    servings: 2,
    heroHue: 12,
    ingredients: [
      ing("pasta", "200g", 200, "g"),
      ing("tomato", "4 medium", 4, "", "chopped"),
      ing("garlic", "3 cloves", 3, "clove", "thinly sliced"),
      ing("olive oil", "3 tbsp", 3, "tbsp"),
      ing("onion", "1 small", 1, "", "finely diced"),
      ing("salt", "to taste", null, ""),
      ing("black pepper", "to taste", null, ""),
    ],
    optionalIngredients: [
      ing("cream", "3 tbsp", 3, "tbsp"),
      ing("parmesan", "30g", 30, "g", "finely grated"),
      ing("basil", "handful", null, "", "torn"),
      ing("chili flakes", "pinch", null, ""),
    ],
    steps: [
      {
        number: 1,
        title: "Get the water on",
        description:
          "Bring a large pot of water to a rolling boil and salt it heavily — it should taste like seawater. This is the only chance you get to season the pasta itself.",
        durationMinutes: 5,
      },
      {
        number: 2,
        title: "Start the sauce",
        description:
          "While the water heats, warm the olive oil in a wide pan over medium heat. Add the sliced garlic and cook gently for 2 minutes until it just turns pale gold at the edges.",
        durationMinutes: 2,
      },
      {
        number: 3,
        title: "Soften the onion",
        description:
          "Add the diced onion and a pinch of salt. Cook for 4 minutes until translucent and soft, stirring so the garlic underneath does not catch.",
        durationMinutes: 4,
      },
      {
        number: 4,
        title: "Cook the pasta",
        description:
          "Drop the pasta into the boiling water and set a timer for two minutes less than the package says. It will finish cooking in the sauce.",
        durationMinutes: 8,
      },
      {
        number: 5,
        title: "Build the tomato base",
        description:
          "Add the chopped tomatoes and chili flakes to the pan. Cook for 6–7 minutes, pressing them down with a spoon, until they break down into a loose sauce.",
        durationMinutes: 7,
      },
      {
        number: 6,
        title: "Save the pasta water",
        description:
          "Before draining, scoop out a full mug of the starchy cooking water. This is not optional — it is the emulsifier that turns oil and tomato into a glossy sauce rather than a greasy one.",
        durationMinutes: 1,
      },
      {
        number: 7,
        title: "Combine",
        description:
          "Drain the pasta and tip it directly into the sauce along with a splash of the reserved water. Toss vigorously over medium heat for 90 seconds — the agitation is what makes the sauce cling.",
        durationMinutes: 2,
      },
      {
        number: 8,
        title: "Finish and adjust",
        description:
          "Off the heat, stir through the cream and parmesan if using, adding more pasta water a splash at a time until it flows rather than clumps. Season with salt and plenty of black pepper, tear over the basil, and serve immediately.",
        durationMinutes: 2,
      },
    ],
    tips: [
      "Undercook the pasta by two minutes and finish it in the pan. It absorbs the sauce instead of just wearing it.",
      "Keep the pasta water even after you think you are done — sauce tightens as it cools and a splash brings it straight back.",
      "Add parmesan off the heat. Boiling it makes it grainy.",
    ],
    substitutions: [
      { ingredient: "Fresh tomato", substitute: "1 tin (400g) chopped or whole peeled tomatoes" },
      { ingredient: "Cream", substitute: "A spoonful of cream cheese, mascarpone, or just extra pasta water" },
      { ingredient: "Parmesan", substitute: "Pecorino, grana padano, or nutritional yeast for a vegan version" },
      { ingredient: "Fresh basil", substitute: "1 tsp dried oregano, added with the tomatoes" },
    ],
    nutrition: { calories: 545, proteinG: 15, carbsG: 78, fatG: 19, fiberG: 5, sugarG: 8 },
  },
  {
    id: "black-bean-quesadilla",
    title: "Crispy Black Bean Quesadillas",
    description:
      "Smashed spiced black beans and molten cheese between two tortillas, pressed until the outside shatters. The kind of thing you can build entirely from tins and still feel good about.",
    cuisine: "Mexican",
    mealType: "Lunch",
    difficulty: "Easy",
    dietTags: ["Vegetarian", "High Protein"],
    prepMinutes: 8,
    cookMinutes: 12,
    servings: 2,
    heroHue: 25,
    ingredients: [
      ing("tortilla", "4 large", 4, ""),
      ing("black beans", "1 tin (400g)", 400, "g", "drained and rinsed"),
      ing("cheese", "150g", 150, "g", "grated"),
      ing("onion", "1 small", 1, "", "finely diced"),
      ing("garlic", "2 cloves", 2, "clove", "minced"),
      ing("cumin", "1 tsp", 1, "tsp", "ground"),
      ing("oil", "1 tbsp", 1, "tbsp"),
      ing("salt", "to taste", null, ""),
    ],
    optionalIngredients: [
      ing("coriander", "small handful", null, "", "chopped"),
      ing("lime", "1", 1, "", "cut into wedges"),
      ing("sour cream", "to serve", null, ""),
      ing("hot sauce", "to serve", null, ""),
    ],
    steps: [
      {
        number: 1,
        title: "Prep the filling components",
        description:
          "Drain and rinse the beans thoroughly — the tin liquid is starchy and will make the filling gluey. Dice the onion small and mince the garlic.",
        durationMinutes: 5,
      },
      {
        number: 2,
        title: "Soften the aromatics",
        description:
          "Heat the oil in a skillet over medium heat. Cook the onion for 3 minutes until soft, then add the garlic and cumin and stir for another 30 seconds until fragrant.",
        durationMinutes: 4,
      },
      {
        number: 3,
        title: "Cook and smash the beans",
        description:
          "Add the beans and a splash of water. Cook for 3 minutes, then mash roughly with the back of a fork — leave about a third of them whole so the filling has texture rather than turning into a paste.",
        durationMinutes: 3,
      },
      {
        number: 4,
        title: "Season the filling",
        description:
          "Taste and season with salt. It should be assertively seasoned — the tortilla and cheese will mute it considerably. Stir through the chopped coriander if using.",
        durationMinutes: 1,
      },
      {
        number: 5,
        title: "Assemble",
        description:
          "Lay out two tortillas. Scatter a thin layer of cheese on each, spread the bean mixture over, then top with the remaining cheese and the second tortilla. Cheese on both sides is what glues the whole thing together.",
        durationMinutes: 3,
      },
      {
        number: 6,
        title: "Toast the first side",
        description:
          "Wipe out the skillet and set it over medium heat with no oil. Lay in a quesadilla and press down firmly with a spatula. Cook for 3 minutes until the underside is spotted deep brown and crisp.",
        durationMinutes: 3,
      },
      {
        number: 7,
        title: "Flip carefully",
        description:
          "Slide the quesadilla onto a plate, invert the skillet over it, and flip the whole thing back — much easier than wrestling it with a spatula. Cook the second side for 2–3 minutes.",
        durationMinutes: 3,
      },
      {
        number: 8,
        title: "Rest and cut",
        description:
          "Let it sit for a minute before cutting — straight out of the pan the cheese is molten and will run out. Cut into wedges with a sharp knife or a pizza wheel and serve with lime, sour cream and hot sauce.",
        durationMinutes: 2,
      },
    ],
    tips: [
      "Dry pan, no oil. The tortilla has enough fat and a dry pan gives you a crisper, less greasy result.",
      "Do not overfill. A thin layer that reaches the edges beats a thick pile in the middle that oozes out and burns.",
      "Cheese goes on both the top and bottom layer — it is the structural adhesive, not just flavour.",
    ],
    substitutions: [
      { ingredient: "Black beans", substitute: "Pinto, kidney or refried beans" },
      { ingredient: "Cheese", substitute: "Any melting cheese — cheddar, monterey jack, mozzarella, or a vegan alternative" },
      { ingredient: "Tortilla", substitute: "Flatbread, naan, or pita split open" },
      { ingredient: "Ground cumin", substitute: "Chili powder, taco seasoning, or smoked paprika" },
    ],
    nutrition: { calories: 598, proteinG: 27, carbsG: 61, fatG: 27, fiberG: 12, sugarG: 4 },
  },
  {
    id: "veggie-stir-fry",
    title: "Everything-in-the-Fridge Stir Fry",
    description:
      "A framework more than a recipe: whatever vegetables you have, cooked hot and fast in a glossy garlic-ginger sauce. Designed to absorb whatever the crisper drawer is hiding.",
    cuisine: "Chinese",
    mealType: "Dinner",
    difficulty: "Easy",
    dietTags: ["Vegetarian", "Vegan", "Healthy", "Dairy Free"],
    prepMinutes: 12,
    cookMinutes: 10,
    servings: 3,
    heroHue: 110,
    ingredients: [
      ing("mixed vegetables", "600g", 600, "g", "cut into even bite-sized pieces"),
      ing("garlic", "4 cloves", 4, "clove", "minced"),
      ing("ginger", "1 inch piece", 1, "", "grated"),
      ing("soy sauce", "3 tbsp", 3, "tbsp"),
      ing("oil", "2 tbsp", 2, "tbsp", "something with a high smoke point"),
      ing("cornstarch", "1 tsp", 1, "tsp"),
    ],
    optionalIngredients: [
      ing("sesame oil", "1 tsp", 1, "tsp"),
      ing("honey", "1 tsp", 1, "tsp"),
      ing("chili flakes", "pinch", null, ""),
      ing("sesame seeds", "1 tbsp", 1, "tbsp", "toasted"),
      ing("rice", "to serve", null, ""),
    ],
    steps: [
      {
        number: 1,
        title: "Cut everything to size",
        description:
          "Chop all vegetables to roughly the same size so they cook evenly. Keep the hard ones (carrot, broccoli stem, cauliflower) separate from the soft ones (pepper, courgette, leafy greens) — they go in at different times.",
        durationMinutes: 10,
      },
      {
        number: 2,
        title: "Mix the sauce",
        description:
          "Whisk the soy sauce, cornstarch, honey if using, and 3 tbsp of water in a small bowl until no lumps remain. Mixing the cornstarch in cold liquid now prevents it clumping in the hot pan later.",
        durationMinutes: 2,
      },
      {
        number: 3,
        title: "Get the pan properly hot",
        description:
          "Set your largest pan or wok over the highest heat your hob will give you and let it heat for a full 2 minutes. Stir-frying is defined by heat — an underheated pan steams the vegetables into limpness.",
        durationMinutes: 2,
      },
      {
        number: 4,
        title: "Sear the hard vegetables",
        description:
          "Add the oil, swirl to coat, then add the hard vegetables. Stir-fry for 3 minutes, tossing constantly, until they take on some char at the edges but still have real bite.",
        durationMinutes: 3,
      },
      {
        number: 5,
        title: "Add the soft vegetables",
        description:
          "Add the softer vegetables and stir-fry for another 2 minutes. Keep everything moving — food that sits still burns, food that keeps moving browns.",
        durationMinutes: 2,
      },
      {
        number: 6,
        title: "Add the aromatics",
        description:
          "Push the vegetables to the sides, add a little more oil to the centre, and add the garlic and ginger. Cook for 30 seconds in the clear space before tossing through. Adding them late keeps them fragrant rather than burnt.",
        durationMinutes: 1,
      },
      {
        number: 7,
        title: "Sauce it",
        description:
          "Give the sauce a final stir to re-suspend the cornstarch and pour it in. It will bubble and thicken almost immediately — toss everything for 60 seconds until each piece is glossy and coated.",
        durationMinutes: 1,
      },
      {
        number: 8,
        title: "Finish off the heat",
        description:
          "Kill the heat, add the sesame oil and chili flakes, and toss once more. Scatter with sesame seeds and serve over rice straight away, while the vegetables still have snap.",
        durationMinutes: 1,
      },
    ],
    tips: [
      "Have everything chopped and the sauce mixed before the pan goes on. Once you start, there is no time to prep.",
      "Cook in batches if your pan is small. Crowding drops the temperature and you end up boiling instead of frying.",
      "The cornstarch is what makes the sauce cling rather than pool at the bottom of the plate.",
    ],
    substitutions: [
      { ingredient: "Soy sauce", substitute: "Tamari for gluten free, or coconut aminos" },
      { ingredient: "Cornstarch", substitute: "Arrowroot or potato starch, in the same quantity" },
      { ingredient: "Fresh ginger", substitute: "1/2 tsp ground ginger, added with the sauce" },
      { ingredient: "Honey", substitute: "Maple syrup, brown sugar, or omit entirely" },
    ],
    nutrition: { calories: 232, proteinG: 8, carbsG: 24, fatG: 12, fiberG: 6, sugarG: 9 },
  },
  {
    id: "shakshuka",
    title: "Weekend Shakshuka",
    description:
      "Eggs poached directly in a smoky, slow-cooked pepper and tomato base. Built in one pan, eaten out of the same pan, with bread for scooping.",
    cuisine: "Middle Eastern",
    mealType: "Breakfast",
    difficulty: "Medium",
    dietTags: ["Vegetarian", "High Protein", "Gluten Free"],
    prepMinutes: 10,
    cookMinutes: 30,
    servings: 4,
    heroHue: 16,
    ingredients: [
      ing("egg", "6 large", 6, ""),
      ing("tomato", "6 medium", 6, "", "chopped"),
      ing("bell pepper", "2", 2, "", "sliced"),
      ing("onion", "1 large", 1, "", "sliced"),
      ing("garlic", "4 cloves", 4, "clove", "sliced"),
      ing("paprika", "2 tsp", 2, "tsp", "smoked if possible"),
      ing("cumin", "1 tsp", 1, "tsp", "ground"),
      ing("olive oil", "3 tbsp", 3, "tbsp"),
      ing("salt", "to taste", null, ""),
    ],
    optionalIngredients: [
      ing("feta", "100g", 100, "g", "crumbled"),
      ing("coriander", "handful", null, "", "chopped"),
      ing("chili flakes", "1/2 tsp", 0.5, "tsp"),
      ing("bread", "to serve", null, "", "crusty"),
    ],
    steps: [
      {
        number: 1,
        title: "Prep the vegetables",
        description:
          "Slice the peppers and onion into strips of similar width, and slice the garlic thinly. Chop the tomatoes roughly — they are going to break down completely so precision does not matter.",
        durationMinutes: 8,
      },
      {
        number: 2,
        title: "Soften peppers and onion",
        description:
          "Heat the olive oil in a wide, deep skillet over medium heat. Add the peppers and onion with a pinch of salt and cook for 10–12 minutes until genuinely soft and starting to caramelise at the edges.",
        durationMinutes: 12,
      },
      {
        number: 3,
        title: "Add garlic and spices",
        description:
          "Stir in the sliced garlic, paprika, cumin and chili flakes. Cook for 60 seconds, stirring constantly, until the spices smell toasted and coat everything in the pan.",
        durationMinutes: 1,
      },
      {
        number: 4,
        title: "Build the tomato base",
        description:
          "Add the chopped tomatoes and a generous pinch of salt. Bring to a simmer and cook for 12–15 minutes, stirring occasionally, until thickened enough that a spoon dragged through leaves a trail.",
        durationMinutes: 15,
      },
      {
        number: 5,
        title: "Taste and adjust",
        description:
          "Season the sauce properly now — once the eggs go in you cannot stir it. It should taste slightly too bold on its own; the eggs will mellow it.",
        durationMinutes: 1,
      },
      {
        number: 6,
        title: "Make wells for the eggs",
        description:
          "Use the back of a spoon to make six shallow wells in the sauce, spaced evenly. Push right down to the base of the pan so the eggs sit in the sauce rather than sliding around on top.",
        durationMinutes: 1,
      },
      {
        number: 7,
        title: "Add the eggs",
        description:
          "Crack an egg into each well. Cracking each into a small cup first and then tipping it in gives you far more control over placement.",
        durationMinutes: 2,
      },
      {
        number: 8,
        title: "Cover and poach",
        description:
          "Turn the heat to low, cover the pan, and cook for 6–8 minutes. You want set whites and yolks that are still visibly liquid — check at 6 minutes, because they go from perfect to overcooked quickly.",
        durationMinutes: 8,
      },
      {
        number: 9,
        title: "Finish and serve",
        description:
          "Scatter over the crumbled feta and chopped coriander, grind on black pepper, and bring the whole pan to the table with plenty of bread for scooping.",
        durationMinutes: 2,
      },
    ],
    tips: [
      "Take the full time on the peppers and onions. Shakshuka rushed at that stage tastes thin no matter how long you simmer the tomatoes afterwards.",
      "Crack each egg into a cup first. It is the difference between six neat pools and one scrambled mess.",
      "Check the eggs early and often — residual heat keeps cooking them after the pan leaves the hob.",
    ],
    substitutions: [
      { ingredient: "Fresh tomato", substitute: "2 tins (800g) chopped tomatoes; simmer a little longer to thicken" },
      { ingredient: "Feta", substitute: "Goat cheese, ricotta, or leave it out" },
      { ingredient: "Smoked paprika", substitute: "Sweet paprika plus a pinch of chipotle, or plain paprika" },
      { ingredient: "Bell pepper", substitute: "Jarred roasted red peppers; add them with the tomatoes instead" },
    ],
    nutrition: { calories: 288, proteinG: 15, carbsG: 18, fatG: 18, fiberG: 5, sugarG: 11 },
  },
  {
    id: "banana-oat-pancakes",
    title: "Three-Ingredient Banana Oat Pancakes",
    description:
      "Blender pancakes with no flour and no added sugar — the banana does all the work. Fluffy, faintly caramelised, and on the table in fifteen minutes.",
    cuisine: "American",
    mealType: "Breakfast",
    difficulty: "Easy",
    dietTags: ["Vegetarian", "Healthy", "Gluten Free"],
    prepMinutes: 5,
    cookMinutes: 12,
    servings: 2,
    heroHue: 45,
    ingredients: [
      ing("banana", "2 ripe", 2, "", "the spottier the better"),
      ing("oats", "1 cup", 1, "cup", "rolled"),
      ing("egg", "2 large", 2, ""),
      ing("butter", "1 tbsp", 1, "tbsp", "for the pan"),
    ],
    optionalIngredients: [
      ing("cinnamon", "1/2 tsp", 0.5, "tsp"),
      ing("vanilla extract", "1 tsp", 1, "tsp"),
      ing("baking powder", "1/2 tsp", 0.5, "tsp"),
      ing("maple syrup", "to serve", null, ""),
      ing("berries", "to serve", null, ""),
    ],
    steps: [
      {
        number: 1,
        title: "Blend the batter",
        description:
          "Put the bananas, oats, eggs and any optional cinnamon, vanilla or baking powder into a blender. Blend for 30–45 seconds until smooth with just a little texture from the oats remaining.",
        durationMinutes: 2,
      },
      {
        number: 2,
        title: "Let it rest",
        description:
          "Leave the batter to stand for 5 minutes. The oats absorb liquid and the batter thickens noticeably — skip this and the pancakes spread too thin in the pan.",
        durationMinutes: 5,
      },
      {
        number: 3,
        title: "Heat the pan",
        description:
          "Set a non-stick skillet over medium-low heat and add a little butter. Lower heat than you would use for regular pancakes: banana sugars catch quickly and these need time for the centre to set.",
        durationMinutes: 2,
      },
      {
        number: 4,
        title: "Test one first",
        description:
          "Cook a single small test pancake. If it browns before the centre sets, lower the heat; if it takes forever, nudge it up. Every pan runs differently and it is worth one pancake to find out.",
        durationMinutes: 2,
      },
      {
        number: 5,
        title: "Cook in batches",
        description:
          "Drop 2–3 tablespoons of batter per pancake, leaving space between them. Cook for 2–3 minutes until bubbles appear across the surface and the edges look matte and dry.",
        durationMinutes: 3,
      },
      {
        number: 6,
        title: "Flip once",
        description:
          "Slide a thin spatula fully underneath and flip in one confident motion. Cook the second side for 1–2 minutes. Flip only once — these are more delicate than flour pancakes and will tear if you fuss.",
        durationMinutes: 2,
      },
      {
        number: 7,
        title: "Keep them warm",
        description:
          "Stack the finished pancakes on a plate under a clean tea towel while you cook the rest, adding a little more butter to the pan between batches.",
        durationMinutes: 3,
      },
      {
        number: 8,
        title: "Serve",
        description:
          "Serve warm with maple syrup and berries. They are best straight away — without gluten they firm up as they cool.",
        durationMinutes: 1,
      },
    ],
    tips: [
      "Genuinely ripe bananas matter. Yellow ones give you bland, pale pancakes; heavily spotted ones give you sweetness and colour.",
      "Resist flipping early. Wait for bubbles across the whole surface, not just the edges.",
      "Add 1/2 tsp baking powder if you want noticeably taller, fluffier pancakes.",
    ],
    substitutions: [
      { ingredient: "Rolled oats", substitute: "Quick oats, or oat flour (use slightly less)" },
      { ingredient: "Egg", substitute: "2 flax eggs — 2 tbsp ground flaxseed in 6 tbsp water, rested 5 minutes" },
      { ingredient: "Banana", substitute: "3/4 cup unsweetened applesauce plus a little honey" },
      { ingredient: "Butter", substitute: "Coconut oil or any neutral oil" },
    ],
    nutrition: { calories: 342, proteinG: 13, carbsG: 51, fatG: 11, fiberG: 6, sugarG: 15 },
  },
  {
    id: "lentil-soup",
    title: "Golden Lentil Soup",
    description:
      "Red lentils collapse into a thick, silky soup in under half an hour, spiked with cumin and finished with lemon. Cheap, filling, and freezes perfectly.",
    cuisine: "Middle Eastern",
    mealType: "Lunch",
    difficulty: "Easy",
    dietTags: ["Vegetarian", "Vegan", "High Protein", "Healthy", "Dairy Free", "Gluten Free"],
    prepMinutes: 8,
    cookMinutes: 27,
    servings: 4,
    heroHue: 35,
    ingredients: [
      ing("red lentils", "1.5 cups", 1.5, "cup", "rinsed"),
      ing("onion", "1 large", 1, "", "diced"),
      ing("carrot", "2", 2, "", "diced"),
      ing("garlic", "4 cloves", 4, "clove", "minced"),
      ing("cumin", "2 tsp", 2, "tsp", "ground"),
      ing("turmeric", "1 tsp", 1, "tsp"),
      ing("olive oil", "2 tbsp", 2, "tbsp"),
      ing("water", "6 cups", 6, "cup", "or vegetable stock"),
      ing("salt", "to taste", null, ""),
    ],
    optionalIngredients: [
      ing("lemon", "1", 1, "", "juiced"),
      ing("coriander", "handful", null, "", "chopped"),
      ing("chili flakes", "pinch", null, ""),
      ing("yogurt", "to serve", null, ""),
    ],
    steps: [
      {
        number: 1,
        title: "Rinse the lentils",
        description:
          "Rinse the red lentils under cold running water until the water runs clear rather than cloudy. This washes off surface starch and stops the soup turning gluey.",
        durationMinutes: 2,
      },
      {
        number: 2,
        title: "Dice the vegetables",
        description:
          "Dice the onion and carrots small — around 1cm. The smaller they are, the faster they soften and the smoother the finished soup.",
        durationMinutes: 6,
      },
      {
        number: 3,
        title: "Sweat the base",
        description:
          "Heat the olive oil in a large pot over medium heat. Add the onion and carrot with a pinch of salt and cook for 7–8 minutes until soft and the onion is translucent.",
        durationMinutes: 8,
      },
      {
        number: 4,
        title: "Add garlic and spices",
        description:
          "Stir in the garlic, cumin and turmeric and cook for 60 seconds until fragrant. Toasting the spices in the oil now gives a much rounder flavour than adding them to the liquid later.",
        durationMinutes: 1,
      },
      {
        number: 5,
        title: "Add lentils and liquid",
        description:
          "Add the rinsed lentils and stir to coat them in the spiced oil, then pour in the water or stock. Scrape the base of the pot to lift anything stuck.",
        durationMinutes: 2,
      },
      {
        number: 6,
        title: "Simmer",
        description:
          "Bring to a boil, then reduce to a gentle simmer and cook for 20–25 minutes, stirring occasionally, until the lentils have completely broken down and the soup has thickened.",
        durationMinutes: 25,
      },
      {
        number: 7,
        title: "Blend to your liking",
        description:
          "Blend with a stick blender for a silky texture, pulse briefly for something rustic, or leave it entirely as is. Add hot water if it has thickened past what you want.",
        durationMinutes: 2,
      },
      {
        number: 8,
        title: "Season and finish",
        description:
          "Season generously with salt, then add lemon juice a squeeze at a time, tasting as you go. The acid is what lifts the whole thing from heavy to bright — do not skip it.",
        durationMinutes: 2,
      },
      {
        number: 9,
        title: "Serve",
        description:
          "Ladle into bowls, swirl in yogurt if using, and finish with chopped coriander, chili flakes and a thread of olive oil.",
        durationMinutes: 2,
      },
    ],
    tips: [
      "Red lentils need no soaking and break down on their own — do not substitute green or brown ones without adding a lot more time.",
      "The lemon at the end is doing more work than any of the spices. Add it off the heat so it stays bright.",
      "Thickens considerably in the fridge. Loosen with hot water when reheating.",
    ],
    substitutions: [
      { ingredient: "Red lentils", substitute: "Yellow split peas or moong dal; expect a longer cook time" },
      { ingredient: "Lemon", substitute: "Lime, or a splash of white wine vinegar" },
      { ingredient: "Carrot", substitute: "Sweet potato, butternut squash, or parsnip" },
      { ingredient: "Vegetable stock", substitute: "Water plus an extra pinch of salt — the spices carry it" },
    ],
    nutrition: { calories: 312, proteinG: 17, carbsG: 44, fatG: 8, fiberG: 9, sugarG: 5 },
  },
  {
    id: "chocolate-mug-cake",
    title: "90-Second Chocolate Mug Cake",
    description:
      "A single-serving chocolate cake made in a mug in the microwave. Genuinely good rather than merely fast, provided you pull it out the moment it is set.",
    cuisine: "American",
    mealType: "Dessert",
    difficulty: "Easy",
    dietTags: ["Vegetarian"],
    prepMinutes: 3,
    cookMinutes: 2,
    servings: 1,
    heroHue: 20,
    ingredients: [
      ing("flour", "4 tbsp", 4, "tbsp", "all-purpose"),
      ing("sugar", "3 tbsp", 3, "tbsp"),
      ing("cocoa powder", "2 tbsp", 2, "tbsp", "unsweetened"),
      ing("milk", "3 tbsp", 3, "tbsp"),
      ing("oil", "2 tbsp", 2, "tbsp", "neutral"),
      ing("baking powder", "1/4 tsp", 0.25, "tsp"),
      ing("salt", "pinch", null, ""),
    ],
    optionalIngredients: [
      ing("chocolate chips", "1 tbsp", 1, "tbsp"),
      ing("vanilla extract", "1/4 tsp", 0.25, "tsp"),
      ing("ice cream", "to serve", null, ""),
    ],
    steps: [
      {
        number: 1,
        title: "Mix the dry ingredients",
        description:
          "In a large microwave-safe mug, whisk together the flour, sugar, cocoa powder, baking powder and salt with a fork until evenly coloured with no streaks of cocoa.",
        durationMinutes: 1,
      },
      {
        number: 2,
        title: "Add the wet ingredients",
        description:
          "Add the milk, oil and vanilla. Stir until just combined and no dry pockets remain at the bottom — scrape the corners of the mug where flour likes to hide.",
        durationMinutes: 1,
      },
      {
        number: 3,
        title: "Do not overmix",
        description:
          "Stop as soon as the batter is uniform. Overmixing develops gluten and turns the cake rubbery, which in a 90-second bake you cannot correct.",
        durationMinutes: 1,
      },
      {
        number: 4,
        title: "Add chocolate chips",
        description:
          "Drop the chocolate chips on top if using. They sink slightly as it cooks and leave molten pockets through the middle.",
        durationMinutes: 1,
      },
      {
        number: 5,
        title: "Microwave",
        description:
          "Microwave on full power for 70 seconds. Use a mug at least twice the height of the batter — it rises dramatically before settling.",
        durationMinutes: 2,
      },
      {
        number: 6,
        title: "Check and finish",
        description:
          "The top should look set and matte but still slightly damp. If it is visibly wet batter, give it 10 more seconds and check again. Every extra 10 seconds past done makes it noticeably drier.",
        durationMinutes: 1,
      },
      {
        number: 7,
        title: "Rest for a minute",
        description:
          "Let it stand for 60 seconds. It continues cooking from residual heat and firms up — and it is hot enough straight out to burn your mouth.",
        durationMinutes: 1,
      },
      {
        number: 8,
        title: "Serve",
        description:
          "Eat straight from the mug, ideally with a scoop of ice cream melting into the top.",
        durationMinutes: 1,
      },
    ],
    tips: [
      "Undercook rather than overcook. A slightly gooey centre is a feature; a dry mug cake is unsalvageable.",
      "Microwave wattages vary enormously. Find your number once and write it on a sticky note.",
      "Use a genuinely large mug. This rises far more than seems reasonable before it settles back down.",
    ],
    substitutions: [
      { ingredient: "Milk", substitute: "Any plant milk, or water at a slight cost to richness" },
      { ingredient: "Oil", substitute: "Melted butter, for a richer result" },
      { ingredient: "All-purpose flour", substitute: "A 1:1 gluten-free baking blend" },
      { ingredient: "Cocoa powder", substitute: "Drinking chocolate — reduce the sugar to 2 tbsp" },
    ],
    nutrition: { calories: 561, proteinG: 8, carbsG: 78, fatG: 27, fiberG: 6, sugarG: 39 },
  },
];

export const SAMPLE_RECIPE_BY_ID = new Map(SAMPLE_RECIPES.map((r) => [r.id, r]));
