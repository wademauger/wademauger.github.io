import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPrintMode: false,
  fontSize: 16, 
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setIsPrintMode: (state, action) => {
      state.isPrintMode = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
  },
});

export const { setIsPrintMode, setFontSize } = recipesSlice.actions;

export default recipesSlice.reducer;