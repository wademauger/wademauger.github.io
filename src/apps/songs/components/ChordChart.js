import React from 'react';

// Chord database with actual fingering positions
const CHORD_DATA = {
  // Guitar chords (6 strings): -1 = muted, 0 = open, >0 = fret number
  guitar: {
    // Major chords
    'C': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    'C#': { frets: [-1, -1, 3, 1, 2, 1], fingers: [0, 0, 4, 1, 3, 2] },
    'Db': { frets: [-1, -1, 3, 1, 2, 1], fingers: [0, 0, 4, 1, 3, 2] },
    'D': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    'D#': { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
    'Eb': { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
    'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    'F': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] },
    'F#': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1] },
    'Gb': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1] },
    'G': { frets: [3, 2, 0, 0, 3, 3], fingers: [3, 2, 0, 0, 4, 4] },
    'G#': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1] },
    'Ab': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1] },
    'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    'A#': { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1] },
    'Bb': { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1] },
    'B': { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 3, 4, 4, 1] },
    
    // Minor chords
    'Cm': { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1] },
    'C#m': { frets: [-1, -1, 2, 1, 2, 0], fingers: [0, 0, 3, 1, 4, 0] },
    'Dbm': { frets: [-1, -1, 2, 1, 2, 0], fingers: [0, 0, 3, 1, 4, 0] },
    'Dm': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
    'D#m': { frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2] },
    'Ebm': { frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2] },
    'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    'Fm': { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1] },
    'F#m': { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1] },
    'Gbm': { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1] },
    'Gm': { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1] },
    'G#m': { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1] },
    'Abm': { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1] },
    'Am': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    'A#m': { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1] },
    'Bbm': { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1] },
    'Bm': { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1] },
    
    // 7th chords
    'C7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
    'C#7': { frets: [-1, -1, 3, 4, 2, 4], fingers: [0, 0, 2, 3, 1, 4] },
    'Db7': { frets: [-1, -1, 3, 4, 2, 4], fingers: [0, 0, 2, 3, 1, 4] },
    'D7': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 3, 1, 2] },
    'D#7': { frets: [-1, -1, 1, 3, 2, 3], fingers: [0, 0, 1, 4, 2, 3] },
    'Eb7': { frets: [-1, -1, 1, 3, 2, 3], fingers: [0, 0, 1, 4, 2, 3] },
    'E7': { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
    'F7': { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1] },
    'F#7': { frets: [2, 4, 2, 3, 2, 2], fingers: [1, 4, 1, 2, 1, 1] },
    'Gb7': { frets: [2, 4, 2, 3, 2, 2], fingers: [1, 4, 1, 2, 1, 1] },
    'G7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
    'G#7': { frets: [4, 6, 4, 5, 4, 4], fingers: [1, 4, 1, 3, 1, 1] },
    'Ab7': { frets: [4, 6, 4, 5, 4, 4], fingers: [1, 4, 1, 3, 1, 1] },
    'A7': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
    'A#7': { frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1] },
    'Bb7': { frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1] },
    'B7': { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] }
  },
  
  // Ukulele chords (4 strings): 0 = open, >0 = fret number
  ukulele: {
    // Major chords
    'C': { frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
    'C#': { frets: [1, 1, 1, 4], fingers: [1, 1, 1, 4] },
    'Db': { frets: [1, 1, 1, 4], fingers: [1, 1, 1, 4] },
    'D': { frets: [2, 2, 2, 0], fingers: [1, 1, 1, 0] },
    'D#': { frets: [0, 3, 3, 1], fingers: [0, 3, 4, 1] },
    'Eb': { frets: [0, 3, 3, 1], fingers: [0, 3, 4, 1] },
    'E': { frets: [4, 4, 4, 2], fingers: [3, 3, 3, 1] },
    'F': { frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0] },
    'F#': { frets: [3, 1, 2, 1], fingers: [4, 1, 3, 2] },
    'Gb': { frets: [3, 1, 2, 1], fingers: [4, 1, 3, 2] },
    'G': { frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2] },
    'G#': { frets: [5, 3, 4, 3], fingers: [4, 1, 3, 2] },
    'Ab': { frets: [5, 3, 4, 3], fingers: [4, 1, 3, 2] },
    'A': { frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0] },
    'A#': { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1] },
    'Bb': { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1] },
    'B': { frets: [4, 3, 2, 2], fingers: [4, 3, 1, 2] },
    
    // Minor chords
    'Cm': { frets: [0, 3, 3, 3], fingers: [0, 1, 2, 3] },
    'C#m': { frets: [1, 1, 0, 4], fingers: [1, 2, 0, 4] },
    'Dbm': { frets: [1, 1, 0, 4], fingers: [1, 2, 0, 4] },
    'Dm': { frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0] },
    'D#m': { frets: [3, 3, 2, 1], fingers: [3, 4, 2, 1] },
    'Ebm': { frets: [3, 3, 2, 1], fingers: [3, 4, 2, 1] },
    'Em': { frets: [0, 4, 3, 2], fingers: [0, 4, 3, 2] },
    'Fm': { frets: [1, 0, 1, 3], fingers: [1, 0, 2, 4] },
    'F#m': { frets: [2, 1, 2, 0], fingers: [2, 1, 3, 0] },
    'Gbm': { frets: [2, 1, 2, 0], fingers: [2, 1, 3, 0] },
    'Gm': { frets: [0, 2, 3, 1], fingers: [0, 2, 4, 1] },
    'G#m': { frets: [1, 3, 4, 2], fingers: [1, 3, 4, 2] },
    'Abm': { frets: [1, 3, 4, 2], fingers: [1, 3, 4, 2] },
    'Am': { frets: [2, 0, 0, 0], fingers: [1, 0, 0, 0] },
    'A#m': { frets: [3, 1, 1, 1], fingers: [4, 1, 2, 3] },
    'Bbm': { frets: [3, 1, 1, 1], fingers: [4, 1, 2, 3] },
    'Bm': { frets: [4, 2, 2, 2], fingers: [4, 1, 2, 3] },
    
    // 7th chords
    'C7': { frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1] },
    'C#7': { frets: [1, 1, 1, 2], fingers: [1, 1, 1, 2] },
    'Db7': { frets: [1, 1, 1, 2], fingers: [1, 1, 1, 2] },
    'D7': { frets: [2, 2, 2, 3], fingers: [1, 1, 1, 2] },
    'D#7': { frets: [3, 3, 3, 4], fingers: [1, 1, 1, 2] },
    'Eb7': { frets: [3, 3, 3, 4], fingers: [1, 1, 1, 2] },
    'E7': { frets: [1, 2, 0, 2], fingers: [1, 3, 0, 4] },
    'F7': { frets: [2, 3, 1, 3], fingers: [1, 3, 2, 4] },
    'F#7': { frets: [3, 4, 2, 4], fingers: [1, 3, 2, 4] },
    'Gb7': { frets: [3, 4, 2, 4], fingers: [1, 3, 2, 4] },
    'G7': { frets: [0, 2, 1, 2], fingers: [0, 3, 1, 4] },
    'G#7': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
    'Ab7': { frets: [1, 3, 2, 3], fingers: [1, 4, 2, 3] },
    'A7': { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] },
    'A#7': { frets: [1, 2, 1, 1], fingers: [1, 4, 2, 3] },
    'Bb7': { frets: [1, 2, 1, 1], fingers: [1, 4, 2, 3] },
    'B7': { frets: [2, 3, 2, 2], fingers: [1, 4, 2, 3] }
  },
  
  // Piano chords - notes to highlight
  piano: {
    // Major chords
    'C': ['C', 'E', 'G'],
    'C#': ['C#', 'F', 'G#'],
    'Db': ['C#', 'F', 'G#'],
    'D': ['D', 'F#', 'A'],
    'D#': ['D#', 'G', 'A#'],
    'Eb': ['D#', 'G', 'A#'],
    'E': ['E', 'G#', 'B'],
    'F': ['F', 'A', 'C'],
    'F#': ['F#', 'A#', 'C#'],
    'Gb': ['F#', 'A#', 'C#'],
    'G': ['G', 'B', 'D'],
    'G#': ['G#', 'C', 'D#'],
    'Ab': ['G#', 'C', 'D#'],
    'A': ['A', 'C#', 'E'],
    'A#': ['A#', 'D', 'F'],
    'Bb': ['A#', 'D', 'F'],
    'B': ['B', 'D#', 'F#'],
    
    // Minor chords
    'Cm': ['C', 'D#', 'G'],
    'C#m': ['C#', 'E', 'G#'],
    'Dbm': ['C#', 'E', 'G#'],
    'Dm': ['D', 'F', 'A'],
    'D#m': ['D#', 'F#', 'A#'],
    'Ebm': ['D#', 'F#', 'A#'],
    'Em': ['E', 'G', 'B'],
    'Fm': ['F', 'G#', 'C'],
    'F#m': ['F#', 'A', 'C#'],
    'Gbm': ['F#', 'A', 'C#'],
    'Gm': ['G', 'A#', 'D'],
    'G#m': ['G#', 'B', 'D#'],
    'Abm': ['G#', 'B', 'D#'],
    'Am': ['A', 'C', 'E'],
    'A#m': ['A#', 'C#', 'F'],
    'Bbm': ['A#', 'C#', 'F'],
    'Bm': ['B', 'D', 'F#'],
    
    // 7th chords
    'C7': ['C', 'E', 'G', 'A#'],
    'C#7': ['C#', 'F', 'G#', 'B'],
    'Db7': ['C#', 'F', 'G#', 'B'],
    'D7': ['D', 'F#', 'A', 'C'],
    'D#7': ['D#', 'G', 'A#', 'C#'],
    'Eb7': ['D#', 'G', 'A#', 'C#'],
    'E7': ['E', 'G#', 'B', 'D'],
    'F7': ['F', 'A', 'C', 'D#'],
    'F#7': ['F#', 'A#', 'C#', 'E'],
    'Gb7': ['F#', 'A#', 'C#', 'E'],
    'G7': ['G', 'B', 'D', 'F'],
    'G#7': ['G#', 'C', 'D#', 'F#'],
    'Ab7': ['G#', 'C', 'D#', 'F#'],
    'A7': ['A', 'C#', 'E', 'G'],
    'A#7': ['A#', 'D', 'F', 'G#'],
    'Bb7': ['A#', 'D', 'F', 'G#'],
    'B7': ['B', 'D#', 'F#', 'A']
  }
};

