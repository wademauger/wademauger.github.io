// Test script for chord transposition
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_EQUIV = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

function transposeChord(chord, semitones) {
  // Handle slashed chords (e.g. A/C# -> A#/D)
  if (chord.includes('/')) {
    const [rootPart, bassPart] = chord.split('/');
    const transposedRoot = transposeChord(rootPart, semitones);
    const transposedBass = transposeChord(bassPart, semitones);
    return `${transposedRoot}/${transposedBass}`;
  }
  
  // Extract root and suffix (e.g. C#m7 -> C#, m7)
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;
  let [_, root, suffix] = match;
  // Normalize flats to sharps
  if (FLAT_EQUIV[root]) root = FLAT_EQUIV[root];
  let idx = CHROMATIC.indexOf(root);
  if (idx === -1) return chord;
  let newIdx = (idx + semitones + 12) % 12;
  return CHROMATIC[newIdx] + suffix;
}

// Test cases
console.log('Testing slashed chord transposition:');
console.log('A/C# up 1 semitone:', transposeChord('A/C#', 1)); // Should be A#/D
console.log('C/E up 2 semitones:', transposeChord('C/E', 2)); // Should be D/F#
console.log('Dm/F up 3 semitones:', transposeChord('Dm/F', 3)); // Should be Fm/G#
console.log('G7/B down 5 semitones:', transposeChord('G7/B', -5)); // Should be D7/F#

console.log('\nTesting regular chord transposition:');
console.log('A up 1 semitone:', transposeChord('A', 1)); // Should be A#
console.log('C up 2 semitones:', transposeChord('C', 2)); // Should be D
console.log('Dm up 3 semitones:', transposeChord('Dm', 3)); // Should be Fm
console.log('G7 down 5 semitones:', transposeChord('G7', -5)); // Should be D7
