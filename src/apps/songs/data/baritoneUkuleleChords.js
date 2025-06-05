// Baritone Ukulele chords (4 strings, DGBE): -1 = muted, 0 = open, >0 = fret number
export const baritoneUkuleleChords = {
  // Major chords
  'C': { 
    frets: [-1, 2, 0, 1], 
    fingers: [0, 2, 0, 1],
    inversions: [
      { frets: [5, 5, 5, 3], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [8, 7, 8, 8], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'C#': { 
    frets: [-1, 3, 1, 2], 
    fingers: [0, 3, 1, 2],
    inversions: [
      { frets: [6, 6, 6, 4], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [9, 8, 9, 9], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'Db': { 
    frets: [-1, 3, 1, 2], 
    fingers: [0, 3, 1, 2],
    inversions: [
      { frets: [6, 6, 6, 4], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [9, 8, 9, 9], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'D': { 
    frets: [0, 0, 2, 3], 
    fingers: [0, 0, 1, 3],
    inversions: [
      { frets: [7, 7, 7, 5], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [10, 9, 10, 10], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'D#': { 
    frets: [1, 1, 3, 4], 
    fingers: [1, 1, 3, 4],
    inversions: [
      { frets: [8, 8, 8, 6], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [11, 10, 11, 11], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'Eb': { 
    frets: [1, 1, 3, 4], 
    fingers: [1, 1, 3, 4],
    inversions: [
      { frets: [8, 8, 8, 6], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [11, 10, 11, 11], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'E': { 
    frets: [2, 2, 4, 0], 
    fingers: [1, 2, 4, 0],
    inversions: [
      { frets: [9, 9, 9, 7], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [12, 11, 12, 12], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'F': { 
    frets: [3, 0, 1, 1], 
    fingers: [3, 0, 1, 1],
    inversions: [
      { frets: [10, 10, 10, 8], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [13, 12, 13, 13], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'F#': { 
    frets: [4, 1, 2, 2], 
    fingers: [4, 1, 2, 2],
    inversions: [
      { frets: [11, 11, 11, 9], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [14, 13, 14, 14], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'Gb': { 
    frets: [4, 1, 2, 2], 
    fingers: [4, 1, 2, 2],
    inversions: [
      { frets: [11, 11, 11, 9], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [14, 13, 14, 14], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'G': { 
    frets: [0, 0, 0, 3], 
    fingers: [0, 0, 0, 3],
    inversions: [
      { frets: [12, 12, 12, 10], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [3, 2, 3, 3], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'G#': { 
    frets: [1, 1, 1, 4], 
    fingers: [1, 1, 1, 4],
    inversions: [
      { frets: [13, 13, 13, 11], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [4, 3, 4, 4], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'Ab': { 
    frets: [1, 1, 1, 4], 
    fingers: [1, 1, 1, 4],
    inversions: [
      { frets: [13, 13, 13, 11], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [4, 3, 4, 4], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'A': { 
    frets: [2, 2, 2, 0], 
    fingers: [1, 1, 1, 0],
    inversions: [
      { frets: [14, 14, 14, 12], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [5, 4, 5, 5], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'A#': { 
    frets: [3, 3, 3, 1], 
    fingers: [2, 3, 4, 1],
    inversions: [
      { frets: [15, 15, 15, 13], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [6, 5, 6, 6], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'Bb': { 
    frets: [3, 3, 3, 1], 
    fingers: [2, 3, 4, 1],
    inversions: [
      { frets: [15, 15, 15, 13], fingers: [2, 3, 4, 1], description: "First inversion" },
      { frets: [6, 5, 6, 6], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'B': { 
    frets: [4, 4, 4, 2], 
    fingers: [2, 3, 4, 1],
    inversions: [
      { frets: [7, 6, 7, 7], fingers: [2, 1, 3, 4], description: "Alternative position" },
      { frets: [11, 11, 9, 9], fingers: [3, 4, 1, 2], description: "Higher position" }
    ]
  },
  // Minor chords
  'Cm': { 
    frets: [-1, 1, 0, 1], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [5, 3, 3, 3], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [8, 8, 8, 11], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'C#m': { 
    frets: [-1, 2, 1, 2], 
    fingers: [0, 2, 1, 3],
    inversions: [
      { frets: [6, 4, 4, 4], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [9, 9, 9, 12], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Dbm': { 
    frets: [-1, 2, 1, 2], 
    fingers: [0, 2, 1, 3],
    inversions: [
      { frets: [6, 4, 4, 4], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [9, 9, 9, 12], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Dm': { 
    frets: [0, 0, 1, 1], 
    fingers: [0, 0, 1, 2],
    inversions: [
      { frets: [7, 5, 5, 5], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [10, 10, 10, 13], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'D#m': { 
    frets: [1, 1, 2, 2], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [8, 6, 6, 6], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [11, 11, 11, 14], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Ebm': { 
    frets: [1, 1, 2, 2], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [8, 6, 6, 6], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [11, 11, 11, 14], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Em': { 
    frets: [2, 2, 3, 0], 
    fingers: [1, 2, 3, 0],
    inversions: [
      { frets: [9, 7, 7, 7], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [12, 12, 12, 15], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Fm': { 
    frets: [3, 1, 1, 1], 
    fingers: [3, 1, 1, 1],
    inversions: [
      { frets: [10, 8, 8, 8], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [13, 13, 13, 16], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'F#m': { 
    frets: [4, 2, 2, 2], 
    fingers: [4, 2, 2, 2],
    inversions: [
      { frets: [11, 9, 9, 9], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [2, 2, 0, 2], fingers: [1, 2, 0, 3], description: "Open position" }
    ]
  },
  'Gbm': { 
    frets: [4, 2, 2, 2], 
    fingers: [4, 2, 2, 2],
    inversions: [
      { frets: [11, 9, 9, 9], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [2, 2, 0, 2], fingers: [1, 2, 0, 3], description: "Open position" }
    ]
  },
  'Gm': { 
    frets: [0, 0, 0, 1], 
    fingers: [0, 0, 0, 1],
    inversions: [
      { frets: [12, 10, 10, 10], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [3, 3, 1, 3], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'G#m': { 
    frets: [1, 1, 1, 2], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [13, 11, 11, 11], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [4, 4, 2, 4], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Abm': { 
    frets: [1, 1, 1, 2], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [13, 11, 11, 11], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [4, 4, 2, 4], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Am': { 
    frets: [2, 0, 0, 0], 
    fingers: [1, 0, 0, 0],
    inversions: [
      { frets: [14, 12, 12, 12], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [5, 5, 3, 5], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'A#m': { 
    frets: [3, 1, 1, 1], 
    fingers: [3, 1, 1, 1],
    inversions: [
      { frets: [15, 13, 13, 13], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [6, 6, 4, 6], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Bbm': { 
    frets: [3, 1, 1, 1], 
    fingers: [3, 1, 1, 1],
    inversions: [
      { frets: [15, 13, 13, 13], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [6, 6, 4, 6], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Bm': { 
    frets: [4, 2, 2, 2], 
    fingers: [4, 2, 2, 2],
    inversions: [
      { frets: [7, 7, 5, 7], fingers: [2, 3, 1, 4], description: "Alternative position" },
      { frets: [9, 7, 9, 10], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  // 7th chords
  'C7': { 
    frets: [-1, 2, 0, 3], 
    fingers: [0, 2, 0, 3],
    inversions: [
      { frets: [5, 3, 5, 3], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [8, 8, 7, 8], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'C#7': { 
    frets: [-1, 3, 1, 4], 
    fingers: [0, 3, 1, 4],
    inversions: [
      { frets: [6, 4, 6, 4], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [9, 9, 8, 9], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'Db7': { 
    frets: [-1, 3, 1, 4], 
    fingers: [0, 3, 1, 4],
    inversions: [
      { frets: [6, 4, 6, 4], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [9, 9, 8, 9], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'D7': { 
    frets: [0, 0, 2, 1], 
    fingers: [0, 0, 2, 1],
    inversions: [
      { frets: [7, 5, 7, 5], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [10, 10, 9, 10], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'D#7': { 
    frets: [1, 1, 3, 2], 
    fingers: [1, 1, 3, 2],
    inversions: [
      { frets: [8, 6, 8, 6], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [11, 11, 10, 11], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'Eb7': { 
    frets: [1, 1, 3, 2], 
    fingers: [1, 1, 3, 2],
    inversions: [
      { frets: [8, 6, 8, 6], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [11, 11, 10, 11], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'E7': { 
    frets: [2, 2, 0, 2], 
    fingers: [1, 2, 0, 3],
    inversions: [
      { frets: [9, 7, 9, 7], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [12, 12, 11, 12], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'F7': { 
    frets: [3, 0, 1, 3], 
    fingers: [3, 0, 1, 4],
    inversions: [
      { frets: [10, 8, 10, 8], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [13, 13, 12, 13], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'F#7': { 
    frets: [4, 1, 2, 4], 
    fingers: [4, 1, 2, 4],
    inversions: [
      { frets: [11, 9, 11, 9], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [14, 14, 13, 14], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'Gb7': { 
    frets: [4, 1, 2, 4], 
    fingers: [4, 1, 2, 4],
    inversions: [
      { frets: [11, 9, 11, 9], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [14, 14, 13, 14], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'G7': { 
    frets: [0, 0, 0, 1], 
    fingers: [0, 0, 0, 1],
    inversions: [
      { frets: [12, 10, 12, 10], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [3, 2, 0, 1], fingers: [3, 2, 0, 1], description: "Alternative position" }
    ]
  },
  'G#7': { 
    frets: [1, 1, 1, 2], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [13, 11, 13, 11], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [4, 3, 1, 2], fingers: [3, 2, 1, 4], description: "Alternative position" }
    ]
  },
  'Ab7': { 
    frets: [1, 1, 1, 2], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [13, 11, 13, 11], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [4, 3, 1, 2], fingers: [3, 2, 1, 4], description: "Alternative position" }
    ]
  },
  'A7': { 
    frets: [2, 0, 2, 0], 
    fingers: [1, 0, 2, 0],
    inversions: [
      { frets: [14, 12, 14, 12], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [5, 4, 2, 3], fingers: [3, 2, 1, 4], description: "Alternative position" }
    ]
  },
  'A#7': { 
    frets: [3, 1, 3, 1], 
    fingers: [3, 1, 4, 1],
    inversions: [
      { frets: [15, 13, 15, 13], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [6, 5, 3, 4], fingers: [3, 2, 1, 4], description: "Alternative position" }
    ]
  },
  'Bb7': { 
    frets: [3, 1, 3, 1], 
    fingers: [3, 1, 4, 1],
    inversions: [
      { frets: [15, 13, 15, 13], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [6, 5, 3, 4], fingers: [3, 2, 1, 4], description: "Alternative position" }
    ]
  },
  'B7': { 
    frets: [4, 2, 4, 2], 
    fingers: [4, 2, 4, 2],
    inversions: [
      { frets: [7, 6, 4, 5], fingers: [3, 2, 1, 4], description: "Alternative position" },
      { frets: [9, 7, 7, 9], fingers: [3, 1, 2, 4], description: "Higher position" }
    ]
  },
  // Major 7th chords
  'Cmaj7': { 
    frets: [-1, 2, 0, 0], 
    fingers: [0, 2, 0, 0],
    inversions: [
      { frets: [5, 4, 5, 3], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [8, 7, 7, 7], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'C#maj7': { 
    frets: [-1, 3, 1, 1], 
    fingers: [0, 3, 1, 1],
    inversions: [
      { frets: [6, 5, 6, 4], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [9, 8, 8, 8], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Dbmaj7': { 
    frets: [-1, 3, 1, 1], 
    fingers: [0, 3, 1, 1],
    inversions: [
      { frets: [6, 5, 6, 4], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [9, 8, 8, 8], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Dmaj7': { 
    frets: [0, 0, 2, 2], 
    fingers: [0, 0, 1, 2],
    inversions: [
      { frets: [7, 6, 7, 5], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [10, 9, 9, 9], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'D#maj7': { 
    frets: [1, 1, 3, 3], 
    fingers: [1, 1, 3, 3],
    inversions: [
      { frets: [8, 7, 8, 6], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [11, 10, 10, 10], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Ebmaj7': { 
    frets: [1, 1, 3, 3], 
    fingers: [1, 1, 3, 3],
    inversions: [
      { frets: [8, 7, 8, 6], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [11, 10, 10, 10], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Emaj7': { 
    frets: [2, 2, 4, 1], 
    fingers: [1, 2, 4, 1],
    inversions: [
      { frets: [9, 8, 9, 7], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [12, 11, 11, 11], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Fmaj7': { 
    frets: [3, 0, 1, 0], 
    fingers: [3, 0, 1, 0],
    inversions: [
      { frets: [10, 9, 10, 8], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [13, 12, 12, 12], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'F#maj7': { 
    frets: [4, 1, 2, 1], 
    fingers: [4, 1, 2, 1],
    inversions: [
      { frets: [11, 10, 11, 9], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [14, 13, 13, 13], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Gbmaj7': { 
    frets: [4, 1, 2, 1], 
    fingers: [4, 1, 2, 1],
    inversions: [
      { frets: [11, 10, 11, 9], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [14, 13, 13, 13], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Gmaj7': { 
    frets: [0, 0, 0, 2], 
    fingers: [0, 0, 0, 2],
    inversions: [
      { frets: [12, 11, 12, 10], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [3, 2, 2, 2], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'G#maj7': { 
    frets: [1, 1, 1, 3], 
    fingers: [1, 1, 1, 3],
    inversions: [
      { frets: [13, 12, 13, 11], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [4, 3, 3, 3], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Abmaj7': { 
    frets: [1, 1, 1, 3], 
    fingers: [1, 1, 1, 3],
    inversions: [
      { frets: [13, 12, 13, 11], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [4, 3, 3, 3], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Amaj7': { 
    frets: [2, 0, 1, 0], 
    fingers: [1, 0, 2, 0],
    inversions: [
      { frets: [14, 13, 14, 12], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [5, 4, 4, 4], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'A#maj7': { 
    frets: [3, 1, 2, 1], 
    fingers: [3, 1, 2, 1],
    inversions: [
      { frets: [15, 14, 15, 13], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [6, 5, 5, 5], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Bbmaj7': { 
    frets: [3, 1, 2, 1], 
    fingers: [3, 1, 2, 1],
    inversions: [
      { frets: [15, 14, 15, 13], fingers: [3, 1, 4, 2], description: "Barre form" },
      { frets: [6, 5, 5, 5], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Bmaj7': { 
    frets: [4, 2, 3, 2], 
    fingers: [4, 2, 3, 2],
    inversions: [
      { frets: [7, 6, 6, 6], fingers: [4, 1, 2, 3], description: "Alternative position" },
      { frets: [11, 9, 11, 9], fingers: [3, 1, 4, 2], description: "Higher position" }
    ]
  },
  // Minor 7th chords
  'Cm7': { 
    frets: [-1, 1, 1, 1], 
    fingers: [0, 1, 1, 1],
    inversions: [
      { frets: [3, 3, 3, 6], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [8, 6, 8, 6], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'C#m7': { 
    frets: [-1, 2, 2, 2], 
    fingers: [0, 2, 2, 2],
    inversions: [
      { frets: [4, 4, 4, 7], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [9, 7, 9, 7], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Dbm7': { 
    frets: [-1, 2, 2, 2], 
    fingers: [0, 2, 2, 2],
    inversions: [
      { frets: [4, 4, 4, 7], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [9, 7, 9, 7], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Dm7': { 
    frets: [0, 0, 1, 1], 
    fingers: [0, 0, 1, 1],
    inversions: [
      { frets: [5, 5, 5, 8], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [10, 8, 10, 8], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'D#m7': { 
    frets: [1, 1, 2, 2], 
    fingers: [1, 1, 2, 2],
    inversions: [
      { frets: [6, 6, 6, 9], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [11, 9, 11, 9], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Ebm7': { 
    frets: [1, 1, 2, 2], 
    fingers: [1, 1, 2, 2],
    inversions: [
      { frets: [6, 6, 6, 9], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [11, 9, 11, 9], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Em7': { 
    frets: [2, 2, 3, 0], 
    fingers: [1, 2, 3, 0],
    inversions: [
      { frets: [7, 7, 7, 10], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [12, 10, 12, 10], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Fm7': { 
    frets: [3, 1, 1, 1], 
    fingers: [3, 1, 1, 1],
    inversions: [
      { frets: [8, 8, 8, 11], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [13, 11, 13, 11], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'F#m7': { 
    frets: [4, 2, 2, 2], 
    fingers: [4, 2, 2, 2],
    inversions: [
      { frets: [9, 9, 9, 12], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [14, 12, 14, 12], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Gbm7': { 
    frets: [4, 2, 2, 2], 
    fingers: [4, 2, 2, 2],
    inversions: [
      { frets: [9, 9, 9, 12], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [14, 12, 14, 12], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Gm7': { 
    frets: [0, 0, 0, 1], 
    fingers: [0, 0, 0, 1],
    inversions: [
      { frets: [10, 10, 10, 13], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [3, 3, 3, 6], fingers: [1, 2, 3, 4], description: "Alternative position" }
    ]
  },
  'G#m7': { 
    frets: [1, 1, 1, 2], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [11, 11, 11, 14], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [4, 4, 4, 7], fingers: [1, 2, 3, 4], description: "Alternative position" }
    ]
  },
  'Abm7': { 
    frets: [1, 1, 1, 2], 
    fingers: [1, 1, 1, 2],
    inversions: [
      { frets: [11, 11, 11, 14], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [4, 4, 4, 7], fingers: [1, 2, 3, 4], description: "Alternative position" }
    ]
  },
  'Am7': { 
    frets: [2, 0, 0, 0], 
    fingers: [1, 0, 0, 0],
    inversions: [
      { frets: [12, 12, 12, 15], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [5, 5, 5, 8], fingers: [1, 2, 3, 4], description: "Alternative position" }
    ]
  },
  'A#m7': { 
    frets: [3, 1, 1, 1], 
    fingers: [3, 1, 1, 1],
    inversions: [
      { frets: [13, 13, 13, 16], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [6, 6, 6, 9], fingers: [1, 2, 3, 4], description: "Alternative position" }
    ]
  },
  'Bbm7': { 
    frets: [3, 1, 1, 1], 
    fingers: [3, 1, 1, 1],
    inversions: [
      { frets: [13, 13, 13, 16], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [6, 6, 6, 9], fingers: [1, 2, 3, 4], description: "Alternative position" }
    ]
  },
  'Bm7': { 
    frets: [4, 2, 2, 2], 
    fingers: [4, 2, 2, 2],
    inversions: [
      { frets: [7, 7, 7, 10], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [14, 14, 14, 17], fingers: [1, 2, 3, 4], description: "Alternative position" }
    ]
  },

  // Power chords (5th chords) - root and fifth
  'C5': { frets: [10, 5, -1, -1], fingers: [3, 1, 0, 0] },
  'C#5': { frets: [11, 6, -1, -1], fingers: [3, 1, 0, 0] },
  'Db5': { frets: [11, 6, -1, -1], fingers: [3, 1, 0, 0] },
  'D5': { frets: [0, 7, -1, -1], fingers: [0, 1, 0, 0] },
  'D#5': { frets: [1, 8, -1, -1], fingers: [1, 2, 0, 0] },
  'Eb5': { frets: [1, 8, -1, -1], fingers: [1, 2, 0, 0] },
  'E5': { frets: [2, 9, -1, -1], fingers: [1, 2, 0, 0] },
  'F5': { frets: [3, 10, -1, -1], fingers: [1, 2, 0, 0] },
  'F#5': { frets: [4, 11, -1, -1], fingers: [1, 2, 0, 0] },
  'Gb5': { frets: [4, 11, -1, -1], fingers: [1, 2, 0, 0] },
  'G5': { frets: [5, 0, -1, -1], fingers: [1, 0, 0, 0] },
  'G#5': { frets: [6, 1, -1, -1], fingers: [2, 1, 0, 0] },
  'Ab5': { frets: [6, 1, -1, -1], fingers: [2, 1, 0, 0] },
  'A5': { frets: [7, 2, -1, -1], fingers: [2, 1, 0, 0] },
  'A#5': { frets: [8, 3, -1, -1], fingers: [2, 1, 0, 0] },
  'Bb5': { frets: [8, 3, -1, -1], fingers: [2, 1, 0, 0] },
  'B5': { frets: [9, 4, -1, -1], fingers: [2, 1, 0, 0] },

  // Add9 chords (major triad + 9th interval)
  'Cadd9': { 
    frets: [-1, 2, 0, 3], 
    fingers: [0, 2, 0, 3],
    inversions: [
      { frets: [5, 5, 3, 6], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [10, 10, 8, 11], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'C#add9': { 
    frets: [-1, 3, 1, 4], 
    fingers: [0, 3, 1, 4],
    inversions: [
      { frets: [6, 6, 4, 7], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [11, 11, 9, 12], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'Dbadd9': { 
    frets: [-1, 3, 1, 4], 
    fingers: [0, 3, 1, 4],
    inversions: [
      { frets: [6, 6, 4, 7], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [11, 11, 9, 12], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'Dadd9': { 
    frets: [0, 0, 2, 1], 
    fingers: [0, 0, 2, 1],
    inversions: [
      { frets: [7, 7, 5, 8], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [12, 12, 10, 13], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'D#add9': { 
    frets: [1, 1, 3, 2], 
    fingers: [1, 1, 3, 2],
    inversions: [
      { frets: [8, 8, 6, 9], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [13, 13, 11, 14], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'Ebadd9': { 
    frets: [1, 1, 3, 2], 
    fingers: [1, 1, 3, 2],
    inversions: [
      { frets: [8, 8, 6, 9], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [13, 13, 11, 14], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'Eadd9': { 
    frets: [2, 2, 4, 3], 
    fingers: [1, 2, 3, 4],
    inversions: [
      { frets: [9, 9, 7, 10], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [14, 14, 12, 15], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'Fadd9': { 
    frets: [3, 0, 1, 1], 
    fingers: [3, 0, 1, 2],
    inversions: [
      { frets: [10, 10, 8, 11], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [15, 15, 13, 16], fingers: [2, 3, 1, 4], description: "Higher position" }
    ]
  },
  'F#add9': { 
    frets: [4, 1, 2, 2], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [11, 11, 9, 12], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [6, 6, 4, 7], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Gbadd9': { 
    frets: [4, 1, 2, 2], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [11, 11, 9, 12], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [6, 6, 4, 7], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Gadd9': { 
    frets: [0, 2, 0, 3], 
    fingers: [0, 2, 0, 3],
    inversions: [
      { frets: [12, 12, 10, 13], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [7, 7, 5, 8], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'G#add9': { 
    frets: [1, 3, 1, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [13, 13, 11, 14], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [8, 8, 6, 9], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Abadd9': { 
    frets: [1, 3, 1, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [13, 13, 11, 14], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [8, 8, 6, 9], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Aadd9': { 
    frets: [2, 2, 2, 2], 
    fingers: [1, 2, 3, 4],
    inversions: [
      { frets: [14, 14, 12, 15], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [9, 9, 7, 10], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'A#add9': { 
    frets: [3, 3, 3, 3], 
    fingers: [1, 2, 3, 4],
    inversions: [
      { frets: [15, 15, 13, 16], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [10, 10, 8, 11], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Bbadd9': { 
    frets: [3, 3, 3, 3], 
    fingers: [1, 2, 3, 4],
    inversions: [
      { frets: [15, 15, 13, 16], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [10, 10, 8, 11], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },
  'Badd9': { 
    frets: [4, 4, 4, 4], 
    fingers: [1, 2, 3, 4],
    inversions: [
      { frets: [11, 11, 9, 12], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [16, 16, 14, 17], fingers: [2, 3, 1, 4], description: "Alternative position" }
    ]
  },

  // Sus2 chords (suspended 2nd - replace 3rd with 2nd)
  'Csus2': { 
    frets: [-1, 1, 0, 1], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [5, 3, 5, 3], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [10, 8, 10, 8], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'C#sus2': { 
    frets: [-1, 2, 1, 2], 
    fingers: [0, 2, 1, 3],
    inversions: [
      { frets: [6, 4, 6, 4], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [11, 9, 11, 9], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Dbsus2': { 
    frets: [-1, 2, 1, 2], 
    fingers: [0, 2, 1, 3],
    inversions: [
      { frets: [6, 4, 6, 4], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [11, 9, 11, 9], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Dsus2': { 
    frets: [0, 0, 1, 3], 
    fingers: [0, 0, 1, 3],
    inversions: [
      { frets: [7, 5, 7, 5], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [12, 10, 12, 10], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'D#sus2': { 
    frets: [1, 1, 2, 4], 
    fingers: [1, 1, 2, 4],
    inversions: [
      { frets: [8, 6, 8, 6], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [13, 11, 13, 11], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Ebsus2': { 
    frets: [1, 1, 2, 4], 
    fingers: [1, 1, 2, 4],
    inversions: [
      { frets: [8, 6, 8, 6], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [13, 11, 13, 11], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Esus2': { 
    frets: [2, 2, 3, 0], 
    fingers: [1, 2, 3, 0],
    inversions: [
      { frets: [9, 7, 9, 7], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [14, 12, 14, 12], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'Fsus2': { 
    frets: [3, 0, 1, 1], 
    fingers: [3, 0, 1, 2],
    inversions: [
      { frets: [10, 8, 10, 8], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [15, 13, 15, 13], fingers: [2, 1, 4, 3], description: "Higher position" }
    ]
  },
  'F#sus2': { 
    frets: [4, 1, 2, 2], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [11, 9, 11, 9], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [6, 4, 6, 4], fingers: [2, 1, 4, 3], description: "Alternative position" }
    ]
  },
  'Gbsus2': { 
    frets: [4, 1, 2, 2], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [11, 9, 11, 9], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [6, 4, 6, 4], fingers: [2, 1, 4, 3], description: "Alternative position" }
    ]
  },
  'Gsus2': { 
    frets: [0, 1, 0, 3], 
    fingers: [0, 1, 0, 3],
    inversions: [
      { frets: [12, 10, 12, 10], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [7, 5, 7, 5], fingers: [2, 1, 4, 3], description: "Alternative position" }
    ]
  },
  'G#sus2': { 
    frets: [1, 2, 1, 4], 
    fingers: [1, 2, 3, 4],
    inversions: [
      { frets: [13, 11, 13, 11], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [8, 6, 8, 6], fingers: [2, 1, 4, 3], description: "Alternative position" }
    ]
  },
  'Absus2': { 
    frets: [1, 2, 1, 4], 
    fingers: [1, 2, 3, 4],
    inversions: [
      { frets: [13, 11, 13, 11], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [8, 6, 8, 6], fingers: [2, 1, 4, 3], description: "Alternative position" }
    ]
  },
  'Asus2': { 
    frets: [2, 0, 2, 0], 
    fingers: [1, 0, 2, 0],
    inversions: [
      { frets: [14, 12, 14, 12], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [9, 7, 9, 7], fingers: [2, 1, 4, 3], description: "Alternative position" }
    ]
  },
  'A#sus2': { 
    frets: [3, 1, 3, 1], 
    fingers: [3, 1, 4, 2],
    inversions: [
      { frets: [15, 13, 15, 13], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [10, 8, 10, 8], fingers: [2, 1, 4, 3], description: "Alternative position" }
    ]
  },
  'Bbsus2': { 
    frets: [3, 1, 3, 1], 
    fingers: [3, 1, 4, 2],
    inversions: [
      { frets: [15, 13, 15, 13], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [10, 8, 10, 8], fingers: [2, 1, 4, 3], description: "Alternative position" }
    ]
  },
  'Bsus2': { 
    frets: [4, 2, 4, 2], 
    fingers: [3, 1, 4, 2],
    inversions: [
      { frets: [11, 9, 11, 9], fingers: [2, 1, 4, 3], description: "Barre form" },
      { frets: [16, 14, 16, 14], fingers: [2, 1, 4, 3], description: "Alternative position" }
    ]
  },

  // Sus4 chords (suspended 4th - replace 3rd with 4th)
  'Csus4': { 
    frets: [-1, 3, 0, 1], 
    fingers: [0, 3, 0, 1],
    inversions: [
      { frets: [5, 6, 5, 3], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [10, 11, 10, 8], fingers: [2, 4, 3, 1], description: "Higher position" }
    ]
  },
  'C#sus4': { 
    frets: [-1, 4, 1, 2], 
    fingers: [0, 4, 1, 2],
    inversions: [
      { frets: [6, 7, 6, 4], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [11, 12, 11, 9], fingers: [2, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Dbsus4': { 
    frets: [-1, 4, 1, 2], 
    fingers: [0, 4, 1, 2],
    inversions: [
      { frets: [6, 7, 6, 4], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [11, 12, 11, 9], fingers: [2, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Dsus4': { 
    frets: [0, 3, 2, 3], 
    fingers: [0, 2, 1, 3],
    inversions: [
      { frets: [7, 8, 7, 5], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [12, 13, 12, 10], fingers: [2, 4, 3, 1], description: "Higher position" }
    ]
  },
  'D#sus4': { 
    frets: [1, 4, 3, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [8, 9, 8, 6], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [13, 14, 13, 11], fingers: [2, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Ebsus4': { 
    frets: [1, 4, 3, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [8, 9, 8, 6], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [13, 14, 13, 11], fingers: [2, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Esus4': { 
    frets: [2, 0, 4, 0], 
    fingers: [1, 0, 3, 0],
    inversions: [
      { frets: [9, 10, 9, 7], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [14, 15, 14, 12], fingers: [2, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Fsus4': { 
    frets: [3, 1, 1, 1], 
    fingers: [3, 1, 2, 4],
    inversions: [
      { frets: [10, 11, 10, 8], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [15, 16, 15, 13], fingers: [2, 4, 3, 1], description: "Higher position" }
    ]
  },
  'F#sus4': { 
    frets: [4, 2, 2, 2], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [11, 12, 11, 9], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [6, 7, 6, 4], fingers: [2, 4, 3, 1], description: "Alternative position" }
    ]
  },
  'Gbsus4': { 
    frets: [4, 2, 2, 2], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [11, 12, 11, 9], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [6, 7, 6, 4], fingers: [2, 4, 3, 1], description: "Alternative position" }
    ]
  },
  'Gsus4': { 
    frets: [0, 3, 0, 3], 
    fingers: [0, 2, 0, 3],
    inversions: [
      { frets: [12, 13, 12, 10], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [7, 8, 7, 5], fingers: [2, 4, 3, 1], description: "Alternative position" }
    ]
  },
  'G#sus4': { 
    frets: [1, 4, 1, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [13, 14, 13, 11], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [8, 9, 8, 6], fingers: [2, 4, 3, 1], description: "Alternative position" }
    ]
  },
  'Absus4': { 
    frets: [1, 4, 1, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [13, 14, 13, 11], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [8, 9, 8, 6], fingers: [2, 4, 3, 1], description: "Alternative position" }
    ]
  },
  'Asus4': { 
    frets: [2, 3, 2, 0], 
    fingers: [1, 3, 2, 0],
    inversions: [
      { frets: [14, 15, 14, 12], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [9, 10, 9, 7], fingers: [2, 4, 3, 1], description: "Alternative position" }
    ]
  },
  'A#sus4': { 
    frets: [3, 4, 3, 1], 
    fingers: [2, 4, 3, 1],
    inversions: [
      { frets: [15, 16, 15, 13], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [10, 11, 10, 8], fingers: [2, 4, 3, 1], description: "Alternative position" }
    ]
  },
  'Bbsus4': { 
    frets: [3, 4, 3, 1], 
    fingers: [2, 4, 3, 1],
    inversions: [
      { frets: [15, 16, 15, 13], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [10, 11, 10, 8], fingers: [2, 4, 3, 1], description: "Alternative position" }
    ]
  },
  'Bsus4': { 
    frets: [4, 0, 4, 2], 
    fingers: [3, 0, 4, 1],
    inversions: [
      { frets: [11, 12, 11, 9], fingers: [2, 4, 3, 1], description: "Barre form" },
      { frets: [16, 17, 16, 14], fingers: [2, 4, 3, 1], description: "Alternative position" }
    ]
  },

  // 9th chords (dominant 7th + 9th interval)
  'C9': { 
    frets: [-1, 2, 1, 3], 
    fingers: [0, 2, 1, 3],
    inversions: [
      { frets: [8, 8, 8, 8], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [12, 10, 13, 11], fingers: [3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'C#9': { 
    frets: [-1, 3, 2, 4], 
    fingers: [0, 3, 2, 4],
    inversions: [
      { frets: [9, 9, 9, 9], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [13, 11, 14, 12], fingers: [3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Db9': { 
    frets: [-1, 3, 2, 4], 
    fingers: [0, 3, 2, 4],
    inversions: [
      { frets: [9, 9, 9, 9], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [13, 11, 14, 12], fingers: [3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'D9': { 
    frets: [0, 2, 1, 1], 
    fingers: [0, 3, 1, 2],
    inversions: [
      { frets: [10, 10, 10, 10], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [14, 12, 15, 13], fingers: [3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'D#9': { 
    frets: [1, 3, 2, 2], 
    fingers: [1, 4, 2, 3],
    inversions: [
      { frets: [11, 11, 11, 11], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [15, 13, 16, 14], fingers: [3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Eb9': { 
    frets: [1, 3, 2, 2], 
    fingers: [1, 4, 2, 3],
    inversions: [
      { frets: [11, 11, 11, 11], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [15, 13, 16, 14], fingers: [3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'E9': { 
    frets: [2, 4, 3, 2], 
    fingers: [1, 4, 3, 2],
    inversions: [
      { frets: [12, 12, 12, 12], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [7, 6, 7, 5], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'F9': { 
    frets: [3, 1, 4, 3], 
    fingers: [2, 1, 4, 3],
    inversions: [
      { frets: [13, 13, 13, 13], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [8, 7, 8, 6], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'F#9': { 
    frets: [4, 2, 0, 4], 
    fingers: [3, 1, 0, 4],
    inversions: [
      { frets: [14, 14, 14, 14], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [9, 8, 9, 7], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'Gb9': { 
    frets: [4, 2, 0, 4], 
    fingers: [3, 1, 0, 4],
    inversions: [
      { frets: [14, 14, 14, 14], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [9, 8, 9, 7], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'G9': { 
    frets: [0, 1, 0, 1], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [15, 15, 15, 15], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [10, 9, 10, 8], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'G#9': { 
    frets: [1, 2, 1, 2], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 6, 6, 6], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [11, 10, 11, 9], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'Ab9': { 
    frets: [1, 2, 1, 2], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 6, 6, 6], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [11, 10, 11, 9], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'A9': { 
    frets: [2, 1, 2, 0], 
    fingers: [2, 1, 3, 0],
    inversions: [
      { frets: [7, 7, 7, 7], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [12, 11, 12, 10], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'A#9': { 
    frets: [3, 2, 3, 1], 
    fingers: [3, 2, 4, 1],
    inversions: [
      { frets: [8, 8, 8, 8], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [13, 12, 13, 11], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'Bb9': { 
    frets: [3, 2, 3, 1], 
    fingers: [3, 2, 4, 1],
    inversions: [
      { frets: [8, 8, 8, 8], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [13, 12, 13, 11], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'B9': { 
    frets: [4, 3, 4, 2], 
    fingers: [3, 2, 4, 1],
    inversions: [
      { frets: [9, 9, 9, 9], fingers: [1, 2, 3, 4], description: "Barre form" },
      { frets: [14, 13, 14, 12], fingers: [3, 1, 4, 2], description: "Alternative position" }
    ]
  },

  // Diminished chords (root + minor 3rd + diminished 5th)
  'Cdim': { 
    frets: [0, 1, 0, 1], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [3, 4, 3, 4], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'C#dim': { 
    frets: [1, 2, 1, 2], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Dbdim': { 
    frets: [1, 2, 1, 2], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Ddim': { 
    frets: [2, 3, 2, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [5, 6, 5, 6], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [8, 9, 8, 9], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'D#dim': { 
    frets: [3, 4, 3, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Ebdim': { 
    frets: [3, 4, 3, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Edim': { 
    frets: [0, 2, 0, 2], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [10, 11, 10, 11], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Fdim': { 
    frets: [1, 3, 1, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [8, 9, 8, 9], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [11, 12, 11, 12], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'F#dim': { 
    frets: [2, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [12, 13, 12, 13], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Gbdim': { 
    frets: [2, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [12, 13, 12, 13], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Gdim': { 
    frets: [3, 0, 3, 0], 
    fingers: [1, 0, 2, 0],
    inversions: [
      { frets: [10, 11, 10, 11], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [13, 14, 13, 14], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'G#dim': { 
    frets: [4, 1, 4, 1], 
    fingers: [3, 1, 4, 2],
    inversions: [
      { frets: [11, 12, 11, 12], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [14, 15, 14, 15], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Abdim': { 
    frets: [4, 1, 4, 1], 
    fingers: [3, 1, 4, 2],
    inversions: [
      { frets: [11, 12, 11, 12], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [14, 15, 14, 15], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Adim': { 
    frets: [0, 2, 0, 2], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [12, 13, 12, 13], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [3, 4, 3, 4], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },
  'A#dim': { 
    frets: [1, 3, 1, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [13, 14, 13, 14], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },
  'Bbdim': { 
    frets: [1, 3, 1, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [13, 14, 13, 14], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },
  'Bdim': { 
    frets: [2, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [14, 15, 14, 15], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [5, 6, 5, 6], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },

  // Diminished 7th chords (diminished triad + diminished 7th)
  'Cdim7': { 
    frets: [0, 1, 0, 1], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [3, 4, 3, 4], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'C#dim7': { 
    frets: [1, 2, 1, 2], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'Dbdim7': { 
    frets: [1, 2, 1, 2], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'Ddim7': { 
    frets: [2, 3, 2, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [5, 6, 5, 6], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [8, 9, 8, 9], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'D#dim7': { 
    frets: [3, 4, 3, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'Ebdim7': { 
    frets: [3, 4, 3, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'Edim7': { 
    frets: [0, 2, 0, 2], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [10, 11, 10, 11], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'Fdim7': { 
    frets: [1, 3, 1, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [8, 9, 8, 9], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [11, 12, 11, 12], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'F#dim7': { 
    frets: [2, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [12, 13, 12, 13], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'Gbdim7': { 
    frets: [2, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [12, 13, 12, 13], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'Gdim7': { 
    frets: [3, 0, 3, 0], 
    fingers: [1, 0, 2, 0],
    inversions: [
      { frets: [10, 11, 10, 11], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [13, 14, 13, 14], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'G#dim7': { 
    frets: [4, 1, 4, 1], 
    fingers: [3, 1, 4, 2],
    inversions: [
      { frets: [11, 12, 11, 12], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [14, 15, 14, 15], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'Abdim7': { 
    frets: [4, 1, 4, 1], 
    fingers: [3, 1, 4, 2],
    inversions: [
      { frets: [11, 12, 11, 12], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [14, 15, 14, 15], fingers: [1, 3, 2, 4], description: "Second inversion" }
    ]
  },
  'Adim7': { 
    frets: [0, 2, 0, 2], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [12, 13, 12, 13], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [3, 4, 3, 4], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },
  'A#dim7': { 
    frets: [1, 3, 1, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [13, 14, 13, 14], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },
  'Bbdim7': { 
    frets: [1, 3, 1, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [13, 14, 13, 14], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },
  'Bdim7': { 
    frets: [2, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [14, 15, 14, 15], fingers: [1, 3, 2, 4], description: "First inversion" },
      { frets: [5, 6, 5, 6], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },

  // Half-diminished chords (m7b5)
  'Cm7b5': { 
    frets: [0, 3, 1, 1], 
    fingers: [0, 4, 1, 2],
    inversions: [
      { frets: [8, 8, 6, 9], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [12, 10, 11, 11], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'C#m7b5': { 
    frets: [1, 4, 2, 2], 
    fingers: [1, 4, 2, 3],
    inversions: [
      { frets: [9, 9, 7, 10], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [13, 11, 12, 12], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Dbm7b5': { 
    frets: [1, 4, 2, 2], 
    fingers: [1, 4, 2, 3],
    inversions: [
      { frets: [9, 9, 7, 10], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [13, 11, 12, 12], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Dm7b5': { 
    frets: [2, 0, 3, 3], 
    fingers: [1, 0, 2, 3],
    inversions: [
      { frets: [10, 10, 8, 11], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [14, 12, 13, 13], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'D#m7b5': { 
    frets: [3, 1, 4, 4], 
    fingers: [2, 1, 3, 4],
    inversions: [
      { frets: [11, 11, 9, 12], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [15, 13, 14, 14], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Ebm7b5': { 
    frets: [3, 1, 4, 4], 
    fingers: [2, 1, 3, 4],
    inversions: [
      { frets: [11, 11, 9, 12], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [15, 13, 14, 14], fingers: [4, 1, 2, 3], description: "Higher position" }
    ]
  },
  'Em7b5': { 
    frets: [0, 2, 0, 2], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [12, 12, 10, 13], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [7, 5, 6, 6], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Fm7b5': { 
    frets: [1, 3, 1, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [13, 13, 11, 14], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [8, 6, 7, 7], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'F#m7b5': { 
    frets: [2, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [14, 14, 12, 15], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [9, 7, 8, 8], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Gbm7b5': { 
    frets: [2, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [14, 14, 12, 15], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [9, 7, 8, 8], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Gm7b5': { 
    frets: [3, 0, 3, 0], 
    fingers: [1, 0, 2, 0],
    inversions: [
      { frets: [15, 15, 13, 16], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [10, 8, 9, 9], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'G#m7b5': { 
    frets: [4, 1, 4, 1], 
    fingers: [3, 1, 4, 2],
    inversions: [
      { frets: [6, 6, 4, 7], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [11, 9, 10, 10], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Abm7b5': { 
    frets: [4, 1, 4, 1], 
    fingers: [3, 1, 4, 2],
    inversions: [
      { frets: [6, 6, 4, 7], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [11, 9, 10, 10], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Am7b5': { 
    frets: [0, 0, 1, 1], 
    fingers: [0, 0, 1, 2],
    inversions: [
      { frets: [7, 7, 5, 8], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [12, 10, 11, 11], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'A#m7b5': { 
    frets: [1, 1, 2, 2], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [8, 8, 6, 9], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [13, 11, 12, 12], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Bbm7b5': { 
    frets: [1, 1, 2, 2], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [8, 8, 6, 9], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [13, 11, 12, 12], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },
  'Bm7b5': { 
    frets: [2, 2, 3, 3], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [9, 9, 7, 10], fingers: [2, 3, 1, 4], description: "Barre form" },
      { frets: [14, 12, 13, 13], fingers: [4, 1, 2, 3], description: "Alternative position" }
    ]
  },

  // Augmented chords (root + major 3rd + augmented 5th)
  'Caug': { 
    frets: [1, 0, 0, 3], 
    fingers: [1, 0, 0, 4],
    inversions: [
      { frets: [5, 4, 4, 7], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [9, 8, 8, 11], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'C#aug': { 
    frets: [2, 1, 1, 4], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [6, 5, 5, 8], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [10, 9, 9, 12], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'Dbaug': { 
    frets: [2, 1, 1, 4], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [6, 5, 5, 8], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [10, 9, 9, 12], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'Daug': { 
    frets: [3, 2, 2, 0], 
    fingers: [3, 1, 2, 0],
    inversions: [
      { frets: [7, 6, 6, 9], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [11, 10, 10, 13], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'D#aug': { 
    frets: [0, 3, 3, 1], 
    fingers: [0, 3, 4, 1],
    inversions: [
      { frets: [8, 7, 7, 10], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [12, 11, 11, 14], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'Ebaug': { 
    frets: [0, 3, 3, 1], 
    fingers: [0, 3, 4, 1],
    inversions: [
      { frets: [8, 7, 7, 10], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [12, 11, 11, 14], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'Eaug': { 
    frets: [1, 0, 0, 2], 
    fingers: [1, 0, 0, 3],
    inversions: [
      { frets: [9, 8, 8, 11], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [13, 12, 12, 15], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'Faug': { 
    frets: [2, 1, 1, 3], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [10, 9, 9, 12], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [14, 13, 13, 16], fingers: [2, 1, 3, 4], description: "Second inversion" }
    ]
  },
  'F#aug': { 
    frets: [3, 2, 2, 4], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [11, 10, 10, 13], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [7, 6, 6, 9], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'Gbaug': { 
    frets: [3, 2, 2, 4], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [11, 10, 10, 13], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [7, 6, 6, 9], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'Gaug': { 
    frets: [0, 3, 3, 1], 
    fingers: [0, 3, 4, 1],
    inversions: [
      { frets: [12, 11, 11, 14], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [8, 7, 7, 10], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'G#aug': { 
    frets: [1, 4, 4, 2], 
    fingers: [1, 4, 4, 2],
    inversions: [
      { frets: [13, 12, 12, 15], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [9, 8, 8, 11], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'Abaug': { 
    frets: [1, 4, 4, 2], 
    fingers: [1, 4, 4, 2],
    inversions: [
      { frets: [13, 12, 12, 15], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [9, 8, 8, 11], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'Aaug': { 
    frets: [2, 1, 1, 3], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [14, 13, 13, 16], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [10, 9, 9, 12], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'A#aug': { 
    frets: [3, 2, 2, 4], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [7, 6, 6, 9], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [11, 10, 10, 13], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'Bbaug': { 
    frets: [3, 2, 2, 4], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [7, 6, 6, 9], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [11, 10, 10, 13], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },
  'Baug': { 
    frets: [0, 3, 3, 1], 
    fingers: [0, 3, 4, 1],
    inversions: [
      { frets: [8, 7, 7, 10], fingers: [2, 1, 3, 4], description: "First inversion" },
      { frets: [12, 11, 11, 14], fingers: [2, 1, 3, 4], description: "Alternative position" }
    ]
  },

  // Major 9th chords (major 7th + 9th)
  'Cmaj9': {
    frets: [0, 0, 1, 1], 
    fingers: [0, 0, 1, 2],
    inversions: [
      { frets: [5, 4, 5, 5], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [7, 7, 8, 8], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'C#maj9': {
    frets: [1, 1, 2, 2], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [6, 5, 6, 6], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [8, 8, 9, 9], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Dbmaj9': {
    frets: [1, 1, 2, 2], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [6, 5, 6, 6], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [8, 8, 9, 9], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Dmaj9': {
    frets: [2, 2, 3, 3], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [7, 6, 7, 7], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [9, 9, 10, 10], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'D#maj9': {
    frets: [3, 3, 4, 4], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [8, 7, 8, 8], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [10, 10, 11, 11], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Ebmaj9': {
    frets: [3, 3, 4, 4], 
    fingers: [1, 1, 2, 3],
    inversions: [
      { frets: [8, 7, 8, 8], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [10, 10, 11, 11], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Emaj9': {
    frets: [1, 1, 0, 2], 
    fingers: [1, 2, 0, 4],
    inversions: [
      { frets: [9, 8, 9, 9], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [4, 4, 5, 5], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Fmaj9': {
    frets: [2, 2, 1, 3], 
    fingers: [2, 3, 1, 4],
    inversions: [
      { frets: [10, 9, 10, 10], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [5, 5, 6, 6], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'F#maj9': {
    frets: [3, 3, 2, 4], 
    fingers: [2, 3, 1, 4],
    inversions: [
      { frets: [11, 10, 11, 11], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [6, 6, 7, 7], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Gbmaj9': {
    frets: [3, 3, 2, 4], 
    fingers: [2, 3, 1, 4],
    inversions: [
      { frets: [11, 10, 11, 11], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [6, 6, 7, 7], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Gmaj9': {
    frets: [0, 0, 3, 1], 
    fingers: [0, 0, 3, 1],
    inversions: [
      { frets: [12, 11, 12, 12], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [7, 7, 8, 8], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'G#maj9': {
    frets: [1, 1, 4, 2], 
    fingers: [1, 1, 4, 2],
    inversions: [
      { frets: [13, 12, 13, 13], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [8, 8, 9, 9], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Abmaj9': {
    frets: [1, 1, 4, 2], 
    fingers: [1, 1, 4, 2],
    inversions: [
      { frets: [13, 12, 13, 13], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [8, 8, 9, 9], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Amaj9': {
    frets: [2, 1, 0, 2], 
    fingers: [3, 1, 0, 4],
    inversions: [
      { frets: [14, 13, 14, 14], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [9, 9, 10, 10], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'A#maj9': {
    frets: [3, 2, 1, 3], 
    fingers: [3, 2, 1, 4],
    inversions: [
      { frets: [15, 14, 15, 15], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [10, 10, 11, 11], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Bbmaj9': {
    frets: [3, 2, 1, 3], 
    fingers: [3, 2, 1, 4],
    inversions: [
      { frets: [15, 14, 15, 15], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [10, 10, 11, 11], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },
  'Bmaj9': {
    frets: [4, 3, 2, 4], 
    fingers: [3, 2, 1, 4],
    inversions: [
      { frets: [16, 15, 16, 16], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [11, 11, 12, 12], fingers: [1, 2, 3, 4], description: "Higher position" }
    ]
  },

  // Minor 9th chords (m9) - minor 7th chord plus 9th interval
  'Cm9': {
    frets: [0, 3, 1, 3], 
    fingers: [0, 3, 1, 4],
    inversions: [
      { frets: [3, 6, 4, 6], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [8, 11, 9, 11], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'C#m9': {
    frets: [1, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [4, 7, 5, 7], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [9, 12, 10, 12], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Dbm9': {
    frets: [1, 4, 2, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [4, 7, 5, 7], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [9, 12, 10, 12], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Dm9': {
    frets: [2, 2, 1, 3], 
    fingers: [2, 3, 1, 4],
    inversions: [
      { frets: [5, 8, 6, 8], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [10, 13, 11, 13], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'D#m9': {
    frets: [3, 3, 2, 4], 
    fingers: [2, 3, 1, 4],
    inversions: [
      { frets: [6, 9, 7, 9], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [11, 14, 12, 14], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Ebm9': {
    frets: [3, 3, 2, 4], 
    fingers: [2, 3, 1, 4],
    inversions: [
      { frets: [6, 9, 7, 9], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [11, 14, 12, 14], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Em9': {
    frets: [0, 4, 0, 2], 
    fingers: [0, 4, 0, 2],
    inversions: [
      { frets: [7, 10, 8, 10], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [12, 15, 13, 15], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Fm9': {
    frets: [1, 0, 1, 3], 
    fingers: [1, 0, 2, 4],
    inversions: [
      { frets: [8, 11, 9, 11], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [13, 16, 14, 16], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'F#m9': {
    frets: [2, 1, 2, 4], 
    fingers: [2, 1, 3, 4],
    inversions: [
      { frets: [9, 12, 10, 12], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [14, 17, 15, 17], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Gbm9': {
    frets: [2, 1, 2, 4], 
    fingers: [2, 1, 3, 4],
    inversions: [
      { frets: [9, 12, 10, 12], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [14, 17, 15, 17], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Gm9': {
    frets: [0, 2, 3, 1], 
    fingers: [0, 2, 4, 1],
    inversions: [
      { frets: [10, 13, 11, 13], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [15, 18, 16, 18], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'G#m9': {
    frets: [1, 3, 4, 2], 
    fingers: [1, 3, 4, 2],
    inversions: [
      { frets: [11, 14, 12, 14], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [16, 19, 17, 19], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Abm9': {
    frets: [1, 3, 4, 2], 
    fingers: [1, 3, 4, 2],
    inversions: [
      { frets: [11, 14, 12, 14], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [16, 19, 17, 19], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Am9': {
    frets: [0, 0, 0, 0], 
    fingers: [0, 0, 0, 0],
    inversions: [
      { frets: [12, 15, 13, 15], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [17, 20, 18, 20], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'A#m9': {
    frets: [3, 1, 1, 1], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [13, 16, 14, 16], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [18, 21, 19, 21], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Bbm9': {
    frets: [3, 1, 1, 1], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [13, 16, 14, 16], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [18, 21, 19, 21], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Bm9': {
    frets: [4, 2, 2, 2], 
    fingers: [4, 1, 2, 3],
    inversions: [
      { frets: [14, 17, 15, 17], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [19, 22, 20, 22], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },

  // Altered dominants - 7b5 chords
  'C7b5': {
    frets: [0, 1, 0, 1], 
    fingers: [0, 1, 0, 2],
    inversions: [
      { frets: [3, 4, 3, 4], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'C#7b5': {
    frets: [1, 2, 1, 2], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Db7b5': {
    frets: [1, 2, 1, 2], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [4, 5, 4, 5], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'D7b5': {
    frets: [2, 3, 2, 3], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [5, 6, 5, 6], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [8, 9, 8, 9], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'D#7b5': {
    frets: [3, 4, 3, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Eb7b5': {
    frets: [3, 4, 3, 4], 
    fingers: [1, 3, 2, 4],
    inversions: [
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'E7b5': {
    frets: [1, 2, 0, 1], 
    fingers: [1, 3, 0, 2],
    inversions: [
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [10, 11, 10, 11], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'F7b5': {
    frets: [2, 3, 1, 2], 
    fingers: [2, 4, 1, 3],
    inversions: [
      { frets: [8, 9, 8, 9], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [11, 12, 11, 12], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'F#7b5': {
    frets: [3, 4, 2, 3], 
    fingers: [2, 4, 1, 3],
    inversions: [
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [12, 13, 12, 13], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Gb7b5': {
    frets: [3, 4, 2, 3], 
    fingers: [2, 4, 1, 3],
    inversions: [
      { frets: [9, 10, 9, 10], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [12, 13, 12, 13], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'G7b5': {
    frets: [0, 1, 3, 4], 
    fingers: [0, 1, 3, 4],
    inversions: [
      { frets: [10, 11, 10, 11], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [13, 14, 13, 14], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'G#7b5': {
    frets: [1, 2, 4, 0], 
    fingers: [1, 2, 4, 0],
    inversions: [
      { frets: [11, 12, 11, 12], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [14, 15, 14, 15], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'Ab7b5': {
    frets: [1, 2, 4, 0], 
    fingers: [1, 2, 4, 0],
    inversions: [
      { frets: [11, 12, 11, 12], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [14, 15, 14, 15], fingers: [1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'A7b5': {
    frets: [2, 1, 0, 1], 
    fingers: [3, 1, 0, 2],
    inversions: [
      { frets: [12, 13, 12, 13], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [5, 6, 5, 6], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },
  'A#7b5': {
    frets: [3, 2, 1, 2], 
    fingers: [4, 2, 1, 3],
    inversions: [
      { frets: [13, 14, 13, 14], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },
  'Bb7b5': {
    frets: [3, 2, 1, 2], 
    fingers: [4, 2, 1, 3],
    inversions: [
      { frets: [13, 14, 13, 14], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [6, 7, 6, 7], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },
  'B7b5': {
    frets: [4, 3, 2, 3], 
    fingers: [4, 2, 1, 3],
    inversions: [
      { frets: [14, 15, 14, 15], fingers: [1, 3, 2, 4], description: "Barre form" },
      { frets: [7, 8, 7, 8], fingers: [1, 3, 2, 4], description: "Alternative position" }
    ]
  },

  // Altered dominants - 7#5 chords  
  'C7#5': {
    frets: [1, 0, 0, 1], 
    fingers: [1, 0, 0, 2],
    inversions: [
      { frets: [13, 12, 12, 13], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [8, 7, 7, 8], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'C#7#5': {
    frets: [2, 1, 1, 2], 
    fingers: [3, 1, 2, 4],
    inversions: [
      { frets: [14, 13, 13, 14], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [9, 8, 8, 9], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'Db7#5': {
    frets: [2, 1, 1, 2], 
    fingers: [3, 1, 2, 4],
    inversions: [
      { frets: [14, 13, 13, 14], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [9, 8, 8, 9], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'D7#5': {
    frets: [3, 2, 2, 3], 
    fingers: [3, 1, 2, 4],
    inversions: [
      { frets: [15, 14, 14, 15], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [10, 9, 9, 10], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'D#7#5': {
    frets: [0, 3, 3, 4], 
    fingers: [0, 1, 2, 3],
    inversions: [
      { frets: [4, 3, 3, 4], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [11, 10, 10, 11], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'Eb7#5': {
    frets: [0, 3, 3, 4], 
    fingers: [0, 1, 2, 3],
    inversions: [
      { frets: [4, 3, 3, 4], fingers: [4, 1, 2, 3], description: "Barre form" },
      { frets: [11, 10, 10, 11], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'E7#5': {
    frets: [1, 0, 0, 2], 
    fingers: [1, 0, 0, 3],
    inversions: [
      { frets: [13, 12, 12, 14], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [8, 7, 7, 9], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'F7#5': {
    frets: [2, 1, 1, 3], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [14, 13, 13, 15], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [9, 8, 8, 10], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'F#7#5': {
    frets: [3, 2, 2, 4], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [15, 14, 14, 16], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [10, 9, 9, 11], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'Gb7#5': {
    frets: [3, 2, 2, 4], 
    fingers: [2, 1, 1, 4],
    inversions: [
      { frets: [15, 14, 14, 16], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [10, 9, 9, 11], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'G7#5': {
    frets: [0, 3, 3, 1], 
    fingers: [0, 3, 4, 1],
    inversions: [
      { frets: [12, 15, 15, 13], fingers: [1, 3, 4, 2], description: "Barre form" },
      { frets: [7, 10, 10, 8], fingers: [1, 3, 4, 2], description: "Higher position" }
    ]
  },
  'G#7#5': {
    frets: [1, 0, 0, 2], 
    fingers: [1, 0, 0, 3],
    inversions: [
      { frets: [13, 12, 12, 14], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [8, 7, 7, 9], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'Ab7#5': {
    frets: [1, 0, 0, 2], 
    fingers: [1, 0, 0, 3],
    inversions: [
      { frets: [13, 12, 12, 14], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [8, 7, 7, 9], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'A7#5': {
    frets: [2, 1, 1, 3], 
    fingers: [3, 1, 2, 4],
    inversions: [
      { frets: [14, 13, 13, 15], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [9, 8, 8, 10], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'A#7#5': {
    frets: [3, 2, 2, 4], 
    fingers: [4, 2, 3, 1],
    inversions: [
      { frets: [15, 14, 14, 16], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [10, 9, 9, 11], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'Bb7#5': {
    frets: [3, 2, 2, 4], 
    fingers: [4, 2, 3, 1],
    inversions: [
      { frets: [15, 14, 14, 16], fingers: [2, 1, 3, 4], description: "Barre form" },
      { frets: [10, 9, 9, 11], fingers: [2, 1, 3, 4], description: "Higher position" }
    ]
  },
  'B7#5': {
    frets: [0, 3, 3, 1], 
    fingers: [0, 3, 4, 1],
    inversions: [
      { frets: [12, 15, 15, 13], fingers: [1, 3, 4, 2], description: "Barre form" },
      { frets: [7, 10, 10, 8], fingers: [1, 3, 4, 2], description: "Higher position" }
    ]
  }
};
