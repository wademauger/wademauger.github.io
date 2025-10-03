import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // simple event queue for app-level header actions if needed
  lastEvent: null
};

const uiEvents = createSlice({
  name: 'uiEvents',
  initialState,
  reducers: {
    emitEvent: (state, action) => {
      state.lastEvent = action.payload;
    },
    clearEvent: (state) => {
      state.lastEvent = null;
    }
  }
});

export const { emitEvent, clearEvent } = uiEvents.actions;
export default uiEvents.reducer;
