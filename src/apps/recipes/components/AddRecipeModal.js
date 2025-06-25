import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const AddRecipeModal = ({ googleDriveService, onRecipeAdded, onCancel, open }) => {
  const [isModalVisible, setIsModalVisible] = useState(open || false);
  const [isLoading, setIsLoading] = useState(false);
  const [permalinkManuallyEdited, setPermalinkManuallyEdited] = useState(false);
  const [form] = Form.useForm();

  // Update modal visibility when open prop changes
  useEffect(() => {
    setIsModalVisible(open || false);
    // Reset permalink editing state when modal opens
    if (open) {
      setPermalinkManuallyEdited(false);
    }
  }, [open]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setPermalinkManuallyEdited(false);
    if (onCancel) {
      onCancel();
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
        title="Create New Recipe"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={isLoading}
        width={500}
        okText="Create Recipe"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
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
      </Modal>
    </>
  );
};

export default AddRecipeModal;
