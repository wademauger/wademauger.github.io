#!/usr/bin/env node

/**
 * Test script to verify that ingredient quantities are properly handled as numbers
 * - Tests numeric quantity rendering
 * - Tests quantity scaling
 * - Tests grouped ingredient quantity handling
 */

console.log('🧪 Testing ingredient quantity handling (numbers vs strings)...\n');

// Test 1: Numeric quantities (correct)
console.log('✅ Test 1: Numeric Quantities (Expected behavior)');
const numericIngredients = [
  { quantity: 2, unit: 'cups', name: 'flour' },
  { quantity: 0.5, unit: 'tsp', name: 'salt' },
  { quantity: 3.25, unit: 'lbs', name: 'chicken' },
  { quantity: 1, unit: 'large', name: 'egg' }
];

console.log('Original ingredients:', numericIngredients);

// Test scaling with numeric quantities
const scale = 2;
const scaledNumeric = numericIngredients.map(ing => ({
  ...ing,
  scaledQuantity: ing.quantity * scale,
  displayQuantity: (ing.quantity * scale).toFixed(2).replace(/\.?0+$/, ''),
  formattedString: `${(ing.quantity * scale).toFixed(2).replace(/\.?0+$/, '')} ${ing.unit} ${ing.name}`
}));

console.log(`Scaled by ${scale}x:`, scaledNumeric.map(ing => ing.formattedString));
console.log('');

// Test 2: String quantities (incorrect behavior)
console.log('❌ Test 2: String Quantities (Problem behavior)');
const stringIngredients = [
  { quantity: '2', unit: 'cups', name: 'flour' },
  { quantity: '0.5', unit: 'tsp', name: 'salt' },
  { quantity: '3.25', unit: 'lbs', name: 'chicken' },
  { quantity: '1', unit: 'large', name: 'egg' }
];

console.log('Original ingredients:', stringIngredients);

// Test scaling with string quantities - this should fail or produce wrong results
const scaledString = stringIngredients.map(ing => {
  const numericQuantity = parseFloat(ing.quantity);
  const isValidNumber = !isNaN(numericQuantity);
  
  return {
    ...ing,
    parsedQuantity: numericQuantity,
    isValidNumber,
    scaledQuantity: isValidNumber ? numericQuantity * scale : 'NaN',
    displayQuantity: isValidNumber ? (numericQuantity * scale).toFixed(2).replace(/\.?0+$/, '') : 'ERROR',
    formattedString: isValidNumber ? 
      `${(numericQuantity * scale).toFixed(2).replace(/\.?0+$/, '')} ${ing.unit} ${ing.name}` : 
      `ERROR: ${ing.quantity} ${ing.unit} ${ing.name}`
  };
});

console.log(`Scaled by ${scale}x:`, scaledString.map(ing => ing.formattedString));
console.log('');

// Test 3: Grouped ingredients with numeric quantities
console.log('✅ Test 3: Grouped Ingredients with Numeric Quantities');
const groupedIngredients = {
  "Cake": [
    { quantity: 2, unit: 'cups', name: 'all-purpose flour' },
    { quantity: 1.5, unit: 'cups', name: 'sugar' },
    { quantity: 3, unit: 'large', name: 'eggs' }
  ],
  "Frosting": [
    { quantity: 0.5, unit: 'cup', name: 'butter' },
    { quantity: 2, unit: 'cups', name: 'powdered sugar' },
    { quantity: 0.25, unit: 'cup', name: 'cocoa powder' }
  ]
};

console.log('Original grouped ingredients:');
Object.entries(groupedIngredients).forEach(([groupName, ingredients]) => {
  console.log(`${groupName}:`);
  ingredients.forEach(ing => {
    console.log(`  ${ing.quantity} ${ing.unit} ${ing.name}`);
  });
});

console.log(`\nScaled by ${scale}x:`);
Object.entries(groupedIngredients).forEach(([groupName, ingredients]) => {
  console.log(`${groupName}:`);
  ingredients.forEach(ing => {
    const scaledQuantity = (ing.quantity * scale).toFixed(2).replace(/\.?0+$/, '');
    console.log(`  ${scaledQuantity} ${ing.unit} ${ing.name}`);
  });
});
console.log('');

// Test 4: Mixed types (what happens in practice)
console.log('⚠️  Test 4: Mixed Types (Real-world scenario)');
const mixedIngredients = [
  { quantity: 2, unit: 'cups', name: 'flour' },      // number (correct)
  { quantity: '1.5', unit: 'cups', name: 'sugar' },  // string (needs fixing)
  { quantity: 3, unit: 'large', name: 'eggs' },      // number (correct)
  { quantity: '', unit: 'pinch', name: 'salt' },     // empty string (special case)
  { quantity: 0, unit: 'cups', name: 'optional ingredient' } // zero (edge case)
];

console.log('Mixed ingredients processing:');
mixedIngredients.forEach((ing, idx) => {
  const quantityType = typeof ing.quantity;
  const numericQuantity = parseFloat(ing.quantity) || 0;
  const isValidNumber = !isNaN(numericQuantity) && ing.quantity !== '';
  const scaledQuantity = isValidNumber ? numericQuantity * scale : 0;
  const displayQuantity = isValidNumber && scaledQuantity > 0 ? 
    scaledQuantity.toFixed(2).replace(/\.?0+$/, '') : 
    '';
  
  console.log(`  ${idx + 1}. ${ing.name}:`);
  console.log(`     Original: ${ing.quantity} (${quantityType})`);
  console.log(`     Numeric: ${numericQuantity} (valid: ${isValidNumber})`);
  console.log(`     Scaled: ${displayQuantity || 'N/A'} ${ing.unit}`);
  console.log('');
});

// Test 5: Conversion function test
console.log('🔧 Test 5: Quantity Conversion Function');

function convertQuantityToNumber(quantity) {
  if (typeof quantity === 'number') {
    return quantity;
  }
  
  if (typeof quantity === 'string') {
    // Handle empty strings
    if (!quantity.trim()) {
      return 0;
    }
    
    // Handle fractions like "1/2"
    if (quantity.includes('/')) {
      const [numerator, denominator] = quantity.split('/');
      const num = parseFloat(numerator.trim());
      const den = parseFloat(denominator.trim());
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    
    // Handle ranges like "2-3" (take first number)
    if (quantity.includes('-')) {
      const firstNum = quantity.split('-')[0];
      const parsed = parseFloat(firstNum.trim());
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    
    // Handle regular numeric strings
    const parsed = parseFloat(quantity);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return 0; // Default fallback
}

const testQuantities = ['2', 2, '1/2', '2-3', '3.5', '', 0, 'invalid'];
console.log('Conversion test results:');
testQuantities.forEach(q => {
  const converted = convertQuantityToNumber(q);
  console.log(`  ${JSON.stringify(q)} (${typeof q}) → ${converted} (${typeof converted})`);
});

console.log('\n🎯 Summary:');
console.log('✅ Numeric quantities work correctly for scaling and display');
console.log('❌ String quantities require parsing before scaling');
console.log('⚠️  Grouped ingredients need scaling logic implementation');
console.log('🔧 Conversion function handles edge cases properly');
console.log('\n📋 Recommendations:');
console.log('1. Ensure all ingredient quantities are stored as numbers');
console.log('2. Implement scaling for grouped ingredients');
console.log('3. Add quantity conversion in data processing');
console.log('4. Validate quantity types during recipe parsing');
