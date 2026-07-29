/**
 * Autocomplete vocabulary for the ingredient input.
 *
 * Intentionally a static list rather than an API call: suggestions need to feel
 * instant as the user types, and the set of things people have in their kitchen
 * is small and stable enough that shipping it in the bundle is cheaper than a
 * round trip.
 */

export const COMMON_INGREDIENTS = [
  // Vegetables
  "Tomato", "Onion", "Garlic", "Potato", "Carrot", "Bell pepper", "Broccoli",
  "Spinach", "Mushroom", "Zucchini", "Eggplant", "Cauliflower", "Cabbage",
  "Cucumber", "Lettuce", "Celery", "Corn", "Peas", "Green beans", "Kale",
  "Sweet potato", "Pumpkin", "Beetroot", "Scallion", "Leek", "Asparagus",
  "Brussels sprouts", "Radish", "Okra", "Chili",

  // Fruit
  "Lemon", "Lime", "Banana", "Apple", "Orange", "Avocado", "Mango",
  "Strawberry", "Blueberry", "Pineapple", "Grape", "Peach", "Pear",
  "Coconut", "Raisin", "Date",

  // Protein
  "Chicken", "Chicken breast", "Chicken thigh", "Beef", "Ground beef", "Pork",
  "Bacon", "Sausage", "Lamb", "Turkey", "Egg", "Fish", "Salmon", "Tuna",
  "Shrimp", "Tofu", "Paneer", "Tempeh",

  // Legumes and grains
  "Rice", "Pasta", "Bread", "Flour", "Oats", "Quinoa", "Couscous", "Noodles",
  "Tortilla", "Black beans", "Chickpea", "Red lentils", "Green lentils",
  "Kidney beans", "White beans", "Breadcrumbs",

  // Dairy
  "Milk", "Butter", "Cheese", "Cheddar", "Mozzarella", "Parmesan", "Feta",
  "Yogurt", "Cream", "Sour cream", "Cream cheese", "Ricotta",

  // Pantry and condiments
  "Olive oil", "Oil", "Salt", "Black pepper", "Sugar", "Honey", "Maple syrup",
  "Soy sauce", "Vinegar", "Balsamic vinegar", "Mustard", "Ketchup", "Mayonnaise",
  "Hot sauce", "Tomato paste", "Coconut milk", "Stock", "Peanut butter",
  "Sesame oil", "Cornstarch", "Baking powder", "Baking soda", "Vanilla extract",
  "Cocoa powder", "Chocolate chips", "Nuts", "Almonds", "Peanut", "Cashew",
  "Sesame seeds", "Yeast",

  // Herbs and spices
  "Basil", "Coriander", "Parsley", "Mint", "Rosemary", "Thyme", "Oregano",
  "Dill", "Sage", "Bay leaf", "Cumin", "Turmeric", "Paprika", "Cinnamon",
  "Ginger", "Nutmeg", "Cardamom", "Cloves", "Chili powder", "Chili flakes",
  "Curry powder", "Garam masala", "Mustard seeds", "Coriander seeds",
] as const;

/**
 * Rank suggestions for a partial query.
 *
 * Prefix matches sort above substring matches, so typing "on" surfaces "Onion"
 * before "Lemon" — which is what the user almost certainly meant.
 */
export function suggestIngredients(
  query: string,
  exclude: string[] = [],
  limit = 8,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const taken = new Set(exclude.map((e) => e.trim().toLowerCase()));
  const prefix: string[] = [];
  const contains: string[] = [];

  for (const ingredient of COMMON_INGREDIENTS) {
    const lower = ingredient.toLowerCase();
    if (taken.has(lower)) continue;
    if (lower.startsWith(q)) prefix.push(ingredient);
    else if (lower.includes(q)) contains.push(ingredient);
    if (prefix.length >= limit) break;
  }

  return [...prefix, ...contains].slice(0, limit);
}
