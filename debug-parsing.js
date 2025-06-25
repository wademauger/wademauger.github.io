// Debug script to test recipe parsing
const sampleText = `1. **Prep work**: Gather all ingredients and prepare your workspace. Preheat oven to 375°F (190°C) if baking.

2. **Season**: Season your main ingredients with salt and pepper. Let rest for 10 minutes to allow flavors to develop.

3. **Cook**: Heat olive oil in a large skillet over medium-high heat. Add seasoned ingredients and cook according to the specific requirements of your dish.

4. **Finish**: Taste and adjust seasonings. Add any final touches like fresh herbs, lemon juice, or garnishes.

5. **Serve**: Present immediately while hot, or let cool if serving at room temperature.`;

console.log('=== Original text ===');
console.log(sampleText);

console.log('\n=== Testing split patterns ===');

// Current pattern
const pattern1 = /\n(?=\d+\.\s)/;
const result1 = sampleText.split(pattern1);
console.log('Pattern 1 (/\\n(?=\\d+\\.\\s)/):', result1);

// Simpler pattern
const pattern2 = /\n(?=\d+\.)/;
const result2 = sampleText.split(pattern2);
console.log('Pattern 2 (/\\n(?=\\d+\\.)/):', result2);

// Try splitting on all newlines first
const lines = sampleText.split('\n');
console.log('All lines:', lines);

const numberedLines = lines.filter(line => /^\d+\./.test(line.trim()));
console.log('Numbered lines:', numberedLines);

const cleanedSteps = numberedLines.map(line => {
  let cleaned = line.replace(/^\d+[.)]\s*/, '').trim();
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  return cleaned;
});
console.log('Cleaned steps:', cleanedSteps);
