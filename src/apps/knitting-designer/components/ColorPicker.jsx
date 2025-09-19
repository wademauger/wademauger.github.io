import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { SketchPicker } from 'react-color';
import './ColorPicker.css';

const ColorPicker = ({ 
  visible, 
  onClose, 
  onSave, 
  onDelete,
  initialColor = '#ffffff', 
  initialLabel = '', 
  title = 'Edit Color',
  canDelete = false
}) => {
  const [color, setColor] = useState(initialColor);
  const [label, setLabel] = useState(initialLabel);

  useEffect(() => {
    setColor(initialColor);
    setLabel(initialLabel);
  }, [initialColor, initialLabel, visible]);

  const handleSave = () => {
    if (!label.trim()) {
      message.error('Please enter a label for the color');
      return;
    }
    
    onSave({
      color: color,
      label: label.trim()
    });
    onClose();
  };

  const handleCancel = () => {
    setColor(initialColor);
    setLabel(initialLabel);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {canDelete && (
              <Button 
                danger 
                onClick={handleDelete} 
                icon={<DeleteOutlined />}
                size="small"
              >
                Delete Color
              </Button>
            )}
          </div>
          <Space>
            <Button onClick={handleCancel} icon={<CloseOutlined />} size="small">
              Cancel
            </Button>
            <Button type="primary" onClick={handleSave} icon={<CheckOutlined />} size="small">
              Save
            </Button>
          </Space>
        </div>
      }
      width={420}
      className="color-picker-modal"
    >
      <div className="color-picker-content">
        <div className="color-picker-label">
          <Input
            id="color-label"
            placeholder="Enter color label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={20}
            size="small"
            style={{ marginTop: 4 }}
          />
        </div>

        <div className="color-picker-main">
          <label htmlFor="color-picker">Choose Color:</label>
          <div style={{ marginTop: 4 }}>
            <SketchPicker
              color={color}
              onChange={(color) => setColor(color.hex)}
              disableAlpha={true}
              width="100%"
              styles={{
                default: {
                  picker: {
                    width: '100%',
                    boxShadow: 'none',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ColorPicker;
