// Test improved multi-line step parsing
const testText = `1. Start by preparing the workspace
   and gathering all ingredients
   
2. Season the meat with salt
   and pepper, then let rest
   for about 10 minutes
   
3. Cook everything together
   until golden brown`;

function testImprovedParsing(rawText) {
  console.log('🔍 Testing improved parsing on:', rawText);
  
  const lines = rawText.split('\n');
  let steps = [];
  let currentStep = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check if this line starts a new numbered step
    if (/^\s*\d+\./.test(line)) {
      // If we have a previous step, save it
      if (currentStep) {
        steps.push(currentStep);
      }
      
      // Start a new step
      let cleaned = line.replace(/^\s*\d+[.)]\s*/, '').trim();
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold
      cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Remove italic
      cleaned = cleaned.replace(/\`([^\`]+)\`/g, '$1'); // Remove code formatting
      currentStep = cleaned;
    } else if (currentStep && trimmedLine.length > 0 && !trimmedLine.match(/^(Notes?|Prep Time|Cook Time|Serves?):/i)) {
      // This is a continuation line of the current step
      currentStep += ' ' + trimmedLine;
    }
  }
  
  // Don't forget the last step
  if (currentStep) {
    steps.push(currentStep);
  }
  
  // Clean up steps and filter out very short ones
  steps = steps.map(step => step.replace(/\s+/g, ' ').trim()).filter(step => step.length > 2);
  
  console.log('📄 Improved result:', steps);
  return steps;
}

console.log('=== Testing Improved Multi-line Parsing ===\n');
testImprovedParsing(testText);
