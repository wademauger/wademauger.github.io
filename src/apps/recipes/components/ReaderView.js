import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchMinus, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { fixedFontStyle } from '../styles/fontStyles';

const ReaderView = ({ recipe, fontSize, onFontSizeChange, onToggleView }) => {
  const [scale, setScale] = useState(1);

  if (!recipe) return null;

  const scaleIngredient = (ingredient) => {
    // If ingredient is an object with quantity, unit and name properties
    if (ingredient && typeof ingredient === 'object' && 'quantity' in ingredient) {
      const scaledQuantity = ingredient.quantity * scale;
      const formattedQuantity = scaledQuantity.toFixed(2).replace(/\.?0+$/, '');
      return {
        ...ingredient,
        quantity: formattedQuantity
      };
    }

    // Handle string ingredients (legacy format)
    if (ingredient === null || ingredient === undefined) return ingredient;

    const ingredientStr = String(ingredient);
    const match = ingredientStr.match(/^([\d./]+)\s+(.+)$/);
    if (match) {
      const amount = match[1];
      const rest = match[2];
      const scaledAmount = (parseFloat(amount) * scale).toFixed(2);
      const formattedAmount = scaledAmount.replace(/\.?0+$/, '');
      return `${formattedAmount} ${rest}`;
    }
    return ingredient;
  };

  // Function to render ingredient based on its type
  const renderIngredient = (ingredient) => {
    if (ingredient && typeof ingredient === 'object') {
      const scaledIngredient = scaleIngredient(ingredient);
      return `${scaledIngredient.quantity} ${scaledIngredient.unit || ''} ${scaledIngredient.name}`.trim();
    }
    return scaleIngredient(ingredient);
  };

  return (
    <div className="reader-view" style={{ fontSize: `${fontSize}%` }}>
      <div className="reader-header">
        <div className="reader-title">
          <h3>{recipe.title}</h3>
        </div>
        <div className="reader-controls">
          <button onClick={onToggleView} className="view-toggle-button">
            Standard View
          </button>
          <div className="font-controls">
            <button 
              onClick={() => onFontSizeChange(Math.max(70, fontSize - 10))}
              className="zoom-btn zoom-out"
              aria-label="Decrease font size"
            >
              <FontAwesomeIcon icon={faSearchMinus} />
            </button>
            <span style={fixedFontStyle}>Font: {fontSize} % </span>
            <button 
              onClick={() => onFontSizeChange(Math.min(150, fontSize + 10))}
              className="zoom-btn zoom-in"
              aria-label="Increase font size"
            >
              <FontAwesomeIcon icon={faSearchPlus} />
            </button>
          </div>
          <div className="scale-control">
            <label style={fixedFontStyle}>Batch scale: </label>
            <select
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
            >
              <option value="0.5">½×</option>
              <option value="1">1×</option>
              <option value="1.5">1½×</option>
              <option value="2">2×</option>
              <option value="3">3×</option>
              <option value="4">4×</option>
            </select>
          </div>
        </div>
      </div>

      <div className="reader-split-view">
        <div className="reader-ingredients">
          <h6>Ingredients</h6>
          <ul>
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i}>{renderIngredient(ingredient)}</li>
            ))}
          </ul>
        </div>

        <div className="reader-instructions">
          <h6>Instructions</h6>
          {recipe.steps && (
            <ol>
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
          {recipe.notes && (
            <>
              <h6>Notes</h6>
              <p>{recipe.notes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReaderView;
