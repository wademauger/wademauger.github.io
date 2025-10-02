import { useState } from 'react';
import { Input, message, Button } from 'antd';
import { FaPlus, FaTrash, FaGripVertical, FaEdit } from 'react-icons/fa';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { updateDriveRecipe } from '../../../reducers/recipes.reducer';
import IngredientDivider from './IngredientDivider';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// Utility function to convert quantities to numbers
const convertQuantityToNumber = (quantity) => {
  if (typeof quantity === 'number') {
    return quantity;
  }
  
  if (typeof quantity === 'string') {
    // Handle empty strings
    if (!quantity.trim()) {
      return 0;
    }
    
    // Handle fractions like "1/2"
    if (quantity.includes('/')) {
      const [numerator, denominator] = quantity.split('/');
      const num = parseFloat(numerator.trim());
      const den = parseFloat(denominator.trim());
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    
    // Handle ranges like "2-3" (take first number)
    if (quantity.includes('-')) {
      const firstNum = quantity.split('-')[0];
      const parsed = parseFloat(firstNum.trim());
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    
    // Handle regular numeric strings
    const parsed = parseFloat(quantity);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return 0; // Default fallback
};

// Sortable ingredient component
const SortableIngredient = ({ 
  ingredient, 
  index, 
  id, 
  editingIndex, 
  editingEnabled, 
  hoveredIndex,
  setHoveredIndex,
  handleEdit,
  handleInsertAfter,
  handleInsertDividerAfter,
  handleDelete,
  handleSave,
  handleCancel,
  scale,
  isPendingSave = false,
  isPendingDelete = false
}) => {
  const [editValues, setEditValues] = useState(ingredient);
  
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

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {isEditing ? (
        <>
          <td className="quantity-column">
            <Input
              size="small"
              value={editValues.quantity || ''}
              onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
              style={{ width: '100%' }}
            />
          </td>
          <td className="unit-column">
            <Input
              size="small"
              value={editValues.unit || ''}
              onChange={(e) => setEditValues({ ...editValues, unit: e.target.value })}
              style={{ width: '100%' }}
            />
          </td>
          <td className="ingredient-column">
            <Input
              size="small"
              value={editValues.name || ''}
              onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </td>
          <td className="controls-column">
            <div style={{ display: 'flex', gap: '4px' }}>
              <Button size="small" type="primary" onClick={() => handleSave(editValues, index)}>
                <CheckOutlined />
              </Button>
              <Button size="small" onClick={handleCancel}>
                <CloseOutlined />
              </Button>
            </div>
          </td>
        </>
      ) : (
        <>
          <td className="quantity-column">
            {ingredient.quantity !== undefined ? 
              (ingredient.quantity * scale).toFixed(2).replace(/\.?0+$/, '') : 
              ''}
          </td>
          <td className="unit-column">{ingredient.unit || ''}</td>
          <td className="ingredient-column">{ingredient.name}</td>
          <td className="controls-column">
            {hoveredIndex === index && editingEnabled && !isPendingDelete && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(index);
                    setEditValues(ingredient);
                  }}
                  style={{
                    padding: '4px 6px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Edit ingredient"
                >
                  <FaPencilAlt />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsertAfter(index);
                  }}
                  style={{
                    padding: '4px 6px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#5cb85c'
                  }}
                  title="Add ingredient after"
                >
                  <FaPlus />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsertDividerAfter(index);
                  }}
                  style={{
                    padding: '4px 6px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    color: '#1890ff'
                  }}
                  title="Add divider after"
                >
                  ➖
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  style={{
                    padding: '4px 6px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#d9534f'
                  }}
                  title="Delete ingredient"
                >
                  <FaTrash />
                </button>
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
                  <FaGripVertical />
                </div>
              </div>
            )}
          </td>
        </>
      )}
    </tr>
  );
};

