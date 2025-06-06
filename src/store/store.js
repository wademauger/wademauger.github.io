import { configureStore } from '@reduxjs/toolkit';
import chordsReducer from './chordsSlice';
import songsReducer from './songsSlice';
import knittingDesignReducer from './knittingDesignSlice';
import recipesReducer from '../reducers/recipes.reducer';

export const store = configureStore({
  reducer: {
    chords: chordsReducer,
    songs: songsReducer,
    knittingDesign: knittingDesignReducer,
    recipes: recipesReducer,
  },
});

export default store;
