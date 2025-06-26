import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Space, Typography, Badge, Tooltip, message as antMessage, Select, Spin, Avatar } from 'antd';
import { CloseOutlined, SendOutlined, RobotOutlined, UserOutlined, MessageOutlined, MinusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import recipeAIService from '../services/RecipeAIService';
import './RecipeAIChat.css';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        } catch (error) {
          console.error('Failed to initialize AI model:', error);
          antMessage.warning('AI model failed to load. Using fallback responses.');
        }
      }
    };
    
    if (isOpen) {
      checkModelStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Build contextual welcome message based on current recipe state
      const recipeTitle = recipe?.title || 'your recipe';
      const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
      const hasIngredients = ingredients.length > 0;
      const hasSteps = recipe?.steps?.length > 0;
      const hasNotes = recipe?.notes?.length > 0;
      
      let recipeStatus = '';
      if (hasIngredients || hasSteps || hasNotes) {
        recipeStatus = `\n\n**Current Recipe Status:**\n`;
        if (hasIngredients) {
          recipeStatus += `✅ ${ingredients.length} ingredient${ingredients.length > 1 ? 's' : ''}\n`;
        } else {
          recipeStatus += `❌ No ingredients yet\n`;
        }
        if (hasSteps) {
          recipeStatus += `✅ ${recipe.steps.length} instruction step${recipe.steps.length > 1 ? 's' : ''}\n`;
        } else {
          recipeStatus += `❌ No instructions yet\n`;
        }
        if (hasNotes) {
          recipeStatus += `✅ ${recipe.notes.length} note${recipe.notes.length > 1 ? 's' : ''}\n`;
        } else {
          recipeStatus += `❌ No notes yet\n`;
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
  }, [isOpen, recipe?.title, Array.isArray(recipe?.ingredients) ? recipe.ingredients.length : 0, recipe?.steps?.length, recipe?.notes?.length, modelStatus.isInitialized]);

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
      
    } catch (error) {
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
      const conversationHistory = messages.filter(msg => msg.type !== 'system');
      
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
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response if AI fails
      const fallbackResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I'm having trouble processing that request right now. However, I can still help you with:\n\n• Ingredient modifications\n• Cooking instruction improvements\n• Recipe formatting\n• General cooking tips\n\nPlease try rephrasing your request, or let me know what specific part of the recipe you'd like to work on.`,
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
    const message = messages.find(msg => msg.id === messageId);
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
          updatedRecipe.ingredients = suggestedChanges.ingredients.map(ingredient => {
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
      
    } catch (error) {
      console.error('Error applying AI changes:', error);
      antMessage.error({ content: 'Failed to apply changes. Please try again.', key: 'applyChanges' });
    }
  };

  const handleKeyPress = (e) => {
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
                  <Paragraph 
                    style={{ 
                      margin: 0, 
                      whiteSpace: 'pre-line', 
                      fontSize: '13px',
                      color: message.isError ? '#ff4d4f' : message.type === 'system' ? '#faad14' : undefined,
                      fontStyle: message.type === 'system' ? 'italic' : 'normal'
                    }}
                  >
                    {message.content}
                  </Paragraph>
                  {message.hasActions && message.type === 'ai' && (
                    <Space style={{ marginTop: 8 }}>
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleApplyChanges(message.id)}
                        disabled={!editingEnabled}
                        title={!editingEnabled ? "Enable editing to apply changes" : ""}
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
                      marginTop: 4 
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Text>
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
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isSwitchingModel 
                    ? "Switching models, please wait..."
                    : modelStatus.isInitialized 
                      ? "Try: 'Create a recipe for pasta carbonara' or 'Add more herbs to this recipe'" 
                      : "AI is loading, please wait..."
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
                    ? "Switching models..." 
                    : !modelStatus.isInitialized 
                      ? "AI model is loading..." 
                      : ""
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
