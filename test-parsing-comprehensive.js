// Comprehensive test for recipe parsing edge cases
const testCases = [
  {
    name: "Double newlines with bold formatting",
    text: `1. **Prep work**: Gather all ingredients and prepare your workspace. Preheat oven to 375°F (190°C) if baking.

2. **Season**: Season your main ingredients with salt and pepper. Let rest for 10 minutes to allow flavors to develop.

3. **Cook**: Heat olive oil in a large skillet over medium-high heat. Add seasoned ingredients and cook according to the specific requirements of your dish.`
  },
  {
    name: "Single newlines",
    text: `1. Prep work: Gather ingredients
2. Season: Add salt and pepper
3. Cook: Heat oil and cook`
  },
  {
    name: "Mixed spacing",
    text: `1. First step here

2. Second step with double newline above
3. Third step with single newline above

4. Fourth step with double newline above`
  },
  {
    name: "Multi-line steps",
    text: `1. Start by preparing the workspace
   and gathering all ingredients
   
2. Season the meat with salt
   and pepper, then let rest
   
3. Cook everything together`
  },
  {
    name: "No formatting",
    text: `1. Simple step one
2. Simple step two  
3. Simple step three`
  }
];

function testParsing(rawText) {
  console.log('🔍 Testing text:', rawText);
  
  // Primary approach: Line-based parsing
  const lines = rawText.split('\n');
  const numberedLines = lines.filter(line => /^\s*\d+\./.test(line));
  
  let steps = numberedLines.map(line => {
    let cleaned = line.replace(/^\s*\d+[.)]\s*/, '').trim();
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Remove italic
    return cleaned;
  }).filter(step => step.length > 2);
  
  console.log('📄 Line-based result:', steps);
  
  // Fallback patterns if line-based fails
  if (steps.length === 0) {
    const patterns = [
      /(\d+\.\s*[^\n]+(?:\n(?!\s*\d+\.)[^\n]*)*)/g,
      /\d+\.\s*[\s\S]*?(?=\n\s*\d+\.|$)/g,
      /\d+\.[^\d]*?(?=\d+\.|$)/g
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      const matches = rawText.match(patterns[i]);
      if (matches && matches.length > 0) {
        steps = matches.map(step => {
          let cleaned = step.replace(/^\s*\d+\.\s*/, '').trim();
          cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
          cleaned = cleaned.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
          return cleaned;
        }).filter(step => step.length > 2);
        
        if (steps.length > 0) {
          console.log(`✅ Pattern ${i + 1} worked:`, steps);
          break;
        }
      }
    }
  }
  
  return steps;
}

console.log('=== Comprehensive Recipe Parsing Tests ===\n');

testCases.forEach((testCase, index) => {
  console.log(`\n--- Test ${index + 1}: ${testCase.name} ---`);
  const result = testParsing(testCase.text);
  console.log(`Result count: ${result.length}`);
  console.log('---');
});
