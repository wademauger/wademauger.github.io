import { configureStore } from '@reduxjs/toolkit';
import recipesReducer from './reducers/recipes.reducer';

const store = configureStore({
  reducer: {
    recipes: recipesReducer,
  },
});

export default store;