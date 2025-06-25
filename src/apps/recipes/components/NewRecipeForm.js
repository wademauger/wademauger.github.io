import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Alert,
  message
} from 'antd';

const { Text } = Typography;

const NewRecipeForm = ({ visible, onCancel, onSave, loading = false }) => {
  const [form] = Form.useForm();
  const [titleValue, setTitleValue] = useState('');
  const [slugValue, setSlugValue] = useState('');
  const [manualSlugEdit, setManualSlugEdit] = useState(false);

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

  return (
    <Modal
      title="Create New Recipe"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit} loading={loading}>
          Create Recipe
        </Button>
      ]}
      width={600}
      style={{ top: 20 }}
    >
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
    </Modal>
  );
};

export default NewRecipeForm;
