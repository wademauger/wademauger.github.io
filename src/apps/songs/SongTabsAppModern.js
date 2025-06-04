// Example updated SongTabsApp.js using the modern Google Drive service
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { pinChord, setTranspose } from '../../store/chordsSlice';
import ArtistList from './components/ArtistList';
import AlbumList from './components/AlbumList';
import SongDetail from './components/SongDetail';
import GoogleDriveServiceModern from './services/GoogleDriveServiceModern';
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

  const { artistName, albumName, songName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Drive API with modern service
    const initGoogleDrive = async () => {
      try {
        // Get environment variable for Client ID
        const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

        if (!CLIENT_ID) {
          throw new Error('Google Client ID not found in environment variables');
        }

        // Initialize the modern service (simpler - no API key needed)
        await GoogleDriveServiceModern.initialize(CLIENT_ID);
        
        // Check if user has existing valid session
        const isValidSession = await GoogleDriveServiceModern.validateToken();
        
        if (isValidSession && GoogleDriveServiceModern.isSignedIn) {
          setIsGoogleDriveConnected(true);
          setUserEmail(GoogleDriveServiceModern.userEmail);
          await loadLibraryFromDrive();
        } else {
          console.debug('No valid session found, using mock library');
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
              name: 'Album Test',
              songs: [
                {
                  name: 'Song Test',
                  chords: '',
                  lyrics: [
                    "1234567890 [Cmaj7]0987654321",
                    "[Cm7]1234567890 [C7]0987654321",
                    "[C]12345 [Cmaj7]67890 [Cm7]12345 [C7]67890",
                  ].join('\\n'),
                  notes: '',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ]
            }
          ]
        }
      ],
      version: '1.0',
      lastUpdated: new Date().toISOString()
    };

    setLibrary(mockLibrary);
  };

  const loadLibraryFromDrive = async () => {
    setIsLoading(true);
    try {
      const driveLibrary = await GoogleDriveServiceModern.loadLibrary();
      setLibrary(driveLibrary);
      console.log('Library loaded from Google Drive');
    } catch (error) {
      console.error('Failed to load library from Google Drive:', error);
      
      // Simplified error handling - check for auth errors
      if (error.message === 'User not signed in to Google Drive') {
        setIsGoogleDriveConnected(false);
        setUserEmail(null);
      }
      
      // Fall back to mock data
      loadMockLibrary();
    } finally {
      setIsLoading(false);
    }
  };

  const saveLibraryToDrive = async (updatedLibrary) => {
    if (!isGoogleDriveConnected) {
      console.warn('Not connected to Google Drive, cannot save');
      return;
    }

    try {
      await GoogleDriveServiceModern.saveLibrary(updatedLibrary);
      console.log('Library saved to Google Drive');
    } catch (error) {
      console.error('Failed to save library to Google Drive:', error);
      
      // Handle auth errors
      if (error.message === 'User not signed in to Google Drive') {
        setIsGoogleDriveConnected(false);
        setUserEmail(null);
        alert('Your Google Drive session has expired. Please sign in again to save changes.');
      } else {
        alert('Failed to save to Google Drive. Please try again.');
      }
    }
  };

  const handleGoogleDriveConnect = async () => {
    setIsLoading(true);
    try {
      // Modern service has simplified sign in
      await GoogleDriveServiceModern.signIn();
      
      setIsGoogleDriveConnected(true);
      setUserEmail(GoogleDriveServiceModern.userEmail);
      
      // Load library after successful authentication
      await loadLibraryFromDrive();
    } catch (error) {
      console.error('Google Drive connection failed:', error);
      alert('Failed to connect to Google Drive. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDriveDisconnect = async () => {
    try {
      // Modern service has simplified sign out
      await GoogleDriveServiceModern.signOut();
      
      setIsGoogleDriveConnected(false);
      setUserEmail(null);
      
      // Load mock data after disconnecting
      loadMockLibrary();
    } catch (error) {
      console.error('Failed to disconnect from Google Drive:', error);
    }
  };

  // Adding new artist
  const handleAddArtist = async () => {
    if (!newArtistName.trim()) return;

    try {
      if (isGoogleDriveConnected) {
        // Use modern service API
        const newArtist = await GoogleDriveServiceModern.addArtist(library, newArtistName.trim());
        
        // Reload library to get updated data
        await loadLibraryFromDrive();
      } else {
        // Local mock data update
        const newArtist = {
          name: newArtistName.trim(),
          albums: []
        };
        
        const updatedLibrary = {
          ...library,
          artists: [...library.artists, newArtist]
        };
        setLibrary(updatedLibrary);
      }

      setNewArtistName('');
      setIsAddingArtist(false);
    } catch (error) {
      console.error('Failed to add artist:', error);
      alert('Failed to add artist. Please try again.');
    }
  };

  // Adding new album
  const handleAddAlbum = async () => {
    if (!newAlbumName.trim() || !selectedArtist) return;

    try {
      if (isGoogleDriveConnected) {
        // Use modern service API
        await GoogleDriveServiceModern.addAlbum(library, selectedArtist.name, newAlbumName.trim());
        
        // Reload library to get updated data
        await loadLibraryFromDrive();
      } else {
        // Local mock data update
        const newAlbum = {
          name: newAlbumName.trim(),
          songs: []
        };
        
        const updatedLibrary = { ...library };
        const artistIndex = updatedLibrary.artists.findIndex(a => a.name === selectedArtist.name);
        if (artistIndex !== -1) {
          updatedLibrary.artists[artistIndex].albums.push(newAlbum);
          setLibrary(updatedLibrary);
        }
      }

      setNewAlbumName('');
      setIsAddingAlbum(false);
    } catch (error) {
      console.error('Failed to add album:', error);
      alert('Failed to add album. Please try again.');
    }
  };

  // Adding new song
  const handleAddSong = async () => {
    if (!newSongName.trim() || !selectedArtist || !selectedAlbum) return;

    try {
      const songData = {
        name: newSongName.trim(),
        chords: '',
        lyrics: '',
        notes: ''
      };

      if (isGoogleDriveConnected) {
        // Use modern service API
        await GoogleDriveServiceModern.addSong(library, selectedArtist.name, selectedAlbum.title, songData);
        
        // Reload library to get updated data
        await loadLibraryFromDrive();
      } else {
        // Local mock data update
        const newSong = {
          ...songData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const updatedLibrary = { ...library };
        const artistIndex = updatedLibrary.artists.findIndex(a => a.name === selectedArtist.name);
        if (artistIndex !== -1) {
          const albumIndex = updatedLibrary.artists[artistIndex].albums.findIndex(a => a.title === selectedAlbum.title);
          if (albumIndex !== -1) {
            updatedLibrary.artists[artistIndex].albums[albumIndex].songs.push(newSong);
            setLibrary(updatedLibrary);
          }
        }
      }

      setNewSongName('');
      setIsAddingSong(false);
    } catch (error) {
      console.error('Failed to add song:', error);
      alert('Failed to add song. Please try again.');
    }
  };

  // Updating existing song
  const handleSongUpdate = async (artistName, albumName, songName, updatedSongData) => {
    try {
      if (isGoogleDriveConnected) {
        // Use modern service API
        await GoogleDriveServiceModern.updateSong(library, artistName, albumName, songName, updatedSongData);
        
        // Reload library to get updated data
        await loadLibraryFromDrive();
      } else {
        // Local mock data update
        const updatedLibrary = { ...library };
        const artist = updatedLibrary.artists.find(a => a.name === artistName);
        if (artist) {
          const album = artist.albums.find(a => a.name === albumName);
          if (album) {
            const song = album.songs.find(s => s.name === songName);
            if (song) {
              Object.assign(song, updatedSongData, { 
                updatedAt: new Date().toISOString() 
              });
              setLibrary(updatedLibrary);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to update song:', error);
      alert('Failed to save song changes. Please try again.');
    }
  };

  // Navigation handlers remain the same
  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setSelectedSong(null);
    navigate(`/songs/${encodeURIComponent(artist.name)}`);
  };

  const handleAlbumSelect = (album) => {
    setSelectedAlbum(album);
    setSelectedSong(null);
    navigate(`/songs/${encodeURIComponent(selectedArtist.name)}/${encodeURIComponent(album.title)}`);
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    navigate(`/songs/${encodeURIComponent(selectedArtist.name)}/${encodeURIComponent(selectedAlbum.title)}/${encodeURIComponent(song.title)}`);
  };

  const handleBackToArtists = () => {
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSelectedSong(null);
    navigate('/songs');
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setSelectedSong(null);
    navigate(`/songs/${encodeURIComponent(selectedArtist.name)}`);
  };

  const handleBackToSongs = () => {
    setSelectedSong(null);
    navigate(`/songs/${encodeURIComponent(selectedArtist.name)}/${encodeURIComponent(selectedAlbum.title)}`);
  };

  // Rest of the component remains the same...
  // (JSX render logic, useEffect for URL params, etc.)

  return (
    <div className="song-tabs-app">
      {/* Google Drive Connection Status */}
      <div className="google-drive-status">
        {isGoogleDriveConnected ? (
          <div className="connected">
            <span className="status-text">Connected to Google Drive ({userEmail})</span>
            <button onClick={handleGoogleDriveDisconnect} className="disconnect-btn">
              Disconnect
            </button>
          </div>
        ) : (
          <div className="disconnected">
            <span className="status-text">Not connected to Google Drive</span>
            <button onClick={handleGoogleDriveConnect} className="connect-btn" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect to Google Drive'}
            </button>
          </div>
        )}
      </div>

      {/* Edit Mode Toggle */}
      <div className="edit-controls">
        <label className="edit-toggle">
          <Switch
            checked={editingEnabled}
            onChange={setEditingEnabled}
            checkedChildren={<FaUnlock />}
            unCheckedChildren={<FaLock />}
          />
          <span className="edit-label">
            {editingEnabled ? 'Editing Enabled' : 'Read Only'}
          </span>
        </label>
      </div>

      {/* Main Content */}
      <div className="song-tabs-content">
        {isLoading && <div className="loading">Loading...</div>}
        
        {!selectedArtist && (
          <ArtistList
            artists={library.artists}
            onArtistSelect={handleArtistSelect}
            editingEnabled={editingEnabled}
            isAddingArtist={isAddingArtist}
            setIsAddingArtist={setIsAddingArtist}
            newArtistName={newArtistName}
            setNewArtistName={setNewArtistName}
            onAddArtist={handleAddArtist}
            newArtistInputRef={newArtistInputRef}
          />
        )}

        {selectedArtist && !selectedAlbum && (
          <AlbumList
            artist={selectedArtist}
            albums={selectedArtist.albums}
            onAlbumSelect={handleAlbumSelect}
            onBack={handleBackToArtists}
            editingEnabled={editingEnabled}
            isAddingAlbum={isAddingAlbum}
            setIsAddingAlbum={setIsAddingAlbum}
            newAlbumName={newAlbumName}
            setNewAlbumName={setNewAlbumName}
            onAddAlbum={handleAddAlbum}
            newAlbumInputRef={newAlbumInputRef}
          />
        )}

        {selectedArtist && selectedAlbum && !selectedSong && (
          <SongList
            artist={selectedArtist}
            album={selectedAlbum}
            songs={selectedAlbum.songs}
            onSongSelect={handleSongSelect}
            onBack={handleBackToAlbums}
            editingEnabled={editingEnabled}
            isAddingSong={isAddingSong}
            setIsAddingSong={setIsAddingSong}
            newSongName={newSongName}
            setNewSongName={setNewSongName}
            onAddSong={handleAddSong}
            newSongInputRef={newSongInputRef}
          />
        )}

        {selectedSong && (
          <SongDetail
            song={selectedSong}
            artist={selectedArtist}
            album={selectedAlbum}
            onBack={handleBackToSongs}
            editingEnabled={editingEnabled}
            onSongUpdate={handleSongUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default SongTabsApp;
