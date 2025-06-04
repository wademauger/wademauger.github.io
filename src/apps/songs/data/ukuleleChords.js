// Ukulele chords (4 strings): 0 = open, >0 = fret number
export const ukuleleChords = {
  // Major chords
  'C': { 
    frets: [0, 0, 0, 3], 
    fingers: [0, 0, 0, 3],
    inversions: [
      { frets: [5, 4, 3, 3], fingers: [4, 3, 1, 2] }, // First inversion (E in bass)
      { frets: [0, 0, 3, 0], fingers: [0, 0, 3, 0] }   // Alternative root position
    ]
  },
  'C#': { 
    frets: [1, 1, 1, 4], 
    fingers: [1, 1, 1, 4],
    inversions: [
      { frets: [6, 5, 4, 4], fingers: [4, 3, 1, 2] }, // First inversion
      { frets: [1, 1, 4, 1], fingers: [1, 2, 4, 3] }   // Alternative fingering
    ]
  },
  'Db': { 
    frets: [1, 1, 1, 4], 
    fingers: [1, 1, 1, 4],
    inversions: [
      { frets: [6, 5, 4, 4], fingers: [4, 3, 1, 2] }, // First inversion
      { frets: [1, 1, 4, 1], fingers: [1, 2, 4, 3] }   // Alternative fingering
    ]
  },
  'D': { 
    frets: [2, 2, 2, 0], 
    fingers: [1, 1, 1, 0],
    inversions: [
      { frets: [7, 6, 5, 5], fingers: [4, 3, 1, 2] }, // First inversion
      { frets: [2, 2, 2, 5], fingers: [1, 2, 3, 4] }   // Alternative fingering
    ]
  },
  'D#': { 
    frets: [0, 3, 3, 1], 
    fingers: [0, 3, 4, 1],
    inversions: [
      { frets: [3, 3, 3, 6], fingers: [1, 2, 3, 4] }, // Alternative position
      { frets: [8, 7, 6, 6], fingers: [4, 3, 1, 2] }   // Higher position
    ]
  },
  'Eb': { 
    frets: [0, 3, 3, 1], 
    fingers: [0, 3, 4, 1],
    inversions: [
      { frets: [3, 3, 3, 6], fingers: [1, 2, 3, 4] }, // Alternative position
      { frets: [8, 7, 6, 6], fingers: [4, 3, 1, 2] }   // Higher position
    ]
  },
  'E': { 
    frets: [4, 4, 4, 2], 
    fingers: [3, 3, 3, 1],
    inversions: [
      { frets: [1, 4, 0, 2], fingers: [1, 4, 0, 2], description: "Open position" },
      { frets: [9, 8, 7, 7], fingers: [4, 3, 1, 2], description: "Higher position" }
    ]
  },
  'F': { 
    frets: [2, 0, 1, 0], 
    fingers: [2, 0, 1, 0],
    inversions: [
      { frets: [5, 5, 5, 3], fingers: [3, 3, 3, 1], description: "Barre position" },
      { frets: [10, 9, 8, 8], fingers: [4, 3, 1, 2], description: "Higher position" }
    ]
  },
  'F#': { 
    frets: [3, 1, 2, 1], 
    fingers: [4, 1, 3, 2],
    inversions: [
      { frets: [6, 6, 6, 4], fingers: [3, 3, 3, 1], description: "Barre position" },
      { frets: [11, 10, 9, 9], fingers: [4, 3, 1, 2], description: "Higher position" }
    ]
  },
  'Gb': { 
    frets: [3, 1, 2, 1], 
    fingers: [4, 1, 3, 2],
    inversions: [
      { frets: [6, 6, 6, 4], fingers: [3, 3, 3, 1], description: "Barre position" },
      { frets: [11, 10, 9, 9], fingers: [4, 3, 1, 2], description: "Higher position" }
    ]
  },
  'G': { 
    frets: [0, 2, 3, 2], 
    fingers: [0, 1, 3, 2],
    inversions: [
      { frets: [4, 2, 3, 2], fingers: [4, 1, 3, 2], description: "Alternative position" },
      { frets: [7, 7, 7, 5], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'G#': { 
    frets: [5, 3, 4, 3], 
    fingers: [4, 1, 3, 2],
    inversions: [
      { frets: [1, 3, 4, 3], fingers: [1, 2, 4, 3], description: "Lower position" },
      { frets: [8, 8, 8, 6], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'Ab': { 
    frets: [5, 3, 4, 3], 
    fingers: [4, 1, 3, 2],
    inversions: [
      { frets: [1, 3, 4, 3], fingers: [1, 2, 4, 3], description: "Lower position" },
      { frets: [8, 8, 8, 6], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'A': { 
    frets: [2, 1, 0, 0], 
    fingers: [2, 1, 0, 0],
    inversions: [
      { frets: [6, 4, 5, 4], fingers: [4, 1, 3, 2], description: "Alternative position" },
      { frets: [9, 9, 9, 7], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'A#': { 
    frets: [3, 2, 1, 1], 
    fingers: [3, 2, 1, 1],
    inversions: [
      { frets: [7, 5, 6, 5], fingers: [4, 1, 3, 2], description: "Alternative position" },
      { frets: [10, 10, 10, 8], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'Bb': { 
    frets: [3, 2, 1, 1], 
    fingers: [3, 2, 1, 1],
    inversions: [
      { frets: [7, 5, 6, 5], fingers: [4, 1, 3, 2], description: "Alternative position" },
      { frets: [10, 10, 10, 8], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'B': { 
    frets: [4, 3, 2, 2], 
    fingers: [4, 3, 1, 2],
    inversions: [
      { frets: [8, 6, 7, 6], fingers: [4, 1, 3, 2], description: "Alternative position" },
      { frets: [11, 11, 11, 9], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  
  // Minor chords
  'Cm': { 
    frets: [0, 3, 3, 3], 
    fingers: [0, 1, 2, 3],
    inversions: [
      { frets: [3, 3, 3, 6], fingers: [1, 2, 3, 4] }, // Higher position
      { frets: [8, 7, 8, 8], fingers: [1, 2, 3, 4] }   // Barre position
    ]
  },
  'C#m': { 
    frets: [1, 1, 0, 4], 
    fingers: [1, 2, 0, 4],
    inversions: [
      { frets: [4, 4, 4, 7], fingers: [1, 2, 3, 4] }, // Higher position
      { frets: [9, 8, 9, 9], fingers: [1, 2, 3, 4] }   // Barre position
    ]
  },
  'Dbm': { 
    frets: [1, 1, 0, 4], 
    fingers: [1, 2, 0, 4],
    inversions: [
      { frets: [4, 4, 4, 7], fingers: [1, 2, 3, 4], description: "Higher position" },
      { frets: [9, 8, 9, 9], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'Dm': { 
    frets: [2, 2, 1, 0], 
    fingers: [2, 3, 1, 0],
    inversions: [
      { frets: [5, 5, 5, 8], fingers: [1, 2, 3, 4], description: "Higher position" },
      { frets: [10, 9, 10, 10], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'D#m': { 
    frets: [3, 3, 2, 1], 
    fingers: [3, 4, 2, 1],
    inversions: [
      { frets: [6, 6, 6, 9], fingers: [1, 2, 3, 4], description: "Higher position" },
      { frets: [11, 10, 11, 11], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'Ebm': { 
    frets: [3, 3, 2, 1], 
    fingers: [3, 4, 2, 1],
    inversions: [
      { frets: [6, 6, 6, 9], fingers: [1, 2, 3, 4], description: "Higher position" },
      { frets: [11, 10, 11, 11], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'Em': { 
    frets: [0, 4, 3, 2], 
    fingers: [0, 4, 3, 2],
    inversions: [
      { frets: [2, 0, 0, 3], fingers: [2, 0, 0, 4], description: "Alternative position" },
      { frets: [7, 7, 7, 10], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'Fm': { 
    frets: [1, 0, 1, 3], 
    fingers: [1, 0, 2, 4],
    inversions: [
      { frets: [5, 5, 4, 3], fingers: [3, 4, 2, 1], description: "Alternative position" },
      { frets: [8, 8, 8, 11], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'F#m': { 
    frets: [2, 1, 2, 0], 
    fingers: [2, 1, 3, 0],
    inversions: [
      { frets: [6, 6, 5, 4], fingers: [3, 4, 2, 1], description: "Alternative position" },
      { frets: [9, 9, 9, 12], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'Gbm': { 
    frets: [2, 1, 2, 0], 
    fingers: [2, 1, 3, 0],
    inversions: [
      { frets: [6, 6, 5, 4], fingers: [3, 4, 2, 1], description: "Alternative position" },
      { frets: [9, 9, 9, 12], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'Gm': { 
    frets: [0, 2, 3, 1], 
    fingers: [0, 2, 4, 1],
    inversions: [
      { frets: [3, 2, 3, 1], fingers: [3, 1, 4, 2], description: "Alternative position" },
      { frets: [7, 7, 6, 5], fingers: [3, 4, 2, 1], description: "Higher position" }
    ]
  },
  'G#m': { 
    frets: [1, 3, 4, 2], 
    fingers: [1, 3, 4, 2],
    inversions: [
      { frets: [4, 3, 4, 2], fingers: [3, 1, 4, 2], description: "Alternative position" },
      { frets: [8, 8, 7, 6], fingers: [3, 4, 2, 1], description: "Higher position" }
    ]
  },
  'Abm': { 
    frets: [1, 3, 4, 2], 
    fingers: [1, 3, 4, 2],
    inversions: [
      { frets: [4, 3, 4, 2], fingers: [3, 1, 4, 2], description: "Alternative position" },
      { frets: [8, 8, 7, 6], fingers: [3, 4, 2, 1], description: "Higher position" }
    ]
  },
  'Am': { 
    frets: [2, 0, 0, 0], 
    fingers: [1, 0, 0, 0],
    inversions: [
      { frets: [5, 4, 5, 3], fingers: [3, 1, 4, 2], description: "Alternative position" },
      { frets: [9, 9, 8, 7], fingers: [3, 4, 2, 1], description: "Higher position" }
    ]
  },
  'A#m': { 
    frets: [3, 1, 1, 1], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [6, 5, 6, 4], fingers: [3, 1, 4, 2], description: "Alternative position" },
      { frets: [10, 10, 9, 8], fingers: [3, 4, 2, 1], description: "Higher position" }
    ]
  },
  'Bbm': { 
    frets: [3, 1, 1, 1], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [6, 5, 6, 4], fingers: [3, 1, 4, 2], description: "Alternative position" },
      { frets: [10, 10, 9, 8], fingers: [3, 4, 2, 1], description: "Higher position" }
    ]
  },
  'Bm': { frets: [4, 2, 2, 2], fingers: [4, 1, 2, 3] },
  
  // 7th chords
  'C7': { 
    frets: [0, 0, 0, 1], 
    fingers: [0, 0, 0, 1],
    inversions: [
      { frets: [3, 3, 4, 3], fingers: [1, 2, 4, 3], description: "Alternative position" },
      { frets: [5, 5, 5, 8], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'C#7': { 
    frets: [1, 1, 1, 2], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [4, 4, 5, 4], fingers: [1, 2, 4, 3], description: "Alternative position" },
      { frets: [6, 6, 6, 9], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'Db7': { 
    frets: [1, 1, 1, 2], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [4, 4, 5, 4], fingers: [1, 2, 4, 3], description: "Alternative position" },
      { frets: [6, 6, 6, 9], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'D7': { 
    frets: [2, 2, 2, 3], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [5, 5, 6, 5], fingers: [1, 2, 4, 3], description: "Alternative position" },
      { frets: [7, 7, 7, 10], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'D#7': { 
    frets: [3, 3, 3, 4], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [6, 6, 7, 6], fingers: [1, 2, 4, 3], description: "Alternative position" },
      { frets: [8, 8, 8, 11], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'Eb7': { 
    frets: [3, 3, 3, 4], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [6, 6, 7, 6], fingers: [1, 2, 4, 3], description: "Alternative position" },
      { frets: [8, 8, 8, 11], fingers: [1, 2, 3, 4], description: "Barre position" }
    ]
  },
  'E7': { 
    frets: [1, 2, 0, 2], 
    fingers: [1, 3, 0, 4],
    inversions: [
      { frets: [4, 4, 4, 2], fingers: [3, 3, 3, 1], description: "Barre position" },
      { frets: [7, 7, 8, 7], fingers: [1, 2, 4, 3], description: "Higher position" }
    ]
  },
  'F7': { 
    frets: [2, 3, 1, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [5, 5, 5, 3], fingers: [3, 3, 3, 1], description: "Barre position" },
      { frets: [8, 8, 9, 8], fingers: [1, 2, 4, 3], description: "Higher position" }
    ]
  },
  'F#7': { 
    frets: [3, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 6, 6, 4], fingers: [3, 3, 3, 1], description: "Barre position" },
      { frets: [9, 9, 10, 9], fingers: [1, 2, 4, 3], description: "Higher position" }
    ]
  },
  'Gb7': { 
    frets: [3, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 6, 6, 4], fingers: [3, 3, 3, 1], description: "Barre position" },
      { frets: [9, 9, 10, 9], fingers: [1, 2, 4, 3], description: "Higher position" }
    ]
  },
  'G7': { 
    frets: [0, 2, 1, 2], 
    fingers: [0, 3, 1, 4],
    inversions: [
      { frets: [3, 2, 3, 1], fingers: [3, 1, 4, 2], description: "Alternative position" },
      { frets: [7, 7, 7, 5], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'G#7': { 
    frets: [1, 3, 2, 3], 
    fingers: [1, 4, 2, 3],
    inversions: [
      { frets: [4, 3, 4, 2], fingers: [3, 1, 4, 2], description: "Alternative position" },
      { frets: [8, 8, 8, 6], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'Ab7': { 
    frets: [1, 3, 2, 3], 
    fingers: [1, 4, 2, 3],
    inversions: [
      { frets: [4, 3, 4, 2], fingers: [3, 1, 4, 2], description: "Alternative position" },
      { frets: [8, 8, 8, 6], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'A7': { 
    frets: [0, 1, 0, 0], 
    fingers: [0, 1, 0, 0],
    inversions: [
      { frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0], description: "Alternative position" },
      { frets: [9, 9, 9, 7], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'A#7': { 
    frets: [1, 2, 1, 1], 
    fingers: [1, 4, 2, 3],
    inversions: [
      { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1], description: "Alternative position" },
      { frets: [10, 10, 10, 8], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'Bb7': { 
    frets: [1, 2, 1, 1], 
    fingers: [1, 4, 2, 3],
    inversions: [
      { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1], description: "Alternative position" },
      { frets: [10, 10, 10, 8], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  'B7': { 
    frets: [2, 3, 2, 2], 
    fingers: [1, 4, 2, 3],
    inversions: [
      { frets: [4, 3, 2, 2], fingers: [4, 3, 1, 2], description: "Alternative position" },
      { frets: [11, 11, 11, 9], fingers: [3, 3, 3, 1], description: "Barre position" }
    ]
  },
  
  // Major 7th chords
  'Cmaj7': { frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2] },
  'C#maj7': { frets: [1, 1, 1, 3], fingers: [1, 1, 1, 3] },
  'Dbmaj7': { frets: [1, 1, 1, 3], fingers: [1, 1, 1, 3] },
  'Dmaj7': { frets: [2, 2, 2, 4], fingers: [1, 1, 1, 3] },
  'D#maj7': { frets: [3, 3, 3, 5], fingers: [1, 1, 1, 3] },
  'Ebmaj7': { frets: [3, 3, 3, 5], fingers: [1, 1, 1, 3] },
  'Emaj7': { frets: [1, 1, 0, 2], fingers: [1, 2, 0, 4] },
  'Fmaj7': { frets: [2, 4, 1, 3], fingers: [1, 4, 2, 3] },
  'F#maj7': { frets: [3, 5, 2, 4], fingers: [1, 4, 2, 3] },
  'Gbmaj7': { frets: [3, 5, 2, 4], fingers: [1, 4, 2, 3] },
  'Gmaj7': { frets: [0, 2, 2, 2], fingers: [0, 1, 2, 3] },
  'G#maj7': { frets: [1, 3, 3, 3], fingers: [1, 2, 3, 4] },
  'Abmaj7': { frets: [1, 3, 3, 3], fingers: [1, 2, 3, 4] },
  'Amaj7': { frets: [1, 1, 0, 0], fingers: [1, 2, 0, 0] },
  'A#maj7': { frets: [2, 2, 1, 1], fingers: [2, 3, 1, 1] },
  'Bbmaj7': { frets: [2, 2, 1, 1], fingers: [2, 3, 1, 1] },
  'Bmaj7': { frets: [3, 3, 2, 2], fingers: [3, 4, 1, 2] },
  
  // Minor 7th chords
  'Cm7': { frets: [3, 3, 3, 3], fingers: [1, 1, 1, 1] },
  'C#m7': { frets: [1, 1, 0, 2], fingers: [1, 2, 0, 4] },
  'Dbm7': { frets: [1, 1, 0, 2], fingers: [1, 2, 0, 4] },
  'Dm7': { frets: [2, 2, 1, 3], fingers: [2, 3, 1, 4] },
  'D#m7': { frets: [3, 3, 2, 4], fingers: [2, 3, 1, 4] },
  'Ebm7': { frets: [3, 3, 2, 4], fingers: [2, 3, 1, 4] },
  'Em7': { frets: [0, 2, 0, 2], fingers: [0, 2, 0, 3] },
  'Fm7': { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4] },
  'F#m7': { frets: [2, 4, 2, 4], fingers: [1, 3, 2, 4] },
  'Gbm7': { frets: [2, 4, 2, 4], fingers: [1, 3, 2, 4] },
  'Gm7': { frets: [0, 2, 1, 1], fingers: [0, 3, 1, 2] },
  'G#m7': { frets: [1, 3, 2, 2], fingers: [1, 4, 2, 3] },
  'Abm7': { frets: [1, 3, 2, 2], fingers: [1, 4, 2, 3] },
  'Am7': { frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0] },
  'A#m7': { frets: [1, 1, 1, 1], fingers: [1, 1, 1, 1] },
  'Bbm7': { frets: [1, 1, 1, 1], fingers: [1, 1, 1, 1] },
  'Bm7': { frets: [2, 2, 2, 2], fingers: [1, 1, 1, 1] },

  // Power chords (5th chords)
  'C5': { frets: [0, 0, 3, 3], fingers: [0, 0, 1, 2] },
  'C#5': { frets: [1, 1, 4, 4], fingers: [1, 1, 3, 4] },
  'Db5': { frets: [1, 1, 4, 4], fingers: [1, 1, 3, 4] },
  'D5': { frets: [2, 2, 0, 0], fingers: [1, 2, 0, 0] },
  'D#5': { frets: [0, 3, 1, 1], fingers: [0, 4, 1, 2] },
  'Eb5': { frets: [0, 3, 1, 1], fingers: [0, 4, 1, 2] },
  'E5': { frets: [4, 4, 2, 2], fingers: [3, 4, 1, 2] },
  'F5': { frets: [2, 0, 0, 0], fingers: [1, 0, 0, 0] },
  'F#5': { frets: [3, 1, 1, 1], fingers: [4, 1, 2, 3] },
  'Gb5': { frets: [3, 1, 1, 1], fingers: [4, 1, 2, 3] },
  'G5': { frets: [0, 2, 2, 2], fingers: [0, 1, 2, 3] },
  'G#5': { frets: [5, 3, 3, 3], fingers: [4, 1, 2, 3] },
  'Ab5': { frets: [5, 3, 3, 3], fingers: [4, 1, 2, 3] },
  'A5': { frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0] },
  'A#5': { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1] },
  'Bb5': { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1] },
  'B5': { frets: [4, 3, 2, 2], fingers: [4, 3, 1, 2] },

  // Sixth chords (6th chords)
  'C6': { frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0] },
  'C#6': { frets: [1, 1, 1, 1], fingers: [1, 1, 1, 1] },
  'Db6': { frets: [1, 1, 1, 1], fingers: [1, 1, 1, 1] },
  'D6': { frets: [2, 2, 2, 2], fingers: [1, 1, 1, 1] },
  'D#6': { frets: [0, 3, 1, 1], fingers: [0, 4, 1, 2] },
  'Eb6': { frets: [0, 3, 1, 1], fingers: [0, 4, 1, 2] },
  'E6': { frets: [4, 4, 4, 4], fingers: [1, 1, 1, 1] },
  'F6': { frets: [2, 2, 1, 3], fingers: [2, 3, 1, 4] },
  'F#6': { frets: [3, 3, 2, 4], fingers: [2, 3, 1, 4] },
  'Gb6': { frets: [3, 3, 2, 4], fingers: [2, 3, 1, 4] },
  'G6': { frets: [0, 2, 0, 2], fingers: [0, 2, 0, 3] },
  'G#6': { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4] },
  'Ab6': { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4] },
  'A6': { frets: [2, 4, 2, 4], fingers: [1, 3, 2, 4] },
  'A#6': { frets: [3, 5, 3, 5], fingers: [1, 3, 2, 4] },
  'Bb6': { frets: [3, 5, 3, 5], fingers: [1, 3, 2, 4] },
  'B6': { frets: [4, 6, 4, 6], fingers: [1, 3, 2, 4] },

  // Minor 6th chords
  'Cm6': { frets: [0, 3, 1, 3], fingers: [0, 4, 1, 3] },
  'C#m6': { frets: [1, 4, 2, 4], fingers: [1, 4, 2, 3] },
  'Dbm6': { frets: [1, 4, 2, 4], fingers: [1, 4, 2, 3] },
  'Dm6': { frets: [2, 2, 1, 2], fingers: [3, 4, 1, 2] },
  'D#m6': { frets: [3, 3, 2, 3], fingers: [3, 4, 1, 2] },
  'Ebm6': { frets: [3, 3, 2, 3], fingers: [3, 4, 1, 2] },
  'Em6': { frets: [0, 1, 0, 2], fingers: [0, 1, 0, 3] },
  'Fm6': { frets: [1, 2, 1, 3], fingers: [1, 2, 3, 4] },
  'F#m6': { frets: [2, 3, 2, 4], fingers: [1, 2, 3, 4] },
  'Gbm6': { frets: [2, 3, 2, 4], fingers: [1, 2, 3, 4] },
  'Gm6': { frets: [0, 2, 0, 1], fingers: [0, 3, 0, 1] },
  'G#m6': { frets: [1, 3, 1, 2], fingers: [1, 4, 2, 3] },
  'Abm6': { frets: [1, 3, 1, 2], fingers: [1, 4, 2, 3] },
  'Am6': { frets: [2, 4, 2, 3], fingers: [1, 4, 2, 3] },
  'A#m6': { frets: [3, 5, 3, 4], fingers: [1, 4, 2, 3] },
  'Bbm6': { frets: [3, 5, 3, 4], fingers: [1, 4, 2, 3] },
  'Bm6': { frets: [4, 6, 4, 5], fingers: [1, 4, 2, 3] },

  // Add9 chords (major triad + 9th)
  'Cadd9': { frets: [0, 2, 0, 3], fingers: [0, 2, 0, 3] },
  'C#add9': { frets: [1, 3, 1, 4], fingers: [1, 3, 2, 4] },
  'Dbadd9': { frets: [1, 3, 1, 4], fingers: [1, 3, 2, 4] },
  'Dadd9': { frets: [2, 4, 2, 0], fingers: [2, 4, 3, 0] },
  'D#add9': { frets: [0, 5, 3, 1], fingers: [0, 4, 3, 1] },
  'Ebadd9': { frets: [0, 5, 3, 1], fingers: [0, 4, 3, 1] },
  'Eadd9': { frets: [4, 6, 4, 2], fingers: [2, 4, 3, 1] },
  'Fadd9': { frets: [2, 0, 1, 3], fingers: [2, 0, 1, 4] },
  'F#add9': { frets: [3, 1, 2, 4], fingers: [3, 1, 2, 4] },
  'Gbadd9': { frets: [3, 1, 2, 4], fingers: [3, 1, 2, 4] },
  'Gadd9': { frets: [0, 2, 3, 0], fingers: [0, 1, 3, 0] },
  'G#add9': { frets: [5, 3, 4, 1], fingers: [4, 2, 3, 1] },
  'Abadd9': { frets: [5, 3, 4, 1], fingers: [4, 2, 3, 1] },
  'Aadd9': { frets: [2, 1, 0, 2], fingers: [3, 1, 0, 4] },
  'A#add9': { frets: [3, 2, 1, 3], fingers: [3, 2, 1, 4] },
  'Bbadd9': { frets: [3, 2, 1, 3], fingers: [3, 2, 1, 4] },
  'Badd9': { frets: [4, 3, 2, 4], fingers: [3, 2, 1, 4] },

  // Sus2 chords (suspended 2nd)
  'Csus2': { frets: [0, 2, 3, 3], fingers: [0, 1, 2, 3] },
  'C#sus2': { frets: [1, 3, 4, 4], fingers: [1, 2, 3, 4] },
  'Dbsus2': { frets: [1, 3, 4, 4], fingers: [1, 2, 3, 4] },
  'Dsus2': { frets: [2, 2, 0, 0], fingers: [1, 2, 0, 0] },
  'D#sus2': { frets: [0, 3, 1, 1], fingers: [0, 4, 1, 2] },
  'Ebsus2': { frets: [0, 3, 1, 1], fingers: [0, 4, 1, 2] },
  'Esus2': { frets: [4, 4, 2, 2], fingers: [3, 4, 1, 2] },
  'Fsus2': { frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] },
  'F#sus2': { frets: [1, 1, 2, 1], fingers: [1, 2, 3, 4] },
  'Gbsus2': { frets: [1, 1, 2, 1], fingers: [1, 2, 3, 4] },
  'Gsus2': { frets: [0, 2, 3, 0], fingers: [0, 1, 3, 0] },
  'G#sus2': { frets: [1, 3, 4, 1], fingers: [1, 3, 4, 2] },
  'Absus2': { frets: [1, 3, 4, 1], fingers: [1, 3, 4, 2] },
  'Asus2': { frets: [2, 1, 0, 2], fingers: [3, 1, 0, 4] },
  'A#sus2': { frets: [3, 2, 1, 3], fingers: [3, 2, 1, 4] },
  'Bbsus2': { frets: [3, 2, 1, 3], fingers: [3, 2, 1, 4] },
  'Bsus2': { frets: [4, 3, 2, 4], fingers: [3, 2, 1, 4] },

  // Sus4 chords (suspended 4th)
  'Csus4': { frets: [0, 0, 1, 3], fingers: [0, 0, 1, 3] },
  'C#sus4': { frets: [1, 1, 2, 4], fingers: [1, 1, 2, 4] },
  'Dbsus4': { frets: [1, 1, 2, 4], fingers: [1, 1, 2, 4] },
  'Dsus4': { frets: [2, 2, 3, 0], fingers: [1, 2, 3, 0] },
  'D#sus4': { frets: [0, 3, 4, 1], fingers: [0, 2, 4, 1] },
  'Ebsus4': { frets: [0, 3, 4, 1], fingers: [0, 2, 4, 1] },
  'Esus4': { frets: [4, 4, 5, 2], fingers: [2, 3, 4, 1] },
  'Fsus4': { frets: [2, 0, 2, 0], fingers: [2, 0, 3, 0] },
  'F#sus4': { frets: [3, 1, 3, 1], fingers: [3, 1, 4, 2] },
  'Gbsus4': { frets: [3, 1, 3, 1], fingers: [3, 1, 4, 2] },
  'Gsus4': { frets: [0, 2, 4, 2], fingers: [0, 1, 4, 2] },
  'G#sus4': { frets: [1, 3, 5, 3], fingers: [1, 2, 4, 3] },
  'Absus4': { frets: [1, 3, 5, 3], fingers: [1, 2, 4, 3] },
  'Asus4': { frets: [2, 1, 1, 0], fingers: [3, 1, 2, 0] },
  'A#sus4': { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1] },
  'Bbsus4': { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1] },
  'Bsus4': { frets: [4, 3, 3, 2], fingers: [4, 2, 3, 1] },

  // 9th chords (dominant 7th + 9th)
  'C9': { frets: [0, 2, 0, 1], fingers: [0, 3, 0, 1] },
  'C#9': { frets: [1, 3, 1, 2], fingers: [1, 4, 2, 3] },
  'Db9': { frets: [1, 3, 1, 2], fingers: [1, 4, 2, 3] },
  'D9': { frets: [2, 4, 2, 3], fingers: [1, 4, 2, 3] },
  'D#9': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'Eb9': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'E9': { frets: [1, 2, 0, 2], fingers: [1, 3, 0, 4] },
  'F9': { frets: [2, 3, 1, 3], fingers: [2, 4, 1, 3] },
  'F#9': { frets: [3, 4, 2, 4], fingers: [2, 4, 1, 3] },
  'Gb9': { frets: [3, 4, 2, 4], fingers: [2, 4, 1, 3] },
  'G9': { frets: [0, 2, 1, 2], fingers: [0, 3, 1, 4] },
  'G#9': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'Ab9': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'A9': { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] },
  'A#9': { frets: [1, 2, 1, 1], fingers: [1, 4, 2, 3] },
  'Bb9': { frets: [1, 2, 1, 1], fingers: [1, 4, 2, 3] },
  'B9': { frets: [2, 3, 2, 2], fingers: [1, 4, 2, 3] },

  // Diminished chords (root + minor 3rd + diminished 5th)
  'Cdim': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'C#dim': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Dbdim': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Ddim': { frets: [1, 2, 1, 0], fingers: [1, 3, 2, 0] },
  'D#dim': { frets: [2, 3, 2, 1], fingers: [2, 4, 3, 1] },
  'Ebdim': { frets: [2, 3, 2, 1], fingers: [2, 4, 3, 1] },
  'Edim': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'Fdim': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'F#dim': { frets: [2, 0, 2, 0], fingers: [1, 0, 2, 0] },
  'Gbdim': { frets: [2, 0, 2, 0], fingers: [1, 0, 2, 0] },
  'Gdim': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'G#dim': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Abdim': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Adim': { frets: [2, 3, 2, 3], fingers: [1, 3, 2, 4] },
  'A#dim': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'Bbdim': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'Bdim': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },

  // Diminished 7th chords (diminished triad + diminished 7th)
  'Cdim7': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'C#dim7': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Dbdim7': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Ddim7': { frets: [1, 2, 1, 0], fingers: [1, 3, 2, 0] },
  'D#dim7': { frets: [2, 3, 2, 1], fingers: [2, 4, 3, 1] },
  'Ebdim7': { frets: [2, 3, 2, 1], fingers: [2, 4, 3, 1] },
  'Edim7': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'Fdim7': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'F#dim7': { frets: [2, 0, 2, 0], fingers: [1, 0, 2, 0] },
  'Gbdim7': { frets: [2, 0, 2, 0], fingers: [1, 0, 2, 0] },
  'Gdim7': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'G#dim7': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Abdim7': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Adim7': { frets: [2, 3, 2, 3], fingers: [1, 3, 2, 4] },
  'A#dim7': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'Bbdim7': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'Bdim7': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },

  // Half-diminished chords (m7b5)
  'Cm7b5': { frets: [0, 3, 1, 1], fingers: [0, 4, 1, 2] },
  'C#m7b5': { frets: [1, 4, 2, 2], fingers: [1, 4, 2, 3] },
  'Dbm7b5': { frets: [1, 4, 2, 2], fingers: [1, 4, 2, 3] },
  'Dm7b5': { frets: [1, 2, 1, 1], fingers: [1, 3, 2, 4] },
  'D#m7b5': { frets: [2, 3, 2, 2], fingers: [1, 3, 2, 4] },
  'Ebm7b5': { frets: [2, 3, 2, 2], fingers: [1, 3, 2, 4] },
  'Em7b5': { frets: [0, 2, 0, 2], fingers: [0, 1, 0, 2] },
  'Fm7b5': { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4] },
  'F#m7b5': { frets: [2, 0, 2, 1], fingers: [2, 0, 3, 1] },
  'Gbm7b5': { frets: [2, 0, 2, 1], fingers: [2, 0, 3, 1] },
  'Gm7b5': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'G#m7b5': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Abm7b5': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Am7b5': { frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1] },
  'A#m7b5': { frets: [1, 1, 1, 2], fingers: [1, 1, 1, 2] },
  'Bbm7b5': { frets: [1, 1, 1, 2], fingers: [1, 1, 1, 2] },
  'Bm7b5': { frets: [2, 2, 2, 3], fingers: [1, 1, 1, 2] },

  // Augmented chords (root + major 3rd + augmented 5th)
  'Caug': { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4] },
  'C#aug': { frets: [2, 1, 1, 4], fingers: [2, 1, 1, 4] },
  'Dbaug': { frets: [2, 1, 1, 4], fingers: [2, 1, 1, 4] },
  'Daug': { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1] },
  'D#aug': { frets: [0, 3, 3, 2], fingers: [0, 3, 4, 1] },
  'Ebaug': { frets: [0, 3, 3, 2], fingers: [0, 3, 4, 1] },
  'Eaug': { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4] },
  'Faug': { frets: [2, 1, 1, 0], fingers: [3, 1, 2, 0] },
  'F#aug': { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1] },
  'Gbaug': { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1] },
  'Gaug': { frets: [0, 3, 3, 2], fingers: [0, 3, 4, 1] },
  'G#aug': { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4] },
  'Abaug': { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4] },
  'Aaug': { frets: [2, 1, 1, 4], fingers: [2, 1, 1, 4] },
  'A#aug': { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1] },
  'Bbaug': { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1] },
  'Baug': { frets: [0, 3, 3, 2], fingers: [0, 3, 4, 1] },

  // Major 9th chords (major 7th + 9th)
  'Cmaj9': { frets: [0, 0, 1, 1], fingers: [0, 0, 1, 2] },
  'C#maj9': { frets: [1, 1, 2, 2], fingers: [1, 1, 2, 3] },
  'Dbmaj9': { frets: [1, 1, 2, 2], fingers: [1, 1, 2, 3] },
  'Dmaj9': { frets: [2, 2, 0, 0], fingers: [1, 2, 0, 0] },
  'D#maj9': { frets: [0, 3, 1, 1], fingers: [0, 4, 1, 2] },
  'Ebmaj9': { frets: [0, 3, 1, 1], fingers: [0, 4, 1, 2] },
  'Emaj9': { frets: [1, 1, 0, 2], fingers: [1, 2, 0, 4] },
  'Fmaj9': { frets: [2, 0, 1, 3], fingers: [2, 0, 1, 4] },
  'F#maj9': { frets: [3, 1, 2, 4], fingers: [3, 1, 2, 4] },
  'Gbmaj9': { frets: [3, 1, 2, 4], fingers: [3, 1, 2, 4] },
  'Gmaj9': { frets: [0, 2, 0, 2], fingers: [0, 1, 0, 2] },
  'G#maj9': { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4] },
  'Abmaj9': { frets: [1, 3, 1, 3], fingers: [1, 3, 2, 4] },
  'Amaj9': { frets: [2, 1, 2, 0], fingers: [3, 1, 4, 0] },
  'A#maj9': { frets: [3, 2, 3, 1], fingers: [3, 1, 4, 2] },
  'Bbmaj9': { frets: [3, 2, 3, 1], fingers: [3, 1, 4, 2] },
  'Bmaj9': { frets: [4, 3, 4, 2], fingers: [3, 1, 4, 2] },

  // Altered dominants - 7b5 chords
  'C7b5': { frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] },
  'C#7b5': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'Db7b5': { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  'D7b5': { frets: [2, 2, 1, 3], fingers: [2, 3, 1, 4] },
  'D#7b5': { frets: [3, 3, 2, 4], fingers: [2, 3, 1, 4] },
  'Eb7b5': { frets: [3, 3, 2, 4], fingers: [2, 3, 1, 4] },
  'E7b5': { frets: [1, 2, 0, 1], fingers: [1, 3, 0, 2] },
  'F7b5': { frets: [2, 3, 1, 2], fingers: [2, 4, 1, 3] },
  'F#7b5': { frets: [3, 4, 2, 3], fingers: [2, 4, 1, 3] },
  'Gb7b5': { frets: [3, 4, 2, 3], fingers: [2, 4, 1, 3] },
  'G7b5': { frets: [0, 2, 1, 2], fingers: [0, 3, 1, 4] },
  'G#7b5': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'Ab7b5': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
  'A7b5': { frets: [2, 1, 0, 1], fingers: [3, 1, 0, 2] },
  'A#7b5': { frets: [3, 2, 1, 2], fingers: [4, 2, 1, 3] },
  'Bb7b5': { frets: [3, 2, 1, 2], fingers: [4, 2, 1, 3] },
  'B7b5': { frets: [4, 3, 2, 3], fingers: [4, 2, 1, 3] },

  // Altered dominants - 7#5 chords  
  'C7#5': { frets: [1, 0, 0, 1], fingers: [1, 0, 0, 2] },
  'C#7#5': { frets: [2, 1, 1, 2], fingers: [3, 1, 2, 4] },
  'Db7#5': { frets: [2, 1, 1, 2], fingers: [3, 1, 2, 4] },
  'D7#5': { frets: [3, 2, 2, 3], fingers: [3, 1, 2, 4] },
  'D#7#5': { frets: [0, 3, 3, 4], fingers: [0, 1, 2, 3] },
  'Eb7#5': { frets: [0, 3, 3, 4], fingers: [0, 1, 2, 3] },
  'E7#5': { frets: [1, 0, 0, 2], fingers: [1, 0, 0, 3] },
  'F7#5': { frets: [2, 1, 1, 3], fingers: [2, 1, 1, 4] },
  'F#7#5': { frets: [3, 2, 2, 4], fingers: [2, 1, 1, 4] },
  'Gb7#5': { frets: [3, 2, 2, 4], fingers: [2, 1, 1, 4] },
  'G7#5': { frets: [0, 3, 3, 2], fingers: [0, 3, 4, 1] },
  'G#7#5': { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4] },
  'Ab7#5': { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4] },
  'A7#5': { frets: [2, 1, 1, 0], fingers: [3, 1, 2, 0] },
  'A#7#5': { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1] },
  'Bb7#5': { frets: [3, 2, 2, 1], fingers: [4, 2, 3, 1] },
  'B7#5': { frets: [0, 3, 3, 2], fingers: [0, 3, 4, 1] }
};
