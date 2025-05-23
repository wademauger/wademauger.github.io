import React, { useState } from 'react';

const ColorworkEditor = ({ pattern, colorwork, onColorworkChange }) => {
  const [grid, setGrid] = useState(
    Array(20).fill().map(() => Array(20).fill('#FFFFFF'))
  );
  const [selectedColor, setSelectedColor] = useState('#3498db');
  
  if (!pattern) return null;
  
  const handleCellClick = (row, col) => {
    const newGrid = [...grid];
    newGrid[row][col] = selectedColor;
    setGrid(newGrid);
    
    // This would update a more complex colorwork object in a real implementation
    onColorworkChange({
      grid: newGrid,
      name: 'Custom Colorwork'
    });
  };
  
  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
  };
  
  const clearColorwork = () => {
    const newGrid = Array(20).fill().map(() => Array(20).fill('#FFFFFF'));
    setGrid(newGrid);
    onColorworkChange(null);
  };
  
  return (
    <div className="colorwork-editor">
      <h2>Colorwork Pattern</h2>
      
      <div className="color-controls">
        <div className="color-picker">
          <label>Selected Color: </label>
          <input 
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
          />
        </div>
        <button onClick={clearColorwork}>Clear Colorwork</button>
      </div>
      
      <div className="colorwork-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div 
                key={colIndex}
                className="grid-cell"
                style={{ backgroundColor: cell }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              ></div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="colorwork-note">
        <p>Click on cells to apply the selected color. This will overlay the colorwork pattern onto your knitting pattern.</p>
      </div>
    </div>
  );
};

export default ColorworkEditor;
