import React, { useState } from 'react';
import { Button, Space, InputNumber, Divider, Tooltip, Switch, message } from 'antd';
import { 
  EditOutlined, 
  BorderOutlined, 
  CopyOutlined, 
  FileImageOutlined, 
  ClearOutlined, 
  BgColorsOutlined,
  RotateLeftOutlined,
  UndoOutlined,
  RedoOutlined,
  DownloadOutlined,
  PlusOutlined,
  SwapOutlined,
  SyncOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  RotateRightOutlined,
  VerticalAlignMiddleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectColors, 
  addColor, 
  updateColor, 
  removeColor, 
  selectColorsCount
} from '../store/colorworkGridSlice';
import {
  setForegroundColor,
  setBackgroundColor,
  selectForegroundColorId,
  selectBackgroundColorId,
  selectForegroundColor,
  selectBackgroundColor
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
  // onDuplicateSelection - removed unused
  onRotateSelection,
  onReflectSelection,
  
  // Grid props
  gridSize,
  onGridResize,
  // onClearPattern - removed unused
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
  const foregroundColorId = useSelector(selectForegroundColorId);
  const backgroundColorId = useSelector(selectBackgroundColorId);
  const foregroundColor = useSelector(selectForegroundColor);
  const backgroundColor = useSelector(selectBackgroundColor);
  const colorsCount = useSelector(selectColorsCount);
  
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  // Which swatch is selected for edits: 'foreground' | 'background'
  const [selectedSwatch, setSelectedSwatch] = useState('foreground');
  
  // Handle color selection: left-click sets the currently selected swatch (FG/BG), right-click sets background
  const handleColorSelect = (colorId) => {
    if (selectedSwatch === 'foreground') {
      if (foregroundColorId === colorId) {
        setEditingColor(colors[colorId]);
        setColorPickerVisible(true);
      } else {
        dispatch(setForegroundColor(colorId));
      }
    } else {
      if (backgroundColorId === colorId) {
        setEditingColor(colors[colorId]);
        setColorPickerVisible(true);
      } else {
        dispatch(setBackgroundColor(colorId));
      }
    }
  };

  const handleColorContextMenu = (e, colorId) => {
    e.preventDefault();
    // Right-click always sets/edits the background swatch
    setSelectedSwatch('background');
    if (backgroundColorId === colorId) {
      setEditingColor(colors[colorId]);
      setColorPickerVisible(true);
    } else {
      dispatch(setBackgroundColor(colorId));
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
        <div className="selection-tools">
          <div className="selection-tools-row">
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
          </div>
          
          <div className="selection-tools-row">
              <Tooltip title="Rotate Left">
                <Button
                  icon={<RotateLeftOutlined />}
                  onClick={() => onRotateSelection(true)}
                  size="small"
                  disabled={!hasSelection}
                />
              </Tooltip>
            
            <Tooltip title="Rotate Right">
                <Button
                icon={<RotateRightOutlined />}
                onClick={() => onRotateSelection(false)}
                size="small"
                disabled={!hasSelection}
              />
            </Tooltip>
            
            <Tooltip title="Reflect Horizontal">
              <Button
                icon={<SwapOutlined />}
                onClick={() => onReflectSelection('horizontal')}
                size="small"
                disabled={!hasSelection}
              />
            </Tooltip>
            
            <Tooltip title="Reflect Vertical">
              <Button
                icon={<VerticalAlignMiddleOutlined />}
                onClick={() => onReflectSelection('vertical')}
                size="small"
                disabled={!hasSelection}
              />
            </Tooltip>
          </div>
        </div>
      </div>
      
      <Divider type="vertical" />
      
      {/* Colors Section */}
      <div className="ribbon-group">
        <div className="ribbon-group-title">Colors</div>
          <div className="fg-bg-container" style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <div className="fg-bg-swatches" style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
              <div
                className={`fg-swatch ${selectedSwatch === 'foreground' ? 'swatch-selected' : ''}`}
                onClick={() => setSelectedSwatch('foreground')}
                title={`Foreground: ${foregroundColor?.label || ''} (${foregroundColor?.color || ''}) - left click a palette color to set`}
              >
                <div
                  className="fg-inner"
                  style={foregroundColor?.color === 'transparent' ? { backgroundImage: 'linear-gradient(45deg, #e6e6e6 25%, #ffffff 25%, #ffffff 50%, #e6e6e6 50%, #e6e6e6 75%, #ffffff 75%, #ffffff 100%)', backgroundSize: '12px 12px' } : { backgroundColor: foregroundColor?.color || '#000' }}
                />
              </div>
              <div
                className={`bg-swatch ${selectedSwatch === 'background' ? 'swatch-selected' : ''}`}
                onClick={() => setSelectedSwatch('background')}
                title={`Background: ${backgroundColor?.label || ''} (${backgroundColor?.color || ''}) - right click a palette color to set`}
              >
                <div
                  className="bg-inner"
                  style={backgroundColor?.color === 'transparent' ? { backgroundImage: 'linear-gradient(45deg, #e6e6e6 25%, #ffffff 25%, #ffffff 50%, #e6e6e6 50%, #e6e6e6 75%, #ffffff 75%, #ffffff 100%)', backgroundSize: '12px 12px' } : { backgroundColor: backgroundColor?.color || '#fff' }}
                />
              </div>
            </div>
            <Button size="small" className="swap-btn" onClick={() => {
              // swap foreground and background
              dispatch(setForegroundColor(backgroundColorId));
              dispatch(setBackgroundColor(foregroundColorId));
            }} title="Swap Foreground/Background">
              <SwapOutlined />
            </Button>
          </div>
        <div className={`ribbon-color-palette ${colorsCount >= 5 ? 'two-row' : ''}`}>
          {colorsCount >= 5 ? (
            // Two-row layout for 5+ colors
            <>
              <div className="color-palette-row">
                {Object.values(colors).slice(0, Math.ceil(colorsCount / 2)).map((color) => (
                  <div key={color.id} className="ribbon-color-item">
                    <div
                      className={`ribbon-color-swatch ${foregroundColorId === color.id ? 'active' : ''} ${backgroundColorId === color.id ? 'bg-active' : ''}`}
                      style={color.color === 'transparent' ? { backgroundImage: 'linear-gradient(45deg, #e6e6e6 25%, #ffffff 25%, #ffffff 50%, #e6e6e6 50%, #e6e6e6 75%, #ffffff 75%, #ffffff 100%)', backgroundSize: '12px 12px' } : { backgroundColor: color.color }}
                      onClick={() => handleColorSelect(color.id)}
                      onContextMenu={(e: any) => handleColorContextMenu(e, color.id)}
                      title={`${color.label} (${color.color}) - left click to set foreground, right click to set background`}
                    >
                      {foregroundColorId === color.id && <div className="active-dot">●</div>}
                      {backgroundColorId === color.id && <div className="bg-dot">◦</div>}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="color-palette-row">
                {Object.values(colors).slice(Math.ceil(colorsCount / 2)).map((color) => (
                  <div key={color.id} className="ribbon-color-item">
                    <div
                      className={`ribbon-color-swatch ${foregroundColorId === color.id ? 'active' : ''} ${backgroundColorId === color.id ? 'bg-active' : ''}`}
                      style={color.color === 'transparent' ? { backgroundImage: 'linear-gradient(45deg, #e6e6e6 25%, #ffffff 25%, #ffffff 50%, #e6e6e6 50%, #e6e6e6 75%, #ffffff 75%, #ffffff 100%)', backgroundSize: '12px 12px' } : { backgroundColor: color.color }}
                      onClick={() => handleColorSelect(color.id)}
                      onContextMenu={(e: any) => handleColorContextMenu(e, color.id)}
                      title={`${color.label} (${color.color}) - left click to set foreground, right click to set background`}
                    >
                      {foregroundColorId === color.id && <div className="active-dot">●</div>}
                      {backgroundColorId === color.id && <div className="bg-dot">◦</div>}
                    </div>
                  </div>
                ))}
                
                {/* Add button in the second row */}
                <div className="ribbon-color-item">
                  <Tooltip title="Add New Color">
                    <Button
                      size="small"
                      style={{ height: '18px', width: '18px', fontSize: '8px'  }}
                      icon={<PlusOutlined />}
                      className="add-color-btn"
                      onClick={handleAddColor}
                    />
                  </Tooltip>
                </div>
              </div>
            </>
          ) : (
            // Single-row layout for 1-4 colors
            <>
              {Object.values(colors).map((color) => (
                <div key={color.id} className="ribbon-color-item">
                  <div
                    className={`ribbon-color-swatch ${foregroundColorId === color.id ? 'active' : ''} ${backgroundColorId === color.id ? 'bg-active' : ''}`}
                    style={{ backgroundColor: color.color }}
                    onClick={() => handleColorSelect(color.id)}
                    onContextMenu={(e: any) => handleColorContextMenu(e, color.id)}
                    title={`${color.label} (${color.color}) - left click to set foreground, right click to set background`}
                  >
                    {foregroundColorId === color.id && <div className="active-dot">●</div>}
                    {backgroundColorId === color.id && <div className="bg-dot">◦</div>}
                  </div>
                </div>
              ))}
              
              <div className="ribbon-color-item">
                <Tooltip title="Add New Color">
                  <Button
                    size="small"
                    style={{ height: '18px', width: '18px', fontSize: '8px'  }}
                    icon={<PlusOutlined />}
                    className="add-color-btn"
                    onClick={handleAddColor}
                  />
                </Tooltip>
              </div>
            </>
          )}
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
        <div className="symmetry-container">
          <div className="symmetry-toggle">
            <Switch
              checked={symmetry.enabled}
              onChange={(enabled) => onSymmetryChange({ ...symmetry, enabled })}
              size="small"
            />
            <span style={{ marginLeft: '4px', fontSize: '11px' }}>Enable</span>
          </div>
          
          <div className="symmetry-buttons">
            <div className="symmetry-button-row">
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
            </div>
            
            <div className="symmetry-button-row">
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
            </div>
          </div>
        </div>
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
