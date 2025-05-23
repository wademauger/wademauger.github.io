import React, { useState } from 'react';
import { Trapezoid } from '../../../models/Trapezoid';

const PatternEditor = ({ pattern, onPatternChange }) => {
  const [panelSettings, setPanelSettings] = useState({
    height: pattern?.panel?.height || 0,
    baseA: pattern?.panel?.baseA || 0,
    baseB: pattern?.panel?.baseB || 0,
    baseBHorizontalOffset: pattern?.panel?.baseBHorizontalOffset || 0
  });
  
  if (!pattern) return null;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    setPanelSettings({
      ...panelSettings,
      [name]: numValue
    });
    
    // Create updated panel
    const updatedPanel = new Trapezoid(
      name === 'height' ? numValue : panelSettings.height,
      name === 'baseA' ? numValue : panelSettings.baseA,
      name === 'baseB' ? numValue : panelSettings.baseB,
      name === 'baseBHorizontalOffset' ? numValue : panelSettings.baseBHorizontalOffset,
      pattern.panel.successors,
      pattern.panel.finishingSteps,
      pattern.panel.modificationScale
    );
    
    // Update the pattern with new panel
    onPatternChange({
      ...pattern,
      panel: updatedPanel
    });
  };
  
  return (
    <div className="pattern-editor">
      <h2>Edit Pattern</h2>
      
      <div className="editor-section">
        <h3>Panel Properties</h3>
        
        <div className="form-group">
          <label htmlFor="height">Height (inches):</label>
          <input 
            type="number" 
            id="height"
            name="height"
            value={panelSettings.height}
            onChange={handleChange}
            step="0.25"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="baseA">Lower Width (inches):</label>
          <input 
            type="number" 
            id="baseA"
            name="baseA"
            value={panelSettings.baseA}
            onChange={handleChange}
            step="0.25"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="baseB">Upper Width (inches):</label>
          <input 
            type="number" 
            id="baseB"
            name="baseB"
            value={panelSettings.baseB}
            onChange={handleChange}
            step="0.25"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="baseBHorizontalOffset">Horizontal Offset (inches):</label>
          <input 
            type="number" 
            id="baseBHorizontalOffset"
            name="baseBHorizontalOffset"
            value={panelSettings.baseBHorizontalOffset}
            onChange={handleChange}
            step="0.25"
          />
        </div>
      </div>
      
      <div className="successors-section">
        <h3>Successor Panels</h3>
        <p>Advanced panel editing not available in this view</p>
        {/* This would contain UI for editing successor trapezoids */}
      </div>
    </div>
  );
};

export default PatternEditor;
