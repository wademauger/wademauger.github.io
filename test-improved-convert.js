// Test the improved convert function with problematic cases
const fs = require('fs');

// Read and evaluate the convertLyrics function
const convertLyricsCode = fs.readFileSync('./src/convert-lyrics.js', 'utf8');
eval(convertLyricsCode.replace('export { convertLyrics };', ''));

// Test case with chord progressions at start, middle, and end
const testWithChordProgressions = `G  C  Am  D

G  C  Am  D

[Verse 1]

G                 C
Here are some lyrics

Am                D
More lyrics here

G  C  Am  D

[Chorus]

G                    C
Chorus lyrics go here

Am               D
End of chorus

G  C  Am  D

G  C  Am  D`;

console.log('=== INPUT WITH CHORD PROGRESSIONS ===');
console.log(testWithChordProgressions);
console.log('\n=== CONVERTED OUTPUT ===');
const result = convertLyrics(testWithChordProgressions);
console.log(result);

// Test case with single chords followed by chords (not lyrics)
const testWithSingleChords = `Am

Dm

[Verse]

Am                  Dm
Some lyrics with chords

Em

F

[Chorus]

Em                 F
More lyrics here`;

console.log('\n\n=== INPUT WITH SINGLE CHORDS ===');
console.log(testWithSingleChords);
console.log('\n=== CONVERTED OUTPUT ===');
const result2 = convertLyrics(testWithSingleChords);
console.log(result2);