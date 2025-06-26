// Test the ingredient parsing function directly
// Since the service is a singleton, let's test the parsing logic independently

function parseIngredientString(ingredientStr) {
  // Parse an ingredient string like "2 cups all-purpose flour, sifted" into structured format
  
  // Clean the string
  const cleaned = ingredientStr.trim();
  
  // Common measurement units
  const units = [
    'cups?', 'cup', 'c\\b',
    'tablespoons?', 'tbsp', 'tbs', 'T\\b',
    'teaspoons?', 'tsp', 't\\b',
    'ounces?', 'oz', 'fl oz',
    'pounds?', 'lbs?', 'lb',
    'grams?', 'g\\b',
    'kilograms?', 'kg',
    'milliliters?', 'ml',
    'liters?', 'l\\b',
    'pints?', 'pt',
    'quarts?', 'qt',
    'gallons?', 'gal',
    'pieces?', 'pcs?',
    'slices?', 'slice',
    'cloves?', 'clove',
    'large', 'medium', 'small',
    'whole', 'half', 'halves',
    'pinch', 'dash', 'sprinkle',
    'inch', 'inches', 'in\\b',
    'can', 'cans', 'jar', 'jars',
    'package', 'packages', 'pkg',
    'bottle', 'bottles',
    'bunch', 'bunches',
    'head', 'heads',
    'stalk', 'stalks',
    'sprig', 'sprigs',
    'leaf', 'leaves'
  ];
  
  // Create regex pattern for units
  const unitPattern = new RegExp(`\\b(${units.join('|')})\\b`, 'i');
  
  // Pattern to match quantity (numbers, fractions, ranges)
  const quantityPattern = /^(\d+(?:[\/\-]\d+)?(?:\.\d+)?(?:\s*-\s*\d+(?:[\/\-]\d+)?(?:\.\d+)?)?|\d+\/\d+|a\s+few|several|some|handful)/i;
  
  try {
    // Match quantity at the beginning
    const quantityMatch = cleaned.match(quantityPattern);
    let quantity = '';
    let remainingText = cleaned;
    
    if (quantityMatch) {
      quantity = quantityMatch[1].trim();
      remainingText = cleaned.substring(quantityMatch[0].length).trim();
    }
    
    // Match unit
    const unitMatch = remainingText.match(unitPattern);
    let unit = '';
    let nameAndNotes = remainingText;
    
    if (unitMatch) {
      unit = unitMatch[1];
      const unitIndex = remainingText.indexOf(unitMatch[0]);
      nameAndNotes = remainingText.substring(unitIndex + unitMatch[0].length).trim();
    }
    
    // Split name and notes (notes are usually after a comma)
    let name = nameAndNotes;
    let notes = '';
    
    if (nameAndNotes.includes(',')) {
      const parts = nameAndNotes.split(',');
      name = parts[0].trim();
      notes = parts.slice(1).join(',').trim();
    } else if (nameAndNotes.includes('(') && nameAndNotes.includes(')')) {
      // Handle parenthetical notes
      const parenMatch = nameAndNotes.match(/^([^(]+)\s*\(([^)]+)\)/);
      if (parenMatch) {
        name = parenMatch[1].trim();
        notes = parenMatch[2].trim();
      }
    }
    
    // Clean up name - remove any leading articles or descriptors that should be in notes
    name = name.replace(/^(of\s+|for\s+)/i, '').trim();
    
    return {
      quantity: quantity || '',
      unit: unit || '',
      name: name || ingredientStr, // Fallback to original string if parsing fails
      notes: notes || ''
    };
    
  } catch (error) {
    console.warn('Failed to parse ingredient string:', ingredientStr, error);
    // Fallback: return as unstructured
    return {
      quantity: '',
      unit: '',
      name: ingredientStr,
      notes: ''
    };
  }
}

// Mock ingredient strings to test parsing
const testIngredients = [
  "2 cups all-purpose flour, sifted",
  "3 large eggs",
  "1/2 cup whole milk",
  "1 tsp vanilla extract",
  "1 pinch salt",
  "6 slices thick bread (day-old preferred)",
  "2 tbsp butter, for cooking",
  "1-2 large onions, diced",
  "3 cloves garlic, minced",
  "1 can tomatoes (14.5 oz)",
  "handful fresh basil leaves",
  "2-3 sprigs thyme",
  "1 medium head cauliflower, cut into florets"
];

console.log('=== Testing Ingredient Parsing ===\n');

// Test each ingredient
testIngredients.forEach((ingredientStr, index) => {
  try {
    console.log(`${index + 1}. Input: "${ingredientStr}"`);
    const parsed = parseIngredientString(ingredientStr);
    console.log(`   Output: quantity="${parsed.quantity}" unit="${parsed.unit}" name="${parsed.name}" notes="${parsed.notes}"`);
    console.log('');
  } catch (error) {
    console.log(`   Error parsing: ${error.message}\n`);
  }
});

console.log('=== Test complete ===');
