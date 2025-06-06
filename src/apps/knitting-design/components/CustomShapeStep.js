import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Row, Col, Typography, Space, Divider, Select, message, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { PanelDiagram } from '../../../components/PanelDiagram';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CustomShapeStep = ({ data, onChange, onNext, onBack }) => {
  const [form] = Form.useForm();
  const [shapes, setShapes] = useState(data.customShapes || {});
  const [currentShape, setCurrentShape] = useState(null);
  const [editingShape, setEditingShape] = useState(null);
  const [previewShape, setPreviewShape] = useState(null);

  // Initialize with a basic shape template
  const createNewShape = () => {
    return {
      height: 10,
      baseA: 20,
      baseB: 20,
      baseBHorizontalOffset: 0,
      successors: [],
      finishingSteps: []
    };
  };

  const handleAddShape = () => {
    const shapeName = `Shape ${Object.keys(shapes).length + 1}`;
    setEditingShape({ name: shapeName, shape: createNewShape() });
  };

  const handleEditShape = (shapeName) => {
    setEditingShape({ name: shapeName, shape: { ...shapes[shapeName] } });
  };

  const handleSaveShape = (shapeData) => {
    const newShapes = { ...shapes, [shapeData.name]: shapeData.shape };
    setShapes(newShapes);
    onChange({ 
      ...data, 
      customShapes: newShapes,
      basePattern: {
        id: 'custom',
        name: 'Custom Pattern',
        description: 'Custom designed pattern',
        shapes: newShapes
      }
    });
    setEditingShape(null);
  };

  const handleDeleteShape = (shapeName) => {
    const newShapes = { ...shapes };
    delete newShapes[shapeName];
    setShapes(newShapes);
    onChange({ ...data, customShapes: newShapes });
  };

  const handleNext = () => {
    if (Object.keys(shapes).length === 0) {
      message.warning('Please create at least one shape to continue');
      return;
    }
    onNext();
  };

  return (
    <div className="custom-shape-step">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Custom Pattern Design</Title>
            <Text type="secondary">
              Create custom shapes for your pattern. Each shape represents a knitted piece like front, back, or sleeves.
            </Text>
          </Card>
        </Col>

        <Col lg={16} md={24}>
          <Card 
            title="Pattern Shapes" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddShape}
              >
                Add Shape
              </Button>
            }
          >
            {Object.keys(shapes).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <Text>No shapes created yet. Click "Add Shape" to start designing your pattern.</Text>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {Object.entries(shapes).map(([shapeName, shape]) => (
                  <Col lg={8} md={12} sm={24} key={shapeName}>
                    <Card 
                      size="small"
                      title={shapeName}
                      extra={
                        <Space>
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />} 
                            onClick={() => setPreviewShape({ name: shapeName, shape })}
                          />
                          <Button 
                            size="small" 
                            icon={<EditOutlined />} 
                            onClick={() => handleEditShape(shapeName)}
                          />
                          <Button 
                            size="small" 
                            icon={<DeleteOutlined />} 
                            danger
                            onClick={() => handleDeleteShape(shapeName)}
                          />
                        </Space>
                      }
                    >
                      <div style={{ textAlign: 'center' }}>
                        <PanelDiagram 
                          shape={shape} 
                          label=""
                          size={120}
                          padding={10}
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {shape.height}h × {shape.baseA}w → {shape.baseB}w
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>

        <Col lg={8} md={24}>
          <Card title="Pattern Information">
            <Form layout="vertical">
              <Form.Item label="Pattern Name">
                <Input 
                  value={data.name || 'Custom Pattern'} 
                  onChange={(e) => onChange({ ...data, name: e.target.value })}
                  placeholder="Enter pattern name"
                />
              </Form.Item>
              
              <Form.Item label="Description">
                <TextArea 
                  value={data.description || ''} 
                  onChange={(e) => onChange({ ...data, description: e.target.value })}
                  placeholder="Describe your custom pattern..."
                  rows={3}
                />
              </Form.Item>

              <Divider />

              <Text strong>Design Tips:</Text>
              <ul style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                <li>Start with basic shapes (front, back, sleeves)</li>
                <li>Use successors to create complex constructions</li>
                <li>Height and width are in arbitrary units</li>
                <li>baseA is bottom width, baseB is top width</li>
              </ul>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <Button size="large" onClick={onBack}>
              Back
            </Button>
            <Button 
              type="primary" 
              size="large"
              onClick={handleNext}
              disabled={Object.keys(shapes).length === 0}
            >
              Next: Sizing
            </Button>
          </div>
        </Col>
      </Row>

      {/* Shape Editor Modal */}
      <ShapeEditorModal
        visible={!!editingShape}
        shapeData={editingShape}
        onSave={handleSaveShape}
        onCancel={() => setEditingShape(null)}
      />

      {/* Shape Preview Modal */}
      <Modal
        title={previewShape?.name}
        open={!!previewShape}
        onCancel={() => setPreviewShape(null)}
        footer={null}
        width={400}
      >
        {previewShape && (
          <div style={{ textAlign: 'center' }}>
            <PanelDiagram 
              shape={previewShape.shape} 
              label=""
              size={300}
              padding={20}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

// Shape Editor Modal Component
const ShapeEditorModal = ({ visible, shapeData, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [shape, setShape] = useState(null);

  React.useEffect(() => {
    if (visible && shapeData) {
      setShape({ ...shapeData.shape });
      form.setFieldsValue({
        name: shapeData.name,
        height: shapeData.shape.height,
        baseA: shapeData.shape.baseA,
        baseB: shapeData.shape.baseB,
        baseBHorizontalOffset: shapeData.shape.baseBHorizontalOffset || 0
      });
    }
  }, [visible, shapeData, form]);

  const handleSave = () => {
    form.validateFields().then(values => {
      const updatedShape = {
        ...shape,
        height: values.height,
        baseA: values.baseA,
        baseB: values.baseB,
        baseBHorizontalOffset: values.baseBHorizontalOffset
      };
      onSave({ name: values.name, shape: updatedShape });
    });
  };

  const handleFieldChange = (field, value) => {
    const updatedShape = { ...shape, [field]: value };
    setShape(updatedShape);
  };

  if (!shape) return null;

  return (
    <Modal
      title="Edit Shape"
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      width={800}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Shape Name"
              rules={[{ required: true, message: 'Please enter a shape name' }]}
            >
              <Input placeholder="Front, Back, Sleeve, etc." />
            </Form.Item>

            <Form.Item
              name="height"
              label="Height"
              rules={[{ required: true, message: 'Please enter height' }]}
            >
              <InputNumber 
                min={1} 
                style={{ width: '100%' }}
                onChange={(value) => handleFieldChange('height', value)}
              />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="baseA"
                  label="Bottom Width"
                  rules={[{ required: true, message: 'Please enter bottom width' }]}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }}
                    onChange={(value) => handleFieldChange('baseA', value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="baseB"
                  label="Top Width"
                  rules={[{ required: true, message: 'Please enter top width' }]}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }}
                    onChange={(value) => handleFieldChange('baseB', value)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="baseBHorizontalOffset"
              label="Top Horizontal Offset"
            >
              <InputNumber 
                style={{ width: '100%' }}
                onChange={(value) => handleFieldChange('baseBHorizontalOffset', value)}
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <div style={{ textAlign: 'center' }}>
            <Text strong>Preview</Text>
            <div style={{ marginTop: '16px' }}>
              <PanelDiagram 
                shape={shape} 
                label=""
                size={200}
                padding={20}
              />
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default CustomShapeStep;
