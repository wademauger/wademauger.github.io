import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import RecipeEditor from './RecipeEditor';
import ChatInterface from './ChatInterface';
import { setDraftRecipe, addChatMessage, clearDraftRecipe, clearChatMessages } from '../../../reducers/recipes.reducer';
import './RecipeAssistantPanel.css';

const RecipeAssistantPanel = () => {
  const dispatch = useDispatch();
  const draftRecipe = useSelector((state) => state.recipes.draftRecipe);
  const chatMessages = useSelector((state) => state.recipes.chatMessages);

  // Helper function to try parsing a recipe from assistant response
  const tryParseRecipe = (text) => {
    try {
      // Look for JSON blocks in the text
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Validate it looks like a recipe
        if (parsed.title && parsed.ingredients && Array.isArray(parsed.ingredients)) {
          return parsed;
        }
      }
      return null;
    } catch (error) {
      console.log('Failed to parse recipe from response:', error);
      return null;
    }
  };

  // Stub function for generating AI responses (to be replaced with actual model)
  const generateResponse = async (messages) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage?.content?.toLowerCase() || '';
    
    // Simple response logic for demonstration
    if (userText.includes('pasta') || userText.includes('spaghetti')) {
      return `I'd love to help you create a pasta recipe! Here's a simple but delicious option:

\`\`\`json
{
  "title": "Simple Garlic Butter Pasta",
  "description": "A quick and flavorful pasta dish perfect for weeknight dinners",
  "permalink": "simple-garlic-butter-pasta",
  "defaultServings": 4,
  "servingUnits": "servings",
  "scalable": true,
  "ingredients": [
    {
      "name": "Spaghetti or linguine",
      "quantity": 1,
      "unit": "lb"
    },
    {
      "name": "Butter",
      "quantity": 4,
      "unit": "tbsp"
    },
    {
      "name": "Garlic cloves, minced",
      "quantity": 4,
      "unit": "whole"
    },
    {
      "name": "Red pepper flakes",
      "quantity": 0.25,
      "unit": "tsp"
    },
    {
      "name": "Fresh parsley, chopped",
      "quantity": 0.25,
      "unit": "cup"
    },
    {
      "name": "Parmesan cheese, grated",
      "quantity": 0.5,
      "unit": "cup"
    }
  ],
  "instructions": "1. Cook pasta according to package directions until al dente. Reserve 1 cup pasta water before draining.\\n\\n2. In a large skillet, melt butter over medium heat. Add garlic and red pepper flakes, cook for 1 minute until fragrant.\\n\\n3. Add drained pasta to the skillet and toss with the garlic butter. Add pasta water as needed to create a silky sauce.\\n\\n4. Remove from heat, add parsley and half the Parmesan. Toss well.\\n\\n5. Serve immediately topped with remaining Parmesan.",
  "category": "Dinners"
}
\`\`\`

Would you like me to suggest any variations or modifications to this recipe? I could help you add vegetables, protein, or adjust the flavors!`;
    } else if (userText.includes('chocolate') || userText.includes('dessert')) {
      return `Chocolate desserts are always a great choice! What kind of chocolate dessert are you in the mood for? I could suggest:

- A rich chocolate cake
- Simple chocolate cookies
- Chocolate mousse
- Brownies
- Hot chocolate

Let me know what sounds appealing and I'll create a recipe for you!`;
    } else if (userText.includes('save') || userText.includes('add to')) {
      return `I'd be happy to help you save this recipe! Once you're satisfied with the recipe in the editor, you can save it to your collection. 

Would you like me to suggest any final adjustments before saving? I could help with:
- Adjusting serving sizes
- Adding cooking tips
- Suggesting ingredient substitutions
- Improving the instructions clarity`;
    } else {
      return `I'm here to help you create amazing recipes! I can assist with:

- Suggesting recipes based on ingredients you have
- Creating custom recipes for dietary restrictions
- Helping with flavor pairings and substitutions
- Adjusting cooking techniques
- Scaling recipes up or down

What kind of dish are you thinking about making today?`;
    }
  };

  const handleSendMessage = async (message) => {
    // Add user message
    const userMessage = { role: 'user', content: message, timestamp: Date.now() };
    dispatch(addChatMessage(userMessage));
    
    // Get full conversation for context
    const fullConversation = [...chatMessages, userMessage];
    
    // Generate AI response
    const response = await generateResponse(fullConversation);
    
    // Add assistant message
    const assistantMessage = { role: 'assistant', content: response, timestamp: Date.now() };
    dispatch(addChatMessage(assistantMessage));
    
    // Try to parse recipe from response
    const parsedRecipe = tryParseRecipe(response);
    if (parsedRecipe) {
      dispatch(setDraftRecipe(parsedRecipe));
    }
  };

  const handleClearChat = () => {
    dispatch(clearChatMessages());
  };

  const handleNewRecipe = () => {
    dispatch(clearDraftRecipe());
    dispatch(clearChatMessages());
  };

  return (
    <div className="recipe-assistant-panel">
      <div className="panel-header">
        <h2>Recipe Assistant</h2>
        <div className="panel-actions">
          <button onClick={handleNewRecipe} className="btn-secondary">
            New Recipe
          </button>
          <button onClick={handleClearChat} className="btn-secondary">
            Clear Chat
          </button>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="recipe-editor-section">
          <RecipeEditor recipe={draftRecipe} />
        </div>
        
        <div className="chat-section">
          <ChatInterface 
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeAssistantPanel;
