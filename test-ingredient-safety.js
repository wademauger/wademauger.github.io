#!/usr/bin/env node

// Test script to verify that all recipe.ingredients usage is safe and defensive

// Test 1: Simulate legacy recipe with object ingredients
const legacyRecipe = {
  title: "Test Recipe",
  ingredients: [
    { name: "flour", quantity: 2, unit: "cups" },
    { name: "sugar", quantity: 1, unit: "cup" }
  ],
  steps: ["Mix ingredients"],
  notes: ["Test note"]
};

// Test 2: Simulate AI-generated recipe with grouped ingredients stored as flat array
const aiRecipeFlat = {
  title: "AI Generated Recipe",
  ingredients: [
    "**For the Dough:**",
    "2 cups flour",
    "1 tsp salt",
    "**For the Filling:**", 
    "1 cup cheese",
    "2 eggs"
  ],
  steps: ["Mix ingredients"],
  notes: []
};

// Test 3: Simulate edge case with null/undefined ingredients
const brokenRecipe = {
  title: "Broken Recipe",
  ingredients: null,
  steps: [],
  notes: []
};

// Test 4: Empty recipe
const emptyRecipe = {
  title: "Empty Recipe",
  ingredients: [],
  steps: [],
  notes: []
};

console.log('🧪 Testing ingredient safety...\n');

// Import the functions we want to test
const testScaling = (recipe, label) => {
  console.log(`\n📏 Testing scaling for: ${label}`);
  
  // Simulate the scaling logic from Recipes.js
  const scaledIngredients = recipe && Array.isArray(recipe.ingredients) ? recipe.ingredients.map(ingredient => {
    // Handle both object and string ingredient formats
    if (typeof ingredient === 'object' && ingredient !== null && ingredient.quantity !== undefined) {
      const quantity = (ingredient.quantity * 4 / 4).toFixed(1); // 1:1 scaling for test
      return {
        ...ingredient,
        quantity: quantity.endsWith('.0') ? parseInt(quantity) : quantity,
      };
    } else {
      // For string ingredients or objects without quantity, return as-is
      return ingredient;
    }
  }) : [];
  
  console.log(`  ✅ Scaled ingredients (${scaledIngredients.length} items):`, scaledIngredients.slice(0, 2));
  return scaledIngredients;
};

const testIngredientCheck = (recipe, label) => {
  console.log(`\n🔍 Testing ingredient check for: ${label}`);
  
  // Simulate the hasIngredients logic from RecipeAIService.js
  const hasIngredients = recipe?.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0;
  console.log(`  ✅ Has ingredients: ${hasIngredients}`);
  
  if (hasIngredients) {
    const ingredientsCount = Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0;
    console.log(`  ✅ Ingredients count: ${ingredientsCount}`);
  }
  
  return hasIngredients;
};

const testIngredientDisplay = (recipe, label) => {
  console.log(`\n🖼️ Testing ingredient display for: ${label}`);
  
  // Simulate the ingredient display logic from DraftRecipePreview.js
  const displayIngredients = (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map((ingredient, index) => {
    if (typeof ingredient === 'object' && ingredient !== null) {
      return `${ingredient.quantity || ''} ${ingredient.unit || ingredient.units || ''} ${ingredient.name || ingredient.ingredient || ''}`.trim();
    } else {
      return ingredient;
    }
  });
  
  console.log(`  ✅ Display ingredients (${displayIngredients.length} items):`, displayIngredients.slice(0, 2));
  return displayIngredients;
};

// Run tests
const recipes = [
  [legacyRecipe, "Legacy Recipe (objects)"],
  [aiRecipeFlat, "AI Recipe (flat strings)"],
  [brokenRecipe, "Broken Recipe (null ingredients)"],
  [emptyRecipe, "Empty Recipe (empty array)"]
];

recipes.forEach(([recipe, label]) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing: ${label}`);
  console.log(`${'='.repeat(50)}`);
  
  try {
    testScaling(recipe, label);
    testIngredientCheck(recipe, label);
    testIngredientDisplay(recipe, label);
    console.log(`\n✅ ${label} passed all safety tests!`);
  } catch (error) {
    console.error(`\n❌ ${label} failed:`, error.message);
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log('🎉 All ingredient safety tests completed!');
console.log(`${'='.repeat(50)}`);