// Sortable step component
const SortableStep = ({ 
  step, 
  index, 
  id, 
  editingIndex, 
  editingEnabled, 
  hoveredIndex,
  setHoveredIndex,
  handleEdit,
  handleInsertAfter,
  handleDelete,
  handleSave,
  handleCancel,
  isPendingSave = false,
  isPendingDelete = false
}) => {
  const [editValue, setEditValue] = useState(step);
  
  // Detect if the current edit value contains multiple instruction lines
  const normalizedEditValue = editValue ? editValue.replace(/\r\n/g, '\n').replace(/\r/g, '\n') : '';
  const editValueLines = normalizedEditValue.split('\n').filter((line: any) => line.trim().length > 0);
  const isMultilineInstructions = editValueLines.length > 1;
  
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
    pointerEvents: isPendingDelete ? 'none' : 'auto',
    marginBottom: '8px',
    padding: '8px',
    border: '1px solid #f0f0f0',
    borderRadius: '4px'
  };

  const isEditing = editingIndex === index;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {isEditing ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', position: 'relative' }}>
          <span style={{ 
            background: '#f0f0f0', 
            borderRadius: '50%', 
            width: '24px', 
            height: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '12px',
            marginTop: '4px',
            flexShrink: 0
          }}>
            {index + 1}
          </span>
          <div style={{ flex: 1, position: 'relative' }}>
            <TextArea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoSize={{ minRows: 1, maxRows: 6 }}
              style={{ 
                width: '100%',
                borderColor: isMultilineInstructions ? '#52c41a' : undefined,
                borderWidth: isMultilineInstructions ? '2px' : undefined
              }}
              placeholder="Enter instruction step..."
            />              {isMultilineInstructions && (
              <div style={{ 
                position: 'absolute', 
                right: '8px', 
                top: '8px', 
                background: '#52c41a', 
                color: 'white', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontSize: '10px',
                zIndex: 10,
                pointerEvents: 'none'
              }}>
                  Will split into {editValueLines.length} steps
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            <Button size="small" type="primary" onClick={() => handleSave(editValue, index)}>
              <CheckOutlined />
            </Button>
            <Button size="small" onClick={handleCancel}>
              <CloseOutlined />
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ 
            background: '#f0f0f0', 
            borderRadius: '50%', 
            width: '24px', 
            height: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '12px',
            flexShrink: 0
          }}>
            {index + 1}
          </span>
          <div style={{ flex: 1 }}>{step}</div>
          {hoveredIndex === index && editingEnabled && !isPendingDelete && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(index);
                  setEditValue(step);
                }}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Edit step"
              >
                <FaPencilAlt />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleInsertAfter(index);
                }}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#5cb85c'
                }}
                title="Add step after"
              >
                <FaPlus />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#d9534f'
                }}
                title="Delete step"
              >
                <FaTrash />
              </button>
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
                <FaGripVertical />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sortable note component (similar to step but for notes)
