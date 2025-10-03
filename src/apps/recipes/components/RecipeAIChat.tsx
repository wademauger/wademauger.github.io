/* eslint-disable no-useless-escape */
import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Space, Typography, Badge, Tooltip, message as antMessage, Select, Spin, Avatar, Tag } from 'antd';
import { CloseOutlined, SendOutlined, RobotOutlined, UserOutlined, MessageOutlined, MinusOutlined, ExclamationCircleOutlined, ClearOutlined, ClockCircleOutlined } from '@ant-design/icons';
import recipeAIService from '../services/RecipeAIService';
import './RecipeAIChat.css';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Helper function to safely render ingredient list
const renderIngredientsList = (ingredients, maxItems = 3) => {
  if (!ingredients) return null;
  
  let flatIngredients = [];
  
  // Handle both flat arrays and grouped objects
  if (Array.isArray(ingredients)) {
    // Flat array format: [{ quantity: "1", unit: "cup", name: "flour" }, ...]
    flatIngredients = ingredients;
  } else if (typeof ingredients === 'object' && ingredients !== null) {
    // Grouped object format: { "For the Cake": [...], "For the Frosting": [...] }
    Object.entries(ingredients).forEach(([, groupIngredients]) => {
      if (Array.isArray(groupIngredients)) {
        flatIngredients.push(...groupIngredients);
      }
    });
  }
  
  // Convert to display strings
  const ingredientStrings = flatIngredients.slice(0, maxItems).map((ing) => {
    if (typeof ing === 'object' && ing !== null) {
      // Convert structured ingredient to readable string
      const parts = [ing.quantity, ing.unit, ing.name].filter((p: any) => p && p.toString().trim()).join(' ');
      return ing.notes ? `${parts} (${ing.notes})` : parts;
    } else if (typeof ing === 'string') {
      // Already a string
      return ing;
    } else {
      // Fallback for any other type
      return String(ing);
    }
  });
  
  return {
    displayItems: ingredientStrings,
    totalCount: flatIngredients.length,
    hasMore: flatIngredients.length > maxItems
  };
};

// Recipe Card Component for displaying recipe suggestions in chat
const RecipeCard = ({ recipe, onOpenRecipe, isCompact = false }) => {
  const handleOpenRecipe = () => {
    if (onOpenRecipe) {
      onOpenRecipe(recipe);
    }
  };

  // Safely process ingredients
  const ingredientInfo = renderIngredientsList(recipe.ingredients, isCompact ? 2 : 3);

  return (
    <Card
      size="small"
      className={`recipe-chat-card ${isCompact ? 'compact' : ''}`}
      style={{ 
        marginTop: 8, 
        marginBottom: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: 8,
        border: '1px solid #e8e8e8'
      }}
      bodyStyle={{ padding: isCompact ? '8px 12px' : '12px 16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: isCompact ? '13px' : '14px', display: 'block', marginBottom: 4 }}>
            {recipe.title}
          </Text>
          {recipe.description && (
            <Paragraph 
              style={{ 
                margin: 0, 
                fontSize: '12px', 
                color: '#666',
                display: '-webkit-box',
                WebkitLineClamp: isCompact ? 2 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: 4
              }}
            >
              {recipe.description}
            </Paragraph>
          )}
          
          {/* Safely display ingredients preview */}
          {ingredientInfo && ingredientInfo.displayItems.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                Ingredients:
              </Text>
              {ingredientInfo.displayItems.map((ing, index: number) => (
                <div key={index} style={{ fontSize: '11px', color: '#666', marginLeft: 8 }}>
                  • {ing}
                </div>
              ))}
              {ingredientInfo.hasMore && (
                <Text type="secondary" style={{ fontSize: '10px', marginLeft: 8 }}>
                  ... and {ingredientInfo.totalCount - ingredientInfo.displayItems.length} more
                </Text>
              )}
            </div>
          )}
          
          <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {recipe.difficulty && (
              <Tag size="small" color={
                recipe.difficulty === 'Easy' ? 'green' : 
                recipe.difficulty === 'Medium' ? 'orange' : 'red'
              }>
                {recipe.difficulty}
              </Tag>
            )}
            {recipe.totalTime && (
              <Text type="secondary" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 2 }}>
                <ClockCircleOutlined /> {recipe.totalTime}
              </Text>
            )}
            {recipe.servings && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Serves {recipe.servings}
              </Text>
            )}
          </div>
        </div>
        <Button 
          type="primary" 
          size="small"
          onClick={handleOpenRecipe}
          style={{ marginLeft: 8, flexShrink: 0 }}
        >
          Open Recipe
        </Button>
      </div>
    </Card>
  );
};

