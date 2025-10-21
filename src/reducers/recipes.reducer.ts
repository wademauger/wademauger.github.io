import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, UserInfo } from '../types';

interface ChatMessage {
  role: string;
  content: string;
}

interface RecipesState {
  isPrintMode: boolean;
  printModeFontSize: number;
  draftRecipe: Recipe | null;
  chatMessages: ChatMessage[];
  isGoogleDriveConnected: boolean;
  userInfo: UserInfo | null;
  driveRecipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  editingEnabled: boolean;
}

const initialState: RecipesState = {
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
  editingEnabled: false
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setIsPrintMode: (state: RecipesState, action: PayloadAction<boolean>) => {
      state.isPrintMode = action.payload;
    },
    setFontSize: (state: RecipesState, action: PayloadAction<number>) => {
      state.printModeFontSize = action.payload;
    },
    setDraftRecipe: (state: RecipesState, action: PayloadAction<Recipe | null>) => {
      state.draftRecipe = action.payload;
    },
    clearDraftRecipe: (state: RecipesState) => {
      state.draftRecipe = null;
    },
    addChatMessage: (state: RecipesState, action: PayloadAction<ChatMessage>) => {
      state.chatMessages.push(action.payload);
    },
    clearChatMessages: (state: RecipesState) => {
      state.chatMessages = [];
    },
    updateDraftRecipe: (state: RecipesState, action: PayloadAction<Recipe>) => {
      state.draftRecipe = action.payload;
    },
    // Google Drive actions
    setGoogleDriveConnection: (state: RecipesState, action: PayloadAction<boolean>) => {
      state.isGoogleDriveConnected = action.payload;
    },
    setUserInfo: (state: RecipesState, action: PayloadAction<UserInfo | null>) => {
      state.userInfo = action.payload;
    },
    setDriveRecipes: (state: RecipesState, action: PayloadAction<Recipe[]>) => {
      state.driveRecipes = action.payload;
    },
    addDriveRecipe: (state: RecipesState, action: PayloadAction<Recipe>) => {
      state.driveRecipes.push(action.payload);
    },
    updateDriveRecipe: (state: RecipesState, action: PayloadAction<Partial<Recipe> & { id: string }>) => {
      const { id, ...updatedData } = action.payload;
      const index = state.driveRecipes.findIndex((recipe: Recipe & { id?: string }) => recipe.id === id);
      if (index !== -1) {
        state.driveRecipes[index] = { ...state.driveRecipes[index], ...updatedData };
      }
    },
    removeDriveRecipe: (state: RecipesState, action: PayloadAction<string>) => {
      state.driveRecipes = state.driveRecipes.filter((recipe: Recipe & { id?: string }) => recipe.id !== action.payload);
    },
    setLoading: (state: RecipesState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state: RecipesState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state: RecipesState) => {
      state.error = null;
    },
    setEditingEnabled: (state: RecipesState, action: PayloadAction<boolean>) => {
      state.editingEnabled = action.payload;
    }
  }
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