/**
 * Test to verify JSON extraction from mixed content works correctly
 */

// Test data based on the user's actual message
const testMessage = `There are plenty of delicious vegan recipes that incorporate kale. Here are a few suggestions to get you started:

{
  "suggestions": [
    {
      "title": "Kale and Chickpea Curry",
      "description": "A hearty and flavorful curry made with kale and chickpeas.",
      "difficulty": "Medium",
      "tags": ["vegan", "curry", "kale"]
    },
    {
      "title": "Kale and Quinoa Salad",
      "description": "A nutritious salad featuring kale, quinoa, and a tangy dressing.",
      "difficulty": "Easy",
      "tags": ["vegan", "salad", "healthy"]
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
      "tags": ["vegan", "stuffed-peppers", "rice"]
    }
  ]
}

These recipes offer a variety of ways to enjoy kale in your vegan meals.`;

// Helper function to extract JSON from mixed content (improved version)
const extractJsonFromMixedContent = (text) => {
  console.log('🔍 Trying to extract JSON from text length:', text.length);
  
  // First try to parse as pure JSON
  try {
    const parsed = JSON.parse(text.trim());
    console.log('✅ Successfully parsed as pure JSON');
    return parsed;
  } catch (e) {
    console.log('❌ Not pure JSON, trying to extract from mixed content');
    
    // Look for complete JSON objects - use greedy matching and balanced bracket counting
    let braceCount = 0;
    let startIndex = -1;
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (braceCount === 0) {
          startIndex = i;
        }
        braceCount++;
      } else if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          // Found a complete JSON object
          const jsonCandidate = text.substring(startIndex, i + 1);
          console.log(`🔍 Found potential JSON object:`, jsonCandidate.substring(0, 100) + '...');
          
          try {
            const parsed = JSON.parse(jsonCandidate);
            console.log('✅ Successfully parsed JSON object');
            console.log('🔍 JSON contains suggestions?', parsed.suggestions ? 'YES' : 'NO');
            
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
              console.log('✅ Found valid suggestions array with', parsed.suggestions.length, 'items');
              return parsed;
            }
          } catch (e2) {
            console.log(`❌ Failed to parse JSON candidate:`, e2.message);
          }
        }
      }
    }
  }
  console.log('❌ No valid JSON with suggestions found');
  return null;
};

// Detection function (copied from NewRecipeForm)
const isRecipeSuggestions = (text) => {
  const jsonData = extractJsonFromMixedContent(text.trim());
  if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions) && jsonData.suggestions.length > 0) {
    console.log('🔍 Detected JSON suggestions format with', jsonData.suggestions.length, 'suggestions');
    return true;
  }
  return false;
};

// Parse function (copied from NewRecipeForm)
const parseRecipeSuggestions = (text) => {
  const jsonData = extractJsonFromMixedContent(text);
  if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions)) {
    console.log('🔍 Parsing JSON suggestions format with', jsonData.suggestions.length, 'suggestions');
    return jsonData.suggestions.map(suggestion => ({
      name: suggestion.title || suggestion.name || 'Unnamed Recipe',
      description: suggestion.description || 'No description available',
      difficulty: suggestion.difficulty,
      tags: suggestion.tags
    }));
  }
  return [];
};

console.log('\n🧪 Testing JSON Extraction from Mixed Content...\n');

try {
  // Test 1: Detection
  const isDetected = isRecipeSuggestions(testMessage);
  if (isDetected) {
    console.log('✅ Successfully detected mixed content as recipe suggestions');
  } else {
    throw new Error('Failed to detect mixed content as recipe suggestions');
  }
  
  // Test 2: Parsing
  const parsedSuggestions = parseRecipeSuggestions(testMessage);
  if (parsedSuggestions.length === 5) {
    console.log('✅ Successfully parsed 5 recipe suggestions from mixed content');
  } else {
    throw new Error(`Expected 5 suggestions, got ${parsedSuggestions.length}`);
  }
  
  // Test 3: Validate parsed data structure
  const firstSuggestion = parsedSuggestions[0];
  if (firstSuggestion.name === 'Kale and Chickpea Curry' && 
      firstSuggestion.description.includes('hearty and flavorful') &&
      firstSuggestion.difficulty === 'Medium') {
    console.log('✅ Parsed suggestion data structure is correct');
  } else {
    throw new Error('Parsed suggestion data structure is incorrect');
  }
  
  // Test 4: Show all parsed suggestions
  console.log('\n📋 Parsed Suggestions:');  
  parsedSuggestions.forEach((suggestion, idx) => {
    console.log(`  ${idx + 1}. ${suggestion.name}`);
    console.log(`     Description: ${suggestion.description}`);
    console.log(`     Difficulty: ${suggestion.difficulty}`);
    console.log(`     Tags: ${suggestion.tags ? suggestion.tags.join(', ') : 'None'}`);
    console.log('');
  });
  
  console.log('🎉 All JSON extraction tests passed!');
  console.log('\n📝 Summary:');
  console.log('- Successfully detects JSON in mixed content');
  console.log('- Properly extracts and parses suggestion data');
  console.log('- Handles both commentary and JSON in same message');
  console.log('- Ready for use in chat UX');
  
} catch (error) {
  console.error('\n❌ JSON extraction test failed:', error.message);
  process.exit(1);
}
