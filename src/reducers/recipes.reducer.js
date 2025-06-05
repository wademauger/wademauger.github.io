import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPrintMode: false,
  printModeFontSize: 20, 
};

const recipesSlice = createSlice({
  initialState,
  reducers: {
    setIsPrintMode: (state, action) => {
      state.isPrintMode = action.payload;
    },
    setFontSize: (state, action) => {
      state.printModeFontSize = action.payload;
    },
  },
});

export const { setIsPrintMode, setFontSize } = recipesSlice.actions;

export default recipesSlice.reducer;