import React, { useState } from 'react';
import { Button, Space, InputNumber, Typography, Popconfirm, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  MinusOutlined, 
  ClearOutlined, 
  UndoOutlined, 
  RedoOutlined, 
  DownloadOutlined,
  ExpandOutlined
} from '@ant-design/icons';
import '../styles/GridControls.css';

const { Text } = Typography;

const GridControls = ({ 
  gridSize, 
  onGridResize, 
  onClearPattern, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo, 
  onExport 
}) => {
  const [newWidth, setNewWidth] = useState(gridSize.width);
  const [newHeight, setNewHeight] = useState(gridSize.height);
  
  // Handle grid resize
  const handleResize = () => {
    if (newWidth > 0 && newHeight > 0 && newWidth <= 100 && newHeight <= 100) {
      onGridResize({ width: newWidth, height: newHeight });
    }
  };
  
  // Quick resize functions
  const handleQuickResize = (widthChange, heightChange) => {
    const newSize = {
      width: Math.max(1, Math.min(100, gridSize.width + widthChange)),
      height: Math.max(1, Math.min(100, gridSize.height + heightChange))
    };
    onGridResize(newSize);
    setNewWidth(newSize.width);
    setNewHeight(newSize.height);
  };
  
  return (
    <div className="grid-controls">
      <div className="grid-size-controls">
        <Text strong>Grid Size</Text>
        <div className="size-inputs">
          <div className="size-input-group">
            <Text type="secondary">Height:</Text>
            <InputNumber
              min={1}
              max={500}
              value={newHeight}
              onChange={setNewHeight}
              size="small"
            />
          </div>
          <div className="size-input-group">
            <Text type="secondary">Width:</Text>
            <InputNumber
              min={1}
              max={500}
              value={newWidth}
              onChange={setNewWidth}
              size="small"
            />
          </div>
        </div>
        <Button
          type="primary"
          onClick={handleResize}
          size="small"
          icon={<ExpandOutlined />}
          block
        >
          Resize Grid
        </Button>
      </div>
      
      <div className="quick-resize">
        <Text strong>Quick Resize</Text>
        <Space>
          <Tooltip title="Add row">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleQuickResize(0, 1)}
            />
          </Tooltip>
          <Tooltip title="Remove row">
            <Button
              size="small"
              icon={<MinusOutlined />}
              onClick={() => handleQuickResize(0, -1)}
              disabled={gridSize.height <= 1}
            />
          </Tooltip>
          <Tooltip title="Add column">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleQuickResize(1, 0)}
            />
          </Tooltip>
          <Tooltip title="Remove column">
            <Button
              size="small"
              icon={<MinusOutlined />}
              onClick={() => handleQuickResize(-1, 0)}
              disabled={gridSize.width <= 1}
            />
          </Tooltip>
        </Space>
      </div>
      
      <div className="grid-actions">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Tooltip title="Undo last action">
              <Button
                icon={<UndoOutlined />}
                onClick={onUndo}
                disabled={!canUndo}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Redo last action">
              <Button
                icon={<RedoOutlined />}
                onClick={onRedo}
                disabled={!canRedo}
                size="small"
              />
            </Tooltip>
          </Space>
          
          <Popconfirm
            title="Clear entire pattern?"
            description="This will reset all stitches to MC (Main Color)"
            onConfirm={onClearPattern}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<ClearOutlined />}
              danger
              size="small"
              block
            >
              Clear Pattern
            </Button>
          </Popconfirm>
          
          <Tooltip title="Export pattern as JSON file">
            <Button
              icon={<DownloadOutlined />}
              onClick={onExport}
              type="primary"
              size="small"
              block
            >
              Export Pattern
            </Button>
          </Tooltip>
        </Space>
      </div>
      
      <div className="grid-info">
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Current: {gridSize.width} × {gridSize.height} stitches<br />
          Total: {gridSize.width * gridSize.height} stitches
        </Text>
      </div>
    </div>
  );
};

export default GridControls;
