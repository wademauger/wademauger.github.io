import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchMinus, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { fixedFontStyle } from '../styles/fontStyles';
import '../styles/RecipeControls.css';

const RecipeControls = ({ 
  currentView, 
  onToggleView, 
  fontSize, 
  onFontSizeChange, 
  scale, 
  onScaleChange,
  showScaleControl = true 
}) => {
  return (
    <div className="unified-recipe-controls">
      <div className="controls-row">
        {/* View Toggle Button */}
        <div className="control-group">
          <button onClick={onToggleView} className="view-toggle-button">
            {currentView === 'reader' ? 'Standard View' : 'Reader View'}
          </button>
        </div>

        {/* Font Controls */}
        <div className="control-group font-controls">
          <button 
            onClick={() => onFontSizeChange(Math.max(70, fontSize - 10))}
            className="zoom-btn zoom-out"
            aria-label="Decrease font size"
          >
            <FontAwesomeIcon icon={faSearchMinus} />
          </button>
          <span style={fixedFontStyle}>Font: {fontSize}%</span>
          <button 
            onClick={() => onFontSizeChange(Math.min(150, fontSize + 10))}
            className="zoom-btn zoom-in"
            aria-label="Increase font size"
          >
            <FontAwesomeIcon icon={faSearchPlus} />
          </button>
        </div>

        {/* Recipe Scaling Controls */}
        {showScaleControl && (
          <div className="control-group scale-controls">
            <label htmlFor="scale" style={fixedFontStyle}>Scale:</label>
            <select
              id="scale"
              value={scale}
              onChange={(e) => onScaleChange(parseFloat(e.target.value))}
              className="scale-select"
            >
              <option value="0.25">¼×</option>
              <option value="0.5">½×</option>
              <option value="0.75">¾×</option>
              <option value="1">1×</option>
              <option value="1.25">1¼×</option>
              <option value="1.5">1½×</option>
              <option value="1.75">1¾×</option>
              <option value="2">2×</option>
              <option value="2.5">2½×</option>
              <option value="3">3×</option>
              <option value="4">4×</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeControls;
