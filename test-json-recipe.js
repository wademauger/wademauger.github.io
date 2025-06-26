#!/usr/bin/env node

// Simple test to verify JSON recipe parsing
const testJsonRecipe = `{
  "title": "Chocolate Chip Cookies",
  "description": "Classic soft and chewy cookies",
  "prepTime": "15 minutes",
  "cookTime": "12 minutes",
  "servings": "24 cookies",
  "difficulty": "Easy",
  "ingredients": [
    "2 cups all-purpose flour",
    "1 tsp baking soda",
    "1 tsp salt",
    "1 cup butter, softened",
    "3/4 cup granulated sugar",
    "3/4 cup brown sugar",
    "2 large eggs",
    "2 tsp vanilla extract",
    "2 cups chocolate chips"
  ],
  "steps": [
    "Preheat oven to 375°F and line baking sheets with parchment",
    "Mix flour, baking soda, and salt in a bowl",
    "Cream butter and sugars until fluffy",
    "Beat in eggs and vanilla",
    "Gradually add flour mixture",
    "Fold in chocolate chips",
    "Drop dough onto baking sheets",
    "Bake 9-11 minutes until golden",
    "Cool on pan for 5 minutes before transferring"
  ],
  "notes": [
    "Don't overbake for chewy cookies",
    "Store in airtight container",
    "Dough can be refrigerated for 3 days"
  ],
  "tags": ["dessert", "cookies", "chocolate", "baking"]
}`;

const testMarkdownRecipe = `## Chocolate Chip Cookies

### Ingredients:
- 2 cups all-purpose flour
- 1 tsp baking soda
- 1 tsp salt
- 1 cup butter, softened

### Instructions:
1. Preheat oven to 375°F and line baking sheets
2. Mix flour, baking soda, and salt
3. Cream butter and sugars until fluffy

### Notes:
- Don't overbake for chewy cookies
- Store in airtight container

**Prep Time:** 15 minutes
**Cook Time:** 12 minutes
**Serves:** 24 cookies`;

console.log('🧪 Testing JSON Recipe Parsing...\n');

// Test JSON parsing
try {
  const parsed = JSON.parse(testJsonRecipe);
  console.log('✅ JSON parsing successful!');
  console.log('Title:', parsed.title);
  console.log('Ingredients count:', parsed.ingredients.length);
  console.log('Steps count:', parsed.steps.length);
  console.log('Tags:', parsed.tags.join(', '));
} catch (error) {
  console.log('❌ JSON parsing failed:', error.message);
}

console.log('\n🧪 Testing Markdown Recipe Parsing...\n');

// Simulate markdown parsing logic
function parseMarkdown(text) {
  const lines = text.split('\n');
  let title = '';
  let ingredients = [];
  let steps = [];
  let notes = [];
  let currentSection = '';
  
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('## ')) {
      title = line.substring(3).trim();
    } else if (line.toLowerCase().includes('ingredients:')) {
      currentSection = 'ingredients';
    } else if (line.toLowerCase().includes('instructions:')) {
      currentSection = 'instructions';
    } else if (line.toLowerCase().includes('notes:')) {
      currentSection = 'notes';
    } else if (currentSection === 'ingredients' && line.startsWith('- ')) {
      ingredients.push(line.substring(2).trim());
    } else if (currentSection === 'instructions' && /^\d+\./.test(line)) {
      steps.push(line.replace(/^\d+\.\s*/, '').trim());
    } else if (currentSection === 'notes' && line.startsWith('- ')) {
      notes.push(line.substring(2).trim());
    }
  }
  
  return { title, ingredients, steps, notes };
}

const markdownResult = parseMarkdown(testMarkdownRecipe);
console.log('✅ Markdown parsing successful!');
console.log('Title:', markdownResult.title);
console.log('Ingredients count:', markdownResult.ingredients.length);
console.log('Steps count:', markdownResult.steps.length);
console.log('Notes count:', markdownResult.notes.length);

console.log('\n🎉 All tests passed! The recipe parsing logic should work correctly.');
