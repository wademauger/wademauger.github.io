import { createSlice } from '@reduxjs/toolkit';

// Generate a unique ID for colors
const generateColorId = () => {
  return `color-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Initial state with default colors
const initialState = {
  colors: {
    'MC': { id: 'MC', label: 'MC', color: '#ffffff' },
    'CC1': { id: 'CC1', label: 'CC1', color: '#000000' },
    'CC2': { id: 'CC2', label: 'CC2', color: '#ff0000' },
    'CC3': { id: 'CC3', label: 'CC3', color: '#00ff00' },
    'CC4': { id: 'CC4', label: 'CC4', color: '#0000ff' }
  },
  activeColorId: 'MC',
  lastSaved: null,
  isDirty: false
};

const colorworkGridSlice = createSlice({
  name: 'colorworkGrid',
  initialState,
  reducers: {
    addColor: (state, action) => {
      const { label, color } = action.payload;
      const id = generateColorId();
      
      // Generate CC{$N} format for new colors if no label provided
      let defaultLabel = label;
      if (!label) {
        // Count existing CC colors to determine the next number
        const ccColors = Object.values(state.colors).filter(c => c.label.match(/^CC\d+$/));
        const nextNumber = ccColors.length + 1;
        defaultLabel = `CC${nextNumber}`;
      }
      
      state.colors[id] = {
        id,
        label: defaultLabel,
        color: color || '#ffffff'
      };
      
      state.isDirty = true;
    },
    
    updateColor: (state, action) => {
      const { id, label, color } = action.payload;
      
      if (state.colors[id]) {
        if (label !== undefined) {
          state.colors[id].label = label;
        }
        if (color !== undefined) {
          state.colors[id].color = color;
        }
        state.isDirty = true;
      }
    },
    
    removeColor: (state, action) => {
      const id = action.payload;
      
      // Don't allow removing the last color
      if (Object.keys(state.colors).length <= 1) {
        return;
      }
      
      // If we're removing the active color, switch to the first available color
      if (state.activeColorId === id) {
        const remainingColors = Object.keys(state.colors).filter(colorId => colorId !== id);
        state.activeColorId = remainingColors[0];
      }
      
      delete state.colors[id];
      state.isDirty = true;
    },
    
    setActiveColor: (state, action) => {
      const id = action.payload;
      if (state.colors[id]) {
        state.activeColorId = id;
      }
    },
    
    reorderColors: (state, action) => {
      const { colorIds } = action.payload;
      const newColors = {};
      
      // Rebuild colors object in the new order
      colorIds.forEach(id => {
        if (state.colors[id]) {
          newColors[id] = state.colors[id];
        }
      });
      
      state.colors = newColors;
      state.isDirty = true;
    },
    
    loadColorPalette: (state, action) => {
      const { colors, activeColorId } = action.payload;
      state.colors = colors;
      state.activeColorId = activeColorId || Object.keys(colors)[0];
      state.isDirty = false;
    },
    
    resetColors: (state) => {
      state.colors = initialState.colors;
      state.activeColorId = initialState.activeColorId;
      state.isDirty = true;
    },
    
    markSaved: (state) => {
      state.lastSaved = new Date().toISOString();
      state.isDirty = false;
    }
  }
});

export const {
  addColor,
  updateColor,
  removeColor,
  setActiveColor,
  reorderColors,
  loadColorPalette,
  resetColors,
  markSaved
} = colorworkGridSlice.actions;

export default colorworkGridSlice.reducer;

// Selectors
export const selectColors = (state) => state.colorworkGrid?.colors || {};
export const selectActiveColorId = (state) => state.colorworkGrid?.activeColorId || 'MC';
export const selectActiveColor = (state) => {
  const colors = state.colorworkGrid?.colors || {};
  const activeId = state.colorworkGrid?.activeColorId || 'MC';
  return colors[activeId];
};
export const selectColorById = (state, id) => state.colorworkGrid?.colors?.[id];
export const selectColorsArray = (state) => Object.values(state.colorworkGrid?.colors || {});
export const selectColorsCount = (state) => Object.keys(state.colorworkGrid?.colors || {}).length;
export const selectIsDirty = (state) => state.colorworkGrid?.isDirty || false;
export const selectLastSaved = (state) => state.colorworkGrid?.lastSaved;

// Color palette for legacy compatibility (returns simple color map)
export const selectColorPalette = (state) => {
  const colors = state.colorworkGrid?.colors || {};
  const palette = {};
  
  Object.values(colors).forEach(color => {
    palette[color.id] = color.color;
  });
  
  return palette;
};
