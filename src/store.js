import { configureStore } from '@reduxjs/toolkit';
import knittingDesignReducer from './store/knittingDesignSlice';
import recipesReducer from './reducers/recipes.reducer';

const store = configureStore({
  reducer: {
    knittingDesign: knittingDesignReducer,
    recipes: recipesReducer,
  },
});

export default store;