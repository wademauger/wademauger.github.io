import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use local models
env.allowLocalModels = false;
env.allowRemoteModels = true;

class RecipeAIService {
  constructor() {
    this.isLoading = false;
    this.isInitialized = true; // Always initialized for cloud service
    this.preferredProvider = 'grok'; // Default to Grok
    
    // Cloudflare Worker endpoint
    this.workerUrl = process.env.REACT_APP_AI_WORKER_URL || 'https://recipe-ai-proxy.ai-recipe-notepad.workers.dev';
    console.log('🚀 RecipeAIService initialized with workerUrl:', this.workerUrl);
    
    // Available AI providers through our proxy
    this.availableProviders = {
      grok: {
        name: 'Grok (X.AI)',
        description: 'X.AI\'s Grok model, excellent for creative and helpful responses',
        model: 'grok-beta'
      },
      mistral: {
        name: 'Mistral Large',
        description: 'Mistral\'s large model, great for detailed cooking instructions',
        model: 'mistral-large-latest'
      },
      openai: {
        name: 'GPT-4o Mini',
        description: 'OpenAI\'s efficient model, reliable for recipe assistance',
        model: 'gpt-4o-mini'
      }
    };
  }

  getAvailableModels() {
    return this.availableProviders;
  }

  getCurrentModel() {
    return this.preferredProvider;
  }

  async switchModel(providerName) {
    if (!this.availableProviders[providerName]) {
      throw new Error(`Provider ${providerName} is not available`);
    }
    this.preferredProvider = providerName;
    console.log(`Switched to AI provider: ${providerName}`);
  }

  async initialize(providerName = null) {
    // Cloud service is always ready
    if (providerName) {
      await this.switchModel(providerName);
    }
    return Promise.resolve();
  }

  async generateResponse(userMessage, recipeContext, conversationHistory = []) {
    await this.initialize();
    
    if (!this.isInitialized) {
      throw new Error('AI service not initialized');
    }

    // Validate worker connection
    const isConnected = await this._validateConnection();
    if (!isConnected) {
      return this._getFallbackResponse(userMessage, recipeContext);
    }

    try {
      // Determine if this is a full recipe request
      const isFullRecipeRequest = this._isFullRecipeRequest(userMessage);
      
      const requestBody = {
        userMessage,
        recipeContext,
        conversationHistory,
        preferredProvider: this.preferredProvider,
        isFullRecipeRequest, // Send this flag to the worker
        requestType: isFullRecipeRequest ? 'full_recipe' : 'assistance' // Additional clarity
      };

      console.log('🔄 Sending request to worker:', { 
        userMessage: userMessage.substring(0, 50) + '...', 
        isFullRecipeRequest,
        provider: this.preferredProvider 
      });

      const response = await fetch(this.workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Worker responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('AI Worker error:', data.error);
        return this._getFallbackResponse(userMessage, recipeContext, data.chatGptLink);
      }

      console.log(`Response from ${data.provider} (${data.model})`);
      
      // Post-process the response, especially for full recipe requests
      // (isFullRecipeRequest already determined above)
      const processedResponse = this._postProcessResponse(data.response, userMessage, recipeContext, isFullRecipeRequest);
      
      // Return structured response with provider information
      return {
        text: processedResponse,
        provider: data.provider,
        model: data.model,
        providerName: this.availableProviders[data.provider]?.name || data.provider
      };
      
    } catch (error) {
      console.error('Error calling AI worker:', error);
      return this._getFallbackResponse(userMessage, recipeContext);
    }
  }

  // No need for local model initialization with cloud service
  async _validateConnection() {
    console.log('🔍 Checking worker URL:', this.workerUrl);
    console.log('🔍 Environment variable:', process.env.REACT_APP_AI_WORKER_URL);
    
    if (!this.workerUrl || this.workerUrl.includes('your-username')) {
      console.warn('AI Worker URL not properly configured. Please set REACT_APP_AI_WORKER_URL in .env file');
      console.warn('Current workerUrl:', this.workerUrl);
      return false;
    }
    return true;
  }

