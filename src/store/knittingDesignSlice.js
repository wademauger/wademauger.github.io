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
      percentage: 100,
      width: 40,
      height: 60,
      standardSize: 'medium',
      previewDimensions: { width: 40, height: 60 }
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
      enabled: false,
      layers: [],
      type: 'stranded'
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
      // Determine if we need to insert custom step
      const isCustomPattern = state.patternData.basePattern?.id === 'custom';
      const hasCustomStep = isCustomPattern && Object.keys(state.patternData.customShapes).length === 0;
      
      // Calculate max steps (6 base steps, +1 if custom design step is needed)
      const maxSteps = hasCustomStep ? 6 : 5;
      
      if (state.currentStep < maxSteps) {
        // Handle step transitions
        if (state.currentStep === 0 && isCustomPattern && !Object.keys(state.patternData.customShapes).length) {
          // After pattern setup, if custom is selected and no shapes exist, go to custom step
          state.currentStep = 1; // Custom design step
        } else if (state.currentStep === 1 && isCustomPattern && Object.keys(state.patternData.customShapes).length) {
          // After custom design step, go to sizing
          state.currentStep = 2;
        } else {
          // Normal progression
          state.currentStep += 1;
        }
        state.isDirty = true;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 0) {
        const isCustomPattern = state.patternData.basePattern?.id === 'custom';
        
        // Handle reverse step transitions
        if (state.currentStep === 2 && isCustomPattern && Object.keys(state.patternData.customShapes).length) {
          // From sizing back to custom design
          state.currentStep = 1;
        } else if (state.currentStep === 1 && isCustomPattern) {
          // From custom design back to pattern setup
          state.currentStep = 0;
        } else {
          // Normal reverse progression
          state.currentStep -= 1;
        }
        state.isDirty = true;
      }
    },
    
    jumpToStep: (state, action) => {
      const targetStep = action.payload;
      const isCustomPattern = state.patternData.basePattern?.id === 'custom';
      const maxSteps = isCustomPattern ? 6 : 5;
      
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
    
    resetSession: (state) => {
      return { ...initialState, sessionId: generateSessionId() };
    },
    
    markClean: (state) => {
      state.isDirty = false;
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
  markClean
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
  const isCustomPattern = state.knittingDesign.patternData.basePattern?.id === 'custom';
  const hasCustomShapes = Object.keys(state.knittingDesign.patternData.customShapes).length > 0;
  
  const steps = [
    { title: 'Pattern Setup', key: 'setup' },
    ...(isCustomPattern ? [{ title: 'Custom Design', key: 'custom' }] : []),
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
