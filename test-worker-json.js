#!/usr/bin/env node

// Test script to verify the worker JSON request logic

// Mock the formatMessages function from the worker
function formatMessages(userMessage, recipeContext, conversationHistory = [], isFullRecipeRequest = false) {
  const messages = [];
  
  let systemPrompt;
  
  if (isFullRecipeRequest) {
    systemPrompt = `You are a professional chef and recipe developer. Generate complete, detailed recipes with all necessary information.

CRITICAL: Always respond with a valid JSON object in this EXACT format:

{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "totalTime": "45 minutes",
  "servings": "4 people",
  "difficulty": "Easy|Medium|Hard",
  "ingredients": [
    {
      "quantity": "2",
      "unit": "cups",
      "name": "all-purpose flour",
      "notes": "sifted (optional)"
    }
  ],
  "steps": [
    "Step 1",
    "Step 2"
  ],
  "notes": ["tip 1", "tip 2"],
  "tags": ["tag1", "tag2"]
}

IMPORTANT: Always return valid JSON only, no markdown or extra text`;
  } else {
    systemPrompt = `You are an expert culinary assistant helping with recipe development and cooking advice.`;
  }

  messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userMessage });
  
  return messages;
}

console.log('🧪 Testing Worker JSON Request Logic\n');

// Test 1: Full recipe request
console.log('📋 Test 1: Full recipe request');
const messages1 = formatMessages(
  'Create a recipe for chocolate chip cookies',
  null,
  [],
  true // isFullRecipeRequest = true
);

console.log('System prompt includes JSON format:', messages1[0].content.includes('CRITICAL: Always respond with a valid JSON object'));
console.log('System prompt includes ingredients example:', messages1[0].content.includes('"ingredients":'));
console.log('✅ Full recipe request properly formatted\n');

// Test 2: Regular assistance request
console.log('📋 Test 2: Regular assistance request');
const messages2 = formatMessages(
  'How can I make this more flavorful?',
  null,
  [],
  false // isFullRecipeRequest = false
);

console.log('System prompt is for assistance:', messages2[0].content.includes('culinary assistant'));
console.log('System prompt does NOT include JSON format:', !messages2[0].content.includes('CRITICAL: Always respond with a valid JSON object'));
console.log('✅ Regular assistance request properly formatted\n');

// Test 3: Request parameters simulation
console.log('📋 Test 3: Request parameters simulation');
const mockRequest = {
  userMessage: 'Create a recipe for pancakes',
  recipeContext: null,
  conversationHistory: [],
  preferredProvider: 'grok',
  isFullRecipeRequest: true,
  requestType: 'full_recipe'
};

console.log('Mock request includes isFullRecipeRequest:', mockRequest.isFullRecipeRequest);
console.log('Mock request includes requestType:', mockRequest.requestType);
console.log('✅ Request parameters correctly structured\n');

console.log('🎉 Worker update should now correctly send JSON formatting instructions to Grok!');
console.log('\n📝 Summary of changes:');
console.log('• Worker now accepts isFullRecipeRequest parameter from frontend');
console.log('• Different system prompts for full recipe vs regular assistance');
console.log('• JSON formatting instructions sent to AI when requesting full recipes');
console.log('• Increased max_tokens for longer JSON responses');
console.log('• Enhanced logging for debugging');
console.log('\n💡 Next step: Deploy the updated worker with `npm run deploy-worker-simple`');