// Utility function to parse JSON from AI messages
const parseRecipesFromMessage = (messageContent) => {
  const recipes = [];
  const recipeSuggestions = [];
  
  try {
    // Look for JSON blocks in markdown format
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    let match;
    
    while ((match = jsonBlockRegex.exec(messageContent)) !== null) {
      try {
        const jsonData = JSON.parse(match[1].trim());
        
        // Check if it's a single recipe
        if (jsonData.title && jsonData.ingredients) {
          recipes.push(jsonData);
        }
        // Check if it's a recipe suggestions list
        else if (jsonData.suggestions && Array.isArray(jsonData.suggestions)) {
          recipeSuggestions.push(...jsonData.suggestions);
        }
      } catch (parseError: unknown) {
        console.warn('Failed to parse JSON block:', parseError);
      }
    }
  } catch (error: unknown) {
    console.warn('Error parsing recipes from message:', error);
  }
  
  return { recipes, recipeSuggestions };
};

// Enhanced Message Content Component
const MessageContent = ({ message, onOpenRecipe, editingEnabled, onApplyChanges }) => {
  const { recipes, recipeSuggestions } = parseRecipesFromMessage(message.content);
  
  // Remove JSON blocks from display content
  const displayContent = message.content.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
  
  return (
    <div className="enhanced-message-content">
      {displayContent && (
        <Paragraph 
          style={{ 
            margin: 0, 
            whiteSpace: 'pre-line', 
            fontSize: '13px',
            color: message.isError ? '#ff4d4f' : message.type === 'system' ? '#faad14' : undefined,
            fontStyle: message.type === 'system' ? 'italic' : 'normal',
            textAlign: 'left' // Always left-align text
          }}
        >
          {displayContent}
        </Paragraph>
      )}
      
      {/* Render recipe cards for full recipes */}
      {recipes.map((recipe, index: number) => (
        <RecipeCard 
          key={`recipe-${index}`} 
          recipe={recipe} 
          onOpenRecipe={onOpenRecipe}
        />
      ))}
      
      {/* Render compact cards for recipe suggestions */}
      {recipeSuggestions.map((suggestion, index: number) => (
        <RecipeCard 
          key={`suggestion-${index}`} 
          recipe={suggestion} 
          onOpenRecipe={onOpenRecipe}
          isCompact={true}
        />
      ))}
      
      {/* Action buttons for AI messages with changes */}
      {message.hasActions && message.type === 'ai' && (
        <Space style={{ marginTop: 8 }}>
          <Button 
            type="primary" 
            size="small"
            onClick={() => onApplyChanges(message.id)}
            disabled={!editingEnabled}
            title={!editingEnabled ? 'Enable editing to apply changes' : ''}
          >
            Apply Changes to Recipe
          </Button>
        </Space>
      )}
      
      <Text 
        type="secondary" 
        style={{ 
          fontSize: '11px', 
          display: 'block', 
          marginTop: 4,
          textAlign: 'left' // Always left-align timestamp
        }}
      >
        {message.timestamp.toLocaleTimeString()}
      </Text>
    </div>
  );
};

// Chat history persistence utilities
const CHAT_HISTORY_STORAGE_KEY = 'recipe_chat_history';
const MAX_CHAT_HISTORIES = 50; // Limit to prevent localStorage bloat

