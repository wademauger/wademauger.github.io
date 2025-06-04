import React, { useState } from 'react';
import { FaPencilAlt, FaPlus, FaTrash, FaEdit, FaGripVertical } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInstrument, transposeSongUp, transposeSongDown } from '../../../store/chordsSlice';
import ChordChart from './ChordChart';
import LyricLineEditor from './LyricLineEditor';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable line component for drag and drop
const SortableLyricLine = ({ 
  line, 
  index, 
  id, 
  editingLineIndex, 
  editingEnabled, 
  hoveredLineIndex,
  setHoveredLineIndex,
  handleEditLine,
  handleDeleteLine,
  handleSaveLine,
  handleCancelEdit,
  renderLyricLine,
  isThisLinePending = false,
  isDragDisabled = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="lyric-content" style={{ flex: 1 }}>
            {renderLyricLine(line)}
          </div>
          {hoveredLineIndex === index && editingEnabled && (
            <div className="lyric-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                className="control-button edit" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditLine(index);
                }}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <FaPencilAlt />
              </button>
              <button 
                className="control-button delete" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLine(index);
                }}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#d9534f'
                }}
              >
                <FaTrash />
              </button>
              <div 
                {...(isDragDisabled ? {} : attributes)}
                {...(isDragDisabled ? {} : listeners)}
                className="drag-handle"
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ddd',
                  backgroundColor: isDragDisabled ? '#e9e9e9' : '#f0f0f0',
                  borderRadius: '3px',
                  cursor: isDragDisabled ? 'not-allowed' : 'grab',
                  fontSize: '12px',
                  color: isDragDisabled ? '#999' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: isDragDisabled ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
                  opacity: isDragDisabled ? 0.6 : 1
                }}
                onMouseDown={isDragDisabled ? undefined : (e) => e.currentTarget.style.cursor = 'grabbing'}
                onMouseUp={isDragDisabled ? undefined : (e) => e.currentTarget.style.cursor = 'grab'}
                title={isDragDisabled ? "Drag disabled during update" : "Drag to reorder"}
              >
                {isThisLinePending ? (
                  <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
                ) : (
                  <FaGripVertical />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SongDetail = ({ song, onPinChord, onUpdateSong, artist, editingEnabled = true }) => {
  const [editingLineIndex, setEditingLineIndex] = useState(null);
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [hoveredLineIndex, setHoveredLineIndex] = useState(null);
  const [localTranspose, setLocalTranspose] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [isEditingWholeSong, setIsEditingWholeSong] = useState(false);
  const [wholeSongText, setWholeSongText] = useState('');
  const [pendingDragOperation, setPendingDragOperation] = useState(null);
  const [optimisticLyrics, setOptimisticLyrics] = useState(null);
  const [pendingLineIndex, setPendingLineIndex] = useState(null);
  const dispatch = useDispatch();
  const instrument = useSelector((state) => state.chords.currentInstrument);
  const transpose = useSelector((state) => state.chords.transposeBy?.[song.title] || 0);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Extract unique chords from lyrics
  const extractChords = (lyrics) => {
    const chordRegex = /\[(.*?)\]/g;
    const allChords = [];
    
    lyrics?.forEach(line => {
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

  const handleSaveLine = async (newLine, index) => {
    const updatedLyrics = [...song.lyrics];
    
    if (isAddingLine) {
      // Add new line at the end - optimistic update
      updatedLyrics.push(newLine);
      setOptimisticLyrics(updatedLyrics);
      setPendingDragOperation({ type: 'add', line: newLine });
      
      // Exit edit mode immediately for better UX
      setEditingLineIndex(null);
      setIsAddingLine(false);
      
      try {
        // Send update to server
        await onUpdateSong({
          ...song,
          lyrics: updatedLyrics,
          chords: extractChords(updatedLyrics)
        });
        
        // Server confirmed - clear optimistic state
        setOptimisticLyrics(null);
        setPendingDragOperation(null);
      } catch (error) {
        // Server failed - revert to original lyrics and re-enter edit mode
        console.error('Failed to add line:', error);
        setOptimisticLyrics(null);
        setPendingDragOperation(null);
        setIsAddingLine(true);
        setEditingLineIndex(null);
      }
    } else {
      // Update existing line - optimistic update
      updatedLyrics[index] = newLine;
      setOptimisticLyrics(updatedLyrics);
      setPendingDragOperation({ type: 'edit', index, line: newLine });
      
      // Exit edit mode immediately for better UX
      setEditingLineIndex(null);
      
      try {
        // Send update to server
        await onUpdateSong({
          ...song,
          lyrics: updatedLyrics,
          chords: extractChords(updatedLyrics)
        });
        
        // Server confirmed - clear optimistic state
        setOptimisticLyrics(null);
        setPendingDragOperation(null);
      } catch (error) {
        // Server failed - revert to original lyrics and re-enter edit mode
        console.error('Failed to update line:', error);
        setOptimisticLyrics(null);
        setPendingDragOperation(null);
        setEditingLineIndex(index);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingLineIndex(null);
    setIsAddingLine(false);
  };

  // Handle drag end for reordering lines with optimistic updates
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = song.lyrics.findIndex((_, index) => index.toString() === active.id);
      const newIndex = song.lyrics.findIndex((_, index) => index.toString() === over.id);
      
      // Optimistic update - immediately show the new order
      const newLyrics = arrayMove(song.lyrics, oldIndex, newIndex);
      setOptimisticLyrics(newLyrics);
      setPendingDragOperation({ oldIndex, newIndex });
      setPendingLineIndex(newIndex); // Track which line is pending
      
      try {
        // Send update to server
        await onUpdateSong({
          ...song,
          lyrics: newLyrics
        });
        
        // Server confirmed - clear optimistic state
        setOptimisticLyrics(null);
        setPendingDragOperation(null);
        setPendingLineIndex(null);
      } catch (error) {
        // Server failed - revert to original order
        console.error('Failed to update song:', error);
        setOptimisticLyrics(null);
        setPendingDragOperation(null);
        setPendingLineIndex(null);
      }
    }
  };

  // Remove the old handleMoveLine function as it's replaced by drag and drop

  // Handle whole song editing
  const handleEditWholeSong = () => {
    setWholeSongText(song.lyrics.join('\n'));
    setIsEditingWholeSong(true);
  };

  const handleSaveWholeSong = () => {
    const newLyrics = wholeSongText.split('\n').filter(line => line.trim() !== '');
    onUpdateSong({
      ...song,
      lyrics: newLyrics,
      chords: extractChords(newLyrics)
    });
    setIsEditingWholeSong(false);
  };

  const handleCancelWholeSong = () => {
    setIsEditingWholeSong(false);
    setWholeSongText('');
  };

  const handleDeleteLine = async (index) => {
    const lineText = song.lyrics[index];
    const confirmMessage = `Are you sure you want to delete this line?\n\n"${lineText}"`;
    
    if (window.confirm(confirmMessage)) {
      // Optimistic update - immediately remove the line
      const updatedLyrics = song.lyrics.filter((_, i) => i !== index);
      setOptimisticLyrics(updatedLyrics);
      setPendingDragOperation({ type: 'delete', index });
      
      try {
        // Send update to server
        await onUpdateSong({
          ...song,
          lyrics: updatedLyrics,
          chords: extractChords(updatedLyrics)
        });
        
        // Server confirmed - clear optimistic state
        setOptimisticLyrics(null);
        setPendingDragOperation(null);
      } catch (error) {
        // Server failed - revert to original lyrics
        console.error('Failed to delete line:', error);
        setOptimisticLyrics(null);
        setPendingDragOperation(null);
      }
    }
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
  }, [song.title]);

  const handleTransposeUp = () => {
    setLocalTranspose((prev) => prev + 1);
    setDirty(true);
    dispatch(transposeSongUp(song.title));
  };
  const handleTransposeDown = () => {
    setLocalTranspose((prev) => prev - 1);
    setDirty(true);
    dispatch(transposeSongDown(song.title));
  };
  const handleSaveTranspose = () => {
    // Apply transposition to all lyrics inline
    const transposedLyrics = song.lyrics.map(line => {
      const chordRegex = /\[([^\]]+)\]/g;
      return line.replace(chordRegex, (match, chord) => {
        const transposedChord = transposeChord(chord, localTranspose);
        return `[${transposedChord}]`;
      });
    });

    const updatedSong = { 
      ...song, 
      lyrics: transposedLyrics,
      chords: extractChords(transposedLyrics)
    };
    
    onUpdateSong(updatedSong);
    
    // Reset local transpose since it's now baked into the lyrics
    setLocalTranspose(0);
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
              Save Transposed Lyrics
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
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              <h3 style={{ margin: 0 }}>{song.title}</h3>
              <i style={{ margin: 0 }}>{artist.name}</i>
            </div>
            {editingEnabled && !isEditingWholeSong && (
              <button 
                className="edit-whole-song-btn"
                onClick={handleEditWholeSong}
                style={{ 
                  padding: '0.5em 1em', 
                  fontSize: '0.9em',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  border: '1px solid #3367d6',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3367d6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4285f4'}
              >
                <FaEdit /> Edit Whole Song
              </button>
            )}
          </div>
          
          {isEditingWholeSong ? (
            <div className="whole-song-editor" style={{ marginTop: '1rem' }}>
              <textarea
                value={wholeSongText}
                onChange={(e) => setWholeSongText(e.target.value)}
                rows={15}
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                placeholder="Enter lyrics with [Chord] notation..."
              />
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleSaveWholeSong}
                  style={{ 
                    padding: '0.5em 1em',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
                <button 
                  onClick={handleCancelWholeSong}
                  style={{ 
                    padding: '0.5em 1em',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={(optimisticLyrics || song.lyrics).map((_, index) => index.toString())}
                strategy={verticalListSortingStrategy}
              >
                {(optimisticLyrics || song.lyrics) && (optimisticLyrics || song.lyrics).map((line, index) => (
                  <SortableLyricLine
                    key={index}
                    id={index.toString()}
                    line={line}
                    index={index}
                    editingLineIndex={editingLineIndex}
                    editingEnabled={editingEnabled}
                    hoveredLineIndex={hoveredLineIndex}
                    setHoveredLineIndex={setHoveredLineIndex}
                    handleEditLine={handleEditLine}
                    handleDeleteLine={handleDeleteLine}
                    handleSaveLine={handleSaveLine}
                    handleCancelEdit={handleCancelEdit}
                    renderLyricLine={renderLyricLine}
                    isThisLinePending={pendingLineIndex === index}
                    isDragDisabled={pendingDragOperation !== null}
                  />
                ))}
              </SortableContext>
              
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
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongDetail;
