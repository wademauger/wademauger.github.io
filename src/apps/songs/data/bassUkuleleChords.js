// Bass Ukulele chords (4 strings): -1 = muted, 0 = open, >0 = fret number
export const bassUkuleleChords = {
  // Major chords (triads, root position)
  'C': { 
    frets: [3, 3, 2, 1], 
    fingers: [3, 4, 2, 1],
    inversions: [
      { frets: [8, 10, 10, 8], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [0, 1, 3, 1], fingers: [0, 1, 3, 2], description: "Second inversion" }
    ]
  },
  'C#': { 
    frets: [4, 4, 3, 2], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [9, 11, 11, 9], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [1, 2, 4, 2], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'Db': { 
    frets: [4, 4, 3, 2], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [9, 11, 11, 9], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [1, 2, 4, 2], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'D': { 
    frets: [5, 5, 4, 3], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [10, 0, 0, 10], fingers: [1, 0, 0, 2], description: "First inversion" },
      { frets: [2, 3, 5, 3], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'D#': { 
    frets: [6, 6, 5, 4], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [11, 1, 1, 11], fingers: [1, 2, 3, 4], description: "First inversion" },
      { frets: [3, 4, 6, 4], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'Eb': { 
    frets: [6, 6, 5, 4], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [11, 1, 1, 11], fingers: [1, 2, 3, 4], description: "First inversion" },
      { frets: [3, 4, 6, 4], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'E': { 
    frets: [7, 7, 6, 5], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [0, 2, 2, 0], fingers: [0, 1, 2, 0], description: "First inversion" },
      { frets: [4, 5, 7, 5], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'F': { 
    frets: [8, 8, 7, 6], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [1, 3, 3, 1], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [5, 6, 8, 6], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'F#': { 
    frets: [9, 9, 8, 7], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [2, 4, 4, 2], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [6, 7, 9, 7], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'Gb': { 
    frets: [9, 9, 8, 7], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [2, 4, 4, 2], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [6, 7, 9, 7], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'G': { 
    frets: [10, 10, 9, 8], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [3, 5, 5, 3], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [7, 8, 10, 8], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'G#': { 
    frets: [11, 11, 10, 9], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [4, 6, 6, 4], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [8, 9, 11, 9], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'Ab': { 
    frets: [11, 11, 10, 9], 
    fingers: [4, 4, 2, 1],
    inversions: [
      { frets: [4, 6, 6, 4], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [8, 9, 11, 9], fingers: [1, 2, 4, 3], description: "Second inversion" }
    ]
  },
  'A': { 
    frets: [0, 0, 2, 2], 
    fingers: [0, 0, 1, 2],
    inversions: [
      { frets: [5, 7, 7, 5], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [9, 10, 0, 10], fingers: [2, 3, 0, 4], description: "Second inversion" }
    ]
  },
  'A#': { 
    frets: [1, 1, 3, 3], 
    fingers: [1, 1, 3, 4],
    inversions: [
      { frets: [6, 8, 8, 6], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [10, 11, 1, 11], fingers: [2, 3, 1, 4], description: "Second inversion" }
    ]
  },
  'Bb': { 
    frets: [1, 1, 3, 3], 
    fingers: [1, 1, 3, 4],
    inversions: [
      { frets: [6, 8, 8, 6], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [10, 11, 1, 11], fingers: [2, 3, 1, 4], description: "Second inversion" }
    ]
  },
  'B': { 
    frets: [2, 2, 4, 4], 
    fingers: [1, 1, 3, 4],
    inversions: [
      { frets: [7, 9, 9, 7], fingers: [1, 3, 4, 2], description: "First inversion" },
      { frets: [11, 0, 2, 0], fingers: [3, 0, 1, 0], description: "Second inversion" }
    ]
  },
  // Minor chords (triads, root position)
  'Cm': { frets: [3, 1, 1, 1], fingers: [3, 1, 1, 1] },
  'C#m': { frets: [4, 2, 2, 2], fingers: [4, 2, 2, 2] },
  'Dbm': { frets: [4, 2, 2, 2], fingers: [4, 2, 2, 2] },
  'Dm': { frets: [5, 3, 3, 3], fingers: [4, 2, 2, 2] },
  'D#m': { frets: [6, 4, 4, 4], fingers: [4, 2, 2, 2] },
  'Ebm': { frets: [6, 4, 4, 4], fingers: [4, 2, 2, 2] },
  'Em': { frets: [7, 5, 5, 5], fingers: [4, 2, 2, 2] },
  'Fm': { frets: [8, 6, 6, 6], fingers: [4, 2, 2, 2] },
  'F#m': { frets: [9, 7, 7, 7], fingers: [4, 2, 2, 2] },
  'Gbm': { frets: [9, 7, 7, 7], fingers: [4, 2, 2, 2] },
  'Gm': { frets: [10, 8, 8, 8], fingers: [4, 2, 2, 2] },
  'G#m': { frets: [11, 9, 9, 9], fingers: [4, 2, 2, 2] },
  'Abm': { frets: [11, 9, 9, 9], fingers: [4, 2, 2, 2] },
  'Am': { frets: [0, 0, 1, 2], fingers: [0, 0, 1, 2] },
  'A#m': { frets: [1, 1, 2, 3], fingers: [1, 1, 2, 3] },
  'Bbm': { frets: [1, 1, 2, 3], fingers: [1, 1, 2, 3] },
  'Bm': { frets: [2, 2, 3, 4], fingers: [1, 1, 2, 3] },
  // 7th chords
  'C7': { frets: [3, 1, 3, 1], fingers: [3, 1, 4, 1] },
  'C#7': { frets: [4, 2, 4, 2], fingers: [4, 2, 4, 2] },
  'Db7': { frets: [4, 2, 4, 2], fingers: [4, 2, 4, 2] },
  'D7': { frets: [5, 3, 5, 3], fingers: [4, 2, 4, 2] },
  'D#7': { frets: [6, 4, 6, 4], fingers: [4, 2, 4, 2] },
  'Eb7': { frets: [6, 4, 6, 4], fingers: [4, 2, 4, 2] },
  'E7': { frets: [7, 5, 7, 5], fingers: [4, 2, 4, 2] },
  'F7': { frets: [8, 6, 8, 6], fingers: [4, 2, 4, 2] },
  'F#7': { frets: [9, 7, 9, 7], fingers: [4, 2, 4, 2] },
  'Gb7': { frets: [9, 7, 9, 7], fingers: [4, 2, 4, 2] },
  'G7': { frets: [10, 8, 10, 8], fingers: [4, 2, 4, 2] },
  'G#7': { frets: [11, 9, 11, 9], fingers: [4, 2, 4, 2] },
  'Ab7': { frets: [11, 9, 11, 9], fingers: [4, 2, 4, 2] },
  'A7': { frets: [0, 0, 2, 0], fingers: [0, 0, 1, 0] },
  'A#7': { frets: [1, 1, 3, 1], fingers: [1, 1, 3, 1] },
  'Bb7': { frets: [1, 1, 3, 1], fingers: [1, 1, 3, 1] },
  'B7': { frets: [2, 2, 4, 2], fingers: [1, 1, 3, 1] },
  // Major 7th chords
  'Cmaj7': { frets: [3, 2, 1, 0], fingers: [3, 2, 1, 0] },
  'C#maj7': { frets: [4, 3, 2, 1], fingers: [4, 3, 2, 1] },
  'Dbmaj7': { frets: [4, 3, 2, 1], fingers: [4, 3, 2, 1] },
  'Dmaj7': { frets: [5, 4, 3, 2], fingers: [4, 3, 2, 1] },
  'D#maj7': { frets: [6, 5, 4, 3], fingers: [4, 3, 2, 1] },
  'Ebmaj7': { frets: [6, 5, 4, 3], fingers: [4, 3, 2, 1] },
  'Emaj7': { frets: [7, 6, 5, 4], fingers: [4, 3, 2, 1] },
  'Fmaj7': { frets: [8, 7, 6, 5], fingers: [4, 3, 2, 1] },
  'F#maj7': { frets: [9, 8, 7, 6], fingers: [4, 3, 2, 1] },
  'Gbmaj7': { frets: [9, 8, 7, 6], fingers: [4, 3, 2, 1] },
  'Gmaj7': { frets: [10, 9, 8, 7], fingers: [4, 3, 2, 1] },
  'G#maj7': { frets: [11, 10, 9, 8], fingers: [4, 3, 2, 1] },
  'Abmaj7': { frets: [11, 10, 9, 8], fingers: [4, 3, 2, 1] },
  'Amaj7': { frets: [0, 0, 1, 1], fingers: [0, 0, 1, 1] },
  'A#maj7': { frets: [1, 1, 2, 2], fingers: [1, 1, 2, 2] },
  'Bbmaj7': { frets: [1, 1, 2, 2], fingers: [1, 1, 2, 2] },
  'Bmaj7': { frets: [2, 2, 3, 3], fingers: [1, 1, 2, 2] },
  // Minor 7th chords
  'Cm7': { frets: [3, 1, 1, 1], fingers: [3, 1, 1, 1] },
  'C#m7': { frets: [4, 2, 2, 2], fingers: [4, 2, 2, 2] },
  'Dbm7': { frets: [4, 2, 2, 2], fingers: [4, 2, 2, 2] },
  'Dm7': { frets: [5, 3, 3, 3], fingers: [4, 2, 2, 2] },
  'D#m7': { frets: [6, 4, 4, 4], fingers: [4, 2, 2, 2] },
  'Ebm7': { frets: [6, 4, 4, 4], fingers: [4, 2, 2, 2] },
  'Em7': { frets: [7, 5, 5, 5], fingers: [4, 2, 2, 2] },
  'Fm7': { frets: [8, 6, 6, 6], fingers: [4, 2, 2, 2] },
  'F#m7': { frets: [9, 7, 7, 7], fingers: [4, 2, 2, 2] },
  'Gbm7': { frets: [9, 7, 7, 7], fingers: [4, 2, 2, 2] },
  'Gm7': { frets: [10, 8, 8, 8], fingers: [4, 2, 2, 2] },
  'G#m7': { frets: [11, 9, 9, 9], fingers: [4, 2, 2, 2] },
  'Abm7': { frets: [11, 9, 9, 9], fingers: [4, 2, 2, 2] },
  'Am7': { frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] },
  'A#m7': { frets: [1, 1, 2, 1], fingers: [1, 1, 2, 1] },
  'Bbm7': { frets: [1, 1, 2, 1], fingers: [1, 1, 2, 1] },
  'Bm7': { frets: [2, 2, 3, 2], fingers: [1, 1, 2, 1] },

  // Power chords (5th chords) - root and fifth
  'C5': { frets: [3, -1, -1, 1], fingers: [3, 0, 0, 1] },
  'C#5': { frets: [4, -1, -1, 2], fingers: [3, 0, 0, 1] },
  'Db5': { frets: [4, -1, -1, 2], fingers: [3, 0, 0, 1] },
  'D5': { frets: [5, -1, -1, 3], fingers: [3, 0, 0, 1] },
  'D#5': { frets: [6, -1, -1, 4], fingers: [3, 0, 0, 1] },
  'Eb5': { frets: [6, -1, -1, 4], fingers: [3, 0, 0, 1] },
  'E5': { frets: [7, -1, -1, 5], fingers: [3, 0, 0, 1] },
  'F5': { frets: [8, -1, -1, 6], fingers: [3, 0, 0, 1] },
  'F#5': { frets: [9, -1, -1, 7], fingers: [3, 0, 0, 1] },
  'Gb5': { frets: [9, -1, -1, 7], fingers: [3, 0, 0, 1] },
  'G5': { frets: [10, -1, -1, 8], fingers: [3, 0, 0, 1] },
  'G#5': { frets: [11, -1, -1, 9], fingers: [3, 0, 0, 1] },
  'Ab5': { frets: [11, -1, -1, 9], fingers: [3, 0, 0, 1] },
  'A5': { frets: [0, -1, -1, 2], fingers: [0, 0, 0, 1] },
  'A#5': { frets: [1, -1, -1, 3], fingers: [1, 0, 0, 2] },
  'Bb5': { frets: [1, -1, -1, 3], fingers: [1, 0, 0, 2] },
  'B5': { frets: [2, -1, -1, 4], fingers: [1, 0, 0, 2] },

  // Sixth chords (6th chords) - root, third, fifth, sixth
  'C6': { frets: [3, 0, 2, 0], fingers: [3, 0, 2, 0] },
  'C#6': { frets: [4, 1, 3, 1], fingers: [3, 1, 4, 2] },
  'Db6': { frets: [4, 1, 3, 1], fingers: [3, 1, 4, 2] },
  'D6': { frets: [5, 2, 4, 2], fingers: [3, 1, 4, 2] },
  'D#6': { frets: [6, 3, 5, 3], fingers: [3, 1, 4, 2] },
  'Eb6': { frets: [6, 3, 5, 3], fingers: [3, 1, 4, 2] },
  'E6': { frets: [7, 4, 6, 4], fingers: [3, 1, 4, 2] },
  'F6': { frets: [8, 5, 7, 5], fingers: [3, 1, 4, 2] },
  'F#6': { frets: [9, 6, 8, 6], fingers: [3, 1, 4, 2] },
  'Gb6': { frets: [9, 6, 8, 6], fingers: [3, 1, 4, 2] },
  'G6': { frets: [10, 7, 9, 7], fingers: [3, 1, 4, 2] },
  'G#6': { frets: [11, 8, 10, 8], fingers: [3, 1, 4, 2] },
  'Ab6': { frets: [11, 8, 10, 8], fingers: [3, 1, 4, 2] },
  'A6': { frets: [0, 2, 2, 2], fingers: [0, 1, 2, 3] },
  'A#6': { frets: [1, 3, 3, 3], fingers: [1, 2, 3, 4] },
  'Bb6': { frets: [1, 3, 3, 3], fingers: [1, 2, 3, 4] },
  'B6': { frets: [2, 4, 4, 4], fingers: [1, 2, 3, 4] },

  // Minor 6th chords
  'Cm6': { frets: [3, 0, 1, 0], fingers: [3, 0, 1, 0] },
  'C#m6': { frets: [4, 1, 2, 1], fingers: [3, 1, 2, 4] },
  'Dbm6': { frets: [4, 1, 2, 1], fingers: [3, 1, 2, 4] },
  'Dm6': { frets: [5, 2, 3, 2], fingers: [3, 1, 2, 4] },
  'D#m6': { frets: [6, 3, 4, 3], fingers: [3, 1, 2, 4] },
  'Ebm6': { frets: [6, 3, 4, 3], fingers: [3, 1, 2, 4] },
  'Em6': { frets: [7, 4, 5, 4], fingers: [3, 1, 2, 4] },
  'Fm6': { frets: [8, 5, 6, 5], fingers: [3, 1, 2, 4] },
  'F#m6': { frets: [9, 6, 7, 6], fingers: [3, 1, 2, 4] },
  'Gbm6': { frets: [9, 6, 7, 6], fingers: [3, 1, 2, 4] },
  'Gm6': { frets: [10, 7, 8, 7], fingers: [3, 1, 2, 4] },
  'G#m6': { frets: [11, 8, 9, 8], fingers: [3, 1, 2, 4] },
  'Abm6': { frets: [11, 8, 9, 8], fingers: [3, 1, 2, 4] },
  'Am6': { frets: [0, 0, 1, 2], fingers: [0, 0, 1, 2] },
  'A#m6': { frets: [1, 1, 2, 3], fingers: [1, 1, 2, 3] },
  'Bbm6': { frets: [1, 1, 2, 3], fingers: [1, 1, 2, 3] },
  'Bm6': { frets: [2, 2, 3, 4], fingers: [1, 1, 2, 3] },

  // Add9 chords (major triad + 9th interval)
  'Cadd9': { frets: [3, 3, 2, 3], fingers: [2, 3, 1, 4] },
  'C#add9': { frets: [4, 4, 3, 4], fingers: [2, 3, 1, 4] },
  'Dbadd9': { frets: [4, 4, 3, 4], fingers: [2, 3, 1, 4] },
  'Dadd9': { frets: [5, 5, 4, 5], fingers: [2, 3, 1, 4] },
  'D#add9': { frets: [6, 6, 5, 6], fingers: [2, 3, 1, 4] },
  'Ebadd9': { frets: [6, 6, 5, 6], fingers: [2, 3, 1, 4] },
  'Eadd9': { frets: [7, 7, 6, 7], fingers: [2, 3, 1, 4] },
  'Fadd9': { frets: [8, 8, 7, 8], fingers: [2, 3, 1, 4] },
  'F#add9': { frets: [9, 9, 8, 9], fingers: [2, 3, 1, 4] },
  'Gbadd9': { frets: [9, 9, 8, 9], fingers: [2, 3, 1, 4] },
  'Gadd9': { frets: [10, 10, 9, 10], fingers: [2, 3, 1, 4] },
  'G#add9': { frets: [11, 11, 10, 11], fingers: [2, 3, 1, 4] },
  'Abadd9': { frets: [11, 11, 10, 11], fingers: [2, 3, 1, 4] },
  'Aadd9': { frets: [0, 0, 2, 0], fingers: [0, 0, 1, 0] },
  'A#add9': { frets: [1, 1, 3, 1], fingers: [1, 1, 3, 2] },
  'Bbadd9': { frets: [1, 1, 3, 1], fingers: [1, 1, 3, 2] },
  'Badd9': { frets: [2, 2, 4, 2], fingers: [1, 1, 3, 2] },

  // Sus2 chords (suspended 2nd - replace 3rd with 2nd)
  'Csus2': { frets: [3, 1, 3, 1], fingers: [3, 1, 4, 2] },
  'C#sus2': { frets: [4, 2, 4, 2], fingers: [3, 1, 4, 2] },
  'Dbsus2': { frets: [4, 2, 4, 2], fingers: [3, 1, 4, 2] },
  'Dsus2': { frets: [5, 3, 5, 3], fingers: [3, 1, 4, 2] },
  'D#sus2': { frets: [6, 4, 6, 4], fingers: [3, 1, 4, 2] },
  'Ebsus2': { frets: [6, 4, 6, 4], fingers: [3, 1, 4, 2] },
  'Esus2': { frets: [7, 5, 7, 5], fingers: [3, 1, 4, 2] },
  'Fsus2': { frets: [8, 6, 8, 6], fingers: [3, 1, 4, 2] },
  'F#sus2': { frets: [9, 7, 9, 7], fingers: [3, 1, 4, 2] },
  'Gbsus2': { frets: [9, 7, 9, 7], fingers: [3, 1, 4, 2] },
  'Gsus2': { frets: [10, 8, 10, 8], fingers: [3, 1, 4, 2] },
  'G#sus2': { frets: [11, 9, 11, 9], fingers: [3, 1, 4, 2] },
  'Absus2': { frets: [11, 9, 11, 9], fingers: [3, 1, 4, 2] },
  'Asus2': { frets: [0, 2, 0, 2], fingers: [0, 1, 0, 2] },
  'A#sus2': { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4] },
  'Bbsus2': { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4] },
  'Bsus2': { frets: [2, 4, 2, 4], fingers: [1, 3, 2, 4] },

  // Sus4 chords (suspended 4th - replace 3rd with 4th)
  'Csus4': { frets: [3, 4, 1, 1], fingers: [3, 4, 1, 2] },
  'C#sus4': { frets: [4, 5, 2, 2], fingers: [3, 4, 1, 2] },
  'Dbsus4': { frets: [4, 5, 2, 2], fingers: [3, 4, 1, 2] },
  'Dsus4': { frets: [5, 6, 3, 3], fingers: [3, 4, 1, 2] },
  'D#sus4': { frets: [6, 7, 4, 4], fingers: [3, 4, 1, 2] },
  'Ebsus4': { frets: [6, 7, 4, 4], fingers: [3, 4, 1, 2] },
  'Esus4': { frets: [7, 8, 5, 5], fingers: [3, 4, 1, 2] },
  'Fsus4': { frets: [8, 9, 6, 6], fingers: [3, 4, 1, 2] },
  'F#sus4': { frets: [9, 10, 7, 7], fingers: [3, 4, 1, 2] },
  'Gbsus4': { frets: [9, 10, 7, 7], fingers: [3, 4, 1, 2] },
  'Gsus4': { frets: [10, 11, 8, 8], fingers: [3, 4, 1, 2] },
  'G#sus4': { frets: [11, 0, 9, 9], fingers: [3, 0, 1, 2] },
  'Absus4': { frets: [11, 0, 9, 9], fingers: [3, 0, 1, 2] },
  'Asus4': { frets: [0, 3, 2, 2], fingers: [0, 3, 1, 2] },
  'A#sus4': { frets: [1, 4, 3, 3], fingers: [1, 4, 2, 3] },
  'Bbsus4': { frets: [1, 4, 3, 3], fingers: [1, 4, 2, 3] },
  'Bsus4': { frets: [2, 5, 4, 4], fingers: [1, 4, 2, 3] },

  // 9th chords (dominant 7th + 9th interval)
  'C9': { frets: [3, 1, 3, 3], fingers: [3, 1, 4, 4] },
  'C#9': { frets: [4, 2, 4, 4], fingers: [3, 1, 4, 4] },
  'Db9': { frets: [4, 2, 4, 4], fingers: [3, 1, 4, 4] },
  'D9': { frets: [5, 3, 5, 5], fingers: [3, 1, 4, 4] },
  'D#9': { frets: [6, 4, 6, 6], fingers: [3, 1, 4, 4] },
  'Eb9': { frets: [6, 4, 6, 6], fingers: [3, 1, 4, 4] },
  'E9': { frets: [7, 5, 7, 7], fingers: [3, 1, 4, 4] },
  'F9': { frets: [8, 6, 8, 8], fingers: [3, 1, 4, 4] },
  'F#9': { frets: [9, 7, 9, 9], fingers: [3, 1, 4, 4] },
  'Gb9': { frets: [9, 7, 9, 9], fingers: [3, 1, 4, 4] },
  'G9': { frets: [10, 8, 10, 10], fingers: [3, 1, 4, 4] },
  'G#9': { frets: [11, 9, 11, 11], fingers: [3, 1, 4, 4] },
  'Ab9': { frets: [11, 9, 11, 11], fingers: [3, 1, 4, 4] },
  'A9': { frets: [0, 0, 2, 2], fingers: [0, 0, 1, 2] },
  'A#9': { frets: [1, 1, 3, 3], fingers: [1, 1, 3, 4] },
  'Bb9': { frets: [1, 1, 3, 3], fingers: [1, 1, 3, 4] },
  'B9': { frets: [2, 2, 4, 4], fingers: [1, 1, 3, 4] },

  // Diminished chords (root + minor 3rd + diminished 5th)
  'Cdim': { frets: [3, 1, 2, 1], fingers: [4, 1, 3, 2] },
  'C#dim': { frets: [4, 2, 3, 2], fingers: [4, 1, 3, 2] },
  'Dbdim': { frets: [4, 2, 3, 2], fingers: [4, 1, 3, 2] },
  'Ddim': { frets: [5, 3, 4, 3], fingers: [4, 1, 3, 2] },
  'D#dim': { frets: [6, 4, 5, 4], fingers: [4, 1, 3, 2] },
  'Ebdim': { frets: [6, 4, 5, 4], fingers: [4, 1, 3, 2] },
  'Edim': { frets: [0, 2, 1, 2], fingers: [0, 3, 1, 4] },
  'Fdim': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'F#dim': { frets: [2, 4, 3, 4], fingers: [1, 4, 2, 3] },
  'Gbdim': { frets: [2, 4, 3, 4], fingers: [1, 4, 2, 3] },
  'Gdim': { frets: [3, 5, 4, 5], fingers: [1, 4, 2, 3] },
  'G#dim': { frets: [4, 1, 2, 1], fingers: [4, 1, 3, 2] },
  'Abdim': { frets: [4, 1, 2, 1], fingers: [4, 1, 3, 2] },
  'Adim': { frets: [0, 2, 1, 2], fingers: [0, 3, 1, 4] },
  'A#dim': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'Bbdim': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'Bdim': { frets: [2, 4, 3, 4], fingers: [1, 4, 2, 3] },

  // Diminished 7th chords (diminished triad + diminished 7th)
  'Cdim7': { frets: [3, 1, 2, 1], fingers: [4, 1, 3, 2] },
  'C#dim7': { frets: [4, 2, 3, 2], fingers: [4, 1, 3, 2] },
  'Dbdim7': { frets: [4, 2, 3, 2], fingers: [4, 1, 3, 2] },
  'Ddim7': { frets: [5, 3, 4, 3], fingers: [4, 1, 3, 2] },
  'D#dim7': { frets: [6, 4, 5, 4], fingers: [4, 1, 3, 2] },
  'Ebdim7': { frets: [6, 4, 5, 4], fingers: [4, 1, 3, 2] },
  'Edim7': { frets: [0, 2, 1, 2], fingers: [0, 3, 1, 4] },
  'Fdim7': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'F#dim7': { frets: [2, 4, 3, 4], fingers: [1, 4, 2, 3] },
  'Gbdim7': { frets: [2, 4, 3, 4], fingers: [1, 4, 2, 3] },
  'Gdim7': { frets: [3, 5, 4, 5], fingers: [1, 4, 2, 3] },
  'G#dim7': { frets: [4, 1, 2, 1], fingers: [4, 1, 3, 2] },
  'Abdim7': { frets: [4, 1, 2, 1], fingers: [4, 1, 3, 2] },
  'Adim7': { frets: [0, 2, 1, 2], fingers: [0, 3, 1, 4] },
  'A#dim7': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'Bbdim7': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'Bdim7': { frets: [2, 4, 3, 4], fingers: [1, 4, 2, 3] },

  // Half-diminished chords (m7b5)
  'Cm7b5': { frets: [3, 4, 3, 4], fingers: [1, 3, 2, 4] },
  'C#m7b5': { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4] },
  'Dbm7b5': { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4] },
  'Dm7b5': { frets: [5, 6, 5, 6], fingers: [1, 3, 2, 4] },
  'D#m7b5': { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4] },
  'Ebm7b5': { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4] },
  'Em7b5': { frets: [0, 2, 0, 2], fingers: [0, 2, 0, 3] },
  'Fm7b5': { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4] },
  'F#m7b5': { frets: [2, 4, 2, 4], fingers: [1, 3, 2, 4] },
  'Gbm7b5': { frets: [2, 4, 2, 4], fingers: [1, 3, 2, 4] },
  'Gm7b5': { frets: [3, 5, 3, 5], fingers: [1, 3, 2, 4] },
  'G#m7b5': { frets: [4, 6, 4, 6], fingers: [1, 3, 2, 4] },
  'Abm7b5': { frets: [4, 6, 4, 6], fingers: [1, 3, 2, 4] },
  'Am7b5': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'A#m7b5': { frets: [1, 2, 1, 2], fingers: [1, 2, 1, 3] },
  'Bbm7b5': { frets: [1, 2, 1, 2], fingers: [1, 2, 1, 3] },
  'Bm7b5': { frets: [2, 3, 2, 3], fingers: [1, 2, 1, 3] },

  // Augmented chords (root + major 3rd + augmented 5th)
  'Caug': { frets: [3, 2, 1, 1], fingers: [4, 3, 1, 2] },
  'C#aug': { frets: [4, 3, 2, 2], fingers: [4, 3, 1, 2] },
  'Dbaug': { frets: [4, 3, 2, 2], fingers: [4, 3, 1, 2] },
  'Daug': { frets: [5, 4, 3, 3], fingers: [4, 3, 1, 2] },
  'D#aug': { frets: [6, 5, 4, 4], fingers: [4, 3, 1, 2] },
  'Ebaug': { frets: [6, 5, 4, 4], fingers: [4, 3, 1, 2] },
  'Eaug': { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] },
  'Faug': { frets: [1, 2, 1, 1], fingers: [1, 3, 2, 4] },
  'F#aug': { frets: [2, 3, 2, 2], fingers: [1, 3, 2, 4] },
  'Gbaug': { frets: [2, 3, 2, 2], fingers: [1, 3, 2, 4] },
  'Gaug': { frets: [3, 4, 3, 3], fingers: [1, 3, 2, 4] },
  'G#aug': { frets: [4, 5, 4, 4], fingers: [1, 3, 2, 4] },
  'Abaug': { frets: [4, 5, 4, 4], fingers: [1, 3, 2, 4] },
  'Aaug': { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] },
  'A#aug': { frets: [1, 2, 1, 1], fingers: [1, 3, 2, 4] },
  'Bbaug': { frets: [1, 2, 1, 1], fingers: [1, 3, 2, 4] },
  'Baug': { frets: [2, 3, 2, 2], fingers: [1, 3, 2, 4] },

  // Major 9th chords (major 7th + 9th)
  'Cmaj9': { frets: [3, 2, 4, 4], fingers: [2, 1, 3, 4] },
  'C#maj9': { frets: [4, 3, 5, 5], fingers: [2, 1, 3, 4] },
  'Dbmaj9': { frets: [4, 3, 5, 5], fingers: [2, 1, 3, 4] },
  'Dmaj9': { frets: [5, 4, 6, 6], fingers: [2, 1, 3, 4] },
  'D#maj9': { frets: [6, 5, 7, 7], fingers: [2, 1, 3, 4] },
  'Ebmaj9': { frets: [6, 5, 7, 7], fingers: [2, 1, 3, 4] },
  'Emaj9': { frets: [0, 2, 1, 1], fingers: [0, 3, 1, 2] },
  'Fmaj9': { frets: [1, 3, 2, 2], fingers: [1, 4, 2, 3] },
  'F#maj9': { frets: [2, 4, 3, 3], fingers: [1, 4, 2, 3] },
  'Gbmaj9': { frets: [2, 4, 3, 3], fingers: [1, 4, 2, 3] },
  'Gmaj9': { frets: [3, 5, 4, 4], fingers: [1, 4, 2, 3] },
  'G#maj9': { frets: [4, 6, 5, 5], fingers: [1, 4, 2, 3] },
  'Abmaj9': { frets: [4, 6, 5, 5], fingers: [1, 4, 2, 3] },
  'Amaj9': { frets: [0, 2, 1, 1], fingers: [0, 3, 1, 2] },
  'A#maj9': { frets: [1, 3, 2, 2], fingers: [1, 4, 2, 3] },
  'Bbmaj9': { frets: [1, 3, 2, 2], fingers: [1, 4, 2, 3] },
  'Bmaj9': { frets: [2, 4, 3, 3], fingers: [1, 4, 2, 3] },

  // Altered dominants - 7b5 chords
  'C7b5': { frets: [3, 4, 2, 2], fingers: [2, 4, 1, 3] },
  'C#7b5': { frets: [4, 5, 3, 3], fingers: [2, 4, 1, 3] },
  'Db7b5': { frets: [4, 5, 3, 3], fingers: [2, 4, 1, 3] },
  'D7b5': { frets: [5, 6, 4, 4], fingers: [2, 4, 1, 3] },
  'D#7b5': { frets: [6, 7, 5, 5], fingers: [2, 4, 1, 3] },
  'Eb7b5': { frets: [6, 7, 5, 5], fingers: [2, 4, 1, 3] },
  'E7b5': { frets: [0, 2, 0, 0], fingers: [0, 2, 0, 0] },
  'F7b5': { frets: [1, 3, 1, 1], fingers: [1, 3, 2, 4] },
  'F#7b5': { frets: [2, 4, 2, 2], fingers: [1, 3, 2, 4] },
  'Gb7b5': { frets: [2, 4, 2, 2], fingers: [1, 3, 2, 4] },
  'G7b5': { frets: [3, 5, 3, 3], fingers: [1, 3, 2, 4] },
  'G#7b5': { frets: [4, 6, 4, 4], fingers: [1, 3, 2, 4] },
  'Ab7b5': { frets: [4, 6, 4, 4], fingers: [1, 3, 2, 4] },
  'A7b5': { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] },
  'A#7b5': { frets: [1, 2, 1, 1], fingers: [1, 2, 1, 4] },
  'Bb7b5': { frets: [1, 2, 1, 1], fingers: [1, 2, 1, 4] },
  'B7b5': { frets: [2, 3, 2, 2], fingers: [1, 2, 1, 4] },

  // Altered dominants - 7#5 chords  
  'C7#5': { frets: [3, 2, 4, 4], fingers: [2, 1, 3, 4] },
  'C#7#5': { frets: [4, 3, 5, 5], fingers: [2, 1, 3, 4] },
  'Db7#5': { frets: [4, 3, 5, 5], fingers: [2, 1, 3, 4] },
  'D7#5': { frets: [5, 4, 6, 6], fingers: [2, 1, 3, 4] },
  'D#7#5': { frets: [6, 5, 7, 7], fingers: [2, 1, 3, 4] },
  'Eb7#5': { frets: [6, 5, 7, 7], fingers: [2, 1, 3, 4] },
  'E7#5': { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] },
  'F7#5': { frets: [1, 2, 1, 1], fingers: [1, 2, 1, 4] },
  'F#7#5': { frets: [2, 3, 2, 2], fingers: [1, 2, 1, 4] },
  'Gb7#5': { frets: [2, 3, 2, 2], fingers: [1, 2, 1, 4] },
  'G7#5': { frets: [3, 4, 3, 3], fingers: [1, 2, 1, 4] },
  'G#7#5': { frets: [4, 5, 4, 4], fingers: [1, 2, 1, 4] },
  'Ab7#5': { frets: [4, 5, 4, 4], fingers: [1, 2, 1, 4] },
  'A7#5': { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] },
  'A#7#5': { frets: [1, 2, 1, 1], fingers: [1, 2, 1, 4] },
  'Bb7#5': { frets: [1, 2, 1, 1], fingers: [1, 2, 1, 4] },
  'B7#5': { frets: [2, 3, 2, 2], fingers: [1, 2, 1, 4] }
};
