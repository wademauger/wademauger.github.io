/**
 * Converts lyrics from a clipboard format (where chords are on separate lines)
 * to an inline format with chords in square brackets.
 * @param {string} input - The input lyrics text
 * @returns {string} The converted lyrics with inline chord notation
 */
function convertLyrics(input) {
  // First, remove any existing [tag] notation from the entire input
  let cleanedInput = input.replace(/\[.*?\]/g, '');
  
  const lines = cleanedInput.split('\n');
  const convertedLines = [];
  
  let i = 0;
  while (i < lines.length) {
    let line = lines[i].trim();
    
    // Skip section headers, replace with single blank line
    if (/^\[.*?(?::.+)?\]$/.test(line)) {
      if (convertedLines.length === 0 || convertedLines[convertedLines.length - 1] !== '') {
        convertedLines.push('');
      }
      i++;
      continue;
    }
    
    // Skip empty lines, maintaining only single blank lines between sections
    if (!line) {
      if (convertedLines.length === 0 || convertedLines[convertedLines.length - 1] !== '') {
        convertedLines.push('');
      }
      i++;
      continue;
    }

    // Replace N.C. (No Chord) with 4 space characters
    line = line.replace(/N\.C\./g, '    ');

    // Check if this is a chord line
    // Extract actual chord names and see if line consists only of chords and spaces
    // Comprehensive pattern for chord recognition including extensions, parentheses, and slashes
    const actualChordPattern = /[A-G][#b]?(?:maj|min|m|sus|aug|dim|add)?[0-9]*(?:\([^)]+\))?(?:sus[0-9]*)?(?:[#b][0-9]+)*(?:\/[A-G][#b]?)?/g;
    const chordMatches = line.match(actualChordPattern) || [];
    const lineWithoutChords = line.replace(actualChordPattern, '').trim();
    // A chord line should have chords and only whitespace left after removing chords
    const isChordLine = chordMatches.length > 0 && (lineWithoutChords === '' || /^\s*$/.test(lineWithoutChords));

    if (isChordLine) {
      const chordPositions = [];
      let match;
      
      // If the line contains only a single chord (after removing spaces)
      const trimmedLine = line.replace(/\s+/g, ' ').trim();
      const singleChordMatch = trimmedLine.match(/^[A-G][#b]?(?:maj|min|m|sus|aug|dim|add)?[0-9]*(?:\([^)]+\))?(?:sus[0-9]*)?(?:[#b][0-9]+)*(?:\/[A-G][#b]?)?$/);
      if (singleChordMatch) {
        // Look ahead to the next non-empty line
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) {
          j++;
        }
        
        // Check if the next line exists and is a lyric line (not another chord line or section header)
        if (j < lines.length) {
          const nextLine = lines[j].trim();
          const nextLineChordMatches = nextLine.match(actualChordPattern) || [];
          const nextLineWithoutChords = nextLine.replace(actualChordPattern, '').trim();
          const nextLineIsChordLine = nextLineChordMatches.length > 0 && (nextLineWithoutChords === '' || /^\s*$/.test(nextLineWithoutChords));
          const nextLineIsSectionHeader = /^\[.*?(?::.+)?\]$/.test(nextLine);
          
          // If next line is lyrics (not chords or section header), combine them
          if (!nextLineIsChordLine && !nextLineIsSectionHeader) {
            convertedLines.push(`[${singleChordMatch[0]}]${nextLine}`);
            i = j + 1;
            continue;
          }
        }
        
        // If no lyrics follow, output the chord as a standalone progression
        convertedLines.push(`[${singleChordMatch[0]}]`);
        i++;
        continue;
      }
      
      // Multiple chords on one line - use original line to preserve spacing
      const chordPattern = /[A-G][#b]?(?:maj|min|m|sus|aug|dim|add)?[0-9]*(?:\([^)]+\))?(?:sus[0-9]*)?(?:[#b][0-9]+)*(?:\/[A-G][#b]?)?/g;
      while ((match = chordPattern.exec(line)) !== null) {
        chordPositions.push({
          chord: match[0],
          position: match.index
        });
      }

      // Look ahead to the next non-empty line
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) {
        j++;
      }

      if (j < lines.length) {
        const nextLine = lines[j].trim();
        const nextLineChordMatches = nextLine.match(actualChordPattern) || [];
        const nextLineWithoutChords = nextLine.replace(actualChordPattern, '').trim();
        const nextLineIsChordLine = nextLineChordMatches.length > 0 && (nextLineWithoutChords === '' || /^\s*$/.test(nextLineWithoutChords));
        const nextLineIsSectionHeader = /^\[.*?(?::.+)?\]$/.test(nextLine);
        
        // If next line is lyrics (not chords or section header), merge chords with lyrics
        if (!nextLineIsChordLine && !nextLineIsSectionHeader) {
          const lyricLine = nextLine;
          const chars = lyricLine.split('');
          const insertions = [];
          
          chordPositions.forEach(({ chord, position }) => {
            // Find the best position in the lyric line for this chord
            let insertPos = Math.min(position, lyricLine.length);
            
            // If we're past the end of the lyric line, place at the end
            if (insertPos >= lyricLine.length) {
              insertPos = lyricLine.length;
            } else {
              // Try to place at the beginning of a word, not in the middle
              while (insertPos < lyricLine.length && 
                     insertPos > 0 && 
                     /\S/.test(lyricLine[insertPos-1]) && 
                     /\S/.test(lyricLine[insertPos])) {
                insertPos++;
              }
            }
            
            insertions.push({
              pos: insertPos,
              text: `[${chord}]`
            });
          });

          insertions.sort((a, b) => b.pos - a.pos);
          
          // Separate chords that go within the lyrics vs at the end
          const lyricsLength = lyricLine.length;
          const endChords = [];
          const withinChords = [];
          
          insertions.forEach(({ pos, text }) => {
            if (pos >= lyricsLength) {
              endChords.push({ pos, text });
            } else {
              withinChords.push({ pos, text });
            }
          });
          
          // Insert chords within lyrics first
          withinChords.forEach(({ pos, text }) => {
            chars.splice(pos, 0, text);
          });
          
          let result = chars.join('');
          
          // For chords at the end, calculate proper spacing based on original positions
          if (endChords.length > 0) {
            // Sort end chords by their original position in the chord line
            const sortedEndChords = endChords.sort((a, b) => {
              // Find the original chord positions
              const aOriginalPos = chordPositions.find(cp => cp.chord === a.text.slice(1, -1))?.position || 0;
              const bOriginalPos = chordPositions.find(cp => cp.chord === b.text.slice(1, -1))?.position || 0;
              return aOriginalPos - bOriginalPos;
            });
            
            // Add chords with proper spacing
            for (let k = 0; k < sortedEndChords.length; k++) {
              const chord = sortedEndChords[k].text;
              const chordName = chord.slice(1, -1); // Remove brackets
              
              result += chord;
              
              // Add spacing after each chord except the last one
              if (k < sortedEndChords.length - 1) {
                const spacesToAdd = chordName.length + 1;
                result += ' '.repeat(spacesToAdd);
              }
            }
          }
          
          convertedLines.push(result);
          i = j + 1;
        } else {
          // Next line is chords or section header, so this is a standalone chord progression
          // Add proper spacing: each chord followed by (chord length + 1) spaces
          let chordProgression = '';
          chordPositions.forEach(({ chord }, index) => {
            chordProgression += `[${chord}]`;
            // Add spacing after each chord except the last one
            if (index < chordPositions.length - 1) {
              const spacesToAdd = chord.length + 1;
              chordProgression += ' '.repeat(spacesToAdd);
            }
          });
          convertedLines.push(chordProgression);
          i++;
        }
      } else {
        // No more lines, output as standalone chord progression
        // Add proper spacing: each chord followed by (chord length + 1) spaces
        let chordProgression = '';
        chordPositions.forEach(({ chord }, index) => {
          chordProgression += `[${chord}]`;
          // Add spacing after each chord except the last one
          if (index < chordPositions.length - 1) {
            const spacesToAdd = chord.length + 1;
            chordProgression += ' '.repeat(spacesToAdd);
          }
        });
        convertedLines.push(chordProgression);
        i++;
      }
    } else {
      // Regular lyric line without chords
      convertedLines.push(line);
      i++;
    }
  }

  // Clean up consecutive blank lines at start and end
  while (convertedLines[0] === '') convertedLines.shift();
  while (convertedLines[convertedLines.length - 1] === '') convertedLines.pop();

  return convertedLines.join('\n');
}

export { convertLyrics };
