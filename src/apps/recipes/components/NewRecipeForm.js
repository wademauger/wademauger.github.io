import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Alert,
  message
} from 'antd';
import ReactMarkdown from 'react-markdown';
import recipeAIService from '../services/RecipeAIService';

const { Text } = Typography;

const NewRecipeForm = ({ visible, onCancel, onSave, loading = false }) => {
  console.log('🚀 NewRecipeForm component called! visible:', visible, 'props:', { visible, onCancel, onSave, loading });
  console.log('🔍 NewRecipeForm render called with visible:', visible);
  
  const [form] = Form.useForm();
  const [titleValue, setTitleValue] = useState('');
  const [slugValue, setSlugValue] = useState('');
  const [manualSlugEdit, setManualSlugEdit] = useState(false);
  const [showManualMode, setShowManualMode] = useState(false); // Start with AI mode, allow switch to manual
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  // Recipe preview state
  const [currentRecipePreview, setCurrentRecipePreview] = useState(null);
  const messagesEndRef = useRef(null);

  console.log('🔍 Current showManualMode state:', showManualMode);

  // Reset states when modal opens
  useEffect(() => {
    if (visible) {
      console.log('🔧 NewRecipeForm modal opened - defaulting to AI mode');
      console.log('🔧 Previous showManualMode state:', showManualMode);
      
      // Immediately set to AI mode
      setShowManualMode(false);
      setAiMessages([]);
      setAiLoading(false);
      setCurrentRecipePreview(null);
      setTitleValue('');
      setSlugValue('');
      setManualSlugEdit(false);
      
      console.log('🔧 After reset - showManualMode set to false');
    } else {
      console.log('🔧 NewRecipeForm modal closed');
    }
  }, [visible]);

  // Additional effect to ensure AI mode is always the default on mount
  useEffect(() => {
    if (visible && showManualMode !== false) {
      console.log('🔧 Force correcting showManualMode to false');
      setShowManualMode(false);
    }
  }, [visible, showManualMode]);

  // Utility function to convert string quantities to numbers
  const convertQuantityToNumber = (quantity) => {
    if (typeof quantity === 'number') {
      return quantity;
    }
    
    if (typeof quantity === 'string') {
      // Handle empty string
      if (!quantity.trim()) {
        return 0;
      }
      
      // Handle fractions like "1/2", "3/4", etc.
      if (quantity.includes('/')) {
        const [numerator, denominator] = quantity.split('/');
        const num = parseFloat(numerator);
        const den = parseFloat(denominator);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          return num / den;
        }
      }
      
      // Handle ranges like "2-3", "1-2", etc. - take the first number
      if (quantity.includes('-')) {
        const firstNum = quantity.split('-')[0];
        const parsed = parseFloat(firstNum);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
      
      // Handle standard numbers
      const parsed = parseFloat(quantity);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    
    // Default to 0 if can't parse
    return 0;
  };

  // Parse recipe from AI response (JSON or markdown)
  const parseRecipeFromText = (text) => {
    try {
      // First, try to parse as JSON
      const jsonRecipe = parseJsonRecipe(text);
      if (jsonRecipe) {
        console.log('✅ Successfully parsed JSON recipe:', jsonRecipe);
        return jsonRecipe;
      }
      
      // Fall back to markdown parsing
      console.log('⚠️ JSON parsing failed, falling back to markdown parsing');
      return parseMarkdownRecipe(text);
    } catch (error) {
      console.error('Error parsing recipe:', error);
      // Return a safe fallback structure
      return {
        title: 'AI Generated Recipe',
        ingredients: [],
        steps: [],
        notes: [],
        prepTime: '',
        cookTime: '',
        servings: '',
        description: '',
        difficulty: '',
        tags: []
      };
    }
  };

  // Parse JSON recipe format
  const parseJsonRecipe = (text) => {
    try {
      // Clean the response to extract only JSON content
      let jsonString = text.trim();
      
      // Remove any markdown formatting that might wrap the JSON
      jsonString = jsonString.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
      
      // Find JSON object boundaries
      const startIndex = jsonString.indexOf('{');
      const lastIndex = jsonString.lastIndexOf('}');
      
      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        jsonString = jsonString.substring(startIndex, lastIndex + 1);
      }
      
      // Fix common JSON formatting issues
      // Fix trailing commas like "tags": , (empty value)
      jsonString = jsonString.replace(/:\s*,/g, ': null,');
      // Fix trailing commas before closing braces/brackets
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
      // Fix null values that should be arrays for consistency
      jsonString = jsonString.replace(/:\s*null,/g, ': [],');
      
      // Parse the JSON
      const parsed = JSON.parse(jsonString);
      
      console.log('🔍 DEBUG: Parsed JSON structure:', {
        hasIngredients: !!parsed.ingredients,
        ingredientsType: typeof parsed.ingredients,
        isIngredientsArray: Array.isArray(parsed.ingredients),
        ingredientsKeys: parsed.ingredients && typeof parsed.ingredients === 'object' && !Array.isArray(parsed.ingredients) 
          ? Object.keys(parsed.ingredients) : 'N/A'
      });
      
      // Validate that it has the expected recipe structure
      if (parsed && (parsed.title || parsed.ingredients || parsed.steps)) {
        // Handle both simple array and grouped ingredient formats
        let ingredients = [];
        let ingredientsGrouped = null;
        
        if (parsed.ingredients) {
          if (Array.isArray(parsed.ingredients)) {
            console.log('🔄 Processing ingredients as array format');
            // Simple array format - preserve structured objects
            ingredients = parsed.ingredients.map(ing => {
              if (typeof ing === 'object' && ing !== null) {
                // Keep structured format for proper ingredient handling, preserving numeric quantities
                return {
                  quantity: ing.quantity !== undefined ? ing.quantity : '',
                  unit: ing.unit || '',
                  name: ing.name || '',
                  notes: ing.notes || ''
                };
              }
              // If it's a string, try to parse it into structured format
              return {
                quantity: '',
                unit: '',
                name: ing.toString(),
                notes: ''
              };
            });
            ingredientsGrouped = null;
          } else if (typeof parsed.ingredients === 'object') {
            console.log('🔄 Processing ingredients as grouped object format');
            console.log('🔍 Groups found:', Object.keys(parsed.ingredients));
            
            // Grouped format - preserve the structure and convert to flat structured list
            const flatIngredients = [];
            Object.entries(parsed.ingredients).forEach(([group, items]) => {
              if (Array.isArray(items)) {
                // Add group header as a special ingredient
                flatIngredients.push({
                  quantity: '',
                  unit: '',
                  name: `**${group}:**`,
                  notes: '',
                  isGroupHeader: true
                });
                
                items.forEach(ing => {
                  if (typeof ing === 'object' && ing !== null) {
                    flatIngredients.push({
                      quantity: ing.quantity !== undefined ? ing.quantity : '',
                      unit: ing.unit || '',
                      name: ing.name || '',
                      notes: ing.notes || ''
                    });
                  } else {
                    flatIngredients.push({
                      quantity: '',
                      unit: '',
                      name: ing.toString(),
                      notes: ''
                    });
                  }
                });
              }
            });
            ingredients = flatIngredients;
            ingredientsGrouped = parsed.ingredients; // Preserve original grouped structure
          }
        }
        
        const result = {
          title: parsed.title || 'AI Generated Recipe',
          description: parsed.description || '',
          commentary: parsed.commentary || '', // Add commentary field
          ingredients: ingredients,
          ingredientsGrouped: ingredientsGrouped, // This should be the original grouped object
          steps: parsed.steps || [],
          notes: parsed.notes || [],
          prepTime: parsed.prepTime || '',
          cookTime: parsed.cookTime || '',
          servings: parsed.servings || '',
          difficulty: parsed.difficulty || '',
          tags: parsed.tags || [],
          nutrition: parsed.nutrition || {}
        };
        
        console.log('✅ Final parsed recipe:', {
          title: result.title,
          hasIngredients: result.ingredients && result.ingredients.length > 0,
          hasIngredientsGrouped: !!result.ingredientsGrouped,
          ingredientsGroupedKeys: result.ingredientsGrouped ? Object.keys(result.ingredientsGrouped) : 'null'
        });
        
        return result;
      }
      
      return null;
    } catch (error) {
      console.log('JSON parsing failed:', error.message);
      return null;
    }
  };

  // Parse markdown recipe format (fallback)
  const parseMarkdownRecipe = (text) => {
    const lines = text.split('\n');
    let title = '';
    let ingredients = [];
    let steps = [];
    let notes = [];
    let prepTime = '';
    let cookTime = '';
    let servings = '';
    
    let currentSection = '';
    
    // First, try to extract title from the beginning of the text
    const firstNonEmptyLine = lines.find(line => line.trim().length > 0);
    if (firstNonEmptyLine && !firstNonEmptyLine.includes(':') && firstNonEmptyLine.length < 100) {
      title = firstNonEmptyLine.trim();
    }
    
    for (let line of lines) {
      line = line.trim();
      
      // Extract title (starts with ## or first significant line)
      if (line.startsWith('## ')) {
        title = line.substring(3).trim();
        continue;
      }
      
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
      
      // Extract metadata
      if (line.startsWith('**Prep Time:**')) {
        prepTime = line.replace('**Prep Time:**', '').trim();
        continue;
      }
      if (line.startsWith('**Cook Time:**')) {
        cookTime = line.replace('**Cook Time:**', '').trim();
        continue;
      }
      if (line.startsWith('**Serves:**')) {
        servings = line.replace('**Serves:**', '').trim();
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
                   /(?:oz|cup|tsp|tbsp|pound|lb|kg|gram|g|cloves?|large|medium|small|\d)/i.test(line)) {
          // Looks like an ingredient line (has measurements or numbers)
          ingredients.push(line.trim());
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
    
    return {
      title: title || 'AI Generated Recipe',
      ingredients: ingredients.length > 0 ? ingredients : [],
      steps: steps.length > 0 ? steps : [],
      notes: notes.length > 0 ? notes : [], // Ensure it's always an array
      prepTime,
      cookTime,
      servings,
      description: '',
      difficulty: '',
      tags: []
    };
  };

  // Check if a message contains a complete recipe
  const isCompleteRecipe = (text) => {
    // PRIORITY 1: Check for JSON structure first (most reliable)
    const trimmedText = text.trim();
    const looksLikeJson = (trimmedText.startsWith('{') && trimmedText.includes('}')) &&
                         (text.includes('"title"') || text.includes('"ingredients"') || text.includes('"steps"'));
    
    if (looksLikeJson) {
      // For JSON-like structure, check for required fields
      const hasTitle = text.includes('"title"') && text.match(/"title"\s*:\s*"[^"]+"/);
      const hasIngredients = text.includes('"ingredients"') && 
                           (text.includes('"quantity"') || text.includes('"name"') || 
                            text.match(/"ingredients"\s*:\s*\[/) || text.match(/"ingredients"\s*:\s*\{/));
      const hasSteps = text.includes('"steps"') && text.match(/"steps"\s*:\s*\[/);
      
      const isComplete = hasTitle && hasIngredients && hasSteps;
      console.log('🔍 JSON Recipe detection:', { hasTitle, hasIngredients, hasSteps, isComplete });
      return isComplete;
    }
    
    // PRIORITY 2: Try to parse as JSON even if not perfectly formatted
    try {
      const parsed = parseJsonRecipe(text);
      if (parsed && parsed.title && parsed.ingredients && parsed.steps) {
        console.log('🔍 Parsed JSON recipe successfully');
        return parsed.ingredients.length > 0 && parsed.steps.length > 0;
      }
    } catch (e) {
      // Continue with markdown check
    }
    
    // PRIORITY 3: Only if JSON parsing fails, check markdown format
    // Before checking markdown patterns, eliminate obvious suggestion lists
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const suggestionLines = lines.filter(line => {
      const trimmed = line.trim();
      return (
        /^\d+\.\s*[\*]*[A-Z][^:]+:\s*/.test(trimmed) ||       // Number + Recipe Name: Description  
        /^[\*]{1,2}[A-Z][^:*]+[\*]{1,2}:\s*/.test(trimmed)    // **Recipe Name**: Description
      );
    }).length;
    
    // If we have multiple suggestion-style lines, this is likely a suggestion list, not a complete recipe
    if (suggestionLines >= 2) {
      console.log('🔍 Detected suggestion list format, not a complete recipe');
      return false;
    }
    
    // Fall back to markdown detection - more flexible for AI responses
    const lowerText = text.toLowerCase();
    
    // Check for recipe indicators (more flexible)
    const hasTitle = text.match(/^[A-Z][^:\n]{3,50}$/m) || // Title-like line at start
                    text.includes('##') || 
                    (lowerText.includes('recipe') && !lowerText.includes('recipes')) || // Single recipe, not multiple
                    /(?:here'?s|this is).*(?:recipe|toast|dish)/i.test(text.substring(0, 200)) || // Intro phrases
                    /^[A-Z][^.!?]*(?:recipe|instructions?|directions?)$/im.test(text); // Recipe/instruction titles
    
    // Check for ingredients section with actual measurements
    const hasDetailedIngredients = lowerText.includes('ingredients') && (
      /\d+\s*(?:oz|cup|cups|tsp|tbsp|teaspoons?|tablespoons?|pound|pounds|lb|lbs|kg|grams?|g)\b/i.test(text) || // Measurements
      /\d+\s+(?:large|medium|small|cloves?)\s+\w+/i.test(text) ||        // Counted items with descriptions
      /(?:^|\n)\s*[\-\*•]\s*\d+/m.test(text.split(/ingredients:?/i)[1] || '') // Bulleted measurements
    );
    
    // Check for step-by-step instructions
    const hasDetailedInstructions = (lowerText.includes('instructions') || lowerText.includes('steps')) && (
      /(?:^|\n)\s*\d+\.\s+(?:heat|cook|add|mix|stir|bake|boil|simmer|season|serve|preheat|prepare|place|remove|create|whisk|dip|soak)/im.test(text) || // Cooking verbs
      /(?:first|then|next|finally|step)\s+(?:heat|cook|add|mix|stir|bake|boil|simmer|create|whisk|dip|soak)/i.test(text) || // Step indicators with cooking
      /\d+\.\s*\w+[^:]*(?:for\s+\d+|until|degrees|minutes|hours)/i.test(text) // Steps with timing/temperature
    );
    
    const isComplete = hasTitle && hasDetailedIngredients && hasDetailedInstructions;
    console.log('🔍 Complete recipe detection for text:', text.substring(0, 100) + '...'); 
    console.log('🔍 Complete recipe detection:', { 
      hasTitle, 
      hasDetailedIngredients, 
      hasDetailedInstructions, 
      isComplete,
      suggestionLines,
      titleTests: {
        titleLine: !!text.match(/^[A-Z][^:\n]{3,50}$/m),
        hasHashTitle: text.includes('##'),
        singleRecipe: (lowerText.includes('recipe') && !lowerText.includes('recipes')),
        introPhrase: /(?:here'?s|this is).*(?:recipe|toast|dish)/i.test(text.substring(0, 200)),
        recipeTitle: /^[A-Z][^.!?]*(?:recipe|instructions?|directions?)$/im.test(text)
      },
      ingredientTests: {
        hasIngredientsWord: lowerText.includes('ingredients'),
        hasMeasurements: /\d+\s*(?:oz|cup|cups|tsp|tbsp|teaspoons?|tablespoons?|pound|pounds|lb|lbs|kg|grams?|g)\b/i.test(text),
        hasCountedItems: /\d+\s+(?:large|medium|small|cloves?)\s+\w+/i.test(text)
      },
      instructionTests: {
        hasInstructionsWord: (lowerText.includes('instructions') || lowerText.includes('steps')),
        hasCookingVerbs: /(?:^|\n)\s*\d+\.\s+(?:heat|cook|add|mix|stir|bake|boil|simmer|season|serve|preheat|prepare|place|remove|create|whisk|dip|soak)/im.test(text),
        hasStepIndicators: /(?:first|then|next|finally|step)\s+(?:heat|cook|add|mix|stir|bake|boil|simmer|create|whisk|dip|soak)/i.test(text)
      }
    });
    
    return isComplete;
  };

  // Check if a message contains recipe suggestions
  // Helper function to extract JSON from mixed content
  const extractJsonFromMixedContent = (text) => {
    // First try to parse as pure JSON
    try {
      return JSON.parse(text.trim());
    } catch (e) {
      // Not pure JSON - look for JSON blocks in mixed text
      // Split by lines and try to find consecutive lines that form valid JSON
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

  const isRecipeSuggestions = (text) => {
    const trimmedText = text.trim();
    
    // Check for JSON format with suggestions array (including mixed content)
    const jsonData = extractJsonFromMixedContent(trimmedText);
    if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions) && jsonData.suggestions.length > 0) {
      console.log('🔍 Detected JSON suggestions format with', jsonData.suggestions.length, 'suggestions');
      return true;
    }
    
    // Look for the specific SUGGESTIONS format
    if (trimmedText.includes('SUGGESTIONS:')) {
      return true;
    }
    
    // Look for multiple recipe sections with ingredients and instructions
    const ingredientsSections = (text.match(/ingredients/gi) || []).length;
    const instructionsSections = (text.match(/instructions/gi) || []).length;
    
    // If we have multiple ingredient/instruction sections, it's likely suggestions
    if (ingredientsSections >= 2 && instructionsSections >= 2) {
      return true;
    }
    
    // Look for multiple recipe names with colons or numbered list pattern
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const recipeLineCount = lines.filter(line => {
      const trimmed = line.trim();
      return (
        /^[•\-\*]\s*[\*]*[A-Z][^:]+:\s*/.test(trimmed) ||     // Bullet + Recipe Name: Description
        /^\d+\.\s*[\*]*[A-Z][^:]+:\s*/.test(trimmed) ||       // Number + Recipe Name: Description  
        /^[\*]{1,2}[A-Z][^:*]+[\*]{1,2}:\s*/.test(trimmed)    // **Recipe Name**: Description
      );
    }).length;
    
    // Additional check: if we have multiple recipe-like names, but no actual detailed 
    // ingredients list (with measurements) or step-by-step instructions, it's suggestions
    if (recipeLineCount >= 2) {
      const hasDetailedIngredients = /\d+\s*(?:oz|cup|cups|tsp|tbsp|teaspoons?|tablespoons?|pound|pounds|lb|lbs|kg|grams?|g)\b/i.test(text);
      const hasNumberedSteps = /(?:^|\n)\s*\d+\.\s+(?:heat|cook|add|mix|stir|bake|boil|simmer|season|serve)/im.test(text);
      
      // If it has recipe-like names but lacks detailed cooking instructions, it's suggestions
      if (!hasDetailedIngredients && !hasNumberedSteps) {
        console.log('🔍 Detected suggestions: multiple recipe names without detailed instructions');
        return true;
      }
    }
    
    return false;
  };

  // Parse recipe suggestions from text
  const parseRecipeSuggestions = (text) => {
    const suggestions = [];
    
    // First try to extract JSON format using helper function
    const jsonData = extractJsonFromMixedContent(text);
    if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions)) {
      console.log('🔍 Parsing JSON suggestions format with', jsonData.suggestions.length, 'suggestions');
      return jsonData.suggestions.map(suggestion => ({
        name: suggestion.title || suggestion.name || 'Unnamed Recipe',
        description: suggestion.description || 'No description available',
        difficulty: suggestion.difficulty
      }));
    }
    
    // First try to parse the structured SUGGESTIONS format
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Match patterns like "• Recipe Name: Description" or "- Recipe Name: Description"
      const bulletMatch = trimmedLine.match(/^[•\-\*]\s*([^:]+):\s*(.+)$/);
      if (bulletMatch) {
        const name = bulletMatch[1].replace(/\*\*/g, '').trim(); // Remove bold markdown
        suggestions.push({
          name: name,
          description: bulletMatch[2].trim()
        });
        continue;
      }
      
      // Match patterns like "1. Recipe Name: Description" or "1. **Recipe Name**: Description"
      const numberMatch = trimmedLine.match(/^\d+\.\s*\*{0,2}([^:*]+)\*{0,2}:\s*(.+)$/);
      if (numberMatch) {
        const name = numberMatch[1].replace(/\*\*/g, '').trim(); // Remove bold markdown
        suggestions.push({
          name: name,
          description: numberMatch[2].trim()
        });
        continue;
      }
      
      // Match patterns like "**Recipe Name**: Description" (without number)
      const boldMatch = trimmedLine.match(/^\*\*([^*:]+)\*\*:\s*(.+)$/);
      if (boldMatch) {
        suggestions.push({
          name: boldMatch[1].trim(),
          description: boldMatch[2].trim()
        });
        continue;
      }
    }
    
    // If we found structured suggestions, return them
    if (suggestions.length > 0) {
      console.log('🔍 Parsed recipe suggestions:', suggestions);
      return suggestions;
    }
    
    // Fall back to parsing multiple recipe sections
    const sections = text.split(/(?=Ingredients|INGREDIENTS)/i);
    
    for (let i = 1; i < sections.length; i++) { // Skip first section (usually intro text)
      const section = sections[i].trim();
      
      // Try to extract a recipe name from the context before ingredients
      const prevSection = i > 0 ? sections[i - 1] : '';
      const contextLines = prevSection.split('\n').slice(-3); // Last 3 lines of previous section
      
      // Look for a recipe name in the context
      let recipeName = `Recipe ${i}`;
      for (const line of contextLines) {
        const trimmed = line.trim();
        // Look for recipe-like names (capitalized, not too long, not ingredients/instructions)
        if (trimmed && 
            trimmed.length < 50 && 
            trimmed.charAt(0) === trimmed.charAt(0).toUpperCase() &&
            !trimmed.toLowerCase().includes('ingredient') &&
            !trimmed.toLowerCase().includes('instruction') &&
            !trimmed.includes(':') &&
            !/^(here|these|you|this|try)/i.test(trimmed)) {
          recipeName = trimmed;
          break;
        }
      }
      
      // Extract basic description from ingredients
      const ingredientsMatch = section.match(/ingredients[^]*?(?=instructions|$)/i);
      let description = '';
      if (ingredientsMatch) {
        const ingredients = ingredientsMatch[0].replace(/ingredients/i, '').trim();
        const firstIngredients = ingredients.split(/[,.]/).slice(0, 3).join(', ');
        description = `Made with ${firstIngredients}...`;
      }
      
      suggestions.push({
        name: recipeName,
        description: description || 'A delicious recipe suggestion'
      });
    }
    
    return suggestions;
  };

  // Determine the response type
  const getResponseType = (text) => {
    if (isCompleteRecipe(text)) {
      return 'recipe';
    }
    if (isRecipeSuggestions(text)) {
      return 'suggestions';
    }
    return 'advice';
  };

  // Handle saving AI-generated recipe
  const handleSaveAiRecipe = async (aiMessageText) => {
    try {
      const parsedRecipe = parseRecipeFromText(aiMessageText);
      
      // Check if we have at least a title and some content
      if (!parsedRecipe.title || (
        parsedRecipe.ingredients.length === 0 && 
        parsedRecipe.steps.length === 0
      )) {
        message.error('Could not parse a complete recipe. Please ensure the AI response contains ingredients and instructions.');
        return;
      }

      // Use AI-generated title and slug since we're not preserving form values anymore
      const finalTitle = parsedRecipe.title;
      const finalSlug = generateSlug(parsedRecipe.title);
      
      console.log('📝 Using AI-generated recipe title and slug:', { 
        finalTitle, 
        finalSlug, 
        aiTitle: parsedRecipe.title 
      });
      
      // Ensure all required fields are arrays
      const safeIngredients = Array.isArray(parsedRecipe.ingredients) ? parsedRecipe.ingredients : [];
      const safeSteps = Array.isArray(parsedRecipe.steps) ? parsedRecipe.steps : [];
      const safeNotes = Array.isArray(parsedRecipe.notes) ? parsedRecipe.notes : 
                       (typeof parsedRecipe.notes === 'string' ? [parsedRecipe.notes] : []);
      
      // Handle ingredients - convert grouped structure to flat array for storage
      let ingredientsForSave;
      if (parsedRecipe.ingredientsGrouped) {
        // Convert grouped ingredients to flat array with group headers
        console.log('💾 Converting grouped ingredients to flat array:', parsedRecipe.ingredientsGrouped);
        ingredientsForSave = [];
        
        Object.entries(parsedRecipe.ingredientsGrouped).forEach(([groupName, groupIngredients]) => {
          // Add group header as a special ingredient
          ingredientsForSave.push({
            name: `**${groupName}:**`,
            quantity: '',
            unit: '',
            isGroupHeader: true
          });
          
          // Add ingredients from this group
          if (Array.isArray(groupIngredients)) {
            groupIngredients.forEach(ing => {
              if (typeof ing === 'object') {
                ingredientsForSave.push({
                  name: ing.name || '',
                  quantity: convertQuantityToNumber(ing.quantity),
                  unit: ing.unit || '',
                  notes: ing.notes || ''
                });
              } else {
                ingredientsForSave.push({
                  name: ing,
                  quantity: 0,
                  unit: ''
                });
              }
            });
          }
        });
      } else {
        // Convert flat ingredient list to standard format
        ingredientsForSave = safeIngredients.map(ing => {
          if (typeof ing === 'object') {
            return {
              name: ing.name || ing.toString(),
              quantity: convertQuantityToNumber(ing.quantity),
              unit: ing.unit || '',
              notes: ing.notes || ''
            };
          } else {
            return {
              name: ing,
              quantity: 0,
              unit: ''
            };
          }
        });
      }
      
      // Parse servings to number
      const parseServings = (servingText) => {
        if (!servingText) return 4;
        const match = servingText.match(/\d+/);
        return match ? parseInt(match[0]) : 4;
      };
      
      const recipeData = {
        title: finalTitle,
        permalink: finalSlug,
        description: parsedRecipe.description || '',
        ingredients: ingredientsForSave,
        steps: safeSteps,
        notes: safeNotes,
        defaultServings: parseServings(parsedRecipe.servings),
        servingUnits: 'servings',
        scalable: true,
        prepTime: parsedRecipe.prepTime || '',
        cookTime: parsedRecipe.cookTime || '',
        totalTime: parsedRecipe.totalTime || '',
        difficulty: parsedRecipe.difficulty || '',
        cuisine: '',
        tags: [...(parsedRecipe.tags || []), 'ai-generated'],
        // Store additional metadata if available
        nutrition: parsedRecipe.nutrition || {}
      };

      console.log('📄 Saving AI-generated recipe:', recipeData);
      await onSave(recipeData);
      message.success(`Recipe "${finalTitle}" saved successfully!`);
      resetForm();
    } catch (error) {
      console.error('Error saving AI recipe:', error);
      message.error('Failed to save recipe. Please try again.');
    }
  };

  // Generate slug from title
  const generateSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Update slug when title changes (only if user hasn't manually edited slug)
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitleValue(newTitle);
    
    // Update form field for title
    form.setFieldsValue({ title: newTitle });
    
    if (!manualSlugEdit) {
      const newSlug = generateSlug(newTitle);
      setSlugValue(newSlug);
      form.setFieldsValue({ slug: newSlug });
    }
  };

  // Track manual slug edits
  const handleSlugChange = (e) => {
    const newSlug = e.target.value;
    setSlugValue(newSlug);
    setManualSlugEdit(true);
    
    // Update form field for slug
    form.setFieldsValue({ slug: newSlug });
  };

  const resetForm = () => {
    form.resetFields();
    setTitleValue('');
    setSlugValue('');
    setManualSlugEdit(false);
    setShowManualMode(false); // Reset to AI mode
    setAiMessages([]);
    setAiLoading(false);
    setChatInput('');
    setCurrentRecipePreview(null);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Use the current state values instead of form values to ensure we get the latest data
      const finalTitle = titleValue || values.title;
      const finalSlug = slugValue || values.slug;
      
      // Validate slug format
      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(finalSlug)) {
        message.error('Slug can only contain lowercase letters, numbers, and hyphens');
        return;
      }

      const recipeData = {
        title: finalTitle,
        permalink: finalSlug, // Use permalink instead of slug
        // Initialize with empty defaults
        description: '',
        ingredients: [],
        steps: [],
        notes: '',
        defaultServings: 4,
        servingUnits: 'servings',
        scalable: true,
        // Additional fields for recipes
        prepTime: '',
        cookTime: '',
        totalTime: '',
        difficulty: '',
        cuisine: '',
        tags: []
      };

      await onSave(recipeData);
      resetForm();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Detect message format for display labels
  const detectMessageFormat = (text) => {
    // Check if it looks like JSON first (handle both plain JSON and markdown-wrapped JSON)
    const trimmedText = text.trim();
    
    // Check for markdown-wrapped JSON (```json ... ```)
    const hasJsonMarkdown = trimmedText.startsWith('```json') || trimmedText.includes('```json');
    
    // For direct JSON structure check
    const startsWithBrace = trimmedText.startsWith('{');
    const endsWithBrace = trimmedText.endsWith('}') || trimmedText.endsWith('```');
    
    // Check if it contains JSON recipe structure (even if wrapped in markdown)
    const hasJsonRecipeContent = (text.includes('"title"') || text.includes('"ingredients"') || text.includes('"steps"')) &&
                                 (text.includes('{') && text.includes('}'));
    
    const hasJsonStructure = (startsWithBrace && (endsWithBrace || text.includes('}'))) || 
                            (hasJsonMarkdown && hasJsonRecipeContent);
    
    console.log('🔍 Format detection for text:', {
      startsWithBrace,
      endsWithBrace,
      hasJsonMarkdown,
      hasJsonRecipeContent,
      hasJsonStructure,
      textStart: text.substring(0, 50),
      hasTitle: text.includes('"title"'),
      hasIngredients: text.includes('"ingredients"'),
      hasSteps: text.includes('"steps"')
    });
    
    if (hasJsonStructure) {
      // Try to parse it, but still label as JSON Recipe even if parsing fails
      try {
        const parsed = parseJsonRecipe(text);
        if (parsed && (parsed.title || parsed.ingredients || parsed.steps)) {
          console.log('✅ Valid JSON recipe detected');
          return 'JSON Recipe';
        }
      } catch (e) {
        // Still looks like JSON structure, even if malformed
        console.log('JSON parsing failed but structure detected:', e.message);
      }
      // If it looks like JSON structure but parsing failed, still call it JSON
      console.log('🔧 JSON structure detected (possibly markdown-wrapped), labeling as JSON Recipe');
      return 'JSON Recipe';
    }
    
    // Check if it's structured markdown recipe
    const lowerText = text.toLowerCase();
    const hasMarkdownHeaders = text.includes('##') || text.includes('###');
    const hasMarkdownLists = text.includes('- ') || /^\d+\./m.test(text);
    const isRecipeContent = lowerText.includes('ingredients') && lowerText.includes('instructions');
    
    if (hasMarkdownHeaders && hasMarkdownLists && isRecipeContent) {
      return 'Markdown Recipe';
    }
    
    // Check if it looks like a plain text recipe (more flexible detection)
    if (isRecipeContent && (hasMarkdownLists || /\d+\.?\s+(?:oz|cup|tsp|tbsp|pound|lb|kg|gram|g)\b/i.test(text))) {
      return 'Text Recipe';
    }
    
    // Check if it's a conversational response
    if (text.length > 50 && !isRecipeContent) {
      return 'Chat Response';
    }
    
    // Default to plain text
    return 'Text';
  };

  // Get format label styling
  const getFormatLabelStyle = (format) => {
    const baseStyle = {
      fontSize: 9,
      padding: '2px 5px',
      borderRadius: 3,
      fontWeight: '600',
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      opacity: 0.8
    };
    
    switch (format) {
      case 'JSON Recipe':
        return {
          ...baseStyle,
          background: '#e6f7ff',
          color: '#0050b3',
          border: '1px solid #91d5ff'
        };
      case 'Markdown Recipe':
        return {
          ...baseStyle,
          background: '#f6ffed',
          color: '#389e0d',
          border: '1px solid #b7eb8f'
        };
      case 'Text Recipe':
        return {
          ...baseStyle,
          background: '#fff2e8',
          color: '#d4380d',
          border: '1px solid #ffbb96'
        };
      case 'Chat Response':
        return {
          ...baseStyle,
          background: '#f9f0ff',
          color: '#722ed1',
          border: '1px solid #d3adf7'
        };
      default:
        return {
          ...baseStyle,
          background: '#f5f5f5',
          color: '#595959',
          border: '1px solid #d9d9d9'
        };
    }
  };

  // Get response type styling
  const getResponseTypeStyle = (responseType) => {
    const baseStyle = {
      fontSize: 9,
      padding: '2px 5px',
      borderRadius: 3,
      fontWeight: '600',
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      opacity: 0.8
    };
    
    switch (responseType) {
      case 'recipe':
        return {
          ...baseStyle,
          background: '#e6f7ff',
          color: '#0050b3',
          border: '1px solid #91d5ff'
        };
      case 'suggestions':
        return {
          ...baseStyle,
          background: '#f6ffed',
          color: '#389e0d',
          border: '1px solid #b7eb8f'
        };
      case 'advice':
        return {
          ...baseStyle,
          background: '#f9f0ff',
          color: '#722ed1',
          border: '1px solid #d3adf7'
        };
      default:
        return {
          ...baseStyle,
          background: '#f5f5f5',
          color: '#595959',
          border: '1px solid #d9d9d9'
        };
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages]);

  // Handle chat input submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: chatInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setAiMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setAiLoading(true);

    try {
      // Convert messages to conversation history format for AI service
      const conversationHistory = aiMessages.map(msg => ({
        type: msg.isUser ? 'user' : 'ai',
        content: msg.text
      }));

      // Get AI response using the real service
      const aiResponse = await recipeAIService.generateResponse(
        currentInput,
        null, // No existing recipe context
        conversationHistory
      );

      // Handle both old string format and new structured format
      const responseText = typeof aiResponse === 'string' ? aiResponse : aiResponse.text;
      const providerInfo = typeof aiResponse === 'object' ? aiResponse : null;

      const aiMessage = {
        id: Date.now() + 1,
        text: responseText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        provider: providerInfo?.provider,
        providerName: providerInfo?.providerName,
        model: providerInfo?.model
      };
      
      setAiMessages(prev => [...prev, aiMessage]);
      
      // Check if this is a complete recipe and update preview
      if (isCompleteRecipe(responseText)) {
        const parsedRecipe = parseRecipeFromText(responseText);
        if (parsedRecipe) {
          setCurrentRecipePreview(parsedRecipe);
        }
      }
    } catch (error) {
      console.error('AI service error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `I'm having trouble connecting to the AI service right now. Could you try rephrasing your question? I'm here to help you create a great recipe!`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle showing recipe preview from chat
  const handleShowRecipePreview = (messageText) => {
    console.log('🔍 DEBUG: handleShowRecipePreview called with messageText length:', messageText.length);
    const parsedRecipe = parseRecipeFromText(messageText);
    console.log('🔍 DEBUG: parsedRecipe result:', {
      hasRecipe: !!parsedRecipe,
      title: parsedRecipe?.title,
      hasIngredients: parsedRecipe?.ingredients && parsedRecipe.ingredients.length > 0,
      hasIngredientsGrouped: !!parsedRecipe?.ingredientsGrouped,
      ingredientsGroupedKeys: parsedRecipe?.ingredientsGrouped ? Object.keys(parsedRecipe.ingredientsGrouped) : 'null'
    });
    if (parsedRecipe) {
      setCurrentRecipePreview(parsedRecipe);
      console.log('✅ DEBUG: Recipe preview set successfully');
    } else {
      console.log('❌ DEBUG: Failed to parse recipe from message text');
    }
  };

  // Handle saving the current recipe preview
  const handleSaveCurrentRecipe = async () => {
    if (currentRecipePreview) {
      await handleSaveAiRecipe(JSON.stringify(currentRecipePreview));
    }
  };

  // Handle clicking on a recipe suggestion to get the full recipe
  const handleRequestFullRecipe = async (recipeName) => {
    const userMessage = {
      id: Date.now(),
      text: `Please give me the complete recipe for ${recipeName}`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiLoading(true);

    try {
      // Convert messages to conversation history format for AI service
      const conversationHistory = aiMessages.map(msg => ({
        type: msg.isUser ? 'user' : 'ai',
        content: msg.text
      }));

      // Get AI response for full recipe
      const aiResponse = await recipeAIService.generateResponse(
        userMessage.text,
        null,
        conversationHistory
      );

      // Handle both old string format and new structured format
      const responseText = typeof aiResponse === 'string' ? aiResponse : aiResponse.text;
      const providerInfo = typeof aiResponse === 'object' ? aiResponse : null;

      const aiMessage = {
        id: Date.now() + 1,
        text: responseText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        provider: providerInfo?.provider,
        providerName: providerInfo?.providerName,
        model: providerInfo?.model
      };
      
      setAiMessages(prev => [...prev, aiMessage]);
      
      // Check if this is a complete recipe and update preview
      if (isCompleteRecipe(responseText)) {
        const parsedRecipe = parseRecipeFromText(responseText);
        if (parsedRecipe) {
          setCurrentRecipePreview(parsedRecipe);
        }
      }
    } catch (error) {
      console.error('AI service error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `I'm having trouble getting the full recipe for ${recipeName}. Could you try asking again?`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal
      key={visible ? 'modal-open' : 'modal-closed'} // Force re-render when opening
      title={showManualMode ? 'Create New Recipe' : 'Create Recipe with Sous Chef AI'}
      open={visible}
      onCancel={handleCancel}
      footer={
        !showManualMode ? [
          <Button 
            key="manual-mode" 
            onClick={() => {
              console.log('🔄 Switching to manual mode');
              setShowManualMode(true);
            }}
            style={{ marginRight: 'auto' }}
          >
            📝 Switch to Manual Entry
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>,
          ...(currentRecipePreview ? [
            <div key="recipe-slug-info" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              fontSize: 12,
              color: '#666',
              padding: '0 8px'
            }}>
              <span>URL:</span>
              <code style={{ 
                background: '#f5f5f5', 
                padding: '2px 6px', 
                borderRadius: 4,
                fontSize: 11 
              }}>
                /crafts/recipes/{generateSlug(currentRecipePreview.title)}
              </code>
            </div>,
            <Button 
              key="save-recipe" 
              type="primary" 
              style={{
                background: '#52c41a',
                borderColor: '#52c41a',
                fontWeight: 600
              }}
              onClick={handleSaveCurrentRecipe}
            >
              💾 Save Recipe
            </Button>
          ] : [])
        ] : [
          <Button 
            key="ai-mode" 
            onClick={() => {
              console.log('🔄 Switching to AI mode');
              setShowManualMode(false);
            }}
            style={{ marginRight: 'auto' }}
          >
            🤖 Switch to AI Mode
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSubmit} loading={loading}>
            Create Recipe
          </Button>
        ]
      }
      width={!showManualMode ? 1200 : 600}
      style={{ top: 20 }}
    >
      {(() => {
        console.log('🎨 Rendering modal content:', { showManualMode, visible });
        console.log('🎨 Will render:', showManualMode ? 'MANUAL MODE' : 'AI MODE');
        console.log('🎨 Manual condition result:', showManualMode ? true : false);
      })()}
      {showManualMode ? (
        <>
          <Alert
            message="Manual Recipe Creation"
            description="Create a new recipe manually with a custom title and URL slug. You'll add ingredients and instructions after creation."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              title: titleValue,
              slug: slugValue
            }}
          >
            <Form.Item
              name="title"
              label="Recipe Title"
              rules={[{ required: true, message: 'Please enter a recipe title' }]}
            >
              <Input 
                placeholder="Enter recipe title"
                value={titleValue}
                onChange={handleTitleChange}
              />
            </Form.Item>

            <Form.Item
              name="slug"
              label={
                <div>
                  Permalink (URL Slug)
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    This will be used in the URL: /crafts/recipes/<strong>{slugValue || 'your-slug'}</strong>
                  </Text>
                </div>
              }
              rules={[
                { required: true, message: 'Please enter a URL slug' },
                { 
                  pattern: /^[a-z0-9-]+$/, 
                  message: 'Slug can only contain lowercase letters, numbers, and hyphens' 
                }
              ]}
              extra={
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  ⚠️ <strong>Important:</strong> The slug should not be changed after creation as it affects the recipe's permanent URL.
                  Use lowercase letters, numbers, and hyphens only.
                </div>
              }
            >
              <Input 
                placeholder="recipe-url-slug"
                value={slugValue}
                onChange={handleSlugChange}
              />
            </Form.Item>
          </Form>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', height: 500, gap: 20 }}>
            {/* Left Column - Recipe Preview */}
            <div style={{ 
              flex: 1, 
              borderRight: '1px solid #f0f0f0', 
              paddingRight: 20,
              overflowY: 'auto'
            }}>
            {currentRecipePreview ? (
              <div style={{ fontSize: 14 }}>
                <h2 style={{ 
                  fontSize: 20, 
                  fontWeight: 'bold', 
                  marginBottom: 8, 
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  🍽️ {currentRecipePreview.title}
                </h2>
              
                {currentRecipePreview.description && (
                  <p style={{ 
                    fontSize: 14, 
                    color: '#666', 
                    marginBottom: 12,
                    fontStyle: 'italic'
                  }}>
                    {currentRecipePreview.description}
                  </p>
                )}
                
                {/* Recipe Meta */}
                <div style={{ 
                  display: 'flex', 
                  gap: 16, 
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#666'
                }}>
                  {currentRecipePreview.prepTime && (
                    <span>⏱️ Prep: {currentRecipePreview.prepTime}</span>
                  )}
                  {currentRecipePreview.cookTime && (
                    <span>🔥 Cook: {currentRecipePreview.cookTime}</span>
                  )}
                  {currentRecipePreview.servings && (
                    <span>👥 Serves: {currentRecipePreview.servings}</span>
                  )}
                  {currentRecipePreview.difficulty && (
                    <span>📊 {currentRecipePreview.difficulty}</span>
                  )}
                </div>
                
                {/* Ingredients */}
                {((currentRecipePreview.ingredients && currentRecipePreview.ingredients.length > 0) || currentRecipePreview.ingredientsGrouped) && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ 
                      fontSize: 16, 
                      fontWeight: '600', 
                      marginBottom: 8, 
                      color: '#555' 
                    }}>
                      🥗 Ingredients
                    </h3>
                    
                    {(() => {
                      // Debug logging for ingredient rendering decision
                      console.log('🔍 DEBUG: Ingredient rendering decision:', {
                        hasIngredients: !!(currentRecipePreview.ingredients && currentRecipePreview.ingredients.length > 0),
                        hasIngredientsGrouped: !!currentRecipePreview.ingredientsGrouped,
                        ingredientsGroupedType: typeof currentRecipePreview.ingredientsGrouped,
                        ingredientsGroupedKeys: currentRecipePreview.ingredientsGrouped ? Object.keys(currentRecipePreview.ingredientsGrouped) : 'null',
                        willRenderGrouped: !!currentRecipePreview.ingredientsGrouped
                      });
                      
                      return currentRecipePreview.ingredientsGrouped ? (
                        // Render grouped ingredients as tables
                        (() => {
                          console.log('🔍 DEBUG: Rendering grouped ingredients as tables');
                          console.log('🔍 DEBUG: ingredientsGrouped keys:', Object.keys(currentRecipePreview.ingredientsGrouped));
                          return (
                            <div>
                              {Object.entries(currentRecipePreview.ingredientsGrouped).map(([groupName, groupIngredients], groupIdx) => (
                                <div key={groupIdx} style={{ marginBottom: 16 }}>
                                  <h4 style={{ 
                                    fontSize: 14, 
                                    fontWeight: '600', 
                                    marginBottom: 8, 
                                    color: '#666',
                                    borderBottom: '1px solid #e8e8e8',
                                    paddingBottom: 2
                                  }}>
                                    {groupName}
                                  </h4>
                                  <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '13px',
                                    marginBottom: 12
                                  }}>
                                    <tbody>
                                      {Array.isArray(groupIngredients) && groupIngredients.map((ingredient, idx) => (
                                        <tr key={idx} style={{ 
                                          borderBottom: '1px solid #f0f0f0',
                                          verticalAlign: 'top'
                                        }}>
                                          <td style={{ 
                                            padding: '6px 8px 6px 0',
                                            width: '80px',
                                            fontWeight: '500',
                                            color: '#555'
                                          }}>
                                            {typeof ingredient === 'object' ? (
                                              [
                                                typeof ingredient.quantity === 'number' && ingredient.quantity > 0 ? ingredient.quantity : '',
                                                ingredient.unit
                                              ].filter(p => p).join(' ')
                                            ) : (
                                              // Try to extract quantity from string
                                              ingredient.match(/^[\d\s\/\-\.]+(?:\s*\w+)?/) ? 
                                                ingredient.match(/^[\d\s\/\-\.]+(?:\s*\w+)?/)[0].trim() : 
                                                ''
                                            )}
                                          </td>
                                          <td style={{ 
                                            padding: '6px 0',
                                            lineHeight: 1.4
                                          }}>
                                            {typeof ingredient === 'object' ? (
                                              <>
                                                <span>{ingredient.name}</span>
                                                {ingredient.notes && (
                                                  <span style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                                                    {' '}({ingredient.notes})
                                                  </span>
                                                )}
                                              </>
                                            ) : (
                                              // Remove quantity from string ingredient
                                              ingredient.replace(/^[\d\s\/\-]+(?:\s*\w+)?\s*/, '').trim() || ingredient
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ))}
                            </div>
                          );
                        })()
                      ) : (
                        // Render simple ingredient list
                        (() => {
                          console.log('🔍 DEBUG: Rendering simple ingredient list');
                          console.log('🔍 DEBUG: ingredients length:', currentRecipePreview.ingredients?.length || 0);
                          return (
                            <ul style={{ 
                              paddingLeft: 20, 
                              marginBottom: 0,
                              lineHeight: 1.6
                            }}>
                              {currentRecipePreview.ingredients.map((ingredient, idx) => (
                                <li key={idx} style={{ marginBottom: 4 }}>
                                  {typeof ingredient === 'object' ? (
                                    // Handle ingredient objects
                                    <>
                                      <span style={{ fontWeight: '500' }}>
                                        {[
                                          typeof ingredient.quantity === 'number' && ingredient.quantity > 0 ? ingredient.quantity : '',
                                          ingredient.unit
                                        ].filter(p => p).join(' ')}
                                      </span>
                                      {' '}
                                      <span>{ingredient.name}</span>
                                      {ingredient.notes && (
                                        <span style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                                          {' '}({ingredient.notes})
                                        </span>
                                      )}
                                    </>
                                  ) : ingredient.startsWith && ingredient.startsWith('**') && ingredient.endsWith(':**') ? (
                                    // Handle grouped headers in flat format
                                    <strong style={{ color: '#666', fontSize: '14px' }}>
                                      {ingredient.replace(/\*\*/g, '').replace(':', '')}
                                    </strong>
                                  ) : (
                                    ingredient
                                  )}
                                </li>
                              ))}
                            </ul>
                          );
                        })()
                      );
                    })()}
                  </div>
                )}
                
                {/* Instructions */}
                {currentRecipePreview.steps && currentRecipePreview.steps.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ 
                      fontSize: 16, 
                      fontWeight: '600', 
                      marginBottom: 8, 
                      color: '#555' 
                    }}>
                      👨‍🍳 Instructions
                    </h3>
                    <ol style={{ 
                      paddingLeft: 20, 
                      marginBottom: 0,
                      lineHeight: 1.6
                    }}>
                      {currentRecipePreview.steps.map((step, idx) => (
                        <li key={idx} style={{ marginBottom: 8 }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {/* Notes */}
                {currentRecipePreview.notes && currentRecipePreview.notes.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ 
                      fontSize: 16, 
                      fontWeight: '600', 
                      marginBottom: 8, 
                      color: '#555' 
                    }}>
                      💡 Notes & Tips
                    </h3>
                    <ul style={{ 
                      paddingLeft: 20, 
                      marginBottom: 0,
                      lineHeight: 1.6
                    }}>
                      {currentRecipePreview.notes.map((note, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Tags */}
                {currentRecipePreview.tags && currentRecipePreview.tags.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: 4, 
                      flexWrap: 'wrap' 
                    }}>
                      {currentRecipePreview.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#f0f2ff',
                            color: '#1890ff',
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid #d6e4ff'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                marginTop: 60,
                padding: 20,
                border: '2px dashed #e8e8e8',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                  No Recipe Yet
                </div>
                <Text type="secondary">
                  Ask the AI to create a recipe and it will appear here
                </Text>
              </div>
            )}
          </div>

          {/* Right Column - Chat */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%'
          }}>
            {/* Chat Messages */}
            <div style={{
              flex: 1,
              background: '#fafafa',
              borderRadius: 8,
              padding: 16,
              overflowY: 'auto',
              marginBottom: 16,
              minHeight: 350,
            }}>
              {aiMessages.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  marginTop: 60,
                  padding: 20
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🤖👨‍🍳</div>
                  <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
                    AI Recipe Assistant
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
                    Hi! I'm ready to help you create a recipe. Try asking:
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    color: '#888', 
                    lineHeight: 1.6,
                    textAlign: 'left',
                    maxWidth: 300,
                    margin: '0 auto'
                  }}>
                    • "Create a recipe for chicken parmesan"<br/>
                    • "What can I make with garlic and olives?"<br/>
                    • "I have tomatoes and basil, what can I make?"<br/>
                    • "Give me a chocolate cake recipe"
                  </div>
                </div>
              )}
              
              {aiMessages.map(message => {
                const messageFormat = message.isUser ? null : detectMessageFormat(message.text);
                const responseType = !message.isUser ? getResponseType(message.text) : null;
                
                return (
                  <div key={message.id} style={{
                    marginBottom: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.isUser ? 'flex-end' : 'flex-start'
                  }}>
                    {/* Provider Label for AI messages - above the message */}
                    {!message.isUser && message.providerName && (
                      <div style={{
                        fontSize: 11,
                        color: '#666',
                        marginBottom: 4,
                        padding: '2px 8px',
                        background: '#f5f5f5',
                        borderRadius: 4,
                        fontWeight: '500'
                      }}>
                        {message.providerName}
                      </div>
                    )}
                    
                    <div style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: 16,
                      background: message.isUser ? '#1890ff' : '#fff',
                      color: message.isUser ? '#fff' : '#333',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontSize: 14,
                      lineHeight: 1.4
                    }}>
                      <div>
                        {message.isUser ? (
                          message.text
                        ) : responseType === 'recipe' ? (
                          // For complete recipe messages, show commentary and a clickable link
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              {(() => {
                                // Try to extract commentary from JSON recipe
                                try {
                                  const parsedRecipe = parseRecipeFromText(message.text);
                                  if (parsedRecipe && parsedRecipe.commentary) {
                                    return parsedRecipe.commentary;
                                  }
                                } catch (e) {
                                  // Fall back to generic message
                                }
                                return "🍽️ I've created a complete recipe for you!";
                              })()}
                            </div>
                            <Button
                              type="link"
                              size="small"
                              style={{
                                padding: 0,
                                height: 'auto',
                                fontSize: 13,
                                fontWeight: 500
                              }}
                              onClick={() => handleShowRecipePreview(message.text)}
                            >
                              📖 View Recipe →
                            </Button>
                          </div>
                        ) : responseType === 'suggestions' ? (
                          // For recipe suggestions, show clickable recipe links
                          <div>
                            <div style={{ marginBottom: 12, fontWeight: 500 }}>
                              🍽️ Here are some recipe suggestions:
                            </div>
                            {parseRecipeSuggestions(message.text).map((suggestion, idx) => (
                              <div key={idx} style={{ 
                                marginBottom: 8, 
                                padding: '8px 12px', 
                                background: '#f8f9fa', 
                                borderRadius: 8,
                                border: '1px solid #e9ecef'
                              }}>
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  gap: 8
                                }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, marginBottom: 2 }}>
                                      {suggestion.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#666' }}>
                                      {suggestion.description}
                                    </div>
                                  </div>
                                  <Button
                                    type="link"
                                    size="small"
                                    style={{
                                      padding: '4px 8px',
                                      height: 'auto',
                                      fontSize: 11,
                                      fontWeight: 500
                                    }}
                                    onClick={() => handleRequestFullRecipe(suggestion.name)}
                                  >
                                    Get Recipe →
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // For advice/conversation messages, show as markdown
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                              strong: ({ children }) => <strong style={{ fontWeight: 'bold', color: '#222' }}>{children}</strong>
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                    
                    {/* Timestamp and Format Info */}
                    <div style={{ 
                      fontSize: 11, 
                      opacity: 0.7, 
                      marginTop: 4,
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center'
                    }}>
                      <span>{message.timestamp}</span>
                      {!message.isUser && responseType && (
                        <span style={getResponseTypeStyle(responseType)}>
                          {responseType === 'recipe' ? 'Complete Recipe (JSON)' : 
                           responseType === 'suggestions' ? 'Recipe Suggestions (JSON)' : 
                           'Recipe Advice (Plain text)'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {aiLoading && (
                <div style={{
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 16,
                    background: '#fff',
                    color: '#666',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    fontSize: 14,
                    fontStyle: 'italic'
                  }}>
                    <span>🤔 Thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: 8 }}>
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me about your recipe..."
                disabled={aiLoading}
                style={{ flex: 1 }}
                onPressEnter={handleChatSubmit}
              />
              <Button 
                type="primary" 
                htmlType="submit" 
                disabled={aiLoading || !chatInput.trim()}
                style={{ minWidth: 60 }}
              >
                Send
              </Button>
            </form>
          </div>
        </div>
        </>
      )}
    </Modal>
  );
};

export default NewRecipeForm;
