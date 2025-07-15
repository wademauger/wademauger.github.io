import React from 'react';
import { Button, Space, Tooltip, Typography } from 'antd';
import { 
  EditOutlined, 
  BorderOutlined, 
  CopyOutlined, 
  FileImageOutlined, 
  ClearOutlined, 
  BgColorsOutlined 
} from '@ant-design/icons';
import '../styles/ToolPanel.css';

const { Text } = Typography;

const ToolPanel = ({ 
  activeTool, 
  onToolChange, 
  pasteMode, 
  hasClipboard, 
  onCopy, 
  onPaste, 
  onClearSelection, 
  onFillSelection, 
  hasSelection 
}) => {
  return (
    <div className="tool-panel">
      <div className="tool-buttons">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Tooltip title="Pencil Tool - Click individual stitches to color them">
            <Button
              type={activeTool === 'pencil' ? 'primary' : 'default'}
              icon={<EditOutlined />}
              onClick={() => onToolChange('pencil')}
              block
            >
              Pencil
            </Button>
          </Tooltip>
          
          <Tooltip title="Area Select Tool - Click and drag to select areas">
            <Button
              type={activeTool === 'area-select' ? 'primary' : 'default'}
              icon={<BorderOutlined />}
              onClick={() => onToolChange('area-select')}
              block
            >
              Area Select
            </Button>
          </Tooltip>
        </Space>
      </div>
      
      <div className="tool-actions">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Tooltip title="Copy selected area to clipboard">
            <Button
              icon={<CopyOutlined />}
              onClick={onCopy}
              disabled={!hasSelection}
              block
            >
              Copy
            </Button>
          </Tooltip>
          
          <Tooltip title="Paste from clipboard">
            <Button
              icon={<FileImageOutlined />}
              onClick={onPaste}
              disabled={!hasClipboard}
              type={pasteMode ? 'primary' : 'default'}
              block
            >
              {pasteMode ? 'Pasting...' : 'Paste'}
            </Button>
          </Tooltip>
          
          <Tooltip title="Fill selection with active color">
            <Button
              icon={<BgColorsOutlined />}
              onClick={onFillSelection}
              disabled={!hasSelection}
              block
            >
              Fill
            </Button>
          </Tooltip>
          
          <Tooltip title="Clear selection">
            <Button
              icon={<ClearOutlined />}
              onClick={onClearSelection}
              disabled={!hasSelection && !pasteMode}
              block
            >
              Clear
            </Button>
          </Tooltip>
        </Space>
      </div>
      
      <div className="tool-info">
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <strong>Shortcuts:</strong><br />
          P: Pencil tool • S: Select tool<br />
          Shift + drag: Union selection<br />
          Ctrl + drag: Subtract selection<br />
          Ctrl+C: Copy • Ctrl+V: Paste<br />
          Ctrl+Z: Undo • Ctrl+Y: Redo<br />
          Esc: Clear selection
        </Text>
      </div>
    </div>
  );
};

export default ToolPanel;
