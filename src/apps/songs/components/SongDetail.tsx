import React, { useState } from 'react';
import { FaPencilAlt, FaPlus, FaTrash, FaEdit, FaGripVertical, FaClipboard } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setInstrument, transposeSongUp, transposeSongDown } from '../../../store/chordsSlice';
import { deleteSong, clearSelectedSong, setGoogleDriveConnection, setUserInfo } from '../../../store/songsSlice';
import ChordChart from './ChordChart';
import LyricLineEditor from './LyricLineEditor';
import { Spin, App, Modal } from 'antd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
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
  handleInsertAfter,
  handleDeleteLine,
  handleSaveLine,
  handleCancelEdit,
  renderLyricLine,
  isThisLinePending = false,
  isDragDisabled = false,
  isPendingDelete = false,
  isAddingLine = false,
  isPendingSave = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : (isPendingDelete ? 0.6 : 1),
    position: 'relative',
    backgroundColor: isPendingDelete ? '#f5f5f5' : 'transparent',
    color: isPendingDelete ? '#999' : 'inherit',
    pointerEvents: isPendingDelete ? 'none' : 'auto'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="lyric-line"
      onMouseEnter={() => setHoveredLineIndex(index)}
      onMouseLeave={() => setHoveredLineIndex(null)}
    >
      {editingLineIndex === index && !isAddingLine && editingEnabled ? (
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
          {isPendingSave && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '4px',
              color: '#1890ff'
            }}>
              <Spin size="small" />
              <span style={{ fontSize: '12px' }}>Saving...</span>
            </div>
          )}
          {isPendingDelete && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '4px',
              color: '#cf1322'
            }}>
              <Spin size="small" />
              <span style={{ fontSize: '12px' }}>Deleting...</span>
            </div>
          )}
          {hoveredLineIndex === index && editingEnabled && !isPendingDelete && (
            <div className="lyric-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                className="control-button edit" 
                onClick={(e: any) => {
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
                title="Edit this line"
              >
                <FaPencilAlt />
              </button>
              <button 
                className="control-button insert" 
                onClick={(e: any) => {
                  e.stopPropagation();
                  handleInsertAfter(index);
                }}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#5cb85c'
                }}
                title="Insert new line after this line"
              >
                <FaPlus />
              </button>
              <button 
                className="control-button delete" 
                onClick={(e: any) => {
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
                title="Delete this line"
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
                onMouseDown={isDragDisabled ? undefined : (e: any) => e.currentTarget.style.cursor = 'grabbing'}
                onMouseUp={isDragDisabled ? undefined : (e: any) => e.currentTarget.style.cursor = 'grab'}
                title={isDragDisabled ? 'Drag disabled during update' : 'Drag to reorder'}
              >
                {isThisLinePending ? (
                  <Spin size="small" />
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
  const { message } = App.useApp();
  const [editingLineIndex, setEditingLineIndex] = useState(null);
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [hoveredLineIndex, setHoveredLineIndex] = useState(null);
  const [localTranspose, setLocalTranspose] = useState(0);
  const [isEditingWholeSong, setIsEditingWholeSong] = useState(false);
  const [wholeSongText, setWholeSongText] = useState('');
  const [pendingSaves, setPendingSaves] = useState(new Set());
  const [optimisticLyrics, setOptimisticLyrics] = useState(null);
  const [pendingLineIndex, setPendingLineIndex] = useState(null);
  const [pendingDeleteLines, setPendingDeleteLines] = useState(new Set());
  const [isPendingAnyOperation, setIsPendingAnyOperation] = useState(false);
  const [isSavingTranspose, setIsSavingTranspose] = useState(false);
  const [isSavingWholeSong, setIsSavingWholeSong] = useState(false);
  const dispatch = useDispatch();
  const instrument = useSelector((state: any) => state.chords.currentInstrument);
  const transpose = useSelector((state: any) => state.chords.transposeBy?.[song.title] || 0);
  const chordFingerings = useSelector((state: any) => state.chords.chordFingerings);
  const isGoogleDriveConnected = useSelector((state: any) => state.songs.isGoogleDriveConnected);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Extract unique chords from lyrics
  const extractChords = (lyrics) => {
    const chordRegex = /\[(.*?)\]/g;
    const allChords = [];
    
    lyrics?.forEach((line: any) => {
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

  function transposeChord(chord, semitones) {
    // Handle slashed chords (e.g. A/C# -> A#/D)
    if (chord.includes('/')) {
      const [rootPart, bassPart] = chord.split('/');
      const transposedRoot = transposeChord(rootPart, semitones);
      const transposedBass = transposeChord(bassPart, semitones);
      return `${transposedRoot}/${transposedBass}`;
    }
    
    // Extract root and suffix (e.g. C#m7 -> C#, m7)
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    let [, root, suffix] = match;
    // Normalize flats to sharps
    if (FLAT_EQUIV[root]) root = FLAT_EQUIV[root];
    let idx = CHROMATIC.indexOf(root);
    if (idx === -1) return chord;
    let newIdx = (idx + semitones + 12) % 12;
    return CHROMATIC[newIdx] + suffix;
  }

  // Helper function to convert complex lyrics format to simple array format
  const convertLyricsToArray = (lyrics) => {
    if (!lyrics) return [];
    
    // If it's already an array of strings, return as-is
    if (Array.isArray(lyrics) && lyrics.length > 0 && typeof lyrics[0] === 'string') {
      return lyrics;
    }
    
    // If it's a string, split by newlines
    if (typeof lyrics === 'string') {
      return lyrics ? lyrics.split('\n') : [];
    }
    
    // If it's the complex nested format from tabs.js
    if (Array.isArray(lyrics) && lyrics.length > 0 && Array.isArray(lyrics[0])) {
      const converted = [];
      
      lyrics.forEach((verse, verseIndex) => {
        if (verseIndex > 0) {
          converted.push(''); // Add blank line between verses
        }
        
        verse.forEach((lineObj) => {
          if (lineObj && lineObj.text) {
            let line = lineObj.text;
            
            // Add chords inline if they exist
            if (lineObj.chords && lineObj.chords.length > 0) {
              // For now, just add the first chord at the beginning of the line
              // This is a simple conversion - could be made more sophisticated
              line = `[${lineObj.chords[0]}]${line}`;
            }
            
            converted.push(line);
          }
        });
      });
      
      return converted;
    }
    
    // Fallback: return empty array
    return [];
  };

  // Ensure lyrics is always an array
  const lyricsArray = convertLyricsToArray(song.lyrics);

  const chords = (song.chords || extractChords(lyricsArray)).map((chord: any) =>
    localTranspose !== 0 ? transposeChord(chord, localTranspose) : chord
  );

  const handleEditLine = (index: number) => {
    setEditingLineIndex(index);
    setIsAddingLine(false);
  };

  const handleInsertAfter = (afterIndex) => {
    // Block if there are pending operations
    if (isPendingAnyOperation || pendingDeleteLines.size > 0) {
      message.warning('Please wait for current operation to complete before inserting a new line.');
      return;
    }
    
    setIsAddingLine(true);
    // Set to the position where we want to insert (after the specified index)
    if (afterIndex === -1) {
      // Empty song case - insert at position 0
      setEditingLineIndex(0);
    } else {
      // Insert after the specified line
      setEditingLineIndex(afterIndex + 1);
    }
  };

  const handleSaveLine = async (newLine, index: number) => {
    const updatedLyrics = [...lyricsArray];
    
    if (isAddingLine) {
      // Set pending add state
      setIsPendingAnyOperation(true);
      
      // Check if we're inserting at a specific position or adding at the end
      const targetIndex = editingLineIndex !== null && editingLineIndex <= lyricsArray.length
        ? editingLineIndex // Insert at specific position
        : updatedLyrics.length; // Add at the end
      
      // Insert at target position
      updatedLyrics.splice(targetIndex, 0, newLine);
      
      setOptimisticLyrics(updatedLyrics);
      setPendingSaves(prev => new Set([...prev, targetIndex]));
      
      // Exit edit mode immediately for better UX
      setEditingLineIndex(null);
      setIsAddingLine(false);
      
      // Save the add operation
      onUpdateSong({
        ...song,
        lyrics: updatedLyrics
      }).then(() => {
        message.success('Line added successfully!');
        setOptimisticLyrics(null);
        setIsPendingAnyOperation(false);
        setPendingSaves(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetIndex);
          return newSet;
        });
        // Ensure we completely reset editing state
        setEditingLineIndex(null);
        setIsAddingLine(false);
      }).catch((error) => {
        console.error('Failed to add line:', error);
        message.error('Failed to add new line. Please try again.');
        // Revert optimistic update
        setOptimisticLyrics(null);
        setIsPendingAnyOperation(false);
        setPendingSaves(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetIndex);
          return newSet;
        });
        setIsAddingLine(true);
        setEditingLineIndex(null);
      });
    } else {
      // Set pending edit state
      setIsPendingAnyOperation(true);
      setPendingSaves(prev => new Set([...prev, index]));
      
      // Update existing line - optimistic update
      updatedLyrics[index] = newLine;
      setOptimisticLyrics(updatedLyrics);
      
      // Exit edit mode immediately for better UX
      setEditingLineIndex(null);
      
      // Save the edit operation
      onUpdateSong({
        ...song,
        lyrics: updatedLyrics
      }).then(() => {
        message.success('Line updated successfully!');
        setOptimisticLyrics(null);
        setIsPendingAnyOperation(false);
        setPendingSaves(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }).catch((error) => {
        console.error('Failed to update line:', error);
        message.error('Failed to update line. Please try again.');
        // Revert optimistic update
        setOptimisticLyrics(null);
        setIsPendingAnyOperation(false);
        setPendingSaves(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
        setEditingLineIndex(index);
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingLineIndex(null);
    setIsAddingLine(false);
  };

  // Handle deleting a line with optimistic updates
  const handleDeleteLine = async (index: number) => {
    // Block if there are pending operations
    if (isPendingAnyOperation || pendingDeleteLines.has(index)) {
      message.warning('Please wait for current operation to complete before deleting this line.');
      return;
    }

    // Set pending delete state
    setIsPendingAnyOperation(true);
    setPendingDeleteLines(prev => new Set([...prev, index]));

    const updatedLyrics = [...lyricsArray];
    updatedLyrics.splice(index, 1);
    
    // Optimistic update
    setOptimisticLyrics(updatedLyrics);

    try {
      await onUpdateSong({
        ...song,
        lyrics: updatedLyrics
      });
      
      message.success('Line deleted successfully!');
      setOptimisticLyrics(null);
      setIsPendingAnyOperation(false);
      setPendingDeleteLines(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    } catch (error: unknown) {
      console.error('Failed to delete line:', error);
      message.error('Failed to delete line. Please try again.');
      
      // Revert optimistic update
      setOptimisticLyrics(null);
      setIsPendingAnyOperation(false);
      setPendingDeleteLines(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // Handle drag end for reordering lines with optimistic updates
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Set pending reorder state
      setIsPendingAnyOperation(true);
      
      const oldIndex = lyricsArray.findIndex((_, index: number) => index.toString() === active.id);
      const newIndex = lyricsArray.findIndex((_, index: number) => index.toString() === over.id);
      
      // Optimistic update - immediately show the new order
      const newLyrics = arrayMove(lyricsArray, oldIndex, newIndex);
      setOptimisticLyrics(newLyrics);
      setPendingLineIndex(newIndex); // Track which line is pending
      
      // Save the reorder operation
      onUpdateSong({
        ...song,
        lyrics: newLyrics
      }).then(() => {
        message.success('Lines reordered successfully!');
        setOptimisticLyrics(null);
        setIsPendingAnyOperation(false);
        setPendingLineIndex(null);
      }).catch((error) => {
        console.error('Failed to reorder lines:', error);
        message.error('Failed to reorder lines. Please try again.');
        // Revert optimistic update
        setOptimisticLyrics(null);
        setIsPendingAnyOperation(false);
        setPendingLineIndex(null);
      });
    }
  };

  // Remove the old handleMoveLine function as it's replaced by drag and drop

  // Handle whole song editing
  const handleEditWholeSong = () => {
    setWholeSongText(lyricsArray.join('\n'));
    setIsEditingWholeSong(true);
  };

  const handleSaveWholeSong = async () => {
    setIsSavingWholeSong(true);
    try {
      const newLyrics = wholeSongText.split('\n').filter((line: any) => line.trim() !== '');
      await onUpdateSong({
        ...song,
        lyrics: newLyrics,
        chords: extractChords(newLyrics)
      });
      setIsEditingWholeSong(false);
      message.success('Song lyrics saved successfully!');
    } catch (error: unknown) {
      console.error('Failed to save whole song:', error);
      message.error('Failed to save song. Please try again.');
    } finally {
      setIsSavingWholeSong(false);
    }
  };

  // Helper function to check if error is authentication-related
  const isAuthError = (error) => {
    if (!error) return false;
    const message = error.message || error || '';
    const authErrorPatterns = [
      'User not signed in to Google Drive',
      'Expected OAuth 2 access token',
      'login cookie or other valid authentication credential', 
      'Invalid Credentials',
      'Authentication failed',
      'unauthorized_client',
      'invalid_token',
      'expired_token',
      'access_denied',
      'token_expired',
      'Request had invalid authentication credentials'
    ];
    return authErrorPatterns.some((pattern: any) => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  // Handle opening the popconfirm - start countdown
  const handleDeleteConfirm = () => {
    // This is called when user clicks the actual Delete button in the popconfirm
    handleDeleteSong();
  };

  // Handle actual song deletion
  const handleDeleteSong = async () => {
    try {
      await dispatch(deleteSong({
        artistName: artist.name,
        albumTitle: song.album?.title,
        songTitle: song.title,
        isGoogleDriveConnected
      })).unwrap();

      message.success('Song deleted successfully!');
      
      // Clear selected song to navigate away
      dispatch(clearSelectedSong());
      
    } catch (error: unknown) {
      console.error('Failed to delete song:', error);
      
      // Check if this is an authentication error
      if (isAuthError(error)) {
        dispatch(setGoogleDriveConnection(false));
        dispatch(setUserInfo(null));
        message.error('Your Google Drive session has expired. Please sign in again to delete songs.');
      } else {
        message.error(error.message || 'Failed to delete song. Please try again.');
      }
    }
  };

  const handleCancelWholeSong = () => {
    setIsEditingWholeSong(false);
    setWholeSongText('');
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
    const adjustedChordPositions = chordPositions.map((item, index: number) => {
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
          {adjustedChordPositions.map((item, idx: number) => (
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
  }, [song.title]);

  const handleTransposeUp = () => {
    setLocalTranspose((prev) => prev + 1);
    dispatch(transposeSongUp(song.title));
  };
  const handleTransposeDown = () => {
    setLocalTranspose((prev) => prev - 1);
    dispatch(transposeSongDown(song.title));
  };
  const handleSaveTranspose = async () => {
    setIsSavingTranspose(true);
    try {
      // Apply transposition to all lyrics inline
      const transposedLyrics = lyricsArray.map((line: any) => {
        const chordRegex = /\[([^\]]+)\]/g;
        return line.replace(chordRegex, (match, chord) => {
          const transposedChord = transposeChord(chord, localTranspose);
          return `[${transposedChord}]`;
        });
      });

      const updatedSong = { 
        ...song, 
        lyrics: transposedLyrics,
        chords: extractChords(transposedLyrics),
        chordFingerings: chordFingerings
      };
      
      await onUpdateSong(updatedSong);
      
      // Reset local transpose since it's now baked into the lyrics
      setLocalTranspose(0);

      // Show success message
      message.success('Transposed lyrics saved successfully!');
    } catch (error: unknown) {
      console.error('Failed to save transposed lyrics:', error);
      message.error('Failed to save transposed lyrics. Please try again.');
    } finally {
      setIsSavingTranspose(false);
    }
  };

  return (
    <div className="song-detail" style={{ width: '100%', minHeight: 'fit-content' }}>      
      {/* Chord section */}
      <div className="chords-section">
        <div className="chords-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
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
                disabled={localTranspose === 0 || isSavingTranspose}
              style={{ 
                marginLeft: '1em', 
                padding: '0.2em 0.8em', 
                  opacity: localTranspose !== 0 && editingEnabled && !isSavingTranspose ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em'
              }}
            >
              {isSavingTranspose && <Spin size="small" />}
              Save Transposed Lyrics
            </button>
          </div>
          <div className="instrument-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label htmlFor="instrument-select" style={{ marginRight: 0 }}>Instrument:</label>
            <select
              id="instrument-select"
              value={instrument}
              onChange={(e: any) => dispatch(setInstrument(e.target.value))}
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
          {chords.map((chord: any) => (
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
          {/* Song metadata */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{song.title}</h3>
                <i style={{ margin: 0 }}>{artist.name}</i>
                {song.album && song.album.title && (
                  <span style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>
                    • {song.album.title}
                  </span>
                )}
              </div>
            </div>
            
            {/* Edit buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
              {editingEnabled && !isEditingWholeSong && (
                <>
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
                    onMouseEnter={(e: any) => e.target.style.backgroundColor = '#3367d6'}
                    onMouseLeave={(e: any) => e.target.style.backgroundColor = '#4285f4'}
                  >
                    <FaEdit /> Edit Whole Song
                  </button>
                  <button 
                    className="delete-song-btn"
                    style={{ 
                      padding: '0.5em 1em', 
                      fontSize: '0.9em',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: '1px solid #c82333',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5em',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e: any) => e.target.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e: any) => e.target.style.backgroundColor = '#dc3545'}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Delete song?',
                        content: `Are you sure you want to delete "${song.title}" by ${artist?.name || 'Unknown Artist'}?`,
                        okText: 'Delete',
                        cancelText: 'Cancel',
                        onOk: () => handleDeleteConfirm()
                      });
                    }}
                  >
                    <FaTrash /> Delete Song
                  </button>
                </>
              )}
              {isEditingWholeSong && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="save-whole-song-btn"
                    onClick={handleSaveWholeSong}
                    disabled={isSavingWholeSong}
                    style={{ 
                      padding: '0.5em 1em', 
                      fontSize: '0.9em',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: '1px solid #218838',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5em'
                    }}
                  >
                    {isSavingWholeSong ? <Spin size="small" /> : <FaClipboard />}
                    Save
                  </button>
                  <button 
                    className="cancel-whole-song-btn"
                    onClick={handleCancelWholeSong}
                    style={{ 
                      padding: '0.5em 1em', 
                      fontSize: '0.9em',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: '1px solid #5a6268',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {isEditingWholeSong ? (
            <textarea
              value={wholeSongText}
              onChange={(e: any) => setWholeSongText(e.target.value)}
              style={{
                width: '100%',
                height: '60vh',
                fontFamily: 'monospace',
                fontSize: '14px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(optimisticLyrics || lyricsArray).map((_, index: number) => index.toString())}
                strategy={verticalListSortingStrategy}
              >
                {(optimisticLyrics || lyricsArray).map((line, index: number) => (
                  <SortableLyricLine
                    key={index}
                    id={index.toString()}
                    index={index}
                    line={line}
                    editingLineIndex={editingLineIndex}
                    editingEnabled={editingEnabled}
                    hoveredLineIndex={hoveredLineIndex}
                    setHoveredLineIndex={setHoveredLineIndex}
                    handleEditLine={handleEditLine}
                    handleInsertAfter={handleInsertAfter}
                    handleDeleteLine={handleDeleteLine}
                    handleSaveLine={handleSaveLine}
                    handleCancelEdit={handleCancelEdit}
                    renderLyricLine={renderLyricLine}
                    isThisLinePending={pendingLineIndex === index}
                    isDragDisabled={isPendingAnyOperation || pendingDeleteLines.size > 0}
                    isPendingDelete={pendingDeleteLines.has(index)}
                    isAddingLine={isAddingLine && editingLineIndex === index}
                    isPendingSave={pendingSaves.has(index)}
                  />
                ))}
                {isAddingLine && editingLineIndex === (optimisticLyrics || lyricsArray).length && (
                  <LyricLineEditor
                    line=""
                    onSave={(newLine) => handleSaveLine(newLine, (optimisticLyrics || lyricsArray).length)}
                    onCancel={handleCancelEdit}
                    isAdding
                  />
                )}
              </SortableContext>
            </DndContext>
          )}
          
          {editingEnabled && !isEditingWholeSong && (
            <div style={{ marginTop: '1rem' }}>
              <button 
                className="add-line-btn"
                onClick={() => handleInsertAfter((optimisticLyrics || lyricsArray).length - 1)}
                disabled={isPendingAnyOperation || pendingDeleteLines.size > 0}
                style={{
                  padding: '0.5em 1em',
                  fontSize: '0.9em',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: '1px solid #138496',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em'
                }}
              >
                <FaPlus /> Add Line
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongDetail;
