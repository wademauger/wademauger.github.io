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
      { frets: [-1, 4, 6, 6, 6, 4], fingers: [0  'G/A': { 
    frets: [3, 0, 0, 0, 3, 3], 
    fingers: [0, 0, 0, 0, 1, 2],
    description: "G major with A in bass"
  },
  'C/B': { 
    frets: [-1, 2, 2, 0, 1, 0], 
    fingers: [0, 2, 3, 0, 1, 0],
    description: "C major with B in bass"
  },2, 3, 4, 1] }, // Barre form
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
      { frets: [-1, 12, 14, 14, 14, 12], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'A#': { 
    frets: [-1, 1, 3, 3, 3, 1], 
    fingers: [0, 1, 2, 3, 4, 1],
    inversions: [
      { frets: [6, 8, 8, 7, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 15, 13], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'Bb': { 
    frets: [-1, 1, 3, 3, 3, 1], 
    fingers: [0, 1, 2, 3, 4, 1],
    inversions: [
      { frets: [6, 8, 8, 7, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 15, 13], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
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
    fingers: [1, 3, 4, 2, 1, 1],
    inversions: [
      { frets: [14, 16, 16, 14, 14, 14], fingers: [1, 3, 4, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 11, 11, 10, 9], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Gbm': { 
    frets: [2, 4, 4, 2, 2, 2], 
    fingers: [1, 3, 4, 2, 1, 1],
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
    frets: [-1, 1, 3, 3, 3, 1], 
    fingers: [0, 1, 2, 3, 4, 1],
    inversions: [
      { frets: [6, 8, 8, 6, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 15, 13], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'Bbm': { 
    frets: [-1, 1, 3, 3, 3, 1], 
    fingers: [0, 1, 2, 3, 4, 1],
    inversions: [
      { frets: [6, 8, 8, 6, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 15, 13], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'Bm': { 
    frets: [-1, 2, 4, 4, 3, 2], 
    fingers: [0, 1, 3, 4, 2, 1],
    inversions: [
      { frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
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
    fingers: [0, 0, 2, 3, 4, 1],
    inversions: [
      { frets: [9, 11, 9, 10, 9, 9], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 3, 4, 2, 2], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative fingering" }
    ]
  },
  'Db7': { 
    frets: [-1, -1, 3, 4, 2, 4], 
    fingers: [0, 0, 2, 3, 4, 1],
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
  
  // Minor 7th chords
  'Cm7': { 
    frets: [-1, 3, 1, 3, 1, 3], 
    fingers: [0, 3, 1, 4, 2, 1],
    inversions: [
      { frets: [8, 10, 8, 8, 8, 8], fingers: [1, 3, 1, 1, 1, 1], description: "Barre form" },
      { frets: [-1, -1, 3, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], description: "Compact form" }
    ]
  },
  'C#m7': { 
    frets: [-1, -1, 2, 1, 2, 0], 
    fingers: [0, 0, 3, 1, 4, 0],
    inversions: [
      { frets: [9, 11, 11, 9, 9, 9], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Dbm7': { 
    frets: [-1, -1, 2, 1, 2, 0], 
    fingers: [0, 0, 3, 1, 4, 0],
    inversions: [
      { frets: [9, 11, 11, 9, 9, 9], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Dm7': { 
    frets: [-1, -1, 0, 2, 3, 1], 
    fingers: [0, 0, 0, 2, 3, 1],
    inversions: [
      { frets: [10, 12, 12, 10, 10, 10], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 5, 7, 7, 6, 5], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'D#m7': { 
    frets: [-1, -1, 1, 3, 4, 2], 
    fingers: [0, 0, 1, 3, 4, 2],
    inversions: [
      { frets: [11, 13, 13, 11, 11, 11], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Ebm7': { 
    frets: [-1, -1, 1, 3, 4, 2], 
    fingers: [0, 0, 1, 3, 4, 2],
    inversions: [
      { frets: [11, 13, 13, 11, 11, 11], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Em7': { 
    frets: [0, 2, 2, 0, 0, 0], 
    fingers: [0, 2, 3, 0, 0, 0],
    inversions: [
      { frets: [12, 14, 14, 12, 12, 12], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 7, 9, 9, 8, 7], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Fm7': { 
    frets: [1, 3, 3, 1, 1, 1], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [13, 15, 15, 13, 13, 13], fingers: [1, 3, 4, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 8, 10, 10, 9, 8], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'F#m7': { 
    frets: [2, 4, 4, 2, 2, 2], 
    fingers: [1, 3, 4, 2, 1, 1],
    inversions: [
      { frets: [14, 16, 16, 14, 14, 14], fingers: [1, 3, 4, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 11, 11, 10, 9], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Gbm7': { 
    frets: [2, 4, 4, 2, 2, 2], 
    fingers: [1, 3, 4, 2, 1, 1],
    inversions: [
      { frets: [14, 16, 16, 14, 14, 14], fingers: [1, 3, 4, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 9, 11, 11, 10, 9], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'Gm7': { 
    frets: [3, 5, 3, 3, 3, 3], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [15, 17, 17, 15, 15, 15], fingers: [1, 3, 4, 1, 1, 1], description: "Higher barre" },
      { frets: [-1, 10, 12, 12, 11, 10], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" }
    ]
  },
  'G#m7': { 
    frets: [4, 6, 6, 4, 4, 4], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [-1, 11, 13, 13, 12, 11], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" },
      { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], description: "Standard barre" }
    ]
  },
  'Abm7': { 
    frets: [4, 6, 6, 4, 4, 4], 
    fingers: [1, 3, 4, 1, 1, 1],
    inversions: [
      { frets: [-1, 11, 13, 13, 12, 11], fingers: [0, 1, 3, 4, 2, 1], description: "Alternative position" },
      { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], description: "Standard barre" }
    ]
  },
  'Am7': { 
    frets: [-1, 0, 2, 2, 1, 0], 
    fingers: [0, 0, 2, 3, 1, 0],
    inversions: [
      { frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], description: "Barre form" },
      { frets: [-1, 12, 14, 14, 13, 12], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'A#m7': { 
    frets: [-1, 1, 3, 3, 2, 1], 
    fingers: [0, 1, 3, 4, 2, 1],
    inversions: [
      { frets: [6, 8, 8, 6, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 14, 13], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'Bbm7': { 
    frets: [-1, 1, 3, 3, 2, 1], 
    fingers: [0, 1, 3, 4, 2, 1],
    inversions: [
      { frets: [6, 8, 8, 6, 6, 6], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 13, 15, 15, 14, 13], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
    ]
  },
  'Bm7': { 
    frets: [-1, 2, 3, 2, 3, 5], 
    fingers: [0, 1, 3, 2, 4, 4],
    inversions: [
      { frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 14, 12, 14, 12, 14], fingers: [0, 1, 3, 4, 2, 1], description: "High position" }
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
    fingers: [0, 0, 2, 3, 4, 1],
    inversions: [
      { frets: [9, 11, 9, 10, 9, 9], fingers: [1, 3, 1, 2, 1, 1], description: "Barre form" },
      { frets: [-1, 4, 3, 4, 2, 2], fingers: [0, 3, 1, 4, 1, 2], description: "Alternative fingering" }
    ]
  },
  'Db7': { 
    frets: [-1, -1, 3, 4, 2, 4], 
    fingers: [0, 0, 2, 3, 4, 1],
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
  
  // Slash chords (common inversions and bass-over-chord combinations)
  // Major chord inversions (chord tone in bass)
  'C/E': { 
    frets: [0, 3, 2, 0, 1, 0], 
    fingers: [0, 3, 2, 0, 1, 0],
    description: "C major with E in bass (1st inversion)"
  },
  'C/G': { 
    frets: [3, 3, 2, 0, 1, 0], 
    fingers: [3, 4, 2, 0, 1, 0],
    description: "C major with G in bass (2nd inversion)"
  },
  'D/F#': { 
    frets: [2, 0, 0, 2, 3, 2], 
    fingers: [1, 0, 0, 2, 4, 3],
    description: "D major with F# in bass (1st inversion)"
  },
  'D/A': { 
    frets: [-1, 0, 0, 2, 3, 2], 
    fingers: [0, 0, 0, 1, 3, 2],
    description: "D major with A in bass (2nd inversion)"
  },
  'E/G#': { 
    frets: [4, 2, 2, 1, 0, 0], 
    fingers: [4, 2, 3, 1, 0, 0],
    description: "E major with G# in bass (1st inversion)"
  },
  'E/B': { 
    frets: [-1, 2, 2, 1, 0, 0], 
    fingers: [0, 3, 4, 1, 0, 0],
    description: "E major with B in bass (2nd inversion)"
  },
  'F/A': { 
    frets: [-1, 0, 3, 2, 1, 1], 
    fingers: [0, 0, 4, 3, 1, 2],
    description: "F major with A in bass (1st inversion)"
  },
  'F/C': { 
    frets: [-1, 3, 3, 2, 1, 1], 
    fingers: [0, 3, 4, 2, 1, 1],
    description: "F major with C in bass (2nd inversion)"
  },
  'G/B': { 
    frets: [-1, 2, 0, 0, 3, 3], 
    fingers: [0, 1, 0, 0, 3, 4],
    description: "G major with B in bass (1st inversion)"
  },
  'G/D': { 
    frets: [-1, -1, 0, 0, 3, 3], 
    fingers: [0, 0, 0, 0, 1, 2],
    description: "G major with D in bass (2nd inversion)"
  },
  'A/C#': { 
    frets: [-1, 4, 2, 2, 2, 0], 
    fingers: [0, 4, 1, 2, 3, 0],
    description: "A major with C# in bass (1st inversion)"
  },
  'A/E': { 
    frets: [0, 0, 2, 2, 2, 0], 
    fingers: [0, 0, 1, 2, 3, 0],
    description: "A major with E in bass (2nd inversion)"
  },
  'B/D#': { 
    frets: [-1, 6, 4, 4, 4, 2], 
    fingers: [0, 4, 1, 2, 3, 1],
    description: "B major with D# in bass (1st inversion)"
  },
  'B/F#': { 
    frets: [2, 2, 4, 4, 4, 2], 
    fingers: [1, 1, 2, 3, 4, 1],
    description: "B major with F# in bass (2nd inversion)"
  },

  // Minor chord inversions
  'Am/C': { 
    frets: [-1, 3, 2, 2, 1, 0], 
    fingers: [0, 3, 2, 2, 1, 0],
    description: "A minor with C in bass (1st inversion)"
  },
  'Am/E': { 
    frets: [0, 0, 2, 2, 1, 0], 
    fingers: [0, 0, 2, 3, 1, 0],
    description: "A minor with E in bass (2nd inversion)"
  },
  'Em/G': { 
    frets: [3, 2, 2, 0, 0, 0], 
    fingers: [3, 1, 2, 0, 0, 0],
    description: "E minor with G in bass (1st inversion)"
  },
  'Em/B': { 
    frets: [-1, 2, 2, 0, 0, 0], 
    fingers: [0, 1, 2, 0, 0, 0],
    description: "E minor with B in bass (2nd inversion)"
  },
  'Dm/F': { 
    frets: [1, 3, 3, 2, 3, 1], 
    fingers: [1, 2, 3, 1, 4, 1],
    description: "D minor with F in bass (1st inversion)"
  },
  'Dm/A': { 
    frets: [-1, 0, 0, 2, 3, 1], 
    fingers: [0, 0, 0, 2, 1, 3],
    description: "D minor with A in bass (2nd inversion)"
  },

  // Non-chord tone bass notes (common slash chords)
  'C/D': { 
    frets: [-1, -1, 0, 0, 1, 0], 
    fingers: [0, 0, 0, 0, 1, 0],
    description: "C major with D in bass"
  },
  'C/F': { 
    frets: [1, 3, 3, 2, 1, 1], 
    fingers: [1, 3, 4, 2, 1, 1],
    description: "C major with F in bass"
  },
  'D/C': { 
    frets: [-1, 3, 0, 2, 3, 2], 
    fingers: [0, 2, 0, 1, 4, 3],
    description: "D major with C in bass"
  },
  'F/G': { 
    frets: [3, 3, 3, 2, 1, 1], 
    fingers: [3, 4, 4, 2, 1, 1],
    description: "F major with G in bass"
  },
  'G/A': { 
    frets: [-1, 0, 0, 0, 3, 3], 
    fingers: [0, 0, 0, 0, 1, 2],
    description: "G major with A in bass"
  },
  'G/F': { 
    frets: [1, 3, 3, 0, 3, 3], 
    fingers: [1, 2, 3, 0, 4, 4],
    description: "G major with F in bass"
  },
  'Am/F': { 
    frets: [1, 0, 2, 2, 1, 0], 
    fingers: [1, 0, 3, 4, 2, 0],
    description: "A minor with F in bass"
  },
  'Em/C': { 
    frets: [-1, 3, 2, 0, 0, 0], 
    fingers: [0, 3, 1, 0, 0, 0],
    description: "E minor with C in bass"
  },
  'Em/D': { 
    frets: [-1, -1, 0, 0, 0, 0], 
    fingers: [0, 0, 0, 0, 0, 0],
    description: "E minor with D in bass"
  },
  'F/G': { 
    frets: [3, 3, 3, 2, 1, 1], 
    fingers: [3, 4, 4, 2, 1, 1],
    description: "F major with G in bass"
  },
  'D/B': { 
    frets: [-1, 2, 0, 2, 3, 2], 
    fingers: [0, 1, 0, 2, 4, 3],
    description: "D major with B in bass"
  },
  'Am/C': { 
    frets: [-1, 3, 2, 2, 1, 0], 
    fingers: [0, 3, 2, 2, 1, 0],
    description: "A minor with C in bass (1st inversion)"
  },
  'Dm/A': { 
    frets: [-1, 0, 0, 2, 3, 1], 
    fingers: [0, 0, 0, 2, 1, 3],
    description: "D minor with A in bass (2nd inversion)"
  },

  // 7th chord inversions
  'C7/E': { 
    frets: [0, 3, 2, 3, 1, 0], 
    fingers: [0, 3, 2, 4, 1, 0],
    description: "C7 with E in bass (1st inversion)"
  },
  'G7/B': { 
    frets: [-1, 2, 0, 0, 0, 1], 
    fingers: [0, 2, 0, 0, 0, 1],
    description: "G7 with B in bass (1st inversion)"
  },
  'G7/D': { 
    frets: [-1, -1, 0, 0, 0, 1], 
    fingers: [0, 0, 0, 0, 0, 1],
    description: "G7 with D in bass (2nd inversion)"
  },
  'G7/F': { 
    frets: [1, 2, 0, 0, 0, 1], 
    fingers: [1, 2, 0, 0, 0, 1],
    description: "G7 with F in bass (3rd inversion)"
  },
  'D7/F#': { 
    frets: [2, 0, 0, 2, 1, 2], 
    fingers: [2, 0, 0, 3, 1, 4],
    description: "D7 with F# in bass (1st inversion)"
  },
  'D7/A': { 
    frets: [-1, 0, 0, 2, 1, 2], 
    fingers: [0, 0, 0, 2, 1, 3],
    description: "D7 with A in bass (2nd inversion)"
  },
  'D7/C': { 
    frets: [-1, 3, 0, 2, 1, 2], 
    fingers: [0, 3, 0, 2, 1, 4],
    description: "D7 with C in bass (3rd inversion)"
  }
};
