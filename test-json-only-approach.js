/**
 * Test the improved JSON extraction that relies only on JSON.parse()
 */

// Test data with mixed content (text + JSON)
const mixedContent = `There are plenty of delicious vegan recipes that incorporate kale. Here are a few suggestions to get you started:

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
    }
  ]
}

These recipes offer a variety of ways to enjoy kale in your vegan meals.`;

// Improved extraction function that relies only on JSON.parse()
const extractJsonFromMixedContent = (text) => {
  // First try to parse as pure JSON
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    // Not pure JSON - look for JSON blocks in mixed text
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for lines that start with '{'
      if (line.startsWith('{')) {
        // Try to parse from this line forward until we get valid JSON
        for (let j = i; j < lines.length; j++) {
          const candidate = lines.slice(i, j + 1).join('\n').trim();
          
          // Only try to parse if it ends with '}'
          if (candidate.endsWith('}')) {
            try {
              const parsed = JSON.parse(candidate);
              if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                return parsed;
              }
            } catch (e2) {
              // Continue trying longer candidates
            }
          }
        }
      }
    }
  }
  return null;
};

console.log('\n🧪 Testing JSON-only extraction approach...\n');

try {
  console.log('1. Testing with mixed content (text + JSON)');
  
  const result = extractJsonFromMixedContent(mixedContent);
  
  if (!result) {
    throw new Error('Failed to extract JSON from mixed content');
  }
  
  console.log('✅ Successfully extracted JSON from mixed content');
  console.log('🔍 Found', result.suggestions.length, 'suggestions');
  
  // Verify the extracted data
  const suggestions = result.suggestions.map(s => ({
    name: s.title || s.name || 'Unnamed Recipe',
    description: s.description || 'No description available'
  }));
  
  console.log('\n📋 Extracted suggestions:');
  suggestions.forEach((suggestion, idx) => {
    console.log(`  ${idx + 1}. ${suggestion.name}`);
    console.log(`     "${suggestion.description}"`);
  });
  
  console.log('\n🎉 SUCCESS: JSON extraction works with JSON.parse() only!');
  
  console.log('\n📝 APPROACH SUMMARY:');
  console.log('=====================================');
  console.log('✅ Use JSON.parse() exclusively for parsing');
  console.log('✅ No regex patterns for JSON extraction');
  console.log('✅ Line-by-line approach to find JSON blocks');
  console.log('✅ Progressively try longer candidates until valid JSON found');
  console.log('✅ Clean, reliable, and maintainable solution');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
