import React from 'react';
import { guitarChords } from '../data/guitarChords';
import { ukuleleChords } from '../data/ukuleleChords';
import { pianoChords } from '../data/pianoChords';
import { bassGuitarChords } from '../data/bassGuitarChords';
import { bassUkuleleChords } from '../data/bassUkuleleChords';
import { baritoneUkuleleChords } from '../data/baritoneUkuleleChords';

// Simple chord generation for missing chords
const generateBasicChord = (chordSymbol, instrument) => {
  // Parse chord symbol for basic generation
  const isMinor = chordSymbol.includes('m') && !chordSymbol.includes('maj');
  const is7th = chordSymbol.includes('7');
  
  // Handle slash chords
  const parts = chordSymbol.split('/');
  const rootChord = parts[0];
  const bassNote = parts[1];
  
  // Basic chord patterns for common instruments
  const basicPatterns = {
    guitar: {
      'C': { frets: [0, 1, 0, 2, 1, 0], fingers: [0, 1, 0, 3, 2, 0] },
      'C#': { frets: [-1, -1, 3, 1, 2, 1], fingers: [0, 0, 4, 1, 3, 2] },
      'D': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
      'D#': { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
      'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
      'F': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] },
      'F#': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1] },
      'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, 0, 0, 0, 4] },
      'G#': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1] },
      'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
      'A#': { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1] },
      'B': { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 3, 4, 5, 2] }
    },
    ukulele: {
      'C': { frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
      'C#': { frets: [1, 1, 1, 4], fingers: [1, 1, 1, 4] },
      'D': { frets: [2, 2, 2, 0], fingers: [1, 1, 1, 0] },
      'D#': { frets: [0, 3, 3, 1], fingers: [0, 3, 4, 1] },
      'E': { frets: [4, 4, 4, 2], fingers: [2, 3, 4, 1] },
      'F': { frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0] },
      'F#': { frets: [3, 1, 2, 1], fingers: [3, 1, 2, 1] },
      'G': { frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2] },
      'G#': { frets: [5, 3, 4, 3], fingers: [4, 1, 3, 2] },
      'A': { frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0] },
      'A#': { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1] },
      'B': { frets: [4, 3, 2, 2], fingers: [4, 3, 1, 2] }
    }
  };
  
  // Get base pattern for the root chord (including sharps/flats)
  const rootFull = rootChord.match(/^[A-G][#b]?/)?.[0];
  let basePattern = basicPatterns[instrument]?.[rootFull];
  
  // If exact match not found, try with just the natural note
  if (!basePattern) {
    const rootNote = rootChord.match(/^[A-G]/)?.[0];
    basePattern = basicPatterns[instrument]?.[rootNote];
  }
  
  if (!basePattern) {
    return null; // No basic pattern available
  }
  
  // Handle slash chords for ukulele
  if (bassNote && instrument === 'ukulele') {
    // Use the basePattern (which already handles sharps/flats correctly)
    const modifiedFrets = [...basePattern.frets];
    const modifiedFingers = [...basePattern.fingers];
    
    // Map bass note to fret on A string (string index 3)
    const bassNoteToFret = {
      'A': 0, 'A#': 1, 'Bb': 1,
      'B': 2, 'C': 3, 'C#': 4, 'Db': 4,
      'D': 5, 'D#': 6, 'Eb': 6,
      'E': 7, 'F': 8, 'F#': 9, 'Gb': 9,
      'G': 10, 'G#': 11, 'Ab': 11
    };
    
    const bassFret = bassNoteToFret[bassNote];
    if (bassFret !== undefined) {
      modifiedFrets[3] = bassFret; // A string is index 3
      modifiedFingers[3] = bassFret === 0 ? 0 : bassFret; // Open string has finger 0
      
      return {
        frets: modifiedFrets,
        fingers: modifiedFingers,
        isGenerated: true
      };
    }
  }
  
  // For minor chords, we'd need more complex logic
  // For now, return the major pattern with a note that it's approximated
  return {
    ...basePattern,
    isGenerated: true
  };
};

// Chord database with actual fingering positions
const CHORD_DATA = {
  // Guitar chords (6 strings): -1 = muted, 0 = open, >0 = fret number
  guitar: guitarChords,
  
  // Ukulele chords (4 strings): 0 = open, >0 = fret number
  ukulele: ukuleleChords,
  
  // Piano chords - notes to highlight
  piano: pianoChords,

  // Bass guitar chords (4 strings): 0 = open, >0 = fret number
  bassGuitar: bassGuitarChords,

  // Bass ukulele chords (4 strings): 0 = open, >0 = fret number
  bassUkulele: bassUkuleleChords,

  // Baritone ukulele chords (4 strings): 0 = open, >0 = fret number
  baritoneUkulele: baritoneUkuleleChords
};

const ChordChart = ({ chord, instrument, small = false }) => {
  // Calculate new sizes with exact same aspect ratio as original
  // Original sizes were: small: width 120, height 150 (ratio 0.8)
  //                      regular: width 200, height 250 (ratio 0.8)
  // Now we'll reduce by 60% while maintaining ratio
  const size = small ? { width: 48, height: 60 } : { width: 80, height: 130 };
  
  const renderFretboardChord = (instrument) => {
    let chordData = CHORD_DATA[instrument]?.[chord];
    
    // If chord not found in static data, try to generate a basic version
    if (!chordData) {
      chordData = generateBasicChord(chord, instrument);
      if (!chordData) {
        return <div>Chord not found: {chord}</div>;
      }
    }
    
    let strings = 6;
    if (instrument === 'ukulele' || instrument === 'bassUkulele' || instrument === 'baritoneUkulele' || instrument === 'bassGuitar') strings = 4;
    const frets = 5;
    const stringSpacing = size.width / (strings + 1);
    const fretSpacing = (size.height - 60) / frets;

    return (
      <svg width={size.width} height={size.height} className="fretboard">
        {/* Fret lines */}
        {Array.from({ length: frets + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={stringSpacing}
            y1={40 + i * fretSpacing}
            x2={size.width - stringSpacing}
            y2={40 + i * fretSpacing}
            stroke={i === 0 ? "#333" : "#666"}
            strokeWidth={i === 0 ? 3 : 1}
          />
        ))}
        
        {/* String lines */}
        {Array.from({ length: strings }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={stringSpacing * (i + 1)}
            y1={40}
            x2={stringSpacing * (i + 1)}
            y2={40 + frets * fretSpacing}
            stroke="#666"
            strokeWidth={1}
          />
        ))}

        {/* Adjust circle sizes for smaller overall dimensions */}
        {chordData.frets.map((fret, stringIndex) => {
          if (fret === -1) {
            // X mark for muted string - make smaller
            return (
              <g key={`mute-${stringIndex}`}>
                <line
                  x1={stringSpacing * (stringIndex + 1) - 4}
                  y1={25 - 4}
                  x2={stringSpacing * (stringIndex + 1) + 4}
                  y2={25 + 4}
                  stroke="#ff0000"
                  strokeWidth={1.5}
                />
                <line
                  x1={stringSpacing * (stringIndex + 1) - 4}
                  y1={25 + 4}
                  x2={stringSpacing * (stringIndex + 1) + 4}
                  y2={25 - 4}
                  stroke="#ff0000"
                  strokeWidth={1.5}
                />
              </g>
            );
          } else if (fret === 0) {
            // Open string circle - make smaller
            return (
              <circle
                key={`open-${stringIndex}`}
                cx={stringSpacing * (stringIndex + 1)}
                cy={25}
                r={small ? 2 : 3}
                fill="none"
                stroke="#333"
                strokeWidth={1.5}
              />
            );
          } else if (fret > 0) {
            // Finger position - make smaller
            return (
              <circle
                key={`finger-${stringIndex}`}
                cx={stringSpacing * (stringIndex + 1)}
                cy={40 + (fret - 0.5) * fretSpacing}
                r={small ? 3 : 4}
                fill="#333"
              />
            );
          }
          return null;
        })}

        {/* Smaller font for finger numbers */}
        {chordData.fingers?.map((finger, stringIndex) => {
          const fret = chordData.frets[stringIndex];
          if (finger > 0 && fret > 0) {
            return (
              <text
                key={`finger-num-${stringIndex}`}
                x={stringSpacing * (stringIndex + 1)}
                y={40 + (fret - 0.5) * fretSpacing + 2}
                textAnchor="middle"
                fill="white"
                fontSize={small ? "6" : "8"}
                fontWeight="bold"
              >
                {finger}
              </text>
            );
          }
          return null;
        })}
        
        {/* Generated chord indicator */}
        {chordData.isGenerated && (
          <text
            x={size.width / 2}
            y={size.height - 5}
            textAnchor="middle"
            fill="#666"
            fontSize={small ? "10" : "12"}
            fontStyle="italic"
          >
            *
          </text>
        )}
      </svg>
    );
  };

  const renderPianoChord = () => {
    let chordNotes = CHORD_DATA.piano[chord];
    
    // If chord not found, generate basic chord notes
    if (!chordNotes) {
      // Handle slash chords
      const parts = chord.split('/');
      const rootChord = parts[0];
      const bassNote = parts[1];
      
      // Simple chord note generation for piano
      const rootNote = rootChord.match(/^[A-G][#b]?/)?.[0];
      if (rootNote) {
        const isMinor = rootChord.includes('m') && !rootChord.includes('maj');
        
        // Basic chord intervals in semitones
        const majorThird = 4;
        const minorThird = 3;
        const perfectFifth = 7;
        
        // Note to semitone mapping
        const noteToSemitone = {
          'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
          'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        
        const semitoneToNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        const rootSemitone = noteToSemitone[rootNote];
        const thirdInterval = isMinor ? minorThird : majorThird;
        const thirdSemitone = (rootSemitone + thirdInterval) % 12;
        const fifthSemitone = (rootSemitone + perfectFifth) % 12;
        
        chordNotes = [
          rootNote,
          semitoneToNote[thirdSemitone],
          semitoneToNote[fifthSemitone]
        ];
        
        // Add bass note if it's a slash chord
        if (bassNote && !chordNotes.includes(bassNote)) {
          chordNotes.push(bassNote);
        }
      }
      
      if (!chordNotes) {
        return <div>Chord not found: {chord}</div>;
      }
    }

    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
    
    // Calculate dimensions based on real piano ratios
    // White key ratio: width 23.5mm : length 150mm = 1:6.38
    // Black key ratio: width 10.5mm : length 90mm = 1:8.57
    const whiteKeyWidth = size.width / 7;
    const whiteKeyHeight = whiteKeyWidth * 6.38; // Proper aspect ratio
    const blackKeyWidth = whiteKeyWidth * 0.447; // 10.5/23.5 = 0.447
    const blackKeyHeight = blackKeyWidth * 8.57; // Proper aspect ratio
    
    // Adjust SVG height to match the white key height
    const pianoHeight = Math.min(whiteKeyHeight, size.height);
    const actualBlackKeyHeight = Math.min(blackKeyHeight, pianoHeight * 0.6);

    return (
      <svg width={size.width} height={pianoHeight} className="piano">
        {/* White keys */}
        {whiteKeys.map((key, index) => (
          <rect
            key={`white-${key}`}
            x={index * whiteKeyWidth}
            y={0}
            width={whiteKeyWidth - 1}
            height={pianoHeight}
            fill={chordNotes.includes(key) ? "#c41e3a" : "white"}
            stroke="#333"
            strokeWidth={1}
          />
        ))}

        {/* Black keys - positioned between specific white keys */}
        {blackKeys.map((key, index) => {
          // Black keys are positioned between: C-D, D-E, F-G, G-A, A-B
          // This corresponds to white key positions: 0-1, 1-2, 3-4, 4-5, 5-6
          const whiteKeyPositions = [0, 1, 3, 4, 5]; // Between these white key indices
          const whiteKeyIndex = whiteKeyPositions[index];
          
          return (
            <rect
              key={`black-${key}`}
              x={(whiteKeyIndex + 1) * whiteKeyWidth - blackKeyWidth / 2}
              y={0}
              width={blackKeyWidth}
              height={actualBlackKeyHeight}
              fill={chordNotes.includes(key) ? "#c41e3a" : "#333"}
              stroke="#000"
              strokeWidth={1}
            />
          );
        })}

        {/* Key labels */}
        {whiteKeys.map((key, index) => (
          <text
            key={`label-${key}`}
            x={index * whiteKeyWidth + whiteKeyWidth / 2}
            y={pianoHeight - 5}
            textAnchor="middle"
            fill="#333"
            fontSize={small ? "6" : "8"}
          >
            {key}
          </text>
        ))}
      </svg>
    );
  };

  const renderChordDiagram = () => {
    switch (instrument) {
      case 'ukulele':
      case 'guitar':
      case 'bassGuitar':
      case 'bassUkulele':
      case 'baritoneUkulele':
        return renderFretboardChord(instrument);
      case 'piano':
        return renderPianoChord();
      default:
        return renderFretboardChord('ukulele');
    }
  };

  return (
    <div className={`chord-chart ${small ? 'small' : ''}`}>
      {renderChordDiagram()}
      {/* Generated chord indicator for piano chords */}
      {instrument === 'piano' && !CHORD_DATA.piano[chord] && (
        <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', fontSize: small ? '8px' : '10px' }}>
          *
        </div>
      )}
      <div className="chord-name">{chord}</div>
    </div>
  );
};

export default ChordChart;
