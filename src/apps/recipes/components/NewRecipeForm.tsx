import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Typography, Alert, message, Divider } from 'antd';

const { Text } = Typography;

// Manual-only New Recipe form
// Props:
// - visible: boolean
// - onCancel: () => void
// - onSave: (recipeData) => Promise<void> | void
// - loading?: boolean
type NewRecipeFormProps = {
  visible: boolean;
  onCancel: () => void;
  onSave: (recipeData: any) => Promise<void> | void;
  loading?: boolean;
};

const NewRecipeForm: React.FC<NewRecipeFormProps> = ({ visible, onCancel, onSave, loading = false }) => {
  const [form] = Form.useForm();
  const [titleValue, setTitleValue] = useState('');
  // Slug is no longer collected from the user; it's generated from title on submit

  useEffect(() => {
    if (visible) {
      // Reset when opened
      form.resetFields();
      setTitleValue('');
    }
  }, [visible, form]);

  const generateSlug = (title: string) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e: any) => {
    const newTitle = e.target.value;
    setTitleValue(newTitle);
    form.setFieldsValue({ title: newTitle });
  };

  const resetForm = () => {
    form.resetFields();
    setTitleValue('');
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const finalTitle = titleValue || values.title;
      const finalSlug = generateSlug(finalTitle);

      // Normalize arrays
      const ingredients = (values.ingredients || []).map((ing: any) => ({
        name: ing?.name || '',
        quantity: typeof ing?.quantity === 'number' ? ing.quantity : 0,
        unit: ing?.unit || '',
        notes: ing?.notes || ''
      })).filter((ing: any) => ing.name);

      const steps = (values.steps || []).map((s: any) => (typeof s === 'string' ? s : s?.text || '')).filter((s: string) => s && s.trim().length > 0);
      const notes = (values.notes || []).map((n: any) => (typeof n === 'string' ? n : n?.text || '')).filter((n: string) => n && n.trim().length > 0);
      const tags = (values.tags || []).map((t: any) => String(t)).filter((t: string) => t && t.trim().length > 0);

      const recipeData = {
        title: finalTitle,
        permalink: finalSlug,
        description: values.description || '',
        ingredients,
        steps,
        notes,
        defaultServings: typeof values.defaultServings === 'number' ? values.defaultServings : 4,
        servingUnits: values.servingUnits || 'servings',
        scalable: true,
        prepTime: values.prepTime || '',
        cookTime: values.cookTime || '',
        totalTime: values.totalTime || '',
        difficulty: values.difficulty || '',
        cuisine: values.cuisine || '',
        tags
      };

      await onSave(recipeData);
      resetForm();
    } catch (error) {
      // validation failed or save failed; keep modal open
      // eslint-disable-next-line no-console
      console.error('NewRecipeForm submit failed:', error);
    }
  };

  return (
    <Modal
      title="Create New Recipe"
      open={visible}
      onCancel={handleCancel}
      destroyOnClose={true}
      maskClosable={false}
      zIndex={3000}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit} loading={loading}>
          Create Recipe
        </Button>
      ]}
      width={900}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" initialValues={{
        title: titleValue,
        description: '',
        defaultServings: 4,
        servingUnits: 'servings',
        ingredients: [{ name: '', quantity: 0, unit: '', notes: '' }],
        steps: [''],
        notes: [],
        prepTime: '',
        cookTime: '',
        totalTime: '',
        difficulty: '',
        cuisine: '',
        tags: []
      }}>
        <Form.Item name="title" label="Recipe Title" rules={[{ required: true, message: 'Please enter a recipe title' }]}>
          <Input placeholder="Enter recipe title" value={titleValue} onChange={handleTitleChange} />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Briefly describe the recipe" rows={3} />
        </Form.Item>

        <Divider orientation="left">Ingredients</Divider>
        <Form.List name="ingredients">
          {(fields: any[], { add, remove }: any) => (
            <div>
              {fields.map((field: any) => (
                <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                  <Form.Item {...field} name={[field.name, 'name']} rules={[{ required: true, message: 'Name required' }]}>
                    <Input placeholder="Ingredient name" />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'quantity']}>
                    <InputNumber placeholder="Qty" min={0} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'unit']}>
                    <Input placeholder="Unit" />
                  </Form.Item>
                  <Button onClick={() => remove(field.name)}>Remove</Button>
                  <Form.Item {...field} name={[field.name, 'notes']} style={{ gridColumn: '1 / span 4', marginTop: -8 }}>
                    <Input placeholder="Notes (optional)" />
                  </Form.Item>
                </div>
              ))}
              <Button type="dashed" onClick={() => add({ name: '', quantity: 0, unit: '', notes: '' })} block>
                Add ingredient
              </Button>
            </div>
          )}
        </Form.List>

        <Divider orientation="left">Steps</Divider>
        <Form.List name="steps">
          {(fields: any[], { add, remove }: any) => (
            <div>
              {fields.map((field: any) => (
                <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
                  <Form.Item {...field} name={field.name} rules={[{ required: true, message: 'Step required' }]}
                    style={{ marginBottom: 0 }}>
                    <Input.TextArea placeholder={`Step ${field.name + 1}`} rows={2} />
                  </Form.Item>
                  <Button onClick={() => remove(field.name)}>Remove</Button>
                </div>
              ))}
              <Button type="dashed" onClick={() => add('')} block>
                Add step
              </Button>
            </div>
          )}
        </Form.List>

        <Divider orientation="left">Notes</Divider>
        <Form.List name="notes">
          {(fields: any[], { add, remove }: any) => (
            <div>
              {fields.map((field: any) => (
                <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
                  <Form.Item {...field} name={field.name}>
                    <Input placeholder="Note" />
                  </Form.Item>
                  <Button onClick={() => remove(field.name)}>Remove</Button>
                </div>
              ))}
              <Button type="dashed" onClick={() => add('')} block>
                Add note
              </Button>
            </div>
          )}
        </Form.List>

        <Divider orientation="left">Details</Divider>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <Form.Item name="defaultServings" label="Servings">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="servingUnits" label="Units">
            <Input placeholder="servings" />
          </Form.Item>
          <Form.Item name="prepTime" label="Prep Time">
            <Input placeholder="e.g. 15 min" />
          </Form.Item>
          <Form.Item name="cookTime" label="Cook Time">
            <Input placeholder="e.g. 30 min" />
          </Form.Item>
          <Form.Item name="totalTime" label="Total Time">
            <Input placeholder="e.g. 45 min" />
          </Form.Item>
          <Form.Item name="difficulty" label="Difficulty">
            <Select allowClear options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
          </Form.Item>
          <Form.Item name="cuisine" label="Cuisine">
            <Input placeholder="e.g. Italian" />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Add tags" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default NewRecipeForm;
