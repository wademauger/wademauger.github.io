#!/usr/bin/env node

// Test the improved parsing with the user's exact example
const testResponse = `Shrimp Carbonara

Ingredients:

    8 oz (225g) spaghetti
    8 oz (225g) shrimp, peeled and deveined
    4 large eggs
    1 cup (115g) freshly grated Parmesan cheese
    4 oz (115g) pancetta or guanciale, diced
    3 cloves garlic, minced
    1 tsp black pepper, freshly cracked
    1 tsp salt
    2 tbsp olive oil
    1 tbsp fresh parsley, chopped (for garnish)

Instructions:

    Cook the spaghetti: Bring a large pot of salted water to a boil. Cook the spaghetti according to package instructions until al dente. Reserve 1 cup of pasta water before draining.

    Prepare the carbonara sauce: In a bowl, whisk together eggs, Parmesan cheese, black pepper, and salt. Set aside.

    Cook the pancetta and shrimp: In a large skillet, heat olive oil over medium heat. Add diced pancetta and cook until crispy, about 5 minutes. Add minced garlic and cook for an additional 1 minute. Add shrimp to the skillet and cook until they turn pink, about 2-3 minutes per side.

    Toss the pasta: Working quickly, add the drained spaghetti to the skillet with the shrimp and pancetta. Toss well to combine.

    Add the sauce: Pour the egg mixture over the pasta, stirring quickly to coat the strands and prevent the eggs from scrambling. If needed, add reserved pasta water, one tablespoon at a time, to achieve your desired consistency.

    Serve: Divide the Shrimp Carbonara among warmed pasta bowls. Garnish with chopped fresh parsley and serve immediately.

Notes:

    To prevent the eggs from scrambling, make sure to remove the skillet from heat before adding the egg mixture to the pasta.
    For a lighter sauce, you can use half the amount of eggs and add more pasta water as needed.
    Feel free to add vegetables to this dish, such as spinach, peas, or mushrooms. Add them to the skillet after cooking the pancetta and garlic, and cook until tender before proceeding with the shrimp.
    Always ensure shrimp is cooked to an internal temperature of 145°F (63°C) to ensure food safety.`;

// Test detection logic
function isCompleteRecipe(text) {
  const lowerText = text.toLowerCase();
  
  // Check for title (recipe name at start, ## header, or "recipe" keyword)
  const hasTitle = text.match(/^[A-Z][^:\n]{3,50}$/m) || // Title-like line at start
                  text.includes('##') || 
                  lowerText.includes('recipe');
  
  // Check for ingredients section (more flexible)
  const hasIngredients = lowerText.includes('ingredients') && (
    text.includes('- ') ||           // Bullet points
    /\d+\.?\s+(?:oz|cup|tsp|tbsp|pound|lb|kg|gram|g)\b/i.test(text) || // Measurements
    /\d+\s+(?:large|medium|small|cloves?)\s+\w+/i.test(text) ||        // Counted items
    /^\s*\d+/m.test(text.split(/ingredients:?/i)[1] || '')             // Numbered ingredients
  );
  
  // Check for instructions/steps - more flexible pattern matching
  const hasInstructions = (lowerText.includes('instructions') || lowerText.includes('steps')) && (
    /\d+\./.test(text) ||                    // Standard numbered steps
    /^\s*\w+[^:]*:\s*\w+/m.test(text) ||     // Steps with descriptive headers like "Cook the pasta: ..."
    /(?:first|then|next|finally|step)/i.test(text) // Step indicators
  );
  
  console.log('🔍 Recipe detection:', { hasTitle, hasIngredients, hasInstructions });
  return hasTitle && hasIngredients && hasInstructions;
}

