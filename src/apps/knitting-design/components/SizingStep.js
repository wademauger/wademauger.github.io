import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Typography, Space, Slider, InputNumber, Select, Divider } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Pattern Scaling Interface - Hybrid Approach (Option C)
const SizingStep = ({ data, onChange, onNext, onPrevious }) => {
  const [form] = Form.useForm();
  const [calculatedDimensions, setCalculatedDimensions] = useState({});

  const sizingMethods = [
    { value: 'percentage', label: 'Scale by Percentage', description: 'Proportionally scale the entire pattern' },
    { value: 'custom', label: 'Custom Dimensions', description: 'Input specific measurements' }
  ];

  const standardSizes = {
    'XS': { chest: 32, length: 22, armLength: 23 },
    'S': { chest: 36, length: 24, armLength: 24 },
    'M': { chest: 40, length: 26, armLength: 25 },
    'L': { chest: 44, length: 28, armLength: 26 },
    'XL': { chest: 48, length: 30, armLength: 27 },
    'XXL': { chest: 52, length: 32, armLength: 28 }
  };

  useEffect(() => {
    // Calculate dimensions based on current settings
    if (data.method === 'percentage') {
      const baseDimensions = standardSizes['M'];
      const scaled = {};
      Object.keys(baseDimensions).forEach(key => {
        scaled[key] = Math.round(baseDimensions[key] * (data.scale / 100) * 10) / 10;
      });
      setCalculatedDimensions(scaled);
    } else {
      setCalculatedDimensions(data.customDimensions);
    }
  }, [data]);

  const handleMethodChange = (method) => {
    onChange({ method });
    
    // Set defaults based on method
    if (method === 'percentage') {
      onChange({ scale: 100 });
    } else {
      onChange({ customDimensions: standardSizes['M'] });
    }
  };

  const handleScaleChange = (scale) => {
    onChange({ scale });
  };

  const handleDimensionChange = (dimension, value) => {
    const newDimensions = { ...data.customDimensions, [dimension]: value };
    onChange({ customDimensions: newDimensions });
  };

  const handleStandardSizeSelect = (size) => {
    onChange({ customDimensions: standardSizes[size] });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="sizing-step">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Pattern Sizing</Title>
            <Paragraph type="secondary">
              Choose how you want to size your pattern. You can scale proportionally or input custom measurements.
            </Paragraph>
          </Card>
        </Col>

        <Col lg={12} md={24}>
          <Card title="Sizing Method">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Select
                value={data.method}
                onChange={handleMethodChange}
                style={{ width: '100%' }}
                size="large"
              >
                {sizingMethods.map(method => (
                  <Option key={method.value} value={method.value}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{method.label}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{method.description}</div>
                    </div>
                  </Option>
                ))}
              </Select>

              <Divider />

              {data.method === 'percentage' ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Text strong>Overall Scale</Text>
                  <Row gutter={16} align="middle">
                    <Col flex={1}>
                      <Slider
                        min={50}
                        max={200}
                        step={5}
                        value={data.scale}
                        onChange={handleScaleChange}
                        marks={{
                          50: '50%',
                          100: '100%',
                          150: '150%',
                          200: '200%'
                        }}
                      />
                    </Col>
                    <Col>
                      <InputNumber
                        min={50}
                        max={200}
                        value={data.scale}
                        onChange={handleScaleChange}
                        formatter={value => `${value}%`}
                        parser={value => value.replace('%', '')}
                        style={{ width: '80px' }}
                      />
                    </Col>
                  </Row>
                  
                  <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                    <Space align="center">
                      <InfoCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>
                        Scaling at {data.scale}% of standard Medium size
                      </Text>
                    </Space>
                  </Card>
                </Space>
              ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Text strong>Quick Size Selection</Text>
                  <Row gutter={8}>
                    {Object.keys(standardSizes).map(size => (
                      <Col key={size}>
                        <Button 
                          size="small"
                          onClick={() => handleStandardSizeSelect(size)}
                          type={JSON.stringify(data.customDimensions) === JSON.stringify(standardSizes[size]) ? 'primary' : 'default'}
                        >
                          {size}
                        </Button>
                      </Col>
                    ))}
                  </Row>

                  <Divider>Or Enter Custom Measurements</Divider>

                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Row gutter={16} align="middle">
                      <Col span={8}>
                        <Text>Chest (inches):</Text>
                      </Col>
                      <Col span={16}>
                        <InputNumber
                          min={20}
                          max={80}
                          step={0.5}
                          value={data.customDimensions?.chest}
                          onChange={(value) => handleDimensionChange('chest', value)}
                          style={{ width: '100%' }}
                        />
                      </Col>
                    </Row>

                    <Row gutter={16} align="middle">
                      <Col span={8}>
                        <Text>Length (inches):</Text>
                      </Col>
                      <Col span={16}>
                        <InputNumber
                          min={15}
                          max={40}
                          step={0.5}
                          value={data.customDimensions?.length}
                          onChange={(value) => handleDimensionChange('length', value)}
                          style={{ width: '100%' }}
                        />
                      </Col>
                    </Row>

                    <Row gutter={16} align="middle">
                      <Col span={8}>
                        <Text>Arm Length (inches):</Text>
                      </Col>
                      <Col span={16}>
                        <InputNumber
                          min={15}
                          max={35}
                          step={0.5}
                          value={data.customDimensions?.armLength}
                          onChange={(value) => handleDimensionChange('armLength', value)}
                          style={{ width: '100%' }}
                        />
                      </Col>
                    </Row>
                  </Space>
                </Space>
              )}
            </Space>
          </Card>
        </Col>

        <Col lg={12} md={24}>
          <Card title="Preview Dimensions">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Text strong>Calculated Garment Dimensions:</Text>
              
              <div className="dimension-preview">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card size="small" className="dimension-card">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                          {calculatedDimensions.chest || '--'}"
                        </div>
                        <div style={{ color: '#666' }}>Chest</div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" className="dimension-card">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                          {calculatedDimensions.length || '--'}"
                        </div>
                        <div style={{ color: '#666' }}>Length</div>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" className="dimension-card">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                          {calculatedDimensions.armLength || '--'}"
                        </div>
                        <div style={{ color: '#666' }}>Arm Length</div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>

              <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <InfoCircleOutlined style={{ marginRight: '4px' }} />
                  These dimensions will be used to calculate stitch counts in the next step.
                  Final measurements may vary slightly based on gauge and yarn choice.
                </Text>
              </Card>
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button size="large" onClick={onPrevious}>
                Previous
              </Button>
              <Button type="primary" size="large" onClick={handleNext}>
                Next: Gauge
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SizingStep;
