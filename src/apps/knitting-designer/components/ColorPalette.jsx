import React, { useState } from 'react';
import { Button, Input, Space, Popover, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import '../styles/ColorPalette.css';

const { Text } = Typography;

const ColorPalette = ({ colors, activeColor, onColorChange, onColorUpdate }) => {
  const [newColorName, setNewColorName] = useState('');
  const [showAddColor, setShowAddColor] = useState(false);
  
  // Handle color selection
  const handleColorSelect = (colorCode) => {
    onColorChange(colorCode);
  };
  
  // Handle color value change
  const handleColorValueChange = (colorCode, newValue) => {
    const newColors = { ...colors, [colorCode]: newValue };
    onColorUpdate(newColors);
  };
  
  // Add new color
  const handleAddColor = () => {
    if (newColorName && !colors[newColorName]) {
      const newColors = { ...colors, [newColorName]: '#ffffff' };
      onColorUpdate(newColors);
      setNewColorName('');
      setShowAddColor(false);
    }
  };
  
  // Delete color
  const handleDeleteColor = (colorCode) => {
    if (colorCode === 'MC') return; // Don't allow deleting main color
    
    const newColors = { ...colors };
    delete newColors[colorCode];
    onColorUpdate(newColors);
    
    // Switch to MC if deleted color was active
    if (activeColor === colorCode) {
      onColorChange('MC');
    }
  };
  
  // Color picker content
  const getColorPickerContent = (colorCode) => (
    <div className="color-picker-content">
      <Input
        type="color"
        value={colors[colorCode]}
        onChange={(e) => handleColorValueChange(colorCode, e.target.value)}
        style={{ width: '100%', height: '40px' }}
      />
      <div style={{ marginTop: '8px' }}>
        <Text strong>{colorCode}</Text>
        <br />
        <Text code>{colors[colorCode]}</Text>
      </div>
      {colorCode !== 'MC' && (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteColor(colorCode)}
          style={{ marginTop: '8px' }}
        >
          Delete
        </Button>
      )}
    </div>
  );
  
  // Add color content
  const addColorContent = (
    <div className="add-color-content">
      <Input
        placeholder="Color name (e.g., CC5)"
        value={newColorName}
        onChange={(e) => setNewColorName(e.target.value)}
        onPressEnter={handleAddColor}
        style={{ marginBottom: '8px' }}
      />
      <Space>
        <Button type="primary" onClick={handleAddColor} disabled={!newColorName}>
          Add
        </Button>
        <Button onClick={() => setShowAddColor(false)}>
          Cancel
        </Button>
      </Space>
    </div>
  );
  
  return (
    <div className="color-palette">
      <div className="color-grid">
        {Object.entries(colors).map(([colorCode, colorValue]) => (
          <Popover
            key={colorCode}
            content={getColorPickerContent(colorCode)}
            title={`Edit ${colorCode}`}
            trigger="contextMenu"
          >
            <div
              className={`color-swatch ${activeColor === colorCode ? 'active' : ''}`}
              style={{ backgroundColor: colorValue }}
              onClick={() => handleColorSelect(colorCode)}
              title={`${colorCode}: ${colorValue}`}
            >
              {activeColor === colorCode && (
                <div className="active-indicator">●</div>
              )}
            </div>
          </Popover>
        ))}
        
        {/* Add color button */}
        <Popover
          content={addColorContent}
          title="Add New Color"
          trigger="click"
          open={showAddColor}
          onOpenChange={setShowAddColor}
        >
          <div className="color-swatch add-color-swatch">
            <PlusOutlined />
          </div>
        </Popover>
      </div>
      
      <div className="color-info">
        <Text strong>Active Color: </Text>
        <Text code>{activeColor}</Text>
        <div 
          className="active-color-preview"
          style={{ backgroundColor: colors[activeColor] }}
        />
      </div>
      
      <div className="color-legend">
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Click to select • Right-click to edit • MC = Main Color
        </Text>
      </div>
    </div>
  );
};

export default ColorPalette;
