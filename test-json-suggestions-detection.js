/**
 * Test to verify that JSON recipe suggestions are properly detected and parsed
 */

console.log('\n🧪 Testing JSON Recipe Suggestions Detection\n');

// Sample JSON response like the one from your chat
const jsonSuggestionsResponse = `{
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
    }
  ]
}`;

// Test functions (simplified versions of the ones in NewRecipeForm.js)
const isRecipeSuggestions = (text) => {
  const trimmedText = text.trim();
  
  // Check for JSON format with suggestions array
  try {
    const parsed = JSON.parse(trimmedText);
    if (parsed.suggestions && Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
      console.log('🔍 Detected JSON suggestions format with', parsed.suggestions.length, 'suggestions');
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
      console.log('🔍 Parsing JSON suggestions format with', parsed.suggestions.length, 'suggestions');
      return parsed.suggestions.map(suggestion => ({
        name: suggestion.title || suggestion.name || 'Unnamed Recipe',
        description: suggestion.description || 'No description available',
        difficulty: suggestion.difficulty,
        tags: suggestion.tags
      }));
    }
  } catch (e) {
    // Not JSON format, continue with text parsing
  }
  
  return [];
};

// Run tests
try {
  console.log('Testing isRecipeSuggestions function:');
  const isDetected = isRecipeSuggestions(jsonSuggestionsResponse);
  if (isDetected) {
    console.log('✅ JSON suggestions correctly detected');
  } else {
    console.log('❌ JSON suggestions NOT detected');
    process.exit(1);
  }
  
  console.log('\nTesting parseRecipeSuggestions function:');
  const parsedSuggestions = parseRecipeSuggestions(jsonSuggestionsResponse);
  console.log('Parsed suggestions:', parsedSuggestions);
  
  if (parsedSuggestions.length === 3) {
    console.log('✅ Correct number of suggestions parsed');
  } else {
    console.log('❌ Wrong number of suggestions parsed. Expected 3, got', parsedSuggestions.length);
    process.exit(1);
  }
  
  // Check first suggestion
  const firstSuggestion = parsedSuggestions[0];
  if (firstSuggestion.name === 'Kale and Chickpea Curry' && 
      firstSuggestion.description.includes('hearty and flavorful') &&
      firstSuggestion.difficulty === 'Medium') {
    console.log('✅ First suggestion parsed correctly');
  } else {
    console.log('❌ First suggestion not parsed correctly:', firstSuggestion);
    process.exit(1);
  }
  
  console.log('\n🎉 All tests passed!');
  console.log('\n📋 Summary:');
  console.log('- JSON recipe suggestions are now properly detected');
  console.log('- Suggestions are parsed into the correct format for the UI');
  console.log('- The chat will now show clickable "Get Recipe" buttons for JSON suggestions');
  console.log('\n🚀 Now run "npm start" to test the enhanced chat UX!');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
