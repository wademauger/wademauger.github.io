import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Minimal focused types for the knitting design slice to unblock feature work.
// These intentionally use shallow `any` for deeply nested structures to keep
// changes minimal and safe during incremental migration.
// Shallow focused types to avoid broad refactors during incremental pass
export type PatternColorwork = {
  type?: string;
  color?: string;
  initialized?: boolean;
  savedPatterns?: { [id: string]: any };
  workingPatterns?: { [key: string]: any };
  complexPatterns?: { [id: string]: any };
  garmentSequence?: any[];
  activeWorkingPattern?: any;
  [key: string]: any;
};

export type PatternData = {
  [section: string]: any; // allow shallow indexing for pattern sections (colorwork, sizing, gauge, etc.)
  colorwork?: PatternColorwork;
};

export type KnittingDesignState = {
  currentStep: number;
  isKnittingMode: boolean;
  uiMode: 'wizard' | 'workspace';
  patternData: PatternData;
  sessionId: string | null;
  lastSaved: string | null;
  isDirty: boolean;
};

// Initial state for the knitting design app
// typed as `any` to avoid very noisy, deep structural type inference across
// the app during this incremental work. We'll replace with a stricter type
// when the surrounding codebase is migrated consistently to TS types.
const initialState: KnittingDesignState = {
  currentStep: 0,
  isKnittingMode: false,
  // UI mode controls whether user sees the Guided Wizard or the Advanced Workspace
  uiMode: 'workspace', // 'wizard' | 'workspace'
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
    setCurrentStep: (state: KnittingDesignState, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      state.isDirty = true;
    },
    
    setKnittingMode: (state: KnittingDesignState, action: PayloadAction<boolean>) => {
      state.isKnittingMode = action.payload;
      state.isDirty = true;
    },
    
    updatePatternData: (state: KnittingDesignState, action: PayloadAction<{ section?: string; data: any }>) => {
      const { section, data } = action.payload || {};
      if (section) {
        state.patternData[section] = { ...state.patternData[section], ...data };
      } else {
        state.patternData = { ...state.patternData, ...data };
      }
      state.isDirty = true;
    },
    
  nextStep: (state: KnittingDesignState) => {
      // Always have 7 steps with pattern editor as step 2
      const maxSteps = 6; // 0-6, so 7 total steps
      
      if (state.currentStep < maxSteps) {
        // Simple progression - pattern editor is always step 1 (index 1)
        state.currentStep += 1;
        state.isDirty = true;
      }
    },
    
  previousStep: (state: KnittingDesignState) => {
      if (state.currentStep > 0) {
        // Simple reverse progression
        state.currentStep -= 1;
        state.isDirty = true;
      }
    },
    
  jumpToStep: (state: KnittingDesignState, action: PayloadAction<number>) => {
      const targetStep = action.payload;
      const maxSteps = 6; // 0-6, so 7 total steps
      
      if (targetStep >= 0 && targetStep <= maxSteps) {
        state.currentStep = targetStep;
        state.isDirty = true;
      }
    },
    
    loadSession: (state: KnittingDesignState, action: PayloadAction<{ patternData?: any; currentStep?: number; sessionId?: string }>) => {
      const { patternData, currentStep, sessionId } = action.payload || {};
      state.patternData = patternData || initialState.patternData;
      state.currentStep = currentStep || 0;
      state.sessionId = sessionId || state.sessionId;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },
    
    saveSession: (state: KnittingDesignState, action: PayloadAction<{ sessionId?: string }>) => {
      state.sessionId = action.payload?.sessionId || state.sessionId;
      state.lastSaved = new Date().toISOString();
      state.isDirty = false;
    },
    
    resetSession: () => {
      return { ...initialState, sessionId: generateSessionId() };
    },
    
    markClean: (state: KnittingDesignState) => {
      state.isDirty = false;
    },

    // Colorwork actions
    updateColorwork: (state: KnittingDesignState, action: PayloadAction<any>) => {
      state.patternData.colorwork = { ...state.patternData.colorwork, ...action.payload };
      state.isDirty = true;
    },

    savePattern: (state: KnittingDesignState, action: PayloadAction<any>) => {
      const pattern = action.payload;
      const cw = (state.patternData.colorwork = state.patternData.colorwork || {} as any);
      cw.savedPatterns = cw.savedPatterns || {};
      cw.savedPatterns[pattern.id] = pattern;
      state.isDirty = true;
    },

    deletePattern: (state: KnittingDesignState, action: PayloadAction<string>) => {
      const patternId = action.payload;
      if (state.patternData.colorwork && state.patternData.colorwork.savedPatterns) {
        delete state.patternData.colorwork.savedPatterns[patternId];
      }
      state.isDirty = true;
    },

    setActiveWorkingPattern: (state: KnittingDesignState, action: PayloadAction<{ type: string; pattern: any }>) => {
      const { type, pattern } = action.payload;
      const cw = (state.patternData.colorwork = state.patternData.colorwork || {} as any);
      cw.activeWorkingPattern = { type, pattern };
      state.isDirty = true;
    },

    createComplexPattern: (state: KnittingDesignState, action: PayloadAction<any>) => {
      const pattern = action.payload;
      const cw = (state.patternData.colorwork = state.patternData.colorwork || {} as any);
      cw.complexPatterns = cw.complexPatterns || {};
      cw.complexPatterns[pattern.id] = pattern;
      state.isDirty = true;
    },

    updateComplexPattern: (state: KnittingDesignState, action: PayloadAction<{ id: string; updates: any }>) => {
      const { id, updates } = action.payload;
      if (state.patternData.colorwork && state.patternData.colorwork.complexPatterns && state.patternData.colorwork.complexPatterns[id]) {
        state.patternData.colorwork.complexPatterns[id] = {
          ...state.patternData.colorwork.complexPatterns[id],
          ...updates
        };
        state.isDirty = true;
      }
    },

    deleteComplexPattern: (state: KnittingDesignState, action: PayloadAction<string>) => {
      const patternId = action.payload;
      if (state.patternData.colorwork && state.patternData.colorwork.complexPatterns) {
        delete state.patternData.colorwork.complexPatterns[patternId];
      }
      state.isDirty = true;
    },

    addToGarmentSequence: (state: KnittingDesignState, action: PayloadAction<any>) => {
      const sequenceItem = action.payload;
      const cw = (state.patternData.colorwork = state.patternData.colorwork || {} as any);
      cw.garmentSequence = cw.garmentSequence || [];
      cw.garmentSequence.push(sequenceItem);
      state.isDirty = true;
    },

    updateGarmentSequence: (state: KnittingDesignState, action: PayloadAction<{ id: string; updates: any }>) => {
      const { id, updates } = action.payload;
      if (!state.patternData.colorwork || !state.patternData.colorwork.garmentSequence) return;
      const index = state.patternData.colorwork.garmentSequence.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        state.patternData.colorwork.garmentSequence[index] = {
          ...state.patternData.colorwork.garmentSequence[index],
          ...updates
        };
        state.isDirty = true;
      }
    },

    removeFromGarmentSequence: (state: KnittingDesignState, action: PayloadAction<string>) => {
      const itemId = action.payload;
      if (!state.patternData.colorwork || !state.patternData.colorwork.garmentSequence) return;
      state.patternData.colorwork.garmentSequence = state.patternData.colorwork.garmentSequence.filter(
        (item: any) => item.id !== itemId
      );
      state.isDirty = true;
    }
    ,
    setUiMode: (state: KnittingDesignState, action: PayloadAction<'wizard' | 'workspace'>) => {
      const mode = action.payload;
      if (mode === 'wizard' || mode === 'workspace') {
        state.uiMode = mode;
        state.isDirty = true;
      }
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
  setUiMode,
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
export const selectCurrentStep = (state: any) => state.knittingDesign.currentStep;
export const selectPatternData = (state: any) => state.knittingDesign.patternData;
export const selectIsKnittingMode = (state: any) => state.knittingDesign.isKnittingMode;
export const selectIsDirty = (state: any) => state.knittingDesign.isDirty;
export const selectSessionId = (state: any) => state.knittingDesign.sessionId;
export const selectLastSaved = (state: any) => state.knittingDesign.lastSaved;
export const selectUiMode = (state: any) => state.knittingDesign.uiMode;

// Complex selectors
export const selectCurrentStepInfo = (state: any) => {
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
