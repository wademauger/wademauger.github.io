import React, { useState } from 'react';
import RecipeControls from './RecipeControls';
import { fixedFontStyle } from '../styles/fontStyles';

const RecipeDetail = ({ recipe, fontSize, onFontSizeChange, currentView, onToggleView }) => {
  const [scale, setScale] = useState(1);
  
  if (!recipe) return null;
  
  const scaleIngredient = (ingredient) => {
    // Check if the ingredient is an object with quantity, unit, and name properties
    if (typeof ingredient === 'object' && ingredient !== null) {
      if (ingredient.quantity === undefined) {
        // When quantity is undefined, just return the unit and name
        return `${ingredient.name} ${ingredient.unit || ''}`;
      } else if (ingredient.quantity) {
        const scaledQuantity = (ingredient.quantity * scale).toFixed(2)
          .replace(/\.?0+$/, ''); // Remove trailing zeros
        return `${scaledQuantity} ${ingredient.unit || ''} ${ingredient.name}`;
      }
    }
    
    // For string-type ingredients (backward compatibility)
    // Make sure ingredient is a string before using match
    if (typeof ingredient !== 'string') {
      // Convert non-string, non-object ingredients to string to prevent React child errors
      return String(ingredient);
    }
    
    const match = ingredient.match(/^([\d./]+)\s+(.+)$/);
    if (match) {
      const amount = match[1];
      const rest = match[2];
      // Calculate scaled amount - this is a simple approach
      const scaledAmount = (parseFloat(amount) * scale).toFixed(2);
      // Remove trailing zeros and decimal point if needed
      const formattedAmount = scaledAmount.replace(/\.?0+$/, '');
      return `${formattedAmount} ${rest}`;
    }
    return ingredient;
  };
  
  return (
    <div 
      className="recipe-detail"
      style={{ fontSize: `${fontSize}%` }}
    >
      <div className="recipe-header">
        <h3>{recipe.title}</h3>
      </div>
      
      {/* Unified Controls */}
      <RecipeControls
        currentView={currentView}
        onToggleView={onToggleView}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        scale={scale}
        onScaleChange={setScale}
        showScaleControl={true}
      />
      
      <div className="recipe-content">
        <div className="ingredients-section">
          <h6>Ingredients</h6>
          <ul>
            {recipe.ingredients.map((ingredient, i) => {
              // Ensure ingredient is properly formatted as string before rendering
              const formattedIngredient = typeof ingredient === 'object' ? 
                scaleIngredient(ingredient) : 
                scaleIngredient(ingredient);
              return <li key={i}>{formattedIngredient}</li>;
            })}
          </ul>
        </div>
        
        <div className="instructions-section">
          <h6>Instructions</h6>
          {recipe.steps && (
            <ol>
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
        </div>

        {recipe.notes && recipe.notes.length > 0 && (
          <div className="notes-section">
            <h6>Notes</h6>
            <ul>
              {recipe.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