const saveChatHistory = (recipeId, messages) => {
  try {
    if (!recipeId || !messages || messages.length === 0) return;
    
    const existingHistories = JSON.parse(localStorage.getItem(CHAT_HISTORY_STORAGE_KEY) || '{}');
    
    // Filter out system messages and only save user/ai messages
    const messagesToSave = messages
      .filter((msg: any) => msg.type === 'user' || msg.type === 'ai')
      .map((msg: any) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
        hasActions: msg.hasActions
      }));
    
    existingHistories[recipeId] = {
      messages: messagesToSave,
      lastUpdated: Date.now(),
      recipeTitle: messages[0]?.recipeTitle || 'Unknown Recipe'
    };
    
    // Clean up old histories if we exceed the limit
    const historyKeys = Object.keys(existingHistories);
    if (historyKeys.length > MAX_CHAT_HISTORIES) {
      // Sort by lastUpdated and remove oldest entries
      const sortedHistories = historyKeys
        .map((key: any) => ({ key, lastUpdated: existingHistories[key].lastUpdated }))
        .sort((a, b) => b.lastUpdated - a.lastUpdated)
        .slice(0, MAX_CHAT_HISTORIES);
      
      const cleanedHistories = {};
      sortedHistories.forEach(({ key }) => {
        cleanedHistories[key] = existingHistories[key];
      });
      
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(cleanedHistories));
    } else {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(existingHistories));
    }
  } catch (error: unknown) {
    console.warn('Failed to save chat history:', error);
  }
};

const loadChatHistory = (recipeId) => {
  try {
    if (!recipeId) return [];
    
    const existingHistories = JSON.parse(localStorage.getItem(CHAT_HISTORY_STORAGE_KEY) || '{}');
    const history = existingHistories[recipeId];
    
    if (history && history.messages) {
      // Convert timestamps back to Date objects
      return history.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    
    return [];
  } catch (error: unknown) {
    console.warn('Failed to load chat history:', error);
    return [];
  }
};

const clearChatHistory = (recipeId) => {
  try {
    if (!recipeId) return;
    
    const existingHistories = JSON.parse(localStorage.getItem(CHAT_HISTORY_STORAGE_KEY) || '{}');
    delete existingHistories[recipeId];
    localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(existingHistories));
  } catch (error: unknown) {
    console.warn('Failed to clear chat history:', error);
  }
};

