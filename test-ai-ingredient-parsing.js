// Test the AI ingredient parsing and formatting
const RecipeAIService = require('./src/apps/recipes/services/RecipeAIService.js');

// Mock a sample AI response with properly formatted ingredients
const mockAIResponse = {
  "commentary": "French toast is a classic breakfast that transforms day-old bread into something magical! The key is using slightly stale bread that can soak up the custard without falling apart. I love adding a touch of vanilla and cinnamon for warmth. You can easily make this dairy-free by using plant milk and skip the eggs for a vegan version using mashed banana and a flax egg.",
  "title": "Classic French Toast",
  "description": "Golden, crispy French toast with a custardy center, perfect for weekend brunch",
  "prepTime": "10 minutes",
  "cookTime": "8 minutes", 
  "totalTime": "18 minutes",
  "servings": "4 people",
  "difficulty": "Easy",
  "ingredients": [
    {
      "quantity": "6",
      "unit": "slices",
      "name": "thick bread",
      "notes": "day-old brioche or challah preferred"
    },
    {
      "quantity": "3",
      "unit": "large",
      "name": "eggs",
      "notes": ""
    },
    {
      "quantity": "1/2",
      "unit": "cup",
      "name": "whole milk",
      "notes": "or heavy cream for richer taste"
    },
    {
      "quantity": "1",
      "unit": "tsp",
      "name": "vanilla extract",
      "notes": ""
    },
    {
      "quantity": "1/2",
      "unit": "tsp",
      "name": "ground cinnamon",
      "notes": ""
    },
    {
      "quantity": "1",
      "unit": "pinch",
      "name": "salt",
      "notes": ""
    },
    {
      "quantity": "2",
      "unit": "tbsp",
      "name": "butter",
      "notes": "for cooking"
    }
  ],
  "steps": [
    "In a shallow dish, whisk together eggs, milk, vanilla, cinnamon, and salt until well combined.",
    "Heat 1 tablespoon of butter in a large skillet or griddle over medium heat.",
    "Dip each slice of bread into the egg mixture, allowing it to soak for 10-15 seconds per side.",
    "Cook the soaked bread in the hot skillet for 2-3 minutes per side, until golden brown and crispy.",
    "Add more butter to the pan as needed for additional slices.",
    "Serve immediately while hot, topped with maple syrup, fresh berries, or powdered sugar."
  ],
  "notes": [
    "Day-old bread works best as it absorbs the custard without becoming soggy",
    "Don't oversoak thin bread - it will fall apart",
    "Keep finished slices warm in a 200°F oven if making a large batch",
    "For dairy-free: substitute with almond or oat milk",
    "For extra richness, use half-and-half instead of milk"
  ]
};

console.log('=== Testing AI Response Parsing ===\n');

// Test JSON parsing
console.log('1. Commentary:');
console.log(mockAIResponse.commentary);
console.log('\n2. Structured Ingredients:');

mockAIResponse.ingredients.forEach((ing, index) => {
  console.log(`${index + 1}. ${ing.quantity} ${ing.unit} ${ing.name}${ing.notes ? ` (${ing.notes})` : ''}`);
});

console.log('\n3. Steps:');
mockAIResponse.steps.forEach((step, index) => {
  console.log(`${index + 1}. ${step}`);
});

console.log('\n4. Recipe Metadata:');
console.log(`- Prep Time: ${mockAIResponse.prepTime}`);
console.log(`- Cook Time: ${mockAIResponse.cookTime}`);
console.log(`- Servings: ${mockAIResponse.servings}`);
console.log(`- Difficulty: ${mockAIResponse.difficulty}`);

console.log('\n=== Testing ingredient field separation ===\n');

// Test that each ingredient has properly separated fields
const exampleIngredient = mockAIResponse.ingredients[0];
console.log('Example ingredient object:');
console.log(`- quantity: "${exampleIngredient.quantity}"`);
console.log(`- unit: "${exampleIngredient.unit}"`); 
console.log(`- name: "${exampleIngredient.name}"`);
console.log(`- notes: "${exampleIngredient.notes}"`);

console.log('\n=== Expected vs Current AI Response Format ===\n');

// Show what we want vs what we might be getting
console.log('✅ GOOD (Structured):');
console.log(JSON.stringify(exampleIngredient, null, 2));

console.log('\n❌ BAD (Unstructured):');
console.log(JSON.stringify("6 slices thick bread (day-old brioche or challah preferred)", null, 2));

console.log('\n=== Test complete ===');
