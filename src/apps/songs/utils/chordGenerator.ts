// Dynamic chord generation utilities
// This provides fallback chord generation when static data is not available

// Note mapping for semitone calculations
const noteToSemitone = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

const semitoneToNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Chord intervals (semitones from root)
const chordIntervals = {
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'm': [0, 3, 7],
  'min': [0, 3, 7],
  '7': [0, 4, 7, 10],
  'maj7': [0, 4, 7, 11],
  'm7': [0, 3, 7, 10],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  '6': [0, 4, 7, 9],
  'm6': [0, 3, 7, 9],
  '9': [0, 4, 7, 10, 14],
  'm9': [0, 3, 7, 10, 14],
  'add9': [0, 4, 7, 14],
  'madd9': [0, 3, 7, 14]
};

// Parse chord symbol to extract root, quality, and bass note
export function parseChord(chordSymbol) {
  // Handle slash chords
  const parts = chordSymbol.split('/');
  const mainChord = parts[0];
  const bassNote = parts[1] || null;
  
  // Extract root note and chord quality
  const rootMatch = mainChord.match(/^([A-G][#b]?)/);
  if (!rootMatch) return null;
  
  const root = rootMatch[1];
  const quality = mainChord.slice(root.length) || 'major';
  
  return { root, quality, bassNote };
}

// Generate chord notes from chord symbol
export function getChordNotes(chordSymbol) {
  const parsed = parseChord(chordSymbol);
  if (!parsed) return null;
  
  const { root, quality, bassNote } = parsed;
  const rootSemitone = noteToSemitone[root];
  const intervals = chordIntervals[quality] || chordIntervals['major'];
  
  // Generate chord tones
  const chordNotes = intervals.map((interval: any) => {
    const semitone = (rootSemitone + interval) % 12;
    return semitoneToNote[semitone];
  });
  
  // If there's a bass note, put it first
  if (bassNote) {
    // Remove bass note from chord if it's already there
    const filteredNotes = chordNotes.filter((note: any) => note !== bassNote);
    return [bassNote, ...filteredNotes];
  }
  
  return chordNotes;
}

// Generate a basic chord fingering for guitar (6 strings)
export function generateGuitarChord(chordSymbol) {
  const notes = getChordNotes(chordSymbol);
  if (!notes) return null;
  
  // Standard guitar tuning: E-A-D-G-B-E (low to high)
  const tuning = ['E', 'A', 'D', 'G', 'B', 'E'];
  const tuningSemitones = tuning.map((note: any) => noteToSemitone[note]);
  const targetSemitones = notes.map((note: any) => noteToSemitone[note]);
  
  // Simple algorithm: find the lowest fret position that contains all chord tones
  const frets = new Array(6).fill(-1); // Start with all muted
  
  // For each string, find the closest chord tone within first 5 frets
  for (let string = 0; string < 6; string++) {
    for (let fret = 0; fret <= 5; fret++) {
      const noteSemitone = (tuningSemitones[string] + fret) % 12;
      if (targetSemitones.includes(noteSemitone)) {
        frets[string] = fret;
        break;
      }
    }
  }
  
  // Generate basic fingering (could be improved with more sophisticated logic)
  const fingers = frets.map((fret) => {
    if (fret === -1 || fret === 0) return 0;
    return Math.min(fret, 4); // Simple finger assignment
  });
  
  return {
    frets,
    fingers,
    description: `Generated ${chordSymbol} chord`,
    generated: true // Flag to indicate this is dynamically generated
  };
}

// Generate a basic chord fingering for ukulele (4 strings)
export function generateUkuleleChord(chordSymbol) {
  const notes = getChordNotes(chordSymbol);
  if (!notes) return null;
  
  // Standard ukulele tuning: G-C-E-A (low to high)
  const tuning = ['G', 'C', 'E', 'A'];
  const tuningSemitones = tuning.map((note: any) => noteToSemitone[note]);
  const targetSemitones = notes.map((note: any) => noteToSemitone[note]);
  
  const frets = new Array(4).fill(-1);
  
  // For each string, find the closest chord tone within first 5 frets
  for (let string = 0; string < 4; string++) {
    for (let fret = 0; fret <= 5; fret++) {
      const noteSemitone = (tuningSemitones[string] + fret) % 12;
      if (targetSemitones.includes(noteSemitone)) {
        frets[string] = fret;
        break;
      }
    }
  }
  
  const fingers = frets.map((fret) => {
    if (fret === -1 || fret === 0) return 0;
    return Math.min(fret, 4);
  });
  
  return {
    frets,
    fingers,
    description: `Generated ${chordSymbol} chord`,
    generated: true
  };
}

// Generate basic chord fingering for bass guitar (4 strings)
export function generateBassGuitarChord(chordSymbol) {
  const notes = getChordNotes(chordSymbol);
  if (!notes) return null;
  
  // Standard bass tuning: E-A-D-G (low to high)
  const tuning = ['E', 'A', 'D', 'G'];
  const tuningSemitones = tuning.map((note: any) => noteToSemitone[note]);
  const targetSemitones = notes.map((note: any) => noteToSemitone[note]);
  
  const frets = new Array(4).fill(-1);
  
  // For bass, prioritize the root and bass note
  for (let string = 0; string < 4; string++) {
    for (let fret = 0; fret <= 5; fret++) {
      const noteSemitone = (tuningSemitones[string] + fret) % 12;
      if (targetSemitones.includes(noteSemitone)) {
        frets[string] = fret;
        break;
      }
    }
  }
  
  const fingers = frets.map((fret) => {
    if (fret === -1 || fret === 0) return 0;
    return Math.min(fret, 4);
  });
  
  return {
    frets,
    fingers,
    description: `Generated ${chordSymbol} chord`,
    generated: true
  };
}

// Generate piano chord (note list)
export function generatePianoChord(chordSymbol) {
  const notes = getChordNotes(chordSymbol);
  if (!notes) return null;
  
  // For piano, just return the notes in a suitable voicing
  return notes.length >= 3 ? notes.slice(0, 4) : notes; // Limit to 4 notes for readability
}

// Main generator function that dispatches to instrument-specific generators
export function generateChord(chordSymbol, instrument) {
  switch (instrument) {
    case 'guitar':
      return generateGuitarChord(chordSymbol);
    case 'ukulele':
    case 'baritoneUkulele':
      return generateUkuleleChord(chordSymbol);
    case 'bassGuitar':
    case 'bassUkulele':
      return generateBassGuitarChord(chordSymbol);
    case 'piano':
      return generatePianoChord(chordSymbol);
    default:
      return null;
  }
}
