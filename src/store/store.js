import { configureStore } from '@reduxjs/toolkit';
import chordsReducer from './chordsSlice';
import songsReducer from './songsSlice';
import knittingDesignReducer from './knittingDesignSlice';
import colorworkGridReducer from '../apps/knitting-designer/store/colorworkGridSlice';
import recipesReducer from '../reducers/recipes.reducer';

export const store = configureStore({
  reducer: {
    chords: chordsReducer,
    songs: songsReducer,
    knittingDesign: knittingDesignReducer,
    colorworkGrid: colorworkGridReducer,
    recipes: recipesReducer,
  },
});

export default store;
