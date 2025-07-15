import React, { useState } from 'react';
import { Button, Space, Select, InputNumber, Divider, Tooltip, Popover, Input, Switch, message } from 'antd';
import { 
  EditOutlined, 
  BorderOutlined, 
  CopyOutlined, 
  FileImageOutlined, 
  ClearOutlined, 
  BgColorsOutlined,
  UndoOutlined,
  RedoOutlined,
  DownloadOutlined,
  PlusOutlined,
  MinusOutlined,
  ExpandOutlined,
  SwapOutlined,
  SyncOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  BlockOutlined,
  RotateRightOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectColors, 
  selectActiveColorId, 
  addColor, 
  updateColor, 
  removeColor, 
  setActiveColor,
  selectColorsCount
} from '../store/colorworkGridSlice';
import ColorPicker from './ColorPicker';
import '../styles/RibbonUI.css';

const RibbonUI = ({ 
  // Tool props
  activeTool, 
  onToolChange, 
  pasteMode, 
  hasClipboard, 
  onCopy, 
  onPaste, 
  onClearSelection, 
  onFillSelection, 
  hasSelection,
  
  // Selection tools props
  onDuplicateSelection,
  onRotateSelection,
  onReflectSelection,
  
  // Grid props
  gridSize,
  onGridResize,
  onClearPattern,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  
  // Symmetry props
  symmetry,
  onSymmetryChange
}) => {
  const dispatch = useDispatch();
  const colors = useSelector(selectColors);
  const activeColorId = useSelector(selectActiveColorId);
  const colorsCount = useSelector(selectColorsCount);
  
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  
  // Handle color selection
  const handleColorSelect = (colorId) => {
    if (activeColorId === colorId) {
      // If clicking the active color, open color picker
      setEditingColor(colors[colorId]);
      setColorPickerVisible(true);
    } else {
      // Otherwise, just select the color
      dispatch(setActiveColor(colorId));
    }
  };
  
  // Handle adding new color
  const handleAddColor = () => {
    dispatch(addColor({ 
      color: '#ffffff' 
    }));
  };
  
  // Handle color picker save
  const handleColorSave = ({ color, label }) => {
    if (editingColor) {
      dispatch(updateColor({
        id: editingColor.id,
        color,
        label
      }));
    }
    setEditingColor(null);
    setColorPickerVisible(false);
  };

  // Handle color deletion from modal
  const handleColorDelete = () => {
    if (editingColor && colorsCount > 1) {
      dispatch(removeColor(editingColor.id));
    } else if (colorsCount <= 1) {
      message.warning('Cannot remove the last color');
    }
    setEditingColor(null);
    setColorPickerVisible(false);
  };
  // Quick resize functions
  const handleQuickResize = (widthChange, heightChange) => {
    const newSize = {
      width: Math.max(1, Math.min(100, gridSize.width + widthChange)),
      height: Math.max(1, Math.min(100, gridSize.height + heightChange))
    };
    onGridResize(newSize);
  };
  
  return (
    <div className="ribbon-ui">
      {/* Tools Section */}
      <div className="ribbon-group">
        <div className="ribbon-group-title">Tools</div>
        <Space>
          <Tooltip title="Pencil Tool (P)">
            <Button
              type={activeTool === 'pencil' ? 'primary' : 'default'}
              icon={<EditOutlined />}
              onClick={() => onToolChange('pencil')}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Area Select Tool (S)">
            <Button
              type={activeTool === 'area-select' ? 'primary' : 'default'}
              icon={<BorderOutlined />}
              onClick={() => onToolChange('area-select')}
              size="small"
            />
          </Tooltip>
        </Space>
      </div>
      
      <Divider type="vertical" />
      
      {/* Selection Actions */}
      <div className="ribbon-group">
        <div className="ribbon-group-title">Selection</div>
        <Space wrap>
          <Tooltip title="Copy (Ctrl+C)">
            <Button
              icon={<CopyOutlined />}
              onClick={onCopy}
              disabled={!hasSelection}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Paste (Ctrl+V)">
            <Button
              icon={<FileImageOutlined />}
              onClick={onPaste}
              disabled={!hasClipboard}
              type={pasteMode ? 'primary' : 'default'}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Fill Selection">
            <Button
              icon={<BgColorsOutlined />}
              onClick={onFillSelection}
              disabled={!hasSelection}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Clear Selection">
            <Button
              icon={<ClearOutlined />}
              onClick={onClearSelection}
              disabled={!hasSelection && !pasteMode}
              size="small"
            />
          </Tooltip>
          
          {/* Selection Tools - only show when rectangular areas are selected */}
          {hasSelection && (
            <>
              <Tooltip title="Duplicate Selection">
                <Button
                  icon={<BlockOutlined />}
                  onClick={onDuplicateSelection}
                  size="small"
                />
              </Tooltip>
              
              <Tooltip title="Rotate Selection">
                <Button
                  icon={<RotateRightOutlined />}
                  onClick={onRotateSelection}
                  size="small"
                />
              </Tooltip>
              
              <Tooltip title="Reflect Horizontal">
                <Button
                  icon={<SwapOutlined />}
                  onClick={() => onReflectSelection('horizontal')}
                  size="small"
                />
              </Tooltip>
              
              <Tooltip title="Reflect Vertical">
                <Button
                  icon={<VerticalAlignMiddleOutlined />}
                  onClick={() => onReflectSelection('vertical')}
                  size="small"
                />
              </Tooltip>
            </>
          )}
        </Space>
      </div>
      
      <Divider type="vertical" />
      
      {/* Colors Section */}
      <div className="ribbon-group">
        <div className="ribbon-group-title">Colors</div>
        <div className="ribbon-color-palette">
          {Object.values(colors).map((color) => (
            <div key={color.id} className="ribbon-color-item">
              <div
                className={`ribbon-color-swatch ${activeColorId === color.id ? 'active' : ''}`}
                style={{ backgroundColor: color.color }}
                onClick={() => handleColorSelect(color.id)}
                title={`${color.label} (${color.color})`}
              >
                {activeColorId === color.id && <div className="active-dot">●</div>}
              </div>
              <span className="color-label">{color.label}</span>
            </div>
          ))}
          
          <div className="ribbon-color-item">
            <Tooltip title="Add New Color">
              <Button
                size="small"
                icon={<PlusOutlined />}
                className="add-color-btn"
                onClick={handleAddColor}
              />
            </Tooltip>
            <span className="color-label add-label">Add</span>
          </div>
        </div>
      </div>
      
      <Divider type="vertical" />
      
      {/* Grid Size */}
      <div className="ribbon-group">
        <div className="ribbon-group-title">Grid Size</div>
        <Space>
          <InputNumber
            value={gridSize.width}
            onChange={(width) => onGridResize({ ...gridSize, width })}
            min={1}
            max={100}
            size="small"
            style={{ width: '60px' }}
          />
          <span>×</span>
          <InputNumber
            value={gridSize.height}
            onChange={(height) => onGridResize({ ...gridSize, height })}
            min={1}
            max={100}
            size="small"
            style={{ width: '60px' }}
          />
        </Space>
      </div>
      
      <Divider type="vertical" />
      
      {/* History */}
      <div className="ribbon-group">
        <div className="ribbon-group-title">History</div>
        <Space>
          <Tooltip title="Undo (Ctrl+Z)">
            <Button
              icon={<UndoOutlined />}
              onClick={onUndo}
              disabled={!canUndo}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Redo (Ctrl+Y)">
            <Button
              icon={<RedoOutlined />}
              onClick={onRedo}
              disabled={!canRedo}
              size="small"
            />
          </Tooltip>
        </Space>
      </div>
      
      <Divider type="vertical" />
      
      {/* Symmetry Section */}
      <div className="ribbon-group">
        <div className="ribbon-group-title">Symmetry</div>
        <Space direction="vertical" size="small">
          <div className="symmetry-toggle">
            <Switch
              checked={symmetry.enabled}
              onChange={(enabled) => onSymmetryChange({ ...symmetry, enabled })}
              size="small"
            />
            <span style={{ marginLeft: '4px', fontSize: '11px' }}>Enable</span>
          </div>
          
          <Space size="small">
            <Tooltip title="Horizontal Symmetry">
              <Button
                size="small"
                type={symmetry.direction === 'horizontal' ? 'primary' : 'default'}
                icon={<ColumnWidthOutlined />}
                onClick={() => onSymmetryChange({ ...symmetry, direction: 'horizontal' })}
                disabled={!symmetry.enabled}
              />
            </Tooltip>
            
            <Tooltip title="Vertical Symmetry">
              <Button
                size="small"
                type={symmetry.direction === 'vertical' ? 'primary' : 'default'}
                icon={<ColumnHeightOutlined />}
                onClick={() => onSymmetryChange({ ...symmetry, direction: 'vertical' })}
                disabled={!symmetry.enabled}
              />
            </Tooltip>
          </Space>
          
          <Space size="small">
            <Tooltip title="Mirror Symmetry">
              <Button
                size="small"
                type={symmetry.type === 'mirror' ? 'primary' : 'default'}
                icon={<SwapOutlined />}
                onClick={() => onSymmetryChange({ ...symmetry, type: 'mirror' })}
                disabled={!symmetry.enabled}
              />
            </Tooltip>
            
            <Tooltip title="Rotational Symmetry">
              <Button
                size="small"
                type={symmetry.type === 'rotational' ? 'primary' : 'default'}
                icon={<SyncOutlined />}
                onClick={() => onSymmetryChange({ ...symmetry, type: 'rotational' })}
                disabled={!symmetry.enabled}
              />
            </Tooltip>
          </Space>
        </Space>
      </div>
      
      <Divider type="vertical" />
      
      {/* Export */}
      <div className="ribbon-group">
        <div className="ribbon-group-title">Export</div>
        <Tooltip title="Export Pattern">
          <Button
            icon={<DownloadOutlined />}
            onClick={onExport}
            type="primary"
            size="small"
          />
        </Tooltip>
      </div>
      
      <ColorPicker
        visible={colorPickerVisible}
        onClose={() => {
          setColorPickerVisible(false);
          setEditingColor(null);
        }}
        onSave={handleColorSave}
        onDelete={handleColorDelete}
        initialColor={editingColor?.color}
        initialLabel={editingColor?.label}
        title={editingColor ? `Edit ${editingColor.label}` : 'Add Color'}
        canDelete={editingColor && colorsCount > 1}
      />
    </div>
  );
};

export default RibbonUI;