const ChordChart = ({ chord, instrument, small = false }) => {
  const size = small ? { width: 120, height: 150 } : { width: 200, height: 250 };
  
  const renderFretboardChord = (instrument) => {
    const chordData = CHORD_DATA[instrument]?.[chord];
    if (!chordData) return <div>Chord not found</div>;
    
    const strings = instrument === 'ukulele' ? 4 : 6;
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

        {/* Finger positions */}
        {chordData.frets.map((fret, stringIndex) => {
          if (fret === -1) {
            // X mark for muted string
            return (
              <g key={`mute-${stringIndex}`}>
                <line
                  x1={stringSpacing * (stringIndex + 1) - 6}
                  y1={25 - 6}
                  x2={stringSpacing * (stringIndex + 1) + 6}
                  y2={25 + 6}
                  stroke="#ff0000"
                  strokeWidth={2}
                />
                <line
                  x1={stringSpacing * (stringIndex + 1) - 6}
                  y1={25 + 6}
                  x2={stringSpacing * (stringIndex + 1) + 6}
                  y2={25 - 6}
                  stroke="#ff0000"
                  strokeWidth={2}
                />
              </g>
            );
          } else if (fret === 0) {
            // Open string circle
            return (
              <circle
                key={`open-${stringIndex}`}
                cx={stringSpacing * (stringIndex + 1)}
                cy={25}
                r={small ? 4 : 6}
                fill="none"
                stroke="#333"
                strokeWidth={2}
              />
            );
          } else if (fret > 0) {
            // Finger position
            return (
              <circle
                key={`finger-${stringIndex}`}
                cx={stringSpacing * (stringIndex + 1)}
                cy={40 + (fret - 0.5) * fretSpacing}
                r={small ? 6 : 8}
                fill="#333"
              />
            );
          }
          return null;
        })}

        {/* Finger numbers */}
        {chordData.fingers?.map((finger, stringIndex) => {
          const fret = chordData.frets[stringIndex];
          if (finger > 0 && fret > 0) {
            return (
              <text
                key={`finger-num-${stringIndex}`}
                x={stringSpacing * (stringIndex + 1)}
                y={40 + (fret - 0.5) * fretSpacing + 4}
                textAnchor="middle"
                fill="white"
                fontSize={small ? "10" : "12"}
                fontWeight="bold"
              >
                {finger}
              </text>
            );
          }
          return null;
        })}
      </svg>
    );
  };

  const renderPianoChord = () => {
    const chordNotes = CHORD_DATA.piano[chord];
    if (!chordNotes) return <div>Chord not found</div>;

    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
    const keyWidth = size.width / 7;
    const blackKeyWidth = keyWidth * 0.6;
    const blackKeyHeight = size.height * 0.6;

    return (
      <svg width={size.width} height={size.height} className="piano">
        {/* White keys */}
        {whiteKeys.map((key, index) => (
          <rect
            key={`white-${key}`}
            x={index * keyWidth}
            y={0}
            width={keyWidth - 1}
            height={size.height}
            fill={chordNotes.includes(key) ? "#4a90e2" : "white"}
            stroke="#333"
            strokeWidth={1}
          />
        ))}

        {/* Black keys */}
        {blackKeys.map((key, index) => {
          const positions = [0.5, 1.5, 3.5, 4.5, 5.5];
          return (
            <rect
              key={`black-${key}`}
              x={positions[index] * keyWidth - blackKeyWidth / 2}
              y={0}
              width={blackKeyWidth}
              height={blackKeyHeight}
              fill={chordNotes.includes(key) ? "#2c5aa0" : "#333"}
              stroke="#000"
              strokeWidth={1}
            />
          );
        })}

        {/* Key labels */}
        {whiteKeys.map((key, index) => (
          <text
            key={`label-${key}`}
            x={index * keyWidth + keyWidth / 2}
            y={size.height - 10}
            textAnchor="middle"
            fill="#333"
            fontSize={small ? "10" : "12"}
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
        return renderFretboardChord(instrument);
      case 'piano':
        return renderPianoChord();
      default:
        return renderFretboardChord('ukulele');
    }
  };

  return (
    <div className={`chord-chart ${small ? 'small' : ''}`}>
      <div className="chord-name">{chord}</div>
      {renderChordDiagram()}
    </div>
  );
};

export default ChordChart;
