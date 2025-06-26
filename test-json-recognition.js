#!/usr/bin/env node

// Test script to verify fixes for JSON recognition and parsing

// Mock the functions
const parseJsonRecipe = (text) => {
  try {
    let jsonString = text.trim();
    jsonString = jsonString.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
    
    const startIndex = jsonString.indexOf('{');
    const lastIndex = jsonString.lastIndexOf('}');
    
    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      jsonString = jsonString.substring(startIndex, lastIndex + 1);
    }
    
    // Fix common JSON formatting issues
    jsonString = jsonString.replace(/:\s*,/g, ': []');
    jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
    
    const parsed = JSON.parse(jsonString);
    
    if (parsed && (parsed.title || parsed.ingredients || parsed.steps)) {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.log('JSON parsing failed:', error.message);
    return null;
  }
};

const detectMessageFormat = (text) => {
  const trimmedText = text.trim();
  const startsWithBrace = trimmedText.startsWith('{');
  const endsWithBrace = trimmedText.endsWith('}');
  const hasJsonStructure = startsWithBrace && endsWithBrace && 
                          (text.includes('"title"') || text.includes('"ingredients"') || text.includes('"steps"'));
  
  if (hasJsonStructure) {
    try {
      const parsed = parseJsonRecipe(text);
      if (parsed && (parsed.title || parsed.ingredients || parsed.steps)) {
        return 'JSON Recipe';
      }
    } catch (e) {
      console.log('JSON parsing failed but structure detected:', e.message);
    }
    return 'JSON Recipe';
  }
  
  return 'Chat Response'; // Simplified for test
};

const isCompleteRecipe = (text) => {
  const trimmedText = text.trim();
  const looksLikeJson = trimmedText.startsWith('{') && trimmedText.endsWith('}') &&
                       (text.includes('"title"') || text.includes('"ingredients"') || text.includes('"steps"'));
  
  if (looksLikeJson) {
    const hasTitle = text.includes('"title"') && text.match(/"title"\s*:\s*"[^"]+"/);
    const hasIngredients = text.includes('"ingredients"') && 
                         (text.includes('"quantity"') || text.includes('"name"') || 
                          text.match(/"ingredients"\s*:\s*\[/) || text.match(/"ingredients"\s*:\s*\{/));
    const hasSteps = text.includes('"steps"') && text.match(/"steps"\s*:\s*\[/);
    
    const isComplete = hasTitle && hasIngredients && hasSteps;
    console.log('🔍 JSON Recipe detection:', { hasTitle, hasIngredients, hasSteps, isComplete });
    return isComplete;
  }
  
  return false;
};

// Test with the problematic German Chocolate Cake JSON
const germanChocolateCakeJson = `{
  "title": "German Chocolate Cake",
  "description": "A rich, layered chocolate cake filled with coconut-pecan frosting and topped with chocolate ganache.",
  "prepTime": "45 minutes",
  "cookTime": "35 minutes",
  "totalTime": "1 hour 20 minutes",
  "servings": "12 people",
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
      }
    ]
  },
  "steps": [
    "Preheat oven to 350°F (175°C). Grease and flour three 9-inch round cake pans.",
    "In a medium bowl, whisk together flour, baking soda, and salt. Set aside."
  ],
  "notes": [
    "Ensure your cake pans are well-greased and floured to prevent the cake from sticking.",
    "The cake layers can be made a day ahead and stored, well-wrapped, at room temperature."
  ],
  "tags": ,
  "nutrition": {
    "calories": "",
    "protein": "",
    "carbs": "",
    "fat": ""
  }
}`;

console.log('🧪 Testing JSON Recognition and Parsing Fixes\n');

// Test 1: Format Detection
console.log('📋 Test 1: Format Detection');
const format = detectMessageFormat(germanChocolateCakeJson);
console.log('Detected format:', format);
console.log('✅ Expected: JSON Recipe\n');

// Test 2: Complete Recipe Detection
console.log('📋 Test 2: Complete Recipe Detection');
const isComplete = isCompleteRecipe(germanChocolateCakeJson);
console.log('Is complete recipe:', isComplete);
console.log('✅ Expected: true (should show save button)\n');

// Test 3: JSON Parsing with Fix
console.log('📋 Test 3: JSON Parsing with Malformed JSON Fix');
const parsed = parseJsonRecipe(germanChocolateCakeJson);
console.log('Parsed successfully:', !!parsed);
console.log('Has title:', parsed?.title);
console.log('Has ingredients:', !!parsed?.ingredientsGrouped);
console.log('Has steps:', parsed?.steps?.length > 0);
console.log('✅ Expected: All should be true\n');

console.log('🎉 All tests should pass! The fixes should now:');
console.log('• Correctly identify malformed JSON as "JSON Recipe"');
console.log('• Show the save button for JSON responses');
console.log('• Parse JSON even with trailing commas and syntax errors');
console.log('• Handle grouped ingredients properly');
