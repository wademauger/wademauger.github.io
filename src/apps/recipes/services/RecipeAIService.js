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
      const requestBody = {
        userMessage,
        recipeContext,
        conversationHistory,
        preferredProvider: this.preferredProvider
      };

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
      return data.response;
      
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

RECIPE FORMAT:
Title: [Descriptive recipe name]

Ingredients:
- [quantity] [unit] [ingredient name]
- [quantity] [unit] [ingredient name]
[List all ingredients with precise measurements]

Instructions:
1. [Detailed step with cooking times, temperatures, and techniques]
2. [Next step with visual cues and tips]
[Continue with numbered steps]

Notes:
- [Cooking tips, substitutions, or variations]
- [Storage instructions]
- [Serving suggestions]

Prep Time: [X minutes]
Cook Time: [X minutes]
Serves: [X people]

Create recipes that are clear, detailed, and easy to follow. Include specific temperatures, cooking times, and helpful techniques.`;
    } else {
      // Build comprehensive current recipe context
      const recipeTitle = recipe?.title || 'Untitled Recipe';
      
      // Format ingredients with full details
      const ingredientsList = recipe?.ingredients?.length > 0 
        ? recipe.ingredients.map((ing, index) => {
            if (typeof ing === 'object') {
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

I can see the complete current recipe above and will reference specific ingredients, steps, or notes when making suggestions. Always be specific and actionable in my advice.`;
    }
  }

  _buildConversationPrompt(systemPrompt, history, userMessage, isFullRecipeRequest = false) {
    let prompt = systemPrompt + '\n\nCONVERSATION:\n';
    
    if (isFullRecipeRequest) {
      // Add examples for full recipe generation
      prompt += 'User: Create a recipe for chocolate chip cookies\n';
      prompt += `Assistant: Title: Classic Chocolate Chip Cookies

Ingredients:
- 270 grams all-purpose flour
- 1 tsp baking soda
- 1 tsp salt
- 1 cup butter, softened
- 0.75 cup granulated sugar
- 0.75 cup brown sugar, packed
- 2 large eggs
- 2 tsp vanilla extract
- 2 cups chocolate chips

Instructions:
1. Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.
2. In a medium bowl, whisk together flour, baking soda, and salt. Set aside.
3. In a large bowl, cream together softened butter and both sugars until light and fluffy, about 3-4 minutes.
4. Beat in eggs one at a time, then add vanilla extract.
5. Gradually mix in the flour mixture until just combined. Don't overmix.
6. Fold in chocolate chips until evenly distributed.
7. Drop rounded tablespoons of dough onto prepared baking sheets, spacing 2 inches apart.
8. Bake for 9-11 minutes until edges are golden brown but centers still look slightly underbaked.
9. Cool on baking sheet for 5 minutes before transferring to wire rack.

Notes:
- For chewier cookies, slightly underbake them
- Store in airtight container for up to 1 week
- Dough can be refrigerated for up to 3 days

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

    // For full recipe requests, ensure we have a substantial response
    if (isFullRecipeRequest) {
      if (response.length < 100) {
        return this._generateFullRecipeFallback(userMessage, recipe);
      }
      
      // Format the recipe nicely if it's not already formatted
      if (!response.includes('Ingredients:') && !response.includes('Instructions:')) {
        return this._formatAsRecipe(response, userMessage);
      }
      
      return response;
    }

    // If response is too short for regular assistance, add helpful suggestions
    if (response.length < 20) {
      return this._getFallbackResponse(userMessage, recipe);
    }

    return response;
  }

  _generateFullRecipeFallback(userMessage, recipe) {
    const dishName = this._extractDishName(userMessage) || 'this dish';
    
    return `# Recipe for ${dishName}

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

  _getFallbackResponse(userMessage, recipe, chatGptLink = null) {
    const lowerMessage = userMessage.toLowerCase();
    const recipeTitle = recipe?.title || 'this recipe';
    const hasIngredients = recipe?.ingredients?.length > 0;
    const hasSteps = recipe?.steps?.length > 0;
    const hasNotes = recipe?.notes?.length > 0;
    
    // If ChatGPT link is provided, show it prominently
    if (chatGptLink) {
      return `I'm having trouble connecting to AI services right now. 

**🔗 Try ChatGPT Instead:**
[Ask your question in ChatGPT](${chatGptLink})

You can copy your question "${userMessage}" and paste it there for immediate help with your recipe!

---

Alternatively, I can provide basic guidance based on your current recipe state.`;
    }
    
    // Check if this is a recipe generation request
    if (this._isFullRecipeRequest(userMessage)) {
      const dishName = this._extractDishName(userMessage) || 'your requested dish';
      const chatGptUrl = `https://chat.openai.com/?q=${encodeURIComponent(`Create a detailed recipe for ${dishName}`)}`;
      
      return `I'd love to help you create a complete recipe for ${dishName}! 

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

Try asking: "Create a recipe for ${dishName}" and I'll generate a complete recipe for you!`;
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
      return response;
    }
    
    if (lowerMessage.includes('ingredient') || lowerMessage.includes('add') || lowerMessage.includes('substitute')) {
      let response = `Let's work on the ingredients for "${recipeTitle}"!\n\n`;
      
      if (hasIngredients) {
        response += `Your current recipe has ${recipe.ingredients.length} ingredient${recipe.ingredients.length > 1 ? 's' : ''}:\n`;
        response += recipe.ingredients.slice(0, 3).map((ing, i) => {
          const ingredientText = typeof ing === 'object' 
            ? `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ''}`.trim()
            : ing;
          return `• ${ingredientText}`;
        }).join('\n');
        if (recipe.ingredients.length > 3) {
          response += `\n• ... and ${recipe.ingredients.length - 3} more\n\n`;
        } else {
          response += '\n\n';
        }
      } else {
        response += `Your recipe doesn't have ingredients yet. `;
      }
      
      response += `I can help you:\n• Suggest flavor-enhancing additions\n• Provide ingredient substitutions\n• Adjust quantities for different serving sizes\n• Recommend complementary seasonings\n\nWhat ingredient changes are you considering?`;
      return response;
    }
    
    if (lowerMessage.includes('flavor') || lowerMessage.includes('taste') || lowerMessage.includes('season')) {
      return `Great question about flavoring "${recipeTitle}"! Based on your current recipe, I can suggest:\n\n• Salt and pepper at different cooking stages\n• Fresh herbs added at the end\n• Acid (lemon, vinegar) to brighten flavors\n• Aromatics like garlic, ginger, or onions\n\nWhat flavor direction interests you - savory, spicy, fresh, or rich?`;
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('cook') || lowerMessage.includes('temperature')) {
      return `Cooking times and temperatures are crucial for "${recipeTitle}"! For better results:\n\n• Preheat properly (10-15 minutes for ovens)\n• Use a thermometer for doneness\n• Consider carryover cooking\n• Adjust for altitude and equipment differences\n\nWhat cooking method or timing would you like help with?`;
    }
    
    // Default helpful response with current recipe context
    let contextualHelp = `I'm your recipe assistant for "${recipeTitle}"! Here's what I can help you with:\n\n**Current Recipe Status:**\n`;
    
    if (hasIngredients) {
      contextualHelp += `✅ ${recipe.ingredients.length} ingredient${recipe.ingredients.length > 1 ? 's' : ''} listed\n`;
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
    
    return contextualHelp;
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
    return {
      response,
      suggestedChanges: this.extractActionableChanges(response, recipe, isPopulateRequest)
    };
  }

  extractActionableChanges(response, recipe, isFullRecipe = false) {
    const changes = {
      ingredients: [],
      steps: [],
      notes: [],
      title: null
    };
    
    console.log('Extracting changes from response:', response.substring(0, 200) + '...');
    console.log('Is full recipe:', isFullRecipe);
    
    if (isFullRecipe) {
      // For full recipes, try to parse structured data
      
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
        console.log('🔍 Full response being parsed:', response);
        
        const rawText = instructionsSection[1];
        console.log('📄 Raw instructions text:', rawText);
        
        // Primary approach: Line-based parsing that handles double newlines correctly
        const lines = rawText.split('\n');
        
        // Find all numbered step lines and their content
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
            cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // Remove code formatting
            currentStep = cleaned;
          } else if (currentStep && trimmedLine.length > 0 && !trimmedLine.match(/^(Notes?|Prep Time|Cook Time|Serves?):/i)) {
            // This is a continuation line of the current step
            // Only add it if it's not empty and not a new section header
            currentStep += ' ' + trimmedLine;
          }
        }
        
        // Don't forget the last step
        if (currentStep) {
          steps.push(currentStep);
        }
        
        // Clean up steps and filter out very short ones
        steps = steps.map(step => step.replace(/\s+/g, ' ').trim()).filter(step => step.length > 2);
        
        console.log('🍽 Line-based parsed steps:', steps);
        
        // If line-based parsing didn't work, try regex-based parsing with improved patterns
        if (steps.length === 0) {
          console.log('🔄 No steps found with line parsing, trying improved regex approach...');
          
          // Try multiple regex patterns to catch different formatting styles
          const patterns = [
            // Pattern 1: Standard numbered list with optional whitespace and double newlines
            /(\d+\.\s*[^\n]+(?:\n(?!\s*\d+\.)[^\n]*)*)/g,
            // Pattern 2: Numbered steps that may span multiple lines
            /\d+\.\s*[\s\S]*?(?=\n\s*\d+\.|$)/g,
            // Pattern 3: Simple numbered pattern with any following content
            /\d+\.[^\d]*?(?=\d+\.|$)/g
          ];
          
          for (let i = 0; i < patterns.length && steps.length === 0; i++) {
            const matches = rawText.match(patterns[i]);
            console.log(`📋 Pattern ${i + 1} matches:`, matches);
            
            if (matches && matches.length > 0) {
              steps = matches.map(step => {
                // Clean up each step
                let cleaned = step.replace(/^\s*\d+\.\s*/, '').trim();
                // Remove markdown formatting
                cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
                cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
                cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
                // Handle multi-line steps by joining them properly
                cleaned = cleaned.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
                return cleaned;
              }).filter(step => step.length > 2);
              
              if (steps.length > 0) {
                console.log(`✅ Pattern ${i + 1} successfully extracted steps`);
                break;
              }
            }
          }
        }
        
        if (steps.length > 0) {
          changes.steps = steps;
          console.log('🎯 Final extracted steps:', changes.steps);
        } else {
          console.log('❌ No steps could be extracted from instructions section');
        }
      } else {
        console.log('❌ No instructions section found in response');
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
      
    } else {
      // For partial changes, try to extract suggestions from the response
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
