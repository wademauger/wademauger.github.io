import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArtistList from './components/ArtistList';
import AlbumList from './components/AlbumList';
import SongDetail from './components/SongDetail';
import ChordChart from './components/ChordChart';
import GoogleDriveService from './services/GoogleDriveService';
import './styles/SongTabsApp.css';

const SongTabsApp = () => {
  const [library, setLibrary] = useState({ artists: [] });
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [instrument, setInstrument] = useState('ukulele');
  const [pinnedChords, setPinnedChords] = useState([]);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { artistName, albumName, songTitle } = useParams();
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
        setIsGoogleDriveConnected(GoogleDriveService.isSignedIn);

        if (GoogleDriveService.isSignedIn) {
          setUserEmail(GoogleDriveService.getUserEmail());
          await loadLibraryFromDrive();
        } else {
          // Load mock data if not connected
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
          name: 'test',
          albums: [
            {
              title: 'test',
              songs: [
                {
                  title: 'test',
                  chords: ['A', 'B', 'C', 'D7'],
                  lyrics: [
                    "1234567890 [Cmaj7]0987654321",
                    "[Cmaj7]1234567890 [Cmaj7]0987654321",
                    "[Cmaj7]12345 [Cmaj7]67890 [Cmaj7]12345 [Cmaj7]67890",
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

            if (songTitle) {
              const song = album.songs.find(s => s.title === decodeURIComponent(songTitle));
              if (song) {
                setSelectedSong(song);
              }
            }
          }
        }
      }
    }
  }, [artistName, albumName, songTitle, library]);

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

  const handleInstrumentChange = (newInstrument) => {
    setInstrument(newInstrument);
  };

  const handlePinChord = (chord) => {
    if (!pinnedChords.includes(chord)) {
      setPinnedChords([...pinnedChords, chord]);
    }
  };

  const handleUnpinChord = (chord) => {
    setPinnedChords(pinnedChords.filter(c => c !== chord));
  };

  return (
    <div className="song-tabs-app">
      <div className="app-header">
        <h1>Song Tabs</h1>
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
          <div className="instrument-selector">
            <label htmlFor="instrument-select">Instrument:</label>
            <select
              id="instrument-select"
              value={instrument}
              onChange={(e) => handleInstrumentChange(e.target.value)}
            >
              <option value="ukulele">Ukulele</option>
              <option value="guitar">Guitar</option>
              <option value="piano">Piano</option>
            </select>
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
          <h2>Artists</h2>
          <ArtistList
            artists={library.artists}
            selectedArtist={selectedArtist}
            onSelectArtist={handleArtistSelect}
          />
        </div>

        {selectedArtist && (
          <div className="navigation-column">
            <h2>Albums</h2>
            <AlbumList
              albums={selectedArtist.albums}
              selectedAlbum={selectedAlbum}
              onSelectAlbum={handleAlbumSelect}
            />
          </div>
        )}

        {selectedAlbum && (
          <div className="navigation-column">
            <h2>Songs</h2>
            <ul className="song-list">
              {selectedAlbum.songs.map(song => (
                <li
                  key={song.id}
                  className={selectedSong?.id === song.id ? 'active' : ''}
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
            instrument={instrument}
            onPinChord={handlePinChord}
          />
        </div>
      )}

      {pinnedChords.length > 0 && (
        <div className="pinned-chords">
          <h3>Pinned Chords</h3>
          <div className="chord-container">
            {pinnedChords.map(chord => (
              <div key={chord} className="pinned-chord">
                <ChordChart
                  chord={chord}
                  instrument={instrument}
                  small={true}
                />
                <button
                  className="unpin-button"
                  onClick={() => handleUnpinChord(chord)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongTabsApp;
