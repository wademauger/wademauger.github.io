
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, message, Select, Modal } from 'antd';
import { FaSave, FaTimes } from 'react-icons/fa';
import SpotifyService from '../services/SpotifyService';
import { convertLyrics } from '../../../convert-lyrics';
import SpotifyIcon from '../../../img/spotify-icon.svg';
import './SongEditor.css';

const { Option } = Select;

const SongEditor = ({
  song,
  artist,
  album,
  onSave,
  onCancel,
  isGoogleDriveConnected,
  isNewSong = false, // New prop to indicate if we're creating a new song
  library = null, // Library passed for existing artists/albums when creating new songs
  lyricsRef
}) => {
  // Song metadata state (for new songs)
  const [songTitle, setSongTitle] = useState(() => song?.title || '');
  const [songArtist, setSongArtist] = useState(() => artist?.name || '');
  const [songAlbum, setSongAlbum] = useState(() => album?.title || '');
  
  // Spotify album suggestions
  const [spotifyAlbums, setSpotifyAlbums] = useState([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  
  // Spotify artist suggestions
  const [spotifyArtists, setSpotifyArtists] = useState([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  
  // Spotify track suggestions
  const [spotifyTracks, setSpotifyTracks] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  
  const [editedLyrics, setEditedLyrics] = useState(() => {
    // Ensure we always have a string
    return typeof song?.lyrics === 'string' ? song.lyrics : '';
  });
  const [chordPalette, setChordPalette] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);
  // Always call hooks at the top level
  const localLyricsRef = useRef(null);
  const lyricsSectionRef = lyricsRef !== undefined && lyricsRef !== null ? lyricsRef : localLyricsRef;

  // Lyrics conversion state
  const [originalLyrics, setOriginalLyrics] = useState('');
  const [showConversion, setShowConversion] = useState(false);

  // Load Spotify albums when artist changes
  useEffect(() => {
    if (songArtist && songArtist.trim() !== '') {
      const loadSpotifyAlbums = async () => {
        setIsLoadingAlbums(true);
        try {
          const albums = await SpotifyService.getAlbumsForArtist(songArtist);
          setSpotifyAlbums(albums);
        } catch (error: unknown) {
          console.log('Spotify album suggestions unavailable:', error.message);
          setSpotifyAlbums([]);
        } finally {
          setIsLoadingAlbums(false);
        }
      };
      
      // Add a small delay to avoid too many API calls while typing
      const timeoutId = setTimeout(loadSpotifyAlbums, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSpotifyAlbums([]);
      setIsLoadingAlbums(false);
    }
  }, [songArtist]);

  // Load Spotify artist suggestions when typing
  useEffect(() => {
    if (songArtist && songArtist.trim() !== '' && songArtist.length > 0) {
      const searchArtists = async () => {
        setIsLoadingArtists(true);
        try {
          const artists = await SpotifyService.searchArtists(songArtist);
          setSpotifyArtists(artists);
        } catch (error: unknown) {
          console.log('Spotify artist suggestions unavailable:', error.message);
          setSpotifyArtists([]);
        } finally {
          setIsLoadingArtists(false);
        }
      };
      
      // Add a delay to avoid too many API calls while typing
      const timeoutId = setTimeout(searchArtists, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSpotifyArtists([]);
      setIsLoadingArtists(false);
    }
  }, [songArtist]);

  // Load Spotify track suggestions when album is selected
  useEffect(() => {
    if (songArtist && songAlbum && songArtist.trim() !== '' && songAlbum.trim() !== '') {
      const loadTracks = async () => {
        setIsLoadingTracks(true);
        try {
          const tracks = await SpotifyService.getTracksFromAlbum(songArtist, songAlbum);
          setSpotifyTracks(tracks);
        } catch (error: unknown) {
          console.log('Spotify track suggestions unavailable:', error.message);
          setSpotifyTracks([]);
        } finally {
          setIsLoadingTracks(false);
        }
      };
      
      // Add a delay to avoid too many API calls
      const timeoutId = setTimeout(loadTracks, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSpotifyTracks([]);
      setIsLoadingTracks(false);
    }
  }, [songArtist, songAlbum]);

  // Filter albums based on current input (memoized)
  const filteredAlbums = useMemo(() => {
    if (!songAlbum || songAlbum.trim() === '') {
      return spotifyAlbums; // Show all when no filter
    }
    
    const searchTerm = songAlbum.toLowerCase().trim();
    return spotifyAlbums.filter((album: any) => 
      album.toLowerCase().includes(searchTerm)
    );
  }, [spotifyAlbums, songAlbum]);

  // Filter artists based on current input (memoized)
  const filteredArtists = useMemo(() => {
    if (!songArtist || songArtist.trim() === '') {
      return spotifyArtists; // Show all when no filter
    }
    
    const searchTerm = songArtist.toLowerCase().trim();
    return spotifyArtists.filter((artist: any) => 
      artist.toLowerCase().includes(searchTerm)
    );
  }, [spotifyArtists, songArtist]);

  // Get existing artists from library (filtered and memoized)
  const filteredLibraryArtists = useMemo(() => {
    if (!library?.artists) return [];
    let artists = library.artists.map((artist: any) => artist.name).sort();
    
    // Filter based on current artist input if there is one
    if (songArtist && songArtist.trim() !== '') {
      const searchTerm = songArtist.toLowerCase().trim();
      artists = artists.filter((artist: any) => 
        artist.toLowerCase().includes(searchTerm)
      );
    }
    
    return artists;
  }, [library, songArtist]);

  // Get existing albums for selected artist from library (filtered and memoized)
  const filteredLibraryAlbums = useMemo(() => {
    if (!library?.artists || !songArtist) return [];
    const artist = library.artists.find((a: any) => a.name === songArtist);
    if (!artist?.albums) return [];
    
    let albums = artist.albums.map((album: any) => album.title).sort();
    
    // Filter based on current album input if there is one
    if (songAlbum && songAlbum.trim() !== '') {
      const searchTerm = songAlbum.toLowerCase().trim();
      albums = albums.filter((album: any) => 
        album.toLowerCase().includes(searchTerm)
      );
    }
    
    return albums;
  }, [library, songArtist, songAlbum]);

  // Get existing song titles from library for the selected artist/album (memoized)
  const existingSongTitles = useMemo(() => {
    if (!library?.artists || !songArtist || !songAlbum) return [];
    
    const artist = library.artists.find((a: any) => a.name === songArtist);
    if (!artist?.albums) return [];
    
    const album = artist.albums.find((a: any) => a.title === songAlbum);
    if (!album?.songs) return [];
    
    return album.songs.map((song: any) => song.title.toLowerCase().trim());
  }, [library, songArtist, songAlbum]);

  // Get deduplicated and filtered Spotify tracks (memoized)
  const filteredSpotifyTracks = useMemo(() => {
    if (!spotifyTracks || spotifyTracks.length === 0) return [];
    
    // Filter out Spotify tracks that already exist in the library
    let filtered = spotifyTracks.filter((track: any) => 
      !existingSongTitles.includes(track.toLowerCase().trim())
    );
    
    // Also filter based on current song title input if there is one
    if (songTitle && songTitle.trim() !== '') {
      const searchTerm = songTitle.toLowerCase().trim();
      filtered = filtered.filter((track: any) => 
        track.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [spotifyTracks, existingSongTitles, songTitle]);

  // Get existing song titles from library for display (memoized)
  const filteredLibrarySongs = useMemo(() => {
    if (!library?.artists || !songArtist || !songAlbum) return [];
    
    const artist = library.artists.find((a: any) => a.name === songArtist);
    if (!artist?.albums) return [];
    
    const album = artist.albums.find((a: any) => a.title === songAlbum);
    if (!album?.songs) return [];
    
    let songs = album.songs.map((song: any) => song.title).sort();
    
    // Filter based on current song title input if there is one
    if (songTitle && songTitle.trim() !== '') {
      const searchTerm = songTitle.toLowerCase().trim();
      songs = songs.filter((title: any) => 
        title.toLowerCase().includes(searchTerm)
      );
    }
    
    return songs;
  }, [library, songArtist, songAlbum, songTitle]);

  // Handle lyrics conversion from external format
  const handleConvertLyrics = () => {
    if (originalLyrics.trim()) {
      const converted = convertLyrics(originalLyrics);
      // Remove blank lines
      const cleaned = converted
        .split('\n')
        .filter((line: any) => line.trim() !== '')
        .join('\n');
      setEditedLyrics(cleaned);
      setOriginalLyrics(''); // Clear the conversion input
      setShowConversion(false); // Hide the conversion section
      message.success('Lyrics converted successfully!');
    }
  };

  // Extract all chords from the lyrics when component mounts or lyrics change
  useEffect(() => {
    const chordPattern = /\[([^\]]+)\]/g;
    const matches = [];
    let match;

    // Ensure editedLyrics is a string before using regex
    const lyricsText = typeof editedLyrics === 'string' ? editedLyrics : '';

    while ((match = chordPattern.exec(lyricsText)) !== null) {
      const chord = match[1];
      if (!matches.includes(chord)) {
        matches.push(chord);
      }
    }

    // Sort chords alphabetically
    setChordPalette(matches.sort());

    // Auto-resize textarea to fit content
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(400, textarea.scrollHeight) + 'px';
    }
  }, [editedLyrics]);

  // Add keyboard shortcuts for chord insertion
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if Ctrl is pressed and it's a number key
      if (event.ctrlKey && !event.shiftKey && !event.altKey) {
        const keyNum = parseInt(event.key);
        if (keyNum >= 1 && keyNum <= 9) {
          const chordIndex = keyNum - 1;
          if (chordIndex < chordPalette.length) {
            event.preventDefault();
            insertChord(chordPalette[chordIndex]);
          }
        }
        // Handle Ctrl+0 for the 10th chord
        else if (event.key === '0' && chordPalette.length >= 10) {
          event.preventDefault();
          insertChord(chordPalette[9]);
        }
        // Handle Ctrl+QWERTY for chords 11-20
        else {
          const qwertyKeys = ['q','w','e','r','t','y','u','i','o','p'];
          const idx = qwertyKeys.indexOf(event.key.toLowerCase());
          if (idx !== -1 && chordPalette.length > 10 + idx) {
            event.preventDefault();
            insertChord(chordPalette[10 + idx]);
          }
        }
      }
    };

    // Add event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [chordPalette]); // Re-run when chord palette changes

  // Render lyrics with chord highlighting (same logic as SongDetail)
  const renderPreview = () => {
    // Ensure editedLyrics is a string
    const lyricsText = typeof editedLyrics === 'string' ? editedLyrics : '';

    if (!lyricsText) {
      return <div className="preview-empty">No lyrics to preview</div>;
    }

    const lines = lyricsText.split('\n');
    return (
      <div className="lyrics-preview">
        {lines.map((line, index) => {
          if (!line.trim()) {
            return <div key={index} className="preview-line empty-line">&nbsp;</div>;
          }

          // Use the same chord rendering logic as SongDetail
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
            return {
              ...item,
              position: item.position - adjustment
            };
          });

          return (
            <div key={index} className="lyric-line-with-chords">
              <div className="chord-labels">
                {adjustedChordPositions.map((item, idx) => (
                  <span
                    key={`chord-${idx}`}
                    className="chord-label"
                    style={{ left: `${item.position}ch` }}
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
        })}
      </div>
    );
  };

  // Insert chord at cursor position
  const insertChord = async (chord) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeCursor = editedLyrics.slice(0, start);
    const afterCursor = editedLyrics.slice(end);

    const chordText = `[${chord}]`;
    const newLyrics = beforeCursor + chordText + afterCursor;

    setEditedLyrics(newLyrics);

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(chordText);
      message.success(`${chordText} copied to clipboard`);
    } catch (err: unknown) {
      console.error('Failed to copy to clipboard:', err);
      message.info(`${chordText} inserted`);
    }

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + chordText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Handle save
  const handleSave = async () => {
    // Validation
    if (isNewSong) {
      if (!songTitle.trim()) {
        message.error('Please enter a song title');
        return;
      }
      if (!songArtist.trim()) {
        message.error('Please enter an artist name');
        return;
      }
      if (!songAlbum.trim()) {
        message.error('Please enter an album title');
        return;
      }
    }

    if (!isGoogleDriveConnected && !isNewSong) {
      message.error('Please sign in to Google Drive to save changes');
      return;
    }

    setIsSaving(true);
    try {
      if (isNewSong) {
        // Creating a new song
        await onSave({
          title: songTitle.trim(),
          artist: songArtist.trim(),
          album: songAlbum.trim(),
          lyrics: editedLyrics
        });
      } else {
        // Updating existing song - include metadata changes
        const updatedSong = {
          ...song,
          title: songTitle.trim(),
          lyrics: editedLyrics,
          updatedAt: new Date().toISOString()
        };
        
        // Pass the updated metadata as well
        await onSave(updatedSong, {
          artist: songArtist.trim(),
          album: songAlbum.trim()
        });
      }
      
      message.success(isNewSong ? 'Song created successfully!' : 'Song saved successfully!');
    } catch (error: unknown) {
      console.error('Failed to save song:', error);
      message.error(`Failed to ${isNewSong ? 'create' : 'save'} song. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    const hasChanges = isNewSong 
      ? (songTitle.trim() !== '' || songArtist.trim() !== '' || songAlbum.trim() !== '' || editedLyrics.trim() !== '')
      : (editedLyrics !== (song?.lyrics || ''));
      
    if (hasChanges) {
      Modal.confirm({
        title: 'Unsaved changes',
        content: 'You have unsaved changes. Are you sure you want to cancel?',
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => onCancel()
      });
    } else {
      onCancel();
    }
  };

  return (
    <div className="song-editor">
      {/* Header */}
      <div className="song-editor-header">
        <div className="song-info">
          <div className="song-form">
            <div className="form-row">
              <div className="form-group">
                <label>Artist</label>
                <Select
                  value={songArtist}
                  onChange={setSongArtist}
                  placeholder="Type to search for artists"
                  size="large"
                  showSearch
                  allowClear
                  loading={isLoadingArtists}
                  style={{ width: '100%' }}
                  filterOption={false} // Disable built-in filtering since we handle it with API
                  onSearch={setSongArtist} // Update the value as user types
                  notFoundContent={isLoadingArtists ? 'Searching...' : 'No artists found'}
                >
                  {/* Existing artists from library */}
                  {filteredLibraryArtists.map((artistName, index) => (
                    <Option key={`library-artist-${index}-${artistName}`} value={artistName}>
                      📚 {artistName}
                    </Option>
                  ))}
                  
                  {/* Spotify artist suggestions */}
                  {filteredArtists.map((artistName, index) => (
                    <Option key={`spotify-artist-${index}-${artistName}`} value={artistName}>
                      <img 
                        src={SpotifyIcon} 
                        alt="Spotify" 
                        className="spotify-icon"
                      />
                      {artistName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Album</label>
                <Select
                  value={songAlbum}
                  onChange={setSongAlbum}
                  placeholder="Type to search for albums"
                  size="large"
                  showSearch
                  allowClear
                  loading={isLoadingAlbums}
                  style={{ width: '100%' }}
                  filterOption={false} // Disable built-in filtering
                  onSearch={setSongAlbum} // Allow custom input
                  notFoundContent={isLoadingAlbums ? 'Loading albums...' : 'No albums found'}
                >
                  {/* Existing albums from library */}
                  {filteredLibraryAlbums.map((albumTitle, index) => (
                    <Option key={`library-album-${index}-${albumTitle}`} value={albumTitle}>
                      📚 {albumTitle}
                    </Option>
                  ))}
                  
                  {/* Spotify album suggestions */}
                  {filteredAlbums.map((albumTitle, index) => (
                    <Option key={`spotify-album-${index}-${albumTitle}`} value={albumTitle}>
                      <img 
                        src={SpotifyIcon} 
                        alt="Spotify" 
                        className="spotify-icon"
                      />
                      {albumTitle}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Title</label>
                <Select
                  value={songTitle}
                  onChange={setSongTitle}
                  placeholder="Type to search for songs"
                  size="large"
                  showSearch
                  allowClear
                  loading={isLoadingTracks}
                  style={{ width: '100%' }}
                  filterOption={false} // Disable built-in filtering
                  onSearch={setSongTitle} // Allow custom input
                  notFoundContent={isLoadingTracks ? 'Loading tracks...' : 'No tracks found'}
                >
                  {/* Existing songs from library */}
                  {filteredLibrarySongs.map((title, index) => (
                    <Option key={`library-${index}-${title}`} value={title}>
                      📚 {title}
                    </Option>
                  ))}
                  
                  {/* Spotify track suggestions from selected album (deduplicated) */}
                  {filteredSpotifyTracks.map((trackTitle, index) => (
                    <Option key={`spotify-${index}-${trackTitle}`} value={trackTitle}>
                      <img 
                        src={SpotifyIcon} 
                        alt="Spotify" 
                        className="spotify-icon"
                      />
                      {trackTitle}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="editor-main">
        {/* Left: Editable Lyrics */}
        <div className="editor-pane" ref={lyricsSectionRef}>
          <div className="editor-header">
            <h3>Edit Lyrics <small>(use [chord] format)</small></h3>
            
            {/* Ultimate Guitar Conversion - moved to top for better UX */}
            <div className="ug-conversion-compact">
              <Button 
                type="default"
                onClick={() => setShowConversion(!showConversion)}
                size="small"
                style={{ marginBottom: '0.5rem' }}
              >
                {showConversion ? '▼ Hide UG Converter' : '▶ Convert from Ultimate Guitar'}
              </Button>
              
              {showConversion && (
                <div className="conversion-content">
                  <textarea
                    value={originalLyrics}
                    onChange={(e) => setOriginalLyrics(e.target.value)}
                    placeholder="Paste Ultimate Guitar format lyrics here..."
                    className="conversion-textarea-compact"
                    rows={4}
                    spellCheck={false}
                  />
                  <div className="conversion-actions">
                    <Button 
                      type="primary"
                      onClick={handleConvertLyrics}
                      disabled={!originalLyrics.trim()}
                      size="small"
                    >
                      Convert to Inline Format
                    </Button>
                    <Button 
                      type="text"
                      onClick={() => {
                        setOriginalLyrics('');
                        setShowConversion(false);
                      }}
                      size="small"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Chord Palette Ribbon - positioned at top and made sticky */}
          {chordPalette.length > 0 && (
            <div className="chord-palette-ribbon">
              <h4>Chord Palette (click to insert or use Ctrl+1-9, Ctrl+0):</h4>
              <div className="chord-buttons">
                {chordPalette.map((chord, index) => (
                  <button
                    key={index}
                    className="chord-button"
                    onClick={() => insertChord(chord)}
                    title={`Insert [${chord}] at cursor position and copy to clipboard. Shortcut: Ctrl+${index < 9 ? index + 1 : 0}`}
                  >
                    <span className="chord-text">{chord}</span>
                    {index < 10 && (
                      <span className="chord-shortcut">Ctrl+{index < 9 ? index + 1 : 0}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={editedLyrics}
            onChange={(e) => setEditedLyrics(e.target.value)}
            placeholder="Enter lyrics with chords in [chord] format..."
            className={`lyrics-editor${chordPalette.length > 0 ? ' has-chord-palette' : ''}`}
            spellCheck={false}
          />

          <div className="editor-help">
            <p>
              <strong>Tip:</strong> Use square braces around chords: [C], [C#], [Cm] [Csus4], etc.
              <br/>Click palette buttons or use <strong>Ctrl+1-9, Ctrl+0</strong> to insert chords at cursor.
            </p>
          </div>
        </div>

        {/* Right: Preview */}
        <div className={`preview-pane${chordPalette.length > 0 ? ' has-chord-ribbon' : ''}`}>
          <h3>Preview</h3>
          {renderPreview()}
        </div>
      </div>

      {/* Action buttons moved to bottom */}
      <div className="editor-actions-bottom">
        <Button
          type="primary"
          icon={<FaSave />}
          onClick={handleSave}
          loading={isSaving}
          disabled={!isGoogleDriveConnected && !isNewSong}
          size="large"
        >
          {isNewSong ? 'Create Song' : 'Save Changes'}
        </Button>
        <Button
          icon={<FaTimes />}
          onClick={handleCancel}
          style={{ marginLeft: '0.5rem' }}
          size="large"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SongEditor;