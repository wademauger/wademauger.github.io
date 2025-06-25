// Quick test to debug recipe parsing
const testRecipe = `# Recipe for chicken fajitas

## Ingredients:
- 2 cups main ingredient (adjust based on your preference)
- 1 tsp salt
- 1/2 tsp black pepper
- 2 tbsp olive oil
- Additional seasonings to taste

## Instructions:
1. **Prep work**: Gather all ingredients and prepare your workspace. Preheat oven to 375°F (190°C) if baking.

2. **Season**: Season your main ingredients with salt and pepper. Let rest for 10 minutes to allow flavors to develop.

3. **Cook**: Heat olive oil in a large skillet over medium-high heat. Add seasoned ingredients and cook according to the specific requirements of your dish.

4. **Finish**: Taste and adjust seasonings. Add any final touches like fresh herbs, lemon juice, or garnishes.

5. **Serve**: Present immediately while hot, or let cool if serving at room temperature.

## Notes:
- **Prep Time**: 15 minutes
- **Cook Time**: 20-30 minutes
- **Serves**: 4 people
- **Tips**: Always taste as you cook and adjust seasonings gradually
- **Storage**: Leftovers keep for 3-4 days in refrigerator
- Try adding herbs like thyme, rosemary, or basil; or include vegetables like onions, garlic, or bell peppers
- Try different cooking methods: roasting, grilling, or braising

What specific type of chicken fajitas would you like me to help you create? I can provide more detailed instructions for specific cuisines or cooking methods!`;

// Test the instruction extraction
const instructionsSection = testRecipe.match(/(?:Instructions?|Steps?):\s*([\s\S]*?)(?:\n\n|Notes?:|Prep Time:|$)/i);
if (instructionsSection) {
  console.log('Found instructions section length:', instructionsSection[1].length);
  console.log('Instructions section:\n', instructionsSection[1]);
  
  // Test the splitting logic
  const rawText = instructionsSection[1];
  let stepLines = rawText.split(/\n(?=\d+\.\s)/);
  
  console.log('Split result 1 length:', stepLines.length);
  console.log('Split result 1:', stepLines);
  
  // If we got a single item, try alternative method
  if (stepLines.length === 1) {
    const allLines = rawText.split(/\n/);
    console.log('All lines:', allLines);
    
    const numberedLines = allLines.filter(line => /^\d+\./.test(line.trim()));
    console.log('Numbered lines:', numberedLines);
    
    if (numberedLines.length > 0) {
      const cleaned = numberedLines.map(line => {
        let cleaned = line.replace(/^\d+[.)]\s*/, '').trim();
        cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
        cleaned = cleaned.replace(/^([^:]+):\s*/, '$1: ');
        return cleaned;
      }).filter(line => line.length > 2);
      
      console.log('Final cleaned steps:', cleaned);
    }
  }
}
