import { createSlice } from '@reduxjs/toolkit';

// Initial state for the knitting design app
const initialState = {
  currentStep: 0,
  isKnittingMode: false,
  patternData: {
    name: '',
    description: '',
    type: 'sweater',
    basePattern: null,
    customShapes: {},
    sizing: {
      method: 'percentage',
      scale: 100,
      gender: 'womens',
      customDimensions: {
        chest: 40,
        length: 26,
        armLength: 25
      },
      standardSize: 'M'
    },
    gauge: {
      stitchesPerInch: 4,
      rowsPerInch: 6,
      yarnWeight: 'worsted',
      needleSize: 'US 8',
      preset: null,
      fabricWidth: 160,
      fabricHeight: 240
    },
    colorwork: {
      type: 'solid', // Default to solid color
      color: '#ffffff', // Default color for solid
      initialized: false,
      // Saved patterns library
      savedPatterns: {},
      // Current working patterns by type
      workingPatterns: {
        stripes: { pattern: [], colors: ['#ffffff'], size: { height: 4 } },
        stranded: { pattern: [], colors: ['#ffffff', '#000000'], size: { width: 8, height: 8 } },
        intarsia: { pattern: [], colors: ['#ffffff', '#ff0000'], size: { width: 16, height: 16 } }
      },
      // Complex pattern compositions
      complexPatterns: {},
      // Final sequenced patterns for garment
      garmentSequence: [],
      // Current editing state
      activeWorkingPattern: null
    },
    preview: {
      view: 'flat',
      showSeams: true,
      showConstruction: false
    }
  },
  sessionId: null,
  lastSaved: null,
  isDirty: false
};

const knittingDesignSlice = createSlice({
  name: 'knittingDesign',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
      state.isDirty = true;
    },
    
    setKnittingMode: (state, action) => {
      state.isKnittingMode = action.payload;
      state.isDirty = true;
    },
    
    updatePatternData: (state, action) => {
      const { section, data } = action.payload;
      if (section) {
        state.patternData[section] = { ...state.patternData[section], ...data };
      } else {
        state.patternData = { ...state.patternData, ...data };
      }
      state.isDirty = true;
    },
    
    nextStep: (state) => {
      // Always have 7 steps with pattern editor as step 2
      const maxSteps = 6; // 0-6, so 7 total steps
      
      if (state.currentStep < maxSteps) {
        // Simple progression - pattern editor is always step 1 (index 1)
        state.currentStep += 1;
        state.isDirty = true;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 0) {
        // Simple reverse progression
        state.currentStep -= 1;
        state.isDirty = true;
      }
    },
    
    jumpToStep: (state, action) => {
      const targetStep = action.payload;
      const maxSteps = 6; // 0-6, so 7 total steps
      
      if (targetStep >= 0 && targetStep <= maxSteps) {
        state.currentStep = targetStep;
        state.isDirty = true;
      }
    },
    
    loadSession: (state, action) => {
      const { patternData, currentStep, sessionId } = action.payload;
      state.patternData = patternData || initialState.patternData;
      state.currentStep = currentStep || 0;
      state.sessionId = sessionId;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },
    
    saveSession: (state, action) => {
      state.sessionId = action.payload.sessionId || state.sessionId;
      state.lastSaved = new Date().toISOString();
      state.isDirty = false;
    },
    
    resetSession: () => {
      return { ...initialState, sessionId: generateSessionId() };
    },
    
    markClean: (state) => {
      state.isDirty = false;
    },

    // Colorwork actions
    updateColorwork: (state, action) => {
      state.patternData.colorwork = { ...state.patternData.colorwork, ...action.payload };
      state.isDirty = true;
    },

    savePattern: (state, action) => {
      const pattern = action.payload;
      state.patternData.colorwork.savedPatterns[pattern.id] = pattern;
      state.isDirty = true;
    },

    deletePattern: (state, action) => {
      const patternId = action.payload;
      delete state.patternData.colorwork.savedPatterns[patternId];
      state.isDirty = true;
    },

    setActiveWorkingPattern: (state, action) => {
      const { type, pattern } = action.payload;
      state.patternData.colorwork.activeWorkingPattern = { type, pattern };
      state.isDirty = true;
    },

    createComplexPattern: (state, action) => {
      const pattern = action.payload;
      state.patternData.colorwork.complexPatterns[pattern.id] = pattern;
      state.isDirty = true;
    },

    updateComplexPattern: (state, action) => {
      const { id, updates } = action.payload;
      if (state.patternData.colorwork.complexPatterns[id]) {
        state.patternData.colorwork.complexPatterns[id] = {
          ...state.patternData.colorwork.complexPatterns[id],
          ...updates
        };
        state.isDirty = true;
      }
    },

    deleteComplexPattern: (state, action) => {
      const patternId = action.payload;
      delete state.patternData.colorwork.complexPatterns[patternId];
      state.isDirty = true;
    },

    addToGarmentSequence: (state, action) => {
      const sequenceItem = action.payload;
      state.patternData.colorwork.garmentSequence.push(sequenceItem);
      state.isDirty = true;
    },

    updateGarmentSequence: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.patternData.colorwork.garmentSequence.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        state.patternData.colorwork.garmentSequence[index] = {
          ...state.patternData.colorwork.garmentSequence[index],
          ...updates
        };
        state.isDirty = true;
      }
    },

    removeFromGarmentSequence: (state, action) => {
      const itemId = action.payload;
      state.patternData.colorwork.garmentSequence = state.patternData.colorwork.garmentSequence.filter(
        item => item.id !== itemId
      );
      state.isDirty = true;
    }
  }
});

// Helper function to generate session ID
const generateSessionId = () => {
  return `knitting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const {
  setCurrentStep,
  setKnittingMode,
  updatePatternData,
  nextStep,
  previousStep,
  jumpToStep,
  loadSession,
  saveSession,
  resetSession,
  markClean,
  updateColorwork,
  savePattern,
  deletePattern,
  setActiveWorkingPattern,
  createComplexPattern,
  updateComplexPattern,
  deleteComplexPattern,
  addToGarmentSequence,
  updateGarmentSequence,
  removeFromGarmentSequence
} = knittingDesignSlice.actions;

export default knittingDesignSlice.reducer;

// Selectors
export const selectCurrentStep = (state) => state.knittingDesign.currentStep;
export const selectPatternData = (state) => state.knittingDesign.patternData;
export const selectIsKnittingMode = (state) => state.knittingDesign.isKnittingMode;
export const selectIsDirty = (state) => state.knittingDesign.isDirty;
export const selectSessionId = (state) => state.knittingDesign.sessionId;
export const selectLastSaved = (state) => state.knittingDesign.lastSaved;

// Complex selectors
export const selectCurrentStepInfo = (state) => {
  const currentStep = state.knittingDesign.currentStep;
  
  const steps = [
    { title: 'Pattern Setup', key: 'setup' },
    { title: 'Pattern Editor', key: 'custom' }, // Always include pattern editor as step 2
    { title: 'Sizing', key: 'sizing' },
    { title: 'Gauge', key: 'gauge' },
    { title: 'Colorwork', key: 'colorwork' },
    { title: 'Preview', key: 'preview' },
    { title: 'Interactive Knitting', key: 'knitting' }
  ];
  
  return {
    currentStep,
    currentStepInfo: steps[currentStep],
    totalSteps: steps.length,
    steps,
    canGoNext: currentStep < steps.length - 1,
    canGoPrevious: currentStep > 0
  };
};
