import React, { useState } from 'react';
import { Card, Form, Input, Select, Radio, Button, Row, Col, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { garments } from '../../../data/garments';
import { PanelDiagram } from '../../../components/PanelDiagram';

const { Title, Text } = Typography;
const { Option } = Select;

const PatternSetup = ({ data, onChange, onNext }) => {
  const [form] = Form.useForm();
  const [customPattern, setCustomPattern] = useState(null);

  // Get garments from data and add custom option
  const availableGarments = garments.map(garment => ({
    id: garment.permalink,
    name: garment.title,
    description: garment.description,
    shapes: garment.shapes,
    sizes: garment.sizes,
    finishingSteps: garment.finishingSteps
  }));

  // Add custom option
  const basePatterns = [
    ...availableGarments,
    { 
      id: 'custom', 
      name: 'Create Custom Pattern', 
      description: 'Design your own pattern from scratch',
      shapes: null
    }
  ];

  const handleFormChange = (changedFields, allFields) => {
    const formData = {};
    allFields.forEach(field => {
      formData[field.name[0]] = field.value;
    });
    onChange(formData);
  };

  const handlePatternSelect = (patternId) => {
    const pattern = basePatterns.find(p => p.id === patternId);
    onChange({ basePattern: pattern });
    form.setFieldsValue({ basePattern: patternId });
  };

  const handleNext = () => {
    form.validateFields().then(() => {
      onNext();
    });
  };

  return (
    <div className="pattern-setup">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Pattern Setup</Title>
            <Text type="secondary">
              Start by giving your pattern a name and selecting a base pattern to modify, 
              or create a custom pattern from scratch.
            </Text>
          </Card>
        </Col>

        <Col lg={12} md={24}>
          <Card title="Pattern Information">
            <Form
              form={form}
              layout="vertical"
              onFieldsChange={handleFormChange}
              initialValues={{
                name: data.name || '',
                description: data.description || '',
                type: data.type || 'sweater'
              }}
            >
              <Form.Item
                name="name"
                label="Pattern Name (Optional)"
                extra="Leave blank to auto-generate from garment name and gauge"
              >
                <Input placeholder="Auto-generated based on selection" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea 
                  placeholder="Describe your pattern design..."
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                name="type"
                label="Pattern Type"
              >
                <Select>
                  <Option value="sweater">Sweater/Pullover</Option>
                  <Option value="cardigan">Cardigan</Option>
                  <Option value="vest">Vest</Option>
                  <Option value="hat">Hat</Option>
                  <Option value="scarf">Scarf</Option>
                  <Option value="accessory">Accessory</Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col lg={12} md={24}>
          <Card title="Base Pattern Selection">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Text>Choose a starting point for your pattern:</Text>
              
              <Radio.Group 
                value={data.basePattern?.id} 
                onChange={(e) => handlePatternSelect(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {basePatterns.map(pattern => (
                    <Radio 
                      key={pattern.id} 
                      value={pattern.id}
                      style={{ 
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '12px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        width: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                        {/* Pattern diagram on the left */}
                        {pattern.shapes && (
                          <div style={{ marginRight: '16px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {Object.entries(pattern.shapes).slice(0, 3).map(([shapeName, shape]) => (
                                <div key={shapeName} style={{ textAlign: 'center' }}>
                                  <PanelDiagram 
                                    shape={shape} 
                                    label=""
                                    size={60}
                                    padding={5}
                                  />
                                  <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                                    {shapeName}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Pattern info on the right */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {pattern.name}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                            {pattern.description}
                          </div>
                          {pattern.sizes && (
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              Available sizes: {Object.keys(pattern.sizes).join(', ')}
                            </div>
                          )}
                          {pattern.id === 'custom' && (
                            <div style={{ color: '#1890ff', fontSize: '12px', fontStyle: 'italic' }}>
                              Design your own shapes and construction
                            </div>
                          )}
                        </div>
                      </div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>

              {data.basePattern?.id === 'custom' && (
                <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                  <Space direction="vertical">
                    <Text strong>Custom Pattern Options:</Text>
                    <Button icon={<PlusOutlined />} type="dashed" block>
                      Create New Shape
                    </Button>
                    <Button icon={<EditOutlined />} type="dashed" block>
                      Import Existing Pattern
                    </Button>
                  </Space>
                </Card>
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Button 
              type="primary" 
              size="large"
              onClick={handleNext}
              disabled={!data.basePattern}
            >
              Next: Sizing
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PatternSetup;
