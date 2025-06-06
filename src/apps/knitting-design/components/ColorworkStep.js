import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Switch, Button, Space, Typography, Slider, Select, ColorPicker, List, Input, message, Popconfirm, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Predefined colorwork patterns
const COLORWORK_PATTERNS = {
  fairisle: {
    name: 'Fair Isle',
    description: 'Traditional Fair Isle patterns with 2-3 colors per row',
    maxColors: 3,
    complexity: 'Medium'
  },
  intarsia: {
    name: 'Intarsia',
    description: 'Block color patterns with separate yarn sources',
    maxColors: 8,
    complexity: 'Advanced'
  },
  stranded: {
    name: 'Stranded',
    description: 'Two-color stranded colorwork',
    maxColors: 2,
    complexity: 'Intermediate'
  },
  mosaic: {
    name: 'Mosaic',
    description: 'Slip-stitch colorwork with one color per row',
    maxColors: 2,
    complexity: 'Beginner'
  },
  custom: {
    name: 'Custom',
    description: 'Create your own colorwork pattern',
    maxColors: 10,
    complexity: 'Variable'
  }
};

const DEFAULT_COLORS = [
  '#ffffff', '#000000', '#ff4d4f', '#1890ff', '#52c41a', 
  '#faad14', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'
];

const ColorworkStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [colorworkData, setColorworkData] = useState(data.colorwork || {
    enabled: false,
    type: 'fairisle',
    layers: [],
    colors: ['#ffffff', '#000000'],
    globalOpacity: 100
  });

  const [selectedLayer, setSelectedLayer] = useState(null);
  const [newLayerName, setNewLayerName] = useState('');

  useEffect(() => {
    // Initialize with a default layer if colorwork is enabled but no layers exist
    if (colorworkData.enabled && colorworkData.layers.length === 0) {
      addLayer('Background');
    }
  }, [colorworkData.enabled]);

  const toggleColorwork = (enabled) => {
    setColorworkData(prev => ({
      ...prev,
      enabled,
      layers: enabled ? prev.layers : []
    }));
  };

  const addLayer = (name = newLayerName || `Layer ${colorworkData.layers.length + 1}`) => {
    const newLayer = {
      id: Date.now(),
      name,
      visible: true,
      opacity: 100,
      colors: [colorworkData.colors[0], colorworkData.colors[1]],
      pattern: 'solid',
      blendMode: 'normal',
      repeatX: 1,
      repeatY: 1,
      offsetX: 0,
      offsetY: 0
    };

    setColorworkData(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer]
    }));

    setNewLayerName('');
    setSelectedLayer(newLayer.id);
    message.success(`Layer "${name}" added`);
  };

  const deleteLayer = (layerId) => {
    setColorworkData(prev => ({
      ...prev,
      layers: prev.layers.filter(layer => layer.id !== layerId)
    }));
    
    if (selectedLayer === layerId) {
      setSelectedLayer(null);
    }
    message.success('Layer deleted');
  };

  const updateLayer = (layerId, updates) => {
    setColorworkData(prev => ({
      ...prev,
      layers: prev.layers.map(layer => 
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    }));
  };

  const toggleLayerVisibility = (layerId) => {
    const layer = colorworkData.layers.find(l => l.id === layerId);
    updateLayer(layerId, { visible: !layer.visible });
  };

  const addColor = (color) => {
    if (colorworkData.colors.length >= COLORWORK_PATTERNS[colorworkData.type].maxColors) {
      message.warning(`Maximum ${COLORWORK_PATTERNS[colorworkData.type].maxColors} colors allowed for ${COLORWORK_PATTERNS[colorworkData.type].name}`);
      return;
    }

    setColorworkData(prev => ({
      ...prev,
      colors: [...prev.colors, color]
    }));
  };

  const removeColor = (index) => {
    if (colorworkData.colors.length <= 2) {
      message.warning('At least 2 colors required');
      return;
    }

    setColorworkData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const updateColor = (index, color) => {
    setColorworkData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === index ? color : c)
    }));
  };

  const handleSave = () => {
    onUpdate({ colorwork: colorworkData });
    message.success('Colorwork settings saved');
  };

  const handleNext = () => {
    handleSave();
    onNext();
  };

  const currentLayer = colorworkData.layers.find(l => l.id === selectedLayer);

  return (
    <div className="colorwork-step">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Colorwork Settings" className="settings-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Enable Colorwork */}
              <div>
                <Space>
                  <Title level={5} style={{ margin: 0 }}>Enable Colorwork</Title>
                  <Switch 
                    checked={colorworkData.enabled}
                    onChange={toggleColorwork}
                  />
                </Space>
                <Text type="secondary">
                  Add multiple colors and patterns to your knitting project
                </Text>
              </div>

              {colorworkData.enabled && (
                <>
                  <Divider />
                  
                  {/* Colorwork Type */}
                  <div>
                    <Title level={5}>Colorwork Type</Title>
                    <Select
                      value={colorworkData.type}
                      onChange={(type) => setColorworkData(prev => ({ ...prev, type }))}
                      style={{ width: '100%' }}
                    >
                      {Object.entries(COLORWORK_PATTERNS).map(([key, pattern]) => (
                        <Option key={key} value={key}>
                          <Space direction="vertical" size={0}>
                            <Text strong>{pattern.name}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {pattern.description} • {pattern.complexity}
                            </Text>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <Divider />

                  {/* Color Palette */}
                  <div>
                    <Title level={5}>Color Palette</Title>
                    <Row gutter={[8, 8]}>
                      {colorworkData.colors.map((color, index) => (
                        <Col key={index}>
                          <Space direction="vertical" align="center" size={4}>
                            <ColorPicker
                              value={color}
                              onChange={(color) => updateColor(index, color.toHexString())}
                              showText={(color) => <span style={{ color: color.toHexString() }}>●</span>}
                            />
                            {colorworkData.colors.length > 2 && (
                              <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => removeColor(index)}
                                style={{ color: '#ff4d4f' }}
                              />
                            )}
                          </Space>
                        </Col>
                      ))}
                      {colorworkData.colors.length < COLORWORK_PATTERNS[colorworkData.type].maxColors && (
                        <Col>
                          <ColorPicker
                            onChange={(color) => addColor(color.toHexString())}
                            trigger="click"
                          >
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              style={{ height: 32, width: 32 }}
                            />
                          </ColorPicker>
                        </Col>
                      )}
                    </Row>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {colorworkData.colors.length}/{COLORWORK_PATTERNS[colorworkData.type].maxColors} colors
                    </Text>
                  </div>

                  <Divider />

                  {/* Layer Management */}
                  <div>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Title level={5}>
                        <AppstoreOutlined /> Layers
                      </Title>
                      <Space>
                        <Input
                          placeholder="Layer name"
                          value={newLayerName}
                          onChange={(e) => setNewLayerName(e.target.value)}
                          style={{ width: 120 }}
                          onPressEnter={() => addLayer()}
                        />
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => addLayer()}
                        >
                          Add Layer
                        </Button>
                      </Space>
                    </Space>

                    <List
                      dataSource={colorworkData.layers}
                      renderItem={(layer) => (
                        <List.Item
                          className={`layer-item ${selectedLayer === layer.id ? 'selected' : ''}`}
                          onClick={() => setSelectedLayer(layer.id)}
                          actions={[
                            <Button
                              type="text"
                              icon={layer.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLayerVisibility(layer.id);
                              }}
                            />,
                            <Popconfirm
                              title="Delete this layer?"
                              onConfirm={(e) => {
                                e.stopPropagation();
                                deleteLayer(layer.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                              />
                            </Popconfirm>
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text strong>{layer.name}</Text>
                                {!layer.visible && <Text type="secondary">(Hidden)</Text>}
                              </Space>
                            }
                            description={`Opacity: ${layer.opacity}% • ${layer.pattern}`}
                          />
                        </List.Item>
                      )}
                      style={{ maxHeight: 200, overflowY: 'auto' }}
                    />
                  </div>

                  {/* Layer Properties */}
                  {currentLayer && (
                    <>
                      <Divider />
                      <div>
                        <Title level={5}>Layer Properties: {currentLayer.name}</Title>
                        
                        <Space direction="vertical" size="medium" style={{ width: '100%' }}>
                          <div>
                            <Text>Opacity</Text>
                            <Slider
                              value={currentLayer.opacity}
                              onChange={(opacity) => updateLayer(currentLayer.id, { opacity })}
                              min={0}
                              max={100}
                              marks={{ 0: '0%', 50: '50%', 100: '100%' }}
                            />
                          </div>

                          <Row gutter={16}>
                            <Col span={12}>
                              <Text>Blend Mode</Text>
                              <Select
                                value={currentLayer.blendMode}
                                onChange={(blendMode) => updateLayer(currentLayer.id, { blendMode })}
                                style={{ width: '100%' }}
                              >
                                <Option value="normal">Normal</Option>
                                <Option value="multiply">Multiply</Option>
                                <Option value="overlay">Overlay</Option>
                                <Option value="screen">Screen</Option>
                              </Select>
                            </Col>
                            <Col span={12}>
                              <Text>Pattern</Text>
                              <Select
                                value={currentLayer.pattern}
                                onChange={(pattern) => updateLayer(currentLayer.id, { pattern })}
                                style={{ width: '100%' }}
                              >
                                <Option value="solid">Solid</Option>
                                <Option value="stripes">Stripes</Option>
                                <Option value="dots">Dots</Option>
                                <Option value="checkers">Checkers</Option>
                              </Select>
                            </Col>
                          </Row>
                        </Space>
                      </div>
                    </>
                  )}
                </>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Colorwork Preview" className="preview-card">
            <div className="colorwork-preview">
              {!colorworkData.enabled ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  <AppstoreOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <br />
                  <Text type="secondary">Enable colorwork to see preview</Text>
                </div>
              ) : (
                <div className="pattern-preview" style={{ minHeight: '300px', background: '#f5f5f5', borderRadius: '8px', padding: '16px' }}>
                  {/* Mock pattern preview */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(20, 1fr)', 
                    gap: '1px',
                    background: 'white',
                    padding: '8px',
                    borderRadius: '4px'
                  }}>
                    {Array.from({ length: 200 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: colorworkData.colors[Math.floor(Math.random() * colorworkData.colors.length)],
                          borderRadius: '1px'
                        }}
                      />
                    ))}
                  </div>
                  
                  <Divider />
                  
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>Pattern Information</Text>
                    <Text type="secondary">
                      Type: {COLORWORK_PATTERNS[colorworkData.type].name}
                    </Text>
                    <Text type="secondary">
                      Colors: {colorworkData.colors.length}
                    </Text>
                    <Text type="secondary">
                      Layers: {colorworkData.layers.length}
                    </Text>
                    <Text type="secondary">
                      Complexity: {COLORWORK_PATTERNS[colorworkData.type].complexity}
                    </Text>
                  </Space>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <div className="step-actions">
        <Space>
          <Button onClick={onPrev}>Previous</Button>
          <Button type="primary" onClick={handleSave}>
            Save Colorwork
          </Button>
          <Button type="primary" onClick={handleNext}>
            Next: Preview
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ColorworkStep;
