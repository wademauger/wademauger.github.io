import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const IngredientDivider = ({
  id,
  divider,
  index,
  editingIndex,
  editingEnabled,
  hoveredIndex,
  setHoveredIndex,
  handleEdit,
  handleDelete,
  handleSave,
  handleCancel,
  isPendingSave = false,
  isPendingDelete = false
}) => {
  const [editValue, setEditValue] = useState(divider.label || '');
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    disabled: editingIndex !== null || isPendingSave || isPendingDelete
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : (isPendingDelete ? 0.6 : 1),
    backgroundColor: isPendingDelete ? '#f5f5f5' : 'transparent',
    color: isPendingDelete ? '#999' : 'inherit',
    pointerEvents: isPendingDelete ? 'none' : 'auto'
  };

  const isEditing = editingIndex === index;
  const isHovered = hoveredIndex === index;

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <td colSpan="4" style={{ padding: '12px 0' }}>
        <div style={{
          borderTop: '2px solid #ddd',
          paddingTop: '8px',
          position: 'relative'
        }}>
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Input
                size="small"
                value={editValue}
                onChange={(e: any) => setEditValue(e.target.value)}
                placeholder="Section name (e.g., For the dough)"
                style={{ 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  maxWidth: '300px'
                }}
                autoFocus
                onPressEnter={() => handleSave({ ...divider, label: editValue }, index)}
              />
              <Button
                type="primary"
                size="small"
                icon={<FaSave />}
                onClick={() => handleSave({ ...divider, label: editValue }, index)}
                loading={isPendingSave}
              />
              <Button
                size="small"
                icon={<FaTimes />}
                onClick={() => {
                  setEditValue(divider.label || '');
                  handleCancel();
                }}
              />
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <h5 style={{
                margin: 0,
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#555',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {divider.label || 'Untitled Section'}
              </h5>
              
              {editingEnabled && (isHovered || editingIndex !== null) && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<FaEdit />}
                    onClick={() => {
                      setEditValue(divider.label || '');
                      handleEdit(index);
                    }}
                    style={{ fontSize: '12px', color: '#1890ff' }}
                    title="Edit section name"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<FaTrash />}
                    onClick={() => handleDelete(index)}
                    style={{ fontSize: '12px', color: '#ff4d4f' }}
                    title="Delete section"
                    loading={isPendingDelete}
                  />
                  <div 
                    {...attributes}
                    {...listeners}
                    style={{
                      padding: '4px 6px',
                      border: '1px solid #ddd',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '3px',
                      cursor: 'grab',
                      fontSize: '12px',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Drag to reorder"
                  >
                    ⋮⋮
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default IngredientDivider;