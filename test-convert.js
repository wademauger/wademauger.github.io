// Test script to verify the lyrics conversion functionality
import { convertLyrics } from './src/convert-lyrics.js';

const testLyrics = `Am Asus2 Am Asus2

 

 

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

This goodbye won't make me cry

 

 

[Chorus]

                   N.C.              F

Yeah, I'll keep on dancin' until I'm dead

                  D                           Am

Dancin' until I'm dead, I'm dancin' until I'm dead

      C                              F     D

Yeah, I'll keep on dancin' until I'm dead (Dead)

                     Am

I'll dance until I'm dead (Dead, dead, dead, dead)

                             F                        D

'Cause when you killed me inside, that's when I came alive

                         Am                C

Yeah, the music's gonna bring me back from death

                      F     D

I'm dancin' until I'm dead (Dead)

                     Am                      C

I'll dance until I'm dead (Dead, dead, dead, dead)`;

console.log("=== ORIGINAL LYRICS ===");
console.log(testLyrics);

console.log("\n\n=== CONVERTED LYRICS ===");
const converted = convertLyrics(testLyrics);
console.log(converted);