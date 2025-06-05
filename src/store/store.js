import { configureStore } from '@reduxjs/toolkit';
import chordsReducer from './chordsSlice';
import songsReducer from './songsSlice';

export const store = configureStore({
  reducer: {
    chords: chordsReducer,
    songs: songsReducer,
  },
});

export default store;
