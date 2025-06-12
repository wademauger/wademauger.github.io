import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Select, Button, Space, Typography, Slider, InputNumber, Divider } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import PatternDimensionVisualization from '../../../components/PatternDimensionVisualization';
import { updatePatternData, selectPatternData } from '../../../store/knittingDesignSlice';


const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Pattern Scaling Interface using Redux state
const SizingStep = ({ onNext, onPrevious }) => {
  const dispatch = useDispatch();
  const patternData = useSelector(state => state.knittingDesign.patternData);
  const data = patternData?.sizing || {};
  const [calculatedDimensions, setCalculatedDimensions] = useState({});

  const sizingMethods = [
    { value: 'standard', label: 'Standard Sizes', description: 'Choose from predefined men\'s or women\'s sizing' },
    { value: 'percentage', label: 'Scale by Percentage', description: 'Scale a standard size by percentage' },
    { value: 'custom', label: 'Custom Dimensions', description: 'Adjust individual panel dimensions independently' }
  ];

  // Base sizing where Men's Medium = Women's Large
  // Each size scales by 10% per size away from the base
  const baseDimensions = { chest: 40, length: 27, armLength: 25 }; // Men's Medium / Women's Large
  
  const calculateSizeMultiplier = (sizeIndex) => {
    // Size index: XXS=-3, XS=-2, S=-1, M=0, L=1, XL=2, XXL=3
    return Math.pow(1.1, sizeIndex); // 10% per size away from medium
  };
  
  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const getSizeIndex = (size) => sizeOrder.indexOf(size) - 3; // M = index 0
  
  // Function to generate standard sizes dynamically
  const generateStandardSizes = (gender) => {
    const sizes = {};
    sizeOrder.forEach(size => {
      const sizeIndex = getSizeIndex(size);
      let multiplier;
      
      if (gender === 'mens') {
        // Men's sizes with M as base (index 0)
        multiplier = calculateSizeMultiplier(sizeIndex);
      } else {
        // Women's sizes with L as base (Men's M = Women's L equivalency)
        const womensSizeIndex = sizeIndex - 1; // Shift by one size (M->L equivalency)
        multiplier = calculateSizeMultiplier(womensSizeIndex);
      }
      
      sizes[size] = {
        chest: Math.round(baseDimensions.chest * multiplier),
        length: Math.round(baseDimensions.length * multiplier),
        armLength: Math.round(baseDimensions.armLength * multiplier)
      };
    });
    return sizes;
  };

  useEffect(() => {
    // Calculate dimensions based on current settings
    if (data?.method === 'standard') {
      const selectedGender = data.gender || 'womens';
      const selectedSize = data.standardSize || 'M';
      const standardSizes = generateStandardSizes(selectedGender);
      const baseDimensions = standardSizes[selectedSize];
      setCalculatedDimensions(baseDimensions);
    } else if (data?.method === 'percentage') {
      const selectedGender = data.gender || 'womens';
      const selectedSize = data.standardSize || 'M';
      const standardSizes = generateStandardSizes(selectedGender);
      const baseDimensions = standardSizes[selectedSize];
      const scaled = {};
      Object.keys(baseDimensions).forEach(key => {
        scaled[key] = Math.round(baseDimensions[key] * ((data.scale || 100) / 100) * 10) / 10;
      });
      setCalculatedDimensions(scaled);
    } else if (data?.method === 'custom') {
      setCalculatedDimensions(data.customDimensions || {});
    }
  }, [data]);

  // Helper function to update sizing data in Redux
  const updateSizingData = (newData) => {
    dispatch(updatePatternData({ 
      section: 'sizing', 
      data: { ...data, ...newData } 
    }));
  };

  const handleMethodChange = (method) => {
    // Create a single atomic update with all required data
    const baseUpdate = { method };
    
    if (method === 'standard') {
      baseUpdate.gender = data?.gender || 'womens';
      baseUpdate.standardSize = data?.standardSize || 'M';
    } else if (method === 'percentage') {
      baseUpdate.gender = data?.gender || 'womens';
      baseUpdate.standardSize = data?.standardSize || 'M';
      baseUpdate.scale = data?.scale || 100;
    } else if (method === 'custom') {
      baseUpdate.customDimensions = data?.customDimensions || {
        front: { width: 38, height: 23 },
        back: { width: 38, height: 23 },
        leftSleeve: { width: 15, height: 24 },
        rightSleeve: { width: 15, height: 24 }
      };
    }
    
    // Single atomic update to prevent race conditions
    updateSizingData(baseUpdate);
  };

  const handleGenderChange = (gender) => {
    updateSizingData({ gender });
  };

  const handleStandardSizeChange = (size) => {
    updateSizingData({ standardSize: size });
  };

  const handleScaleChange = (scale) => {
    updateSizingData({ scale });
  };

  const handleDimensionChange = (dimension, value) => {
    if (!data?.customDimensions) return;
    
    const newDimensions = { ...data.customDimensions, [dimension]: value };
    updateSizingData({ customDimensions: newDimensions });
  };

  const handleCustomPanelChange = (panel, dimension, value) => {
    if (!data?.customDimensions) return;
    
    const newDimensions = { 
      ...data.customDimensions, 
      [panel]: {
        ...(data.customDimensions[panel] || {}),
        [dimension]: value
      }
    };
    updateSizingData({ customDimensions: newDimensions });
  };

  const handleNext = () => {
    onNext();
  };

  // Get all shapes from basePattern.shapes for visualization
  const getAllPatternShapes = () => {
    if (!patternData?.basePattern?.shapes) {
      return [];
    }
    
    const shapes = patternData.basePattern.shapes;
    return Object.entries(shapes).map(([name, shape]) => ({ name, shape }));
  };

  const allPatternShapes = getAllPatternShapes();
  
  // Calculate scaling factor based on sizing method and base size selection
  let scaleFactor = 1;
  if (data && Object.keys(data).length > 0) {
    if (data.method === 'standard' || data.method === 'percentage') {
      // For both standard and percentage methods, calculate based on selected base size
      const selectedGender = data.gender || 'womens';
      const selectedSize = data.standardSize || 'M';
      const standardSizes = generateStandardSizes(selectedGender);
      const selectedBaseDimensions = standardSizes[selectedSize];
      
      if (selectedBaseDimensions && allPatternShapes.length > 0) {
        const firstShape = allPatternShapes[0]?.shape;
        if (firstShape?.baseA) {
          // Base scale factor from size selection
          const baseSizeFactor = selectedBaseDimensions.chest / baseDimensions.chest;
          
          if (data.method === 'percentage') {
            // Apply percentage scaling on top of base size
            scaleFactor = baseSizeFactor * ((data.scale || 100) / 100);
          } else {
            // Standard method uses just the base size factor
            scaleFactor = baseSizeFactor;
          }
        }
      }
    } else if (data.method === 'custom' && data.customDimensions?.chest && allPatternShapes.length > 0) {
      // Use the first shape's baseA for scaling calculation
      const firstShape = allPatternShapes[0]?.shape;
      if (firstShape?.baseA) {
        scaleFactor = data.customDimensions.chest / firstShape.baseA;
      }
    }
  }

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allPatternShapes.length > 0 ? (
              allPatternShapes.map(({ name, shape }, index) => (
                <PatternDimensionVisualization 
                  key={`${name}-${index}`}
                  panel={shape}
                  title={name}
                  subtitle={`${patternData?.basePattern?.name || 'Pattern'} - ${name} panel`}
                  scaleFactor={scaleFactor}
                  diagramSizeMin={200}
                  diagramSizeMax={333}
                  scalingMultiplier={4}
                  containerPadding={12}
                  showInfoText={false}
                />
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                background: '#fafafa', 
                borderRadius: '8px',
                border: '1px dashed #d9d9d9'
              }}>
                <Text type="secondary">
                  No pattern shapes available. Please select a pattern in the previous step.
                </Text>
              </div>
            )}
          </div>
        </Col>

        <Col lg={12} md={24}>
          <Card title="Sizing Method">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Select
                value={data?.method || 'percentage'}
                onChange={handleMethodChange}
                style={{ width: '100%' }}
                size="large"
                placeholder="Select sizing method"
              >
                {sizingMethods.map(method => (
                  <Option key={method.value} value={method.value}>
                    <div style={{ padding: '4px 0' }}>
                      <div style={{ fontWeight: 'bold', lineHeight: '1.2' }}>{method.label}</div>
                      <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.2', marginTop: '2px' }}>{method.description}</div>
                    </div>
                  </Option>
                ))}
              </Select>

              <Divider />

              {data?.method === 'standard' ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Text strong>Gender</Text>
                  <Select
                    value={data.gender || 'womens'}
                    onChange={handleGenderChange}
                    style={{ width: '100%' }}
                  >
                    <Option value="womens">Women's</Option>
                    <Option value="mens">Men's</Option>
                  </Select>
                  
                  <Text strong>Size</Text>
                  <Row gutter={8}>
                    {Object.keys(generateStandardSizes(data.gender || 'womens')).map(size => (
                      <Col key={size}>
                        <Button 
                          size="small"
                          onClick={() => handleStandardSizeChange(size)}
                          type={(data.standardSize || 'M') === size ? 'primary' : 'default'}
                        >
                          {size}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </Space>
              ) : data?.method === 'percentage' ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Text strong>Base Size</Text>
                  <Row gutter={16} align="middle">
                    <Col span={12}>
                      <Select
                        value={data.gender || 'womens'}
                        onChange={handleGenderChange}
                        style={{ width: '100%' }}
                      >
                        <Option value="womens">Women's</Option>
                        <Option value="mens">Men's</Option>
                      </Select>
                    </Col>
                    <Col span={12}>
                      <Select
                        value={data.standardSize || 'M'}
                        onChange={handleStandardSizeChange}
                        style={{ width: '100%' }}
                      >
                        {Object.keys(generateStandardSizes(data.gender || 'womens')).map(size => (
                          <Option key={size} value={size}>{size}</Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                  
                  <Text strong>Scale Percentage</Text>
                  <Row gutter={16} align="middle">
                    <Col flex={1}>
                      <Slider
                        min={50}
                        max={200}
                        step={5}
                        value={data?.scale || 100}
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
                        value={data?.scale || 100}
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
                        Scaling at {data?.scale || 100}% of {data?.gender === 'mens' ? "Men's" : "Women's"} {data?.standardSize || 'M'} size
                      </Text>
                    </Space>
                  </Card>
                </Space>
              ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Text strong>Individual Panel Dimensions</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Adjust width and height for each panel independently
                  </Text>
                  
                  {data?.customDimensions && Object.entries(data.customDimensions).map(([panelName, dimensions]) => (
                    <Card key={panelName} size="small" title={panelName.charAt(0).toUpperCase() + panelName.slice(1)}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Text>Width (inches):</Text>
                          <InputNumber
                            min={10}
                            max={60}
                            step={0.5}
                            value={dimensions.width}
                            onChange={(value) => handleCustomPanelChange(panelName, 'width', value)}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </Col>
                        <Col span={12}>
                          <Text>Height (inches):</Text>
                          <InputNumber
                            min={10}
                            max={40}
                            step={0.5}
                            value={dimensions.height}
                            onChange={(value) => handleCustomPanelChange(panelName, 'height', value)}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Preview Dimensions">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Text strong>Calculated Garment Dimensions:</Text>
              
              <div className="dimension-preview">
                {data?.method === 'custom' && data?.customDimensions ? (
                  // Show individual panel dimensions for custom method
                  <Row gutter={[16, 16]}>
                    {Object.entries(data?.customDimensions || {}).map(([panelName, dimensions]) => (
                      <Col span={12} key={panelName}>
                        <Card size="small" className="dimension-card">
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                              {dimensions?.width || '--'}" × {dimensions?.height || '--'}"
                            </div>
                            <div style={{ color: '#666' }}>{panelName.charAt(0).toUpperCase() + panelName.slice(1)}</div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  // Show standard dimensions for standard and percentage methods
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
                )}
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
              <Button 
                size="large" 
                onClick={onPrevious}
              >
                Previous
              </Button>
              <Button 
                size="large" 
                type="primary"
                onClick={handleNext}
              >
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
