// Guitar chords (6 strings): -1 = muted, 0 = open, >0 = fret number
export const guitarChords = {
  // Major chords
  'C': { 
    frets: [-1, 3, 2, 0, 1, 0], 
    fingers: [0, 3, 2, 0, 1, 0],
    inversions: [
      { frets: [-1, -1, 5, 5, 5, 3], fingers: [0, 0, 2, 3, 4, 1] }, // Barre form
      { frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1] }   // High position barre
    ]
  },
  'C#': { 
    frets: [-1, -1, 3, 1, 2, 1], 
    fingers: [0, 0, 4, 1, 3, 2],
    inversions: [
      { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1] }, // Barre form
      { frets: [9, 11, 11, 10, 9, 9], fingers: [1, 3, 4, 2, 1, 1] } // High position barre
    ]
  },
  'Db': { 
    frets: [-1, -1, 3, 1, 2, 1], 
    fingers: [0, 0, 4, 1, 3, 2],
    inversions: [
      { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1] }, // Barre form
      { frets: [9, 11, 11, 10, 9, 9], fingers: [1, 3, 4, 2, 1, 1] } // High position barre
    ]
  },
  'D': { 
    frets: [-1, -1, 0, 2, 3, 2], 
    fingers: [0, 0, 0, 1, 3, 2],
    inversions: [
      { frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 2, 3, 4, 1], description: "Barre form" },
      { frets: [10, 12, 12, 11, 10, 10], fingers: [1, 3, 4, 2, 1, 1], description: "High position barre" }
    ]
  },
  'D#': { 
    frets: [-1, -1, 1, 3, 4, 3], 
    fingers: [0, 0, 1, 2, 4, 3],
    inversions: [
      { frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], description: "Barre form" },
      { frets: [11, 13, 13, 12, 11, 11], fingers: [1, 3, 4, 2, 1, 1], description: "High position barre" }
    ]
  },
  'Eb': { 
    frets: [-1, -1, 1, 3, 4, 3], 
    fingers: [0, 0, 1, 2, 4, 3],
    inversions: [
      { frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], description: "Barre form" },
      { frets: [11, 13, 13, 12, 11, 11], fingers: [1, 3, 4, 2, 1, 1], description: "High position barre" }
    ]
  },
  'E': { 
    frets: [0, 2, 2, 1, 0, 0], 
    fingers: [0, 2, 3, 1, 0, 0],
    inversions: [
      { frets: [-1, 7, 9, 9, 9, 7], fingers: [0, 1, 2, 3, 4, 1], description: "Barre form" },
      { frets: [12, 14, 14, 13, 12, 12], fingers: [1, 3, 4, 2, 1, 1], description: "High position barre" }
    ]
  },
  'F': { 
    frets: [1, 3, 3, 2, 1, 1], 
    fingers: [1, 3, 4, 2, 1, 1],
    inversions: [
      { frets: [-1, 8, 10, 10, 10, 8], fingers: [0, 1, 2, 3, 4, 1], description: "Barre form" },
      { frets: [13, 15, 15, 14, 13, 13], fingers: [1, 3, 4, 2, 1, 1], description: "High position barre" }
    ]
  },
  'F#': { 
    frets: [2, 4, 4, 3, 2, 2], 
    fingers: [1, 3, 4, 2, 1, 1],
    inversions: [
      { frets: [-1, 9, 11, 11, 11, 9], fingers: [0, 1, 2, 3, 4, 1], description: "Barre form" },
      { frets: [14, 16, 16, 15, 14, 14], fingers: [1, 3, 4, 2, 1, 1], description: "High position barre" }
    ]
  },
  'Gb': { 
    frets: [2, 4, 4, 3, 2, 2], 
    fingers: [1, 3, 4, 2, 1, 1],
    inversions: [
      { frets: [-1, 9, 11, 11, 11, 9], fingers: [0, 1, 2, 3, 4, 1], description: "Barre form" },
      { frets: [14, 16, 16, 15, 14, 14], fingers: [1, 3, 4, 2, 1, 1], description: "High position barre" }
    ]
  },
  'G': { 
    frets: [3, 2, 0, 0, 3, 3], 
    fingers: [3, 2, 0, 0, 4, 4],
    inversions: [
      { frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 10, 12, 12, 12, 10], fingers: [0, 1, 2, 3, 4, 1], description: "High position" }
    ]
  },
  'G#': { 
    frets: [4, 6, 6, 5, 4, 4], 
    fingers: [1, 3, 4, 2, 1, 1],
    inversions: [
      { frets: [-1, 11, 13, 13, 13, 11], fingers: [0, 1, 2, 3, 4, 1], description: "Barre form" },
      { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], description: "Alternative position" }
    ]
  },
  'Ab': { 
    frets: [4, 6, 6, 5, 4, 4], 
    fingers: [1, 3, 4, 2, 1, 1],
    inversions: [
      { frets: [-1, 11, 13, 13, 13, 11], fingers: [0, 1, 2, 3, 4, 1], description: "Barre form" },
      { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], description: "Alternative position" }
    ]
  },
  'A': { 
    frets: [-1, 0, 2, 2, 2, 0], 
    fingers: [0, 0, 1, 2, 3, 0],
    inversions: [
      { frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 12, 14, 14, 14, 12], fingers: [0, 1, 2, 3, 4, 1], description: "High position" }
    ]
  },
  'A#': { 
    frets: [-1, 1, 3, 3, 3, 1], 
    fingers: [0, 1, 2, 3, 4, 1],
    inversions: [
      { frets: [6, 8, 8, 7, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 15, 13], fingers: [0, 1, 2, 3, 4, 1], description: "High position" }
    ]
  },
  'Bb': { 
    frets: [-1, 1, 3, 3, 3, 1], 
    fingers: [0, 1, 2, 3, 4, 1],
    inversions: [
      { frets: [6, 8, 8, 7, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 15, 13], fingers: [0, 1, 2, 3, 4, 1], description: "High position" }
    ]
  },
  'B': { 
    frets: [-1, 2, 4, 4, 4, 2], 
    fingers: [0, 1, 3, 4, 4, 1],
    inversions: [
      { frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 14, 16, 16, 16, 14], fingers: [0, 1, 2, 3, 4, 1], description: "High position" }
    ]
  },
  
  // Minor chords
  'Cm': { 
    frets: [-1, 3, 5, 5, 4, 3], 
    fingers: [0, 1, 3, 4, 2, 1],
    inversions: [
      { frets: [8, 10, 10, 8, 8, 8], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'C#m': { 
    frets: [-1, -1, 2, 1, 2, 0], 
    fingers: [0, 0, 3, 1, 4, 0],
    inversions: [
      { frets: [9, 11, 11, 9, 9, 9], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Dbm': { 
    frets: [-1, -1, 2, 1, 2, 0], 
    fingers: [0, 0, 3, 1, 4, 0],
    inversions: [
      { frets: [9, 11, 11, 9, 9, 9], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Dm': { 
    frets: [-1, -1, 0, 2, 3, 1], 
    fingers: [0, 0, 0, 2, 3, 1],
    inversions: [
      { frets: [10, 12, 12, 10, 10, 10], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 5, 7, 7, 6, 5], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'D#m': { 
    frets: [-1, -1, 1, 3, 4, 2], 
    fingers: [0, 0, 1, 3, 4, 2],
    inversions: [
      { frets: [11, 13, 13, 11, 11, 11], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Ebm': { 
    frets: [-1, -1, 1, 3, 4, 2], 
    fingers: [0, 0, 1, 3, 4, 2],
    inversions: [
      { frets: [11, 13, 13, 11, 11, 11], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Em': { 
    frets: [0, 2, 2, 0, 0, 0], 
    fingers: [0, 2, 3, 0, 0, 0],
    inversions: [
      { frets: [12, 14, 14, 12, 12, 12], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 7, 9, 9, 8, 7], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Fm': { 
    frets: [1, 3, 3, 1, 1, 1], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [13, 15, 15, 13, 13, 13], fingers: [1, 3, 4, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 8, 10, 10, 9, 8], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'F#m': { 
    frets: [2, 4, 4, 2, 2, 2], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [14, 16, 16, 14, 14, 14], fingers: [1, 3, 4, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 11, 11, 10, 9], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Gbm': { 
    frets: [2, 4, 4, 2, 2, 2], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [14, 16, 16, 14, 14, 14], fingers: [1, 3, 4, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 11, 11, 10, 9], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Gm': { 
    frets: [3, 5, 5, 3, 3, 3], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [15, 17, 17, 15, 15, 15], fingers: [1, 3, 4, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 10, 12, 12, 11, 10], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'G#m': { 
    frets: [4, 6, 6, 4, 4, 4], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [-1, 11, 13, 13, 12, 11], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" },
      { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], description: "Standard barre" }
    ]
  },
  'Abm': { 
    frets: [4, 6, 6, 4, 4, 4], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [-1, 11, 13, 13, 12, 11], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" },
      { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], description: "Standard barre" }
    ]
  },
  'Am': { 
    frets: [-1, 0, 2, 2, 1, 0], 
    fingers: [0, 0, 2, 3, 1, 0],
    inversions: [
      { frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 12, 14, 14, 13, 12], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'A#m': { 
    frets: [-1, 1, 3, 3, 2, 1], 
    fingers: [0, 1, 3, 4, 2, 1],
    inversions: [
      { frets: [6, 8, 8, 6, 6, 6], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 14, 13], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'Bbm': { 
    frets: [-1, 1, 3, 3, 2, 1], 
    fingers: [0, 1, 3, 4, 2, 1],
    inversions: [
      { frets: [6, 8, 8, 6, 6, 6], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 14, 13], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'Bm': { 
    frets: [-1, 2, 4, 4, 3, 2], 
    fingers: [0, 1, 3, 4, 2, 1],
    inversions: [
      { frets: [7, 9, 9, 7, 7, 7], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 14, 16, 16, 15, 14], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  
  // 7th chords
  'C7': { 
    frets: [-1, 3, 2, 3, 1, 0], 
    fingers: [0, 3, 2, 4, 1, 0],
    inversions: [
      { frets: [-1, -1, 3, 3, 3, 1], fingers: [0, 0, 2, 3, 4, 1], description: "Compact form" },
      { frets: [8, 10, 8, 9, 8, 8], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" }
    ]
  },
  'C#7': { 
    frets: [-1, -1, 3, 4, 2, 4], 
    fingers: [0, 0, 2, 3, 1, 4],
    inversions: [
      { frets: [9, 11, 9, 10, 9, 9], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 3, 4, 2, 2], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative fingering" }
    ]
  },
  'Db7': { 
    frets: [-1, -1, 3, 4, 2, 4], 
    fingers: [0, 0, 2, 3, 1, 4],
    inversions: [
      { frets: [9, 11, 9, 10, 9, 9], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 3, 4, 2, 2], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative fingering" }
    ]
  },
  'D7': { 
    frets: [-1, -1, 0, 2, 1, 2], 
    fingers: [0, 0, 0, 3, 1, 2],
    inversions: [
      { frets: [-1, 5, 4, 5, 3, 3], fingers: [0, 3, 1, 4, 1, 2], description: "Moveable form" },
      { frets: [10, 12, 10, 11, 10, 10], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" }
    ]
  },
  'D#7': { 
    frets: [-1, -1, 1, 3, 2, 3], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 11, 12, 11, 11], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 5, 6, 4, 4], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Eb7': { 
    frets: [-1, -1, 1, 3, 2, 3], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 11, 12, 11, 11], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 5, 6, 4, 4], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'E7': { 
    frets: [0, 2, 0, 1, 0, 0], 
    fingers: [0, 2, 0, 1, 0, 0],
    inversions: [
      { frets: [12, 14, 12, 13, 12, 12], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 7, 6, 7, 5, 5], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative position" }
    ]
  },
  'F7': { 
    frets: [1, 3, 1, 2, 1, 1], 
    fingers: [1, 3, 1, 2, 1, 1],
    inversions: [
      { frets: [13, 15, 13, 14, 13, 13], fingers: [1, 3, 1, 2, 1, 1], description: "Higher barre" },
      { frets: [-1, 8, 7, 8, 6, 6], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative position" }
    ]
  },
  'F#7': { 
    frets: [2, 4, 2, 3, 2, 2], 
    fingers: [1, 4, 1, 2, 1, 1],
    inversions: [
      { frets: [14, 16, 14, 15, 14, 14], fingers: [1, 3, 1, 2, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 8, 9, 7, 7], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative position" }
    ]
  },
  'Gb7': { 
    frets: [2, 4, 2, 3, 2, 2], 
    fingers: [1, 4, 1, 2, 1, 1],
    inversions: [
      { frets: [14, 16, 14, 15, 14, 14], fingers: [1, 3, 1, 2, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 8, 9, 7, 7], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative position" }
    ]
  },
  'G7': { 
    frets: [3, 2, 0, 0, 0, 1], 
    fingers: [3, 2, 0, 0, 0, 1],
    inversions: [
      { frets: [3, 5, 3, 4, 3, 3], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 10, 9, 10, 8, 8], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'G#7': { 
    frets: [4, 6, 4, 5, 4, 4], 
    fingers: [1, 4, 1, 3, 1, 1],
    inversions: [
      { frets: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], description: "Alternate fingering" },
      { frets: [-1, 11, 10, 11, 9, 9], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Ab7': { 
    frets: [4, 6, 4, 5, 4, 4], 
    fingers: [1, 4, 1, 3, 1, 1],
    inversions: [
      { frets: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], description: "Alternate fingering" },
      { frets: [-1, 11, 10, 11, 9, 9], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'A7': { 
    frets: [-1, 0, 2, 0, 2, 0], 
    fingers: [0, 0, 2, 0, 3, 0],
    inversions: [
      { frets: [5, 7, 5, 6, 5, 5], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 12, 11, 12, 10, 10], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'A#7': { 
    frets: [-1, 1, 3, 1, 3, 1], 
    fingers: [0, 1, 3, 1, 4, 1],
    inversions: [
      { frets: [6, 8, 6, 7, 6, 6], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 12, 13, 11, 11], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Bb7': { 
    frets: [-1, 1, 3, 1, 3, 1], 
    fingers: [0, 1, 3, 1, 4, 1],
    inversions: [
      { frets: [6, 8, 6, 7, 6, 6], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 12, 13, 11, 11], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'B7': { 
    frets: [-1, 2, 1, 2, 0, 2], 
    fingers: [0, 2, 1, 3, 0, 4],
    inversions: [
      { frets: [7, 9, 7, 8, 7, 7], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 14, 13, 14, 12, 12], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  
  // Major 7th chords
  'Cmaj7': { 
    frets: [-1, 3, 2, 0, 0, 0], 
    fingers: [0, 3, 2, 0, 0, 0],
    inversions: [
      { frets: [-1, -1, 5, 5, 5, 3], fingers: [0, 0, 2, 3, 4, 1], description: "Barre form" },
      { frets: [8, 10, 9, 9, 8, 8], fingers: [1, 3, 2, 4, 1, 1], description: "High position barre" }
    ]
  },
  'C#maj7': { 
    frets: [-1, -1, 3, 1, 1, 1], 
    fingers: [0, 0, 4, 1, 2, 3],
    inversions: [
      { frets: [9, 11, 10, 10, 9, 9], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 3, 1, 1, 1], fingers: [0, 4, 3, 1, 1, 2], description: "Alternative position" }
    ]
  },
  'Dbmaj7': { 
    frets: [-1, -1, 3, 1, 1, 1], 
    fingers: [0, 0, 4, 1, 2, 3],
    inversions: [
      { frets: [9, 11, 10, 10, 9, 9], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 3, 1, 1, 1], fingers: [0, 4, 3, 1, 1, 2], description: "Alternative position" }
    ]
  },
  'Dmaj7': { 
    frets: [-1, -1, 0, 2, 2, 2], 
    fingers: [0, 0, 0, 1, 2, 3],
    inversions: [
      { frets: [10, 12, 11, 11, 10, 10], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 5, 4, 2, 2, 2], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'D#maj7': { 
    frets: [-1, -1, 1, 3, 3, 3], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [11, 13, 12, 12, 11, 11], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 5, 3, 3, 3], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'Ebmaj7': { 
    frets: [-1, -1, 1, 3, 3, 3], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [11, 13, 12, 12, 11, 11], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 5, 3, 3, 3], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'Emaj7': { 
    frets: [0, 2, 1, 1, 0, 0], 
    fingers: [0, 3, 1, 2, 0, 0],
    inversions: [
      { frets: [12, 14, 13, 13, 12, 12], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 7, 6, 4, 4, 4], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'Fmaj7': { 
    frets: [1, 3, 2, 2, 1, 1], 
    fingers: [1, 4, 2, 3, 1, 1],
    inversions: [
      { frets: [13, 15, 14, 14, 13, 13], fingers: [1, 3, 2, 4, 1, 1], description: "Higher barre" },
      { frets: [-1, 8, 7, 5, 5, 5], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'F#maj7': { 
    frets: [2, 4, 3, 3, 2, 2], 
    fingers: [1, 4, 2, 3, 1, 1],
    inversions: [
      { frets: [14, 16, 15, 15, 14, 14], fingers: [1, 3, 2, 4, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 8, 6, 6, 6], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'Gbmaj7': { 
    frets: [2, 4, 3, 3, 2, 2], 
    fingers: [1, 4, 2, 3, 1, 1],
    inversions: [
      { frets: [14, 16, 15, 15, 14, 14], fingers: [1, 3, 2, 4, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 8, 6, 6, 6], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'Gmaj7': { 
    frets: [3, 2, 0, 0, 0, 2], 
    fingers: [3, 2, 0, 0, 0, 1],
    inversions: [
      { frets: [3, 5, 4, 4, 3, 3], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 10, 9, 7, 7, 7], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'G#maj7': { 
    frets: [4, 6, 5, 5, 4, 4], 
    fingers: [1, 4, 2, 3, 1, 1],
    inversions: [
      { frets: [4, 6, 5, 5, 4, 4], fingers: [1, 3, 2, 4, 1, 1], description: "Alternative fingering" },
      { frets: [-1, 11, 10, 8, 8, 8], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'Abmaj7': { 
    frets: [4, 6, 5, 5, 4, 4], 
    fingers: [1, 4, 2, 3, 1, 1],
    inversions: [
      { frets: [4, 6, 5, 5, 4, 4], fingers: [1, 3, 2, 4, 1, 1], description: "Alternative fingering" },
      { frets: [-1, 11, 10, 8, 8, 8], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'Amaj7': { 
    frets: [-1, 0, 2, 1, 2, 0], 
    fingers: [0, 0, 3, 1, 4, 0],
    inversions: [
      { frets: [5, 7, 6, 6, 5, 5], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 12, 11, 9, 9, 9], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'A#maj7': { 
    frets: [-1, 1, 3, 2, 3, 1], 
    fingers: [0, 1, 3, 2, 4, 1],
    inversions: [
      { frets: [6, 8, 7, 7, 6, 6], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 12, 10, 10, 10], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'Bbmaj7': { 
    frets: [-1, 1, 3, 2, 3, 1], 
    fingers: [0, 1, 3, 2, 4, 1],
    inversions: [
      { frets: [6, 8, 7, 7, 6, 6], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 12, 10, 10, 10], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  'Bmaj7': { 
    frets: [-1, 2, 4, 3, 4, 2], 
    fingers: [0, 1, 3, 2, 4, 1],
    inversions: [
      { frets: [7, 9, 8, 8, 7, 7], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 14, 13, 11, 11, 11], fingers: [0, 4, 3, 1, 1, 2], description: "Higher position" }
    ]
  },
  
  // Minor 7th chords
  'Cm7': { 
    frets: [-1, 3, 1, 3, 1, 3], 
    fingers: [0, 3, 1, 4, 1, 2],
    inversions: [
      { frets: [8, 10, 8, 8, 8, 8], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, -1, 3, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], description: "Compact form" }
    ]
  },
  'C#m7': { 
    frets: [-1, -1, 2, 4, 2, 4], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [9, 11, 9, 9, 9, 9], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 2, 4, 2, 4], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative position" }
    ]
  },
  'Dbm7': { 
    frets: [-1, -1, 2, 4, 2, 4], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [9, 11, 9, 9, 9, 9], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 2, 4, 2, 4], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative position" }
    ]
  },
  'Dm7': { 
    frets: [-1, -1, 0, 2, 1, 1], 
    fingers: [0, 0, 0, 3, 1, 2],
    inversions: [
      { frets: [10, 12, 10, 10, 10, 10], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 5, 3, 5, 3, 5], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'D#m7': { 
    frets: [-1, -1, 1, 3, 2, 2], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 11, 11, 11, 11], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 4, 6, 4, 6], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Ebm7': { 
    frets: [-1, -1, 1, 3, 2, 2], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 11, 11, 11, 11], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 4, 6, 4, 6], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Em7': { 
    frets: [0, 2, 0, 0, 0, 0], 
    fingers: [0, 2, 0, 0, 0, 0],
    inversions: [
      { frets: [12, 14, 12, 12, 12, 12], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 7, 5, 7, 5, 7], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Fm7': { 
    frets: [1, 3, 1, 1, 1, 1], 
    fingers: [1, 3, 1, 1, 1, 1],
    inversions: [
      { frets: [13, 15, 13, 13, 13, 13], fingers: [1, 3, 1, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 8, 6, 8, 6, 8], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'F#m7': { 
    frets: [2, 4, 2, 2, 2, 2], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [14, 16, 14, 14, 14, 14], fingers: [1, 3, 1, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 7, 9, 7, 9], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Gbm7': { 
    frets: [2, 4, 2, 2, 2, 2], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [14, 16, 14, 14, 14, 14], fingers: [1, 3, 1, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 7, 9, 7, 9], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Gm7': { 
    frets: [3, 5, 3, 3, 3, 3], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [15, 17, 15, 15, 15, 15], fingers: [1, 3, 1, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 10, 8, 10, 8, 10], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'G#m7': { 
    frets: [4, 6, 4, 4, 4, 4], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], description: "Alternative fingering" },
      { frets: [-1, 11, 9, 11, 9, 11], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Abm7': { 
    frets: [4, 6, 4, 4, 4, 4], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], description: "Alternative fingering" },
      { frets: [-1, 11, 9, 11, 9, 11], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Am7': { 
    frets: [-1, 0, 2, 0, 1, 0], 
    fingers: [0, 0, 2, 0, 1, 0],
    inversions: [
      { frets: [5, 7, 5, 5, 5, 5], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 12, 10, 12, 10, 12], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'A#m7': { 
    frets: [-1, 1, 2, 1, 2, 4], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [6, 8, 6, 6, 6, 6], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 11, 13, 11, 13], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Bbm7': { 
    frets: [-1, 1, 2, 1, 2, 4], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [6, 8, 6, 6, 6, 6], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 11, 13, 11, 13], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Bm7': { 
    frets: [-1, 2, 3, 2, 3, 5], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [7, 9, 7, 7, 7, 7], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 14, 12, 14, 12, 14], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },

  // Power chords (5th chords)
  'C5': { 
    frets: [-1, 3, 5, 5, -1, -1], 
    fingers: [0, 1, 3, 4, 0, 0],
    inversions: [
      { frets: [8, 10, 10, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, -1, 10, 12, 13, -1], fingers: [0, 0, 1, 3, 4, 0], description: "High fret alternative" }
    ]
  },
  'C#5': { 
    frets: [-1, 4, 6, 6, -1, -1], 
    fingers: [0, 1, 3, 4, 0, 0],
    inversions: [
      { frets: [9, 11, 11, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, -1, 11, 13, 14, -1], fingers: [0, 0, 1, 3, 4, 0], description: "High fret alternative" }
    ]
  },
  'Db5': { 
    frets: [-1, 4, 6, 6, -1, -1], 
    fingers: [0, 1, 3, 4, 0, 0],
    inversions: [
      { frets: [9, 11, 11, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, -1, 11, 13, 14, -1], fingers: [0, 0, 1, 3, 4, 0], description: "High fret alternative" }
    ]
  },
  'D5': { 
    frets: [-1, -1, 0, 2, 3, -1], 
    fingers: [0, 0, 0, 1, 2, 0],
    inversions: [
      { frets: [10, 12, 12, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 5, 7, 7, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" }
    ]
  },
  'D#5': { 
    frets: [-1, -1, 1, 3, 4, -1], 
    fingers: [0, 0, 1, 3, 4, 0],
    inversions: [
      { frets: [11, 13, 13, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 6, 8, 8, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" }
    ]
  },
  'Eb5': { 
    frets: [-1, -1, 1, 3, 4, -1], 
    fingers: [0, 0, 1, 3, 4, 0],
    inversions: [
      { frets: [11, 13, 13, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 6, 8, 8, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" }
    ]
  },
  'E5': { 
    frets: [0, 2, 2, -1, -1, -1], 
    fingers: [0, 1, 2, 0, 0, 0],
    inversions: [
      { frets: [12, 14, 14, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 7, 9, 9, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" }
    ]
  },
  'F5': { 
    frets: [1, 3, 3, -1, -1, -1], 
    fingers: [1, 3, 4, 0, 0, 0],
    inversions: [
      { frets: [13, 15, 15, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 8, 10, 10, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" }
    ]
  },
  'F#5': { 
    frets: [2, 4, 4, -1, -1, -1], 
    fingers: [1, 3, 4, 0, 0, 0],
    inversions: [
      { frets: [14, 16, 16, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 9, 11, 11, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" }
    ]
  },
  'Gb5': { 
    frets: [2, 4, 4, -1, -1, -1], 
    fingers: [1, 3, 4, 0, 0, 0],
    inversions: [
      { frets: [14, 16, 16, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 9, 11, 11, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" }
    ]
  },
  'G5': { 
    frets: [3, 5, 5, -1, -1, -1], 
    fingers: [1, 3, 4, 0, 0, 0],
    inversions: [
      { frets: [15, 17, 17, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 10, 12, 12, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" }
    ]
  },
  'G#5': { 
    frets: [4, 6, 6, -1, -1, -1], 
    fingers: [1, 3, 4, 0, 0, 0],
    inversions: [
      { frets: [-1, 11, 13, 13, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" },
      { frets: [-1, -1, 1, 3, 4, -1], fingers: [0, 0, 1, 3, 4, 0], description: "Lower position" }
    ]
  },
  'Ab5': { 
    frets: [4, 6, 6, -1, -1, -1], 
    fingers: [1, 3, 4, 0, 0, 0],
    inversions: [
      { frets: [-1, 11, 13, 13, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "Mid-neck position" },
      { frets: [-1, -1, 1, 3, 4, -1], fingers: [0, 0, 1, 3, 4, 0], description: "Lower position" }
    ]
  },
  'A5': { 
    frets: [-1, 0, 2, 2, -1, -1], 
    fingers: [0, 0, 1, 2, 0, 0],
    inversions: [
      { frets: [5, 7, 7, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 12, 14, 14, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "High fret position" }
    ]
  },
  'A#5': { 
    frets: [-1, 1, 3, 3, -1, -1], 
    fingers: [0, 1, 3, 4, 0, 0],
    inversions: [
      { frets: [6, 8, 8, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 13, 15, 15, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "High fret position" }
    ]
  },
  'Bb5': { 
    frets: [-1, 1, 3, 3, -1, -1], 
    fingers: [0, 1, 3, 4, 0, 0],
    inversions: [
      { frets: [6, 8, 8, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 13, 15, 15, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "High fret position" }
    ]
  },
  'B5': { 
    frets: [-1, 2, 4, 4, -1, -1], 
    fingers: [0, 1, 3, 4, 0, 0],
    inversions: [
      { frets: [7, 9, 9, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], description: "Higher position" },
      { frets: [-1, 14, 16, 16, -1, -1], fingers: [0, 1, 3, 4, 0, 0], description: "High fret position" }
    ]
  },

  // Sixth chords (6th chords)
  'C6': { 
    frets: [-1, 3, 2, 2, 1, 0], 
    fingers: [0, 4, 2, 3, 1, 0],
    inversions: [
      { frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, -1, 5, 5, 6, 5], fingers: [0, 0, 1, 2, 4, 3], description: "Higher position" }
    ]
  },
  'C#6': { 
    frets: [-1, -1, 3, 3, 2, 1], 
    fingers: [0, 0, 3, 4, 2, 1],
    inversions: [
      { frets: [9, 11, 11, 10, 9, 9], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 3, 4, 4, 1], description: "Alternative position" }
    ]
  },
  'Db6': { 
    frets: [-1, -1, 3, 3, 2, 1], 
    fingers: [0, 0, 3, 4, 2, 1],
    inversions: [
      { frets: [9, 11, 11, 10, 9, 9], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 3, 4, 4, 1], description: "Alternative position" }
    ]
  },
  'D6': { 
    frets: [-1, -1, 0, 2, 0, 2], 
    fingers: [0, 0, 0, 2, 0, 3],
    inversions: [
      { frets: [10, 12, 12, 11, 10, 10], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'D#6': { 
    frets: [-1, -1, 1, 3, 1, 3], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [11, 13, 13, 12, 11, 11], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'Eb6': { 
    frets: [-1, -1, 1, 3, 1, 3], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [11, 13, 13, 12, 11, 11], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'E6': { 
    frets: [0, 2, 2, 1, 2, 0], 
    fingers: [0, 2, 3, 1, 4, 0],
    inversions: [
      { frets: [12, 14, 14, 13, 12, 12], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 7, 9, 9, 9, 7], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'F6': { 
    frets: [1, 3, 3, 2, 3, 1], 
    fingers: [1, 3, 4, 2, 4, 1],
    inversions: [
      { frets: [13, 15, 15, 14, 13, 13], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 8, 10, 10, 10, 8], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'F#6': { 
    frets: [2, 4, 4, 3, 4, 2], 
    fingers: [1, 3, 4, 2, 4, 1],
    inversions: [
      { frets: [14, 16, 16, 15, 14, 14], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 9, 11, 11, 11, 9], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'Gb6': { 
    frets: [2, 4, 4, 3, 4, 2], 
    fingers: [1, 3, 4, 2, 4, 1],
    inversions: [
      { frets: [14, 16, 16, 15, 14, 14], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 9, 11, 11, 11, 9], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'G6': { 
    frets: [3, 2, 0, 0, 0, 0], 
    fingers: [3, 2, 0, 0, 0, 0],
    inversions: [
      { frets: [15, 17, 17, 16, 15, 15], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 10, 12, 12, 12, 10], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'G#6': { 
    frets: [4, 6, 6, 5, 6, 4], 
    fingers: [1, 3, 4, 2, 4, 1],
    inversions: [
      { frets: [-1, -1, 1, 1, 1, 4], fingers: [0, 0, 1, 2, 3, 4], description: "Compact form" },
      { frets: [-1, 11, 13, 13, 13, 11], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'Ab6': { 
    frets: [4, 6, 6, 5, 6, 4], 
    fingers: [1, 3, 4, 2, 4, 1],
    inversions: [
      { frets: [-1, -1, 1, 1, 1, 4], fingers: [0, 0, 1, 2, 3, 4], description: "Compact form" },
      { frets: [-1, 11, 13, 13, 13, 11], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'A6': { 
    frets: [-1, 0, 2, 2, 2, 2], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 12, 14, 14, 14, 12], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'A#6': { 
    frets: [-1, 1, 3, 3, 3, 3], 
    fingers: [0, 1, 2, 3, 4, 4],
    inversions: [
      { frets: [6, 8, 8, 7, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 15, 13], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'Bb6': { 
    frets: [-1, 1, 3, 3, 3, 3], 
    fingers: [0, 1, 2, 3, 4, 4],
    inversions: [
      { frets: [6, 8, 8, 7, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 15, 13], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },
  'B6': { 
    frets: [-1, 2, 4, 4, 4, 4], 
    fingers: [0, 1, 2, 3, 4, 4],
    inversions: [
      { frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 14, 16, 16, 16, 14], fingers: [0, 1, 3, 4, 4, 1], description: "Higher position" }
    ]
  },

  // Minor 6th chords
  'Cm6': { 
    frets: [-1, 3, 1, 2, 1, 3], 
    fingers: [0, 4, 1, 3, 2, 4],
    inversions: [
      { frets: [8, 10, 8, 9, 8, 11], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, -1, 5, 6, 5, 8], fingers: [0, 0, 1, 3, 2, 4], description: "Higher position" }
    ]
  },
  'C#m6': { 
    frets: [-1, -1, 2, 3, 2, 4], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [9, 11, 9, 10, 9, 12], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 4, 6, 7, 6, 9], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Dbm6': { 
    frets: [-1, -1, 2, 3, 2, 4], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [9, 11, 9, 10, 9, 12], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 4, 6, 7, 6, 9], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Dm6': { 
    frets: [-1, -1, 0, 2, 0, 1], 
    fingers: [0, 0, 0, 3, 0, 1],
    inversions: [
      { frets: [10, 12, 10, 11, 10, 13], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 5, 7, 8, 7, 10], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'D#m6': { 
    frets: [-1, -1, 1, 3, 1, 2], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 11, 12, 11, 14], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 6, 8, 9, 8, 11], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Ebm6': { 
    frets: [-1, -1, 1, 3, 1, 2], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 11, 12, 11, 14], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 6, 8, 9, 8, 11], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Em6': { 
    frets: [0, 2, 2, 0, 2, 0], 
    fingers: [0, 2, 3, 0, 4, 0],
    inversions: [
      { frets: [12, 14, 12, 13, 12, 15], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 7, 9, 10, 9, 12], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Fm6': { 
    frets: [1, 3, 3, 1, 3, 1], 
    fingers: [1, 3, 4, 1, 4, 1],
    inversions: [
      { frets: [13, 15, 13, 14, 13, 16], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 8, 10, 11, 10, 13], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'F#m6': { 
    frets: [2, 4, 4, 2, 4, 2], 
    fingers: [1, 3, 4, 1, 4, 1],
    inversions: [
      { frets: [14, 16, 14, 15, 14, 17], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 9, 11, 12, 11, 14], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Gbm6': { 
    frets: [2, 4, 4, 2, 4, 2], 
    fingers: [1, 3, 4, 1, 4, 1],
    inversions: [
      { frets: [14, 16, 14, 15, 14, 17], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 9, 11, 12, 11, 14], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Gm6': { 
    frets: [3, 5, 5, 3, 5, 3], 
    fingers: [1, 3, 4, 1, 4, 1],
    inversions: [
      { frets: [15, 17, 15, 16, 15, 18], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 10, 12, 13, 12, 15], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'G#m6': { 
    frets: [4, 6, 6, 4, 6, 4], 
    fingers: [1, 3, 4, 1, 4, 1],
    inversions: [
      { frets: [-1, -1, 1, 2, 1, 4], fingers: [0, 0, 1, 3, 2, 4], description: "Compact form" },
      { frets: [-1, 11, 13, 14, 13, 16], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Abm6': { 
    frets: [4, 6, 6, 4, 6, 4], 
    fingers: [1, 3, 4, 1, 4, 1],
    inversions: [
      { frets: [-1, -1, 1, 2, 1, 4], fingers: [0, 0, 1, 3, 2, 4], description: "Compact form" },
      { frets: [-1, 11, 13, 14, 13, 16], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Am6': { 
    frets: [-1, 0, 2, 2, 1, 2], 
    fingers: [0, 0, 2, 3, 1, 4],
    inversions: [
      { frets: [5, 7, 7, 5, 7, 5], fingers: [1, 3, 4, 1, 4, 1], description: "Barre form" },
      { frets: [-1, 12, 14, 15, 14, 17], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'A#m6': { 
    frets: [-1, 1, 3, 3, 2, 3], 
    fingers: [0, 1, 3, 4, 2, 4],
    inversions: [
      { frets: [6, 8, 8, 6, 8, 6], fingers: [1, 3, 4, 1, 4, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 16, 15, 18], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Bbm6': { 
    frets: [-1, 1, 3, 3, 2, 3], 
    fingers: [0, 1, 3, 4, 2, 4],
    inversions: [
      { frets: [6, 8, 8, 6, 8, 6], fingers: [1, 3, 4, 1, 4, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 16, 15, 18], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Bm6': { 
    frets: [-1, 2, 4, 4, 3, 4], 
    fingers: [0, 1, 3, 4, 2, 4],
    inversions: [
      { frets: [7, 9, 9, 7, 9, 7], fingers: [1, 3, 4, 1, 4, 1], description: "Barre form" },
      { frets: [-1, 14, 16, 17, 16, 19], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },

  // Add9 chords (major triad + 9th)
  'Cadd9': { 
    frets: [-1, 3, 2, 0, 3, 0], 
    fingers: [0, 3, 2, 0, 4, 0],
    inversions: [
      { frets: [0, 3, 0, 2, 1, 0], fingers: [0, 4, 0, 3, 1, 0], description: "Open position" },
      { frets: [8, 10, 10, 9, 8, 10], fingers: [1, 3, 4, 2, 1, 4], description: "Higher position" }
    ]
  },
  'C#add9': { 
    frets: [-1, -1, 3, 1, 4, 1], 
    fingers: [0, 0, 3, 1, 4, 2],
    inversions: [
      { frets: [9, 11, 11, 10, 9, 11], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 4, 3, 1, 4, 1], fingers: [0, 4, 3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'Dbadd9': { 
    frets: [-1, -1, 3, 1, 4, 1], 
    fingers: [0, 0, 3, 1, 4, 2],
    inversions: [
      { frets: [9, 11, 11, 10, 9, 11], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 4, 3, 1, 4, 1], fingers: [0, 4, 3, 1, 4, 2], description: "Alternative position" }
    ]
  },
  'Dadd9': { 
    frets: [-1, -1, 0, 2, 3, 0], 
    fingers: [0, 0, 0, 1, 3, 0],
    inversions: [
      { frets: [10, 12, 12, 11, 10, 12], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 5, 4, 2, 5, 2], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'D#add9': { 
    frets: [-1, -1, 1, 3, 4, 1], 
    fingers: [0, 0, 1, 3, 4, 2],
    inversions: [
      { frets: [11, 13, 13, 12, 11, 13], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 6, 5, 3, 6, 3], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Ebadd9': { 
    frets: [-1, -1, 1, 3, 4, 1], 
    fingers: [0, 0, 1, 3, 4, 2],
    inversions: [
      { frets: [11, 13, 13, 12, 11, 13], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 6, 5, 3, 6, 3], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Eadd9': { 
    frets: [0, 2, 2, 1, 0, 2], 
    fingers: [0, 2, 3, 1, 0, 4],
    inversions: [
      { frets: [12, 14, 14, 13, 12, 14], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 7, 6, 4, 7, 4], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Fadd9': { 
    frets: [1, 3, 3, 2, 1, 3], 
    fingers: [1, 3, 4, 2, 1, 4],
    inversions: [
      { frets: [13, 15, 15, 14, 13, 15], fingers: [1, 3, 4, 2, 1, 4], description: "Higher barre" },
      { frets: [-1, 8, 7, 5, 8, 5], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'F#add9': { 
    frets: [2, 4, 4, 3, 2, 4], 
    fingers: [1, 3, 4, 2, 1, 4],
    inversions: [
      { frets: [14, 16, 16, 15, 14, 16], fingers: [1, 3, 4, 2, 1, 4], description: "Higher barre" },
      { frets: [-1, 9, 8, 6, 9, 6], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Gbadd9': { 
    frets: [2, 4, 4, 3, 2, 4], 
    fingers: [1, 3, 4, 2, 1, 4],
    inversions: [
      { frets: [14, 16, 16, 15, 14, 16], fingers: [1, 3, 4, 2, 1, 4], description: "Higher barre" },
      { frets: [-1, 9, 8, 6, 9, 6], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Gadd9': { 
    frets: [3, 2, 0, 0, 0, 3], 
    fingers: [3, 2, 0, 0, 0, 4],
    inversions: [
      { frets: [3, 5, 5, 4, 3, 5], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 10, 9, 7, 10, 7], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'G#add9': { 
    frets: [4, 6, 6, 5, 4, 6], 
    fingers: [1, 3, 4, 2, 1, 4],
    inversions: [
      { frets: [4, 6, 6, 5, 4, 6], fingers: [1, 3, 4, 2, 1, 4], description: "Alternative fingering" },
      { frets: [-1, 11, 10, 8, 11, 8], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Abadd9': { 
    frets: [4, 6, 6, 5, 4, 6], 
    fingers: [1, 3, 4, 2, 1, 4],
    inversions: [
      { frets: [4, 6, 6, 5, 4, 6], fingers: [1, 3, 4, 2, 1, 4], description: "Alternative fingering" },
      { frets: [-1, 11, 10, 8, 11, 8], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Aadd9': { 
    frets: [-1, 0, 2, 2, 0, 0], 
    fingers: [0, 0, 2, 3, 0, 0],
    inversions: [
      { frets: [5, 7, 7, 6, 5, 7], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 12, 11, 9, 12, 9], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'A#add9': { 
    frets: [-1, 1, 3, 3, 1, 1], 
    fingers: [0, 1, 3, 4, 1, 1],
    inversions: [
      { frets: [6, 8, 8, 7, 6, 8], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 13, 12, 10, 13, 10], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Bbadd9': { 
    frets: [-1, 1, 3, 3, 1, 1], 
    fingers: [0, 1, 3, 4, 1, 1],
    inversions: [
      { frets: [6, 8, 8, 7, 6, 8], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 13, 12, 10, 13, 10], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Badd9': { 
    frets: [-1, 2, 4, 4, 2, 2], 
    fingers: [0, 1, 3, 4, 1, 1],
    inversions: [
      { frets: [7, 9, 9, 8, 7, 9], fingers: [1, 3, 4, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 14, 13, 11, 14, 11], fingers: [0, 4, 3, 1, 4, 2], description: "Higher position" }
    ]
  },

  // Sus2 chords (suspended 2nd)
  'Csus2': { 
    frets: [-1, 3, 0, 0, 1, 0], 
    fingers: [0, 3, 0, 0, 1, 0],
    inversions: [
      { frets: [-1, -1, 5, 5, 6, 5], fingers: [0, 0, 1, 2, 4, 3], description: "Higher position" },
      { frets: [8, 10, 10, 10, 8, 8], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'C#sus2': { 
    frets: [-1, -1, 3, 3, 1, 1], 
    fingers: [0, 0, 3, 4, 1, 2],
    inversions: [
      { frets: [-1, 4, 1, 1, 2, 1], fingers: [0, 4, 1, 2, 3, 1], description: "Alternative position" },
      { frets: [9, 11, 11, 11, 9, 9], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Dbsus2': { 
    frets: [-1, -1, 3, 3, 1, 1], 
    fingers: [0, 0, 3, 4, 1, 2],
    inversions: [
      { frets: [-1, 4, 1, 1, 2, 1], fingers: [0, 4, 1, 2, 3, 1], description: "Alternative position" },
      { frets: [9, 11, 11, 11, 9, 9], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Dsus2': { 
    frets: [-1, -1, 0, 2, 3, 0], 
    fingers: [0, 0, 0, 1, 3, 0],
    inversions: [
      { frets: [-1, 5, 2, 2, 3, 2], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [10, 12, 12, 12, 10, 10], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'D#sus2': { 
    frets: [-1, -1, 1, 3, 4, 1], 
    fingers: [0, 0, 1, 2, 4, 3],
    inversions: [
      { frets: [-1, 6, 3, 3, 4, 3], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [11, 13, 13, 13, 11, 11], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Ebsus2': { 
    frets: [-1, -1, 1, 3, 4, 1], 
    fingers: [0, 0, 1, 2, 4, 3],
    inversions: [
      { frets: [-1, 6, 3, 3, 4, 3], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [11, 13, 13, 13, 11, 11], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Esus2': { 
    frets: [0, 2, 4, 4, 0, 0], 
    fingers: [0, 1, 3, 4, 0, 0],
    inversions: [
      { frets: [-1, 7, 4, 4, 5, 4], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [12, 14, 14, 14, 12, 12], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Fsus2': { 
    frets: [1, 3, 5, 5, 1, 1], 
    fingers: [1, 2, 3, 4, 1, 1],
    inversions: [
      { frets: [-1, 8, 5, 5, 6, 5], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [13, 15, 15, 15, 13, 13], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'F#sus2': { 
    frets: [2, 4, 6, 6, 2, 2], 
    fingers: [1, 2, 3, 4, 1, 1],
    inversions: [
      { frets: [-1, 9, 6, 6, 7, 6], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [14, 16, 16, 16, 14, 14], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Gbsus2': { 
    frets: [2, 4, 6, 6, 2, 2], 
    fingers: [1, 2, 3, 4, 1, 1],
    inversions: [
      { frets: [-1, 9, 6, 6, 7, 6], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [14, 16, 16, 16, 14, 14], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Gsus2': { 
    frets: [3, 0, 0, 0, 3, 3], 
    fingers: [2, 0, 0, 0, 3, 4],
    inversions: [
      { frets: [-1, 10, 7, 7, 8, 7], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [15, 17, 17, 17, 15, 15], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'G#sus2': { 
    frets: [4, 6, 8, 8, 4, 4], 
    fingers: [1, 2, 3, 4, 1, 1],
    inversions: [
      { frets: [-1, 11, 8, 8, 9, 8], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [-1, -1, 1, 1, 4, 4], fingers: [0, 0, 1, 2, 3, 4], description: "Lower position" }
    ]
  },
  'Absus2': { 
    frets: [4, 6, 8, 8, 4, 4], 
    fingers: [1, 2, 3, 4, 1, 1],
    inversions: [
      { frets: [-1, 11, 8, 8, 9, 8], fingers: [0, 4, 1, 2, 3, 1], description: "Higher position" },
      { frets: [-1, -1, 1, 1, 4, 4], fingers: [0, 0, 1, 2, 3, 4], description: "Lower position" }
    ]
  },
  'Asus2': { 
    frets: [-1, 0, 2, 2, 0, 0], 
    fingers: [0, 0, 1, 2, 0, 0],
    inversions: [
      { frets: [5, 7, 9, 9, 5, 5], fingers: [1, 2, 3, 4, 1, 1], description: "Higher position" },
      { frets: [-1, 12, 9, 9, 10, 9], fingers: [0, 4, 1, 2, 3, 1], description: "High fret position" }
    ]
  },
  'A#sus2': { 
    frets: [-1, 1, 3, 3, 1, 1], 
    fingers: [0, 1, 3, 4, 1, 2],
    inversions: [
      { frets: [6, 8, 10, 10, 6, 6], fingers: [1, 2, 3, 4, 1, 1], description: "Higher position" },
      { frets: [-1, 13, 10, 10, 11, 10], fingers: [0, 4, 1, 2, 3, 1], description: "High fret position" }
    ]
  },
  'Bbsus2': { 
    frets: [-1, 1, 3, 3, 1, 1], 
    fingers: [0, 1, 3, 4, 1, 2],
    inversions: [
      { frets: [6, 8, 10, 10, 6, 6], fingers: [1, 2, 3, 4, 1, 1], description: "Higher position" },
      { frets: [-1, 13, 10, 10, 11, 10], fingers: [0, 4, 1, 2, 3, 1], description: "High fret position" }
    ]
  },
  'Bsus2': { 
    frets: [-1, 2, 4, 4, 2, 2], 
    fingers: [0, 1, 3, 4, 1, 2],
    inversions: [
      { frets: [7, 9, 11, 11, 7, 7], fingers: [1, 2, 3, 4, 1, 1], description: "Higher position" },
      { frets: [-1, 14, 11, 11, 12, 11], fingers: [0, 4, 1, 2, 3, 1], description: "High fret position" }
    ]
  },

  // Sus4 chords (suspended 4th)
  'Csus4': { 
    frets: [-1, 3, 3, 0, 1, 1], 
    fingers: [0, 2, 3, 0, 1, 1],
    inversions: [
      { frets: [-1, -1, 6, 6, 6, 4], fingers: [0, 0, 2, 3, 4, 1], description: "Higher position" },
      { frets: [8, 11, 11, 11, 8, 8], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'C#sus4': { 
    frets: [-1, -1, 3, 3, 4, 1], 
    fingers: [0, 0, 2, 3, 4, 1],
    inversions: [
      { frets: [-1, 4, 4, 1, 2, 2], fingers: [0, 3, 4, 1, 2, 2], description: "Alternative position" },
      { frets: [9, 12, 12, 12, 9, 9], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Dbsus4': { 
    frets: [-1, -1, 3, 3, 4, 1], 
    fingers: [0, 0, 2, 3, 4, 1],
    inversions: [
      { frets: [-1, 4, 4, 1, 2, 2], fingers: [0, 3, 4, 1, 2, 2], description: "Alternative position" },
      { frets: [9, 12, 12, 12, 9, 9], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Dsus4': { 
    frets: [-1, -1, 0, 2, 3, 3], 
    fingers: [0, 0, 0, 1, 2, 3],
    inversions: [
      { frets: [-1, 5, 5, 2, 3, 3], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [10, 13, 13, 13, 10, 10], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'D#sus4': { 
    frets: [-1, -1, 1, 3, 4, 4], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [-1, 6, 6, 3, 4, 4], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [11, 14, 14, 14, 11, 11], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Ebsus4': { 
    frets: [-1, -1, 1, 3, 4, 4], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [-1, 6, 6, 3, 4, 4], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [11, 14, 14, 14, 11, 11], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Esus4': { 
    frets: [0, 2, 2, 2, 0, 0], 
    fingers: [0, 1, 2, 3, 0, 0],
    inversions: [
      { frets: [-1, 7, 7, 4, 5, 5], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [12, 15, 15, 15, 12, 12], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Fsus4': { 
    frets: [1, 3, 3, 3, 1, 1], 
    fingers: [1, 2, 3, 4, 1, 1],
    inversions: [
      { frets: [-1, 8, 8, 5, 6, 6], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [13, 16, 16, 16, 13, 13], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'F#sus4': { 
    frets: [2, 4, 4, 4, 2, 2], 
    fingers: [1, 3, 3, 4, 1, 2],
    inversions: [
      { frets: [-1, 9, 9, 6, 7, 7], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [14, 17, 17, 17, 14, 14], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Gbsus4': { 
    frets: [2, 4, 4, 4, 2, 2], 
    fingers: [1, 3, 3, 4, 1, 2],
    inversions: [
      { frets: [-1, 9, 9, 6, 7, 7], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [14, 17, 17, 17, 14, 14], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'Gsus4': { 
    frets: [3, 3, 0, 0, 1, 3], 
    fingers: [3, 4, 0, 0, 1, 3],
    inversions: [
      { frets: [-1, 10, 10, 7, 8, 8], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [15, 18, 18, 18, 15, 15], fingers: [1, 3, 3, 4, 1, 2], description: "Barre form" }
    ]
  },
  'G#sus4': { 
    frets: [4, 6, 6, 6, 4, 4], 
    fingers: [1, 3, 3, 4, 1, 2],
    inversions: [
      { frets: [-1, 11, 11, 8, 9, 9], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [-1, -1, 1, 1, 4, 4], fingers: [0, 0, 1, 2, 3, 4], description: "Lower position" }
    ]
  },
  'Absus4': { 
    frets: [4, 6, 6, 6, 4, 4], 
    fingers: [1, 3, 3, 4, 1, 2],
    inversions: [
      { frets: [-1, 11, 11, 8, 9, 9], fingers: [0, 3, 4, 1, 2, 2], description: "Higher position" },
      { frets: [-1, -1, 1, 1, 4, 4], fingers: [0, 0, 1, 2, 3, 4], description: "Lower position" }
    ]
  },
  'Asus4': { 
    frets: [-1, 0, 2, 2, 3, 0], 
    fingers: [0, 0, 1, 2, 3, 0],
    inversions: [
      { frets: [5, 7, 7, 7, 5, 5], fingers: [1, 3, 3, 4, 1, 2], description: "Higher position" },
      { frets: [-1, 12, 12, 9, 10, 10], fingers: [0, 3, 4, 1, 2, 2], description: "High fret position" }
    ]
  },
  'A#sus4': { 
    frets: [-1, 1, 3, 3, 4, 1], 
    fingers: [0, 1, 2, 3, 4, 1],
    inversions: [
      { frets: [6, 8, 8, 8, 6, 6], fingers: [1, 3, 3, 4, 1, 2], description: "Higher position" },
      { frets: [-1, 13, 13, 10, 11, 11], fingers: [0, 3, 4, 1, 2, 2], description: "High fret position" }
    ]
  },
  'Bbsus4': { 
    frets: [-1, 1, 3, 3, 4, 1], 
    fingers: [0, 1, 2, 3, 4, 1],
    inversions: [
      { frets: [6, 8, 8, 8, 6, 6], fingers: [1, 3, 3, 4, 1, 2], description: "Higher position" },
      { frets: [-1, 13, 13, 10, 11, 11], fingers: [0, 3, 4, 1, 2, 2], description: "High fret position" }
    ]
  },
  'Bsus4': { 
    frets: [-1, 2, 4, 4, 5, 2], 
    fingers: [0, 1, 3, 4, 4, 2],
    inversions: [
      { frets: [7, 9, 9, 9, 7, 7], fingers: [1, 3, 3, 4, 1, 2], description: "Higher position" },
      { frets: [-1, 14, 14, 11, 12, 12], fingers: [0, 3, 4, 1, 2, 2], description: "High fret position" }
    ]
  },

  // 9th chords (dominant 7th + 9th)
  'C9': { 
    frets: [-1, 3, 2, 3, 3, 0], 
    fingers: [0, 2, 1, 3, 4, 0],
    inversions: [
      { frets: [8, 10, 8, 9, 8, 10], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, -1, 2, 3, 3, 3], fingers: [0, 0, 1, 2, 3, 4], description: "Compact form" }
    ]
  },
  'C#9': { 
    frets: [-1, -1, 3, 4, 4, 1], 
    fingers: [0, 0, 2, 3, 4, 1],
    inversions: [
      { frets: [9, 11, 9, 10, 9, 11], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 4, 3, 4, 4, 1], fingers: [0, 3, 1, 4, 4, 1], description: "Alternative position" }
    ]
  },
  'Db9': { 
    frets: [-1, -1, 3, 4, 4, 1], 
    fingers: [0, 0, 2, 3, 4, 1],
    inversions: [
      { frets: [9, 11, 9, 10, 9, 11], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 4, 3, 4, 4, 1], fingers: [0, 3, 1, 4, 4, 1], description: "Alternative position" }
    ]
  },
  'D9': { 
    frets: [-1, -1, 0, 2, 1, 0], 
    fingers: [0, 0, 0, 3, 1, 0],
    inversions: [
      { frets: [10, 12, 10, 11, 10, 12], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 5, 4, 5, 5, 2], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'D#9': { 
    frets: [-1, -1, 1, 3, 2, 1], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 11, 12, 11, 13], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 6, 5, 6, 6, 3], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'Eb9': { 
    frets: [-1, -1, 1, 3, 2, 1], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 11, 12, 11, 13], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 6, 5, 6, 6, 3], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'E9': { 
    frets: [0, 2, 0, 1, 0, 2], 
    fingers: [0, 3, 0, 1, 0, 4],
    inversions: [
      { frets: [12, 14, 12, 13, 12, 14], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 7, 6, 7, 7, 4], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'F9': { 
    frets: [1, 3, 1, 2, 1, 3], 
    fingers: [1, 4, 1, 2, 1, 3],
    inversions: [
      { frets: [13, 15, 13, 14, 13, 15], fingers: [1, 3, 1, 2, 1, 4], description: "Higher barre" },
      { frets: [-1, 8, 7, 8, 8, 5], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'F#9': { 
    frets: [2, 4, 2, 3, 2, 4], 
    fingers: [1, 4, 1, 2, 1, 3],
    inversions: [
      { frets: [14, 16, 14, 15, 14, 16], fingers: [1, 3, 1, 2, 1, 4], description: "Higher barre" },
      { frets: [-1, 9, 8, 9, 9, 6], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'Gb9': { 
    frets: [2, 4, 2, 3, 2, 4], 
    fingers: [1, 4, 1, 2, 1, 3],
    inversions: [
      { frets: [14, 16, 14, 15, 14, 16], fingers: [1, 3, 1, 2, 1, 4], description: "Higher barre" },
      { frets: [-1, 9, 8, 9, 9, 6], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'G9': { 
    frets: [3, 2, 0, 0, 0, 1], 
    fingers: [3, 2, 0, 0, 0, 1],
    inversions: [
      { frets: [3, 5, 3, 4, 3, 5], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 10, 9, 10, 10, 7], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'G#9': { 
    frets: [4, 6, 4, 5, 4, 6], 
    fingers: [1, 4, 1, 2, 1, 3],
    inversions: [
      { frets: [4, 6, 4, 5, 4, 6], fingers: [1, 3, 1, 2, 1, 4], description: "Alternative fingering" },
      { frets: [-1, 11, 10, 11, 11, 8], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'Ab9': { 
    frets: [4, 6, 4, 5, 4, 6], 
    fingers: [1, 4, 1, 2, 1, 3],
    inversions: [
      { frets: [4, 6, 4, 5, 4, 6], fingers: [1, 3, 1, 2, 1, 4], description: "Alternative fingering" },
      { frets: [-1, 11, 10, 11, 11, 8], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'A9': { 
    frets: [-1, 0, 2, 0, 2, 3], 
    fingers: [0, 0, 2, 0, 3, 4],
    inversions: [
      { frets: [5, 7, 5, 6, 5, 7], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 12, 11, 12, 12, 9], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'A#9': { 
    frets: [-1, 1, 3, 1, 3, 4], 
    fingers: [0, 1, 3, 1, 2, 4],
    inversions: [
      { frets: [6, 8, 6, 7, 6, 8], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 13, 12, 13, 13, 10], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'Bb9': { 
    frets: [-1, 1, 3, 1, 3, 4], 
    fingers: [0, 1, 3, 1, 2, 4],
    inversions: [
      { frets: [6, 8, 6, 7, 6, 8], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 13, 12, 13, 13, 10], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },
  'B9': { 
    frets: [-1, 2, 1, 2, 2, 2], 
    fingers: [0, 2, 1, 3, 4, 4],
    inversions: [
      { frets: [7, 9, 7, 8, 7, 9], fingers: [1, 3, 1, 2, 1, 4], description: "Barre form" },
      { frets: [-1, 14, 13, 14, 14, 11], fingers: [0, 3, 1, 4, 4, 1], description: "Higher position" }
    ]
  },

  // Diminished chords (root + minor 3rd + diminished 5th)
  'Cdim': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [0, 1, 2, 0, 2, 0], fingers: [0, 1, 3, 0, 4, 0], description: "Open position" },
      { frets: [-1, 3, 4, 5, 4, 5], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'C#dim': { 
    frets: [-1, -1, 2, 3, 2, 3], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [1, 2, 3, 1, 3, 1], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 4, 5, 6, 5, 6], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Dbdim': { 
    frets: [-1, -1, 2, 3, 2, 3], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [1, 2, 3, 1, 3, 1], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 4, 5, 6, 5, 6], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Ddim': { 
    frets: [-1, -1, 0, 1, 0, 1], 
    fingers: [0, 0, 0, 1, 0, 2],
    inversions: [
      { frets: [2, 3, 4, 2, 4, 2], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 5, 6, 7, 6, 7], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'D#dim': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [3, 4, 5, 3, 5, 3], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 6, 7, 8, 7, 8], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Ebdim': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [3, 4, 5, 3, 5, 3], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 6, 7, 8, 7, 8], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Edim': { 
    frets: [0, 1, 2, 0, 2, 0], 
    fingers: [0, 1, 3, 0, 4, 0],
    inversions: [
      { frets: [4, 5, 6, 4, 6, 4], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 7, 8, 9, 8, 9], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Fdim': { 
    frets: [1, 2, 3, 1, 3, 1], 
    fingers: [1, 2, 4, 1, 3, 1],
    inversions: [
      { frets: [5, 6, 7, 5, 7, 5], fingers: [1, 2, 4, 1, 3, 1], description: "Higher barre" },
      { frets: [-1, 8, 9, 10, 9, 10], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'F#dim': { 
    frets: [2, 3, 4, 2, 4, 2], 
    fingers: [1, 2, 4, 1, 3, 1],
    inversions: [
      { frets: [6, 7, 8, 6, 8, 6], fingers: [1, 2, 4, 1, 3, 1], description: "Higher barre" },
      { frets: [-1, 9, 10, 11, 10, 11], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Gbdim': { 
    frets: [2, 3, 4, 2, 4, 2], 
    fingers: [1, 2, 4, 1, 3, 1],
    inversions: [
      { frets: [6, 7, 8, 6, 8, 6], fingers: [1, 2, 4, 1, 3, 1], description: "Higher barre" },
      { frets: [-1, 9, 10, 11, 10, 11], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Gdim': { 
    frets: [3, 1, 2, 0, 2, 0], 
    fingers: [4, 1, 3, 0, 2, 0],
    inversions: [
      { frets: [7, 8, 9, 7, 9, 7], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 10, 11, 12, 11, 12], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'G#dim': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [8, 9, 10, 8, 10, 8], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 11, 12, 13, 12, 13], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Abdim': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [8, 9, 10, 8, 10, 8], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 11, 12, 13, 12, 13], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Adim': { 
    frets: [-1, 0, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [9, 10, 11, 9, 11, 9], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 12, 13, 14, 13, 14], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'A#dim': { 
    frets: [-1, 1, 2, 3, 2, 3], 
    fingers: [0, 1, 2, 4, 3, 4],
    inversions: [
      { frets: [10, 11, 12, 10, 12, 10], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 13, 14, 15, 14, 15], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Bbdim': { 
    frets: [-1, 1, 2, 3, 2, 3], 
    fingers: [0, 1, 2, 4, 3, 4],
    inversions: [
      { frets: [10, 11, 12, 10, 12, 10], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 13, 14, 15, 14, 15], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Bdim': { 
    frets: [-1, 2, 3, 4, 3, 4], 
    fingers: [0, 1, 2, 4, 3, 4],
    inversions: [
      { frets: [11, 12, 13, 11, 13, 11], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 14, 15, 16, 15, 16], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },

  // Diminished 7th chords (diminished triad + diminished 7th)
  'Cdim7': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [4, 5, 6, 4, 6, 4], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 3, 4, 5, 4, 5], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'C#dim7': { 
    frets: [-1, -1, 2, 3, 2, 3], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [5, 6, 7, 5, 7, 5], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 4, 5, 6, 5, 6], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Dbdim7': { 
    frets: [-1, -1, 2, 3, 2, 3], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [5, 6, 7, 5, 7, 5], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 4, 5, 6, 5, 6], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Ddim7': { 
    frets: [-1, -1, 0, 1, 0, 1], 
    fingers: [0, 0, 0, 1, 0, 2],
    inversions: [
      { frets: [6, 7, 8, 6, 8, 6], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 5, 6, 7, 6, 7], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'D#dim7': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [7, 8, 9, 7, 9, 7], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 6, 7, 8, 7, 8], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Ebdim7': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [7, 8, 9, 7, 9, 7], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 6, 7, 8, 7, 8], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Edim7': { 
    frets: [0, 1, 2, 0, 2, 0], 
    fingers: [0, 1, 3, 0, 4, 0],
    inversions: [
      { frets: [8, 9, 10, 8, 10, 8], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 7, 8, 9, 8, 9], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Fdim7': { 
    frets: [1, 2, 0, 1, 0, 1], 
    fingers: [1, 3, 0, 2, 0, 4],
    inversions: [
      { frets: [9, 10, 11, 9, 11, 9], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 8, 9, 10, 9, 10], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'F#dim7': { 
    frets: [2, 0, 1, 2, 1, 2], 
    fingers: [2, 0, 1, 4, 3, 4],
    inversions: [
      { frets: [10, 11, 12, 10, 12, 10], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 9, 10, 11, 10, 11], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Gbdim7': { 
    frets: [2, 0, 1, 2, 1, 2], 
    fingers: [2, 0, 1, 4, 3, 4],
    inversions: [
      { frets: [10, 11, 12, 10, 12, 10], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 9, 10, 11, 10, 11], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Gdim7': { 
    frets: [3, 1, 2, 0, 2, 0], 
    fingers: [4, 1, 3, 0, 2, 0],
    inversions: [
      { frets: [11, 12, 13, 11, 13, 11], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 10, 11, 12, 11, 12], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'G#dim7': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [12, 13, 14, 12, 14, 12], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 11, 12, 13, 12, 13], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Abdim7': { 
    frets: [-1, -1, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [12, 13, 14, 12, 14, 12], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 11, 12, 13, 12, 13], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Adim7': { 
    frets: [-1, 0, 1, 2, 1, 2], 
    fingers: [0, 0, 1, 3, 2, 4],
    inversions: [
      { frets: [1, 2, 3, 1, 3, 1], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 12, 13, 14, 13, 14], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'A#dim7': { 
    frets: [-1, 1, 2, 3, 2, 3], 
    fingers: [0, 1, 2, 4, 3, 4],
    inversions: [
      { frets: [2, 3, 4, 2, 4, 2], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 13, 14, 15, 14, 15], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Bbdim7': { 
    frets: [-1, 1, 2, 3, 2, 3], 
    fingers: [0, 1, 2, 4, 3, 4],
    inversions: [
      { frets: [2, 3, 4, 2, 4, 2], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 13, 14, 15, 14, 15], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Bdim7': { 
    frets: [-1, 2, 3, 4, 3, 4], 
    fingers: [0, 1, 2, 4, 3, 4],
    inversions: [
      { frets: [3, 4, 5, 3, 5, 3], fingers: [1, 2, 4, 1, 3, 1], description: "Barre position" },
      { frets: [-1, 14, 15, 16, 15, 16], fingers: [0, 1, 2, 4, 3, 4], description: "Higher position" }
    ]
  },

  // Half-diminished chords (m7b5)
  'Cm7b5': { 
    frets: [-1, 3, 4, 3, 4, -1], 
    fingers: [0, 1, 3, 2, 4, 0],
    inversions: [
      { frets: [8, 10, 11, 10, 11, 8], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, -1, 11, 10, 11, 9], fingers: [0, 0, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'C#m7b5': { 
    frets: [-1, 4, 5, 4, 5, -1], 
    fingers: [0, 1, 3, 2, 4, 0],
    inversions: [
      { frets: [9, 11, 12, 11, 12, 9], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, -1, 12, 11, 12, 10], fingers: [0, 0, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Dbm7b5': { 
    frets: [-1, 4, 5, 4, 5, -1], 
    fingers: [0, 1, 3, 2, 4, 0],
    inversions: [
      { frets: [9, 11, 12, 11, 12, 9], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, -1, 12, 11, 12, 10], fingers: [0, 0, 3, 1, 4, 2], description: "Higher position" }
    ]
  },
  'Dm7b5': { 
    frets: [-1, -1, 0, 1, 1, 1], 
    fingers: [0, 0, 0, 1, 2, 3],
    inversions: [
      { frets: [10, 12, 13, 12, 13, 10], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 5, 6, 5, 6, 3], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'D#m7b5': { 
    frets: [-1, -1, 1, 2, 2, 2], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [11, 13, 14, 13, 14, 11], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 6, 7, 6, 7, 4], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'Ebm7b5': { 
    frets: [-1, -1, 1, 2, 2, 2], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [11, 13, 14, 13, 14, 11], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 6, 7, 6, 7, 4], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'Em7b5': { 
    frets: [0, 2, 0, 0, 0, 0], 
    fingers: [0, 2, 0, 0, 0, 0],
    inversions: [
      { frets: [12, 14, 15, 14, 15, 12], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 7, 8, 7, 8, 5], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'Fm7b5': { 
    frets: [1, 3, 1, 1, 1, 1], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [13, 15, 16, 15, 16, 13], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 8, 9, 8, 9, 6], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'F#m7b5': { 
    frets: [2, 4, 2, 2, 2, 2], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [14, 16, 17, 16, 17, 14], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 9, 10, 9, 10, 7], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'Gbm7b5': { 
    frets: [2, 4, 2, 2, 2, 2], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [14, 16, 17, 16, 17, 14], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 9, 10, 9, 10, 7], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'Gm7b5': { 
    frets: [3, 5, 3, 3, 3, 3], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [3, 5, 6, 5, 6, 3], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 10, 11, 10, 11, 8], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'G#m7b5': { 
    frets: [4, 6, 4, 4, 4, 4], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [4, 6, 7, 6, 7, 4], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 11, 12, 11, 12, 9], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'Abm7b5': { 
    frets: [4, 6, 4, 4, 4, 4], 
    fingers: [1, 4, 1, 1, 1, 1],
    inversions: [
      { frets: [4, 6, 7, 6, 7, 4], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 11, 12, 11, 12, 9], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'Am7b5': { 
    frets: [-1, 0, 1, 0, 1, 3], 
    fingers: [0, 0, 1, 0, 2, 4],
    inversions: [
      { frets: [5, 7, 8, 7, 8, 5], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 12, 13, 12, 13, 10], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'A#m7b5': { 
    frets: [-1, 1, 2, 1, 2, 4], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [6, 8, 9, 8, 9, 6], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 13, 14, 13, 14, 11], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'Bbm7b5': { 
    frets: [-1, 1, 2, 1, 2, 4], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [6, 8, 9, 8, 9, 6], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 13, 14, 13, 14, 11], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },
  'Bm7b5': { 
    frets: [-1, 2, 3, 2, 3, 5], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [7, 9, 10, 9, 10, 7], fingers: [1, 2, 4, 3, 4, 1], description: "Barre form" },
      { frets: [-1, 14, 15, 14, 15, 12], fingers: [0, 1, 3, 2, 4, 1], description: "Higher position" }
    ]
  },

  // Augmented chords (root + major 3rd + augmented 5th)
  'Caug': { 
    frets: [-1, 3, 2, 1, 1, 0], 
    fingers: [0, 4, 3, 1, 2, 0],
    inversions: [
      { frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0], description: "Alternative fingering" },
      { frets: [-1, 8, 7, 6, 6, 5], fingers: [0, 4, 3, 1, 2, 1], description: "Higher position" }
    ]
  },
  'C#aug': { 
    frets: [-1, -1, 3, 2, 2, 1], 
    fingers: [0, 0, 4, 2, 3, 1],
    inversions: [
      { frets: [1, 4, 3, 2, 2, 1], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 9, 8, 7, 7, 6], fingers: [0, 4, 3, 1, 2, 1], description: "Higher position" }
    ]
  },
  'Dbaug': { 
    frets: [-1, -1, 3, 2, 2, 1], 
    fingers: [0, 0, 4, 2, 3, 1],
    inversions: [
      { frets: [1, 4, 3, 2, 2, 1], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 9, 8, 7, 7, 6], fingers: [0, 4, 3, 1, 2, 1], description: "Higher position" }
    ]
  },
  'Daug': { 
    frets: [-1, -1, 0, 3, 3, 2], 
    fingers: [0, 0, 0, 2, 3, 1],
    inversions: [
      { frets: [2, 5, 4, 3, 3, 2], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 10, 9, 8, 8, 7], fingers: [0, 4, 3, 1, 2, 1], description: "Higher position" }
    ]
  },
  'D#aug': { 
    frets: [-1, -1, 1, 0, 0, 3], 
    fingers: [0, 0, 1, 0, 0, 4],
    inversions: [
      { frets: [3, 6, 5, 4, 4, 3], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 11, 10, 9, 9, 8], fingers: [0, 4, 3, 1, 2, 1], description: "Higher position" }
    ]
  },
  'Ebaug': { 
    frets: [-1, -1, 1, 0, 0, 3], 
    fingers: [0, 0, 1, 0, 0, 4],
    inversions: [
      { frets: [3, 6, 5, 4, 4, 3], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 11, 10, 9, 9, 8], fingers: [0, 4, 3, 1, 2, 1], description: "Higher position" }
    ]
  },
  'Eaug': { 
    frets: [0, 3, 2, 1, 1, 0], 
    fingers: [0, 4, 3, 1, 2, 0],
    inversions: [
      { frets: [4, 7, 6, 5, 5, 4], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 12, 11, 10, 10, 9], fingers: [0, 4, 3, 1, 2, 1], description: "Higher position" }
    ]
  },
  'Faug': { 
    frets: [1, 4, 3, 2, 2, 1], 
    fingers: [1, 4, 3, 2, 2, 1],
    inversions: [
      { frets: [5, 8, 7, 6, 6, 5], fingers: [1, 4, 3, 2, 2, 1], description: "Higher position" },
      { frets: [-1, 13, 12, 11, 11, 10], fingers: [0, 4, 3, 1, 2, 1], description: "High fret position" }
    ]
  },
  'F#aug': { 
    frets: [2, 5, 4, 3, 3, 2], 
    fingers: [1, 4, 3, 2, 2, 1],
    inversions: [
      { frets: [6, 9, 8, 7, 7, 6], fingers: [1, 4, 3, 2, 2, 1], description: "Higher position" },
      { frets: [-1, 14, 13, 12, 12, 11], fingers: [0, 4, 3, 1, 2, 1], description: "High fret position" }
    ]
  },
  'Gbaug': { 
    frets: [2, 5, 4, 3, 3, 2], 
    fingers: [1, 4, 3, 2, 2, 1],
    inversions: [
      { frets: [6, 9, 8, 7, 7, 6], fingers: [1, 4, 3, 2, 2, 1], description: "Higher position" },
      { frets: [-1, 14, 13, 12, 12, 11], fingers: [0, 4, 3, 1, 2, 1], description: "High fret position" }
    ]
  },
  'Gaug': { 
    frets: [3, 2, 1, 0, 0, 3], 
    fingers: [4, 3, 1, 0, 0, 2],
    inversions: [
      { frets: [7, 10, 9, 8, 8, 7], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 15, 14, 13, 13, 12], fingers: [0, 4, 3, 1, 2, 1], description: "High fret position" }
    ]
  },
  'G#aug': { 
    frets: [4, 3, 2, 1, 1, 4], 
    fingers: [4, 3, 1, 1, 2, 4],
    inversions: [
      { frets: [8, 11, 10, 9, 9, 8], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 16, 15, 14, 14, 13], fingers: [0, 4, 3, 1, 2, 1], description: "High fret position" }
    ]
  },
  'Abaug': { 
    frets: [4, 3, 2, 1, 1, 4], 
    fingers: [4, 3, 1, 1, 2, 4],
    inversions: [
      { frets: [8, 11, 10, 9, 9, 8], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 16, 15, 14, 14, 13], fingers: [0, 4, 3, 1, 2, 1], description: "High fret position" }
    ]
  },
  'Aaug': { 
    frets: [-1, 0, 3, 2, 2, 1], 
    fingers: [0, 0, 4, 2, 3, 1],
    inversions: [
      { frets: [9, 12, 11, 10, 10, 9], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 5, 4, 3, 3, 2], fingers: [0, 4, 3, 1, 2, 1], description: "Alternative position" }
    ]
  },
  'A#aug': { 
    frets: [-1, 1, 4, 3, 3, 2], 
    fingers: [0, 1, 4, 2, 3, 1],
    inversions: [
      { frets: [10, 13, 12, 11, 11, 10], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 6, 5, 4, 4, 3], fingers: [0, 4, 3, 1, 2, 1], description: "Alternative position" }
    ]
  },
  'Bbaug': { 
    frets: [-1, 1, 4, 3, 3, 2], 
    fingers: [0, 1, 4, 2, 3, 1],
    inversions: [
      { frets: [10, 13, 12, 11, 11, 10], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 6, 5, 4, 4, 3], fingers: [0, 4, 3, 1, 2, 1], description: "Alternative position" }
    ]
  },
  'Baug': { 
    frets: [-1, 2, 1, 0, 0, 3], 
    fingers: [0, 2, 1, 0, 0, 4],
    inversions: [
      { frets: [11, 14, 13, 12, 12, 11], fingers: [1, 4, 3, 2, 2, 1], description: "Barre position" },
      { frets: [-1, 7, 6, 5, 5, 4], fingers: [0, 4, 3, 1, 2, 1], description: "Alternative position" }
    ]
  },

  // Major 9th chords (major 7th + 9th)
  'Cmaj9': { 
    frets: [-1, 3, 2, 4, 3, 0], 
    fingers: [0, 2, 1, 4, 3, 0],
    inversions: [
      { frets: [8, 10, 9, 11, 10, 8], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, -1, 2, 4, 3, 3], fingers: [0, 0, 1, 4, 2, 3], description: "Compact form" }
    ]
  },
  'C#maj9': { 
    frets: [-1, 4, 3, 5, 4, 1], 
    fingers: [0, 2, 1, 4, 3, 1],
    inversions: [
      { frets: [9, 11, 10, 12, 11, 9], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, -1, 3, 5, 4, 4], fingers: [0, 0, 1, 4, 2, 3], description: "Compact form" }
    ]
  },
  'Dbmaj9': { 
    frets: [-1, 4, 3, 5, 4, 1], 
    fingers: [0, 2, 1, 4, 3, 1],
    inversions: [
      { frets: [9, 11, 10, 12, 11, 9], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, -1, 3, 5, 4, 4], fingers: [0, 0, 1, 4, 2, 3], description: "Compact form" }
    ]
  },
  'Dmaj9': { 
    frets: [-1, -1, 0, 2, 2, 2], 
    fingers: [0, 0, 0, 1, 2, 3],
    inversions: [
      { frets: [10, 12, 11, 13, 12, 10], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 5, 4, 6, 5, 2], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'D#maj9': { 
    frets: [-1, -1, 1, 3, 3, 3], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [11, 13, 12, 14, 13, 11], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 6, 5, 7, 6, 3], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Ebmaj9': { 
    frets: [-1, -1, 1, 3, 3, 3], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [11, 13, 12, 14, 13, 11], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 6, 5, 7, 6, 3], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Emaj9': { 
    frets: [0, 2, 1, 1, 0, 2], 
    fingers: [0, 3, 1, 2, 0, 4],
    inversions: [
      { frets: [12, 14, 13, 15, 14, 12], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 7, 6, 8, 7, 4], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Fmaj9': { 
    frets: [1, 3, 2, 2, 1, 3], 
    fingers: [1, 4, 2, 3, 1, 4],
    inversions: [
      { frets: [13, 15, 14, 16, 15, 13], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 8, 7, 9, 8, 5], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'F#maj9': { 
    frets: [2, 4, 3, 3, 2, 4], 
    fingers: [1, 4, 2, 3, 1, 4],
    inversions: [
      { frets: [14, 16, 15, 17, 16, 14], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 9, 8, 10, 9, 6], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Gbmaj9': { 
    frets: [2, 4, 3, 3, 2, 4], 
    fingers: [1, 4, 2, 3, 1, 4],
    inversions: [
      { frets: [14, 16, 15, 17, 16, 14], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 9, 8, 10, 9, 6], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Gmaj9': { 
    frets: [3, 0, 0, 2, 0, 2], 
    fingers: [3, 0, 0, 1, 0, 2],
    inversions: [
      { frets: [15, 17, 16, 18, 17, 15], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 10, 9, 11, 10, 7], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'G#maj9': { 
    frets: [4, 1, 1, 3, 1, 3], 
    fingers: [4, 1, 1, 3, 1, 3],
    inversions: [
      { frets: [4, 6, 5, 7, 6, 4], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 11, 10, 12, 11, 8], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Abmaj9': { 
    frets: [4, 1, 1, 3, 1, 3], 
    fingers: [4, 1, 1, 3, 1, 3],
    inversions: [
      { frets: [4, 6, 5, 7, 6, 4], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 11, 10, 12, 11, 8], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Amaj9': { 
    frets: [-1, 0, 2, 1, 2, 4], 
    fingers: [0, 0, 3, 1, 2, 4],
    inversions: [
      { frets: [5, 7, 6, 8, 7, 5], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 12, 11, 13, 12, 9], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'A#maj9': { 
    frets: [-1, 1, 3, 2, 3, 5], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [6, 8, 7, 9, 8, 6], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 13, 12, 14, 13, 10], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Bbmaj9': { 
    frets: [-1, 1, 3, 2, 3, 5], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [6, 8, 7, 9, 8, 6], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 13, 12, 14, 13, 10], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },
  'Bmaj9': { 
    frets: [-1, 2, 4, 3, 4, 6], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [7, 9, 8, 10, 9, 7], fingers: [1, 3, 2, 4, 3, 1], description: "Barre form" },
      { frets: [-1, 14, 13, 15, 14, 11], fingers: [0, 3, 1, 4, 3, 1], description: "Higher position" }
    ]
  },

  // Altered dominants - 7b5 chords
  'C7b5': { 
    frets: [-1, 3, 2, 3, 1, -1], 
    fingers: [0, 3, 1, 4, 2, 0],
    inversions: [
      { frets: [8, 10, 9, 10, 8, 8], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, -1, 9, 10, 8, 9], fingers: [0, 0, 2, 4, 1, 3], description: "Higher position" }
    ]
  },
  'C#7b5': { 
    frets: [-1, 4, 3, 4, 2, -1], 
    fingers: [0, 3, 1, 4, 2, 0],
    inversions: [
      { frets: [9, 11, 10, 11, 9, 9], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, -1, 10, 11, 9, 10], fingers: [0, 0, 2, 4, 1, 3], description: "Higher position" }
    ]
  },
  'Db7b5': { 
    frets: [-1, 4, 3, 4, 2, -1], 
    fingers: [0, 3, 1, 4, 2, 0],
    inversions: [
      { frets: [9, 11, 10, 11, 9, 9], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, -1, 10, 11, 9, 10], fingers: [0, 0, 2, 4, 1, 3], description: "Higher position" }
    ]
  },
  'D7b5': { 
    frets: [-1, -1, 0, 1, 1, 2], 
    fingers: [0, 0, 0, 1, 2, 3],
    inversions: [
      { frets: [10, 12, 11, 12, 10, 10], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 5, 4, 5, 3, 5], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'D#7b5': { 
    frets: [-1, -1, 1, 2, 2, 3], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [11, 13, 12, 13, 11, 11], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 5, 6, 4, 6], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Eb7b5': { 
    frets: [-1, -1, 1, 2, 2, 3], 
    fingers: [0, 0, 1, 2, 3, 4],
    inversions: [
      { frets: [11, 13, 12, 13, 11, 11], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 5, 6, 4, 6], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'E7b5': { 
    frets: [0, 2, 0, 1, 3, 0], 
    fingers: [0, 2, 0, 1, 4, 0],
    inversions: [
      { frets: [12, 14, 13, 14, 12, 12], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 7, 6, 7, 5, 7], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'F7b5': { 
    frets: [1, 3, 1, 2, 4, 1], 
    fingers: [1, 3, 1, 2, 4, 1],
    inversions: [
      { frets: [13, 15, 14, 15, 13, 13], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 8, 7, 8, 6, 8], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'F#7b5': { 
    frets: [2, 4, 2, 3, 5, 2], 
    fingers: [1, 3, 1, 2, 4, 1],
    inversions: [
      { frets: [14, 16, 15, 16, 14, 14], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 9, 8, 9, 7, 9], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Gb7b5': { 
    frets: [2, 4, 2, 3, 5, 2], 
    fingers: [1, 3, 1, 2, 4, 1],
    inversions: [
      { frets: [14, 16, 15, 16, 14, 14], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 9, 8, 9, 7, 9], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'G7b5': { 
    frets: [3, 2, 3, 0, 3, 1], 
    fingers: [3, 2, 4, 0, 4, 1],
    inversions: [
      { frets: [3, 5, 4, 5, 3, 3], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 10, 9, 10, 8, 10], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'G#7b5': { 
    frets: [4, 3, 4, 1, 4, 2], 
    fingers: [3, 2, 4, 1, 4, 1],
    inversions: [
      { frets: [4, 6, 5, 6, 4, 4], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 11, 10, 11, 9, 11], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Ab7b5': { 
    frets: [4, 3, 4, 1, 4, 2], 
    fingers: [3, 2, 4, 1, 4, 1],
    inversions: [
      { frets: [4, 6, 5, 6, 4, 4], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 11, 10, 11, 9, 11], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'A7b5': { 
    frets: [-1, 0, 1, 0, 2, 3], 
    fingers: [0, 0, 1, 0, 2, 4],
    inversions: [
      { frets: [5, 7, 6, 7, 5, 5], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 12, 11, 12, 10, 12], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'A#7b5': { 
    frets: [-1, 1, 2, 1, 3, 4], 
    fingers: [0, 1, 2, 1, 3, 4],
    inversions: [
      { frets: [6, 8, 7, 8, 6, 6], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 12, 13, 11, 13], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'Bb7b5': { 
    frets: [-1, 1, 2, 1, 3, 4], 
    fingers: [0, 1, 2, 1, 3, 4],
    inversions: [
      { frets: [6, 8, 7, 8, 6, 6], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 12, 13, 11, 13], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },
  'B7b5': { 
    frets: [-1, 2, 1, 2, 0, 2], 
    fingers: [0, 2, 1, 3, 0, 4],
    inversions: [
      { frets: [7, 9, 8, 9, 7, 7], fingers: [1, 3, 2, 4, 1, 1], description: "Barre form" },
      { frets: [-1, 14, 13, 14, 12, 14], fingers: [0, 3, 1, 4, 1, 2], description: "Higher position" }
    ]
  },

  // Altered dominants - 7#5 chords  
  'C7#5': { 
    frets: [-1, 3, 2, 1, 1, 4], 
    fingers: [0, 4, 3, 1, 2, 4],
    inversions: [
      { frets: [8, 10, 9, 8, 8, 11], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, -1, 9, 8, 8, 11], fingers: [0, 0, 3, 1, 2, 4], description: "Higher position" }
    ]
  },
  'C#7#5': { 
    frets: [-1, 4, 3, 2, 2, 5], 
    fingers: [0, 4, 3, 1, 2, 4],
    inversions: [
      { frets: [9, 11, 10, 9, 9, 12], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, -1, 10, 9, 9, 12], fingers: [0, 0, 3, 1, 2, 4], description: "Higher position" }
    ]
  },
  'Db7#5': { 
    frets: [-1, 4, 3, 2, 2, 5], 
    fingers: [0, 4, 3, 1, 2, 4],
    inversions: [
      { frets: [9, 11, 10, 9, 9, 12], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, -1, 10, 9, 9, 12], fingers: [0, 0, 3, 1, 2, 4], description: "Higher position" }
    ]
  },
  'D7#5': { 
    frets: [-1, -1, 0, 3, 1, 2], 
    fingers: [0, 0, 0, 4, 1, 3],
    inversions: [
      { frets: [10, 12, 11, 10, 10, 13], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, 5, 4, 7, 5, 6], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'D#7#5': { 
    frets: [-1, -1, 1, 4, 2, 3], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 12, 11, 11, 14], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, 6, 5, 8, 6, 7], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Eb7#5': { 
    frets: [-1, -1, 1, 4, 2, 3], 
    fingers: [0, 0, 1, 4, 2, 3],
    inversions: [
      { frets: [11, 13, 12, 11, 11, 14], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, 6, 5, 8, 6, 7], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'E7#5': { 
    frets: [0, 3, 2, 1, 1, 4], 
    fingers: [0, 4, 3, 1, 2, 4],
    inversions: [
      { frets: [12, 14, 13, 12, 12, 15], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, 7, 6, 9, 7, 8], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'F7#5': { 
    frets: [1, 4, 3, 2, 2, 5], 
    fingers: [1, 4, 3, 2, 2, 4],
    inversions: [
      { frets: [13, 15, 14, 13, 13, 16], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, 8, 7, 10, 8, 9], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'F#7#5': { 
    frets: [2, 5, 4, 3, 3, 6], 
    fingers: [1, 4, 3, 2, 2, 4],
    inversions: [
      { frets: [14, 16, 15, 14, 14, 17], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, 9, 8, 11, 9, 10], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Gb7#5': { 
    frets: [2, 5, 4, 3, 3, 6], 
    fingers: [1, 4, 3, 2, 2, 4],
    inversions: [
      { frets: [14, 16, 15, 14, 14, 17], fingers: [1, 3, 2, 1, 1, 4], description: "Barre form" },
      { frets: [-1, 9, 8, 11, 9, 10], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'G7#5': { 
    frets: [3, 2, 1, 0, 0, 4], 
    fingers: [4, 3, 1, 0, 0, 2],
    inversions: [
      { frets: [3, 6, 5, 4, 4, 7], fingers: [1, 4, 3, 2, 2, 4], description: "Barre form" },
      { frets: [-1, 10, 9, 12, 10, 11], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'G#7#5': { 
    frets: [4, 3, 2, 1, 1, 5], 
    fingers: [4, 3, 1, 1, 2, 4],
    inversions: [
      { frets: [4, 7, 6, 5, 5, 8], fingers: [1, 4, 3, 2, 2, 4], description: "Barre form" },
      { frets: [-1, 11, 10, 13, 11, 12], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Ab7#5': { 
    frets: [4, 3, 2, 1, 1, 5], 
    fingers: [4, 3, 1, 1, 2, 4],
    inversions: [
      { frets: [4, 7, 6, 5, 5, 8], fingers: [1, 4, 3, 2, 2, 4], description: "Barre form" },
      { frets: [-1, 11, 10, 13, 11, 12], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'A7#5': { 
    frets: [-1, 0, 3, 0, 2, 1], 
    fingers: [0, 0, 4, 0, 3, 1],
    inversions: [
      { frets: [5, 8, 7, 6, 6, 9], fingers: [1, 4, 3, 2, 2, 4], description: "Barre form" },
      { frets: [-1, 12, 11, 14, 12, 13], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'A#7#5': { 
    frets: [-1, 1, 4, 1, 3, 2], 
    fingers: [0, 1, 4, 1, 3, 2],
    inversions: [
      { frets: [6, 9, 8, 7, 7, 10], fingers: [1, 4, 3, 2, 2, 4], description: "Barre form" },
      { frets: [-1, 13, 12, 15, 13, 14], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'Bb7#5': { 
    frets: [-1, 1, 4, 1, 3, 2], 
    fingers: [0, 1, 4, 1, 3, 2],
    inversions: [
      { frets: [6, 9, 8, 7, 7, 10], fingers: [1, 4, 3, 2, 2, 4], description: "Barre form" },
      { frets: [-1, 13, 12, 15, 13, 14], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  },
  'B7#5': { 
    frets: [-1, 2, 1, 2, 0, 3], 
    fingers: [0, 2, 1, 3, 0, 4],
    inversions: [
      { frets: [7, 10, 9, 8, 8, 11], fingers: [1, 4, 3, 2, 2, 4], description: "Barre form" },
      { frets: [-1, 14, 13, 16, 14, 15], fingers: [0, 2, 1, 4, 3, 4], description: "Higher position" }
    ]
  }
};
