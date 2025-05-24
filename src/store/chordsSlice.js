import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pinnedChords: [],
  currentInstrument: 'ukulele',
  transposeBy: {}, // song.id -> semitone offset
};

const chordsSlice = createSlice({
  name: 'chords',
  initialState,
  reducers: {
    pinChord: (state, action) => {
      const chord = action.payload;
      if (!state.pinnedChords.includes(chord)) {
        state.pinnedChords.push(chord);
      }
    },
    unpinChord: (state, action) => {
      const chord = action.payload;
      state.pinnedChords = state.pinnedChords.filter(c => c !== chord);
    },
    clearPinnedChords: (state) => {
      state.pinnedChords = [];
    },
    setInstrument: (state, action) => {
      state.currentInstrument = action.payload;
    },
    transposeSongUp: (state, action) => {
      const songId = action.payload;
      if (!state.transposeBy[songId]) state.transposeBy[songId] = 0;
      state.transposeBy[songId] += 1;
    },
    transposeSongDown: (state, action) => {
      const songId = action.payload;
      if (!state.transposeBy[songId]) state.transposeBy[songId] = 0;
      state.transposeBy[songId] -= 1;
    },
    setTranspose: (state, action) => {
      const { songId, value } = action.payload;
      state.transposeBy[songId] = value;
    },
  },
});

export const { pinChord, unpinChord, clearPinnedChords, setInstrument, transposeSongUp, transposeSongDown, setTranspose } = chordsSlice.actions;
export default chordsSlice.reducer;
