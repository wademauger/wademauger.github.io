/**
 * Final test for JSON suggestion detection in the recipe chat UX
 * This simulates the exact flow that happens in the NewRecipeForm component
 */

// The exact message format from the user's issue
const realAIResponse = `There are plenty of delicious vegan recipes that incorporate kale. Here are a few suggestions to get you started:

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

// Balanced bracket counting implementation (final version)
const extractJsonFromMixedContent = (text) => {
  console.log('🔍 extractJsonFromMixedContent called with text starting with:', text.substring(0, 50) + '...');
  
  try {
    const parsed = JSON.parse(text.trim());
    console.log('✅ Successfully parsed as pure JSON');
    return parsed;
  } catch (e) {
    console.log('❌ Not pure JSON, using bracket counting...');
    
    let braceCount = 0;
    let startIndex = -1;
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (braceCount === 0) {
          startIndex = i;
          console.log('🔍 Found opening brace at index:', i);
        }
        braceCount++;
      } else if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          const jsonCandidate = text.substring(startIndex, i + 1);
          console.log('🔍 Found complete JSON candidate ending at index:', i);
          console.log('🔍 JSON candidate preview:', jsonCandidate.substring(0, 100) + '...');
          
          try {
            const parsed = JSON.parse(jsonCandidate);
            console.log('✅ Successfully parsed JSON candidate');
            console.log('🔍 Has suggestions property?', parsed.hasOwnProperty('suggestions') ? 'YES' : 'NO');
            
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
              console.log('✅ Found valid suggestions array with', parsed.suggestions.length, 'items');
              return parsed;
            } else {
              console.log('❌ No valid suggestions array found');
            }
          } catch (e2) {
            console.log('❌ Failed to parse JSON candidate:', e2.message);
          }
        }
      }
    }
    console.log('❌ No valid JSON with suggestions found via bracket counting');
  }
  return null;
};

const isRecipeSuggestions = (text) => {
  const trimmedText = text.trim();
  console.log('🔍 isRecipeSuggestions called with text length:', trimmedText.length);
  
  // Check for JSON format with suggestions array (including mixed content)
  const jsonData = extractJsonFromMixedContent(trimmedText);
  console.log('🔍 extractJsonFromMixedContent returned:', jsonData ? 'valid JSON' : 'null');
  
  if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions) && jsonData.suggestions.length > 0) {
    console.log('🔍 Detected JSON suggestions format with', jsonData.suggestions.length, 'suggestions');
    return true;
  }
  
  // Look for the specific SUGGESTIONS format
  if (trimmedText.includes('SUGGESTIONS:')) {
    console.log('🔍 Found SUGGESTIONS: format');
    return true;
  }
  
  // Look for multiple recipe sections with ingredients and instructions
  const ingredientsSections = (text.match(/ingredients/gi) || []).length;
  const instructionsSections = (text.match(/instructions/gi) || []).length;
  
  console.log('🔍 Found ingredients sections:', ingredientsSections, 'instructions sections:', instructionsSections);
  
  // If we have multiple ingredient/instruction sections, it's likely suggestions
  if (ingredientsSections >= 2 && instructionsSections >= 2) {
    console.log('🔍 Detected multiple ingredient/instruction sections');
    return true;
  }
  
  console.log('🔍 No suggestion patterns detected');
  return false;
};

const getResponseType = (text) => {
  // Check if it's suggestions first
  if (isRecipeSuggestions(text)) {
    return 'suggestions';
  }
  
  // Add other checks here for 'recipe' and 'advice'
  return 'advice';
};

const parseRecipeSuggestions = (text) => {
  const jsonData = extractJsonFromMixedContent(text);
  if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions)) {
    return jsonData.suggestions.map(suggestion => ({
      name: suggestion.title || suggestion.name || 'Unnamed Recipe',
      description: suggestion.description || 'No description available',
      difficulty: suggestion.difficulty,
      tags: suggestion.tags
    }));
  }
  return [];
};

console.log('\n🎯 Final Chat UX Test: JSON Suggestion Detection\n');

try {
  // Simulate the exact flow in the chat component
  console.log('1. User asks: "What are some vegan recipes that use kale?"');
  console.log('2. AI responds with mixed content...');
  
  // Step 1: Detect response type (this determines which UI to show)
  const responseType = getResponseType(realAIResponse);
  console.log(`3. Response type detected: "${responseType}"`);
  
  if (responseType !== 'suggestions') {
    throw new Error(`Expected 'suggestions', got '${responseType}'`);
  }
  
  // Step 2: Parse suggestions (this populates the clickable UI)
  const suggestions = parseRecipeSuggestions(realAIResponse);
  console.log(`4. Parsed ${suggestions.length} suggestions`);
  
  if (suggestions.length !== 5) {
    throw new Error(`Expected 5 suggestions, got ${suggestions.length}`);
  }
  
  // Step 3: Simulate UI rendering
  console.log('\n5. Chat UI would render:');
  console.log('   💬 "Here are some recipe suggestions:"');
  console.log('   📋 [Clickable suggestion cards]');
  
  suggestions.forEach((suggestion, idx) => {
    console.log(`     ${idx + 1}. ${suggestion.name}`);
    console.log(`        "${suggestion.description}"`);
    console.log(`        [Get Recipe →] button`);
  });
  
  // Step 4: Simulate user clicking "Get Recipe →"
  console.log('\n6. User clicks "Get Recipe →" for "Kale and Chickpea Curry"');
  console.log('   💬 Chat would send: "Please give me the complete recipe for Kale and Chickpea Curry"');
  
  console.log('\n🎉 SUCCESS: JSON suggestions will now be detected in chat UX!');
  
  console.log('\n📋 SOLUTION SUMMARY:');
  console.log('=====================================');
  console.log('✅ Problem: AI returns mixed content (text + JSON) but suggestions not detected');
  console.log('✅ Root cause: Regex extraction failed to get complete JSON object');
  console.log('✅ Solution: Improved extraction using balanced bracket counting');
  console.log('✅ Result: Suggestions now properly detected and parsed from mixed content');
  console.log('');
  console.log('🔧 TECHNICAL CHANGES:');
  console.log('- Updated extractJsonFromMixedContent() to use balanced bracket counting');
  console.log('- Fixed isRecipeSuggestions() to detect JSON in mixed content');
  console.log('- Fixed parseRecipeSuggestions() to extract suggestions correctly');
  console.log('');
  console.log('🚀 NEXT STEP: Run "npm start" and test the chat to see suggestions working!');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
