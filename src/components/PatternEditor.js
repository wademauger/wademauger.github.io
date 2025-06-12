import React, { useState, useCallback } from 'react';
import { Card, ColorPicker, Space, Button, Typography, Input, Row, Col, InputNumber, Select } from 'antd';
import { PlusOutlined, MinusOutlined, SaveOutlined } from '@ant-design/icons';
import SwatchViewer from './SwatchViewer';

const { Title, Text } = Typography;
const { Option } = Select;

const PatternEditor = ({ 
  pattern = [],
  colors = ['#ffffff'],
  patternType = 'stranded', // 'stranded', 'intarsia', 'stripes'
  patternSize = { width: 8, height: 8 }, // in stitches/rows
  gauge = { stitches: 19, rows: 30 },
  onPatternChange = () => {},
  onColorsChange = () => {},
  onSave = () => {},
  title = "Pattern Editor"
}) => {
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [patternName, setPatternName] = useState('');

  // Initialize pattern grid if empty
  const initializePattern = useCallback(() => {
    if (pattern.length === 0) {
      if (patternType === 'stripes') {
        // For stripes, create 1D array of rows
        return new Array(patternSize.height).fill(0);
      } else {
        // For stranded/intarsia, create 2D array
        return Array(patternSize.height).fill(null).map(() => 
          new Array(patternSize.width).fill(0)
        );
      }
    }
    return pattern;
  }, [pattern, patternType, patternSize]);

  const currentPattern = initializePattern();

  // Handle stitch clicks
  const handleStitchClick = useCallback((row, stitch) => {
    const newPattern = [...currentPattern];
    
    if (patternType === 'stripes') {
      // For stripes, clicking any stitch in a row changes the whole row
      newPattern[row] = activeColorIndex;
    } else {
      // For stranded/intarsia, change individual stitch
      if (!newPattern[row]) {
        newPattern[row] = new Array(patternSize.width).fill(0);
      }
      newPattern[row] = [...newPattern[row]];
      newPattern[row][stitch] = activeColorIndex;
    }
    
    onPatternChange(newPattern);
  }, [currentPattern, activeColorIndex, patternType, patternSize, onPatternChange]);

  // Add/remove colors
  const addColor = () => {
    const newColors = [...colors, '#ffffff'];
    onColorsChange(newColors);
  };

  const removeColor = (index) => {
    if (colors.length > 1) {
      const newColors = colors.filter((_, i) => i !== index);
      onColorsChange(newColors);
      if (activeColorIndex >= newColors.length) {
        setActiveColorIndex(Math.max(0, newColors.length - 1));
      }
    }
  };

  const updateColor = (index, color) => {
    const newColors = [...colors];
    newColors[index] = color;
    onColorsChange(newColors);
  };

  // Handle pattern size changes
  const handleSizeChange = (dimension, value) => {
    const newSize = { ...patternSize, [dimension]: value };
    
    // Resize pattern array
    let newPattern;
    if (patternType === 'stripes') {
      newPattern = new Array(newSize.height).fill(0);
      // Copy existing data
      for (let i = 0; i < Math.min(currentPattern.length, newSize.height); i++) {
        newPattern[i] = currentPattern[i] || 0;
      }
    } else {
      newPattern = Array(newSize.height).fill(null).map((_, row) => {
        const newRow = new Array(newSize.width).fill(0);
        if (currentPattern[row]) {
          for (let col = 0; col < Math.min(currentPattern[row].length, newSize.width); col++) {
            newRow[col] = currentPattern[row][col];
          }
        }
        return newRow;
      });
    }
    
    onPatternChange(newPattern);
  };

  // Save pattern
  const handleSave = () => {
    if (!patternName.trim()) {
      return;
    }
    
    onSave({
      name: patternName.trim(),
      type: patternType,
      pattern: currentPattern,
      colors: colors,
      size: patternSize
    });
    
    setPatternName('');
  };

  return (
    <Card title={title} style={{ height: 'fit-content' }}>
      <Space direction="vertical" size="medium" style={{ width: '100%' }}>
        
        {/* Pattern Type and Size */}
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Pattern Type</Text>
            <Select 
              value={patternType} 
              style={{ width: '100%' }} 
              disabled // Controlled by parent
            >
              <Option value="stranded">Stranded</Option>
              <Option value="intarsia">Intarsia</Option>
              <Option value="stripes">Stripes</Option>
            </Select>
          </Col>
          {patternType !== 'stripes' && (
            <Col span={8}>
              <Text strong>Width (stitches)</Text>
              <InputNumber
                value={patternSize.width}
                onChange={(value) => handleSizeChange('width', value)}
                min={1}
                max={50}
                style={{ width: '100%' }}
              />
            </Col>
          )}
          <Col span={8}>
            <Text strong>{patternType === 'stripes' ? 'Rows' : 'Height (rows)'}</Text>
            <InputNumber
              value={patternSize.height}
              onChange={(value) => handleSizeChange('height', value)}
              min={1}
              max={50}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>

        {/* Color Palette */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Text strong>Color Palette</Text>
            <Button 
              size="small" 
              icon={<PlusOutlined />} 
              onClick={addColor}
              disabled={colors.length >= 8}
            >
              Add Color
            </Button>
          </div>
          
          <Row gutter={[8, 8]}>
            {colors.map((color, index) => (
              <Col key={index}>
                <div style={{ 
                  border: activeColorIndex === index ? '3px solid #1890ff' : '2px solid #ddd',
                  borderRadius: '8px',
                  padding: '4px',
                  cursor: 'pointer',
                  backgroundColor: activeColorIndex === index ? '#f0f8ff' : 'transparent'
                }}
                onClick={() => setActiveColorIndex(index)}>
                  <ColorPicker
                    value={color}
                    onChange={(value) => updateColor(index, value.toHexString())}
                    size="small"
                  />
                  <Button
                    size="small"
                    type="text"
                    icon={<MinusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeColor(index);
                    }}
                    disabled={colors.length <= 1}
                    style={{ marginLeft: '4px' }}
                  />
                </div>
                <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '2px' }}>
                  Color {index + 1}
                </div>
              </Col>
            ))}
          </Row>
          
          <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
            Click a color to select it, then click stitches in the pattern to apply it.
            {patternType === 'stripes' && ' For stripes, clicking any stitch changes the entire row.'}
          </Text>
        </div>

        {/* Pattern Grid */}
        <div>
          <Text strong>Pattern Grid</Text>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            marginTop: '8px'
          }}>
            <SwatchViewer
              pattern={currentPattern}
              colors={colors}
              gauge={gauge}
              size={{ 
                width: patternType === 'stripes' ? 4 : patternSize.width / gauge.stitches,
                height: patternSize.height / gauge.rows 
              }}
              onStitchClick={handleStitchClick}
            />
          </div>
        </div>

        {/* Save Pattern */}
        <div>
          <Text strong>Save Pattern</Text>
          <Space.Compact style={{ width: '100%', marginTop: '8px' }}>
            <Input
              placeholder="Pattern name"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
            />
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!patternName.trim()}
            >
              Save
            </Button>
          </Space.Compact>
        </div>
      </Space>
    </Card>
  );
};

export default PatternEditor;
