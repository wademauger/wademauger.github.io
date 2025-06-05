import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pinnedChords: [],
  currentInstrument: 'ukulele',
  transposeBy: {}, // song.title -> semitone offset
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
      const songTitle = action.payload;
      if (!state.transposeBy[songTitle]) state.transposeBy[songTitle] = 0;
      state.transposeBy[songTitle] += 1;
    },
    transposeSongDown: (state, action) => {
      const songTitle = action.payload;
      if (!state.transposeBy[songTitle]) state.transposeBy[songTitle] = 0;
      state.transposeBy[songTitle] -= 1;
    },
    setTranspose: (state, action) => {
      const { songTitle, value } = action.payload;
      state.transposeBy[songTitle] = value;
    },
  },
});

export const { pinChord, unpinChord, clearPinnedChords, setInstrument, transposeSongUp, transposeSongDown, setTranspose } = chordsSlice.actions;
export default chordsSlice.reducer;