  _isFullRecipeRequest(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const fullRecipeKeywords = [
      'create recipe', 'generate recipe', 'make recipe', 'write recipe',
      'full recipe', 'complete recipe', 'entire recipe', 'whole recipe',
      'recipe for', 'how to make', 'give me a recipe',
      'populate recipe', 'fill in recipe', 'expand recipe'
    ];
    
    return fullRecipeKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  _createSystemPrompt(recipe, isFullRecipeRequest = false) {
    if (isFullRecipeRequest) {
      return `You are a professional chef and recipe developer. Generate complete, detailed recipes with all necessary information.

CRITICAL: Always respond with a valid JSON object in this EXACT format:

{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "totalTime": "45 minutes",
  "servings": "4 people",
  "ingredients": [
    {
      "quantity": "2",
      "unit": "cups",
      "name": "all-purpose flour",
      "notes": "sifted (optional)"
    },
    {
      "quantity": "1",
      "unit": "tsp",
      "name": "baking powder",
      "notes": ""
    }
  ],
  "steps": [
    "Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.",
    "In a medium bowl, whisk together flour, baking soda, and salt. Set aside.",
    "In a large bowl, cream together softened butter and both sugars until light and fluffy, about 3-4 minutes."
  ],
  "notes": [
    "For chewier cookies, slightly underbake them",
    "Store in airtight container for up to 1 week",
    "Dough can be refrigerated for up to 3 days"
  ]
}

IMPORTANT: 
- Always return valid JSON only, no markdown or extra text
- Include specific temperatures, cooking times, and helpful techniques in the steps
- Make ingredients precise with quantities, units, and names
- Add helpful notes for tips, substitutions, and storage
- If nutrition info is unknown, use empty strings
- For complex recipes with multiple components, you can use grouped ingredients like this:
  "ingredients": {
    "For the Cake": [
      {"quantity": "2", "unit": "cups", "name": "flour", "notes": ""},
      {"quantity": "1", "unit": "cup", "name": "sugar", "notes": ""}
    ],
    "For the Frosting": [
      {"quantity": "1", "unit": "cup", "name": "butter", "notes": "softened"},
      {"quantity": "2", "unit": "cups", "name": "powdered sugar", "notes": ""}
    ]
  }
- Use simple array format for single-component recipes, grouped object format for multi-component recipes

Create recipes that are clear, detailed, and easy to follow.`;
    } else {
      // Build comprehensive current recipe context
      const recipeTitle = recipe?.title || 'Untitled Recipe';
      
      // Format ingredients with full details (ensure recipe.ingredients is an array)
      const ingredientsList = recipe?.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 
        ? recipe.ingredients.map((ing, index) => {
            if (typeof ing === 'object' && ing !== null) {
              return `${index + 1}. ${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ''}`.trim();
            } else {
              return `${index + 1}. ${ing}`;
            }
          }).join('\n')
        : 'No ingredients listed yet';
      
      // Format instructions with full details
      const instructionsList = recipe?.steps?.length > 0
        ? recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
        : 'No instructions listed yet';
      
      // Format notes
      const notesList = recipe?.notes?.length > 0
        ? recipe.notes.map((note, index) => `• ${note}`).join('\n')
        : 'No notes added yet';

      return `You are an expert recipe assistant helping with "${recipeTitle}".

=== CURRENT RECIPE DETAILS ===

Title: ${recipeTitle}

Ingredients:
${ingredientsList}

Instructions:
${instructionsList}

Notes:
${notesList}

=== YOUR ROLE ===
I help improve recipes by suggesting:
• Ingredient modifications, substitutions, or additions
• Cooking technique improvements and clarifications
• Timing, temperature, and measurement adjustments
• Flavor enhancements and seasoning suggestions
• Recipe organization and clarity improvements

I can see the complete current recipe above and will reference specific ingredients, steps, or notes when making suggestions. Always be specific and actionable in my advice.

IMPORTANT: If the user asks me to create a completely new recipe from scratch, I should respond with a JSON object in this format:
{
  "title": "Recipe Name",
  "description": "Brief description",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "servings": "4 people",
  "difficulty": "Easy",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "steps": ["step 1", "step 2"],
  "notes": ["tip 1", "tip 2"],
  "tags": ["tag1", "tag2"]
}

Otherwise, provide helpful advice in plain text.`;
    }
  }

  _buildConversationPrompt(systemPrompt, history, userMessage, isFullRecipeRequest = false) {
    let prompt = systemPrompt + '\n\nCONVERSATION:\n';
    
    if (isFullRecipeRequest) {
      // Add examples for full recipe generation in JSON format
      prompt += 'User: Create a recipe for chocolate chip cookies\n';
      prompt += `Assistant: {
  "title": "Classic Chocolate Chip Cookies",
  "description": "Soft and chewy chocolate chip cookies with crispy edges",
  "prepTime": "15 minutes",
  "cookTime": "10 minutes",
  "totalTime": "25 minutes",
  "servings": "24 cookies",
  "difficulty": "Easy",
  "ingredients": [
    {
      "quantity": "270",
      "unit": "grams",
      "name": "all-purpose flour",
      "notes": ""
    },
    {
      "quantity": "1",
      "unit": "tsp",
      "name": "baking soda",
      "notes": ""
    },
    {
      "quantity": "1",
      "unit": "tsp",
      "name": "salt",
      "notes": ""
    },
    {
      "quantity": "1",
      "unit": "cup",
      "name": "butter",
      "notes": "softened"
    },
    {
      "quantity": "0.75",
      "unit": "cup",
      "name": "granulated sugar",
      "notes": ""
    },
    {
      "quantity": "0.75",
      "unit": "cup",
      "name": "brown sugar",
      "notes": "packed"
    },
    {
      "quantity": "2",
      "unit": "large",
      "name": "eggs",
      "notes": ""
    },
    {
      "quantity": "2",
      "unit": "tsp",
      "name": "vanilla extract",
      "notes": ""
    },
    {
      "quantity": "2",
      "unit": "cups",
      "name": "chocolate chips",
      "notes": ""
    }
  ],
  "steps": [
    "Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.",
    "In a medium bowl, whisk together flour, baking soda, and salt. Set aside.",
    "In a large bowl, cream together softened butter and both sugars until light and fluffy, about 3-4 minutes.",
    "Beat in eggs one at a time, then add vanilla extract.",
    "Gradually mix in the flour mixture until just combined. Don't overmix.",
    "Fold in chocolate chips until evenly distributed.",
    "Drop rounded tablespoons of dough onto prepared baking sheets, spacing 2 inches apart.",
    "Bake for 9-11 minutes until edges are golden brown but centers still look slightly underbaked.",
    "Cool on baking sheet for 5 minutes before transferring to wire rack."
  ],
  "notes": [
    "For chewier cookies, slightly underbake them",
    "Store in airtight container for up to 1 week",
    "Dough can be refrigerated for up to 3 days"
  ],
  "tags": ["dessert", "baking", "cookies", "chocolate"],
  "nutrition": {
    "calories": "150 per cookie",
    "protein": "2g",
    "carbs": "20g",
    "fat": "7g"
  }
}

\n\n`;
    } else {
      // Add a few examples to guide the model for recipe assistance
      prompt += 'User: How can I make this taste better?\n';
      prompt += 'Assistant: To enhance the flavors, try adding fresh herbs like basil or oregano, and consider seasoning in layers - salt the vegetables while cooking, not just at the end.\n\n';
    }
    
    // Add conversation history (limit to recent messages)
    for (const msg of history.slice(-4)) {
      if (msg.type === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else if (msg.type === 'ai') {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }
    
    // Add current user message
    prompt += `User: ${userMessage}\nAssistant:`;
    
    return prompt;
  }

  _postProcessResponse(response, userMessage, recipe, isFullRecipeRequest = false) {
    // Clean up common issues with generated text
    response = response
      .replace(/\n\n+/g, '\n\n') // Remove excessive newlines
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\[.*?\]/g, '') // Remove any bracketed text
      .replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown bold

    // For full recipe requests, try to ensure we get JSON format
    if (isFullRecipeRequest) {
      // First check if it's already valid JSON
      const parsedJson = this._parseJsonRecipe(response);
      if (parsedJson) {
        return response; // Already good JSON
      }
      
      // If response is too short, generate fallback
      if (response.length < 100) {
        return this._generateFullRecipeFallback(userMessage, recipe);
      }
      
      // Try to convert markdown to JSON if it looks like a recipe
      if (response.includes('Ingredients:') && response.includes('Instructions:')) {
        console.log('🔄 Attempting to convert markdown response to JSON format');
        const convertedJson = this._convertMarkdownToJson(response, userMessage);
        if (convertedJson) {
          return convertedJson;
        }
      }
      
      return response; // Return as-is if conversion fails
    }

    // If response is too short for regular assistance, add helpful suggestions
    if (response.length < 20) {
      return this._getFallbackResponse(userMessage, recipe);
    }

    return response;
  }

  _convertMarkdownToJson(markdownText, userMessage) {
    try {
      // Extract components from markdown
      const titleMatch = markdownText.match(/##\s*(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : this._extractDishName(userMessage) || 'Recipe';
      
      // Extract ingredients
      const ingredientsMatch = markdownText.match(/### Ingredients:?\s*([\s\S]*?)(?=###|$)/i);
      const ingredients = ingredientsMatch 
        ? ingredientsMatch[1].split('\n')
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(line => line.length > 0)
        : [];
      
      // Extract steps
      const stepsMatch = markdownText.match(/### Instructions:?\s*([\s\S]*?)(?=###|$)/i);
      const steps = stepsMatch
        ? stepsMatch[1].split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(line => line.length > 2)
        : [];
      
      // Extract notes
      const notesMatch = markdownText.match(/### Notes:?\s*([\s\S]*?)(?=###|\*\*|$)/i);
      const notes = notesMatch
        ? notesMatch[1].split('\n')
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(line => line.length > 0)
        : [];
      
      // Extract timing info
      const prepTimeMatch = markdownText.match(/\*\*Prep Time:\*\*\s*([^\n]+)/i);
      const cookTimeMatch = markdownText.match(/\*\*Cook Time:\*\*\s*([^\n]+)/i);
      const servesMatch = markdownText.match(/\*\*Serves:\*\*\s*([^\n]+)/i);
      
      // Build JSON object
      const jsonRecipe = {
        title,
        description: `A delicious ${title.toLowerCase()} recipe`,
        prepTime: prepTimeMatch ? prepTimeMatch[1].trim() : '',
        cookTime: cookTimeMatch ? cookTimeMatch[1].trim() : '',
        servings: servesMatch ? servesMatch[1].trim() : '',
        difficulty: 'Medium',
        ingredients,
        steps,
        notes,
        tags: [title.toLowerCase().replace(/\s+/g, '-'), 'homemade']
      };
      
      // Only return if we have meaningful content
      if (ingredients.length > 0 && steps.length > 0) {
        console.log('✅ Successfully converted markdown to JSON:', jsonRecipe);
        return JSON.stringify(jsonRecipe, null, 2);
      }
      
      return null;
    } catch (error) {
      console.log('❌ Failed to convert markdown to JSON:', error.message);
      return null;
    }
  }

  _generateFullRecipeFallback(userMessage, recipe) {
    const dishName = this._extractDishName(userMessage) || 'this dish';
    
    return `# Recipe for ${dishName}

## Ingredients:
- 2 cups main ingredient (adjust based on your preference)
- 1 tsp salt
- 0.5 tsp black pepper
- 2 tbsp olive oil

## Instructions:
1. Gather all ingredients and prepare your workspace. Preheat oven to 375°F (190°C) if baking.

2. Season your main ingredients with salt and pepper. Let rest for 10 minutes to allow flavors to develop.

3. Heat olive oil in a large skillet over medium-high heat. Add seasoned ingredients and cook according to the specific requirements of your dish.

4. Taste and adjust seasonings. Add any final touches like fresh herbs, lemon juice, or garnishes.

5. Present immediately while hot, or let cool if serving at room temperature.

## Notes:
- Always taste as you cook and adjust seasonings gradually
- Leftovers keep for 3-4 days in refrigerator
- Try adding herbs like thyme, rosemary, or basil; or include vegetables like onions, garlic, or bell peppers
- Try different cooking methods: roasting, grilling, or braising

What specific type of ${dishName} would you like me to help you create? I can provide more detailed instructions for specific cuisines or cooking methods!`;
  }

  _extractDishName(userMessage) {
    const match = userMessage.match(/(?:recipe for|make|create|generate)\s+(?:a\s+)?([^.!?]+)/i);
    return match ? match[1].trim() : null;
  }

  _formatAsRecipe(content, userMessage) {
    const dishName = this._extractDishName(userMessage) || 'Recipe';
    
    return `# ${dishName}

${content}

---
*Generated recipe - feel free to adjust ingredients and cooking times based on your preferences and equipment!*`;
  }

  // Helper function to create structured response object
  _createResponseObject(text, provider = 'fallback', model = 'assistant') {
    const providerName = this.availableProviders[provider]?.name || 'Recipe Assistant';
    return {
      text,
      provider,
      model,
      providerName
    };
  }

  _getFallbackResponse(userMessage, recipe, chatGptLink = null) {
    const lowerMessage = userMessage.toLowerCase();
    const recipeTitle = recipe?.title || 'this recipe';
    const hasIngredients = recipe?.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0;
    const hasSteps = recipe?.steps?.length > 0;
    const hasNotes = recipe?.notes?.length > 0;
    
    // If ChatGPT link is provided, show it prominently
    if (chatGptLink) {
      return this._createResponseObject(`I'm having trouble connecting to AI services right now. 

**🔗 Try ChatGPT Instead:**
[Ask your question in ChatGPT](${chatGptLink})

You can copy your question "${userMessage}" and paste it there for immediate help with your recipe!

---

Alternatively, I can provide basic guidance based on your current recipe state.`);
    }
    
    // Check if this is a recipe generation request
    if (this._isFullRecipeRequest(userMessage)) {
      const dishName = this._extractDishName(userMessage) || 'your requested dish';
      const chatGptUrl = `https://chat.openai.com/?q=${encodeURIComponent(`Create a detailed recipe for ${dishName}`)}`;
      
      return this._createResponseObject(`I'd love to help you create a complete recipe for ${dishName}! 

**🔗 Get Instant Results:**
[Ask ChatGPT to create this recipe](${chatGptUrl})

**Or try these commands here:**
• "Create a recipe for [dish name]"
• "Generate a complete recipe for [cuisine] [dish]"
• "Make a recipe using [ingredients]"

**Examples:**
• "Create a recipe for chocolate chip cookies"
• "Generate a complete Italian carbonara recipe"
• "Make a recipe using chicken, broccoli, and rice"

I can generate detailed recipes with:
• Complete ingredient lists with measurements
• Step-by-step cooking instructions
• Cooking times and temperatures
• Serving sizes and notes

Try asking: "Create a recipe for ${dishName}" and I'll generate a complete recipe for you!`);
    }
    
    // Analyze user intent and provide specific recipe help with current recipe context
    if (lowerMessage.includes('step') || lowerMessage.includes('how') || lowerMessage.includes('instruction')) {
      let response = `I can help you with cooking steps for "${recipeTitle}"!\n\n`;
      
      if (hasSteps) {
        response += `Your current recipe has ${recipe.steps.length} step${recipe.steps.length > 1 ? 's' : ''}. I can help you:\n\n`;
      } else {
        response += `Your recipe doesn't have instructions yet. I can help you:\n\n`;
      }
      
      response += `• Break down complex steps into smaller actions\n• Add specific temperatures and timing\n• Include prep work and mise en place\n• Mention visual cues for doneness\n\nFor example: "Sauté onions over medium heat for 5-7 minutes until translucent and fragrant."\n\nWhat specific step would you like me to help improve?`;
      return this._createResponseObject(response);
    }
    
    if (lowerMessage.includes('ingredient') || lowerMessage.includes('add') || lowerMessage.includes('substitute')) {
      let response = `Let's work on the ingredients for "${recipeTitle}"!\n\n`;
      
      if (hasIngredients) {
        const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
        response += `Your current recipe has ${ingredientsArray.length} ingredient${ingredientsArray.length > 1 ? 's' : ''}:\n`;
        response += ingredientsArray.slice(0, 3).map((ing, i) => {
          const ingredientText = typeof ing === 'object' && ing !== null
            ? `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ''}`.trim()
            : ing;
          return `• ${ingredientText}`;
        }).join('\n');
        if (ingredientsArray.length > 3) {
          response += `\n• ... and ${ingredientsArray.length - 3} more\n\n`;
        } else {
          response += '\n\n';
        }
      } else {
        response += `Your recipe doesn't have ingredients yet. `;
      }
      
      response += `I can help you:\n• Suggest flavor-enhancing additions\n• Provide ingredient substitutions\n• Adjust quantities for different serving sizes\n• Recommend complementary seasonings\n\nWhat ingredient changes are you considering?`;
      return this._createResponseObject(response);
    }
    
    if (lowerMessage.includes('flavor') || lowerMessage.includes('taste') || lowerMessage.includes('season')) {
      return this._createResponseObject(`Great question about flavoring "${recipeTitle}"! Based on your current recipe, I can suggest:\n\n• Salt and pepper at different cooking stages\n• Fresh herbs added at the end\n• Acid (lemon, vinegar) to brighten flavors\n• Aromatics like garlic, ginger, or onions\n\nWhat flavor direction interests you - savory, spicy, fresh, or rich?`);
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('cook') || lowerMessage.includes('temperature')) {
      return this._createResponseObject(`Cooking times and temperatures are crucial for "${recipeTitle}"! For better results:\n\n• Preheat properly (10-15 minutes for ovens)\n• Use a thermometer for doneness\n• Consider carryover cooking\n• Adjust for altitude and equipment differences\n\nWhat cooking method or timing would you like help with?`);
    }
    
    // Default helpful response with current recipe context
    let contextualHelp = `I'm your recipe assistant for "${recipeTitle}"! Here's what I can help you with:\n\n**Current Recipe Status:**\n`;
    
    if (hasIngredients) {
      const ingredientsCount = Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0;
      contextualHelp += `✅ ${ingredientsCount} ingredient${ingredientsCount > 1 ? 's' : ''} listed\n`;
    } else {
      contextualHelp += `❌ No ingredients yet\n`;
    }
    
    if (hasSteps) {
      contextualHelp += `✅ ${recipe.steps.length} instruction step${recipe.steps.length > 1 ? 's' : ''}\n`;
    } else {
      contextualHelp += `❌ No instructions yet\n`;
    }
    
    if (hasNotes) {
      contextualHelp += `✅ ${recipe.notes.length} note${recipe.notes.length > 1 ? 's' : ''} added\n\n`;
    } else {
      contextualHelp += `❌ No notes yet\n\n`;
    }
    
    contextualHelp += `**How I Can Help:**\n• **Recipe Generation**: "Create a recipe for [dish]"\n• **Ingredient Help**: "Add more vegetables" or "What can I substitute for X?"\n• **Instruction Help**: "How do I cook this?" or "Make step 2 clearer"\n• **Flavor Enhancement**: "Make this more flavorful" or "Add spices"\n\n**Examples:**\n• "Create a complete chicken fajita recipe"\n• "Add more spices to make this flavorful"\n• "How should I cook the chicken?"\n\nWhat would you like me to help you with?`;
    
    return this._createResponseObject(contextualHelp);
  }

  async generateRecipeChanges(userRequest, recipe) {
    // Check if this is a request to populate/create a full recipe
    const isPopulateRequest = this._isFullRecipeRequest(userRequest);
    
    let prompt;
    if (isPopulateRequest) {
      prompt = `Please create a complete recipe based on: ${userRequest}. Include all ingredients with measurements, detailed step-by-step instructions, cooking times, and serving information.`;
    } else {
      prompt = `Please suggest specific changes to this recipe based on: ${userRequest}`;
    }
    
    const response = await this.generateResponse(prompt, recipe);
    
    // Parse the response to extract actionable changes
    // Handle both old string format and new structured format
    const responseText = typeof response === 'string' ? response : response.text;
    return {
      response: responseText,
      suggestedChanges: this.extractActionableChanges(responseText, recipe, isPopulateRequest)
    };
  }

  extractActionableChanges(response, recipe, isFullRecipe = false) {
    const changes = {
      ingredients: [],
      steps: [],
      notes: [],
      title: null,
      metadata: {}
    };
    
    console.log('Extracting changes from response:', response.substring(0, 200) + '...');
    console.log('Is full recipe:', isFullRecipe);
    
    if (isFullRecipe) {
      // Try to parse as JSON first
      const jsonRecipe = this._parseJsonRecipe(response);
      if (jsonRecipe) {
        console.log('✅ Successfully parsed JSON recipe:', jsonRecipe);
        
        // Convert JSON structure to our changes format
        if (jsonRecipe.title) {
          changes.title = jsonRecipe.title;
        }
        
        if (jsonRecipe.ingredients && Array.isArray(jsonRecipe.ingredients)) {
          changes.ingredients = jsonRecipe.ingredients.map(ing => {
            if (typeof ing === 'object') {
              // Convert structured ingredient to string format for compatibility
              const parts = [ing.quantity, ing.unit, ing.name].filter(p => p && p.trim()).join(' ');
              return ing.notes ? `${parts} (${ing.notes})` : parts;
            }
            return ing;
          });
        }
        
        if (jsonRecipe.steps && Array.isArray(jsonRecipe.steps)) {
          changes.steps = jsonRecipe.steps;
        }
        
        if (jsonRecipe.notes && Array.isArray(jsonRecipe.notes)) {
          changes.notes = jsonRecipe.notes;
        }
        
        // Store additional metadata
        changes.metadata = {
          description: jsonRecipe.description || '',
          prepTime: jsonRecipe.prepTime || '',
          cookTime: jsonRecipe.cookTime || '',
          totalTime: jsonRecipe.totalTime || '',
          servings: jsonRecipe.servings || '',
          difficulty: jsonRecipe.difficulty || '',
          tags: jsonRecipe.tags || [],
          nutrition: jsonRecipe.nutrition || {}
        };
        
        console.log('🎯 Final changes from JSON:', changes);
        return changes;
      }
      
      // Fall back to markdown parsing if JSON parsing fails
      console.log('⚠️ JSON parsing failed, falling back to markdown parsing');
      return this._parseMarkdownRecipe(response, changes);
    } else {
      // For partial changes, try to extract suggestions from the response
      return this._parsePartialChanges(response, changes);
    }
  }

  _parseJsonRecipe(response) {
    try {
      // Clean the response to extract only JSON content
      let jsonString = response.trim();
      
      // Remove any markdown formatting that might wrap the JSON
      jsonString = jsonString.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
      
      // Find JSON object boundaries
      const startIndex = jsonString.indexOf('{');
      const lastIndex = jsonString.lastIndexOf('}');
      
      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        jsonString = jsonString.substring(startIndex, lastIndex + 1);
      }
      
      // Parse the JSON
      const parsed = JSON.parse(jsonString);
      
      // Validate that it has the expected recipe structure
      if (parsed && (parsed.title || parsed.ingredients || parsed.steps)) {
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.log('JSON parsing failed:', error.message);
      return null;
    }
  }

  _parseMarkdownRecipe(response, changes) {
    // Existing markdown parsing logic (kept as fallback)
    
    // Try to extract title
    const titleMatch = response.match(/(?:Title|Recipe):\s*(.+)/i);
    if (titleMatch) {
      changes.title = titleMatch[1].trim();
    }
    
    // Try to extract ingredients
    const ingredientsSection = response.match(/Ingredients?:\s*([\s\S]*?)(?:\n\n|Instructions?:|Steps?:|$)/i);
    if (ingredientsSection) {
      const ingredientLines = ingredientsSection[1]
        .split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0);
      changes.ingredients = ingredientLines;
    }
    
    // Try to extract instructions
    const instructionsSection = response.match(/(?:Instructions?|Steps?):\s*([\s\S]*?)(?:\n\n(?![0-9])|Notes?:|Prep Time:|Cook Time:|Serves?:|$)/i);
    if (instructionsSection) {
      console.log('🔍 Instructions section found:', instructionsSection[1]);
      
      const rawText = instructionsSection[1];
      const lines = rawText.split('\n');
      
      let steps = [];
      let currentStep = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        if (/^\s*\d+\./.test(line)) {
          if (currentStep) {
            steps.push(currentStep);
          }
          
          let cleaned = line.replace(/^\s*\d+[.)]\s*/, '').trim();
          cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
          cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
          cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
          currentStep = cleaned;
        } else if (currentStep && trimmedLine.length > 0 && !trimmedLine.match(/^(Notes?|Prep Time|Cook Time|Serves?):/i)) {
          currentStep += ' ' + trimmedLine;
        }
      }
      
      if (currentStep) {
        steps.push(currentStep);
      }
      
      steps = steps.map(step => step.replace(/\s+/g, ' ').trim()).filter(step => step.length > 2);
      
      if (steps.length > 0) {
        changes.steps = steps;
      }
    }
    
    // Try to extract notes
    const notesSection = response.match(/Notes?:\s*([\s\S]*?)(?:\n\n|Prep Time:|Cook Time:|Serves?:|$)/i);
    if (notesSection) {
      const noteLines = notesSection[1]
        .split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0);
      changes.notes = noteLines;
    }
    
    return changes;
  }

  _parsePartialChanges(response, changes) {
    const lowerResponse = response.toLowerCase();
    
    // Look for ingredient suggestions
    if (lowerResponse.includes('ingredient') || lowerResponse.includes('add')) {
      const ingredientMatches = response.match(/(?:add|try|use|include)\s+([^.!?\n]+)(?:\.|!|\?|$)/gi);
      if (ingredientMatches) {
        changes.ingredients = ingredientMatches
          .map(match => match.replace(/^(?:add|try|use|include)\s+/i, '').trim())
          .filter(ingredient => ingredient.length > 2);
      }
    }
    
    // Look for step/instruction suggestions
    if (lowerResponse.includes('step') || lowerResponse.includes('cook') || lowerResponse.includes('method') || lowerResponse.includes('heat') || lowerResponse.includes('add')) {
      // Try to extract numbered steps first
      const numberedSteps = response.match(/\d+\.\s*([^.\n]+(?:\.[^.\n]*)?)/g);
      if (numberedSteps && numberedSteps.length > 0) {
        changes.steps = numberedSteps.map(step => step.replace(/^\d+\.\s*/, '').trim());
      } else {
        // Look for instructional sentences
        const stepMatches = response.match(/(?:first|then|next|finally|cook|bake|heat|mix|stir|add|season)\s+([^.!?\n]{10,})/gi);
        if (stepMatches) {
          changes.steps = stepMatches
            .map(match => match.trim())
            .filter(step => step.length > 10);
        }
      }
    }
    
    // Look for note suggestions
    if (lowerResponse.includes('tip') || lowerResponse.includes('note') || lowerResponse.includes('remember')) {
      const noteMatches = response.match(/(?:tip|note|remember|important):\s*([^.!?\n]+)/gi);
      if (noteMatches) {
        changes.notes = noteMatches
          .map(match => match.replace(/^(?:tip|note|remember|important):\s*/i, '').trim())
          .filter(note => note.length > 5);
      }
    }
    
    // Look for title suggestions
    const titleMatch = response.match(/(?:title|name|call)\s+(?:it|this|the recipe)\s*[:\"]?\s*([^.!?\n]{3,30})/i);
    if (titleMatch) {
      changes.title = titleMatch[1].trim().replace(/[\"\']/g, '');
    }
    
    console.log('Final extracted changes:', changes);
    return changes;
  }

  getModelStatus() {
    return {
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      modelName: this.availableProviders[this.preferredProvider]?.name || 'Cloud AI Service',
      provider: this.preferredProvider,
      workerUrl: this.workerUrl
    };
  }
}

// Create a singleton instance
const recipeAIService = new RecipeAIService();

export default recipeAIService;
