import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Form, Button, message, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import recipeAIService from '../services/RecipeAIService';

const AddRecipeModal = ({ googleDriveService, onRecipeAdded, onCancel, open }) => {
  const [isModalVisible, setIsModalVisible] = useState(open || false);
  const [isLoading, setIsLoading] = useState(false);
  const [permalinkManuallyEdited, setPermalinkManuallyEdited] = useState(false);
  const [form] = Form.useForm();
  const [showManualMode, setShowManualMode] = useState(false); // Start with AI mode by default
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [currentRecipePreview, setCurrentRecipePreview] = useState(null);
  const messagesEndRef = useRef(null);

  // Update modal visibility when open prop changes
  useEffect(() => {
    setIsModalVisible(open || false);
    // Reset to AI mode when modal opens
    if (open) {
      console.log('🔧 AddRecipeModal opened - defaulting to AI mode');
      setPermalinkManuallyEdited(false);
      setShowManualMode(false); // Always start in AI mode
      setAiMessages([]);
      setAiLoading(false);
      setChatInput('');
      setCurrentRecipePreview(null);
      console.log('🔧 After reset - showManualMode should be false');
    } else {
      console.log('🔧 AddRecipeModal closed');
    }
  }, [open]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setPermalinkManuallyEdited(false);
    setShowManualMode(false); // Reset to AI mode
    setAiMessages([]);
    setAiLoading(false);
    setChatInput('');
    setCurrentRecipePreview(null);
    if (onCancel) {
      onCancel();
    }
  };
  // Handle AI chat submission
  const handleChatSubmit = async (userInput) => {
    if (!userInput.trim() || aiLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: userInput,
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

      // Get AI response using the real service
      const aiResponse = await recipeAIService.generateResponse(
        userInput,
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
      // Note: You may want to add recipe parsing functions here similar to NewRecipeForm
      // For now, we'll just show the response
      
    } catch (error) {
      console.error('AI service error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `I'm having trouble connecting to the AI service right now. Could you try rephrasing your question? I'm here to help you create a great recipe!`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  // Generate slug from title
  const generateSlugFromTitle = (title) => {
    if (!title || typeof title !== 'string') return '';

    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Handle title input change
  const handleTitleChange = (e) => {
    const title = e.target.value;

    // Only auto-generate permalink if user hasn't manually edited it
    if (!permalinkManuallyEdited && title) {
      const generatedSlug = generateSlugFromTitle(title);
      form.setFieldsValue({ permalink: generatedSlug });
      // Trigger validation for the permalink field
      form.validateFields(['permalink']);
    }
  };

  const validatePermalink = async (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Permalink is required'));
    }

    // Client-side format validation
    const validation = googleDriveService.validatePermalinkFormat(value);
    if (!validation.isValid) {
      return Promise.reject(new Error(validation.error));
    }

    // Check availability
    try {
      const isAvailable = await googleDriveService.isPermalinkAvailable(value);
      if (!isAvailable) {
        return Promise.reject(new Error('This permalink is already taken'));
      }
    } catch (error) {
      return Promise.reject(new Error('Unable to check permalink availability'));
    }

    return Promise.resolve();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);

      // Create the recipe with the provided permalink
      const newRecipe = await googleDriveService.addRecipe({
        permalink: values.permalink,
        title: values.title || 'New Recipe'
      });

      message.success('Recipe created successfully!');
      setIsModalVisible(false);
      form.resetFields();

      // Notify parent component that a recipe was added
      if (onRecipeAdded) {
        onRecipeAdded(newRecipe);
      }
    } catch (error) {
      message.error(error.message || 'Failed to create recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPermalink = (value) => {
    if (!value) return value;

    // Convert to lowercase and replace invalid characters with hyphens
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Handle permalink input change (manual editing)
  const handlePermalinkChange = (e) => {
    const value = e.target.value;
    const formatted = formatPermalink(value);
    form.setFieldsValue({ permalink: formatted });

    // Mark as manually edited if user types anything
    if (value !== form.getFieldValue('permalink')) {
      setPermalinkManuallyEdited(true);
    }
  };

  return (
    <>
      {/* Only show button if not controlled by parent component */}
      {!open && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          size="large"
        >
          Add Recipe
        </Button>
      )}
      <Modal
        title={showManualMode ? 'Create New Recipe' : 'Create Recipe with Sous Chef AI'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        onOk={null}
        width={showManualMode ? 500 : 1200}
      >
        {(() => {
          console.log('🎨 Rendering AddRecipeModal content:', { showManualMode, open: isModalVisible });
        })()}
        {showManualMode ? (
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            <div style={{
              background: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ fontWeight: 600, color: '#0050b3', marginBottom: 4 }}>
                📝 Manual Recipe Creation
              </div>
              <div style={{ fontSize: '13px', color: '#003a8c' }}>
                Create a new recipe manually with a custom title and URL slug. You'll add ingredients and instructions after creation.
              </div>
            </div>
            
            <Form.Item
              label="Recipe Title (optional)"
              name="title"
              extra="You can change this later when editing the recipe"
            >
              <Input
                placeholder="e.g., Chocolate Chip Cookies"
                size="large"
                onChange={handleTitleChange}
              />
            </Form.Item>
            <Form.Item
              label="Permalink"
              name="permalink"
              rules={[
                { validator: validatePermalink }
              ]}
              extra="This will be the permanent URL slug for your recipe (cannot be changed later)"
              hasFeedback
            >
              <Input
                placeholder="e.g., chocolate-chip-cookies"
                size="large"
                onChange={handlePermalinkChange}
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>
            <div style={{
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              marginTop: '16px'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                <strong>Permalink Guidelines:</strong>
              </div>
              <ul style={{
                fontSize: '12px',
                color: '#666',
                margin: 0,
                paddingLeft: '16px'
              }}>
                <li>Only lowercase letters, numbers, and hyphens</li>
                <li>Must be 2-50 characters long</li>
                <li>Cannot start or end with hyphens</li>
                <li>Must be unique across all recipes</li>
                <li>Cannot be changed once created</li>
              </ul>
            </div>
          </Form>
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
                <div style={{ 
                  color: '#666', 
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '60px 20px',
                  fontSize: 16
                }}>
                  🍽️ Recipe preview will appear here once the AI generates a complete recipe
                </div>
              </div>
              
              {/* Right Column - AI Chat Interface */}
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%'
              }}>
                <div style={{ 
                  fontWeight: 600, 
                  marginBottom: 12,
                  fontSize: 16,
                  color: '#333'
                }}>
                  💬 Chat with Sous Chef AI
                </div>
                
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: 16,
                  flex: 1,
                  overflowY: 'auto',
                  marginBottom: 12,
                  border: '1px solid #e2e8f0'
                }}>
                  {aiMessages.length === 0 ? (
                    <div style={{ 
                      color: '#64748b', 
                      fontStyle: 'italic',
                      textAlign: 'center',
                      padding: '40px 20px',
                      fontSize: 15
                    }}>
                      👋 Hi! I'm your Sous Chef AI. What would you like to cook today?
                      <br /><br />
                      Try asking me for:
                      <br />• "A pasta recipe with mushrooms"
                      <br />• "Quick vegetarian dinner ideas"
                      <br />• "Chocolate dessert for beginners"
                    </div>
                  ) : (
                    aiMessages.map((msg, idx) => (
                      <div key={idx} style={{
                        marginBottom: 12,
                        textAlign: msg.isUser ? 'right' : 'left'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          background: msg.isUser ? '#3b82f6' : (msg.isError ? '#ef4444' : '#10b981'),
                          color: '#fff',
                          borderRadius: 16,
                          padding: '10px 16px',
                          maxWidth: '85%',
                          fontSize: 14,
                          lineHeight: 1.4,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {msg.text}
                        </span>
                        {msg.provider && (
                          <div style={{
                            fontSize: 10,
                            color: '#666',
                            textAlign: msg.isUser ? 'right' : 'left',
                            marginTop: 4
                          }}>
                            {msg.providerName} • {msg.timestamp}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {aiLoading && (
                    <div style={{ 
                      color: '#64748b', 
                      fontStyle: 'italic',
                      textAlign: 'center',
                      padding: '10px'
                    }}>
                      🤔 Thinking of the perfect recipe...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: 8,
                  alignItems: 'center'
                }}>
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask for a recipe or cooking advice..."
                    style={{ 
                      borderRadius: 20,
                      paddingLeft: 16,
                      paddingRight: 16
                    }}
                    onPressEnter={(e) => {
                      e.preventDefault();
                      if (chatInput.trim() && !aiLoading) {
                        handleChatSubmit(chatInput);
                        setChatInput('');
                      }
                    }}
                  />
                  <Button
                    type="primary"
                    style={{
                      borderRadius: 20,
                      background: '#10b981',
                      borderColor: '#10b981',
                      minWidth: 40,
                      height: 40
                    }}
                    loading={aiLoading}
                    onClick={() => {
                      if (chatInput.trim() && !aiLoading) {
                        handleChatSubmit(chatInput);
                        setChatInput('');
                      }
                    }}
                  >
                    {aiLoading ? '' : '→'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
        {/* Buttons always visible at bottom */}
        <div style={{ 
          marginTop: 20, 
          padding: '16px 0', 
          borderTop: '1px solid #f0f0f0',
          display: 'flex', 
          gap: 8, 
          justifyContent: 'flex-end' 
        }}>
          {!showManualMode ? [
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
            </Button>
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
            <Button key="create" type="primary" loading={isLoading} onClick={handleOk}>
              Create Recipe
            </Button>
          ]}
        </div>
      </Modal>
    </>
  );
};

export default AddRecipeModal;
