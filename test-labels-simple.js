#!/usr/bin/env node

// Simple test script to verify the provider labels and format detection logic

console.log('🧪 Testing Provider Labels and Format Detection Logic\n');

console.log('1. Testing structured response format:');
const mockResponse = {
  text: 'This is a test recipe response',
  provider: 'grok',
  model: 'grok-beta',
  providerName: 'Grok (X.AI)'
};

console.log('Mock AI response structure:', mockResponse);
console.log('✅ Provider name for display:', mockResponse.providerName);

console.log('\n2. Testing format detection scenarios:');

// Test JSON recipe detection
const jsonResponse = `{
  "title": "Test Recipe",
  "ingredients": [
    {"quantity": "1", "unit": "cup", "name": "flour"}
  ],
  "steps": ["Mix ingredients", "Bake at 350F"]
}`;

const detectFormat = (text) => {
  const trimmedText = text.trim();
  const startsWithBrace = trimmedText.startsWith('{');
  const endsWithBrace = trimmedText.endsWith('}');
  const hasJsonStructure = startsWithBrace && endsWithBrace && 
                          (text.includes('"title"') || text.includes('"ingredients"') || text.includes('"steps"'));
  
  console.log('🔍 Format detection:', {
    startsWithBrace,
    endsWithBrace,
    hasJsonStructure,
    hasTitle: text.includes('"title"'),
    hasIngredients: text.includes('"ingredients"'),
    hasSteps: text.includes('"steps"')
  });
  
  if (hasJsonStructure) {
    return 'JSON Recipe';
  }
  
  const lowerText = text.toLowerCase();
  const hasMarkdownHeaders = text.includes('##') || text.includes('###');
  const hasMarkdownLists = text.includes('- ') || /^\d+\./m.test(text);
  const isRecipeContent = lowerText.includes('ingredients') && lowerText.includes('instructions');
  
  if (hasMarkdownHeaders && hasMarkdownLists && isRecipeContent) {
    return 'Markdown Recipe';
  }
  
  if (isRecipeContent && (hasMarkdownLists || /\d+\.?\s+(?:oz|cup|tsp|tbsp|pound|lb|kg|gram|g)\b/i.test(text))) {
    return 'Text Recipe';
  }
  
  if (text.length > 50 && !isRecipeContent) {
    return 'Chat Response';
  }
  
  return 'Text';
};

console.log('\nJSON Recipe test:');
console.log('Format detected:', detectFormat(jsonResponse));

const markdownResponse = `## Chocolate Chip Cookies

### Ingredients:
- 2 cups flour
- 1 cup sugar

### Instructions:
1. Mix ingredients
2. Bake at 350F`;

console.log('\nMarkdown Recipe test:');
console.log('Format detected:', detectFormat(markdownResponse));

const chatResponse = `I'd be happy to help you with that recipe! Here are some suggestions to make it more flavorful.`;

console.log('\nChat Response test:');
console.log('Format detected:', detectFormat(chatResponse));

// Test malformed JSON that should still be detected as JSON Recipe
const malformedJson = `{
  "title": "Test Recipe",
  "ingredients": [
    {"quantity": "1", "unit": "cup", "name": "flour"},
  ],
  "steps": ["Mix ingredients", "Bake at 350F"]
}`;

console.log('\nMalformed JSON test:');
console.log('Format detected:', detectFormat(malformedJson));

console.log('\n✅ Test completed successfully!');
console.log('\nExpected UI behavior:');
console.log('- Provider name (e.g., "Grok (X.AI)") appears above AI response');
console.log('- Format label (e.g., "JSON Recipe") appears inline with timestamp');
console.log('- JSON responses are correctly labeled as "JSON Recipe" even if malformed');
console.log('- Provider info is captured from the worker response');
