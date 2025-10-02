import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pinnedChords: [],
  currentInstrument: 'ukulele',
  transposeBy: {}, // song.title -> semitone offset
  // New state for alternative chord fingerings: 
  // { "C": 0, "Am": 1 } means C uses fingering 0 (default), Am uses fingering 1 (first alternative)
  chordFingerings: {}
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
      state.pinnedChords = state.pinnedChords.filter((c: any) => c !== chord);
    },
    clearPinnedChords: (state) => {
      state.pinnedChords = [];
    },
    setInstrument: (state, action) => {
      state.currentInstrument = action.payload;
      // Clear chord fingerings when instrument changes since different instruments have different alternatives
      state.chordFingerings = {};
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
    // New action to cycle chord fingering to next alternative
    cycleChordFingering: (state, action) => {
      const chord = action.payload;
      const currentIndex = state.chordFingerings[chord] || 0;
      // Will increment and wrap around - the component will handle max checking
      state.chordFingerings[chord] = currentIndex + 1;
    },
    // New action to set specific chord fingering index
    setChordFingering: (state, action) => {
      const { chord, fingeringIndex } = action.payload;
      state.chordFingerings[chord] = fingeringIndex;
    },
    // New action to load fingerings from Google Drive save data
    loadChordFingerings: (state, action) => {
      state.chordFingerings = action.payload || {};
    }
  }
});

export const { 
  pinChord, 
  unpinChord, 
  clearPinnedChords, 
  setInstrument, 
  transposeSongUp, 
  transposeSongDown, 
  setTranspose,
  cycleChordFingering,
  setChordFingering,
  loadChordFingerings
} = chordsSlice.actions;
export default chordsSlice.reducer;
