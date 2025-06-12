import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card, Row, Col, Button, Space, Typography, Tabs,
  Select, Input, message, Popconfirm, Divider, Tooltip, Badge,
  InputNumber, List, Avatar, Tag, Alert
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined,
  CopyOutlined, AppstoreAddOutlined
} from '@ant-design/icons';
import {
  updateColorwork, savePattern, deletePattern, setActiveWorkingPattern,
  createComplexPattern, updateComplexPattern, deleteComplexPattern,
  addToGarmentSequence, updateGarmentSequence, removeFromGarmentSequence
} from '../../../store/knittingDesignSlice';
import PatternEditor from '../../../components/PatternEditor';
import SwatchViewer from '../../../components/SwatchViewer';
import KnitSwatch from '../../../components/KnitSwatch';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const COLORWORK_TYPES = {
  solid: {
    name: 'Solid Color',
    description: 'Single color throughout the panel',
    icon: '■',
    complexity: 'Beginner',
    default: true
  },
  stripes: {
    name: 'Stripes',
    description: 'Horizontal stripes with customizable row heights',
    icon: '━━━',
    complexity: 'Beginner'
  },
  stranded: {
    name: 'Stranded Colorwork',
    description: 'Two-color patterns carried across each row',
    icon: '▓▓▓',
    complexity: 'Intermediate'
  },
  intarsia: {
    name: 'Intarsia',
    description: 'Block color patterns with separate yarn sources',
    icon: '■■■',
    complexity: 'Advanced'
  }
};

const POSITIONING_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'custom', label: 'Custom Offset' }
];

