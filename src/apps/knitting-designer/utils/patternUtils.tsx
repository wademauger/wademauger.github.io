// Utility functions for pattern manipulation and validation

/**
 * Validates a pattern grid
 * @param {Array<Array<string>>} pattern - 2D array of color codes
 * @param {Object} colors - Color palette object
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePattern = (pattern, colors) => {
  const errors = [];
  
  if (!Array.isArray(pattern) || pattern.length === 0) {
    errors.push('Pattern must be a non-empty array');
    return { isValid: false, errors };
  }
  
  // Check if all rows have the same length
  const expectedWidth = pattern[0].length;
  for (let i = 0; i < pattern.length; i++) {
    if (!Array.isArray(pattern[i]) || pattern[i].length !== expectedWidth) {
      errors.push(`Row ${i} has incorrect length. Expected ${expectedWidth}, got ${pattern[i]?.length || 'undefined'}`);
    }
  }
  
  // Check if all colors exist in the palette
  const availableColors = Object.keys(colors);
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      const colorCode = pattern[row][col];
      if (!availableColors.includes(colorCode)) {
        errors.push(`Unknown color "${colorCode}" at row ${row}, column ${col}`);
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Resizes a pattern to new dimensions
 * @param {Array<Array<string>>} pattern - Original pattern
 * @param {Object} newSize - New dimensions {width, height}
 * @param {string} fillColor - Color to use for new cells
 * @returns {Array<Array<string>>} Resized pattern
 */
export const resizePattern = (pattern, newSize, fillColor = 'CCX') => {
  const newPattern = Array(newSize.height).fill(null).map((_, row: any) => 
    Array(newSize.width).fill(null).map((_, col) => {
      // Preserve existing pattern data if within bounds
      if (row < pattern.length && col < pattern[0].length) {
        return pattern[row][col];
      }
      return fillColor;
    })
  );
  
  return newPattern;
};

/**
 * Copies a rectangular area from the pattern
 * @param {Array<Array<string>>} pattern - Source pattern
 * @param {Object} selection - Selection bounds {startRow, endRow, startCol, endCol}
 * @returns {Array<Array<string>>} Copied area
 */
export const copySelection = (pattern, selection) => {
  const clipboardData = [];
  for (let row = selection.startRow; row <= selection.endRow; row++) {
    const clipboardRow = [];
    for (let col = selection.startCol; col <= selection.endCol; col++) {
      clipboardRow.push(pattern[row][col]);
    }
    clipboardData.push(clipboardRow);
  }
  return clipboardData;
};

/**
 * Pastes clipboard data into the pattern at specified position
 * @param {Array<Array<string>>} pattern - Target pattern
 * @param {Array<Array<string>>} clipboardData - Data to paste
 * @param {number} startRow - Row to start pasting at
 * @param {number} startCol - Column to start pasting at
 * @returns {Array<Array<string>>} Updated pattern
 */
export const pasteSelection = (pattern, clipboardData, startRow, startCol) => {
  const newPattern = pattern.map((row: any) => [...row]);
  
  for (let r = 0; r < clipboardData.length; r++) {
    for (let c = 0; c < clipboardData[r].length; c++) {
      const targetRow = startRow + r;
      const targetCol = startCol + c;
      if (targetRow < newPattern.length && targetCol < newPattern[0].length) {
        newPattern[targetRow][targetCol] = clipboardData[r][c];
      }
    }
  }
  
  return newPattern;
};

/**
 * Fills a selection area with a specific color
 * @param {Array<Array<string>>} pattern - Target pattern
 * @param {Object} selection - Selection bounds
 * @param {string} color - Color to fill with
 * @returns {Array<Array<string>>} Updated pattern
 */
export const fillSelection = (pattern, selection, color) => {
  const newPattern = pattern.map((row: any) => [...row]);
  
  for (let row = selection.startRow; row <= selection.endRow; row++) {
    for (let col = selection.startCol; col <= selection.endCol; col++) {
      newPattern[row][col] = color;
    }
  }
  
  return newPattern;
};

/**
 * Calculates pattern statistics
 * @param {Array<Array<string>>} pattern - Pattern to analyze
 * @returns {Object} Statistics including color counts and percentages
 */
export const calculatePatternStats = (pattern) => {
  const colorCounts = {};
  let totalStitches = 0;
  
  pattern.forEach((row: any) => {
    row.forEach((stitch: any) => {
      colorCounts[stitch] = (colorCounts[stitch] || 0) + 1;
      totalStitches++;
    });
  });
  
  const colorPercentages = {};
  Object.keys(colorCounts).forEach((color: any) => {
    colorPercentages[color] = Math.round((colorCounts[color] / totalStitches) * 100);
  });
  
  return {
    colorCounts,
    colorPercentages,
    totalStitches,
    uniqueColors: Object.keys(colorCounts).length
  };
};

/**
 * Exports pattern to different formats
 * @param {Array<Array<string>>} pattern - Pattern to export
 * @param {Object} colors - Color palette
 * @param {string} format - Export format ('json', 'csv', 'txt')
 * @returns {string} Exported data
 */
export const exportPattern = (pattern, colors, format = 'json') => {
  switch (format) {
    case 'json':
      return JSON.stringify({
        pattern,
        colors,
        gridSize: { width: pattern[0].length, height: pattern.length },
        created: new Date().toISOString()
      }, null, 2);
      
    case 'csv':
      return pattern.map((row: any) => row.join(',')).join('\n');
      
    case 'txt':
      return pattern.map((row: any) => 
        row.map((stitch: any) => stitch.padEnd(4)).join('')
      ).join('\n');
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Imports pattern from JSON data
 * @param {string} jsonData - JSON string to import
 * @returns {Object} Imported pattern data
 */
export const importPattern = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate required fields
    if (!data.pattern || !Array.isArray(data.pattern)) {
      throw new Error('Invalid pattern data');
    }
    
    if (!data.colors || typeof data.colors !== 'object') {
      throw new Error('Invalid color data');
    }
    
    return {
      pattern: data.pattern,
      colors: data.colors,
      gridSize: data.gridSize || { width: data.pattern[0].length, height: data.pattern.length }
    };
  } catch (error: unknown) {
    throw new Error(`Failed to import pattern: ${error.message}`);
  }
};
