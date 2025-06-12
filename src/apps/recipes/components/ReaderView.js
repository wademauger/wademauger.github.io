import React, { useState } from 'react';
import RecipeControls from './RecipeControls';
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
      </div>

      {/* Unified Controls */}
      <RecipeControls
        currentView="reader"
        onToggleView={onToggleView}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        scale={scale}
        onScaleChange={setScale}
        showScaleControl={true}
      />

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
