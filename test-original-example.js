// Test with the original Ultimate Guitar example
const fs = require('fs');

// Read and evaluate the convertLyrics function
const convertLyricsCode = fs.readFileSync('./src/convert-lyrics.js', 'utf8');
eval(convertLyricsCode.replace('export { convertLyrics };', ''));

const originalExample = `Am Asus2 Am Asus2

 

 

[Verse 1]

Am                                    Am  Asus2

 Like the words of a song, I hear you call

Am                                 Am Asus2

 Like a thief in my head, you criminal

Am                               Am          Asus2

 You stole my thoughts before I dreamed them

Am                                     Am  Asus2

 And you killed my queen with just one pawn

 

 

[Pre-Chorus]

         Fmaj7  D      Am   C

This goodbye is no surprise

         Fmaj7     D        Am

This goodbye won't make me cry`;

console.log('=== ORIGINAL ULTIMATE GUITAR EXAMPLE ===');
console.log(originalExample);
console.log('\n=== CONVERTED OUTPUT ===');
const result = convertLyrics(originalExample);
console.log(result);