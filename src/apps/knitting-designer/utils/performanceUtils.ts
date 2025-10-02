// Utility functions for performance optimization
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Pattern validation utilities
export const validatePattern = (pattern) => {
  if (!Array.isArray(pattern)) return false;
  if (pattern.length === 0) return false;
  
  const width = pattern[0].length;
  return pattern.every((row: any) => Array.isArray(row) && row.length === width);
};

export const createEmptyPattern = (width, height, fillColor = 'CCX') => {
  return Array(height).fill(null).map(() => Array(width).fill(fillColor));
};

export const resizePattern = (pattern, newWidth, newHeight, fillColor = 'CCX') => {
  const newPattern = Array(newHeight).fill(null).map((_, row) => 
    Array(newWidth).fill(null).map((_, col) => {
      if (row < pattern.length && col < pattern[0].length) {
        return pattern[row][col];
      }
      return fillColor;
    })
  );
  
  return newPattern;
};

// Color utilities
export const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const generateColorVariations = (baseColor, count = 5) => {
  const colors = [baseColor];
  
  // Simple color variation generation
  for (let i = 1; i < count; i++) {
    const hue = (i * 360 / count) % 360;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return colors;
};
