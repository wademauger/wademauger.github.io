import React, { useState } from 'react';
import { FaPencilAlt, FaPlus, FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInstrument, transposeSongUp, transposeSongDown } from '../../../store/chordsSlice';
import ChordChart from './ChordChart';
import LyricLineEditor from './LyricLineEditor';

const SongDetail = ({ song, onPinChord, onUpdateSong, artist, editingEnabled = true }) => {
  const [editingLineIndex, setEditingLineIndex] = useState(null);
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [hoveredLineIndex, setHoveredLineIndex] = useState(null);
  const [localTranspose, setLocalTranspose] = useState(0);
  const [dirty, setDirty] = useState(false);
  const dispatch = useDispatch();
  const instrument = useSelector((state) => state.chords.currentInstrument);
  const transpose = useSelector((state) => state.chords.transposeBy?.[song.id] || 0);

  // Extract unique chords from lyrics
  const extractChords = (lyrics) => {
    const chordRegex = /\[(.*?)\]/g;
    const allChords = [];
    
    lyrics.forEach(line => {
      let match;
      while ((match = chordRegex.exec(line)) !== null) {
        if (!allChords.includes(match[1])) {
          allChords.push(match[1]);
        }
      }
    });
    
    return allChords;
  };

  // Helper to shift a chord name by a number of semitones
  const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT_EQUIV = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
  function normalizeChordName(name) {
    // Convert flats to sharps for lookup
    let base = name;
    let suffix = '';
    if (name.length > 1 && (name[1] === '#' || name[1] === 'b')) {
      base = name.slice(0, 2);
      suffix = name.slice(2);
    } else {
      base = name[0];
      suffix = name.slice(1);
    }
    if (FLAT_EQUIV[base]) base = FLAT_EQUIV[base];
    return base + suffix;
  }
  function transposeChord(chord, semitones) {
    // Extract root and suffix (e.g. C#m7 -> C#, m7)
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    let [_, root, suffix] = match;
    // Normalize flats to sharps
    if (FLAT_EQUIV[root]) root = FLAT_EQUIV[root];
    let idx = CHROMATIC.indexOf(root);
    if (idx === -1) return chord;
    let newIdx = (idx + semitones + 12) % 12;
    return CHROMATIC[newIdx] + suffix;
  }

  const chords = (song.chords || extractChords(song.lyrics || [])).map(chord =>
    localTranspose !== 0 ? transposeChord(chord, localTranspose) : chord
  );

  const handleEditLine = (index) => {
    setEditingLineIndex(index);
    setIsAddingLine(false);
  };

  const handleAddLine = () => {
    setIsAddingLine(true);
    setEditingLineIndex(null);
  };

  const handleSaveLine = (newLine, index) => {
    const updatedLyrics = [...song.lyrics];
    
    if (isAddingLine) {
      // Add new line at the end
      updatedLyrics.push(newLine);
    } else {
      // Update existing line
      updatedLyrics[index] = newLine;
    }
    
    // Update the song with new lyrics
    onUpdateSong({
      ...song,
      lyrics: updatedLyrics,
      chords: extractChords(updatedLyrics)
    });
    
    // Exit edit mode
    setEditingLineIndex(null);
    setIsAddingLine(false);
  };

  const handleCancelEdit = () => {
    setEditingLineIndex(null);
    setIsAddingLine(false);
  };

  const handleMoveLine = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === song.lyrics.length - 1)
    ) {
      return; // Can't move beyond boundaries
    }
    
    const updatedLyrics = [...song.lyrics];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap positions
    [updatedLyrics[index], updatedLyrics[targetIndex]] = 
    [updatedLyrics[targetIndex], updatedLyrics[index]];
    
    // Update song
    onUpdateSong({
      ...song,
      lyrics: updatedLyrics
    });
  };

  const handleDeleteLine = (index) => {
    const updatedLyrics = song.lyrics.filter((_, i) => i !== index);
    
    // Update song
    onUpdateSong({
      ...song,
      lyrics: updatedLyrics,
      chords: extractChords(updatedLyrics)
    });
  };

  // Function to render a lyric line with chord formatting above text
  const renderLyricLine = (line) => {
    const chordRegex = /\[(.*?)\]/g;
    const chordPositions = [];
    let plainText = line;
    let match;
    
    // Extract chord positions and create plain text
    while ((match = chordRegex.exec(line)) !== null) {
      chordPositions.push({
        chord: match[1],
        position: match.index,
        length: match[0].length
      });
    }
    
    // Remove chord markers for plain text
    plainText = plainText.replace(/\[(.*?)\]/g, '');
    
    // Calculate positions for chord labels
    const adjustedChordPositions = chordPositions.map((item, index) => {
      let adjustment = 0;
      for (let i = 0; i < index; i++) {
        adjustment += chordPositions[i].length;
      }
      // Transpose the chord if needed
      const transposedChord = localTranspose !== 0 ? transposeChord(item.chord, localTranspose) : item.chord;
      return {
        ...item,
        chord: transposedChord,
        position: item.position - adjustment
      };
    });
    
    return (
      <div className="lyric-line-with-chords">
        <div className="chord-labels">
          {adjustedChordPositions.map((item, idx) => (
            <span 
              key={`chord-${idx}`} 
              className="chord-label"
              style={{ left: `${item.position}ch` }}
              onClick={() => onPinChord(item.chord)}
            >
              {item.chord}
            </span>
          ))}
        </div>
        <div className="lyric-text-only">
          {plainText}
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    // Sync local transpose with redux only when song changes
    setLocalTranspose(transpose);
    setDirty(false);
  }, [song.id]);

  const handleTransposeUp = () => {
    setLocalTranspose((prev) => prev + 1);
    setDirty(true);
    dispatch(transposeSongUp(song.id));
  };
  const handleTransposeDown = () => {
    setLocalTranspose((prev) => prev - 1);
    setDirty(true);
    dispatch(transposeSongDown(song.id));
  };
  const handleSaveTranspose = () => {
    const updatedSong = { ...song, transpose: localTranspose };
    onUpdateSong(updatedSong);
    setDirty(false);
  };

  return (
    <div className="song-detail">      
      {/* Chord section */}
      <div className="chords-section">
        <div className="chords-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>{song.title}</h3>
            <i style={{ margin: 0 }}>{artist.name}</i>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center' }}>
            <button
              className="transpose-btn"
              title="Transpose Down"
              onClick={handleTransposeDown}
              style={{ fontSize: '1.2em', padding: '0.2em 0.6em' }}
            >
              -
            </button>
            <span style={{ minWidth: 40, textAlign: 'center' }}>Transpose: {localTranspose > 0 ? `+${localTranspose}` : localTranspose} semitones</span>
            <button
              className="transpose-btn"
              title="Transpose Up"
              onClick={handleTransposeUp}
              style={{ fontSize: '1.2em', padding: '0.2em 0.6em' }}
            >
              +
            </button>
            <button
              className="save-transpose-btn"
              onClick={handleSaveTranspose}
              disabled={!dirty || !editingEnabled}
              style={{ marginLeft: '1em', padding: '0.2em 0.8em', opacity: dirty && editingEnabled ? 1 : 0.5 }}
            >
              Save as Default Key
            </button>
          </div>
          <div className="instrument-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label htmlFor="instrument-select" style={{ marginRight: 0 }}>Instrument:</label>
            <select
              id="instrument-select"
              value={instrument}
              onChange={(e) => dispatch(setInstrument(e.target.value))}
              style={{ minWidth: 120 }}
            >
              <option value="ukulele">Ukulele</option>
              <option value="guitar">Guitar</option>
              <option value="piano">Piano</option>
              <option value="bassGuitar">Bass Guitar</option>
              <option value="bassUkulele">Bass Ukulele</option>
              <option value="baritoneUkulele">Baritone Ukulele</option>
            </select>
          </div>
        </div>
        <div className="chord-container">
          {chords.map(chord => (
            <div key={chord} className="chord-item" onClick={() => onPinChord(chord)}>
              <ChordChart
                chord={chord}
                instrument={instrument}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Lyrics section */}
      <div className="lyrics-section">
        <div className="lyrics-container">
          {song.lyrics && song.lyrics.map((line, index) => (
            <div 
              key={`line-${index}`} 
              className="lyric-line"
              onMouseEnter={() => setHoveredLineIndex(index)}
              onMouseLeave={() => setHoveredLineIndex(null)}
            >
              {editingLineIndex === index && editingEnabled ? (
                <LyricLineEditor
                  line={line}
                  onSave={(newLine) => handleSaveLine(newLine, index)}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <>
                  <div className="lyric-content">
                    {renderLyricLine(line)}
                  </div>
                  {hoveredLineIndex === index && editingEnabled && (
                    <div className="lyric-controls">
                      <button 
                        className="control-button move-up" 
                        onClick={() => handleMoveLine(index, 'up')}
                        disabled={index === 0}
                      >
                        <FaArrowUp />
                      </button>
                      <button 
                        className="control-button move-down" 
                        onClick={() => handleMoveLine(index, 'down')}
                        disabled={index === song.lyrics.length - 1}
                      >
                        <FaArrowDown />
                      </button>
                      <button 
                        className="control-button edit" 
                        onClick={() => handleEditLine(index)}
                      >
                        <FaPencilAlt />
                      </button>
                      <button 
                        className="control-button delete" 
                        onClick={() => handleDeleteLine(index)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          
          {isAddingLine && editingEnabled ? (
            <LyricLineEditor
              line=""
              onSave={(newLine) => handleSaveLine(newLine)}
              onCancel={handleCancelEdit}
            />
          ) : (
            editingEnabled && <button className="add-lyric-button" onClick={handleAddLine}>
              <FaPlus /> Add Line
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongDetail;
