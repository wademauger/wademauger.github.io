import { createSlice } from '@reduxjs/toolkit';

// Generate a unique ID for colors
const generateColorId = () => {
  return `color-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Initial state with default colors
const initialState = {
  colors: {
    'MC': { id: 'MC', label: 'MC', color: '#000000' },
    'CCX': { id: 'CCX', label: 'No Color', color: 'transparent' },
    'CC1': { id: 'CC1', label: 'CC1', color: '#ffffff' },
    'CC2': { id: 'CC2', label: 'CC2', color: '#ff0000' },
    'CC3': { id: 'CC3', label: 'CC3', color: '#00ff00' },
    'CC4': { id: 'CC4', label: 'CC4', color: '#0000ff' },
    'CC5': { id: 'CC5', label: 'CC5', color: '#ffff00' }
  },
  // Legacy active color kept for compatibility; default to foreground
  activeColorId: 'MC',
  // Foreground (drawing/paint) and background (fill/eraser/expanded cells)
  foregroundColorId: 'MC',
  backgroundColorId: 'CCX',
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
        const ccColors = Object.values(state.colors).filter((c: any) => c.label.match(/^CC\d+$/));
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

      // Don't allow removing the last 2 colors
      if (Object.keys(state.colors).length <= 2) {
        return;
      }

      // Never allow removing the persistent 'no color' token CCX
      if (id === 'CCX') return;

      const remainingColors = Object.keys(state.colors).filter((colorId: any) => colorId !== id);

      // If we're removing the foreground/active color, switch to the first available color
      if (state.activeColorId === id || state.foregroundColorId === id) {
        const newFg = remainingColors[0];
        state.activeColorId = newFg;
        state.foregroundColorId = newFg;
      }

      // If we're removing the background color, choose CC1 if present else first remaining
      if (state.backgroundColorId === id) {
        state.backgroundColorId = remainingColors.includes('CCX') ? 'CCX' : (remainingColors.includes('CC1') ? 'CC1' : remainingColors[0]);
      }

      delete state.colors[id];
      state.isDirty = true;
    },
    
    // Set the legacy active color (kept for compatibility) — maps to foreground
    setActiveColor: (state, action) => {
      const id = action.payload;
      if (state.colors[id]) {
        state.activeColorId = id;
        state.foregroundColorId = id;
      }
    },

    // Modern API: set foreground (drawing) color
    setForegroundColor: (state, action) => {
      const id = action.payload;
      if (state.colors[id]) {
        state.foregroundColorId = id;
        state.activeColorId = id; // keep legacy field in sync
      }
    },

    // Set background (fill / eraser / expanded cells) color
    setBackgroundColor: (state, action) => {
      const id = action.payload;
      if (state.colors[id]) {
        state.backgroundColorId = id;
      }
    },
    
    reorderColors: (state, action) => {
      const { colorIds } = action.payload;
      const newColors = {};
      
      // Rebuild colors object in the new order
      colorIds.forEach((id: any) => {
        if (state.colors[id]) {
          newColors[id] = state.colors[id];
        }
      });
      
      state.colors = newColors;
      state.isDirty = true;
    },
    
    loadColorPalette: (state, action) => {
      const { colors, activeColorId, foregroundColorId, backgroundColorId } = action.payload;
      state.colors = colors;

      // Foreground: prefer explicit foregroundColorId, then activeColorId (legacy), then 'MC' if present, else first key
      if (foregroundColorId && state.colors[foregroundColorId]) {
        state.foregroundColorId = foregroundColorId;
        state.activeColorId = foregroundColorId;
      } else if (activeColorId && state.colors[activeColorId]) {
        state.foregroundColorId = activeColorId;
        state.activeColorId = activeColorId;
      } else if (state.colors['MC']) {
        state.foregroundColorId = 'MC';
        state.activeColorId = 'MC';
      } else {
        const firstKey = Object.keys(colors)[0];
        state.foregroundColorId = firstKey;
        state.activeColorId = firstKey;
      }

      // Background: prefer explicit backgroundColorId, then 'CCX' if present, then 'CC1', else choose first key (prefer different from foreground if possible)
      if (backgroundColorId && state.colors[backgroundColorId]) {
        state.backgroundColorId = backgroundColorId;
      } else if (state.colors['CCX']) {
        state.backgroundColorId = 'CCX';
      } else if (state.colors['CC1']) {
        state.backgroundColorId = 'CC1';
      } else {
        // pick first key that isn't the foreground if possible
        const keys = Object.keys(colors);
        const alt = keys.find((k: any) => k !== state.foregroundColorId) || keys[0];
        state.backgroundColorId = alt;
      }

      state.isDirty = false;
    },
    
    resetColors: (state) => {
      state.colors = initialState.colors;
      state.activeColorId = initialState.activeColorId;
      state.foregroundColorId = initialState.foregroundColorId;
      state.backgroundColorId = initialState.backgroundColorId;
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
  setForegroundColor,
  setBackgroundColor,
  reorderColors,
  loadColorPalette,
  resetColors,
  markSaved
} = colorworkGridSlice.actions;

export default colorworkGridSlice.reducer;

// Selectors
export const selectColors = (state) => state.colorworkGrid?.colors || {};
export const selectActiveColorId = (state) => state.colorworkGrid?.activeColorId || 'CC1';
export const selectActiveColor = (state) => {
  const colors = state.colorworkGrid?.colors || {};
  const activeId = state.colorworkGrid?.activeColorId || 'CC1';
  return colors[activeId];
};
export const selectForegroundColorId = (state) => state.colorworkGrid?.foregroundColorId || state.colorworkGrid?.activeColorId || 'MC';
export const selectBackgroundColorId = (state) => state.colorworkGrid?.backgroundColorId || 'CCX';
export const selectForegroundColor = (state) => {
  const colors = state.colorworkGrid?.colors || {};
  const id = state.colorworkGrid?.foregroundColorId || state.colorworkGrid?.activeColorId || 'MC';
  return colors[id];
};
export const selectBackgroundColor = (state) => {
  const colors = state.colorworkGrid?.colors || {};
  const id = state.colorworkGrid?.backgroundColorId || 'CCX';
  return colors[id];
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
  
  Object.values(colors).forEach((color: any) => {
    palette[color.id] = color.color;
  });
  
  return palette;
};
