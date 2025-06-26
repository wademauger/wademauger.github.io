import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const AddRecipeModal = ({ googleDriveService, onRecipeAdded, onCancel, open }) => {
  const [isModalVisible, setIsModalVisible] = useState(open || false);
  const [isLoading, setIsLoading] = useState(false);
  const [permalinkManuallyEdited, setPermalinkManuallyEdited] = useState(false);
  const [form] = Form.useForm();
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Update modal visibility when open prop changes
  useEffect(() => {
    setIsModalVisible(open || false);
    // Reset permalink editing state when modal opens
    if (open) {
      setPermalinkManuallyEdited(false);
      setShowAiChat(false);
      setAiMessages([]);
      setAiLoading(false);
    }
  }, [open]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setPermalinkManuallyEdited(false);
    setShowAiChat(false);
    setAiMessages([]);
    setAiLoading(false);
    if (onCancel) {
      onCancel();
    }
  };
  // Handle AI button click
  const handleCreateWithAI = async () => {
    // Get the current title value
    let title = form.getFieldValue('title');
    if (!title) title = 'a new dish';
    setShowAiChat(true);
    setAiLoading(true);
    // Pre-send user message
    const userMsg = { role: 'user', content: `Can you give me a recipe for ${title}?` };
    setAiMessages([userMsg]);
    // Simulate bot response (replace with real AI call)
    setTimeout(() => {
      setAiMessages([userMsg, { role: 'bot', content: `Sure! Here is a recipe for ${title}...` }]);
      setAiLoading(false);
    }, 1200);
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
        title="Create New Recipe"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        onOk={null}
        width={showAiChat ? 600 : 500}
      >
        {!showAiChat ? (
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            {/* ...existing form content... */}
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
          <div style={{ minHeight: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Recipe Chatbot</div>
            <div style={{
              background: '#f4f8fb',
              borderRadius: 8,
              padding: 16,
              minHeight: 120,
              maxHeight: 260,
              overflowY: 'auto',
              marginBottom: 8
            }}>
              {aiMessages.map((msg, idx) => (
                <div key={idx} style={{
                  marginBottom: 10,
                  textAlign: msg.role === 'user' ? 'right' : 'left'
                }}>
                  <span style={{
                    display: 'inline-block',
                    background: msg.role === 'user' ? '#e0e7ff' : '#e6f7e6',
                    color: '#333',
                    borderRadius: 16,
                    padding: '8px 14px',
                    maxWidth: '80%',
                    fontSize: 15
                  }}>{msg.content}</span>
                </div>
              ))}
              {aiLoading && <div style={{ color: '#888', fontStyle: 'italic' }}>Thinking...</div>}
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              This is a preview of the AI recipe chat experience.
            </div>
          </div>
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
          {showAiChat ? (
            <>
              <Button onClick={() => setShowAiChat(false)}>
                Back
              </Button>
              <Button onClick={handleCancel}>
                Close
              </Button>
            </>
          ) : (
            <>
              {console.log('🔍 Rendering 3 buttons: Cancel, AI, Create')}
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                type="default"
                style={{
                  background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  border: '2px solid #6a11cb',
                  marginLeft: 8,
                  marginRight: 8
                }}
                loading={aiLoading}
                onClick={handleCreateWithAI}
              >
                🤖 Create Recipe with AI
              </Button>
              <Button type="primary" loading={isLoading} onClick={handleOk}>
                Create Recipe
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AddRecipeModal;
