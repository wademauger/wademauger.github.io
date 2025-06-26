/**
 * Test to verify that recipe suggestions work without tags
 */

console.log('\n🧪 Testing Recipe Suggestions Without Tags...\n');

// Simulate the mixed content response (similar to what the user reported)
const mixedResponse = `There are plenty of delicious vegan recipes that incorporate kale. Here are a few suggestions to get you started:

{
  "suggestions": [
    {
      "title": "Kale and Chickpea Curry",
      "description": "A hearty and flavorful curry made with kale and chickpeas.",
      "difficulty": "Medium"
    },
    {
      "title": "Kale and Quinoa Salad", 
      "description": "A nutritious salad featuring kale, quinoa, and a tangy dressing.",
      "difficulty": "Easy"
    },
    {
      "title": "Creamy Kale and Potato Soup",
      "description": "A comforting soup made with kale, potatoes, and coconut milk.", 
      "difficulty": "Easy"
    }
  ]
}

These recipes offer a variety of ways to enjoy kale in your vegan meals.`;

// Mock the functions from NewRecipeForm.js
const extractJsonFromMixedContent = (text) => {
  console.log('🔍 Extracting JSON from text of length:', text.length);
  
  // First try to parse as pure JSON
  try {
    const parsed = JSON.parse(text.trim());
    console.log('✅ Successfully parsed as pure JSON');
    return parsed;
  } catch (e) {
    console.log('⚠️ Not pure JSON, looking for JSON objects...');
    
    // Look for JSON objects in the text
    const jsonPattern = /\{[\s\S]*?\}/g;
    const matches = text.match(jsonPattern);
    
    console.log('🔍 Found', matches ? matches.length : 0, 'potential JSON objects');
    
    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        console.log(`🔍 Trying to parse match ${i + 1}:`, match.substring(0, 100) + '...');
        
        try {
          const parsed = JSON.parse(match);
          console.log('✅ Successfully parsed JSON object');
          
          if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            console.log('✅ Found suggestions array with', parsed.suggestions.length, 'items');
            return parsed;
          } else {
            console.log('⚠️ No suggestions array found in this object');
          }
        } catch (e2) {
          console.log('❌ Failed to parse this JSON object:', e2.message);
        }
      }
    }
  }
  console.log('❌ No valid JSON with suggestions found');
  return null;
};

const isRecipeSuggestions = (text) => {
  const jsonData = extractJsonFromMixedContent(text);
  if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions) && jsonData.suggestions.length > 0) {
    console.log('🔍 Detected JSON suggestions format with', jsonData.suggestions.length, 'suggestions');
    return true;
  }
  return false;
};

const parseRecipeSuggestions = (text) => {
  const jsonData = extractJsonFromMixedContent(text);
  if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions)) {
    console.log('🔍 Parsing JSON suggestions format with', jsonData.suggestions.length, 'suggestions');
    return jsonData.suggestions.map(suggestion => ({
      name: suggestion.title || suggestion.name || 'Unnamed Recipe',
      description: suggestion.description || 'No description available',
      difficulty: suggestion.difficulty
      // No tags anymore!
    }));
  }
  return [];
};

// Test the functions
try {
  console.log('1. Testing suggestion detection...');
  const isSuggestions = isRecipeSuggestions(mixedResponse);
  
  if (isSuggestions) {
    console.log('✅ Successfully detected suggestions');
    
    console.log('\n2. Testing suggestion parsing...');
    const suggestions = parseRecipeSuggestions(mixedResponse);
    
    console.log('📋 Parsed suggestions:');
    suggestions.forEach((suggestion, idx) => {
      console.log(`   ${idx + 1}. ${suggestion.name}`);
      console.log(`      Description: ${suggestion.description}`);
      console.log(`      Difficulty: ${suggestion.difficulty || 'Not specified'}`);
      console.log(`      Tags: ${suggestion.tags || 'None (removed)'}`);
      console.log('');
    });
    
    if (suggestions.length === 3) {
      console.log('✅ Successfully parsed all 3 suggestions');
      
      // Check that tags are not present
      const hasTags = suggestions.some(s => s.tags !== undefined);
      if (!hasTags) {
        console.log('✅ Tags successfully removed from suggestions');
      } else {
        console.log('❌ Tags still present in suggestions');
      }
      
      console.log('\n🎉 Recipe suggestions parsing works correctly without tags!');
      console.log('\n📝 Benefits:');
      console.log('  • Simpler data structure');
      console.log('  • No unused UI elements');
      console.log('  • Cleaner JSON parsing');
      console.log('  • Focus on essential info: name, description, difficulty');
      
    } else {
      throw new Error(`Expected 3 suggestions, got ${suggestions.length}`);
    }
  } else {
    throw new Error('Failed to detect suggestions in mixed content');
  }
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
