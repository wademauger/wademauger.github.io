import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setDraftRecipe } from '../../../reducers/recipes.reducer';
import './RecipeEditor.css';

const RecipeEditor = ({ recipe }) => {
  const dispatch = useDispatch();
  const [localRecipe, setLocalRecipe] = useState(null);

  // Sync with Redux state
  useEffect(() => {
    setLocalRecipe(recipe);
  }, [recipe]);

  const updateRecipe = (updates) => {
    const updatedRecipe = { ...localRecipe, ...updates };
    setLocalRecipe(updatedRecipe);
    dispatch(setDraftRecipe(updatedRecipe));
  };

  const updateIngredient = (index, field, value) => {
    const ingredients = Array.isArray(localRecipe.ingredients) ? localRecipe.ingredients : [];
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    updateRecipe({ ingredients: updatedIngredients });
  };

  const addIngredient = () => {
    const newIngredient = { name: '', quantity: '', unit: '' };
    const ingredients = Array.isArray(localRecipe?.ingredients) ? localRecipe.ingredients : [];
    const updatedIngredients = [...ingredients, newIngredient];
    updateRecipe({ ingredients: updatedIngredients });
  };

  const removeIngredient = (index: number) => {
    const ingredients = Array.isArray(localRecipe.ingredients) ? localRecipe.ingredients : [];
    const updatedIngredients = ingredients.filter((_, i: number) => i !== index);
    updateRecipe({ ingredients: updatedIngredients });
  };

  const createEmptyRecipe = () => {
    const emptyRecipe = {
      title: 'New Recipe',
      description: '',
      permalink: '',
      defaultServings: 4,
      servingUnits: 'servings',
      scalable: true,
      ingredients: [
        { name: '', quantity: '', unit: '' }
      ],
      instructions: '',
      category: 'Dinners'
    };
    setLocalRecipe(emptyRecipe);
    dispatch(setDraftRecipe(emptyRecipe));
  };

  if (!localRecipe) {
    return (
      <div className="recipe-editor-empty">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Recipe Selected</h3>
          <p>Start chatting with the assistant to create a new recipe, or create an empty recipe to get started.</p>
          <button onClick={createEmptyRecipe} className="btn-primary">
            Create Empty Recipe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-editor">
      <div className="editor-header">
        <h3>Recipe Editor</h3>
        <div className="editor-actions">
          <button className="btn-secondary" onClick={() => setLocalRecipe(null)}>
            Clear
          </button>
          <button className="btn-primary">
            Save Recipe
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="recipe-meta">
          <div className="form-group">
            <label>Recipe Title</label>
            <input
              type="text"
              value={localRecipe.title || ''}
              onChange={(e) => updateRecipe({ title: e.target.value })}
              className="form-input"
              placeholder="Enter recipe title..."
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={localRecipe.description || ''}
              onChange={(e) => updateRecipe({ description: e.target.value })}
              className="form-textarea"
              placeholder="Brief description of the recipe..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Servings</label>
              <input
                type="number"
                value={localRecipe.defaultServings || ''}
                onChange={(e) => updateRecipe({ defaultServings: parseInt(e.target.value) || 1 })}
                className="form-input"
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Serving Units</label>
              <input
                type="text"
                value={localRecipe.servingUnits || ''}
                onChange={(e) => updateRecipe({ servingUnits: e.target.value })}
                className="form-input"
                placeholder="servings, portions, etc."
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={localRecipe.category || 'Dinners'}
                onChange={(e) => updateRecipe({ category: e.target.value })}
                className="form-select"
              >
                <option value="Dinners">Dinners</option>
                <option value="Breads and Pastries">Breads and Pastries</option>
                <option value="Desserts">Desserts</option>
                <option value="Sides and Snacks">Sides and Snacks</option>
              </select>
            </div>
          </div>
        </div>

        <div className="ingredients-section">
          <div className="section-header">
            <h4>Ingredients</h4>
            <button onClick={addIngredient} className="btn-secondary btn-small">
              + Add Ingredient
            </button>
          </div>

          <div className="ingredients-list">
            {localRecipe.ingredients?.map((ingredient, index: number) => (
              <div key={index} className="ingredient-row">
                <div className="ingredient-inputs">
                  <input
                    type="text"
                    value={ingredient.quantity || ''}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    className="form-input quantity-input"
                    placeholder="Qty"
                  />
                  <input
                    type="text"
                    value={ingredient.unit || ''}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    className="form-input unit-input"
                    placeholder="Unit"
                  />
                  <input
                    type="text"
                    value={ingredient.name || ''}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="form-input name-input"
                    placeholder="Ingredient name"
                  />
                </div>
                <button
                  onClick={() => removeIngredient(index)}
                  className="btn-danger btn-small"
                  title="Remove ingredient"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="instructions-section">
          <div className="section-header">
            <h4>Instructions</h4>
          </div>
          <textarea
            value={localRecipe.instructions || ''}
            onChange={(e) => updateRecipe({ instructions: e.target.value })}
            className="form-textarea instructions-textarea"
            placeholder="Enter cooking instructions..."
            rows="10"
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeEditor;
