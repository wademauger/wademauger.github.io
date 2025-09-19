import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import knittingDesignReducer from './store/knittingDesignSlice';
import recipesReducer from './reducers/recipes.reducer';
import chordsReducer from './store/chordsSlice';
import songsReducer from './store/songsSlice';
import colorworkGridReducer from './apps/knitting-designer/store/colorworkGridSlice';

const store = configureStore({
  reducer: {
    knittingDesign: knittingDesignReducer,
    recipes: recipesReducer,
    chords: chordsReducer,
    songs: songsReducer,
    colorworkGrid: colorworkGridReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;