const ColorworkStep = ({ data, onUpdate, onNext, onPrev }) => {
  const dispatch = useDispatch();
  const colorworkState = useSelector(state => state.knittingDesign?.patternData?.colorwork) || {};
  const gauge = useSelector(state => state.knittingDesign?.patternData?.gauge) || {};
  const hasInitialized = useRef(false);
  
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedComplexPattern, setSelectedComplexPattern] = useState(null);
  const [newComplexPatternName, setNewComplexPatternName] = useState('');
  const [garmentPreviewMode, setGarmentPreviewMode] = useState('front');
  const [swatchSettings, setSwatchSettings] = useState({
    size: { width: 4, height: 4 },
    stitchSize: 8,
    testPattern: null
  });

  // Local state for test colors since they should be independent of Redux state
  const [testColors, setTestColors] = useState(['#ffffff']);

  // Update test colors when colorwork type changes
  useEffect(() => {
    if (colorworkState.type === 'solid') {
      setTestColors([colorworkState.color || '#ffffff']);
    } else if (colorworkState.type && testColors.length === 1 && testColors[0] === '#ffffff') {
      // Set default colors for multi-color patterns
      setTestColors(['#ffffff', '#000000']);
    }
  }, [colorworkState.type, colorworkState.color]);

  // Initialize colorwork state only once when component mounts
  useEffect(() => {
    if (!hasInitialized.current && (!colorworkState.initialized || Object.keys(colorworkState).length === 0)) {
      console.log('Initializing colorwork state...');
      hasInitialized.current = true;
      
      const initialState = {
        type: data?.colorwork?.type || 'solid', // Default to solid color
        color: data?.colorwork?.color || '#ffffff', // Default color for solid
        initialized: true,
        savedPatterns: {},
        workingPatterns: {
          stripes: { pattern: [], colors: ['#ffffff'], size: { height: 4 } },
          stranded: { pattern: [], colors: ['#ffffff', '#000000'], size: { width: 8, height: 8 } },
          intarsia: { pattern: [], colors: ['#ffffff', '#ff0000'], size: { width: 16, height: 16 } }
        },
        complexPatterns: {},
        garmentSequence: [],
        activeWorkingPattern: null
      };
      
      console.log('Dispatching initial colorwork state:', initialState);
      dispatch(updateColorwork(initialState));
    }
  }, []); // Empty dependency array to run only once

  const handleColorworkTypeChange = (type) => {
    console.log('handleColorworkTypeChange called with type:', type);
    console.log('Current colorworkState:', colorworkState);
    
    const newState = {
      ...colorworkState,
      type,
      initialized: true,
      // Set default color for solid type
      color: type === 'solid' ? (colorworkState.color || '#ffffff') : colorworkState.color,
      // Ensure base structure exists
      savedPatterns: colorworkState?.savedPatterns || {},
      workingPatterns: colorworkState?.workingPatterns || {
        stripes: { pattern: [], colors: ['#ffffff'], size: { height: 4 } },
        stranded: { pattern: [], colors: ['#ffffff', '#000000'], size: { width: 8, height: 8 } },
        intarsia: { pattern: [], colors: ['#ffffff', '#ff0000'], size: { width: 16, height: 16 } }
      },
      complexPatterns: colorworkState?.complexPatterns || {},
      garmentSequence: colorworkState?.garmentSequence || [],
      activeWorkingPattern: colorworkState?.activeWorkingPattern || null
    };
    
    console.log('Dispatching newState:', newState);
    dispatch(updateColorwork(newState));
    onUpdate({ colorwork: newState });
  };

  const handleColorChange = (color) => {
    const newState = {
      ...colorworkState,
      color,
      initialized: true
    };
    
    dispatch(updateColorwork(newState));
    onUpdate({ colorwork: newState });
  };

  const handleSavePattern = (patternData) => {
    dispatch(savePattern(patternData));
    message.success(`Pattern "${patternData.name}" saved to library`);
  };

  const handleDeletePattern = (patternId) => {
    dispatch(deletePattern(patternId));
    message.success('Pattern deleted from library');
  };

  const handleCreateComplexPattern = () => {
    if (!newComplexPatternName.trim()) {
      message.error('Please enter a pattern name');
      return;
    }

    const complexPattern = {
      id: `complex_${Date.now()}`,
      name: newComplexPatternName,
      components: [],
      created: new Date().toISOString()
    };

    dispatch(createComplexPattern(complexPattern));
    setSelectedComplexPattern(complexPattern.id);
    setNewComplexPatternName('');
    message.success(`Complex pattern "${complexPattern.name}" created`);
  };

  const handleAddToComplex = (patternId, complexPatternId) => {
    const component = {
      id: `component_${Date.now()}`,
      patternId,
      positioning: 'center',
      customOffset: { x: 0, y: 0 },
      zIndex: 0,
      opacity: 100,
      visible: true
    };

    dispatch(updateComplexPattern({
      id: complexPatternId,
      updates: {
        components: [...(colorworkState.complexPatterns?.[complexPatternId]?.components || []), component]
      }
    }));
    message.success('Pattern added to complex pattern');
  };

  const handleAddToGarment = (patternId, isComplex = false) => {
    const sequenceItem = {
      id: `sequence_${Date.now()}`,
      patternId,
      isComplex,
      positioning: 'center',
      customOffset: { x: 0, y: 0 },
      zIndex: 0,
      opacity: 100,
      visible: true,
      garmentSection: garmentPreviewMode
    };

    dispatch(addToGarmentSequence(sequenceItem));
    message.success('Pattern added to garment sequence');
  };

  const handleNext = () => {
    onUpdate({ colorwork: colorworkState });
    onNext();
  };

  // Render the solid color picker interface
  const renderSolidColorPicker = () => (
    <Card title="Solid Color Selection" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>Choose a single color for your entire panel:</Text>
        <input
          type="color"
          value={colorworkState.color || '#ffffff'}
          onChange={(e) => handleColorChange(e.target.value)}
          style={{
            width: '100px',
            height: '50px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        />
        <Text type="secondary">Selected color: {colorworkState.color || '#ffffff'}</Text>
      </Space>
    </Card>
  );

  // Render functions for complex patterns (unchanged)
  const renderBasicPatterns = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Pattern Types" size="small">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {Object.entries(COLORWORK_TYPES).filter(([type]) => type !== 'solid').map(([type, info]) => (
              <Card 
                key={type}
                size="small" 
                hoverable
                style={{ 
                  border: colorworkState.activeWorkingPattern?.type === type ? '2px solid #1890ff' : '1px solid #d9d9d9'
                }}
                onClick={() => dispatch(setActiveWorkingPattern({ type, pattern: null }))}
              >
                <Row align="middle">
                  <Col flex="none">
                    <Avatar 
                      style={{ 
                        backgroundColor: '#f56a00',
                        fontFamily: 'monospace'
                      }}
                    >
                      {info.icon}
                    </Avatar>
                  </Col>
                  <Col flex="auto" style={{ marginLeft: 12 }}>
                    <Text strong>{info.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {info.description}
                    </Text>
                    <br />
                    <Tag color={info.complexity === 'Beginner' ? 'green' : 
                              info.complexity === 'Intermediate' ? 'orange' : 'red'}>
                      {info.complexity}
                    </Tag>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Card>

        <Card title="Pattern Library" size="small" style={{ marginTop: 16 }}>
          <List
            size="small"
            dataSource={Object.values(colorworkState.savedPatterns || {})}
            renderItem={(pattern) => (
              <List.Item
                actions={[
                  <Tooltip title="Load for editing">
                    <Button 
                      type="link" 
                      icon={<EyeOutlined />}
                      onClick={() => dispatch(setActiveWorkingPattern({ 
                        type: pattern.type, 
                        pattern: pattern.id 
                      }))}
                    />
                  </Tooltip>,
                  <Tooltip title="Duplicate">
                    <Button 
                      type="link" 
                      icon={<CopyOutlined />}
                      onClick={() => {
                        const duplicate = {
                          ...pattern,
                          id: `${pattern.id}_copy_${Date.now()}`,
                          name: `${pattern.name} (Copy)`
                        };
                        dispatch(savePattern(duplicate));
                      }}
                    />
                  </Tooltip>,
                  <Popconfirm
                    title="Delete this pattern?"
                    onConfirm={() => handleDeletePattern(pattern.id)}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: pattern.colors?.[0] || '#ccc' }}>
                      {COLORWORK_TYPES[pattern.type]?.icon || '?'}
                    </Avatar>
                  }
                  title={pattern.name}
                  description={
                    <Space>
                      <Tag>{COLORWORK_TYPES[pattern.type]?.name || pattern.type}</Tag>
                      <Text type="secondary">
                        {pattern.colors?.length || 0} colors
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        {colorworkState.activeWorkingPattern?.type && (
          <PatternEditor
            type={colorworkState.activeWorkingPattern.type}
            initialPattern={colorworkState.activeWorkingPattern.pattern ? 
              colorworkState.savedPatterns[colorworkState.activeWorkingPattern.pattern] : null}
            onSave={handleSavePattern}
            gauge={gauge}
          />
        )}
      </Col>
    </Row>
  );

  const renderComplexPatterns = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Card title="Complex Patterns" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input.Group compact>
              <Input
                placeholder="New complex pattern name"
                value={newComplexPatternName}
                onChange={(e) => setNewComplexPatternName(e.target.value)}
                onPressEnter={handleCreateComplexPattern}
                style={{ width: 'calc(100% - 40px)' }}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateComplexPattern}
              />
            </Input.Group>

            <List
              size="small"
              dataSource={Object.values(colorworkState.complexPatterns || {})}
              renderItem={(pattern) => (
                <List.Item
                  className={selectedComplexPattern === pattern.id ? 'ant-list-item-selected' : ''}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedComplexPattern === pattern.id ? '#f0f8ff' : 'transparent'
                  }}
                  onClick={() => setSelectedComplexPattern(pattern.id)}
                  actions={[
                    <Badge count={pattern.components?.length || 0} size="small">
                      <AppstoreAddOutlined />
                    </Badge>,
                    <Popconfirm
                      title="Delete this complex pattern?"
                      onConfirm={() => {
                        dispatch(deleteComplexPattern(pattern.id));
                        if (selectedComplexPattern === pattern.id) {
                          setSelectedComplexPattern(null);
                        }
                      }}
                    >
                      <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={pattern.name}
                    description={`${pattern.components?.length || 0} components`}
                  />
                </List.Item>
              )}
            />
          </Space>
        </Card>

        <Card title="Add Basic Patterns" size="small" style={{ marginTop: 16 }}>
          <List
            size="small"
            dataSource={Object.values(colorworkState.savedPatterns || {})}
            renderItem={(pattern) => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />}
                    disabled={!selectedComplexPattern}
                    onClick={() => handleAddToComplex(pattern.id, selectedComplexPattern)}
                  >
                    Add
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: pattern.colors?.[0] || '#ccc' }}>
                      {COLORWORK_TYPES[pattern.type]?.icon || '?'}
                    </Avatar>
                  }
                  title={pattern.name}
                  description={COLORWORK_TYPES[pattern.type]?.name}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col xs={24} lg={16}>
        {selectedComplexPattern && (
          <Card title={`Editing: ${colorworkState.complexPatterns?.[selectedComplexPattern]?.name}`} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Complex Pattern Composition"
                description="Arrange and position individual patterns to create complex designs. Use positioning and z-index to control layering."
                type="info"
                showIcon
              />
              
              <List
                size="small"
                dataSource={colorworkState.complexPatterns?.[selectedComplexPattern]?.components || []}
                renderItem={(component, index) => (
                  <List.Item
                    actions={[
                      <InputNumber
                        size="small"
                        placeholder="Z-Index"
                        value={component.zIndex}
                        onChange={(value) => {
                          const updatedComponents = [...(colorworkState.complexPatterns?.[selectedComplexPattern]?.components || [])];
                          updatedComponents[index] = { ...component, zIndex: value };
                          dispatch(updateComplexPattern({
                            id: selectedComplexPattern,
                            updates: { components: updatedComponents }
                          }));
                        }}
                      />,
                      <Select
                        size="small"
                        value={component.positioning}
                        onChange={(value) => {
                          const updatedComponents = [...(colorworkState.complexPatterns?.[selectedComplexPattern]?.components || [])];
                          updatedComponents[index] = { ...component, positioning: value };
                          dispatch(updateComplexPattern({
                            id: selectedComplexPattern,
                            updates: { components: updatedComponents }
                          }));
                        }}
                      >
                        {POSITIONING_OPTIONS.map(opt => (
                          <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                        ))}
                      </Select>,
                      <Button 
                        type="link" 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          const updatedComponents = (colorworkState.complexPatterns?.[selectedComplexPattern]?.components || []).filter((_, i) => i !== index);
                          dispatch(updateComplexPattern({
                            id: selectedComplexPattern,
                            updates: { components: updatedComponents }
                          }));
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      title={(colorworkState.savedPatterns || {})[component.patternId]?.name || 'Unknown Pattern'}
                      description={`Position: ${component.positioning}, Z-Index: ${component.zIndex}`}
                    />
                  </List.Item>
                )}
              />
            </Space>
          </Card>
        )}
      </Col>
    </Row>
  );

  const renderGarmentSequence = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Card title="Garment Sections" size="small">
          <Select
            value={garmentPreviewMode}
            onChange={setGarmentPreviewMode}
            style={{ width: '100%', marginBottom: 16 }}
          >
            <Option value="front">Front</Option>
            <Option value="back">Back</Option>
            <Option value="sleeves">Sleeves</Option>
            <Option value="collar">Collar</Option>
          </Select>

          <Divider orientation="left" plain>Available Patterns</Divider>
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Basic Patterns</Text>
            <List
              size="small"
              dataSource={Object.values(colorworkState.savedPatterns || {})}
              renderItem={(pattern) => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      icon={<PlusOutlined />}
                      onClick={() => handleAddToGarment(pattern.id, false)}
                    >
                      Add
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: pattern.colors?.[0] || '#ccc' }}>
                        {COLORWORK_TYPES[pattern.type]?.icon || '?'}
                      </Avatar>
                    }
                    title={pattern.name}
                    description={COLORWORK_TYPES[pattern.type]?.name}
                  />
                </List.Item>
              )}
            />

            <Text strong>Complex Patterns</Text>
            <List
              size="small"
              dataSource={Object.values(colorworkState.complexPatterns || {})}
              renderItem={(pattern) => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      icon={<PlusOutlined />}
                      onClick={() => handleAddToGarment(pattern.id, true)}
                    >
                      Add
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={pattern.components?.length || 0} size="small">
                        <Avatar style={{ backgroundColor: '#722ed1' }}>
                          <AppstoreAddOutlined />
                        </Avatar>
                      </Badge>
                    }
                    title={pattern.name}
                    description="Complex Pattern"
                  />
                </List.Item>
              )}
            />
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={16}>
        <Card title={`${garmentPreviewMode.charAt(0).toUpperCase() + garmentPreviewMode.slice(1)} Sequence`} size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Garment Pattern Sequencing"
              description="Arrange patterns for the entire garment with positioning and z-index control. Patterns will be applied in sequence order."
              type="info"
              showIcon
            />

            <List
              size="small"
              dataSource={(colorworkState.garmentSequence || []).filter(item => item.garmentSection === garmentPreviewMode)}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <InputNumber
                      size="small"
                      placeholder="Z-Index"
                      value={item.zIndex}
                      onChange={(value) => {
                        dispatch(updateGarmentSequence({
                          id: item.id,
                          updates: { zIndex: value }
                        }));
                      }}
                    />,
                    <Select
                      size="small"
                      value={item.positioning}
                      onChange={(value) => {
                        dispatch(updateGarmentSequence({
                          id: item.id,
                          updates: { positioning: value }
                        }));
                      }}
                    >
                      {POSITIONING_OPTIONS.map(opt => (
                        <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                      ))}
                    </Select>,
                    <Button
                      type="link"
                      icon={item.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      onClick={() => {
                        dispatch(updateGarmentSequence({
                          id: item.id,
                          updates: { visible: !item.visible }
                        }));
                      }}
                    />,
                    <Button 
                      type="link" 
                      danger 
                      size="small" 
                      icon={<DeleteOutlined />}
                      onClick={() => dispatch(removeFromGarmentSequence(item.id))}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      item.isComplex 
                        ? (colorworkState.complexPatterns || {})[item.patternId]?.name
                        : (colorworkState.savedPatterns || {})[item.patternId]?.name
                    }
                    description={
                      <Space>
                        <Tag>{item.isComplex ? 'Complex' : 'Basic'}</Tag>
                        <Text type="secondary">Position: {item.positioning}</Text>
                        <Text type="secondary">Z-Index: {item.zIndex}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );

  const renderSwatchTester = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Swatch Settings" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Current Gauge</Text>
              <div style={{ 
                marginTop: 8,
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa',
                textAlign: 'center'
              }}>
                <Text strong style={{ color: '#1890ff' }}>
                  {gauge?.stitches || (gauge?.stitchesPerInch ? gauge.stitchesPerInch * 4 : 19)} sts × {gauge?.rows || (gauge?.rowsPerInch ? gauge.rowsPerInch * 4 : 30)} rows per 4"
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Set in the Gauge step
                </Text>
              </div>
            </div>

            <div>
              <Text strong>Swatch Size</Text>
              <Row gutter={8} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text type="secondary">Width (inches)</Text>
                  <InputNumber
                    min={1}
                    max={8}
                    step={0.5}
                    value={swatchSettings.size.width}
                    onChange={(value) => setSwatchSettings(prev => ({
                      ...prev,
                      size: { ...prev.size, width: value }
                    }))}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={12}>
                  <Text type="secondary">Height (inches)</Text>
                  <InputNumber
                    min={1}
                    max={8}
                    step={0.5}
                    value={swatchSettings.size.height}
                    onChange={(value) => setSwatchSettings(prev => ({
                      ...prev,
                      size: { ...prev.size, height: value }
                    }))}
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
            </div>

            <div>
              <Text strong>Display Settings</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Stitch Size (pixels)</Text>
                <InputNumber
                  min={4}
                  max={16}
                  value={swatchSettings.stitchSize}
                  onChange={(value) => setSwatchSettings(prev => ({
                    ...prev,
                    stitchSize: value
                  }))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <Divider />

            {colorworkState.type !== 'solid' && (
              <div>
                <Text strong>Test Colors</Text>
                <div style={{ marginTop: 8 }}>
                  {testColors.map((color, index) => (
                    <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                      <Col span={16}>
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...testColors];
                            newColors[index] = e.target.value;
                            setTestColors(newColors);
                          }}
                          style={{
                            width: '100%',
                            height: '32px',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        />
                      </Col>
                      <Col span={8}>
                        <Button
                          danger
                          disabled={testColors.length <= 1}
                          onClick={() => {
                            setTestColors(testColors.filter((_, i) => i !== index));
                          }}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setTestColors([...testColors, '#ffffff']);
                    }}
                    style={{ width: '100%' }}
                  >
                    Add Color
                  </Button>
                </div>
              </div>
            )}

            {colorworkState.type === 'solid' && (
              <div>
                <Text strong>Current Solid Color</Text>
                <div style={{ 
                  marginTop: 8,
                  padding: '12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  backgroundColor: colorworkState.color || '#ffffff',
                  textAlign: 'center',
                  color: colorworkState.color === '#ffffff' ? '#000000' : '#ffffff'
                }}>
                  {colorworkState.color || '#ffffff'}
                </div>
                <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
                  Change the color in the "Solid Color Selection" section above
                </Text>
              </div>
            )}

            <Divider />

            <div>
              <Text strong>Test Pattern</Text>
              <Select
                placeholder="Select a saved pattern to test"
                value={swatchSettings.testPattern}
                onChange={(value) => setSwatchSettings(prev => ({
                  ...prev,
                  testPattern: value
                }))}
                style={{ width: '100%', marginTop: 8 }}
                allowClear
              >
                {Object.values(colorworkState.savedPatterns || {}).map(pattern => (
                  <Option key={pattern.id} value={pattern.id}>
                    {pattern.name} ({COLORWORK_TYPES[pattern.type]?.name})
                  </Option>
                ))}
              </Select>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
                Leave empty for solid color swatch
              </Text>
            </div>
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Swatch Preview" size="small">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '400px',
            padding: '16px'
          }}>
            <KnitSwatch
              gauge={{
                stitches: gauge?.stitches || (gauge?.stitchesPerInch ? gauge.stitchesPerInch * 4 : 19),
                rows: gauge?.rows || (gauge?.rowsPerInch ? gauge.rowsPerInch * 4 : 30)
              }}
              colors={colorworkState.type === 'solid' ? 
                [colorworkState.color || '#ffffff'] : 
                testColors
              }
              pattern={swatchSettings.testPattern ? 
                (colorworkState.savedPatterns || {})[swatchSettings.testPattern]?.pattern || [] : 
                []
              }
              size={swatchSettings.size}
              stitchSize={swatchSettings.stitchSize}
              onClick={(row, stitch) => {
                console.log(`Clicked stitch at row ${row}, position ${stitch}`);
                message.info(`Clicked stitch at row ${row + 1}, position ${stitch + 1}`);
              }}
            />
          </div>
          
          <Alert
            message="Interactive Swatch"
            description="This swatch shows how your colorwork pattern will look when knitted. The gauge is automatically taken from your gauge settings. Click on individual stitches to see their position."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div className="colorwork-step">
      <div className="step-header">
        <Title level={3}>Colorwork Design</Title>
        <Paragraph>
          Create sophisticated colorwork patterns with our comprehensive design system. 
          Choose from solid colors, stripes, stranded colorwork, or complex intarsia patterns.
        </Paragraph>
        
        {/* Colorwork Type Selection */}
        <Card title="Colorwork Type" size="small" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            {Object.entries(COLORWORK_TYPES).map(([type, info]) => (
              <Col xs={12} sm={8} md={6} key={type}>
                <Card 
                  size="small" 
                  hoverable
                  style={{ 
                    border: colorworkState.type === type ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleColorworkTypeChange(type)}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '24px', 
                      marginBottom: 8,
                      fontFamily: 'monospace' 
                    }}>
                      {info.icon}
                    </div>
                    <Text strong>{info.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {info.description}
                    </Text>
                    <br />
                    <Tag 
                      color={info.complexity === 'Beginner' ? 'green' : 
                            info.complexity === 'Intermediate' ? 'orange' : 'red'}
                      style={{ marginTop: 4 }}
                    >
                      {info.complexity}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Solid Color Picker for Solid Type */}
        {colorworkState.type === 'solid' && (
          <Card title="Solid Color Selection" size="small" style={{ marginBottom: 24 }}>
            <Row align="middle" gutter={16}>
              <Col>
                <input
                  type="color"
                  value={colorworkState.color || '#ffffff'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  style={{
                    width: 50,
                    height: 50,
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                />
              </Col>
              <Col>
                <Text strong>Selected Color: {colorworkState.color || '#ffffff'}</Text>
                <br />
                <Text type="secondary">This color will be applied to the entire panel</Text>
              </Col>
            </Row>
          </Card>
        )}

        {/* Swatch Tester - Always Visible */}
        <Card title="Swatch Tester" style={{ marginBottom: 24 }}>
          {renderSwatchTester()}
        </Card>
      </div>

      {/* Show pattern tools only for complex colorwork types */}
      {colorworkState.type && colorworkState.type !== 'solid' && (
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <TabPane tab="Basic Patterns" key="basic">
            {renderBasicPatterns()}
          </TabPane>
          <TabPane tab="Complex Patterns" key="complex">
            {renderComplexPatterns()}
          </TabPane>
          <TabPane tab="Garment Sequence" key="garment">
            {renderGarmentSequence()}
          </TabPane>
        </Tabs>
      )}
      
      <div className="step-actions" style={{ marginTop: 32 }}>
        <Space>
          <Button size="large" onClick={onPrev}>
            Previous: Gauge
          </Button>
          <Button size="large" type="primary" onClick={handleNext}>
            Next: Preview
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ColorworkStep;