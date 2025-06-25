import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPrintMode: false,
  printModeFontSize: 20,
  draftRecipe: null,
  chatMessages: [],
  // Google Drive integration
  isGoogleDriveConnected: false,
  userInfo: null, // { userName, userEmail, userPicture }
  driveRecipes: [],
  isLoading: false,
  error: null,
  editingEnabled: false,
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setIsPrintMode: (state, action) => {
      state.isPrintMode = action.payload;
    },
    setFontSize: (state, action) => {
      state.printModeFontSize = action.payload;
    },
    setDraftRecipe: (state, action) => {
      state.draftRecipe = action.payload;
    },
    clearDraftRecipe: (state) => {
      state.draftRecipe = null;
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    clearChatMessages: (state) => {
      state.chatMessages = [];
    },
    updateDraftRecipe: (state, action) => {
      state.draftRecipe = action.payload;
    },
    // Google Drive actions
    setGoogleDriveConnection: (state, action) => {
      state.isGoogleDriveConnected = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    setDriveRecipes: (state, action) => {
      state.driveRecipes = action.payload;
    },
    addDriveRecipe: (state, action) => {
      state.driveRecipes.push(action.payload);
    },
    updateDriveRecipe: (state, action) => {
      const { id, ...updatedData } = action.payload;
      const index = state.driveRecipes.findIndex(recipe => recipe.id === id);
      if (index !== -1) {
        state.driveRecipes[index] = { ...state.driveRecipes[index], ...updatedData };
      }
    },
    removeDriveRecipe: (state, action) => {
      state.driveRecipes = state.driveRecipes.filter(recipe => recipe.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setEditingEnabled: (state, action) => {
      state.editingEnabled = action.payload;
    },
  },
});

export const { 
  setIsPrintMode, 
  setFontSize, 
  setDraftRecipe, 
  clearDraftRecipe, 
  addChatMessage, 
  clearChatMessages,
  updateDraftRecipe,
  setGoogleDriveConnection,
  setUserInfo,
  setDriveRecipes,
  addDriveRecipe,
  updateDriveRecipe,
  removeDriveRecipe,
  setLoading,
  setError,
  clearError,
  setEditingEnabled
} = recipesSlice.actions;

export default recipesSlice.reducer;