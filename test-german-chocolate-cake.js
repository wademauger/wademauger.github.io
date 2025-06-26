/**
 * Test script to debug German Chocolate Cake ingredient parsing issue
 */

console.log('🍰 Testing German Chocolate Cake Ingredient Parsing');
console.log('='.repeat(60));

// Simulate the exact German chocolate cake ingredients structure
const testRecipeData = {
  "title": "German Chocolate Cake",
  "ingredients": {
    "For the Cake": [
      {
        "quantity": "2",
        "unit": "cups",
        "name": "all-purpose flour",
        "notes": "sifted"
      },
      {
        "quantity": "1",
        "unit": "tsp",
        "name": "baking soda",
        "notes": ""
      },
      {
        "quantity": "1",
        "unit": "tsp",
        "name": "salt",
        "notes": ""
      },
      {
        "quantity": "4",
        "unit": "oz",
        "name": "German sweet chocolate",
        "notes": "chopped"
      }
    ],
    "For the Coconut-Pecan Frosting": [
      {
        "quantity": "1",
        "unit": "cup",
        "name": "evaporated milk",
        "notes": ""
      },
      {
        "quantity": "1",
        "unit": "cup",
        "name": "granulated sugar",
        "notes": ""
      },
      {
        "quantity": "3",
        "unit": "",
        "name": "large egg yolks",
        "notes": ""
      }
    ],
    "For the Chocolate Ganache": [
      {
        "quantity": "8",
        "unit": "oz",
        "name": "semisweet chocolate",
        "notes": "chopped"
      },
      {
        "quantity": "1",
        "unit": "cup",
        "name": "heavy cream",
        "notes": ""
      }
    ]
  },
  "steps": ["Mix ingredients", "Bake cake", "Make frosting"]
};

console.log('🔍 Original Recipe Data:');
console.log(JSON.stringify(testRecipeData, null, 2));

console.log('\n📋 Analyzing ingredients structure:');
console.log('Is ingredients an array?', Array.isArray(testRecipeData.ingredients));
console.log('Is ingredients an object?', typeof testRecipeData.ingredients === 'object');
console.log('Ingredients keys:', Object.keys(testRecipeData.ingredients));

// Simulate the parsing logic from NewRecipeForm.js
function simulateParseLogic(parsed) {
  let ingredients = [];
  let ingredientsGrouped = null;
  
  if (parsed.ingredients) {
    if (Array.isArray(parsed.ingredients)) {
      console.log('📝 Processing as array format');
      ingredients = parsed.ingredients;
      ingredientsGrouped = null;
    } else if (typeof parsed.ingredients === 'object') {
      console.log('📝 Processing as grouped object format');
      
      // Create flat array with group headers
      const flatIngredients = [];
      Object.entries(parsed.ingredients).forEach(([group, items]) => {
        if (Array.isArray(items)) {
          flatIngredients.push({
            quantity: '',
            unit: '',
            name: `**${group}:**`,
            notes: '',
            isGroupHeader: true
          });
          
          items.forEach(ing => {
            flatIngredients.push({
              quantity: ing.quantity || '',
              unit: ing.unit || '',
              name: ing.name || '',
              notes: ing.notes || ''
            });
          });
        }
      });
      
      ingredients = flatIngredients;
      ingredientsGrouped = parsed.ingredients; // Preserve original structure
    }
  }
  
  return {
    title: parsed.title,
    ingredients: ingredients,
    ingredientsGrouped: ingredientsGrouped,
    steps: parsed.steps
  };
}

const processedRecipe = simulateParseLogic(testRecipeData);

console.log('\n✅ Processed Recipe Structure:');
console.log('Has ingredients array?', processedRecipe.ingredients && processedRecipe.ingredients.length > 0);
console.log('Has ingredientsGrouped?', processedRecipe.ingredientsGrouped !== null);
console.log('IngredientsGrouped keys:', processedRecipe.ingredientsGrouped ? Object.keys(processedRecipe.ingredientsGrouped) : 'null');

console.log('\n📊 Expected Rendering Logic:');
if (processedRecipe.ingredientsGrouped) {
  console.log('✅ Should render as grouped tables');
  Object.entries(processedRecipe.ingredientsGrouped).forEach(([groupName, groupIngredients]) => {
    console.log(`\n--- ${groupName} ---`);
    groupIngredients.forEach((ing, idx) => {
      const qty = [ing.quantity, ing.unit].filter(p => p).join(' ');
      const name = ing.name;
      const notes = ing.notes ? ` (${ing.notes})` : '';
      console.log(`${idx + 1}. ${qty} | ${name}${notes}`);
    });
  });
} else {
  console.log('❌ Would render as flat list');
}

console.log('\n🎯 Issue Diagnosis:');
console.log('The parsing logic looks correct. The issue might be in the rendering condition.');
console.log('Check if currentRecipePreview.ingredientsGrouped is properly set when the recipe is displayed.');
