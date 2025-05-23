import React, { useEffect, useState } from 'react';
import { defaultGauge } from '../../../models/Gauge';

const PatternViewer = ({ pattern, colorwork, currentRow, onRowChange, sizeModifier }) => {
  const [instructions, setInstructions] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  
  useEffect(() => {
    if (pattern?.panel) {
      const stitchPlan = pattern.panel.getStitchPlan(defaultGauge, sizeModifier);
      const knittingInstructions = pattern.panel.generateKnittingInstructions(
        defaultGauge, 
        sizeModifier, 
        1, // start row
        true, // is root
        colorwork // visual motif (colorwork)
      );
      
      setInstructions(knittingInstructions);
      setRowCount(stitchPlan.rows.length);
    }
  }, [pattern, colorwork, sizeModifier]);
  
  if (!pattern) return null;
  
  return (
    <div className="pattern-viewer">
      <div className="pattern-header">
        <h2>{pattern.name}</h2>
        <p className="pattern-description">{pattern.description}</p>
      </div>
      
      <div className="pattern-controls">
        <div className="row-controls">
          <button 
            onClick={() => onRowChange(Math.max(1, currentRow - 1))}
            disabled={currentRow <= 1}
          >
            Previous Row
          </button>
          <span className="row-indicator">Row {currentRow} of {rowCount}</span>
          <button 
            onClick={() => onRowChange(Math.min(rowCount, currentRow + 1))}
            disabled={currentRow >= rowCount}
          >
            Next Row
          </button>
        </div>
      </div>
      
      <div className="pattern-display">
        <div className="shape-visualization">
          <h3>Pattern Shape</h3>
          <div className="trapezoid-visual" style={{
            height: `${pattern.panel.getHeight() * 20}px`,
            width: `${pattern.panel.getLowerBase() * 20}px`,
            borderTop: `${pattern.panel.getHeight() * 20}px solid transparent`,
            borderLeft: `${pattern.panel.getOffset() * 20}px solid transparent`,
            borderRight: `${(pattern.panel.getUpperBase() - pattern.panel.getLowerBase() - pattern.panel.getOffset()) * 20}px solid transparent`
          }}>
            {/* Visual representation of the pattern shape */}
          </div>
        </div>
        
        <div className="current-row-display">
          <h3>Current Row</h3>
          <div className="stitch-visualization">
            {/* Visual representation of stitches in current row */}
            <div className="stitch-row">
              {/* This would normally be dynamically generated */}
              {Array(20).fill().map((_, i) => (
                <div key={i} className="stitch" style={{
                  backgroundColor: i % 3 === 0 ? '#3498db' : '#e74c3c'
                }}></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="instructions">
          <h3>Knitting Instructions</h3>
          <ol className="instruction-list">
            {instructions.map((instruction, index) => (
              <li key={index} className={index === currentRow - 1 ? 'active' : ''}>
                {instruction}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PatternViewer;