const RecipeAIChat = ({ 
  isOpen, 
  onClose, 
  recipe, 
  onUpdateRecipe,
  editingEnabled,
  userInfo = null 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [modelStatus, setModelStatus] = useState({ isInitialized: false, isLoading: false });
  const [availableModels, setAvailableModels] = useState({});
  const [selectedModel, setSelectedModel] = useState('mrm8488/gpt2-finetuned-recipes-cooking_v2'); // Default to Recipe GPT-2
  const [isSwitchingModel, setIsSwitchingModel] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (recipe?.id && messages.length > 0) {
      // Debounce saving to avoid excessive localStorage writes
      const timeoutId = setTimeout(() => {
        saveChatHistory(recipe.id, messages);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, recipe?.id]);

  useEffect(() => {
    // Check AI model status and load available models
    const checkModelStatus = async () => {
      const status = recipeAIService.getModelStatus();
      setModelStatus(status);
      
      // Load available models
      const models = recipeAIService.getAvailableModels();
      setAvailableModels(models);
      
      // Set the current or default model
      const currentModel = recipeAIService.getCurrentModel();
      setSelectedModel(currentModel); // This will now include the default if no current model
      
      // Initialize the model if not already done
      if (!status.isInitialized && !status.isLoading) {
        try {
          await recipeAIService.initialize();
          setModelStatus(recipeAIService.getModelStatus());
          setSelectedModel(recipeAIService.getCurrentModel());
        } catch (error: unknown) {
          console.error('Failed to initialize AI model:', error);
          antMessage.warning('AI model failed to load. Using fallback responses.');
        }
      }
    };
    
    if (isOpen) {
      checkModelStatus();
    }
  }, [isOpen]);

  // Load chat history and set welcome message when chat opens
  useEffect(() => {
    if (isOpen && recipe) {
      // Load existing chat history
      const savedHistory = loadChatHistory(recipe.id);
      
      if (savedHistory.length > 0) {
        // Restore conversation with a continuation message
        const continuationMessage = {
          id: Date.now(),
          type: 'system',
          content: `👋 Welcome back! I've restored our previous conversation about "${recipe.title}". You can continue where we left off or start fresh by asking new questions.`,
          timestamp: new Date()
        };
        
        setMessages([continuationMessage, ...savedHistory]);
      } else {
        // Start fresh conversation with welcome message
        const recipeTitle = recipe?.title || 'your recipe';
        const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
        const hasIngredients = ingredients.length > 0;
        const hasSteps = recipe?.steps?.length > 0;
        const hasNotes = recipe?.notes?.length > 0;
        
        let recipeStatus = '';
        if (hasIngredients || hasSteps || hasNotes) {
          recipeStatus = '\n\n**Current Recipe Status:**\n';
          if (hasIngredients) {
            recipeStatus += `✅ ${ingredients.length} ingredient${ingredients.length > 1 ? 's' : ''}\n`;
          } else {
            recipeStatus += '❌ No ingredients yet\n';
          }
          if (hasSteps) {
            recipeStatus += `✅ ${recipe.steps.length} instruction step${recipe.steps.length > 1 ? 's' : ''}\n`;
          } else {
            recipeStatus += '❌ No instructions yet\n';
          }
          if (hasNotes) {
            recipeStatus += `✅ ${recipe.notes.length} note${recipe.notes.length > 1 ? 's' : ''}\n`;
          } else {
            recipeStatus += '❌ No notes yet\n';
          }
        }
        
        // Add welcome message when chat opens
        const welcomeMessage = modelStatus.isInitialized 
          ? `Hi! I'm your AI recipe assistant with full knowledge of "${recipeTitle}". I can see all your current ingredients, instructions, and notes.${recipeStatus}

**I can help you:**
• **Generate complete recipes** - "Create a recipe for chicken fajitas"
• **Add ingredients** - "Add more spices" or "What vegetables go well with this?"
• **Improve instructions** - "Make the cooking steps clearer" or "Add cooking times"
• **Enhance flavors** - "Make this more flavorful" or "Add Mexican seasonings"
• **Recipe variations** - "Make this vegetarian" or "Add a spicy version"

**Examples:**
• "Create a complete chicken fajita recipe"
• "Add bell peppers and onions to the ingredients"
• "How should I season the chicken?"
• "Make the cooking instructions more detailed"

I have the complete context of your current recipe, so feel free to ask specific questions about any part of it!`
          : `Hi! I'm loading my AI capabilities to help you edit "${recipeTitle}". This may take a moment...

Once ready, I'll have full knowledge of your current recipe and can help you:
• **Generate complete recipes** from scratch
• Add or modify ingredients with context
• Improve cooking instructions
• Suggest recipe variations
• Fix formatting or clarity issues

I'll be able to see all your ingredients, steps, and notes to provide contextual suggestions.`;
        
        setMessages([{
          id: Date.now(),
          type: 'ai',
          content: welcomeMessage,
          timestamp: new Date()
        }]);
      }
    }
  }, [isOpen, recipe?.title, recipe?.id]);

  const handleModelChange = async (newModelName) => {
    if (newModelName === selectedModel || isSwitchingModel) return;
    
    setIsSwitchingModel(true);
    setSelectedModel(newModelName);
    
    try {
      antMessage.loading({ content: `Switching to ${availableModels[newModelName]?.name}...`, key: 'modelSwitch' });
      
      await recipeAIService.switchModel(newModelName);
      
      setModelStatus(recipeAIService.getModelStatus());
      
      // Add a system message about the model switch
      const switchMessage = {
        id: Date.now(),
        type: 'system',
        content: `✅ Switched to ${availableModels[newModelName]?.name}. ${availableModels[newModelName]?.description}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, switchMessage]);
      
      antMessage.success({ content: `Successfully switched to ${availableModels[newModelName]?.name}`, key: 'modelSwitch' });
      
    } catch (error: unknown) {
      console.error('Failed to switch model:', error);
      antMessage.error({ content: `Failed to switch to ${availableModels[newModelName]?.name}. Using current model.`, key: 'modelSwitch' });
      
      // Revert the selection
      setSelectedModel(recipeAIService.getCurrentModel());
    } finally {
      setIsSwitchingModel(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.filter((msg: any) => msg.type !== 'system');
      
      // Generate AI response using the local LLM
      const aiResponseText = await recipeAIService.generateResponse(
        currentInput,
        recipe,
        conversationHistory
      );

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date(),
        hasActions: aiResponseText.toLowerCase().includes('change') || 
                   aiResponseText.toLowerCase().includes('suggest') ||
                   aiResponseText.toLowerCase().includes('add') ||
                   aiResponseText.toLowerCase().includes('modify')
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Mark as unread if minimized
      if (isMinimized) {
        setHasUnreadMessages(true);
      }
    } catch (error: unknown) {
      console.error('Error generating AI response:', error);
      
      // Fallback response if AI fails
      const fallbackResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I\'m having trouble processing that request right now. However, I can still help you with:\n\n• Ingredient modifications\n• Cooking instruction improvements\n• Recipe formatting\n• General cooking tips\n\nPlease try rephrasing your request, or let me know what specific part of the recipe you\'d like to work on.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
      antMessage.error('AI response failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = async (messageId) => {
    const message = messages.find((msg: any) => msg.id === messageId);
    if (!message || !editingEnabled) return;

    try {
      antMessage.loading({ content: 'Analyzing AI suggestions...', key: 'applyChanges' });
      
      // Parse the AI message content directly instead of generating a new response
      console.log('🎯 Parsing AI message:', message.content);
      
      // Check if this looks like a full recipe (has structured sections)
      const isFullRecipe = message.content.includes('## Instructions:') || 
                          message.content.includes('# Instructions') ||
                          message.content.includes('Instructions:') ||
                          (message.content.includes('Ingredients:') && message.content.includes('1.'));
      
      // Parse the message content directly using the service's extraction method
      const suggestedChanges = recipeAIService.extractActionableChanges(
        message.content,
        recipe,
        isFullRecipe
      );

      console.log('🔍 Extracted changes:', suggestedChanges);

      if (onUpdateRecipe && suggestedChanges) {
        const updatedRecipe = { ...recipe };
        let changesApplied = [];
        
        // Apply title changes
        if (suggestedChanges.title && suggestedChanges.title !== recipe.title) {
          updatedRecipe.title = suggestedChanges.title;
          changesApplied.push('title');
        }
        
        // Apply ingredient changes (replace if we have new ingredients)
        if (suggestedChanges.ingredients && suggestedChanges.ingredients.length > 0) {
          // Convert string ingredients to proper format
          updatedRecipe.ingredients = suggestedChanges.ingredients.map((ingredient: any) => {
            if (typeof ingredient === 'string') {
              // Try to parse quantity, unit, and name from string
              const parts = ingredient.trim().split(' ');
              const quantity = parts[0];
              const isQuantityNumeric = /^[\d\/\.\-]+$/.test(quantity);
              
              if (isQuantityNumeric && parts.length > 1) {
                const unit = parts[1];
                const name = parts.slice(2).join(' ');
                return { quantity, unit, name };
              } else {
                return { quantity: '', unit: '', name: ingredient };
              }
            }
            return ingredient;
          });
          changesApplied.push('ingredients');
        }
        // Handle grouped ingredients from AI responses
        else if (suggestedChanges.groupedIngredients && typeof suggestedChanges.groupedIngredients === 'object') {
          // Convert grouped ingredients to flat array
          const flatIngredients = [];
          Object.entries(suggestedChanges.groupedIngredients).forEach(([, groupIngredients]) => {
            if (Array.isArray(groupIngredients)) {
              flatIngredients.push(...groupIngredients);
            }
          });
          
          if (flatIngredients.length > 0) {
            updatedRecipe.ingredients = flatIngredients.map((ingredient: any) => {
              if (typeof ingredient === 'object' && ingredient !== null) {
                // Already in proper format
                return ingredient;
              } else if (typeof ingredient === 'string') {
                // Parse string format
                return { quantity: '', unit: '', name: ingredient };
              }
              return ingredient;
            });
            changesApplied.push('ingredients');
          }
        }
        
        // Apply instruction/step changes
        if (suggestedChanges.steps && suggestedChanges.steps.length > 0) {
          console.log('📝 Applying steps:', suggestedChanges.steps);
          updatedRecipe.steps = suggestedChanges.steps;
          changesApplied.push('instructions');
        }
        
        // Apply notes changes
        if (suggestedChanges.notes && suggestedChanges.notes.length > 0) {
          // Replace notes instead of adding to existing ones to avoid duplication
          updatedRecipe.notes = suggestedChanges.notes;
          changesApplied.push('notes');
        }
        
        if (changesApplied.length > 0) {
          onUpdateRecipe(updatedRecipe);
          
          // Add a system message about what was applied
          const successMessage = {
            id: Date.now() + 100,
            type: 'system',
            content: `✅ Applied AI suggestions to: ${changesApplied.join(', ')}. Recipe has been updated!`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
          
          antMessage.success({ 
            content: `Recipe updated! Applied changes to: ${changesApplied.join(', ')}`, 
            key: 'applyChanges' 
          });
        } else {
          antMessage.warning({ 
            content: 'No specific changes detected in AI response. Try asking for more specific modifications.', 
            key: 'applyChanges' 
          });
        }
      } else {
        antMessage.warning({ 
          content: 'Unable to parse actionable changes from AI response. Try being more specific about what you want to change.', 
          key: 'applyChanges' 
        });
      }
      
    } catch (error: unknown) {
      console.error('Error applying AI changes:', error);
      antMessage.error({ content: 'Failed to apply changes. Please try again.', key: 'applyChanges' });
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      // When minimizing, clear unread messages
      setHasUnreadMessages(false);
    }
  };

  const handleExpand = () => {
    setIsMinimized(false);
    setHasUnreadMessages(false);
  };

  // Clear chat history function
  const handleClearChatHistory = () => {
    if (recipe?.id) {
      clearChatHistory(recipe.id);
      setMessages([]);
      antMessage.success('Chat history cleared');
      
      // Add new welcome message
      const recipeTitle = recipe?.title || 'your recipe';
      const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
      const hasIngredients = ingredients.length > 0;
      const hasSteps = recipe?.steps?.length > 0;
      const hasNotes = recipe?.notes?.length > 0;
      
      let recipeStatus = '';
      if (hasIngredients || hasSteps || hasNotes) {
        recipeStatus = '\n\n**Current Recipe Status:**\n';
        if (hasIngredients) {
          recipeStatus += `✅ ${ingredients.length} ingredient${ingredients.length > 1 ? 's' : ''}\n`;
        } else {
          recipeStatus += '❌ No ingredients yet\n';
        }
        if (hasSteps) {
          recipeStatus += `✅ ${recipe.steps.length} instruction step${recipe.steps.length > 1 ? 's' : ''}\n`;
        } else {
          recipeStatus += '❌ No instructions yet\n';
        }
        if (hasNotes) {
          recipeStatus += `✅ ${recipe.notes.length} note${recipe.notes.length > 1 ? 's' : ''}\n`;
        } else {
          recipeStatus += '❌ No notes yet\n';
        }
      }
      
      // Add welcome message when chat opens
      const welcomeMessage = modelStatus.isInitialized 
        ? `Hi! I'm your AI recipe assistant with full knowledge of "${recipeTitle}". I can see all your current ingredients, instructions, and notes.${recipeStatus}

**I can help you:**
• **Generate complete recipes** - "Create a recipe for chicken fajitas"
• **Add ingredients** - "Add more spices" or "What vegetables go well with this?"
• **Improve instructions** - "Make the cooking steps clearer" or "Add cooking times"
• **Enhance flavors** - "Make this more flavorful" or "Add Mexican seasonings"
• **Recipe variations** - "Make this vegetarian" or "Add a spicy version"

**Examples:**
• "Create a complete chicken fajita recipe"
• "Add bell peppers and onions to the ingredients"
• "How should I season the chicken?"
• "Make the cooking instructions more detailed"

I have the complete context of your current recipe, so feel free to ask specific questions about any part of it!`
        : `Hi! I'm loading my AI capabilities to help you edit "${recipeTitle}". This may take a moment...

Once ready, I'll have full knowledge of your current recipe and can help you:
• **Generate complete recipes** from scratch
• Add or modify ingredients with context
• Improve cooking instructions
• Suggest recipe variations
• Fix formatting or clarity issues

I'll be able to see all your ingredients, steps, and notes to provide contextual suggestions.`;
        
      setMessages([{
        id: Date.now(),
        type: 'ai',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="support-chat-widget">
      {isMinimized ? (
        // Minimized chat bubble
        <div className="chat-bubble" onClick={handleExpand}>
          <Badge dot={hasUnreadMessages} offset={[-5, 5]}>
            <div className="chat-bubble-content">
              <RobotOutlined style={{ fontSize: '20px', color: 'white' }} />
              <Text style={{ color: 'white', marginLeft: '8px', fontWeight: 500 }}>
                AI Assistant
              </Text>
            </div>
          </Badge>
        </div>
      ) : (
        // Expanded chat window
        <Card 
          className="support-chat-window"
          size="small"
          title={
            <div className="chat-header">
              <Space>
                <Text strong style={{ color: 'white' }}>
                  {(modelStatus.isLoading || isSwitchingModel) && (
                    <Text style={{ color: '#faad14', marginLeft: 8, fontSize: '11px' }}>
                      {isSwitchingModel ? '(Switching model...)' : '(Loading model...)'}
                    </Text>
                  )}
                </Text>
              </Space>
              <Space>
                <Select
                  value={selectedModel}
                  onChange={handleModelChange}
                  style={{ 
                    width: 180, 
                    fontSize: '12px'
                  }}
                  styles={{
                    popup: {
                      root: { fontSize: '12px' }
                    }
                  }}
                  size="small"
                  disabled={isSwitchingModel || modelStatus.isLoading}
                  placeholder="Select AI Model"
                  optionLabelProp="label"
                >
                  {Object.entries(availableModels).map(([key, model]) => (
                    <Option key={key} value={key} label={model.name}>
                      <div style={{ fontSize: '12px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{model.name}</div>
                        <div style={{ color: '#666', fontSize: '11px' }}>{model.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
                <Tooltip title="Clear chat history">
                  <Button 
                    type="text" 
                    icon={<ClearOutlined />} 
                    onClick={handleClearChatHistory}
                    size="small"
                    style={{ color: 'white' }}
                    disabled={messages.length === 0}
                  />
                </Tooltip>
                <Tooltip title="Minimize">
                  <Button 
                    type="text" 
                    icon={<MinusOutlined />} 
                    onClick={handleToggleMinimize}
                    size="small"
                    style={{ color: 'white' }}
                  />
                </Tooltip>
                <Tooltip title="Close">
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    onClick={onClose}
                    size="small"
                    style={{ color: 'white' }}
                  />
                </Tooltip>
              </Space>
            </div>
          }
        >
          <Spin spinning={isSwitchingModel} tip="Switching AI model...">
            <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'ai' ? (
                    <RobotOutlined style={{ color: '#1890ff' }} />
                  ) : message.type === 'system' ? (
                    <MessageOutlined style={{ color: '#faad14' }} />
                  ) : (
                    // User message - use Google profile image if available
                    userInfo?.userPicture ? (
                      <Avatar 
                        src={userInfo.userPicture} 
                        size={24}
                        alt={userInfo.userName || 'User'}
                      />
                    ) : (
                      <UserOutlined style={{ color: '#52c41a' }} />
                    )
                  )}
                </div>
                <div className="message-content">
                  <MessageContent 
                    message={message} 
                    onOpenRecipe={onUpdateRecipe} 
                    editingEnabled={editingEnabled}
                    onApplyChanges={handleApplyChanges}
                    userInfo={userInfo}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <div className="message-avatar">
                  <RobotOutlined style={{ color: '#1890ff' }} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </Spin>
          
          <div className="chat-input">
            {(!modelStatus.isInitialized && !modelStatus.isLoading && !isSwitchingModel) && (
              <div style={{ 
                padding: '8px', 
                background: '#fff7e6', 
                borderRadius: '4px', 
                marginBottom: '8px',
                fontSize: '12px',
                color: '#d48806'
              }}>
                <ExclamationCircleOutlined style={{ marginRight: '4px' }} />
                AI model is initializing. Please wait...
              </div>
            )}
            {isSwitchingModel && (
              <div style={{ 
                padding: '8px', 
                background: '#e6f7ff', 
                borderRadius: '4px', 
                marginBottom: '8px',
                fontSize: '12px',
                color: '#1890ff'
              }}>
                <ExclamationCircleOutlined style={{ marginRight: '4px' }} />
                Switching AI model, please wait...
              </div>
            )}
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={inputValue}
                onChange={(e: any) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isSwitchingModel 
                    ? 'Switching models, please wait...'
                    : modelStatus.isInitialized 
                      ? 'Try: \'Create a recipe for pasta carbonara\' or \'Add more herbs to this recipe\'' 
                      : 'AI is loading, please wait...'
                }
                autoSize={{ minRows: 1, maxRows: 2 }}
                disabled={isLoading || !modelStatus.isInitialized || isSwitchingModel}
                style={{ fontSize: '13px' }}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !modelStatus.isInitialized || isSwitchingModel}
                style={{ height: 'auto' }}
                size="small"
                title={
                  isSwitchingModel 
                    ? 'Switching models...' 
                    : !modelStatus.isInitialized 
                      ? 'AI model is loading...' 
                      : ''
                }
              />
            </Space.Compact>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RecipeAIChat;
