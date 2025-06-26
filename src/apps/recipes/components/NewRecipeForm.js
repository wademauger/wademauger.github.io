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
  const [form] = Form.useForm();
  const [titleValue, setTitleValue] = useState('');
  const [slugValue, setSlugValue] = useState('');
  const [manualSlugEdit, setManualSlugEdit] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  // Preserve original form values when switching to AI mode
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const messagesEndRef = useRef(null);

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
      
      // Validate that it has the expected recipe structure
      if (parsed && (parsed.title || parsed.ingredients || parsed.steps)) {
        // Handle both simple array and grouped ingredient formats
        let ingredients = [];
        
        if (parsed.ingredients) {
          if (Array.isArray(parsed.ingredients)) {
            // Simple array format
            ingredients = parsed.ingredients.map(ing => {
              if (typeof ing === 'object') {
                const parts = [ing.quantity, ing.unit, ing.name].filter(p => p && p.trim()).join(' ');
                return ing.notes ? `${parts} (${ing.notes})` : parts;
              }
              return ing;
            });
          } else if (typeof parsed.ingredients === 'object') {
            // Grouped format - preserve the structure but also create a flat list for display
            const flatIngredients = [];
            Object.entries(parsed.ingredients).forEach(([group, items]) => {
              if (Array.isArray(items)) {
                flatIngredients.push(`**${group}:**`);
                items.forEach(ing => {
                  if (typeof ing === 'object') {
                    const parts = [ing.quantity, ing.unit, ing.name].filter(p => p && p.trim()).join(' ');
                    flatIngredients.push(ing.notes ? `${parts} (${ing.notes})` : parts);
                  } else {
                    flatIngredients.push(ing);
                  }
                });
              }
            });
            ingredients = flatIngredients;
          }
        }
        
        return {
          title: parsed.title || 'AI Generated Recipe',
          description: parsed.description || '',
          ingredients: ingredients,
          ingredientsGrouped: Array.isArray(parsed.ingredients) ? null : parsed.ingredients, // Preserve original grouped structure
          steps: parsed.steps || [],
          notes: parsed.notes || [],
          prepTime: parsed.prepTime || '',
          cookTime: parsed.cookTime || '',
          servings: parsed.servings || '',
          difficulty: parsed.difficulty || '',
          tags: parsed.tags || [],
          nutrition: parsed.nutrition || {}
        };
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
    // First check if it looks like JSON structure (even if malformed)
    const trimmedText = text.trim();
    const looksLikeJson = trimmedText.startsWith('{') && trimmedText.endsWith('}') &&
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
    
    // Try to parse JSON if it looks like JSON
    try {
      const parsed = parseJsonRecipe(text);
      if (parsed && parsed.title && parsed.ingredients && parsed.steps) {
        return parsed.ingredients.length > 0 && parsed.steps.length > 0;
      }
    } catch (e) {
      // Continue with markdown check
    }
    
    // Fall back to markdown detection - make it more flexible
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
    
    const isComplete = hasTitle && hasIngredients && hasInstructions;
    console.log('🔍 Recipe detection:', { hasTitle, hasIngredients, hasInstructions, isComplete });
    
    return isComplete;
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

      // Use preserved original title and slug if available, otherwise fall back to AI-generated values
      const finalTitle = originalTitle || parsedRecipe.title;
      const finalSlug = originalSlug || generateSlug(parsedRecipe.title);
      
      console.log('📝 Using recipe title and slug:', { 
        finalTitle, 
        finalSlug, 
        fromOriginal: !!originalTitle,
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
                  quantity: ing.quantity || '',
                  unit: ing.unit || '',
                  notes: ing.notes || ''
                });
              } else {
                ingredientsForSave.push({
                  name: ing,
                  quantity: '',
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
              quantity: ing.quantity || '',
              unit: ing.unit || '',
              notes: ing.notes || ''
            };
          } else {
            return {
              name: ing,
              quantity: '',
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
    setShowAiChat(false);
    setAiMessages([]);
    setAiLoading(false);
    setChatInput('');
    // Reset preserved values
    setOriginalTitle('');
    setOriginalSlug('');
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

  // Handle AI button click
  const handleCreateWithAI = async () => {
    // Validate and preserve the current form values before switching to AI mode
    try {
      const values = await form.validateFields(['title']);
      
      // Preserve the original title and slug from the form
      const currentTitle = titleValue || values.title;
      const currentSlug = slugValue || generateSlug(currentTitle);
      
      setOriginalTitle(currentTitle);
      setOriginalSlug(currentSlug);
      
      console.log('🔄 Switching to AI mode. Preserving:', { 
        originalTitle: currentTitle, 
        originalSlug: currentSlug 
      });
    } catch (error) {
      message.error('Please enter a recipe title before using AI assistance');
      return;
    }
    
    // Get the current title value
    let title = titleValue || 'a new dish';
    setShowAiChat(true);
    setAiLoading(true);
    
    // Pre-send user message
    const userMsg = { 
      id: Date.now(), 
      text: `Can you give me a recipe for ${title}?`, 
      isUser: true, 
      timestamp: new Date().toLocaleTimeString() 
    };
    setAiMessages([userMsg]);
    
    try {
      // Use the real AI service
      const aiResponse = await recipeAIService.generateResponse(
        userMsg.text,
        null, // No existing recipe context
        [] // No conversation history yet
      );
      
      // Handle both old string format and new structured format
      const responseText = typeof aiResponse === 'string' ? aiResponse : aiResponse.text;
      const providerInfo = typeof aiResponse === 'object' ? aiResponse : null;
      
      const botMsg = { 
        id: Date.now() + 1, 
        text: responseText, 
        isUser: false, 
        timestamp: new Date().toLocaleTimeString(),
        provider: providerInfo?.provider,
        providerName: providerInfo?.providerName,
        model: providerInfo?.model
      };
      setAiMessages([userMsg, botMsg]);
    } catch (error) {
      console.error('AI service error:', error);
      const errorMsg = { 
        id: Date.now() + 1, 
        text: `Sorry, I'm having trouble connecting to the AI service. Here's what I can suggest for ${title}: Try starting with basic ingredients like salt, pepper, and your main protein or vegetable. Would you like me to help you build the recipe step by step?`, 
        isUser: false, 
        timestamp: new Date().toLocaleTimeString() 
      };
      setAiMessages([userMsg, errorMsg]);
    } finally {
      setAiLoading(false);
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

  return (
    <Modal
      title={showAiChat && originalTitle ? `Create "${originalTitle}" Recipe with AI` : showAiChat ? 'Create Recipe with AI' : 'Create New Recipe'}
      open={visible}
      onCancel={handleCancel}
      footer={
        showAiChat ? [
          <Button key="back" onClick={() => setShowAiChat(false)}>
            ← Back to Form
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>
        ] : [
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="ai"
            style={{
              background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
              color: '#fff',
              fontWeight: 600,
              border: 0
            }}
            loading={aiLoading}
            onClick={handleCreateWithAI}
          >
            🤖 Create Recipe with AI
          </Button>,
          <Button key="save" type="primary" onClick={handleSubmit} loading={loading}>
            Create Recipe
          </Button>
        ]
      }
      width={showAiChat ? 700 : 600}
      style={{ top: 20 }}
    >
      {!showAiChat ? (
        <>
          <Alert
            message="Recipe Creation"
            description="Create a new recipe with a title and permanent URL slug. You'll be able to add ingredients, instructions, and other details after creation."
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
        <div style={{ display: 'flex', flexDirection: 'column', height: 400 }}>
          {/* Chat Header */}
          <div style={{ 
            borderBottom: '1px solid #f0f0f0', 
            paddingBottom: 12, 
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>

          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            background: '#fafafa',
            borderRadius: 8,
            padding: 16,
            overflowY: 'auto',
            marginBottom: 16,
            minHeight: 250,
            maxHeight: 250
          }}>
            {aiMessages.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic',
                marginTop: 60
              }}>
                Hi! I'm ready to help you create a recipe. Just ask me anything!
              </div>
            )}
            
            {aiMessages.map(message => {
              const messageFormat = message.isUser ? null : detectMessageFormat(message.text);
              
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
                      ) : (
                        (() => {
                          // Try to render as structured JSON recipe first
                          const jsonRecipe = parseJsonRecipe(message.text);
                          if (jsonRecipe) {
                            return (
                              <div style={{ fontSize: 14 }}>
                                <h2 style={{ 
                                  fontSize: 18, 
                                  fontWeight: 'bold', 
                                  marginBottom: 8, 
                                  color: '#333',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8
                                }}>
                                  🍽️ {jsonRecipe.title}
                                </h2>
                              
                              {jsonRecipe.description && (
                                <p style={{ 
                                  fontSize: 14, 
                                  color: '#666', 
                                  marginBottom: 12,
                                  fontStyle: 'italic'
                                }}>
                                  {jsonRecipe.description}
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
                                {jsonRecipe.prepTime && (
                                  <span>⏱️ Prep: {jsonRecipe.prepTime}</span>
                                )}
                                {jsonRecipe.cookTime && (
                                  <span>🔥 Cook: {jsonRecipe.cookTime}</span>
                                )}
                                {jsonRecipe.servings && (
                                  <span>👥 Serves: {jsonRecipe.servings}</span>
                                )}
                                {jsonRecipe.difficulty && (
                                  <span>📊 {jsonRecipe.difficulty}</span>
                                )}
                              </div>
                              
                              {/* Ingredients */}
                              {((jsonRecipe.ingredients && jsonRecipe.ingredients.length > 0) || jsonRecipe.ingredientsGrouped) && (
                                <div style={{ marginBottom: 16 }}>
                                  <h3 style={{ 
                                    fontSize: 16, 
                                    fontWeight: '600', 
                                    marginBottom: 8, 
                                    color: '#555' 
                                  }}>
                                    🥗 Ingredients
                                  </h3>
                                  
                                  {jsonRecipe.ingredientsGrouped ? (
                                    // Render grouped ingredients
                                    <div>
                                      {Object.entries(jsonRecipe.ingredientsGrouped).map(([groupName, groupIngredients], groupIdx) => (
                                        <div key={groupIdx} style={{ marginBottom: 12 }}>
                                          <h4 style={{ 
                                            fontSize: 14, 
                                            fontWeight: '600', 
                                            marginBottom: 6, 
                                            color: '#666',
                                            borderBottom: '1px solid #e8e8e8',
                                            paddingBottom: 2
                                          }}>
                                            {groupName}
                                          </h4>
                                          <ul style={{ 
                                            paddingLeft: 16, 
                                            marginBottom: 0,
                                            lineHeight: 1.6
                                          }}>
                                            {Array.isArray(groupIngredients) && groupIngredients.map((ingredient, idx) => (
                                              <li key={idx} style={{ marginBottom: 3 }}>
                                                {typeof ingredient === 'object' ? (
                                                  <>
                                                    <span style={{ fontWeight: '500' }}>
                                                      {[ingredient.quantity, ingredient.unit].filter(p => p).join(' ')}
                                                    </span>
                                                    {' '}
                                                    <span>{ingredient.name}</span>
                                                    {ingredient.notes && (
                                                      <span style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                                                        {' '}({ingredient.notes})
                                                      </span>
                                                    )}
                                                  </>
                                                ) : (
                                                  ingredient
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    // Render simple ingredient list
                                    <ul style={{ 
                                      paddingLeft: 20, 
                                      marginBottom: 0,
                                      lineHeight: 1.6
                                    }}>
                                      {jsonRecipe.ingredients.map((ingredient, idx) => (
                                        <li key={idx} style={{ marginBottom: 4 }}>
                                          {ingredient.startsWith('**') && ingredient.endsWith(':**') ? (
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
                                  )}
                                </div>
                              )}
                              
                              {/* Instructions */}
                              {jsonRecipe.steps && jsonRecipe.steps.length > 0 && (
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
                                    {jsonRecipe.steps.map((step, idx) => (
                                      <li key={idx} style={{ marginBottom: 8 }}>
                                        {step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              
                              {/* Notes */}
                              {jsonRecipe.notes && jsonRecipe.notes.length > 0 && (
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
                                    {jsonRecipe.notes.map((note, idx) => (
                                      <li key={idx} style={{ marginBottom: 4 }}>
                                        {note}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Tags */}
                              {jsonRecipe.tags && jsonRecipe.tags.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                  <div style={{ 
                                    display: 'flex', 
                                    gap: 4, 
                                    flexWrap: 'wrap' 
                                  }}>
                                    {jsonRecipe.tags.map((tag, idx) => (
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
                          );
                        }
                        
                        // Fall back to markdown rendering
                        return (
                          <ReactMarkdown
                            components={{
                              h2: ({ children }) => (
                                <h2 style={{ 
                                  fontSize: 18, 
                                  fontWeight: 'bold', 
                                  marginBottom: 12, 
                                  color: '#333' 
                                }}>
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 style={{ 
                                  fontSize: 16, 
                                  fontWeight: '600', 
                                  marginTop: 16, 
                                  marginBottom: 8, 
                                  color: '#555' 
                                }}>
                                  {children}
                                </h3>
                              ),
                              ul: ({ children }) => (
                                <ul style={{ 
                                  paddingLeft: 20, 
                                  marginBottom: 12 
                                }}>
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol style={{ 
                                  paddingLeft: 20, 
                                  marginBottom: 12 
                                }}>
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li style={{ 
                                  marginBottom: 4, 
                                  lineHeight: 1.5 
                                }}>
                                  {children}
                                </li>
                              ),
                              strong: ({ children }) => (
                                <strong style={{ 
                                  fontWeight: 'bold', 
                                  color: '#222' 
                                }}>
                                  {children}
                                </strong>
                              )
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        );
                      })()
                    )}
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
                    {!message.isUser && messageFormat && (
                      <span style={getFormatLabelStyle(messageFormat)}>
                        {messageFormat}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Save Recipe Button for AI messages with complete recipes */}
                {!message.isUser && isCompleteRecipe(message.text) && (
                  <Button
                    type="primary"
                    size="small"
                    style={{
                      marginTop: 8,
                      background: '#52c41a',
                      borderColor: '#52c41a',
                      fontWeight: 600
                    }}
                    onClick={() => handleSaveAiRecipe(message.text)}
                  >
                    💾 Save Recipe
                  </Button>
                )}
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
      )}
    </Modal>
  );
};

export default NewRecipeForm;
