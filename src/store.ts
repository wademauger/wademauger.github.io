import { configureStore } from '@reduxjs/toolkit';
import knittingDesignReducer from './store/knittingDesignSlice';
import recipesReducer from './reducers/recipes.reducer';
import chordsReducer from './store/chordsSlice';
import songsReducer from './store/songsSlice';
import colorworkGridReducer from './apps/knitting-designer/store/colorworkGridSlice';
import modalReducer from './reducers/modal.reducer';
import authReducer from './store/authSlice';
import libraryReducer from './store/librarySlice';
import uiEventsReducer from './store/uiEventsSlice';
import { initLibraryFromStorage } from './store/librarySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    knittingDesign: knittingDesignReducer,
    recipes: recipesReducer,
    chords: chordsReducer,
    songs: songsReducer,
    colorworkGrid: colorworkGridReducer,
    library: libraryReducer,
    modal: modalReducer,
    uiEvents: uiEventsReducer
  }
});

// Dev middleware: log actions that touch the songs library so we can trace UI sync issues
if (process.env.NODE_ENV !== 'production') {
  const originalDispatch = store.dispatch;
  store.dispatch = (action: any) => {
    try {
      // Log action type and, after dispatch, the resulting songs.library.artist count
      // eslint-disable-next-line no-console
      console.log('🛡️ dispatching action:', action && action.type ? action.type : action);
    } catch (e) {}
    const result = originalDispatch(action);
    try {
      // Defer reading state to handle thunks returning promises
      setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log('🛡️ resulting songs.artists=', (store.getState().songs?.library?.artists || []).length);
      }, 0);
    } catch (e) {}
    return result;
  };
}

// Initialize library selection from persisted localStorage value (if present)
// This will populate state.library.selectedFile so dialogs know a library is configured
try {
  // dispatch the init thunk; store.dispatch is typed to accept thunks from configureStore
  store.dispatch(initLibraryFromStorage());
} catch (err) {
  // swallow errors during startup initialization to avoid breaking app load
  // (errors will be surfaced when user interacts with library features)
  // eslint-disable-next-line no-console
  console.warn('Failed to initialize library from storage', err);
}

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;