import React from 'react';
import ChordChart from './ChordChart';

const SongDetail = ({ song, instrument, onPinChord }) => {
  if (!song) return null;
  
  // Simple function to highlight chords in lyrics
  const renderLyricsWithChords = (lyrics) => {
    // This is a simplified version - a real implementation would be more robust
    if (!lyrics) return <p>No lyrics available.</p>;
    
    const formattedLyrics = lyrics.split('\n').map((line, i) => {
      // Replace chord patterns [C], [Am], etc. with styled spans
      const processedLine = line.replace(/\[([^\]]+)\]/g, (match, chord) => {
        return `<span class="chord" data-chord="${chord}">${chord}</span>`;
      });
      
      return (
        <div key={i} className="lyric-line" 
             dangerouslySetInnerHTML={{ __html: processedLine }} />
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
          {song.chords.map(chord => (
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
