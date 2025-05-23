import React from 'react';
import { guitarChords } from '../data/guitarChords';
import { ukuleleChords } from '../data/ukuleleChords';
import { pianoChords } from '../data/pianoChords';

// Chord database with actual fingering positions
const CHORD_DATA = {
  // Guitar chords (6 strings): -1 = muted, 0 = open, >0 = fret number
  guitar: guitarChords,
  
  // Ukulele chords (4 strings): 0 = open, >0 = fret number
  ukulele: ukuleleChords,
  
  // Piano chords - notes to highlight
  piano: pianoChords
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
            fill={chordNotes.includes(key) ? "#4a90e2" : "white"}
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
            x={index * whiteKeyWidth + whiteKeyWidth / 2}
            y={pianoHeight - 10}
            textAnchor="middle"
            fill="#333"
            fontSize={small ? "10" : "12"}
          >
            {key}
          </text>
        ))}

        {/* Black key labels */}
        {blackKeys.map((key, index) => {
          const whiteKeyPositions = [0, 1, 3, 4, 5];
          const whiteKeyIndex = whiteKeyPositions[index];
          
          return (
            <text
              key={`black-label-${key}`}
              x={(whiteKeyIndex + 1) * whiteKeyWidth}
              y={actualBlackKeyHeight - 10}
              textAnchor="middle"
              fill="white"
              fontSize={small ? "7" : "9"}
            >
              {key}
            </text>
          );
        })}
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
