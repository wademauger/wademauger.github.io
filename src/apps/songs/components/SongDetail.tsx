import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import { FaPencilAlt, FaPlus, FaTrash, FaEdit, FaClipboard } from 'react-icons/fa';

import { convertLyrics } from '../../../convert-lyrics';import { FaPencilAlt, FaPlus, FaTrash, FaEdit, FaClipboard } from 'react-icons/fa';

import { useDispatch, useSelector } from 'react-redux';

import { setInstrument, transposeSongUp, transposeSongDown } from '../../../store/chordsSlice';import { convertLyrics } from '../../../convert-lyrics';import { FaPencilAlt, FaPlus, FaTrash, FaEdit, FaClipboard } from 'react-icons/fa';

import { deleteSong, clearSelectedSong, setGoogleDriveConnection, setUserInfo } from '../../../store/songsSlice';

import ChordChart from './ChordChart';import { useDispatch, useSelector } from 'react-redux';

import LyricLineEditor from './LyricLineEditor';

import AlbumArt from './AlbumArt';import { setInstrument, transposeSongUp, transposeSongDown } from '../../../store/chordsSlice';import { useDispatch, useSelector } from 'react-redux';import { FaPencilAlt, FaPlus, FaTrash, FaEdit, FaClipboard } from 'react-icons/fa';

import { Spin, App } from 'antd';

import type { RootState, Song, Artist } from '../../../types';import { deleteSong, clearSelectedSong, setGoogleDriveConnection, setUserInfo } from '../../../store/songsSlice';



interface SongDetailProps {import ChordChart from './ChordChart';import { setInstrument, transposeSongUp, transposeSongDown } from '../../../store/chordsSlice';

  song: Song;

  onPinChord: (chord: string) => void;import LyricLineEditor from './LyricLineEditor';

  onUpdateSong: (song: Song) => Promise<void>;

  artist: Artist;import AlbumArt from './AlbumArt';import { deleteSong, clearSelectedSong, setGoogleDriveConnection, setUserInfo } from '../../../store/songsSlice';import { useDispatch, useSelector } from 'react-redux';import { FaPencilAlt, FaPlus, FaTrash, FaEdit, FaClipboard } from 'react-icons/fa';import { FaPencilAlt, FaPlus, FaTrash, FaEdit, FaGripVertical, FaClipboard } from 'react-icons/fa';

  editingEnabled?: boolean;

}import { Spin, App } from 'antd';



