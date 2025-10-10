import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const PREFS_KEY = 'app:preferences';

export interface PreferencesState {
  showDemoData: boolean;
}

const defaultState: PreferencesState = {
  showDemoData: false
};

export const initPreferencesFromStorage = () => async (dispatch: any) => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const parsed = raw ? JSON.parse(raw) : defaultState;
    dispatch(setShowDemoData(!!parsed.showDemoData));
  } catch {
    dispatch(setShowDemoData(defaultState.showDemoData));
  }
};

export const setShowDemoDataAndPersist = (value: boolean) => (dispatch: any, getState: any) => {
  try {
    const current: PreferencesState = (getState() && getState().preferences) || defaultState;
    const next: PreferencesState = { ...current, showDemoData: value };
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    // non-fatal
  }
  dispatch(setShowDemoData(value));
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: defaultState as PreferencesState,
  reducers: {
    setShowDemoData(state: PreferencesState, action: PayloadAction<boolean>) {
      state.showDemoData = action.payload;
      try {
        const next: PreferencesState = { ...state };
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // non-fatal
      }
    }
  }
});

export const { setShowDemoData } = preferencesSlice.actions;
export default preferencesSlice.reducer;