const SortableNote = ({ 
  note, 
  index, 
  id, 
  editingIndex, 
  editingEnabled, 
  hoveredIndex,
  setHoveredIndex,
  handleEdit,
  handleInsertAfter,
  handleDelete,
  handleSave,
  handleCancel,
  isPendingSave = false,
  isPendingDelete = false
}) => {
  const [editValue, setEditValue] = useState(note);
  
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
    pointerEvents: isPendingDelete ? 'none' : 'auto',
    marginBottom: '8px',
    padding: '8px',
    border: '1px solid #f0f0f0',
    borderRadius: '4px'
  };

  const isEditing = editingIndex === index;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {isEditing ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <TextArea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoSize={{ minRows: 1, maxRows: 3 }}
            style={{ flex: 1 }}
          />
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            <Button size="small" type="primary" onClick={() => handleSave(editValue, index)}>
              <CheckOutlined />
            </Button>
            <Button size="small" onClick={handleCancel}>
              <CloseOutlined />
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>{note}</div>
          {hoveredIndex === index && editingEnabled && !isPendingDelete && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(index);
                  setEditValue(note);
                }}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Edit note"
              >
                <FaPencilAlt />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleInsertAfter(index);
                }}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#5cb85c'
                }}
                title="Add note after"
              >
                <FaPlus />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#d9534f'
                }}
                title="Delete note"
              >
                <FaTrash />
              </button>
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
                <FaGripVertical />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RecipeDetail = ({ 
  recipe, 
  fontSize, 
  onFontSizeChange, 
  editingEnabled = false,
  isDraft = false,
  driveService = null,
  userInfo = null,
  onEditRecipe = null,
  onDeleteRecipe = null
}) => {
  // Debug logging for recipe structure (commented out for production)
  // useEffect(() => {
  //   console.log('🍽️ RecipeDetail loaded:', { 
  //     hasRecipe: !!recipe, 
  //     recipeId: recipe?.id, 
  //     isDraft, 
  //     editingEnabled,
  //     recipeKeys: recipe ? Object.keys(recipe) : 'no recipe'
  //   });
  // }, [recipe, isDraft, editingEnabled]);

  const [scale, setScale] = useState(1);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  
  // Individual editing states
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  
  // Hover states
  const [hoveredIngredientIndex, setHoveredIngredientIndex] = useState(null);
  const [hoveredStepIndex, setHoveredStepIndex] = useState(null);
  const [hoveredNoteIndex, setHoveredNoteIndex] = useState(null);
  
  const dispatch = useDispatch();

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Helper function to determine if this is a Drive recipe vs local recipe
  const isDriveRecipe = () => {
    // Drive recipes should have an id and be from the drive recipes collection
    return recipe && recipe.id && typeof recipe.id === 'string' && !isDraft;
  };

  const isLocalStaticRecipe = () => {
    // Local static recipes might have numeric IDs or no IDs and aren't editable
    return recipe && (!recipe.id || typeof recipe.id === 'number');
  };

  // Helper function to save recipe changes
  const saveRecipeChanges = async (updatedRecipe) => {
    // Check if this is a draft recipe
    if (isDraft) {
      message.warning('Cannot modify draft recipes. Please save the recipe first.');
      return;
    }

    // Check if this is a local static recipe
    if (isLocalStaticRecipe()) {
      message.warning('This is a local recipe. To modify it, please create a copy to your Google Drive first.');
      return;
    }

    if (!isDriveRecipe()) {
      message.error('Cannot save - this recipe is not stored in Google Drive. Please create a copy to your Drive first.');
      return;
    }

    try {
      // Update in Redux store immediately for optimistic UI
      dispatch(updateDriveRecipe(updatedRecipe));
      
      // Sync to Google Drive
      if (driveService) {
        await driveService.updateRecipe(recipe.id, updatedRecipe);
      }
      
      message.success('Recipe updated successfully');
    } catch {
      message.error('Failed to update recipe');
      
      // Revert the optimistic update on error
      dispatch(updateDriveRecipe(recipe));
    }
  };

  // Title editing handlers
  const handleEditTitle = () => {
    setEditingTitle(true);
    setTitleValue(recipe.title);
  };

  const handleSaveTitle = async () => {
    if (titleValue.trim() !== recipe.title) {
      const updatedRecipe = { ...recipe, title: titleValue.trim() };
      await saveRecipeChanges(updatedRecipe);
    }
    setEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setEditingTitle(false);
    setTitleValue('');
  };

  // Ingredient handlers
  const handleEditIngredient = (index: number) => {
    setEditingIngredientIndex(index);
  };

  const handleSaveIngredient = async (newIngredient, index: number) => {
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const updatedIngredients = [...ingredients];
    
    // Ensure quantity is stored as a number
    const processedIngredient = {
      ...newIngredient,
      quantity: convertQuantityToNumber(newIngredient.quantity)
    };
    
    updatedIngredients[index] = processedIngredient;
    const updatedRecipe = { ...recipe, ingredients: updatedIngredients };
    await saveRecipeChanges(updatedRecipe);
    setEditingIngredientIndex(null);
  };

  const handleInsertIngredientAfter = async (index: number) => {
    const newIngredient = { quantity: 0, unit: '', name: '' };
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index + 1, 0, newIngredient);
    const updatedRecipe = { ...recipe, ingredients: updatedIngredients };
    await saveRecipeChanges(updatedRecipe);
    // Start editing the new ingredient
    setEditingIngredientIndex(index + 1);
  };

  const handleDeleteIngredient = async (index: number) => {
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const updatedIngredients = ingredients.filter((_, i: number) => i !== index);
    const updatedRecipe = { ...recipe, ingredients: updatedIngredients };
    await saveRecipeChanges(updatedRecipe);
  };

  const handleCancelIngredientEdit = () => {
    setEditingIngredientIndex(null);
  };

  // Step handlers
  const handleEditStep = (index: number) => {
    setEditingStepIndex(index);
  };

  const handleSaveStep = async (newStep, index: number) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps[index] = newStep;
    const updatedRecipe = { ...recipe, steps: updatedSteps };
    await saveRecipeChanges(updatedRecipe);
    setEditingStepIndex(null);
  };

  const handleInsertStepAfter = async (index: number) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps.splice(index + 1, 0, '');
    const updatedRecipe = { ...recipe, steps: updatedSteps };
    await saveRecipeChanges(updatedRecipe);
    // Start editing the new step
    setEditingStepIndex(index + 1);
  };

  const handleDeleteStep = async (index: number) => {
    const updatedSteps = recipe.steps.filter((_, i: number) => i !== index);
    const updatedRecipe = { ...recipe, steps: updatedSteps };
    await saveRecipeChanges(updatedRecipe);
  };

  const handleCancelStepEdit = () => {
    setEditingStepIndex(null);
  };

  // Note handlers
  const handleEditNote = (index: number) => {
    setEditingNoteIndex(index);
  };

  const handleSaveNote = async (newNote, index: number) => {
    const updatedNotes = [...recipe.notes];
    updatedNotes[index] = newNote;
    const updatedRecipe = { ...recipe, notes: updatedNotes };
    await saveRecipeChanges(updatedRecipe);
    setEditingNoteIndex(null);
  };

  const handleInsertNoteAfter = async (index: number) => {
    const updatedNotes = [...(recipe.notes || [])];
    updatedNotes.splice(index + 1, 0, '');
    const updatedRecipe = { ...recipe, notes: updatedNotes };
    await saveRecipeChanges(updatedRecipe);
    // Start editing the new note
    setEditingNoteIndex(index + 1);
  };

  const handleDeleteNote = async (index: number) => {
    const updatedNotes = recipe.notes.filter((_, i: number) => i !== index);
    const updatedRecipe = { ...recipe, notes: updatedNotes };
    await saveRecipeChanges(updatedRecipe);
  };

  const handleCancelNoteEdit = () => {
    setEditingNoteIndex(null);
  };

  // Drag and drop handlers
  const handleIngredientDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      const oldIndex = ingredients.findIndex((_, index: number) => `ingredient-${index}` === active.id);
      const newIndex = ingredients.findIndex((_, index: number) => `ingredient-${index}` === over.id);
      
      const updatedIngredients = arrayMove(ingredients, oldIndex, newIndex);
      const updatedRecipe = { ...recipe, ingredients: updatedIngredients };
      await saveRecipeChanges(updatedRecipe);
    }
  };

  const handleStepDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = recipe.steps.findIndex((_, index: number) => `step-${index}` === active.id);
      const newIndex = recipe.steps.findIndex((_, index: number) => `step-${index}` === over.id);
      
      const updatedSteps = arrayMove(recipe.steps, oldIndex, newIndex);
      const updatedRecipe = { ...recipe, steps: updatedSteps };
      await saveRecipeChanges(updatedRecipe);
    }
  };

  const handleNoteDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = recipe.notes.findIndex((_, index: number) => `note-${index}` === active.id);
      const newIndex = recipe.notes.findIndex((_, index: number) => `note-${index}` === over.id);
      
      const updatedNotes = arrayMove(recipe.notes, oldIndex, newIndex);
      const updatedRecipe = { ...recipe, notes: updatedNotes };
      await saveRecipeChanges(updatedRecipe);
    }
  };

  // Add new item handlers
  const handleAddIngredient = async () => {
    const newIngredient = { quantity: 0, unit: '', name: '' };
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const updatedIngredients = [...ingredients, newIngredient];
    const updatedRecipe = { ...recipe, ingredients: updatedIngredients };
    await saveRecipeChanges(updatedRecipe);
    // Start editing the new ingredient
    setEditingIngredientIndex(updatedIngredients.length - 1);
  };

  const handleAddStep = async () => {
    const updatedSteps = [...recipe.steps, ''];
    const updatedRecipe = { ...recipe, steps: updatedSteps };
    await saveRecipeChanges(updatedRecipe);
    // Start editing the new step
    setEditingStepIndex(updatedSteps.length - 1);
  };

  const handleAddNote = async () => {
    const updatedNotes = [...(recipe.notes || []), ''];
    const updatedRecipe = { ...recipe, notes: updatedNotes };
    await saveRecipeChanges(updatedRecipe);
    // Start editing the new note
    setEditingNoteIndex(updatedNotes.length - 1);
  };

  // Divider handlers
  const handleAddDivider = async () => {
    if (isDraft) {
      message.warning('Cannot add dividers to draft recipes. Please save the recipe first.');
      return;
    }
    
    if (!isDriveRecipe()) {
      message.warning('Dividers can only be added to recipes stored in Google Drive. Please create a copy to your Drive first.');
      return;
    }

    const newDivider = { isDivider: true, label: '' };
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const updatedIngredients = [...ingredients, newDivider];
    const updatedRecipe = { ...recipe, ingredients: updatedIngredients };
    await saveRecipeChanges(updatedRecipe);
    // Start editing the new divider
    setEditingIngredientIndex(updatedIngredients.length - 1);
  };

  const handleInsertDividerAfter = async (index: number) => {
    if (isDraft) {
      message.warning('Cannot add dividers to draft recipes. Please save the recipe first.');
      return;
    }
    
    if (!isDriveRecipe()) {
      message.warning('Dividers can only be added to recipes stored in Google Drive. Please create a copy to your Drive first.');
      return;
    }

    const newDivider = { isDivider: true, label: '' };
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index + 1, 0, newDivider);
    const updatedRecipe = { ...recipe, ingredients: updatedIngredients };
    await saveRecipeChanges(updatedRecipe);
    // Start editing the new divider
    setEditingIngredientIndex(index + 1);
  };
  
  if (!recipe) return null;
  
  if (!recipe) return null;
  
  // Helper function to parse multi-line instructions into separate steps
  const parseMultilineInstructions = (text) => {
    if (!text || typeof text !== 'string') {
      return [text];
    }
    
    // Handle different line break formats (Windows \r\n, Unix \n, Mac \r)
    let normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // If this looks like a full recipe with sections, extract just the Instructions section
    if (normalizedText.includes('## Instructions:') || normalizedText.includes('# Instructions:')) {
      // Find the Instructions section
      const instructionsMatch = normalizedText.match(/##?\s*Instructions?:\s*\n([\s\S]*?)(?=\n##|\n#|$)/i);
      if (instructionsMatch) {
        normalizedText = instructionsMatch[1].trim();
      }
    }
    
    // Split by lines and filter out empty lines and markdown elements
    const lines = normalizedText.split('\n')
      .map((line: any) => line.trim())
      .filter((line: any) => {
        // Filter out empty lines, markdown headers, and other non-instruction content
        return line.length > 0 && 
               !line.startsWith('#') && 
               !line.startsWith('##') &&
               !line.match(/^[-*+]\s*$/) && // Empty bullet points
               !line.match(/^\d+\.\s*$/) && // Empty numbered items
               line !== '---' && // Horizontal rules
               !line.match(/^\s*\*\*[^*]*\*\*\s*:?\s*$/); // Standalone bold headers
      });
    
    // If there's only one line, return as is
    if (lines.length <= 1) {
      return [normalizedText.trim() || text];
    }
    
    const steps = [];
    
    for (const line of lines) {
      // Remove common list markers and numbering
      let cleanLine = line
        .replace(/^\d+\.\s*/, '') // Remove "1. ", "2. ", etc.
        .replace(/^[-*+]\s*/, '') // Remove "- ", "* ", "+ "
        .replace(/^•\s*/, '') // Remove bullet points
        .replace(/^\*\*([^*]+)\*\*:\s*/, '$1: ') // Convert "**Prep work**: " to "Prep work: "
        .trim();
      
      if (cleanLine.length > 0) {
        steps.push(cleanLine);
      }
    }
    
    return steps.length > 0 ? steps : [normalizedText.trim() || text];
  };

  // Enhanced step save handler that can handle multi-line text
  const handleSaveStepWithMultiline = async (newStepText, index: number) => {
    const parsedSteps = parseMultilineInstructions(newStepText);
    
    if (parsedSteps.length === 1) {
      // Single step, handle normally
      await handleSaveStep(newStepText, index);
    } else {
      // Multiple steps detected - replace current step and insert others after
      const updatedSteps = [...recipe.steps];
      
      // Replace the current step with the first parsed step
      updatedSteps[index] = parsedSteps[0];
      
      // Insert remaining steps after the current index
      for (let i = 1; i < parsedSteps.length; i++) {
        updatedSteps.splice(index + i, 0, parsedSteps[i]);
      }
      
      const updatedRecipe = { ...recipe, steps: updatedSteps };
      await saveRecipeChanges(updatedRecipe);
      setEditingStepIndex(null);
      
      message.success(`Split text into ${parsedSteps.length} separate steps`);
    }
  };

  // Bulk import handler for testing multi-line instructions


  return (
    <div 
      className="recipe-detail"
      style={{ fontSize: `${fontSize}%` }}
    >
      {/* Title Section */}
      <div className="recipe-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        {editingEnabled && !isDraft ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            {editingTitle ? (
              <>
                <Input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onPressEnter={handleSaveTitle}
                  autoFocus
                  style={{ fontSize: '1.5em', fontWeight: 'bold', flex: 1 }}
                />
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />} 
                  size="small"
                  onClick={handleSaveTitle}
                />
                <Button 
                  icon={<CloseOutlined />} 
                  size="small"
                  onClick={handleCancelTitle}
                />
              </>
            ) : (
              <>
                <h3 style={{ margin: 0, flex: 1 }}>{recipe.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={handleEditTitle}
                    title="Edit Recipe Title"
                    style={{ color: '#666' }}
                  />
                  <Button
                    type="text"
                    icon={<FaEdit />}
                    size="small"
                    onClick={onEditRecipe}
                    title="Edit Recipe"
                    style={{ color: '#666' }}
                  />
                  <Popconfirm
                    title="Delete Recipe"
                    description={`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`}
                    onConfirm={onDeleteRecipe}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    okType="danger"
                  >
                    <Button
                      type="text"
                      icon={<FaTrash />}
                      size="small"
                      title="Delete Recipe"
                      style={{ color: '#666' }}
                    />
                  </Popconfirm>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h3 style={{ margin: 0 }}>{recipe.title}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button
                type="text"
                icon={<FaEdit />}
                size="small"
                onClick={onEditRecipe}
                title="Edit Recipe"
                style={{ color: '#666' }}
              />
              <Popconfirm
                title="Delete Recipe"
                description={`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`}
                onConfirm={onDeleteRecipe}
                okText="Yes, Delete"
                cancelText="Cancel"
                okType="danger"
              >
                <Button
                  type="text"
                  icon={<FaTrash />}
                  size="small"
                  title="Delete Recipe"
                  style={{ color: '#666' }}
                />
              </Popconfirm>
            </div>
          </div>
        )}
        
        {/* AI Edit Button - Top Right Corner */}
        {editingEnabled && !isDraft && (
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={() => setShowAIChat(true)}
            className="ai-edit-button"
            size="small"
            style={{ marginLeft: '1rem' }}
          >
            Edit with AI
          </Button>
        )}
      </div>
      
      {/* Recipe Controls */}
      <RecipeControls
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        scale={scale}
        onScaleChange={setScale}
        showScaleControl={true}
      />
      
      <div className="recipe-content">
        {/* Left Column - Ingredients */}
        <div className="ingredients-column">
          <div className="ingredients-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h6 style={{ margin: 'auto' }}>Ingredients</h6>
              {editingEnabled && !isDraft && isDriveRecipe() && Array.isArray(recipe.ingredients) && (
                <>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />} 
                    size="small"
                    onClick={handleAddIngredient}
                  >
                    Add
                  </Button>
                  <Button 
                    type="dashed" 
                    size="small"
                    onClick={handleAddDivider}
                    style={{ fontSize: '11px' }}
                  >
                    ➖ Divider
                  </Button>
                </>
              )}
            </div>
          
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleIngredientDragEnd}
            >
              <table className="ingredients-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th className="quantity-column">Qty</th>
                    <th className="unit-column">Unit</th>
                    <th className="ingredient-column">Ingredient</th>
                    <th className="controls-column" style={{ width: '120px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext 
                    items={Array.isArray(recipe.ingredients) ? recipe.ingredients.map((_, index: number) => `ingredient-${index}`) : []}
                    strategy={verticalListSortingStrategy}
                  >
                    {(() => {
                    // Handle both flat array and grouped object ingredients
                      if (Array.isArray(recipe.ingredients)) {
                      // Flat array format - render as before with full editing support
                        return recipe.ingredients.map((ingredient, index: number) => {
                        // Check if this is a divider
                          if (ingredient.isDivider) {
                            return (
                              <IngredientDivider
                                key={`ingredient-${index}`}
                                id={`ingredient-${index}`}
                                divider={ingredient}
                                index={index}
                                editingIndex={editingIngredientIndex}
                                editingEnabled={editingEnabled && !isDraft}
                                hoveredIndex={hoveredIngredientIndex}
                                setHoveredIndex={setHoveredIngredientIndex}
                                handleEdit={handleEditIngredient}
                                handleDelete={handleDeleteIngredient}
                                handleSave={handleSaveIngredient}
                                handleCancel={handleCancelIngredientEdit}
                              />
                            );
                          } else {
                          // Regular ingredient
                            return (
                              <SortableIngredient
                                key={`ingredient-${index}`}
                                id={`ingredient-${index}`}
                                ingredient={ingredient}
                                index={index}
                                editingIndex={editingIngredientIndex}
                                editingEnabled={editingEnabled && !isDraft}
                                hoveredIndex={hoveredIngredientIndex}
                                setHoveredIndex={setHoveredIngredientIndex}
                                handleEdit={handleEditIngredient}
                                handleInsertAfter={handleInsertIngredientAfter}
                                handleInsertDividerAfter={handleInsertDividerAfter}
                                handleDelete={handleDeleteIngredient}
                                handleSave={handleSaveIngredient}
                                handleCancel={handleCancelIngredientEdit}
                                scale={scale}
                              />
                            );
                          }
                        });
                      } else if (recipe.ingredients && typeof recipe.ingredients === 'object') {
                      // Grouped object format - render each group with a header (read-only for now)
                        const groups = Object.entries(recipe.ingredients);
                        let ingredientIndex = 0;
                      
                        return groups.map(([groupName, groupIngredients]) => {
                          if (!Array.isArray(groupIngredients)) return null;
                        
                          return (
                            <React.Fragment key={groupName}>
                              {/* Group header row */}
                              <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <td colSpan="4" style={{ 
                                  padding: '8px 12px', 
                                  fontWeight: 'bold', 
                                  fontSize: '14px',
                                  color: '#555',
                                  borderTop: '2px solid #e9ecef'
                                }}>
                                  {groupName}
                                </td>
                              </tr>
                              {/* Group ingredients - read only for now */}
                              {groupIngredients.map((ingredient) => {
                                const currentIndex = ingredientIndex++;
                                return (
                                  <tr key={`ingredient-${currentIndex}`}>
                                    <td style={{ padding: '8px', fontSize: fontSize === 'small' ? '12px' : fontSize === 'large' ? '16px' : '14px' }}>
                                      {typeof ingredient === 'object' && ingredient.quantity !== undefined ? 
                                        (ingredient.quantity * scale).toFixed(2).replace(/\.?0+$/, '') : ''}
                                    </td>
                                    <td style={{ padding: '8px', fontSize: fontSize === 'small' ? '12px' : fontSize === 'large' ? '16px' : '14px' }}>
                                      {typeof ingredient === 'object' ? ingredient.unit : ''}
                                    </td>
                                    <td style={{ padding: '8px', fontSize: fontSize === 'small' ? '12px' : fontSize === 'large' ? '16px' : '14px' }}>
                                      {typeof ingredient === 'object' ? (
                                        <>
                                          {ingredient.name}
                                          {ingredient.notes && (
                                            <span style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                                              {' '}({ingredient.notes})
                                            </span>
                                          )}
                                        </>
                                      ) : ingredient}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                      {/* No editing controls for grouped ingredients yet */}
                                    </td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        });
                      } else {
                      // No ingredients or invalid format
                        return (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            No ingredients found. Click "Add" to add ingredients.
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          </div>
        </div>
        
        {/* Right Column - Instructions and Notes */}
        <div className="instructions-notes-column">
          {/* Instructions Section */}
          <div className="instructions-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h6 style={{ margin: 'auto' }}>Instructions</h6>
              {editingEnabled && !isDraft && (
                <>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />} 
                    size="small"
                    onClick={handleAddStep}
                  >
                  Add
                  </Button>
                </>
              )}
            </div>
          
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleStepDragEnd}
            >
              <SortableContext 
                items={recipe.steps.map((_, index: number) => `step-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                {recipe.steps.map((step, index: number) => (
                  <SortableStep
                    key={`step-${index}`}
                    id={`step-${index}`}
                    step={step}
                    index={index}
                    editingIndex={editingStepIndex}
                    editingEnabled={editingEnabled && !isDraft}
                    hoveredIndex={hoveredStepIndex}
                    setHoveredIndex={setHoveredStepIndex}
                    handleEdit={handleEditStep}
                    handleInsertAfter={handleInsertStepAfter}
                    handleDelete={handleDeleteStep}
                    handleSave={handleSaveStepWithMultiline}
                    handleCancel={handleCancelStepEdit}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Notes Section */}
          {((recipe.notes && recipe.notes.length > 0) || (editingEnabled && !isDraft)) && (
            <div className="notes-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h6 style={{ margin: 'auto' }}>Notes</h6>
                {editingEnabled && !isDraft && (
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />} 
                    size="small"
                    onClick={handleAddNote}
                  >
                  Add
                  </Button>
                )}
              </div>
            
              {recipe.notes && recipe.notes.length > 0 && (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleNoteDragEnd}
                >
                  <SortableContext 
                    items={recipe.notes.map((_, index: number) => `note-${index}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {recipe.notes.map((note, index: number) => (
                      <SortableNote
                        key={`note-${index}`}
                        id={`note-${index}`}
                        note={note}
                        index={index}
                        editingIndex={editingNoteIndex}
                        editingEnabled={editingEnabled && !isDraft}
                        hoveredIndex={hoveredNoteIndex}
                        setHoveredIndex={setHoveredNoteIndex}
                        handleEdit={handleEditNote}
                        handleInsertAfter={handleInsertNoteAfter}
                        handleDelete={handleDeleteNote}
                        handleSave={handleSaveNote}
                        handleCancel={handleCancelNoteEdit}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* AI Chat Component */}
      <RecipeAIChat
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        recipe={recipe}
        onUpdateRecipe={saveRecipeChanges}
        editingEnabled={editingEnabled && !isDraft}
        userInfo={userInfo}
      />
    </div>
  );
};

export default RecipeDetail;
