// Test file to debug the convertLyrics function with the Pink Floyd song
import { convertLyrics } from './src/convert-lyrics.js';

const pinkFloydInput = `Em(add9)  A  Asus4  A  Em(add9)  A  A7sus4  A7

 

Em(add9)  A  Asus4  A  Em(add9)  A  Asus4  A

 

Cmaj7  Bm7  Fmaj7  G  D7#9  D7b9

 

 

[Verse]

 

Em7                         A     Asus4  A

    Breathe, breathe in the air.

Em(add9)          Em7          A  Asus4  A

        Don't be afraid to care.

Em(add9)                      A   Asus4  A

        Leave but don't leave me.

Em(add9)                                 Asus4  A

Look around and choose your own ground.

 

 

[Chorus]

 

    Cmaj7

For long you live and high you fly

    Bm7

And smiles you'll give and tears you'll cry

Fmaj7

All you touch and all you see

   G                  D7#9 B7b9

Is all your life will ever be.`;

console.log('Testing Pink Floyd input...');
try {
  const result = convertLyrics(pinkFloydInput);
  console.log('SUCCESS: Conversion completed');
  console.log('Result:');
  console.log(result);
} catch (error) {
  console.error('ERROR:', error.message);
  console.error('Stack:', error.stack);
}