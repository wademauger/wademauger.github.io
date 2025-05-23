import React from 'react';
import ChordChart from './ChordChart';

const SongDetail = ({ song, instrument, onPinChord }) => {
  if (!song) return null;
  
  // Extract unique chords from lyrics
  const extractChordsFromLyrics = (lyrics) => {
    if (!lyrics || !Array.isArray(lyrics)) return [];
    
    const chordSet = new Set();
    const chordRegex = /\[([^\]]+)\]/g;
    
    lyrics.forEach(line => {
      let match;
      while ((match = chordRegex.exec(line)) !== null) {
        chordSet.add(match[1]);
      }
    });
    
    return Array.from(chordSet).sort();
  };
  
  // Simple function to highlight chords in lyrics
  const renderLyricsWithChords = (lyrics) => {
    if (!lyrics || !Array.isArray(lyrics)) return <p>No lyrics available.</p>;
    
    const formattedLyrics = lyrics.map((line, i) => {
      // Parse chord positions and clean lyric line
      const chordElements = [];
      const chordRegex = /\[([^\]]+)\]/g;
      let match;
      
      // First, extract the lyric line without any chord brackets
      const cleanLyricLine = line.replace(/\[([^\]]+)\]/g, '');
      
      // Now map each chord to its correct position in the clean lyric line
      let remainingLyrics = line;
      let lyricPos = 0;
      
      while ((match = chordRegex.exec(line)) !== null) {
        const chord = match[1];
        const originalPosition = match.index;
        
        // Count only lyric characters up to this chord
        const textBefore = line.substring(0, originalPosition);
        const lyricsBefore = textBefore.replace(/\[([^\]]+)\]/g, '');
        
        chordElements.push({
          chord,
          position: lyricsBefore.length
        });
      }
      
      // Build chord line with proper spacing
      const renderChordLine = () => {
        if (chordElements.length === 0) return <span>&nbsp;</span>;
        
        return (
          <div style={{ position: 'relative', height: '1.5em', width: '100%' }}>
            {chordElements.map(({ chord, position }) => (
              <span 
                key={`chord-${position}`}
                className="chord clickable monospace"
                onClick={() => onPinChord(chord)}
                style={{ 
                  position: 'absolute', 
                  left: `${position}ch`, // Position directly above the corresponding character
                  top: 0,
                  fontSize: 'inherit',
                  fontFamily: 'inherit'
                }}
              >
                {chord}
              </span>
            ))}
          </div>
        );
      };

      return (
        <div key={i} className="lyric-line-container">
          <div className="chord-line monospace">
            {renderChordLine()}
          </div>
          <div className="lyric-line monospace">
            {cleanLyricLine || '\u00A0'}
          </div>
        </div>
      );
    });
    
    return (
      <div className="lyrics-container">
        {formattedLyrics}
      </div>
    );
  };
  
  return (
    <div className="song-detail">
      <div className="song-header">
        <h2>{song.title}</h2>
      </div>
      
      <div className="chord-section">
        <h3>Chords Used</h3>
        <div className="chord-gallery">
          {extractChordsFromLyrics(song.lyrics).map(chord => (
            <div key={chord} className="chord-item" onClick={() => onPinChord(chord)}>
              <ChordChart 
                chord={chord}
                instrument={instrument}
              />
              <div className="chord-name">{chord}</div>
            </div>
          ))}
        </div>
        <p className="chord-tip">Click any chord to pin it to the bottom of the screen</p>
      </div>
      
      <div className="lyrics-section">
        <h3>Lyrics & Chords</h3>
        {renderLyricsWithChords(song.lyrics)}
      </div>
    </div>
  );
};

export default SongDetail;