// Test parsing logic
function parseMarkdownRecipe(text) {
  const lines = text.split('\n');
  let title = '';
  let ingredients = [];
  let steps = [];
  let notes = [];
  
  let currentSection = '';
  
  // First, try to extract title from the beginning of the text
  const firstNonEmptyLine = lines.find(line => line.trim().length > 0);
  if (firstNonEmptyLine && !firstNonEmptyLine.includes(':') && firstNonEmptyLine.length < 100) {
    title = firstNonEmptyLine.trim();
  }
  
  for (let line of lines) {
    line = line.trim();
    
    // Section headers (more flexible matching)
    if (line.toLowerCase().includes('ingredients:') || line.toLowerCase() === 'ingredients') {
      currentSection = 'ingredients';
      continue;
    }
    if (line.toLowerCase().includes('instructions:') || line.toLowerCase().includes('steps:') || 
        line.toLowerCase() === 'instructions' || line.toLowerCase() === 'steps') {
      currentSection = 'instructions';
      continue;
    }
    if (line.toLowerCase().includes('notes:') || line.toLowerCase() === 'notes') {
      currentSection = 'notes';
      continue;
    }
    
    // Add content based on current section - handle both bullets and numbered lists
    if (currentSection === 'ingredients') {
      if (line.startsWith('- ')) {
        // Bullet point ingredient
        ingredients.push(line.substring(2).trim());
      } else if (/^\s*\d+\.?\s+/.test(line)) {
        // Numbered ingredient (e.g., "1. " or "1 ")
        ingredients.push(line.replace(/^\s*\d+\.?\s+/, '').trim());
      } else if (line.length > 5 && !line.includes(':') && 
                 /(?:oz|cup|tsp|tbsp|pound|lb|kg|gram|g|cloves?|large|medium|small)/i.test(line)) {
        // Looks like an ingredient line without numbering
        ingredients.push(line);
      }
    } else if (currentSection === 'instructions') {
      if (/^\s*\d+\./.test(line)) {
        // Standard numbered step
        steps.push(line.replace(/^\s*\d+\.\s*/, '').trim());
      } else if (/^\s*\w+[^:]*:\s*\w+/.test(line)) {
        // Step with descriptive header like "Cook the pasta: Instructions here"
        steps.push(line.trim());
      } else if (line.length > 10 && !line.includes(':') && steps.length > 0) {
        // Continuation of previous step
        steps[steps.length - 1] += ' ' + line;
      }
    } else if (currentSection === 'notes') {
      if (line.startsWith('- ')) {
        notes.push(line.substring(2).trim());
      } else if (line.length > 10 && !line.includes(':')) {
        // Treat as a note if it's substantial text
        notes.push(line);
      }
    }
  }
  
  return { title, ingredients, steps, notes };
}

console.log('🧪 Testing Recipe Detection with User\'s Example...\n');

const detected = isCompleteRecipe(testResponse);
console.log('✅ Recipe detected:', detected);

if (detected) {
  console.log('\n🧪 Testing Recipe Parsing...\n');
  const parsed = parseMarkdownRecipe(testResponse);
  console.log('📄 Parsed Recipe:');
  console.log('Title:', parsed.title);
  console.log('Ingredients count:', parsed.ingredients.length);
  console.log('Steps count:', parsed.steps.length);
  console.log('Notes count:', parsed.notes.length);
  
  console.log('\n📝 First few ingredients:');
  parsed.ingredients.slice(0, 3).forEach((ing, i) => console.log(`  ${i+1}. ${ing}`));
  
  console.log('\n🍳 First few steps:');
  parsed.steps.slice(0, 2).forEach((step, i) => console.log(`  ${i+1}. ${step.substring(0, 60)}...`));
  
  console.log('\n💡 Notes:');
  parsed.notes.slice(0, 2).forEach((note, i) => console.log(`  ${i+1}. ${note.substring(0, 60)}...`));
  
  if (parsed.ingredients.length > 0 && parsed.steps.length > 0) {
    console.log('\n🎉 SUCCESS! This recipe would now show the Save button!');
  } else {
    console.log('\n❌ ISSUE: Missing ingredients or steps');
  }
} else {
  console.log('\n❌ Recipe not detected - Save button would not appear');
}
