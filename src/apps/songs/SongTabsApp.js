import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { pinChord, setTranspose } from '../../store/chordsSlice';
import ArtistList from './components/ArtistList';
import AlbumList from './components/AlbumList';
import SongDetail from './components/SongDetail';
import GoogleDriveService from './services/GoogleDriveService';
import './styles/SongTabsApp.css';
import { Switch } from 'antd';
import { FaUnlock, FaLock } from 'react-icons/fa';

const SongTabsApp = () => {
  const [library, setLibrary] = useState({ artists: [] });
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingEnabled, setEditingEnabled] = useState(false);

  // Redux state
  const dispatch = useDispatch();
  const instrument = useSelector((state) => state.chords.currentInstrument);

  // New state variables for adding entries
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [isAddingAlbum, setIsAddingAlbum] = useState(false);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newSongName, setNewSongName] = useState('');

  // Refs for input focus
  const newArtistInputRef = useRef(null);
  const newAlbumInputRef = useRef(null);
  const newSongInputRef = useRef(null);

  const { artistName, albumName, songId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Drive API
    const initGoogleDrive = async () => {
      try {
        // Get environment variables with better error handling
        const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

        // Log for debugging (remove in production)
        console.log('Environment check:', {
          hasClientId: !!CLIENT_ID,
          hasApiKey: !!API_KEY,
          clientIdLength: CLIENT_ID?.length || 0
        });

        if (!CLIENT_ID || !API_KEY) {
          console.warn('Google Drive credentials not found in environment variables');
          loadMockLibrary();
          return;
        }

        if (CLIENT_ID === 'your-client-id' || API_KEY === 'your-api-key') {
          console.warn('Using placeholder Google Drive credentials - please update .env file');
          loadMockLibrary();
          return;
        }

        await GoogleDriveService.initialize(CLIENT_ID, API_KEY);
        // Try to restore session from localStorage first
        const restored = GoogleDriveService.restoreSession();
        setIsGoogleDriveConnected(GoogleDriveService.isSignedIn);
        if (restored) {
          setUserEmail(GoogleDriveService.getUserEmail());
          await loadLibraryFromDrive();
          // After loading library, try to select song from URL (songId only)
          if (songId) {
            setTimeout(() => {
              setLibrary((lib) => {
                let foundSong = null, foundArtist = null, foundAlbum = null;
                for (const artist of lib.artists) {
                  for (const album of artist.albums) {
                    const song = album.songs.find(s => s.title === decodeURIComponent(songId));
                    if (song) {
                      foundSong = song;
                      foundArtist = artist;
                      foundAlbum = album;
                      break;
                    }
                  }
                  if (foundSong) break;
                }
                if (foundSong) {
                  setSelectedArtist(foundArtist);
                  setSelectedAlbum(foundAlbum);
                  setSelectedSong(foundSong);
                }
                return lib;
              });
            }, 0);
          }
          return;
        }
        // If not restored, try silent sign-in
        const silentSignedIn = await GoogleDriveService.trySilentSignIn();
        setIsGoogleDriveConnected(GoogleDriveService.isSignedIn);
        if (silentSignedIn) {
          setUserEmail(GoogleDriveService.getUserEmail());
          await loadLibraryFromDrive();
          // After loading library, try to select song from URL (songId only)
          if (songId) {
            setTimeout(() => {
              setLibrary((lib) => {
                let foundSong = null, foundArtist = null, foundAlbum = null;
                for (const artist of lib.artists) {
                  for (const album of artist.albums) {
                    const song = album.songs.find(s => s.title === decodeURIComponent(songId));
                    if (song) {
                      foundSong = song;
                      foundArtist = artist;
                      foundAlbum = album;
                      break;
                    }
                  }
                  if (foundSong) break;
                }
                if (foundSong) {
                  setSelectedArtist(foundArtist);
                  setSelectedAlbum(foundAlbum);
                  setSelectedSong(foundSong);
                }
                return lib;
              });
            }, 0);
          }
        } else {
          // Not signed in, wait for user action
          loadMockLibrary();
        }
      } catch (error) {
        console.error('Failed to initialize Google Drive:', error);
        loadMockLibrary();
      }
    };

    initGoogleDrive();
  }, []);

  const loadMockLibrary = () => {
    const mockLibrary = {
      artists: [
        {
          name: 'Artist Test',
          albums: [
            {
              title: 'Album Test',
              songs: [
                {
                  title: 'Song Test',
                  lyrics: [
                    "1234567890 [Cmaj7]0987654321",
                    "[Cm7]1234567890 [C7]0987654321",
                    "[C]12345 [Cmaj7]67890 [Cm7]12345 [C7]67890",
                  ],
                }
              ]
            }
          ]
        }

      ]
    };
    setLibrary(mockLibrary);
  };

  const loadLibraryFromDrive = async () => {
    setIsLoading(true);
    try {
      const driveLibrary = await GoogleDriveService.loadLibrary();
      setLibrary(driveLibrary);
    } catch (error) {
      console.error('Failed to load library from Google Drive:', error);
      loadMockLibrary();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDriveConnect = async () => {
    setIsLoading(true);
    try {
      await GoogleDriveService.signIn();
      setIsGoogleDriveConnected(true);
      setUserEmail(GoogleDriveService.getUserEmail());
      await loadLibraryFromDrive();
    } catch (error) {
      console.error('Failed to connect to Google Drive:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDriveDisconnect = async () => {
    try {
      await GoogleDriveService.signOut();
      setIsGoogleDriveConnected(false);
      setUserEmail(null);
      loadMockLibrary();
    } catch (error) {
      console.error('Failed to disconnect from Google Drive:', error);
    }
  };

  // Handle URL parameter changes
  useEffect(() => {
    if (artistName && library.artists.length) {
      const artist = library.artists.find(a => a.name === decodeURIComponent(artistName));
      if (artist) {
        setSelectedArtist(artist);

        if (albumName) {
          const album = artist.albums.find(a => a.title === decodeURIComponent(albumName));
          if (album) {
            setSelectedAlbum(album);

            if (songId) {
              const song = album.songs.find(s => s.title === decodeURIComponent(songId));
              if (song) {
                setSelectedSong(song);
              }
            }
          }
        }
      }
    }
  }, [artistName, albumName, songId, library]);

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setSelectedSong(null);
    navigate(`/tabs/artist/${encodeURIComponent(artist.name)}`);
  };

  const handleAlbumSelect = (album) => {
    setSelectedAlbum(album);
    setSelectedSong(null);
    navigate(`/tabs/album/${encodeURIComponent(album.title)}`);
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    navigate(`/tabs/song/${encodeURIComponent(song.title)}`);
  };

  const handlePinChord = (chord) => {
    dispatch(pinChord(chord));
  };

  // Add a handler for updating songs
  const handleUpdateSong = async (updatedSong) => {
    if (!selectedArtist || !selectedAlbum || !selectedSong) return;

    setIsLoading(true);
    try {
      if (isGoogleDriveConnected) {
        const updatedLibrary = await GoogleDriveService.updateSong(
          selectedArtist.name,
          selectedAlbum.title,
          updatedSong
        );
        setLibrary(updatedLibrary);

        // Update the selected song reference
        const updatedSelectedSong = updatedLibrary.artists
          .find(a => a.name === selectedArtist.name)?.albums
          .find(a => a.title === selectedAlbum.title)?.songs
          .find(s => s.title === selectedSong.title);

        if (updatedSelectedSong) {
          setSelectedSong(updatedSelectedSong);
        }
      } else {
        // Handle local updates for mock library
        const updatedLibrary = { ...library };
        const artistIndex = updatedLibrary.artists.findIndex(a => a.name === selectedArtist.name);
        const albumIndex = updatedLibrary.artists[artistIndex].albums.findIndex(a => a.title === selectedAlbum.title);
        const songIndex = updatedLibrary.artists[artistIndex].albums[albumIndex].songs.findIndex(s => s.title === selectedSong.title);

        updatedLibrary.artists[artistIndex].albums[albumIndex].songs[songIndex] = updatedSong;
        setLibrary(updatedLibrary);
        setSelectedSong(updatedSong);
      }
    } catch (error) {
      console.error('Failed to update song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // New handlers for adding entries
  const startAddingArtist = () => {
    setIsAddingArtist(true);
    setNewArtistName('');
    // Focus will be set with useEffect
  };

  const startAddingAlbum = () => {
    setIsAddingAlbum(true);
    setNewAlbumName('');
    // Focus will be set with useEffect
  };

  const startAddingSong = () => {
    setIsAddingSong(true);
    setNewSongName('');
    // Focus will be set with useEffect
  };

  // Handle adding new artist
  const handleAddArtist = async () => {
    if (newArtistName.trim()) {
      setIsLoading(true);
      try {
        const updatedLibrary = await GoogleDriveService.addArtist(newArtistName);
        setLibrary(updatedLibrary);
      } catch (error) {
        console.error('Failed to add artist:', error);
      } finally {
        setIsLoading(false);
        setIsAddingArtist(false);
        setNewArtistName('');
      }
    } else {
      setIsAddingArtist(false);
    }
  };

  // Handle adding new album
  const handleAddAlbum = async () => {
    if (newAlbumName.trim() && selectedArtist) {
      setIsLoading(true);
      try {
        const updatedLibrary = await GoogleDriveService.addAlbum(selectedArtist.name, newAlbumName);
        setLibrary(updatedLibrary);
      } catch (error) {
        console.error('Failed to add album:', error);
      } finally {
        setIsLoading(false);
        setIsAddingAlbum(false);
        setNewAlbumName('');
      }
    } else {
      setIsAddingAlbum(false);
    }
  };

  // Handle adding new song
  const handleAddSong = async () => {
    if (newSongName.trim() && selectedArtist && selectedAlbum) {
      setIsLoading(true);
      try {
        const updatedLibrary = await GoogleDriveService.addSong(
          selectedArtist.name,
          selectedAlbum.title,
          newSongName
        );
        setLibrary(updatedLibrary);
      } catch (error) {
        console.error('Failed to add song:', error);
      } finally {
        setIsLoading(false);
        setIsAddingSong(false);
        setNewSongName('');
      }
    } else {
      setIsAddingSong(false);
    }
  };

  // Handle key press events for input fields
  const handleKeyPress = (e, saveHandler, cancelHandler) => {
    if (e.key === 'Enter') {
      saveHandler();
    } else if (e.key === 'Escape') {
      cancelHandler();
    }
  };

  // Set focus on input elements when adding mode is enabled
  useEffect(() => {
    if (isAddingArtist && newArtistInputRef.current) {
      newArtistInputRef.current.focus();
    }
  }, [isAddingArtist]);

  useEffect(() => {
    if (isAddingAlbum && newAlbumInputRef.current) {
      newAlbumInputRef.current.focus();
    }
  }, [isAddingAlbum]);

  useEffect(() => {
    if (isAddingSong && newSongInputRef.current) {
      newSongInputRef.current.focus();
    }
  }, [isAddingSong]);

  // When a song is selected, if it has a transpose property, sync it to redux
  useEffect(() => {
    if (selectedSong && typeof selectedSong.transpose === 'number') {
      dispatch(setTranspose({ songId: selectedSong.title, value: selectedSong.transpose }));
    }
    // eslint-disable-next-line
  }, [selectedSong]);

  return (
    <div className="song-tabs-app">
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h1>Music Tabs</h1>
          <span>
            <span style={{marginRight: '4px'}}>Edit lock:</span>
            <Switch
              checked={!!editingEnabled}
              onChange={setEditingEnabled}
              checkedChildren={<FaUnlock />}
              unCheckedChildren={<FaLock />}
            />
          </span>
        </div>
        <div className="header-controls">
          <div className="google-drive-section">
            {isGoogleDriveConnected ? (
              <div className="google-drive-connected">
                <span className="user-email">{userEmail}</span>
                <button
                  className="google-drive-button disconnect"
                  onClick={handleGoogleDriveDisconnect}
                  disabled={isLoading}
                >
                  Disconnect Drive
                </button>
              </div>
            ) : (
              <button
                className="google-drive-button connect"
                onClick={handleGoogleDriveConnect}
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect Google Drive'}
              </button>
            )}
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="loading-indicator">
          Loading library...
        </div>
      )}
      <div className="library-navigation">
        <div className="navigation-column">
          <h2>
            Artists
            {isGoogleDriveConnected && editingEnabled && (
              <button className="add-button" onClick={startAddingArtist} disabled={isAddingArtist}>
                +
              </button>
            )}
          </h2>
          {isAddingArtist && (
            <div className="add-item-container">
              <input
                ref={newArtistInputRef}
                type="text"
                value={newArtistName}
                onChange={(e) => setNewArtistName(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, handleAddArtist, () => setIsAddingArtist(false))}
                placeholder="Artist name..."
                className="add-item-input"
              />
              <div className="add-item-controls">
                <button onClick={handleAddArtist}>Save</button>
                <button onClick={() => setIsAddingArtist(false)}>Cancel</button>
              </div>
            </div>
          )}
          <ArtistList
            artists={library.artists}
            selectedArtist={selectedArtist}
            onSelectArtist={handleArtistSelect}
          />
        </div>
        {selectedArtist && (
          <div className="navigation-column">
            <h2>
              Albums
              {isGoogleDriveConnected && editingEnabled && (
                <button className="add-button" onClick={startAddingAlbum} disabled={isAddingAlbum}>
                  +
                </button>
              )}
            </h2>
            {isAddingAlbum && (
              <div className="add-item-container">
                <input
                  ref={newAlbumInputRef}
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleAddAlbum, () => setIsAddingAlbum(false))}
                  placeholder="Album name..."
                  className="add-item-input"
                />
                <div className="add-item-controls">
                  <button onClick={handleAddAlbum}>Save</button>
                  <button onClick={() => setIsAddingAlbum(false)}>Cancel</button>
                </div>
              </div>
            )}
            <AlbumList
              albums={selectedArtist.albums}
              selectedAlbum={selectedAlbum}
              onSelectAlbum={handleAlbumSelect}
            />
          </div>
        )}
        {selectedAlbum && (
          <div className="navigation-column">
            <h2>
              Songs
              {isGoogleDriveConnected && editingEnabled && (
                <button className="add-button" onClick={startAddingSong} disabled={isAddingSong}>
                  +
                </button>
              )}
            </h2>
            {isAddingSong && (
              <div className="add-item-container">
                <input
                  ref={newSongInputRef}
                  type="text"
                  value={newSongName}
                  onChange={(e) => setNewSongName(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleAddSong, () => setIsAddingSong(false))}
                  placeholder="Song name..."
                  className="add-item-input"
                />
                <div className="add-item-controls">
                  <button onClick={handleAddSong}>Save</button>
                  <button onClick={() => setIsAddingSong(false)}>Cancel</button>
                </div>
              </div>
            )}
            <ul className="song-list">
              {selectedAlbum.songs.map(song => (
                <li
                  key={song.title}
                  className={selectedSong?.title === song.title ? 'active' : ''}
                  onClick={() => handleSongSelect(song)}
                >
                  {song.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {selectedSong && (
        <div className="song-content">
          <SongDetail
            song={selectedSong}
            artist={selectedArtist}
            onPinChord={handlePinChord}
            onUpdateSong={handleUpdateSong}
            editingEnabled={!!editingEnabled}
          />
        </div>
      )}
    </div>
  );
};

export default SongTabsApp;
