// Chord inversions data - alternative fingerings and positions for each instrument

export const chordInversions = {
  // Ukulele inversions (4 strings)
  ukulele: {
    // Major chord inversions
    'C': [
      { frets: [5, 4, 3, 3], fingers: [4, 3, 1, 2], description: 'First inversion (E in bass)' },
      { frets: [0, 0, 3, 0], fingers: [0, 0, 3, 0], description: 'Alternative root position' }
    ],
    'C#': [
      { frets: [6, 5, 4, 4], fingers: [4, 3, 1, 2], description: 'First inversion' },
      { frets: [1, 1, 4, 1], fingers: [1, 2, 4, 3], description: 'Alternative fingering' }
    ],
    'Db': [
      { frets: [6, 5, 4, 4], fingers: [4, 3, 1, 2], description: 'First inversion' },
      { frets: [1, 1, 4, 1], fingers: [1, 2, 4, 3], description: 'Alternative fingering' }
    ],
    'D': [
      { frets: [7, 6, 5, 5], fingers: [4, 3, 1, 2], description: 'First inversion' },
      { frets: [2, 2, 2, 5], fingers: [1, 2, 3, 4], description: 'Alternative fingering' }
    ],
    // Minor chord inversions
    'Cm': [
      { frets: [3, 3, 3, 6], fingers: [1, 2, 3, 4], description: 'Higher position' },
      { frets: [8, 7, 8, 8], fingers: [1, 2, 3, 4], description: 'Barre position' }
    ],
    'C#m': [
      { frets: [4, 4, 4, 7], fingers: [1, 2, 3, 4], description: 'Higher position' },
      { frets: [9, 8, 9, 9], fingers: [1, 2, 3, 4], description: 'Barre position' }
    ]
  },

  // Guitar inversions (6 strings)
  guitar: {
    // Major chord inversions
    'C': [
      { frets: [-1, -1, 5, 5, 5, 3], fingers: [0, 0, 2, 3, 4, 1], description: 'Barre form' },
      { frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], description: 'High position barre' }
    ],
    'C#': [
      { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], description: 'Barre form' },
      { frets: [9, 11, 11, 10, 9, 9], fingers: [1, 3, 4, 2, 1, 1], description: 'High position barre' }
    ],
    'Db': [
      { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], description: 'Barre form' },
      { frets: [9, 11, 11, 10, 9, 9], fingers: [1, 3, 4, 2, 1, 1], description: 'High position barre' }
    ]
  },

  // Piano inversions
  piano: {
    // Major chord inversions
    'C': [
      { notes: ['E', 'G', 'C'], description: 'First inversion (E in bass)' },
      { notes: ['G', 'C', 'E'], description: 'Second inversion (G in bass)' }
    ],
    'C#': [
      { notes: ['F', 'G#', 'C#'], description: 'First inversion (F in bass)' },
      { notes: ['G#', 'C#', 'F'], description: 'Second inversion (G# in bass)' }
    ],
    'Db': [
      { notes: ['F', 'G#', 'C#'], description: 'First inversion (F in bass)' },
      { notes: ['G#', 'C#', 'F'], description: 'Second inversion (G# in bass)' }
    ],
    'D': [
      { notes: ['F#', 'A', 'D'], description: 'First inversion (F# in bass)' },
      { notes: ['A', 'D', 'F#'], description: 'Second inversion (A in bass)' }
    ],
    // Minor chord inversions
    'Cm': [
      { notes: ['D#', 'G', 'C'], description: 'First inversion (Eb in bass)' },
      { notes: ['G', 'C', 'D#'], description: 'Second inversion (G in bass)' }
    ],
    'C#m': [
      { notes: ['E', 'G#', 'C#'], description: 'First inversion (E in bass)' },
      { notes: ['G#', 'C#', 'E'], description: 'Second inversion (G# in bass)' }
    ]
  },

  // Bass guitar inversions (4 strings)
  bassGuitar: {
    'C': [
      { frets: [8, 7, 5, 5], fingers: [4, 3, 1, 2], description: 'Higher position' },
      { frets: [3, 3, 2, 5], fingers: [1, 2, 3, 4], description: 'Alternative fingering' }
    ]
  },

  // Baritone ukulele inversions (4 strings, DGBE tuning)
  baritoneUkulele: {
    'C': [
      { frets: [3, 2, 0, 1], fingers: [4, 2, 0, 1], description: 'Alternative position' },
      { frets: [8, 7, 5, 6], fingers: [4, 3, 1, 2], description: 'Higher position' }
    ]
  },

  // Bass ukulele inversions (4 strings)
  bassUkulele: {
    'C': [
      { frets: [8, 7, 5, 5], fingers: [4, 3, 1, 2], description: 'Higher position' },
      { frets: [3, 3, 2, 5], fingers: [1, 2, 3, 4], description: 'Alternative fingering' }
    ]
  }
};

// Helper function to get inversions for a specific chord and instrument
export const getChordInversions = (chord, instrument) => {
  return chordInversions[instrument]?.[chord] || [];
};

// Helper function to get all available inversions for an instrument
export const getInstrumentInversions = (instrument) => {
  return chordInversions[instrument] || {};
};
