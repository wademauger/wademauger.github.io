import { configureStore } from '@reduxjs/toolkit';
import chordsReducer from './chordsSlice';

export const store = configureStore({
  reducer: {
    chords: chordsReducer,
  },
});

export default store;
