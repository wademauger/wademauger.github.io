import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Row, Col, Typography, Space, Divider, Select, message, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { PanelDiagram } from '../../../components/PanelDiagram';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CustomShapeStep = ({ data, onChange, onNext, onBack }) => {
  const [form] = Form.useForm();
  const [shapes, setShapes] = useState({});
  const [currentShape, setCurrentShape] = useState(null);
  const [editingShape, setEditingShape] = useState(null);
  const [previewShape, setPreviewShape] = useState(null);

  // Initialize shapes from either custom shapes or base pattern shapes
  React.useEffect(() => {
    let initialShapes = {};
    
    if (data.customShapes && Object.keys(data.customShapes).length > 0) {
      // Use existing custom shapes
      initialShapes = data.customShapes;
    } else if (data.basePattern && data.basePattern.shapes && data.basePattern.id !== 'custom') {
      // Load shapes from the selected base pattern as starting points
      initialShapes = { ...data.basePattern.shapes };
    }
    
    setShapes(initialShapes);
  }, [data.basePattern, data.customShapes]);

  // Initialize with a basic panel template
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
    const shapeName = `Panel ${Object.keys(shapes).length + 1}`;
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
    if (!data.name || data.name.trim() === '') {
      message.warning('Please enter a pattern name');
      return;
    }
    if (Object.keys(shapes).length === 0) {
      message.warning('Please create or modify at least one panel to continue');
      return;
    }
    onNext();
  };

  const isCustomPattern = data.basePattern?.id === 'custom';
  const patternTitle = isCustomPattern ? 'Custom Pattern Design' : 'Pattern Editor';
  const patternDescription = isCustomPattern 
    ? 'Give your pattern a name and description, then create custom panels for your pattern. Each panel represents a knitted piece like front, back, or sleeves.'
    : 'Modify the selected pattern or add new panels. You can edit existing shapes or create entirely new ones.';

  return (
    <div className="custom-shape-step">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={2}>{patternTitle}</Title>
            <Text type="secondary">
              {patternDescription}
            </Text>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Pattern Information" style={{ marginBottom: '16px' }}>
            <Row gutter={[24, 16]}>
              <Col lg={12} md={24}>
                <Form layout="vertical">
                  <Form.Item label="Pattern Name" required>
                    <Input 
                      value={data.name || data.basePattern?.name || ''} 
                      onChange={(e) => onChange({ ...data, name: e.target.value })}
                      placeholder={isCustomPattern ? "Enter your pattern name (e.g., My First Sweater)" : "Modify pattern name or keep original"}
                      size="large"
                    />
                  </Form.Item>
                </Form>
              </Col>
              <Col lg={12} md={24}>
                <Form layout="vertical">
                  <Form.Item label="Description">
                    <TextArea 
                      value={data.description || data.basePattern?.description || ''} 
                      onChange={(e) => onChange({ ...data, description: e.target.value })}
                      placeholder={isCustomPattern ? "Describe your custom pattern..." : "Modify pattern description or add your own notes..."}
                      rows={4}
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card 
            title={isCustomPattern ? "Pattern Panels" : "Edit Pattern Panels"} 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddShape}
              >
                {isCustomPattern ? "New Panel" : "Add Panel"}
              </Button>
            }
          >
            {Object.keys(shapes).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <Text>
                  {isCustomPattern 
                    ? 'No panels created yet. Click "Add Panel" to start designing your pattern.'
                    : 'No panels available from the selected pattern. Click "Add Panel" to create new panels.'}
                </Text>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {Object.entries(shapes).map(([shapeName, shape]) => (
                  <Col lg={6} md={8} sm={12} xs={24} key={shapeName}>
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
        existingShapes={shapes}
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
const ShapeEditorModal = ({ visible, shapeData, onSave, onCancel, existingShapes = {} }) => {
  const [form] = Form.useForm();
  const [shape, setShape] = useState(null);
  const [successors, setSuccessors] = useState([]);

  React.useEffect(() => {
    if (visible && shapeData) {
      setShape({ ...shapeData.shape });
      setSuccessors(shapeData.shape.successors || []);
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
        baseBHorizontalOffset: values.baseBHorizontalOffset,
        successors: successors,
        finishingSteps: shape.finishingSteps || []
      };
      onSave({ name: values.name, shape: updatedShape });
    });
  };

  const handleFieldChange = (field, value) => {
    const updatedShape = { ...shape, [field]: value };
    setShape(updatedShape);
  };

  const handleAddSuccessor = (parentPath = []) => {
    let newSuccessor;
    
    if (parentPath.length === 0) {
      // Adding to root level - use base shape dimensions as parent
      const parentHeight = shape.height || 10;
      const parentBaseA = shape.baseA || 10;
      const parentBaseB = shape.baseB || 10;
      
      newSuccessor = {
        height: Math.max(1, Math.round(parentHeight / 2)),
        baseA: Math.max(1, Math.round(parentBaseA / 2)),
        baseB: Math.max(1, Math.round(parentBaseB / 2)),
        baseBHorizontalOffset: 0,
        successors: [],
        finishingSteps: []
      };
      
      setSuccessors([...successors, newSuccessor]);
    } else {
      // Adding to nested successor - need to deep clone the structure
      const newSuccessors = JSON.parse(JSON.stringify(successors));
      let current = newSuccessors;
      
      // Navigate to the parent, ensuring arrays are properly cloned
      for (let i = 0; i < parentPath.length - 1; i++) {
        const index = parentPath[i];
        if (!current[index]) return; // Safety check
        current = current[index].successors;
      }
      
      // Get parent dimensions
      const parentIndex = parentPath[parentPath.length - 1];
      if (!current[parentIndex]) return; // Safety check
      const parent = current[parentIndex];
      
      newSuccessor = {
        height: Math.max(1, Math.round(parent.height / 2)),
        baseA: Math.max(1, Math.round(parent.baseA / 2)),
        baseB: Math.max(1, Math.round(parent.baseB / 2)),
        baseBHorizontalOffset: 0,
        successors: [],
        finishingSteps: []
      };
      
      // Add to the parent's successors
      if (!current[parentIndex].successors) {
        current[parentIndex].successors = [];
      }
      current[parentIndex].successors.push(newSuccessor);
      
      setSuccessors(newSuccessors);
    }
  };

  const handleRemoveSuccessor = (path) => {
    if (path.length === 1) {
      // Removing from root level
      const newSuccessors = successors.filter((_, i) => i !== path[0]);
      setSuccessors(newSuccessors);
    } else {
      // Removing from nested level - deep clone the structure
      const newSuccessors = JSON.parse(JSON.stringify(successors));
      let current = newSuccessors;
      
      // Navigate to the parent
      for (let i = 0; i < path.length - 1; i++) {
        const index = path[i];
        if (!current[index]) return; // Safety check
        current = current[index].successors;
      }
      
      // Remove from parent's successors
      const indexToRemove = path[path.length - 1];
      if (current && Array.isArray(current)) {
        current.splice(indexToRemove, 1);
        setSuccessors(newSuccessors);
      }
    }
  };

  const handleSuccessorChange = (path, field, value) => {
    // Deep clone the structure
    const newSuccessors = JSON.parse(JSON.stringify(successors));
    let current = newSuccessors;
    
    // Navigate to the target successor
    for (let i = 0; i < path.length - 1; i++) {
      const index = path[i];
      if (!current[index]) return; // Safety check
      current = current[index].successors;
    }
    
    // Update the field
    const targetIndex = path[path.length - 1];
    if (current && current[targetIndex]) {
      current[targetIndex] = { ...current[targetIndex], [field]: value };
      setSuccessors(newSuccessors);
    }
  };

  // Recursive component to render successor hierarchy
  const SuccessorItem = ({ successor, path, level = 0 }) => {
    const pathString = path.join('-');
    const indent = level * 20;
    
    return (
      <div style={{ marginLeft: `${indent}px` }}>
        <Card key={pathString} size="small" style={{ backgroundColor: level === 0 ? '#f9f9f9' : '#f0f0f0', marginBottom: '8px' }}>
          <Row gutter={[12, 12]} align="middle">
            <Col span={3}>
              <Text strong style={{ fontSize: '12px' }}>
                {level === 0 ? `Level ${path[0] + 1}` : `Child ${path[path.length - 1] + 1}`}
              </Text>
            </Col>
            <Col span={4}>
              <div>
                <Text style={{ fontSize: '11px' }}>Height</Text>
                <InputNumber
                  size="small"
                  min={1}
                  value={successor.height}
                  onChange={(value) => handleSuccessorChange(path, 'height', value)}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
            <Col span={4}>
              <div>
                <Text style={{ fontSize: '11px' }}>Bottom W</Text>
                <InputNumber
                  size="small"
                  min={0}
                  value={successor.baseA}
                  onChange={(value) => handleSuccessorChange(path, 'baseA', value)}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
            <Col span={4}>
              <div>
                <Text style={{ fontSize: '11px' }}>Top W</Text>
                <InputNumber
                  size="small"
                  min={0}
                  value={successor.baseB}
                  onChange={(value) => handleSuccessorChange(path, 'baseB', value)}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
            <Col span={4}>
              <div>
                <Text style={{ fontSize: '11px' }}>Offset</Text>
                <InputNumber
                  size="small"
                  value={successor.baseBHorizontalOffset || 0}
                  onChange={(value) => handleSuccessorChange(path, 'baseBHorizontalOffset', value)}
                  style={{ width: '100%' }}
                />
              </div>
            </Col>
            <Col span={5}>
              <Space size="small">
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddSuccessor(path)}
                  title="Add child successor"
                  style={{ fontSize: '10px' }}
                >
                  Child
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveSuccessor(path)}
                  title="Remove this successor"
                  style={{ fontSize: '10px' }}
                />
              </Space>
            </Col>
          </Row>
        </Card>
        
        {/* Render child successors recursively */}
        {successor.successors && successor.successors.length > 0 && (
          <div style={{ marginTop: '4px' }}>
            {successor.successors.map((childSuccessor, childIndex) => (
              <SuccessorItem
                key={`${pathString}-${childIndex}`}
                successor={childSuccessor}
                path={[...path, childIndex]}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!shape) return null;

  return (
    <Modal
      title="Edit Panel"
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      width={1000}
      style={{ top: 20 }}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Panel Name"
              rules={[{ required: true, message: 'Please enter a panel name' }]}
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
                shape={{ ...shape, successors }} 
                label=""
                size={180}
                padding={20}
              />
            </div>
          </div>
        </Col>

        <Col span={24}>
          <Divider />
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Text strong>Successor Shapes</Text>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={() => handleAddSuccessor()}
              >
                Add Successor
              </Button>
            </div>
            
            <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
              Successors are panels that continue from the top of this panel. Use "Child" buttons to create nested hierarchies.
            </Text>

            {successors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                <Text type="secondary">No successor panels. Click "Add Successor" to create connected panels.</Text>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {successors.map((successor, index) => (
                    <SuccessorItem
                      key={index}
                      successor={successor}
                      path={[index]}
                      level={0}
                    />
                  ))}
                </Space>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default CustomShapeStep;
