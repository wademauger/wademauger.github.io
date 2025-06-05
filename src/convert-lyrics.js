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
    // Comprehensive pattern for chord recognition including extensions and slashes
    const actualChordPattern = /[A-G][#b]?(?:maj|min|m|sus|aug|dim|add)?[0-9]*(?:[#b][0-9]+)*(?:\/[A-G][#b]?)?/g;
    const chordMatches = line.match(actualChordPattern) || [];
    const lineWithoutChords = line.replace(actualChordPattern, '').trim();
    // A chord line should have chords and only whitespace left after removing chords
    const isChordLine = chordMatches.length > 0 && (lineWithoutChords === '' || /^\s*$/.test(lineWithoutChords));

    if (isChordLine) {
      const chordPattern = /[A-G][#b]?(?:maj|min|m|sus|aug|dim|add)?[0-9]*(?:[#b][0-9]+)*(?:\/[A-G][#b]?)?/g;
      const chordPositions = [];
      let match;
      
      // If the line contains only a single chord (after removing spaces)
      const trimmedLine = line.replace(/\s+/g, ' ').trim();
      const singleChordMatch = trimmedLine.match(/^[A-G][#b]?(?:maj|min|m|sus|aug|dim|add)?[0-9]*(?:[#b][0-9]+)*(?:\/[A-G][#b]?)?$/);
      if (singleChordMatch) {
        // Look ahead to the next non-empty line
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) {
          j++;
        }
        if (j < lines.length) {
          // Combine the chord with the next line
          convertedLines.push(`[${singleChordMatch[0]}]${lines[j].trim()}`);
          i = j + 1;
          continue;
        }
      }
      
      // Multiple chords on one line - use original line to preserve spacing
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
        const lyricLine = lines[j].trim();
        const chars = lyricLine.split('');
        const insertions = [];
        
        chordPositions.forEach(({chord, position}) => {
          let insertPos = position;
          while (insertPos < lyricLine.length && /\s/.test(lyricLine[insertPos])) {
            insertPos++;
          }
          insertions.push({
            pos: insertPos,
            text: `[${chord}]`
          });
        });

        insertions.sort((a, b) => b.pos - a.pos);
        insertions.forEach(({pos, text}) => {
          chars.splice(pos, 0, text);
        });
        convertedLines.push(chars.join(''));
        i = j + 1;
      } else {
        // No lyrics line found, just output the chord
        convertedLines.push(`[${line.trim()}]`);
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
