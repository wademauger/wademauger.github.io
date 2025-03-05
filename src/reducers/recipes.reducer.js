import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPrintMode: false,
  // Add other recipe-related state here if needed
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setIsPrintMode: (state, action) => {
      state.isPrintMode = action.payload;
    },
  },
});

export const { setIsPrintMode } = recipesSlice.actions;

export default recipesSlice.reducer;