const SongDetail: React.FC<SongDetailProps> = ({ import type { RootState, Song, Artist } from '../../../types';import ChordChart from './ChordChart';

  song, 

  onPinChord, 

  onUpdateSong, 

  artist, interface SongDetailProps {import LyricLineEditor from './LyricLineEditor';import { setInstrument, transposeSongUp, transposeSongDown } from '../../../store/chordsSlice';

  editingEnabled = true 

}) => {  song: Song;

  // Redux state

  const dispatch = useDispatch();  onPinChord: (chord: string) => void;import AlbumArt from './AlbumArt';

  const { currentInstrument, transposeBy } = useSelector((state: RootState) => state.chords);

  const { selectedSong, isGoogleDriveConnected, userInfo } = useSelector((state: RootState) => state.songs);  onUpdateSong: (song: Song) => Promise<void>;

  const { message } = App.useApp();

  artist: Artist;import { Spin, App } from 'antd';import { deleteSong, clearSelectedSong, setGoogleDriveConnection, setUserInfo } from '../../../store/songsSlice';import { useDispatch, useSelector } from 'react-redux';import { convertLyrics } from '../../../convert-lyrics';

  // Local state for UI interactions only

  const [localLyrics, setLocalLyrics] = useState<string[]>([]);  editingEnabled?: boolean;

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);}import type { RootState, Song, Artist } from '../../../types';

  const [isSaving, setIsSaving] = useState<boolean>(false);



  // Get transpose value for this song

  const currentTranspose = transposeBy[song.title] || 0;const SongDetail: React.FC<SongDetailProps> = ({ import ChordChart from './ChordChart';



  // Initialize local lyrics from song data  song, 

  useEffect(() => {

    if (song?.lyrics) {  onPinChord, interface SongDetailProps {

      const lyricsArray = Array.isArray(song.lyrics) ? song.lyrics : song.lyrics.split('\n');

      setLocalLyrics(lyricsArray);  onUpdateSong, 

      setHasChanges(false);

    }  artist,   song: Song;import LyricLineEditor from './LyricLineEditor';import { setInstrument, transposeSongUp, transposeSongDown } from '../../../store/chordsSlice';import { useDispatch, useSelector } from 'react-redux';

  }, [song]);

  editingEnabled = true 

  // Handle local lyric line updates

  const handleLyricLineUpdate = (index: number, newText: string) => {}) => {  onPinChord: (chord: string) => void;

    const updatedLyrics = [...localLyrics];

    updatedLyrics[index] = newText;  // Redux state

    setLocalLyrics(updatedLyrics);

    setHasChanges(true);  const dispatch = useDispatch();  onUpdateSong: (song: Song) => Promise<void>;import { Spin, App } from 'antd';

  };

  const { currentInstrument, transposeBy } = useSelector((state: RootState) => state.chords);

  // Save changes to Redux store

  const handleSaveChanges = async () => {  const { selectedSong, isGoogleDriveConnected, userInfo } = useSelector((state: RootState) => state.songs);  artist: Artist;

    if (!hasChanges || isSaving) return;

  const { message } = App.useApp();

    setIsSaving(true);

    try {  editingEnabled?: boolean;import type { RootState, Song, Artist } from '../../../types';import { deleteSong, clearSelectedSong, setGoogleDriveConnection, setUserInfo } from '../../../store/songsSlice';import { setInstrument, transposeSongUp, transposeSongDown } from '../../../store/chordsSlice';

      const updatedSongData = {

        ...song,  // Local state for UI interactions only

        lyrics: localLyrics

      };  const [localLyrics, setLocalLyrics] = useState<string[]>([]);}

      

      await onUpdateSong(updatedSongData);  const [hasChanges, setHasChanges] = useState<boolean>(false);

      setHasChanges(false);

      setIsEditing(false);  const [isEditing, setIsEditing] = useState<boolean>(false);

      message.success('Song lyrics updated successfully');

    } catch (error) {  const [isSaving, setIsSaving] = useState<boolean>(false);

      console.error('Failed to save song changes:', error);

      message.error('Failed to save changes. Please try again.');const SongDetail: React.FC<SongDetailProps> = ({ 

    } finally {

      setIsSaving(false);  // Get transpose value for this song

    }

  };  const currentTranspose = transposeBy[song.title] || 0;  song, interface SongDetailProps {import ChordChart from './ChordChart';import { deleteSong, clearSelectedSong, setGoogleDriveConnection, setUserInfo } from '../../../store/songsSlice';



  // Cancel editing and revert changes

  const handleCancelEditing = () => {

    const lyricsArray = Array.isArray(song.lyrics) ? song.lyrics : song.lyrics.split('\n');  // Initialize local lyrics from song data  onPinChord, 

    setLocalLyrics(lyricsArray);

    setHasChanges(false);  useEffect(() => {

    setIsEditing(false);

  };    if (song?.lyrics) {  onUpdateSong,   song: Song;



  // Add new line      const lyricsArray = Array.isArray(song.lyrics) ? song.lyrics : song.lyrics.split('\n');

  const handleAddLine = (index: number) => {

    const updatedLyrics = [...localLyrics];      setLocalLyrics(lyricsArray);  artist, 

    updatedLyrics.splice(index + 1, 0, '');

    setLocalLyrics(updatedLyrics);      setHasChanges(false);

    setHasChanges(true);

  };    }  editingEnabled = true   onPinChord: (chord: string) => void;import LyricLineEditor from './LyricLineEditor.tsx';import ChordChart from './ChordChart';



  // Delete line  }, [song]);

  const handleDeleteLine = (index: number) => {

    if (localLyrics.length <= 1) return; // Prevent deleting the last line}) => {

    const updatedLyrics = localLyrics.filter((_, i) => i !== index);

    setLocalLyrics(updatedLyrics);  // Handle local lyric line updates

    setHasChanges(true);

  };  const handleLyricLineUpdate = (index: number, newText: string) => {  const { message } = App.useApp();  onUpdateSong: (song: Song) => Promise<void>;



  // Convert lyrics using the conversion utility    const updatedLyrics = [...localLyrics];

  const handleConvertLyrics = () => {

    try {    updatedLyrics[index] = newText;  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

      const lyricsText = localLyrics.join('\n');

      const convertedLyrics = convertLyrics(lyricsText);    setLocalLyrics(updatedLyrics);

      const convertedLyricsArray = convertedLyrics.split('\n');

      setLocalLyrics(convertedLyricsArray);    setHasChanges(true);  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);  artist: Artist;import AlbumArt from './AlbumArt.tsx';import LyricLineEditor from './LyricLineEditor';

      setHasChanges(true);

      message.success('Lyrics converted successfully');  };

    } catch (error) {

      console.error('Failed to convert lyrics:', error);  const [localTranspose, setLocalTranspose] = useState<number>(0);

      message.error('Failed to convert lyrics. Please check the format.');

    }  // Save changes to Redux store

  };

  const handleSaveChanges = async () => {  const [isEditingWholeSong, setIsEditingWholeSong] = useState<boolean>(false);  editingEnabled?: boolean;

  // Copy song content to clipboard

  const handleCopyToClipboard = async () => {    if (!hasChanges || isSaving) return;

    try {

      const songContent = `${song.title} - ${artist.name}\n\n${localLyrics.join('\n')}`;  const [wholeSongText, setWholeSongText] = useState<string>('');

      await navigator.clipboard.writeText(songContent);

      message.success('Song copied to clipboard');    setIsSaving(true);

    } catch (error) {

      console.error('Failed to copy to clipboard:', error);    try {  const [isSavingTranspose, setIsSavingTranspose] = useState<boolean>(false);}import { Spin, App } from 'antd';import AlbumArt from './AlbumArt';

      message.error('Failed to copy to clipboard');

    }      const updatedSongData = {

  };

        ...song,  const [isSavingWholeSong, setIsSavingWholeSong] = useState<boolean>(false);

  // Generate chord chart data from lyrics

  const extractChordsFromLyrics = () => {        lyrics: localLyrics

    const chords = new Set<string>();

    localLyrics.forEach(line => {      };  

      const chordMatches = line.match(/\[([^\]]+)\]/g);

      if (chordMatches) {      

        chordMatches.forEach(match => {

          const chord = match.replace(/[\[\]]/g, '');      await onUpdateSong(updatedSongData);  const dispatch = useDispatch();

          if (chord && chord.trim()) {

            chords.add(chord.trim());      setHasChanges(false);

          }

        });      setIsEditing(false);  const instrument = useSelector((state: RootState) => state.chords.currentInstrument);const SongDetail: React.FC<SongDetailProps> = ({ song, onPinChord, onUpdateSong, artist, editingEnabled = true }) => {import { Song, Artist, RootState } from '../../../types';import { Spin, App } from 'antd';

      }

    });      message.success('Song lyrics updated successfully');

    return Array.from(chords);

  };    } catch (error) {  const transpose = useSelector((state: RootState) => state.chords.transposeBy?.[song.title] || 0);



  const chords = extractChordsFromLyrics();      console.error('Failed to save song changes:', error);



  return (      message.error('Failed to save changes. Please try again.');  const chordFingerings = useSelector((state: RootState) => state.chords.chordFingerings);  const { message } = App.useApp();

    <div className="song-detail">

      {/* Song Header */}    } finally {

      <div className="song-header" style={{ 

        display: 'flex',       setIsSaving(false);  const isGoogleDriveConnected = useSelector((state: RootState) => state.songs.isGoogleDriveConnected);

        justifyContent: 'space-between', 

        alignItems: 'center',     }

        marginBottom: '1rem',

        padding: '1rem',  };  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);import { Song, Artist, RootState } from '../../../types';

        backgroundColor: '#f8f9fa',

        borderRadius: '8px'

      }}>

        <div>  // Cancel editing and revert changes  // Extract unique chords from lyrics

          <h2 style={{ margin: 0 }}>{song.title}</h2>

          <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>  const handleCancelEditing = () => {

            {artist.name}

          </p>    const lyricsArray = Array.isArray(song.lyrics) ? song.lyrics : song.lyrics.split('\n');  const extractChords = (lyrics: string[]): string[] => {  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

        </div>

            setLocalLyrics(lyricsArray);

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>

          {/* Transpose Controls */}    setHasChanges(false);    const chordRegex = /\[(.*?)\]/g;

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>

            <button    setIsEditing(false);

              onClick={() => dispatch(transposeSongDown(song.title))}

              style={{  };    const allChords: string[] = [];  const [localTranspose, setLocalTranspose] = useState<number>(0);interface SongDetailProps {import {

                padding: '4px 8px',

                fontSize: '12px',

                border: '1px solid #ddd',

                borderRadius: '4px',  // Add new line    

                backgroundColor: 'white',

                cursor: 'pointer'  const handleAddLine = (index: number) => {

              }}

            >    const updatedLyrics = [...localLyrics];    lyrics?.forEach(line => {  const [isEditingWholeSong, setIsEditingWholeSong] = useState<boolean>(false);

              ♭

            </button>    updatedLyrics.splice(index + 1, 0, '');

            <span style={{ fontSize: '12px', color: '#666', minWidth: '20px', textAlign: 'center' }}>

              {currentTranspose > 0 ? `+${currentTranspose}` : currentTranspose}    setLocalLyrics(updatedLyrics);      let match;

            </span>

            <button    setHasChanges(true);

              onClick={() => dispatch(transposeSongUp(song.title))}

              style={{  };      while ((match = chordRegex.exec(line)) !== null) {  const [wholeSongText, setWholeSongText] = useState<string>('');  song: Song;  DndContext,

                padding: '4px 8px',

                fontSize: '12px',

                border: '1px solid #ddd',

                borderRadius: '4px',  // Delete line        if (!allChords.includes(match[1])) {

                backgroundColor: 'white',

                cursor: 'pointer'  const handleDeleteLine = (index: number) => {

              }}

            >    if (localLyrics.length <= 1) return; // Prevent deleting the last line          allChords.push(match[1]);  const [isSavingTranspose, setIsSavingTranspose] = useState<boolean>(false);

              ♯

            </button>    const updatedLyrics = localLyrics.filter((_, i) => i !== index);

          </div>

    setLocalLyrics(updatedLyrics);        }

          {/* Instrument Selector */}

          <select    setHasChanges(true);

            value={currentInstrument}

            onChange={(e) => dispatch(setInstrument(e.target.value as any))}  };      }  const [isSavingWholeSong, setIsSavingWholeSong] = useState<boolean>(false);  onPinChord: (chord: string) => void;  closestCenter,

            style={{

              padding: '4px 8px',

              fontSize: '12px',

              border: '1px solid #ddd',  // Convert lyrics using the conversion utility    });

              borderRadius: '4px',

              backgroundColor: 'white'  const handleConvertLyrics = () => {

            }}

          >    try {      

            <option value="ukulele">Ukulele</option>

            <option value="guitar">Guitar</option>      const lyricsText = localLyrics.join('\n');

            <option value="piano">Piano</option>

          </select>      const convertedLyrics = convertLyrics(lyricsText);    return allChords;



          {/* Action Buttons */}      const convertedLyricsArray = convertedLyrics.split('\n');

          <button

            onClick={handleCopyToClipboard}      setLocalLyrics(convertedLyricsArray);  };  const dispatch = useDispatch();  onUpdateSong: (song: Song) => Promise<void>;  KeyboardSensor,

            style={{

              padding: '4px 8px',      setHasChanges(true);

              fontSize: '12px',

              border: '1px solid #ddd',      message.success('Lyrics converted successfully');

              borderRadius: '4px',

              backgroundColor: 'white',    } catch (error) {

              cursor: 'pointer',

              display: 'flex',      console.error('Failed to convert lyrics:', error);  // Helper to shift a chord name by a number of semitones  const instrument = useSelector((state: RootState) => state.chords.currentInstrument);

              alignItems: 'center',

              gap: '4px'      message.error('Failed to convert lyrics. Please check the format.');

            }}

            title="Copy to Clipboard"    }  const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

          >

            <FaClipboard size={12} />  };

            Copy

          </button>  const FLAT_EQUIV: { [key: string]: string } = {   const transpose = useSelector((state: RootState) => state.chords.transposeBy?.[song.title] || 0);  artist: Artist;  PointerSensor,



          {editingEnabled && isGoogleDriveConnected && (  // Copy song content to clipboard

            <>

              {isEditing ? (  const handleCopyToClipboard = async () => {    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' 

                <>

                  <button    try {

                    onClick={handleSaveChanges}

                    disabled={!hasChanges || isSaving}      const songContent = `${song.title} - ${artist.name}\n\n${localLyrics.join('\n')}`;  };  const chordFingerings = useSelector((state: RootState) => state.chords.chordFingerings);

                    style={{

                      padding: '4px 12px',      await navigator.clipboard.writeText(songContent);

                      fontSize: '12px',

                      border: 'none',      message.success('Song copied to clipboard');  

                      borderRadius: '4px',

                      backgroundColor: hasChanges ? '#52c41a' : '#d9d9d9',    } catch (error) {

                      color: 'white',

                      cursor: hasChanges ? 'pointer' : 'not-allowed',      console.error('Failed to copy to clipboard:', error);  const transposeChord = (chord: string, semitones: number): string => {  const isGoogleDriveConnected = useSelector((state: RootState) => state.songs.isGoogleDriveConnected);  editingEnabled?: boolean;  useSensor,

                      display: 'flex',

                      alignItems: 'center',      message.error('Failed to copy to clipboard');

                      gap: '4px'

                    }}    }    // Handle slashed chords

                  >

                    {isSaving ? <Spin size="small" /> : 'Save'}  };

                  </button>

                  <button    if (chord.includes('/')) {

                    onClick={handleCancelEditing}

                    style={{  // Generate chord chart data from lyrics

                      padding: '4px 12px',

                      fontSize: '12px',  const extractChordsFromLyrics = () => {      const [rootPart, bassPart] = chord.split('/');

                      border: '1px solid #d9d9d9',

                      borderRadius: '4px',    const chords = new Set<string>();

                      backgroundColor: 'white',

                      cursor: 'pointer'    localLyrics.forEach(line => {      const transposedRoot = transposeChord(rootPart, semitones);  // Extract unique chords from lyrics}  useSensors,

                    }}

                  >      const chordMatches = line.match(/\[([^\]]+)\]/g);

                    Cancel

                  </button>      if (chordMatches) {      const transposedBass = transposeChord(bassPart, semitones);

                </>

              ) : (        chordMatches.forEach(match => {

                <button

                  onClick={() => setIsEditing(true)}          const chord = match.replace(/[\[\]]/g, '');      return `${transposedRoot}/${transposedBass}`;  const extractChords = (lyrics: string[]): string[] => {

                  style={{

                    padding: '4px 12px',          if (chord && chord.trim()) {

                    fontSize: '12px',

                    border: '1px solid #1890ff',            chords.add(chord.trim());    }

                    borderRadius: '4px',

                    backgroundColor: '#1890ff',          }

                    color: 'white',

                    cursor: 'pointer',        });        const chordRegex = /\[(.*?)\]/g;  DragEndEvent,

                    display: 'flex',

                    alignItems: 'center',      }

                    gap: '4px'

                  }}    });    // Extract root and suffix

                >

                  <FaEdit size={12} />    return Array.from(chords);

                  Edit

                </button>  };    const match = chord.match(/^([A-G][b#]?)(.*)$/);    const allChords: string[] = [];

              )}

            </>

          )}

        </div>  const chords = extractChordsFromLyrics();    if (!match) return chord;

      </div>



      {/* Chord Chart Section */}

      {chords.length > 0 && (  return (    let [_, root, suffix] = match;    const SongDetail: React.FC<SongDetailProps> = ({ song, onPinChord, onUpdateSong, artist, editingEnabled = true }) => {} from '@dnd-kit/core';

        <div className="chord-chart-section" style={{ marginBottom: '2rem' }}>

          <h3 style={{ margin: '0 0 1rem 0' }}>Chords Used</h3>    <div className="song-detail">

          <ChordChart 

            chords={chords}       {/* Song Header */}    

            onPinChord={onPinChord}

            instrument={currentInstrument}      <div className="song-header" style={{ 

            transpose={currentTranspose}

          />        display: 'flex',     // Normalize flats to sharps    lyrics?.forEach(line => {

        </div>

      )}        justifyContent: 'space-between', 



      {/* Lyrics Section */}        alignItems: 'center',     if (FLAT_EQUIV[root]) root = FLAT_EQUIV[root];

      <div className="lyrics-section">

        <div style={{         marginBottom: '1rem',

          display: 'flex', 

          justifyContent: 'space-between',         padding: '1rem',          let match;  const { message, modal } = App.useApp();import {

          alignItems: 'center', 

          marginBottom: '1rem'         backgroundColor: '#f8f9fa',

        }}>

          <h3 style={{ margin: 0 }}>Lyrics</h3>        borderRadius: '8px'    let idx = CHROMATIC.indexOf(root);

          {isEditing && (

            <div style={{ display: 'flex', gap: '0.5rem' }}>      }}>

              <button

                onClick={handleConvertLyrics}        <div>    if (idx === -1) return chord;      while ((match = chordRegex.exec(line)) !== null) {

                style={{

                  padding: '4px 12px',          <h2 style={{ margin: 0 }}>{song.title}</h2>

                  fontSize: '12px',

                  border: '1px solid #722ed1',          <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>    

                  borderRadius: '4px',

                  backgroundColor: '#722ed1',            {artist.name}

                  color: 'white',

                  cursor: 'pointer'          </p>    let newIdx = (idx + semitones + 12) % 12;        if (!allChords.includes(match[1])) {  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);  arrayMove,

                }}

              >        </div>

                Convert Lyrics

              </button>            return CHROMATIC[newIdx] + suffix;

            </div>

          )}        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>

        </div>

          {/* Transpose Controls */}  };          allChords.push(match[1]);

        <div className="lyrics-content" style={{

          backgroundColor: 'white',          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>

          border: '1px solid #e8e8e8',

          borderRadius: '8px',            <button

          padding: '1rem'

        }}>              onClick={() => dispatch(transposeSongDown(song.title))}

          {localLyrics.map((line, index) => (

            <LyricLineEditor              style={{  // Convert lyrics to simple string array format        }  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);  SortableContext,

              key={index}

              line={line}                padding: '4px 8px',

              index={index}

              isEditing={isEditing}                fontSize: '12px',  const convertLyricsToArray = (lyrics: any): string[] => {

              onUpdate={handleLyricLineUpdate}

              onAddLine={() => handleAddLine(index)}                border: '1px solid #ddd',

              onDeleteLine={() => handleDeleteLine(index)}

              canDelete={localLyrics.length > 1}                borderRadius: '4px',    if (!lyrics) return [];      }

              currentInstrument={currentInstrument}

              transpose={currentTranspose}                backgroundColor: 'white',

              onPinChord={onPinChord}

            />                cursor: 'pointer'    

          ))}

                        }}

          {isEditing && (

            <div style={{ marginTop: '1rem' }}>            >    if (Array.isArray(lyrics) && lyrics.length > 0 && typeof lyrics[0] === 'string') {    });  const [localTranspose, setLocalTranspose] = useState<number>(0);  sortableKeyboardCoordinates,

              <button

                onClick={() => handleAddLine(localLyrics.length - 1)}              ♭

                style={{

                  padding: '8px 16px',            </button>      return lyrics;

                  fontSize: '14px',

                  border: '1px dashed #d9d9d9',            <span style={{ fontSize: '12px', color: '#666', minWidth: '20px', textAlign: 'center' }}>

                  borderRadius: '4px',

                  backgroundColor: 'transparent',              {currentTranspose > 0 ? `+${currentTranspose}` : currentTranspose}    }    

                  cursor: 'pointer',

                  width: '100%',            </span>

                  display: 'flex',

                  alignItems: 'center',            <button    

                  justifyContent: 'center',

                  gap: '8px'              onClick={() => dispatch(transposeSongUp(song.title))}

                }}

              >              style={{    if (typeof lyrics === 'string') {    return allChords;  const [isEditingWholeSong, setIsEditingWholeSong] = useState<boolean>(false);  verticalListSortingStrategy,

                <FaPlus size={12} />

                Add Line                padding: '4px 8px',

              </button>

            </div>                fontSize: '12px',      return lyrics ? lyrics.split('\n') : [];

          )}

        </div>                border: '1px solid #ddd',

      </div>

                borderRadius: '4px',    }  };

      {/* Changes indicator */}

      {hasChanges && (                backgroundColor: 'white',

        <div style={{

          position: 'fixed',                cursor: 'pointer'    

          bottom: '20px',

          right: '20px',              }}

          backgroundColor: '#ffa940',

          color: 'white',            >    return [];  const [wholeSongText, setWholeSongText] = useState<string>('');} from '@dnd-kit/sortable';

          padding: '8px 16px',

          borderRadius: '4px',              ♯

          fontSize: '14px',

          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'            </button>  };

        }}>

          Unsaved changes          </div>

        </div>

      )}  // Helper to shift a chord name by a number of semitones

    </div>

  );          {/* Instrument Selector */}

};

          <select  const lyricsArray = convertLyricsToArray(song.lyrics);

export default SongDetail;
            value={currentInstrument}

            onChange={(e) => dispatch(setInstrument(e.target.value as any))}  const chords = (song.chords || extractChords(lyricsArray)).map((chord: string) =>  const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];  const [isSavingTranspose, setIsSavingTranspose] = useState<boolean>(false);import {

            style={{

              padding: '4px 8px',    localTranspose !== 0 ? transposeChord(chord, localTranspose) : chord

              fontSize: '12px',

              border: '1px solid #ddd',  );  const FLAT_EQUIV: { [key: string]: string } = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

              borderRadius: '4px',

              backgroundColor: 'white'

            }}

          >  const handleEditLine = (index: number) => {    const [isSavingWholeSong, setIsSavingWholeSong] = useState<boolean>(false);  useSortable,

            <option value="ukulele">Ukulele</option>

            <option value="guitar">Guitar</option>    setEditingLineIndex(index);

            <option value="piano">Piano</option>

          </select>  };  const transposeChord = (chord: string, semitones: number): string => {



          {/* Action Buttons */}

          <button

            onClick={handleCopyToClipboard}  const handleSaveLine = async (newLine: string, index: number) => {    // Handle slashed chords (e.g. A/C# -> A#/D)  const [isDeletingSong, setIsDeletingSong] = useState<boolean>(false);} from '@dnd-kit/sortable';

            style={{

              padding: '4px 8px',    const updatedLyrics = [...lyricsArray];

              fontSize: '12px',

              border: '1px solid #ddd',    updatedLyrics[index] = newLine;    if (chord.includes('/')) {

              borderRadius: '4px',

              backgroundColor: 'white',    

              cursor: 'pointer',

              display: 'flex',    try {      const [rootPart, bassPart] = chord.split('/');  import { CSS } from '@dnd-kit/utilities';

              alignItems: 'center',

              gap: '4px'      await onUpdateSong({

            }}

            title="Copy to Clipboard"        ...song,      const transposedRoot = transposeChord(rootPart, semitones);

          >

            <FaClipboard size={12} />        lyrics: updatedLyrics

            Copy

          </button>      });      const transposedBass = transposeChord(bassPart, semitones);  const dispatch = useDispatch();



          {editingEnabled && isGoogleDriveConnected && (      message.success('Line updated successfully!');

            <>

              {isEditing ? (      setEditingLineIndex(null);      return `${transposedRoot}/${transposedBass}`;

                <>

                  <button    } catch (error) {

                    onClick={handleSaveChanges}

                    disabled={!hasChanges || isSaving}      console.error('Failed to update line:', error);    }  const instrument = useSelector((state: RootState) => state.chords.currentInstrument);// Sortable line component for drag and drop

                    style={{

                      padding: '4px 12px',      message.error('Failed to update line. Please try again.');

                      fontSize: '12px',

                      border: 'none',    }    

                      borderRadius: '4px',

                      backgroundColor: hasChanges ? '#52c41a' : '#d9d9d9',  };

                      color: 'white',

                      cursor: hasChanges ? 'pointer' : 'not-allowed',    // Extract root and suffix (e.g. C#m7 -> C#, m7)  const transpose = useSelector((state: RootState) => state.chords.transposeBy?.[song.title] || 0);interface SortableLyricLineProps {

                      display: 'flex',

                      alignItems: 'center',  const handleCancelEdit = () => {

                      gap: '4px'

                    }}    setEditingLineIndex(null);    const match = chord.match(/^([A-G][b#]?)(.*)$/);

                  >

                    {isSaving ? <Spin size="small" /> : 'Save'}  };

                  </button>

                  <button    if (!match) return chord;  const chordFingerings = useSelector((state: RootState) => state.chords.chordFingerings);  line: string;

                    onClick={handleCancelEditing}

                    style={{  const handleDeleteLine = async (index: number) => {

                      padding: '4px 12px',

                      fontSize: '12px',    const updatedLyrics = [...lyricsArray];    let [_, root, suffix] = match;

                      border: '1px solid #d9d9d9',

                      borderRadius: '4px',    updatedLyrics.splice(index, 1);

                      backgroundColor: 'white',

                      cursor: 'pointer'        // Normalize flats to sharps  const isGoogleDriveConnected = useSelector((state: RootState) => state.songs.isGoogleDriveConnected);  index: number;

                    }}

                  >    try {

                    Cancel

                  </button>      await onUpdateSong({    if (FLAT_EQUIV[root]) root = FLAT_EQUIV[root];

                </>

              ) : (        ...song,

                <button

                  onClick={() => setIsEditing(true)}        lyrics: updatedLyrics    let idx = CHROMATIC.indexOf(root);  id: string;

                  style={{

                    padding: '4px 12px',      });

                    fontSize: '12px',

                    border: '1px solid #1890ff',      message.success('Line deleted successfully!');    if (idx === -1) return chord;

                    borderRadius: '4px',

                    backgroundColor: '#1890ff',    } catch (error) {

                    color: 'white',

                    cursor: 'pointer',      console.error('Failed to delete line:', error);    let newIdx = (idx + semitones + 12) % 12;  // Extract unique chords from lyrics  editingLineIndex: number | null;

                    display: 'flex',

                    alignItems: 'center',      message.error('Failed to delete line. Please try again.');

                    gap: '4px'

                  }}    }    return CHROMATIC[newIdx] + suffix;

                >

                  <FaEdit size={12} />  };

                  Edit

                </button>  };  const extractChords = (lyrics: string[]): string[] => {  editingEnabled: boolean;

              )}

            </>  const handleAddLine = async (newLine: string) => {

          )}

        </div>    const updatedLyrics = [...lyricsArray, newLine];

      </div>

    

      {/* Chord Chart Section */}

      {chords.length > 0 && (    try {  // Helper function to convert complex lyrics format to simple array format    const chordRegex = /\[(.*?)\]/g;  hoveredLineIndex: number | null;

        <div className="chord-chart-section" style={{ marginBottom: '2rem' }}>

          <h3 style={{ margin: '0 0 1rem 0' }}>Chords Used</h3>      await onUpdateSong({

          <ChordChart 

            chords={chords}         ...song,  const convertLyricsToArray = (lyrics: any): string[] => {

            onPinChord={onPinChord}

            instrument={currentInstrument}        lyrics: updatedLyrics

            transpose={currentTranspose}

          />      });    if (!lyrics) return [];    const allChords: string[] = [];  setHoveredLineIndex: (index: number | null) => void;

        </div>

      )}      message.success('Line added successfully!');



      {/* Lyrics Section */}    } catch (error) {    

      <div className="lyrics-section">

        <div style={{       console.error('Failed to add line:', error);

          display: 'flex', 

          justifyContent: 'space-between',       message.error('Failed to add line. Please try again.');    // If it's already an array of strings, return as-is      handleEditLine: (index: number) => void;

          alignItems: 'center', 

          marginBottom: '1rem'     }

        }}>

          <h3 style={{ margin: 0 }}>Lyrics</h3>  };    if (Array.isArray(lyrics) && lyrics.length > 0 && typeof lyrics[0] === 'string') {

          {isEditing && (

            <div style={{ display: 'flex', gap: '0.5rem' }}>

              <button

                onClick={handleConvertLyrics}  const handleEditWholeSong = () => {      return lyrics;    lyrics?.forEach(line => {  handleInsertAfter: (index: number) => void;

                style={{

                  padding: '4px 12px',    setWholeSongText(lyricsArray.join('\n'));

                  fontSize: '12px',

                  border: '1px solid #722ed1',    setIsEditingWholeSong(true);    }

                  borderRadius: '4px',

                  backgroundColor: '#722ed1',  };

                  color: 'white',

                  cursor: 'pointer'          let match;  handleDeleteLine: (index: number) => void;

                }}

              >  const handleSaveWholeSong = async () => {

                Convert Lyrics

              </button>    setIsSavingWholeSong(true);    // If it's a string, split by newlines

            </div>

          )}    try {

        </div>

      const newLyrics = wholeSongText.split('\n');    if (typeof lyrics === 'string') {      while ((match = chordRegex.exec(line)) !== null) {  handleSaveLine: (newLine: string, index: number) => void;

        <div className="lyrics-content" style={{

          backgroundColor: 'white',      await onUpdateSong({

          border: '1px solid #e8e8e8',

          borderRadius: '8px',        ...song,      return lyrics ? lyrics.split('\n') : [];

          padding: '1rem'

        }}>        lyrics: newLyrics,

          {localLyrics.map((line, index) => (

            <LyricLineEditor        chords: extractChords(newLyrics)    }        if (!allChords.includes(match[1])) {  handleCancelEdit: () => void;

              key={index}

              line={line}      });

              index={index}

              isEditing={isEditing}      setIsEditingWholeSong(false);    

              onUpdate={handleLyricLineUpdate}

              onAddLine={() => handleAddLine(index)}      message.success('Song lyrics saved successfully!');

              onDeleteLine={() => handleDeleteLine(index)}

              canDelete={localLyrics.length > 1}    } catch (error) {    // If it's the complex nested format from tabs.js          allChords.push(match[1]);  renderLyricLine: (line: string) => JSX.Element;

              currentInstrument={currentInstrument}

              transpose={currentTranspose}      console.error('Failed to save whole song:', error);

              onPinChord={onPinChord}

            />      message.error('Failed to save song. Please try again.');    if (Array.isArray(lyrics) && lyrics.length > 0 && Array.isArray(lyrics[0])) {

          ))}

              } finally {

          {isEditing && (

            <div style={{ marginTop: '1rem' }}>      setIsSavingWholeSong(false);      const converted: string[] = [];        }  isThisLinePending?: boolean;

              <button

                onClick={() => handleAddLine(localLyrics.length - 1)}    }

                style={{

                  padding: '8px 16px',  };      

                  fontSize: '14px',

                  border: '1px dashed #d9d9d9',

                  borderRadius: '4px',

                  backgroundColor: 'transparent',  const handleCancelWholeSong = () => {      lyrics.forEach((verse: any, verseIndex: number) => {      }  isDragDisabled?: boolean;

                  cursor: 'pointer',

                  width: '100%',    setIsEditingWholeSong(false);

                  display: 'flex',

                  alignItems: 'center',    setWholeSongText('');        if (verseIndex > 0) {

                  justifyContent: 'center',

                  gap: '8px'  };

                }}

              >          converted.push(''); // Add blank line between verses    });  isPendingDelete?: boolean;

                <FaPlus size={12} />

                Add Line  const isAuthError = (error: any): boolean => {

              </button>

            </div>    if (!error) return false;        }

          )}

        </div>    const message = error.message || error || '';

      </div>

    const authErrorPatterns = [              isAddingLine?: boolean;

      {/* Changes indicator */}

      {hasChanges && (      'User not signed in to Google Drive',

        <div style={{

          position: 'fixed',      'Expected OAuth 2 access token',        verse.forEach((lineObj: any) => {

          bottom: '20px',

          right: '20px',      'Invalid Credentials',

          backgroundColor: '#ffa940',

          color: 'white',      'Authentication failed'          if (lineObj && lineObj.text) {    return allChords;  isPendingSave?: boolean;

          padding: '8px 16px',

          borderRadius: '4px',    ];

          fontSize: '14px',

          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'    return authErrorPatterns.some(pattern =>             let line = lineObj.text;

        }}>

          Unsaved changes      message.toLowerCase().includes(pattern.toLowerCase())

        </div>

      )}    );              };}

    </div>

  );  };

};

            // Add chords inline if they exist

export default SongDetail;
  const handleDeleteSong = async () => {

    try {            if (lineObj.chords && lineObj.chords.length > 0) {

      await dispatch(deleteSong({

        artistName: artist.name,              // For now, just add the first chord at the beginning of the line

        albumTitle: song.album?.title,

        songTitle: song.title,              line = `[${lineObj.chords[0]}]${line}`;  // Helper to shift a chord name by a number of semitonesconst SortableLyricLine: React.FC<SortableLyricLineProps> = ({ 

        isGoogleDriveConnected

      })).unwrap();            }



      message.success('Song deleted successfully!');              const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];  line, 

      dispatch(clearSelectedSong());

                  converted.push(line);

    } catch (error: any) {

      console.error('Failed to delete song:', error);          }  const FLAT_EQUIV: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };  index, 

      

      if (isAuthError(error)) {        });

        dispatch(setGoogleDriveConnection(false));

        dispatch(setUserInfo(null));      });    id, 

        message.error('Your Google Drive session has expired. Please sign in again to delete songs.');

      } else {      

        message.error(error.message || 'Failed to delete song. Please try again.');

      }      return converted;  function transposeChord(chord: string, semitones: number): string {  editingLineIndex, 

    }

  };    }



  const renderLyricLine = (line: string, index: number) => {        // Handle slashed chords (e.g. A/C# -> A#/D)  editingEnabled, 

    const chordRegex = /\[(.*?)\]/g;

    const chordPositions: Array<{ chord: string; position: number; length: number }> = [];    // Fallback: return empty array

    let plainText = line;

    let match;    return [];    if (chord.includes('/')) {  hoveredLineIndex,

    

    while ((match = chordRegex.exec(line)) !== null) {  };

      chordPositions.push({

        chord: match[1],      const [rootPart, bassPart] = chord.split('/');  setHoveredLineIndex,

        position: match.index,

        length: match[0].length  // Ensure lyrics is always an array

      });

    }  const lyricsArray = convertLyricsToArray(song.lyrics);      const transposedRoot = transposeChord(rootPart, semitones);  handleEditLine,

    

    plainText = plainText.replace(/\[(.*?)\]/g, '');

    

    const adjustedChordPositions = chordPositions.map((item, idx) => {  const chords = (song.chords || extractChords(lyricsArray)).map((chord: string) =>      const transposedBass = transposeChord(bassPart, semitones);  handleInsertAfter,

      let adjustment = 0;

      for (let i = 0; i < idx; i++) {    localTranspose !== 0 ? transposeChord(chord, localTranspose) : chord

        adjustment += chordPositions[i].length;

      }  );      return `${transposedRoot}/${transposedBass}`;  handleDeleteLine,

      const transposedChord = localTranspose !== 0 ? transposeChord(item.chord, localTranspose) : item.chord;

      return {

        ...item,

        chord: transposedChord,  const handleEditLine = (index: number) => {    }  handleSaveLine,

        position: item.position - adjustment

      };    setEditingLineIndex(index);

    });

      };      handleCancelEdit,

    return (

      <div 

        className="lyric-line"

        onMouseEnter={() => setHoveredLineIndex(index)}  const handleSaveLine = async (newLine: string, index: number) => {    // Extract root and suffix (e.g. C#m7 -> C#, m7)  renderLyricLine,

        onMouseLeave={() => setHoveredLineIndex(null)}

        style={{ margin: '5px 0', position: 'relative' }}    const updatedLyrics = [...lyricsArray];

      >

        {editingLineIndex === index && editingEnabled ? (    updatedLyrics[index] = newLine;    const match = chord.match(/^([A-G][b#]?)(.*)$/);  isThisLinePending = false,

          <LyricLineEditor

            line={line}    

            onSave={(newLine) => handleSaveLine(newLine, index)}

            onCancel={handleCancelEdit}    try {    if (!match) return chord;  isDragDisabled = false,

          />

        ) : (      await onUpdateSong({

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            <div className="lyric-content" style={{ flex: 1 }}>        ...song,    let [_, root, suffix] = match;  isPendingDelete = false,

              <div className="lyric-line-with-chords">

                <div className="chord-labels">        lyrics: updatedLyrics

                  {adjustedChordPositions.map((item, idx) => (

                    <span       });    // Normalize flats to sharps  isAddingLine = false,

                      key={`chord-${idx}`} 

                      className="chord-label"      message.success('Line updated successfully!');

                      style={{ 

                        position: 'absolute',      setEditingLineIndex(null);    if (FLAT_EQUIV[root]) root = FLAT_EQUIV[root];  isPendingSave = false

                        left: `${item.position}ch`,

                        top: '-20px',    } catch (error) {

                        cursor: 'pointer',

                        color: '#1890ff',      console.error('Failed to update line:', error);    let idx = CHROMATIC.indexOf(root);}) => {

                        fontWeight: 'bold',

                        fontSize: '12px'      message.error('Failed to update line. Please try again.');

                      }}

                      onClick={() => onPinChord(item.chord)}    }    if (idx === -1) return chord;  const {

                    >

                      {item.chord}  };

                    </span>

                  ))}    let newIdx = (idx + semitones + 12) % 12;    attributes,

                </div>

                <div className="lyric-text-only" style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>  const handleCancelEdit = () => {

                  {plainText}

                </div>    setEditingLineIndex(null);    return CHROMATIC[newIdx] + suffix;    listeners,

              </div>

            </div>  };

            {hoveredLineIndex === index && editingEnabled && (

              <div className="lyric-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>  }    setNodeRef,

                <button 

                  onClick={() => handleEditLine(index)}  // Handle deleting a line

                  style={{

                    padding: '4px 6px',  const handleDeleteLine = async (index: number) => {    transform,

                    border: '1px solid #ccc',

                    backgroundColor: '#f9f9f9',    const updatedLyrics = [...lyricsArray];

                    borderRadius: '3px',

                    cursor: 'pointer',    updatedLyrics.splice(index, 1);  // Helper function to convert complex lyrics format to simple array format    transition,

                    fontSize: '12px'

                  }}    

                  title="Edit this line"

                >    try {  const convertLyricsToArray = (lyrics: any): string[] => {    isDragging,

                  <FaPencilAlt />

                </button>      await onUpdateSong({

                <button 

                  onClick={() => handleDeleteLine(index)}        ...song,    if (!lyrics) return [];  } = useSortable({ 

                  style={{

                    padding: '4px 6px',        lyrics: updatedLyrics

                    border: '1px solid #ccc',

                    backgroundColor: '#f9f9f9',      });        id,

                    borderRadius: '3px',

                    cursor: 'pointer',      message.success('Line deleted successfully!');

                    fontSize: '12px',

                    color: '#d9534f'    } catch (error) {    // If it's already an array of strings, return as-is    disabled: isDragDisabled

                  }}

                  title="Delete this line"      console.error('Failed to delete line:', error);

                >

                  <FaTrash />      message.error('Failed to delete line. Please try again.');    if (Array.isArray(lyrics) && lyrics.length > 0 && typeof lyrics[0] === 'string') {  });

                </button>

              </div>    }

            )}

          </div>  };      return lyrics;

        )}

      </div>

    );

  };  // Handle adding a new line    }  const style = {



  useEffect(() => {  const handleAddLine = async (newLine: string) => {

    setLocalTranspose(transpose);

  }, [song.title, transpose]);    const updatedLyrics = [...lyricsArray, newLine];        transform: CSS.Transform.toString(transform),



  const handleTransposeUp = () => {    

    setLocalTranspose((prev) => prev + 1);

    dispatch(transposeSongUp(song.title));    try {    // If it's a string, split by newlines    transition,

  };

      await onUpdateSong({

  const handleTransposeDown = () => {

    setLocalTranspose((prev) => prev - 1);        ...song,    if (typeof lyrics === 'string') {    opacity: isDragging ? 0.5 : (isPendingDelete ? 0.6 : 1),

    dispatch(transposeSongDown(song.title));

  };        lyrics: updatedLyrics



  const handleSaveTranspose = async () => {      });      return lyrics ? lyrics.split('\n') : [];    position: 'relative',

    setIsSavingTranspose(true);

    try {      message.success('Line added successfully!');

      const transposedLyrics = lyricsArray.map(line => {

        const chordRegex = /\[([^\]]+)\]/g;    } catch (error) {    }    backgroundColor: isPendingDelete ? '#f5f5f5' : 'transparent',

        return line.replace(chordRegex, (match, chord) => {

          const transposedChord = transposeChord(chord, localTranspose);      console.error('Failed to add line:', error);

          return `[${transposedChord}]`;

        });      message.error('Failed to add line. Please try again.');        color: isPendingDelete ? '#999' : 'inherit',

      });

    }

      const updatedSong = { 

        ...song,   };    // If it's the complex nested format from tabs.js    pointerEvents: isPendingDelete ? 'none' : 'auto'

        lyrics: transposedLyrics,

        chords: extractChords(transposedLyrics),

        chordFingerings: chordFingerings

      };  // Handle whole song editing    if (Array.isArray(lyrics) && lyrics.length > 0 && Array.isArray(lyrics[0])) {  };

      

      await onUpdateSong(updatedSong);  const handleEditWholeSong = () => {

      setLocalTranspose(0);

      message.success('Transposed lyrics saved successfully!');    setWholeSongText(lyricsArray.join('\n'));      const converted: string[] = [];

    } catch (error) {

      console.error('Failed to save transposed lyrics:', error);    setIsEditingWholeSong(true);

      message.error('Failed to save transposed lyrics. Please try again.');

    } finally {  };        return (

      setIsSavingTranspose(false);

    }

  };

  const handleSaveWholeSong = async () => {      lyrics.forEach((verse: any, verseIndex: number) => {    <div 

  return (

    <div className="song-detail" style={{ width: '100%', minHeight: 'fit-content' }}>          setIsSavingWholeSong(true);

      {/* Album art if available */}

      {song.album?.artwork && (    try {        if (verseIndex > 0) {      ref={setNodeRef} 

        <div style={{ textAlign: 'center', margin: '1rem 0' }}>

          <AlbumArt album={song.album} size="medium" />      const newLyrics = wholeSongText.split('\n').filter(line => line.trim() !== '');

        </div>

      )}      await onUpdateSong({          converted.push(''); // Add blank line between verses      style={style} 

      

      {/* Chord section */}        ...song,

      <div className="chords-section">

        <div className="chords-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>        lyrics: newLyrics,        }      className="lyric-line"

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center' }}>

            <button        chords: extractChords(newLyrics)

              onClick={handleTransposeDown}

              style={{ fontSize: '1.2em', padding: '0.2em 0.6em' }}      });              onMouseEnter={() => setHoveredLineIndex(index)}

            >

              -      setIsEditingWholeSong(false);

            </button>

            <span style={{ minWidth: 40, textAlign: 'center' }}>      message.success('Song lyrics saved successfully!');        verse.forEach((lineObj: any) => {      onMouseLeave={() => setHoveredLineIndex(null)}

              Transpose: {localTranspose > 0 ? `+${localTranspose}` : localTranspose}

            </span>    } catch (error) {

            <button

              onClick={handleTransposeUp}      console.error('Failed to save whole song:', error);          if (lineObj && lineObj.text) {    >

              style={{ fontSize: '1.2em', padding: '0.2em 0.6em' }}

            >      message.error('Failed to save song. Please try again.');

              +

            </button>    } finally {            let line = lineObj.text;      {editingLineIndex === index && !isAddingLine && editingEnabled ? (

            <button

              onClick={handleSaveTranspose}      setIsSavingWholeSong(false);

              disabled={localTranspose === 0 || isSavingTranspose}

              style={{     }                    <LyricLineEditor

                marginLeft: '1em', 

                padding: '0.2em 0.8em',   };

                opacity: localTranspose !== 0 && editingEnabled && !isSavingTranspose ? 1 : 0.5,

                display: 'flex',            // Add chords inline if they exist          line={line}

                alignItems: 'center',

                gap: '0.5em'  const handleCancelWholeSong = () => {

              }}

            >    setIsEditingWholeSong(false);            if (lineObj.chords && lineObj.chords.length > 0) {          onSave={(newLine) => handleSaveLine(newLine, index)}

              {isSavingTranspose && <Spin size="small" />}

              Save Transposed Lyrics    setWholeSongText('');

            </button>

          </div>  };              // For now, just add the first chord at the beginning of the line          onCancel={handleCancelEdit}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

            <label htmlFor="instrument-select">Instrument:</label>

            <select

              id="instrument-select"  // Helper function to check if error is authentication-related              line = `[${lineObj.chords[0]}]${line}`;        />

              value={instrument}

              onChange={(e) => dispatch(setInstrument(e.target.value))}  const isAuthError = (error: any): boolean => {

              style={{ minWidth: 120 }}

            >    if (!error) return false;            }      ) : (

              <option value="ukulele">Ukulele</option>

              <option value="guitar">Guitar</option>    const message = error.message || error || '';

              <option value="piano">Piano</option>

              <option value="bassGuitar">Bass Guitar</option>    const authErrorPatterns = [                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

              <option value="bassUkulele">Bass Ukulele</option>

              <option value="baritoneUkulele">Baritone Ukulele</option>      'User not signed in to Google Drive',

            </select>

          </div>      'Expected OAuth 2 access token',            converted.push(line);          <div className="lyric-content" style={{ flex: 1 }}>

        </div>

              'login cookie or other valid authentication credential', 

        <div className="chord-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0' }}>

          {chords.map((chord: string) => (      'Invalid Credentials',          }            {renderLyricLine(line)}

            <div key={chord} className="chord-item" onClick={() => onPinChord(chord)} style={{ cursor: 'pointer' }}>

              <ChordChart chord={chord} instrument={instrument} />      'Authentication failed',

            </div>

          ))}      'unauthorized_client',        });          </div>

        </div>

      </div>      'invalid_token',

      

      {/* Lyrics section */}      'expired_token',      });          {isPendingSave && (

      <div className="lyrics-section">

        <div className="lyrics-container">      'access_denied',

          {/* Song metadata */}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>      'token_expired',                  <div style={{

            <div style={{ flex: 1 }}>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>      'Request had invalid authentication credentials'

                <h3 style={{ margin: 0 }}>{song.title}</h3>

                <i style={{ margin: 0 }}>{artist.name}</i>    ];      return converted;              display: 'flex',

                {song.album?.title && (

                  <span style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>    return authErrorPatterns.some(pattern => 

                    • {song.album.title}

                  </span>      message.toLowerCase().includes(pattern.toLowerCase())    }              alignItems: 'center',

                )}

              </div>    );

            </div>

              };                  gap: '4px',

            {/* Edit buttons */}

            {editingEnabled && (

              <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>

                {!isEditingWholeSong && (  // Handle actual song deletion    // Fallback: return empty array              padding: '4px 8px',

                  <>

                    <button   const handleDeleteSong = async () => {

                      onClick={handleEditWholeSong}

                      style={{     try {    return [];              backgroundColor: '#e6f7ff',

                        padding: '0.5em 1em', 

                        fontSize: '0.9em',      await dispatch(deleteSong({

                        backgroundColor: '#4285f4',

                        color: 'white',        artistName: artist.name,  };              border: '1px solid #91d5ff',

                        border: '1px solid #3367d6',

                        borderRadius: '4px',        albumTitle: song.album?.title,

                        cursor: 'pointer',

                        display: 'flex',        songTitle: song.title,              borderRadius: '4px',

                        alignItems: 'center',

                        gap: '0.5em'        isGoogleDriveConnected

                      }}

                    >      })).unwrap();  // Ensure lyrics is always an array              color: '#1890ff'

                      <FaEdit /> Edit Whole Song

                    </button>

                    <button 

                      style={{       message.success('Song deleted successfully!');  const lyricsArray = convertLyricsToArray(song.lyrics);            }}>

                        padding: '0.5em 1em', 

                        fontSize: '0.9em',      dispatch(clearSelectedSong());

                        backgroundColor: '#dc3545',

                        color: 'white',                    <Spin size="small" />

                        border: '1px solid #c82333',

                        borderRadius: '4px',    } catch (error: any) {

                        cursor: 'pointer',

                        display: 'flex',      console.error('Failed to delete song:', error);  const chords = (song.chords || extractChords(lyricsArray)).map(chord =>              <span style={{ fontSize: '12px' }}>Saving...</span>

                        alignItems: 'center',

                        gap: '0.5em'      

                      }}

                      onClick={() => {      // Check if this is an authentication error    localTranspose !== 0 ? transposeChord(chord, localTranspose) : chord            </div>

                        if (window.confirm(`Are you sure you want to delete "${song.title}" by ${artist?.name || 'Unknown Artist'}?`)) {

                          handleDeleteSong();      if (isAuthError(error)) {

                        }

                      }}        dispatch(setGoogleDriveConnection(false));  );          )}

                    >

                      <FaTrash /> Delete Song        dispatch(setUserInfo(null));

                    </button>

                  </>        message.error('Your Google Drive session has expired. Please sign in again to delete songs.');          {isPendingDelete && (

                )}

                {isEditingWholeSong && (      } else {

                  <div style={{ display: 'flex', gap: '0.5rem' }}>

                    <button         message.error(error.message || 'Failed to delete song. Please try again.');  const handleEditLine = (index: number): void => {            <div style={{

                      onClick={handleSaveWholeSong}

                      disabled={isSavingWholeSong}      }

                      style={{ 

                        padding: '0.5em 1em',     }    setEditingLineIndex(index);              display: 'flex',

                        fontSize: '0.9em',

                        backgroundColor: '#28a745',  };

                        color: 'white',

                        border: '1px solid #218838',  };              alignItems: 'center',

                        borderRadius: '4px',

                        cursor: 'pointer',  // Function to render a lyric line with chord formatting above text

                        display: 'flex',

                        alignItems: 'center',  const renderLyricLine = (line: string, index: number) => {              gap: '4px',

                        gap: '0.5em'

                      }}    const chordRegex = /\[(.*?)\]/g;

                    >

                      {isSavingWholeSong ? <Spin size="small" /> : <FaClipboard />}    const chordPositions: Array<{ chord: string; position: number; length: number }> = [];  const handleSaveLine = async (newLine: string, index: number): Promise<void> => {              padding: '4px 8px',

                      Save

                    </button>    let plainText = line;

                    <button 

                      onClick={handleCancelWholeSong}    let match;    const updatedLyrics = [...lyricsArray];              backgroundColor: '#fff2f0',

                      style={{ 

                        padding: '0.5em 1em',     

                        fontSize: '0.9em',

                        backgroundColor: '#6c757d',    // Extract chord positions and create plain text    updatedLyrics[index] = newLine;              border: '1px solid #ffccc7',

                        color: 'white',

                        border: '1px solid #5a6268',    while ((match = chordRegex.exec(line)) !== null) {

                        borderRadius: '4px',

                        cursor: 'pointer'      chordPositions.push({                  borderRadius: '4px',

                      }}

                    >        chord: match[1],

                      Cancel

                    </button>        position: match.index,    try {              color: '#cf1322'

                  </div>

                )}        length: match[0].length

              </div>

            )}      });      await onUpdateSong({            }}>

          </div>

    }

          {/* Lyrics content */}

          {isEditingWholeSong ? (            ...song,              <Spin size="small" />

            <textarea

              value={wholeSongText}    // Remove chord markers for plain text

              onChange={(e) => setWholeSongText(e.target.value)}

              style={{    plainText = plainText.replace(/\[(.*?)\]/g, '');        lyrics: updatedLyrics              <span style={{ fontSize: '12px' }}>Deleting...</span>

                width: '100%',

                height: '60vh',    

                fontFamily: 'monospace',

                fontSize: '14px',    // Calculate positions for chord labels      });            </div>

                padding: '10px',

                border: '1px solid #ccc',    const adjustedChordPositions = chordPositions.map((item, idx) => {

                borderRadius: '4px'

              }}      let adjustment = 0;      message.success('Line updated successfully!');          )}

            />

          ) : (      for (let i = 0; i < idx; i++) {

            <div>

              {lyricsArray.map((line: string, index: number) => (        adjustment += chordPositions[i].length;      setEditingLineIndex(null);          {hoveredLineIndex === index && editingEnabled && !isPendingDelete && (

                <div key={index}>

                  {renderLyricLine(line, index)}      }

                </div>

              ))}      // Transpose the chord if needed    } catch (error) {            <div className="lyric-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

              

              {editingEnabled && (      const transposedChord = localTranspose !== 0 ? transposeChord(item.chord, localTranspose) : item.chord;

                <div style={{ marginTop: '1rem' }}>

                  <button       return {      console.error('Failed to update line:', error);              <button 

                    onClick={async () => {

                      const newLine = prompt('Enter new line:');        ...item,

                      if (newLine !== null) {

                        await handleAddLine(newLine);        chord: transposedChord,      message.error('Failed to update line. Please try again.');                className="control-button edit" 

                      }

                    }}        position: item.position - adjustment

                    style={{

                      padding: '0.5em 1em',      };    }                onClick={(e) => {

                      fontSize: '0.9em',

                      backgroundColor: '#17a2b8',    });

                      color: 'white',

                      border: '1px solid #138496',      };                  e.stopPropagation();

                      borderRadius: '4px',

                      cursor: 'pointer',    return (

                      display: 'flex',

                      alignItems: 'center',      <div                   handleEditLine(index);

                      gap: '0.5em'

                    }}        className="lyric-line"

                  >

                    <FaPlus /> Add Line        onMouseEnter={() => setHoveredLineIndex(index)}  const handleCancelEdit = (): void => {                }}

                  </button>

                </div>        onMouseLeave={() => setHoveredLineIndex(null)}

              )}

            </div>        style={{ margin: '5px 0', position: 'relative' }}    setEditingLineIndex(null);                style={{

          )}

        </div>      >

      </div>

    </div>        {editingLineIndex === index && editingEnabled ? (  };                  padding: '4px 6px',

  );

};          <LyricLineEditor



export default SongDetail;            line={line}                  border: '1px solid #ccc',

            onSave={(newLine) => handleSaveLine(newLine, index)}

            onCancel={handleCancelEdit}  // Handle deleting a line                  backgroundColor: '#f9f9f9',

          />

        ) : (  const handleDeleteLine = async (index: number): Promise<void> => {                  borderRadius: '3px',

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            <div className="lyric-content" style={{ flex: 1 }}>    const updatedLyrics = [...lyricsArray];                  cursor: 'pointer',

              <div className="lyric-line-with-chords">

                <div className="chord-labels">    updatedLyrics.splice(index, 1);                  fontSize: '12px'

                  {adjustedChordPositions.map((item, idx) => (

                    <span                     }}

                      key={`chord-${idx}`} 

                      className="chord-label"    try {                title="Edit this line"

                      style={{ 

                        position: 'absolute',      await onUpdateSong({              >

                        left: `${item.position}ch`,

                        top: '-20px',        ...song,                <FaPencilAlt />

                        cursor: 'pointer',

                        color: '#1890ff',        lyrics: updatedLyrics              </button>

                        fontWeight: 'bold',

                        fontSize: '12px'      });              <button 

                      }}

                      onClick={() => onPinChord(item.chord)}      message.success('Line deleted successfully!');                className="control-button insert" 

                    >

                      {item.chord}    } catch (error) {                onClick={(e) => {

                    </span>

                  ))}      console.error('Failed to delete line:', error);                  e.stopPropagation();

                </div>

                <div className="lyric-text-only" style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>      message.error('Failed to delete line. Please try again.');                  handleInsertAfter(index);

                  {plainText}

                </div>    }                }}

              </div>

            </div>  };                style={{

            {hoveredLineIndex === index && editingEnabled && (

              <div className="lyric-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>                  padding: '4px 6px',

                <button 

                  className="control-button edit"   // Handle adding a new line                  border: '1px solid #ccc',

                  onClick={() => handleEditLine(index)}

                  style={{  const handleAddLine = async (newLine: string): Promise<void> => {                  backgroundColor: '#f9f9f9',

                    padding: '4px 6px',

                    border: '1px solid #ccc',    const updatedLyrics = [...lyricsArray, newLine];                  borderRadius: '3px',

                    backgroundColor: '#f9f9f9',

                    borderRadius: '3px',                      cursor: 'pointer',

                    cursor: 'pointer',

                    fontSize: '12px'    try {                  fontSize: '12px',

                  }}

                  title="Edit this line"      await onUpdateSong({                  color: '#5cb85c'

                >

                  <FaPencilAlt />        ...song,                }}

                </button>

                <button         lyrics: updatedLyrics                title="Insert new line after this line"

                  className="control-button delete" 

                  onClick={() => handleDeleteLine(index)}      });              >

                  style={{

                    padding: '4px 6px',      message.success('Line added successfully!');                <FaPlus />

                    border: '1px solid #ccc',

                    backgroundColor: '#f9f9f9',    } catch (error) {              </button>

                    borderRadius: '3px',

                    cursor: 'pointer',      console.error('Failed to add line:', error);              <button 

                    fontSize: '12px',

                    color: '#d9534f'      message.error('Failed to add line. Please try again.');                className="control-button delete" 

                  }}

                  title="Delete this line"    }                onClick={(e) => {

                >

                  <FaTrash />  };                  e.stopPropagation();

                </button>

              </div>                  handleDeleteLine(index);

            )}

          </div>  // Handle whole song editing                }}

        )}

      </div>  const handleEditWholeSong = (): void => {                style={{

    );

  };    setWholeSongText(lyricsArray.join('\n'));                  padding: '4px 6px',



  useEffect(() => {    setIsEditingWholeSong(true);                  border: '1px solid #ccc',

    // Sync local transpose with redux only when song changes

    setLocalTranspose(transpose);  };                  backgroundColor: '#f9f9f9',

  }, [song.title, transpose]);

                  borderRadius: '3px',

  const handleTransposeUp = () => {

    setLocalTranspose((prev) => prev + 1);  const handleSaveWholeSong = async (): Promise<void> => {                  cursor: 'pointer',

    dispatch(transposeSongUp(song.title));

  };    setIsSavingWholeSong(true);                  fontSize: '12px',



  const handleTransposeDown = () => {    try {                  color: '#d9534f'

    setLocalTranspose((prev) => prev - 1);

    dispatch(transposeSongDown(song.title));      const newLyrics = wholeSongText.split('\n').filter(line => line.trim() !== '');                }}

  };

      await onUpdateSong({                title="Delete this line"

  const handleSaveTranspose = async () => {

    setIsSavingTranspose(true);        ...song,              >

    try {

      // Apply transposition to all lyrics inline        lyrics: newLyrics,                <FaTrash />

      const transposedLyrics = lyricsArray.map(line => {

        const chordRegex = /\[([^\]]+)\]/g;        chords: extractChords(newLyrics)              </button>

        return line.replace(chordRegex, (match, chord) => {

          const transposedChord = transposeChord(chord, localTranspose);      });              <div 

          return `[${transposedChord}]`;

        });      setIsEditingWholeSong(false);                {...(isDragDisabled ? {} : attributes)}

      });

      message.success('Song lyrics saved successfully!');                {...(isDragDisabled ? {} : listeners)}

      const updatedSong = { 

        ...song,     } catch (error) {                className="drag-handle"

        lyrics: transposedLyrics,

        chords: extractChords(transposedLyrics),      console.error('Failed to save whole song:', error);                style={{

        chordFingerings: chordFingerings

      };      message.error('Failed to save song. Please try again.');                  padding: '4px 6px',

      

      await onUpdateSong(updatedSong);    } finally {                  border: '1px solid #ddd',

      

      // Reset local transpose since it's now baked into the lyrics      setIsSavingWholeSong(false);                  backgroundColor: isDragDisabled ? '#e9e9e9' : '#f0f0f0',

      setLocalTranspose(0);

      message.success('Transposed lyrics saved successfully!');    }                  borderRadius: '3px',

    } catch (error) {

      console.error('Failed to save transposed lyrics:', error);  };                  cursor: isDragDisabled ? 'not-allowed' : 'grab',

      message.error('Failed to save transposed lyrics. Please try again.');

    } finally {                  fontSize: '12px',

      setIsSavingTranspose(false);

    }  const handleCancelWholeSong = (): void => {                  color: isDragDisabled ? '#999' : '#666',

  };

    setIsEditingWholeSong(false);                  display: 'flex',

  return (

    <div className="song-detail" style={{ width: '100%', minHeight: 'fit-content' }}>          setWholeSongText('');                  alignItems: 'center',

      {/* Chord section */}

      <div className="chords-section">  };                  transition: 'all 0.2s ease',

        <div className="chords-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center' }}>                  boxShadow: isDragDisabled ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',

            <button

              className="transpose-btn"  // Helper function to check if error is authentication-related                  opacity: isDragDisabled ? 0.6 : 1

              title="Transpose Down"

              onClick={handleTransposeDown}  const isAuthError = (error: any): boolean => {                }}

              style={{ fontSize: '1.2em', padding: '0.2em 0.6em' }}

            >    if (!error) return false;                onMouseDown={isDragDisabled ? undefined : (e) => e.currentTarget.style.cursor = 'grabbing'}

              -

            </button>    const message = error.message || error || '';                onMouseUp={isDragDisabled ? undefined : (e) => e.currentTarget.style.cursor = 'grab'}

            <span style={{ minWidth: 40, textAlign: 'center' }}>

              Transpose: {localTranspose > 0 ? `+${localTranspose}` : localTranspose} semitones    const authErrorPatterns = [                title={isDragDisabled ? "Drag disabled during update" : "Drag to reorder"}

            </span>

            <button      'User not signed in to Google Drive',              >

              className="transpose-btn"

              title="Transpose Up"      'Expected OAuth 2 access token',                {isThisLinePending ? (

              onClick={handleTransposeUp}

              style={{ fontSize: '1.2em', padding: '0.2em 0.6em' }}      'login cookie or other valid authentication credential',                   <Spin size="small" />

            >

              +      'Invalid Credentials',                ) : (

            </button>

            <button      'Authentication failed',                  <FaGripVertical />

              className="save-transpose-btn"

              onClick={handleSaveTranspose}      'unauthorized_client',                )}

              disabled={localTranspose === 0 || isSavingTranspose}

              style={{       'invalid_token',              </div>

                marginLeft: '1em', 

                padding: '0.2em 0.8em',       'expired_token',            </div>

                opacity: localTranspose !== 0 && editingEnabled && !isSavingTranspose ? 1 : 0.5,

                display: 'flex',      'access_denied',          )}

                alignItems: 'center',

                gap: '0.5em'      'token_expired',        </div>

              }}

            >      'Request had invalid authentication credentials'      )}

              {isSavingTranspose && <Spin size="small" />}

              Save Transposed Lyrics    ];    </div>

            </button>

          </div>    return authErrorPatterns.some(pattern =>   );

          <div className="instrument-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>

            <label htmlFor="instrument-select" style={{ marginRight: 0 }}>Instrument:</label>      message.toLowerCase().includes(pattern.toLowerCase())};

            <select

              id="instrument-select"    );

              value={instrument}

              onChange={(e) => dispatch(setInstrument(e.target.value))}  };interface SongDetailProps {

              style={{ minWidth: 120 }}

            >  song: Song;

              <option value="ukulele">Ukulele</option>

              <option value="guitar">Guitar</option>  // Handle actual song deletion  onPinChord: (chord: string) => void;

              <option value="piano">Piano</option>

              <option value="bassGuitar">Bass Guitar</option>  const handleDeleteSong = async (): Promise<void> => {  onUpdateSong: (song: Song) => Promise<void>;

              <option value="bassUkulele">Bass Ukulele</option>

              <option value="baritoneUkulele">Baritone Ukulele</option>    setIsDeletingSong(true);  artist: Artist;

            </select>

          </div>    try {  editingEnabled?: boolean;

        </div>

        <div className="chord-container">      await dispatch(deleteSong({}

          {chords.map((chord: string) => (

            <div key={chord} className="chord-item" onClick={() => onPinChord(chord)}>        artistName: artist.name,

              <ChordChart

                chord={chord}        albumTitle: song.album?.title,const SongDetail: React.FC<SongDetailProps> = ({ song, onPinChord, onUpdateSong, artist, editingEnabled = true }) => {

                instrument={instrument}

              />        songTitle: song.title,  const { message, modal } = App.useApp();

            </div>

          ))}        isGoogleDriveConnected  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

        </div>

      </div>      })).unwrap();  const [isAddingLine, setIsAddingLine] = useState<boolean>(false);

      

      {/* Lyrics section */}  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null); // Track where we're inserting

      <div className="lyrics-section">

        <div className="lyrics-container">      message.success('Song deleted successfully!');  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

          {/* Song metadata */}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>      dispatch(clearSelectedSong());  const [localTranspose, setLocalTranspose] = useState<number>(0);

            <div style={{ flex: 1 }}>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>        const [dirty, setDirty] = useState<boolean>(false);

                <h3 style={{ margin: 0 }}>{song.title}</h3>

                <i style={{ margin: 0 }}>{artist.name}</i>    } catch (error) {  const [isEditingWholeSong, setIsEditingWholeSong] = useState<boolean>(false);

                {song.album && song.album.title && (

                  <span style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>      console.error('Failed to delete song:', error);  const [wholeSongText, setWholeSongText] = useState<string>('');

                    • {song.album.title}

                  </span>        const [pendingSaves, setPendingSaves] = useState<Set<number>>(new Set());

                )}

              </div>      // Check if this is an authentication error  const [pendingDragOperation, setPendingDragOperation] = useState<any>(null);

            </div>

                  if (isAuthError(error)) {  const [optimisticLyrics, setOptimisticLyrics] = useState<string[] | null>(null);

            {/* Edit buttons */}

            <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>        dispatch(setGoogleDriveConnection(false));  const [pendingLineIndex, setPendingLineIndex] = useState<number | null>(null);

              {editingEnabled && !isEditingWholeSong && (

                <>        dispatch(setUserInfo(null));  const [pendingDeleteLines, setPendingDeleteLines] = useState<Set<number>>(new Set());

                  <button 

                    className="edit-whole-song-btn"        message.error('Your Google Drive session has expired. Please sign in again to delete songs.');  const [isPendingAdd, setIsPendingAdd] = useState<boolean>(false);

                    onClick={handleEditWholeSong}

                    style={{       } else {  const [isPendingAnyOperation, setIsPendingAnyOperation] = useState<boolean>(false);

                      padding: '0.5em 1em', 

                      fontSize: '0.9em',        message.error((error as any).message || 'Failed to delete song. Please try again.');  const [isSavingTranspose, setIsSavingTranspose] = useState<boolean>(false);

                      backgroundColor: '#4285f4',

                      color: 'white',      }  const [isSavingWholeSong, setIsSavingWholeSong] = useState<boolean>(false);

                      border: '1px solid #3367d6',

                      borderRadius: '4px',    } finally {  const [isDeletingSong, setIsDeletingSong] = useState<boolean>(false);

                      cursor: 'pointer',

                      display: 'flex',      setIsDeletingSong(false);  const [deleteCountdown, setDeleteCountdown] = useState<number>(0);

                      alignItems: 'center',

                      gap: '0.5em',    }  const dispatch = useDispatch();

                      transition: 'background-color 0.2s ease'

                    }}  };  const instrument = useSelector((state: RootState) => state.chords.currentInstrument);

                  >

                    <FaEdit /> Edit Whole Song  const transpose = useSelector((state: RootState) => state.chords.transposeBy?.[song.title] || 0);

                  </button>

                  <button   // Function to render a lyric line with chord formatting above text  const chordFingerings = useSelector((state: RootState) => state.chords.chordFingerings);

                    className="delete-song-btn"

                    style={{   const renderLyricLine = (line: string, index: number): JSX.Element => {  const isGoogleDriveConnected = useSelector((state: RootState) => state.songs.isGoogleDriveConnected);

                      padding: '0.5em 1em', 

                      fontSize: '0.9em',    const chordRegex = /\[(.*?)\]/g;

                      backgroundColor: '#dc3545',

                      color: 'white',    const chordPositions: Array<{chord: string, position: number, length: number}> = [];  // Set up sensors for drag and drop

                      border: '1px solid #c82333',

                      borderRadius: '4px',    let plainText = line;  const sensors = useSensors(

                      cursor: 'pointer',

                      display: 'flex',    let match;    useSensor(PointerSensor),

                      alignItems: 'center',

                      gap: '0.5em',        useSensor(KeyboardSensor, {

                      transition: 'background-color 0.2s ease'

                    }}    // Extract chord positions and create plain text      coordinateGetter: sortableKeyboardCoordinates,

                    onClick={() => {

                      if (window.confirm(`Are you sure you want to delete "${song.title}" by ${artist?.name || 'Unknown Artist'}?`)) {    while ((match = chordRegex.exec(line)) !== null) {    })

                        handleDeleteSong();

                      }      chordPositions.push({  );

                    }}

                  >        chord: match[1],

                    <FaTrash /> Delete Song

                  </button>        position: match.index,  // Extract unique chords from lyrics

                </>

              )}        length: match[0].length  const extractChords = (lyrics: string[]): string[] => {

              {isEditingWholeSong && (

                <div style={{ display: 'flex', gap: '0.5rem' }}>      });    const chordRegex = /\[(.*?)\]/g;

                  <button 

                    className="save-whole-song-btn"    }    const allChords: string[] = [];

                    onClick={handleSaveWholeSong}

                    disabled={isSavingWholeSong}        

                    style={{ 

                      padding: '0.5em 1em',     // Remove chord markers for plain text    lyrics?.forEach(line => {

                      fontSize: '0.9em',

                      backgroundColor: '#28a745',    plainText = plainText.replace(/\[(.*?)\]/g, '');      let match;

                      color: 'white',

                      border: '1px solid #218838',          while ((match = chordRegex.exec(line)) !== null) {

                      borderRadius: '4px',

                      cursor: 'pointer',    // Calculate positions for chord labels        if (!allChords.includes(match[1])) {

                      display: 'flex',

                      alignItems: 'center',    const adjustedChordPositions = chordPositions.map((item, idx) => {          allChords.push(match[1]);

                      gap: '0.5em'

                    }}      let adjustment = 0;        }

                  >

                    {isSavingWholeSong ? <Spin size="small" /> : <FaClipboard />}      for (let i = 0; i < idx; i++) {      }

                    Save

                  </button>        adjustment += chordPositions[i].length;    });

                  <button 

                    className="cancel-whole-song-btn"      }    

                    onClick={handleCancelWholeSong}

                    style={{       // Transpose the chord if needed    return allChords;

                      padding: '0.5em 1em', 

                      fontSize: '0.9em',      const transposedChord = localTranspose !== 0 ? transposeChord(item.chord, localTranspose) : item.chord;  };

                      backgroundColor: '#6c757d',

                      color: 'white',      return {

                      border: '1px solid #5a6268',

                      borderRadius: '4px',        ...item,  // Helper to shift a chord name by a number of semitones

                      cursor: 'pointer'

                    }}        chord: transposedChord,  const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

                  >

                    Cancel        position: item.position - adjustment  const FLAT_EQUIV: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

                  </button>

                </div>      };  

              )}

            </div>    });  function normalizeChordName(name: string): string {

          </div>

        // Convert flats to sharps for lookup

          {isEditingWholeSong ? (

            <textarea    return (    let base = name;

              value={wholeSongText}

              onChange={(e) => setWholeSongText(e.target.value)}      <div     let suffix = '';

              style={{

                width: '100%',        className="lyric-line"    if (name.length > 1 && (name[1] === '#' || name[1] === 'b')) {

                height: '60vh',

                fontFamily: 'monospace',        onMouseEnter={() => setHoveredLineIndex(index)}      base = name.slice(0, 2);

                fontSize: '14px',

                padding: '10px',        onMouseLeave={() => setHoveredLineIndex(null)}      suffix = name.slice(2);

                border: '1px solid #ccc',

                borderRadius: '4px'        style={{ margin: '5px 0', position: 'relative' }}    } else {

              }}

            />      >      base = name[0];

          ) : (

            <div>        {editingLineIndex === index && editingEnabled ? (      suffix = name.slice(1);

              {lyricsArray.map((line: string, index: number) => (

                <div key={index}>          <LyricLineEditor    }

                  {renderLyricLine(line, index)}

                </div>            line={line}    if (FLAT_EQUIV[base]) base = FLAT_EQUIV[base];

              ))}

                          onSave={(newLine) => handleSaveLine(newLine, index)}    return base + suffix;

              {editingEnabled && (

                <div style={{ marginTop: '1rem' }}>            onCancel={handleCancelEdit}  }

                  <button 

                    className="add-line-btn"          />  

                    onClick={async () => {

                      const newLine = prompt('Enter new line:');        ) : (  function transposeChord(chord: string, semitones: number): string {

                      if (newLine !== null) {

                        await handleAddLine(newLine);          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>    // Handle slashed chords (e.g. A/C# -> A#/D)

                      }

                    }}            <div className="lyric-content" style={{ flex: 1 }}>    if (chord.includes('/')) {

                    style={{

                      padding: '0.5em 1em',              <div className="lyric-line-with-chords">      const [rootPart, bassPart] = chord.split('/');

                      fontSize: '0.9em',

                      backgroundColor: '#17a2b8',                <div className="chord-labels">      const transposedRoot = transposeChord(rootPart, semitones);

                      color: 'white',

                      border: '1px solid #138496',                  {adjustedChordPositions.map((item, idx) => (      const transposedBass = transposeChord(bassPart, semitones);

                      borderRadius: '4px',

                      cursor: 'pointer',                    <span       return `${transposedRoot}/${transposedBass}`;

                      display: 'flex',

                      alignItems: 'center',                      key={`chord-${idx}`}     }

                      gap: '0.5em'

                    }}                      className="chord-label"    

                  >

                    <FaPlus /> Add Line                      style={{     // Extract root and suffix (e.g. C#m7 -> C#, m7)

                  </button>

                </div>                        position: 'absolute',    const match = chord.match(/^([A-G][b#]?)(.*)$/);

              )}

            </div>                        left: `${item.position}ch`,    if (!match) return chord;

          )}

        </div>                        top: '-20px',    let [_, root, suffix] = match;

      </div>

    </div>                        cursor: 'pointer',    // Normalize flats to sharps

  );

};                        color: '#1890ff',    if (FLAT_EQUIV[root]) root = FLAT_EQUIV[root];



export default SongDetail;                        fontWeight: 'bold',    let idx = CHROMATIC.indexOf(root);

                        fontSize: '12px'    if (idx === -1) return chord;

                      }}    let newIdx = (idx + semitones + 12) % 12;

                      onClick={() => onPinChord(item.chord)}    return CHROMATIC[newIdx] + suffix;

                    >  }

                      {item.chord}

                    </span>  // Helper function to convert complex lyrics format to simple array format

                  ))}  const convertLyricsToArray = (lyrics) => {

                </div>    if (!lyrics) return [];

                <div className="lyric-text-only" style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>    

                  {plainText}    // If it's already an array of strings, return as-is

                </div>    if (Array.isArray(lyrics) && lyrics.length > 0 && typeof lyrics[0] === 'string') {

              </div>      return lyrics;

            </div>    }

            {hoveredLineIndex === index && editingEnabled && (    

              <div className="lyric-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>    // If it's a string, split by newlines

                <button     if (typeof lyrics === 'string') {

                  className="control-button edit"       return lyrics ? lyrics.split('\n') : [];

                  onClick={() => handleEditLine(index)}    }

                  style={{    

                    padding: '4px 6px',    // If it's the complex nested format from tabs.js

                    border: '1px solid #ccc',    if (Array.isArray(lyrics) && lyrics.length > 0 && Array.isArray(lyrics[0])) {

                    backgroundColor: '#f9f9f9',      const converted = [];

                    borderRadius: '3px',      

                    cursor: 'pointer',      lyrics.forEach((verse, verseIndex) => {

                    fontSize: '12px'        if (verseIndex > 0) {

                  }}          converted.push(''); // Add blank line between verses

                  title="Edit this line"        }

                >        

                  <FaPencilAlt />        verse.forEach((lineObj) => {

                </button>          if (lineObj && lineObj.text) {

                <button             let line = lineObj.text;

                  className="control-button delete"             

                  onClick={() => handleDeleteLine(index)}            // Add chords inline if they exist

                  style={{            if (lineObj.chords && lineObj.chords.length > 0) {

                    padding: '4px 6px',              // For now, just add the first chord at the beginning of the line

                    border: '1px solid #ccc',              // This is a simple conversion - could be made more sophisticated

                    backgroundColor: '#f9f9f9',              line = `[${lineObj.chords[0]}]${line}`;

                    borderRadius: '3px',            }

                    cursor: 'pointer',            

                    fontSize: '12px',            converted.push(line);

                    color: '#d9534f'          }

                  }}        });

                  title="Delete this line"      });

                >      

                  <FaTrash />      return converted;

                </button>    }

              </div>    

            )}    // Fallback: return empty array

          </div>    return [];

        )}  };

      </div>

    );  // Ensure lyrics is always an array

  };  const lyricsArray = convertLyricsToArray(song.lyrics);



  React.useEffect(() => {  const chords = (song.chords || extractChords(lyricsArray)).map(chord =>

    // Sync local transpose with redux only when song changes    localTranspose !== 0 ? transposeChord(chord, localTranspose) : chord

    setLocalTranspose(transpose);  );

  }, [song.title, transpose]);

  const handleEditLine = (index) => {

  const handleTransposeUp = (): void => {    setEditingLineIndex(index);

    setLocalTranspose((prev) => prev + 1);    setIsAddingLine(false);

    dispatch(transposeSongUp(song.title));  };

  };

  const handleAddLine = () => {

  const handleTransposeDown = (): void => {    // Block if there are pending operations

    setLocalTranspose((prev) => prev - 1);    if (isPendingAnyOperation || pendingDeleteLines.size > 0) {

    dispatch(transposeSongDown(song.title));      message.warning('Please wait for current operation to complete before adding a new line.');

  };      return;

    }

  const handleSaveTranspose = async (): Promise<void> => {    

    setIsSavingTranspose(true);    setIsAddingLine(true);

    try {    setEditingLineIndex(null);

      // Apply transposition to all lyrics inline  };

      const transposedLyrics = lyricsArray.map(line => {

        const chordRegex = /\[([^\]]+)\]/g;  const handleInsertAfter = (afterIndex) => {

        return line.replace(chordRegex, (match, chord) => {    // Block if there are pending operations

          const transposedChord = transposeChord(chord, localTranspose);    if (isPendingAnyOperation || pendingDeleteLines.size > 0) {

          return `[${transposedChord}]`;      message.warning('Please wait for current operation to complete before inserting a new line.');

        });      return;

      });    }

    

      const updatedSong = {     setIsAddingLine(true);

        ...song,     setInsertAfterIndex(afterIndex); // Track the original position

        lyrics: transposedLyrics,    // Set to the position where we want to insert (after the specified index)

        chords: extractChords(transposedLyrics),    if (afterIndex === -1) {

        chordFingerings: chordFingerings      // Empty song case - insert at position 0

      };      setEditingLineIndex(0);

          } else {

      await onUpdateSong(updatedSong);      // Insert after the specified line

            setEditingLineIndex(afterIndex + 1);

      // Reset local transpose since it's now baked into the lyrics    }

      setLocalTranspose(0);  };

      message.success('Transposed lyrics saved successfully!');

    } catch (error) {  const handleSaveLine = async (newLine, index) => {

      console.error('Failed to save transposed lyrics:', error);    const updatedLyrics = [...lyricsArray];

      message.error('Failed to save transposed lyrics. Please try again.');    

    } finally {    if (isAddingLine) {

      setIsSavingTranspose(false);      // Set pending add state

    }      setIsPendingAdd(true);

  };      setIsPendingAnyOperation(true);

      

  return (      // Check if we're inserting at a specific position or adding at the end

    <div className="song-detail" style={{ width: '100%', minHeight: 'fit-content' }}>            const targetIndex = editingLineIndex !== null && editingLineIndex <= lyricsArray.length

      {/* Chord section */}        ? editingLineIndex // Insert at specific position

      <div className="chords-section">        : updatedLyrics.length; // Add at the end

        <div className="chords-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>      

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center' }}>      // Insert at target position

            <button      updatedLyrics.splice(targetIndex, 0, newLine);

              className="transpose-btn"      

              title="Transpose Down"      setOptimisticLyrics(updatedLyrics);

              onClick={handleTransposeDown}      setPendingSaves(prev => new Set([...prev, targetIndex]));

              style={{ fontSize: '1.2em', padding: '0.2em 0.6em' }}      

            >      // Exit edit mode immediately for better UX

              -      setEditingLineIndex(null);

            </button>      setIsAddingLine(false);

            <span style={{ minWidth: 40, textAlign: 'center' }}>      

              Transpose: {localTranspose > 0 ? `+${localTranspose}` : localTranspose} semitones      // Save the add operation

            </span>      onUpdateSong({

            <button        ...song,

              className="transpose-btn"        lyrics: updatedLyrics

              title="Transpose Up"      }).then(() => {

              onClick={handleTransposeUp}        message.success('Line added successfully!');

              style={{ fontSize: '1.2em', padding: '0.2em 0.6em' }}        setOptimisticLyrics(null);

            >        setIsPendingAdd(false);

              +        setIsPendingAnyOperation(false);

            </button>        setPendingSaves(prev => {

            <button          const newSet = new Set(prev);

              className="save-transpose-btn"          newSet.delete(targetIndex);

              onClick={handleSaveTranspose}          return newSet;

              disabled={localTranspose === 0 || isSavingTranspose}        });

              style={{         // Ensure we completely reset editing state

                marginLeft: '1em',         setEditingLineIndex(null);

                padding: '0.2em 0.8em',         setIsAddingLine(false);

                opacity: localTranspose !== 0 && editingEnabled && !isSavingTranspose ? 1 : 0.5,        setInsertAfterIndex(null);

                display: 'flex',      }).catch((error) => {

                alignItems: 'center',        console.error('Failed to add line:', error);

                gap: '0.5em'        message.error('Failed to add new line. Please try again.');

              }}        // Revert optimistic update

            >        setOptimisticLyrics(null);

              {isSavingTranspose && <Spin size="small" />}        setIsPendingAdd(false);

              Save Transposed Lyrics        setIsPendingAnyOperation(false);

            </button>        setPendingSaves(prev => {

          </div>          const newSet = new Set(prev);

          <div className="instrument-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>          newSet.delete(targetIndex);

            <label htmlFor="instrument-select" style={{ marginRight: 0 }}>Instrument:</label>          return newSet;

            <select        });

              id="instrument-select"        setIsAddingLine(true);

              value={instrument}        setEditingLineIndex(null);

              onChange={(e) => dispatch(setInstrument(e.target.value))}        setInsertAfterIndex(null);

              style={{ minWidth: 120 }}      });

            >    } else {

              <option value="ukulele">Ukulele</option>      // Set pending edit state

              <option value="guitar">Guitar</option>      setIsPendingAnyOperation(true);

              <option value="piano">Piano</option>      setPendingSaves(prev => new Set([...prev, index]));

              <option value="bassGuitar">Bass Guitar</option>      

              <option value="bassUkulele">Bass Ukulele</option>      // Update existing line - optimistic update

              <option value="baritoneUkulele">Baritone Ukulele</option>      updatedLyrics[index] = newLine;

            </select>      setOptimisticLyrics(updatedLyrics);

          </div>      

        </div>      // Exit edit mode immediately for better UX

        <div className="chord-container">      setEditingLineIndex(null);

          {chords.map(chord => (      

            <div key={chord} className="chord-item" onClick={() => onPinChord(chord)}>      // Save the edit operation

              <ChordChart      onUpdateSong({

                chord={chord}        ...song,

                instrument={instrument}        lyrics: updatedLyrics

              />      }).then(() => {

            </div>        message.success('Line updated successfully!');

          ))}        setOptimisticLyrics(null);

        </div>        setIsPendingAnyOperation(false);

      </div>        setPendingSaves(prev => {

                const newSet = new Set(prev);

      {/* Lyrics section */}          newSet.delete(index);

      <div className="lyrics-section">          return newSet;

        <div className="lyrics-container">        });

          {/* Song metadata */}      }).catch((error) => {

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>        console.error('Failed to update line:', error);

            <div style={{ flex: 1 }}>        message.error('Failed to update line. Please try again.');

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>        // Revert optimistic update

                <h3 style={{ margin: 0 }}>{song.title}</h3>        setOptimisticLyrics(null);

                <i style={{ margin: 0 }}>{artist.name}</i>        setIsPendingAnyOperation(false);

                {song.album && song.album.title && (        setPendingSaves(prev => {

                  <span style={{ margin: 0, color: '#666', fontSize: '0.9em' }}>          const newSet = new Set(prev);

                    • {song.album.title}          newSet.delete(index);

                  </span>          return newSet;

                )}        });

              </div>        setEditingLineIndex(index);

            </div>      });

                }

            {/* Edit buttons */}  };

            <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>

              {editingEnabled && !isEditingWholeSong && (  const handleCancelEdit = () => {

                <>    setEditingLineIndex(null);

                  <button     setIsAddingLine(false);

                    className="edit-whole-song-btn"    setInsertAfterIndex(null);

                    onClick={handleEditWholeSong}  };

                    style={{ 

                      padding: '0.5em 1em',   // Handle deleting a line with optimistic updates

                      fontSize: '0.9em',  const handleDeleteLine = async (index) => {

                      backgroundColor: '#4285f4',    // Block if there are pending operations

                      color: 'white',    if (isPendingAnyOperation || pendingDeleteLines.has(index)) {

                      border: '1px solid #3367d6',      message.warning('Please wait for current operation to complete before deleting this line.');

                      borderRadius: '4px',      return;

                      cursor: 'pointer',    }

                      display: 'flex',

                      alignItems: 'center',    // Set pending delete state

                      gap: '0.5em',    setIsPendingAnyOperation(true);

                      transition: 'background-color 0.2s ease'    setPendingDeleteLines(prev => new Set([...prev, index]));

                    }}

                  >    const updatedLyrics = [...lyricsArray];

                    <FaEdit /> Edit Whole Song    updatedLyrics.splice(index, 1);

                  </button>    

                  <button     // Optimistic update

                    className="delete-song-btn"    setOptimisticLyrics(updatedLyrics);

                    style={{ 

                      padding: '0.5em 1em',     try {

                      fontSize: '0.9em',      await onUpdateSong({

                      backgroundColor: '#dc3545',        ...song,

                      color: 'white',        lyrics: updatedLyrics

                      border: '1px solid #c82333',      });

                      borderRadius: '4px',      

                      cursor: 'pointer',      message.success('Line deleted successfully!');

                      display: 'flex',      setOptimisticLyrics(null);

                      alignItems: 'center',      setIsPendingAnyOperation(false);

                      gap: '0.5em',      setPendingDeleteLines(prev => {

                      transition: 'background-color 0.2s ease'        const newSet = new Set(prev);

                    }}        newSet.delete(index);

                    onClick={() => {        return newSet;

                      if (window.confirm(`Are you sure you want to delete "${song.title}" by ${artist?.name || 'Unknown Artist'}?`)) {      });

                        handleDeleteSong();    } catch (error) {

                      }      console.error('Failed to delete line:', error);

                    }}      message.error('Failed to delete line. Please try again.');

                  >      

                    <FaTrash /> Delete Song      // Revert optimistic update

                  </button>      setOptimisticLyrics(null);

                </>      setIsPendingAnyOperation(false);

              )}      setPendingDeleteLines(prev => {

              {isEditingWholeSong && (        const newSet = new Set(prev);

                <div style={{ display: 'flex', gap: '0.5rem' }}>        newSet.delete(index);

                  <button         return newSet;

                    className="save-whole-song-btn"      });

                    onClick={handleSaveWholeSong}    }

                    disabled={isSavingWholeSong}  };

                    style={{ 

                      padding: '0.5em 1em',   // Handle drag end for reordering lines with optimistic updates

                      fontSize: '0.9em',  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {

                      backgroundColor: '#28a745',    const { active, over } = event;

                      color: 'white',

                      border: '1px solid #218838',    if (active.id !== over.id) {

                      borderRadius: '4px',      // Set pending reorder state

                      cursor: 'pointer',      setIsPendingAnyOperation(true);

                      display: 'flex',      

                      alignItems: 'center',      const oldIndex = lyricsArray.findIndex((_, index) => index.toString() === active.id);

                      gap: '0.5em'      const newIndex = lyricsArray.findIndex((_, index) => index.toString() === over.id);

                    }}      

                  >      // Optimistic update - immediately show the new order

                    {isSavingWholeSong ? <Spin size="small" /> : <FaClipboard />}      const newLyrics = arrayMove(lyricsArray, oldIndex, newIndex);

                    Save      setOptimisticLyrics(newLyrics);

                  </button>      setPendingLineIndex(newIndex); // Track which line is pending

                  <button       

                    className="cancel-whole-song-btn"      // Save the reorder operation

                    onClick={handleCancelWholeSong}      onUpdateSong({

                    style={{         ...song,

                      padding: '0.5em 1em',         lyrics: newLyrics

                      fontSize: '0.9em',      }).then(() => {

                      backgroundColor: '#6c757d',        message.success('Lines reordered successfully!');

                      color: 'white',        setOptimisticLyrics(null);

                      border: '1px solid #5a6268',        setIsPendingAnyOperation(false);

                      borderRadius: '4px',        setPendingLineIndex(null);

                      cursor: 'pointer'      }).catch((error) => {

                    }}        console.error('Failed to reorder lines:', error);

                  >        message.error('Failed to reorder lines. Please try again.');

                    Cancel        // Revert optimistic update

                  </button>        setOptimisticLyrics(null);

                </div>        setIsPendingAnyOperation(false);

              )}        setPendingLineIndex(null);

            </div>      });

          </div>    }

  };

          {isEditingWholeSong ? (

            <textarea  // Remove the old handleMoveLine function as it's replaced by drag and drop

              value={wholeSongText}

              onChange={(e) => setWholeSongText(e.target.value)}  // Handle whole song editing

              style={{  const handleEditWholeSong = () => {

                width: '100%',    setWholeSongText(lyricsArray.join('\n'));

                height: '60vh',    setIsEditingWholeSong(true);

                fontFamily: 'monospace',  };

                fontSize: '14px',

                padding: '10px',  const handleSaveWholeSong = async () => {

                border: '1px solid #ccc',    setIsSavingWholeSong(true);

                borderRadius: '4px'    try {

              }}      const newLyrics = wholeSongText.split('\n').filter(line => line.trim() !== '');

            />      await onUpdateSong({

          ) : (        ...song,

            <div>        lyrics: newLyrics,

              {lyricsArray.map((line, index) => (        chords: extractChords(newLyrics)

                <div key={index}>      });

                  {renderLyricLine(line, index)}      setIsEditingWholeSong(false);

                </div>      message.success('Song lyrics saved successfully!');

              ))}    } catch (error) {

                    console.error('Failed to save whole song:', error);

              {editingEnabled && (      message.error('Failed to save song. Please try again.');

                <div style={{ marginTop: '1rem' }}>    } finally {

                  <button       setIsSavingWholeSong(false);

                    className="add-line-btn"    }

                    onClick={async () => {  };

                      const newLine = prompt('Enter new line:');

                      if (newLine !== null) {  // Helper function to check if error is authentication-related

                        await handleAddLine(newLine);  const isAuthError = (error) => {

                      }    if (!error) return false;

                    }}    const message = error.message || error || '';

                    style={{    const authErrorPatterns = [

                      padding: '0.5em 1em',      'User not signed in to Google Drive',

                      fontSize: '0.9em',      'Expected OAuth 2 access token',

                      backgroundColor: '#17a2b8',      'login cookie or other valid authentication credential', 

                      color: 'white',      'Invalid Credentials',

                      border: '1px solid #138496',      'Authentication failed',

                      borderRadius: '4px',      'unauthorized_client',

                      cursor: 'pointer',      'invalid_token',

                      display: 'flex',      'expired_token',

                      alignItems: 'center',      'access_denied',

                      gap: '0.5em'      'token_expired',

                    }}      'Request had invalid authentication credentials'

                  >    ];

                    <FaPlus /> Add Line    return authErrorPatterns.some(pattern => 

                  </button>      message.toLowerCase().includes(pattern.toLowerCase())

                </div>    );

              )}  };

            </div>

          )}  // Handle opening the popconfirm - start countdown

        </div>  const handleDeleteConfirm = () => {

      </div>    // This is called when user clicks the actual Delete button in the popconfirm

    </div>    handleDeleteSong();

  );  };

};

  // Start countdown when popconfirm opens

export default SongDetail;  const handlePopconfirmOpen = (open) => {
    if (open) {
      setDeleteCountdown(3.0); // Start 3-second countdown with decimal
      const timer = setInterval(() => {
        setDeleteCountdown(prev => {
          if (prev <= 0.1) {
            clearInterval(timer);
            return 0;
          }
          return Math.max(0, prev - 0.1); // Decrease by 0.1 every 100ms
        });
      }, 100); // Update every 100ms (10 times per second)
    } else {
      // Reset countdown when popconfirm closes
      setDeleteCountdown(0);
    }
  };

  // Handle actual song deletion
  const handleDeleteSong = async () => {
    setIsDeletingSong(true);
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
      
    } catch (error) {
      console.error('Failed to delete song:', error);
      
      // Check if this is an authentication error
      if (isAuthError(error)) {
        dispatch(setGoogleDriveConnection(false));
        dispatch(setUserInfo(null));
        message.error('Your Google Drive session has expired. Please sign in again to delete songs.');
      } else {
        message.error(error.message || 'Failed to delete song. Please try again.');
      }
    } finally {
      setIsDeletingSong(false);
      setDeleteCountdown(0);
    }
  };

  const handleCancelWholeSong = () => {
    setIsEditingWholeSong(false);
    setWholeSongText('');
  };

  const renderDeletePopconfirmTitle = () => (
    <div>
      <div>Delete "{song.title}"?</div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
        This action cannot be undone.
      </div>
    </div>
  );

  const renderDeletePopconfirmContent = () => (
    <div style={{ minWidth: '200px' }}>
      <div>
        <strong>Artist:</strong> {artist.name}<br />
        <strong>Album:</strong> {song.album?.title}<br />
        <strong>Song:</strong> {song.title}
      </div>
    </div>
  );

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
  const handleSaveTranspose = async () => {
    setIsSavingTranspose(true);
    try {
      // Apply transposition to all lyrics inline
      const transposedLyrics = lyricsArray.map(line => {
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
      setDirty(false);
      
      // Show success message
      message.success('Transposed lyrics saved successfully!');
    } catch (error) {
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
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#3367d6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4285f4'}
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
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${song.title}" by ${artist?.name || 'Unknown Artist'}?`)) {
                        handleDeleteConfirm();
                      }
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
              onChange={(e) => setWholeSongText(e.target.value)}
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
                items={(optimisticLyrics || lyricsArray).map((_, index) => index.toString())}
                strategy={verticalListSortingStrategy}
              >
                {(optimisticLyrics || lyricsArray).map((line, index) => (
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
