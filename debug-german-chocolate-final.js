/**
 * Test script to validate German Chocolate Cake ingredient parsing and debugging
 */

console.log('🧁 FINAL TEST: German Chocolate Cake Ingredient Debugging');
console.log('='.repeat(70));

// Create a realistic AI response that mimics what your app receives
const mockAIResponse = `Here's a delicious German Chocolate Cake recipe for you!

{
  "commentary": "This classic German Chocolate Cake is a true showstopper! The cake itself is incredibly moist thanks to the buttermilk, and the coconut-pecan frosting is what makes this dessert truly special. Don't be intimidated by the multiple components - each step is straightforward and the result is absolutely worth it!",
  "title": "Classic German Chocolate Cake",
  "description": "A rich, moist chocolate cake with the famous coconut-pecan frosting and chocolate ganache",
  "prepTime": "45 minutes",
  "cookTime": "35 minutes",
  "totalTime": "2 hours 30 minutes",
  "servings": "12 slices",
  "difficulty": "Medium",
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
      },
      {
        "quantity": "1",
        "unit": "cup",
        "name": "butter",
        "notes": "softened"
      },
      {
        "quantity": "2",
        "unit": "cups",
        "name": "granulated sugar",
        "notes": ""
      },
      {
        "quantity": "4",
        "unit": "",
        "name": "large eggs",
        "notes": "separated"
      },
      {
        "quantity": "1",
        "unit": "tsp",
        "name": "vanilla extract",
        "notes": ""
      },
      {
        "quantity": "1",
        "unit": "cup",
        "name": "buttermilk",
        "notes": ""
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
      },
      {
        "quantity": "1/2",
        "unit": "cup",
        "name": "butter",
        "notes": ""
      },
      {
        "quantity": "1",
        "unit": "tsp",
        "name": "vanilla extract",
        "notes": ""
      },
      {
        "quantity": "1 1/3",
        "unit": "cups",
        "name": "sweetened shredded coconut",
        "notes": ""
      },
      {
        "quantity": "1",
        "unit": "cup",
        "name": "chopped pecans",
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
  "steps": [
    "Preheat oven to 350°F (175°C). Grease and flour three 9-inch round cake pans.",
    "Melt the German chocolate with 1/2 cup water in a double boiler. Let cool.",
    "In a bowl, whisk together flour, baking soda, and salt. Set aside.",
    "Cream butter and sugar until light and fluffy. Beat in egg yolks one at a time.",
    "Mix in melted chocolate and vanilla. Alternate adding dry ingredients and buttermilk.",
    "Beat egg whites until stiff peaks form. Gently fold into batter.",
    "Divide batter among prepared pans. Bake 30-35 minutes until toothpick comes out clean.",
    "Cool completely before frosting."
  ],
  "notes": [
    "Make sure eggs are at room temperature for best results",
    "The coconut-pecan frosting can be made ahead and stored in the refrigerator",
    "This cake actually improves in flavor after a day - store covered at room temperature"
  ]
}`;

console.log('📝 Simulating parsing with your updated debug logic...\n');

// Simulate the JSON extraction and parsing steps
function simulateParsingWithDebug(responseText) {
  console.log('🔍 DEBUG: Response text length:', responseText.length);
  
  // Extract JSON (simulate the logic from parseJsonRecipe)
  let jsonString = responseText.trim();
  
  // Remove any markdown formatting that might wrap the JSON
  jsonString = jsonString.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
  
  // Find JSON object boundaries
  const startIndex = jsonString.indexOf('{');
  const lastIndex = jsonString.lastIndexOf('}');
  
  if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
    jsonString = jsonString.substring(startIndex, lastIndex + 1);
  }
  
  console.log('🔍 DEBUG: Extracted JSON length:', jsonString.length);
  
  // Parse the JSON
  const parsed = JSON.parse(jsonString);
  
  console.log('🔍 DEBUG: Parsed JSON structure:', {
    hasIngredients: !!parsed.ingredients,
    ingredientsType: typeof parsed.ingredients,
    isIngredientsArray: Array.isArray(parsed.ingredients),
    ingredientsKeys: parsed.ingredients && typeof parsed.ingredients === 'object' && !Array.isArray(parsed.ingredients) 
      ? Object.keys(parsed.ingredients) : 'N/A'
  });
  
  // Simulate the ingredient processing logic
  let ingredients = [];
  let ingredientsGrouped = null;
  
  if (parsed.ingredients) {
    if (Array.isArray(parsed.ingredients)) {
      console.log('🔄 Processing ingredients as array format');
      ingredients = parsed.ingredients;
      ingredientsGrouped = null;
    } else if (typeof parsed.ingredients === 'object') {
      console.log('🔄 Processing ingredients as grouped object format');
      console.log('🔍 Groups found:', Object.keys(parsed.ingredients));
      
      // Create flat ingredients with group headers
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
      ingredientsGrouped = parsed.ingredients; // PRESERVE original structure
    }
  }
  
  const result = {
    title: parsed.title || 'AI Generated Recipe',
    description: parsed.description || '',
    commentary: parsed.commentary || '',
    ingredients: ingredients,
    ingredientsGrouped: ingredientsGrouped,
    steps: parsed.steps || [],
    notes: parsed.notes || []
  };
  
  console.log('✅ Final parsed recipe:', {
    title: result.title,
    hasIngredients: result.ingredients && result.ingredients.length > 0,
    hasIngredientsGrouped: !!result.ingredientsGrouped,
    ingredientsGroupedKeys: result.ingredientsGrouped ? Object.keys(result.ingredientsGrouped) : 'null'
  });
  
  return result;
}

// Test the parsing
const parsedRecipe = simulateParsingWithDebug(mockAIResponse);

console.log('\n🎯 Expected Rendering Behavior:');
if (parsedRecipe.ingredientsGrouped) {
  console.log('✅ Should render as GROUPED TABLES');
  console.log('🔍 Groups to render:');
  Object.keys(parsedRecipe.ingredientsGrouped).forEach((groupName, idx) => {
    console.log(`  ${idx + 1}. "${groupName}" table`);
  });
} else {
  console.log('❌ Would render as flat list (this would be the problem)');
}

console.log('\n🚀 Next Steps:');
console.log('1. Run `npm start` to test the app');
console.log('2. Ask AI for a German Chocolate Cake recipe');
console.log('3. Check browser console for debug messages');
console.log('4. Look for:');
console.log('   - "🔄 Processing ingredients as grouped object format"');
console.log('   - "🔍 DEBUG: Rendering grouped ingredients as tables"');
console.log('5. If you see "🔍 DEBUG: Rendering simple ingredient list" instead,');
console.log('   that means ingredientsGrouped is not being set correctly');

console.log('\n💡 Debug Tips:');
console.log('- Open browser dev tools before testing');
console.log('- Look for console.log messages with 🔍 DEBUG prefix');
console.log('- The messages will show exactly what\'s happening in the parsing');
console.log('- If grouped ingredients aren\'t showing, the debug logs will reveal why');
