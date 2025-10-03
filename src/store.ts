import { configureStore } from '@reduxjs/toolkit';
import knittingDesignReducer from './store/knittingDesignSlice';
import recipesReducer from './reducers/recipes.reducer';
import chordsReducer from './store/chordsSlice';
import songsReducer from './store/songsSlice';
import colorworkGridReducer from './apps/knitting-designer/store/colorworkGridSlice';
import modalReducer from './reducers/modal.reducer';

const store = configureStore({
  reducer: {
    knittingDesign: knittingDesignReducer,
    recipes: recipesReducer,
    chords: chordsReducer,
    songs: songsReducer,
    colorworkGrid: colorworkGridReducer,
    modal: modalReducer
  }
});

export default store;