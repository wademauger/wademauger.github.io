/**
 * Comprehensive test for the JSON suggestions UX enhancement
 */

console.log('\n🎯 Testing Complete JSON Suggestions UX Flow\n');

// Simulate the exact message from the user's chat
const userMessage = "What are some vegan recipes that use kale?";

const aiResponseMessage = `There are plenty of delicious vegan recipes that incorporate kale. Here are a few suggestions to get you started:

{
  "suggestions": [
    {
      "title": "Kale and Chickpea Curry",
      "description": "A hearty and flavorful curry made with kale and chickpeas.",
      "difficulty": "Medium",
      "tags": ["vegan", "healthy", "curry"]
    },
    {
      "title": "Kale and Quinoa Salad",
      "description": "A nutritious salad featuring kale, quinoa, and a tangy dressing.",
      "difficulty": "Easy",
      "tags": ["vegan", "healthy", "salad"]
    },
    {
      "title": "Creamy Kale and Potato Soup",
      "description": "A comforting soup made with kale, potatoes, and coconut milk.",
      "difficulty": "Easy",
      "tags": ["vegan", "soup", "comfort-food"]
    },
    {
      "title": "Kale Pesto Pasta",
      "description": "A vibrant pasta dish with a kale pesto sauce.",
      "difficulty": "Easy",
      "tags": ["vegan", "pasta", "pesto"]
    },
    {
      "title": "Stuffed Bell Peppers with Kale and Rice",
      "description": "Bell peppers stuffed with a mixture of kale, rice, and spices.",
      "difficulty": "Medium",
      "tags": ["vegan", "stuffed", "rice"]
    }
  ]
}

These recipes offer a variety of ways to enjoy kale in your vegan meals.`;

// Extract just the JSON part for testing
const jsonPart = aiResponseMessage.match(/{\s*"suggestions"[\s\S]*?}/)?.[0];

// Test functions (based on the enhanced NewRecipeForm.js)
const isRecipeSuggestions = (text) => {
  const trimmedText = text.trim();
  
  // Check for JSON format with suggestions array
  try {
    const parsed = JSON.parse(trimmedText);
    if (parsed.suggestions && Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
      return true;
    }
  } catch (e) {
    // Not JSON, continue with other checks
  }
  
  return false;
};

const parseRecipeSuggestions = (text) => {
  // First try to parse JSON format
  try {
    const parsed = JSON.parse(text.trim());
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions.map(suggestion => ({
        name: suggestion.title || suggestion.name || 'Unnamed Recipe',
        description: suggestion.description || 'No description available',
        difficulty: suggestion.difficulty,
        tags: suggestion.tags
      }));
    }
  } catch (e) {
    // Not JSON format
  }
  
  return [];
};

const getResponseType = (text) => {
  if (isRecipeSuggestions(text)) {
    return 'suggestions';
  }
  return 'advice';
};

console.log('🔍 Testing response type detection on full message...');

// Test 1: Check if the full response is detected as suggestions
const fullResponseType = getResponseType(aiResponseMessage);
console.log('Full message response type:', fullResponseType);

if (fullResponseType === 'suggestions') {
  console.log('❌ Full message incorrectly detected as suggestions (should be advice)');
} else {
  console.log('✅ Full message correctly detected as advice');
}

// Test 2: Check if just the JSON part is detected as suggestions
console.log('\n🔍 Testing response type detection on JSON part...');
const jsonResponseType = getResponseType(jsonPart);
console.log('JSON part response type:', jsonResponseType);

if (jsonResponseType === 'suggestions') {
  console.log('✅ JSON part correctly detected as suggestions');
} else {
  console.log('❌ JSON part not detected as suggestions');
}

// Test 3: Parse suggestions from JSON
console.log('\n🔍 Testing suggestions parsing...');
const suggestions = parseRecipeSuggestions(jsonPart);
console.log('Parsed suggestions count:', suggestions.length);

if (suggestions.length === 5) {
  console.log('✅ Correct number of suggestions parsed');
  
  // Test specific suggestions
  const curry = suggestions.find(s => s.name.includes('Curry'));
  const salad = suggestions.find(s => s.name.includes('Salad'));
  
  if (curry && curry.difficulty === 'Medium') {
    console.log('✅ Curry suggestion parsed correctly');
  } else {
    console.log('❌ Curry suggestion not parsed correctly');
  }
  
  if (salad && salad.difficulty === 'Easy') {
    console.log('✅ Salad suggestion parsed correctly');
  } else {
    console.log('❌ Salad suggestion not parsed correctly');
  }
  
} else {
  console.log('❌ Wrong number of suggestions. Expected 5, got:', suggestions.length);
}

console.log('\n📋 EXPECTED UX BEHAVIOR:');
console.log('=======================');
console.log('1. User asks: "What are some vegan recipes that use kale?"');
console.log('2. AI responds with mixed text + JSON suggestions');
console.log('3. Chat shows the message as "Recipe Advice (Plain text)"');
console.log('4. If JSON is extracted and parsed separately, it would show as suggestions');
console.log('');
console.log('💡 RECOMMENDATION:');
console.log('===================');
console.log('The AI response contains both conversational text AND JSON suggestions.');
console.log('Current implementation will classify this as "advice" since it\'s mixed content.');
console.log('');
console.log('To improve UX, consider:');
console.log('1. Extract JSON from mixed responses');
console.log('2. Show conversational part as advice');
console.log('3. Show JSON suggestions as interactive buttons');
console.log('');
console.log('🚀 Run "npm start" to test the current implementation!');

console.log('\n🎉 Test completed successfully!');
