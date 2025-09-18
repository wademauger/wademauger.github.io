import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { pinChord, setTranspose } from '../../store/chordsSlice';
import ArtistList from './components/ArtistList';
import AlbumList from './components/AlbumList';
import SongDetail from './components/SongDetail';
import GoogleSignInButton from './components/GoogleSignInButton';
import GoogleDriveServiceModern from './services/GoogleDriveServiceModern';
import AddSongModal from '../../components/AddSongModal';
import './styles/SongTabsApp.css';
import { Switch, Spin } from 'antd';
import { FaUnlock, FaLock } from 'react-icons/fa';

const SongTabsApp = () => {
  const [library, setLibrary] = useState({ artists: [] });
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // Store full user info instead of just email
  const [isLoading, setIsLoading] = useState(false);
  const [editingEnabled, setEditingEnabled] = useState(false);

  // Redux state
  const dispatch = useDispatch();
  const instrument = useSelector((state) => state.chords.currentInstrument);

  // New state variables for adding entries
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [isAddingAlbum, setIsAddingAlbum] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  // Refs for input focus
  const newArtistInputRef = useRef(null);
  const newAlbumInputRef = useRef(null);

  const { artistName, albumTitle, songTitle } = useParams();
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
          setUserInfo({
            email: GoogleDriveServiceModern.userEmail,
            name: GoogleDriveServiceModern.userName,
            picture: GoogleDriveServiceModern.userPicture
          });
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
                  ].join('\n'),
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
    } catch (error) {
      console.error('Failed to load library from Google Drive:', error);
      
      // Handle authentication errors specifically
      if (error.message === 'User not signed in to Google Drive') {
        console.debug('User not authenticated, switching to mock library');
        setIsGoogleDriveConnected(false);
        setUserInfo(null);
      }
      
      loadMockLibrary();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDriveConnect = async () => {
    setIsLoading(true);
    try {
      await GoogleDriveServiceModern.signIn();
      setIsGoogleDriveConnected(true);
      setUserInfo({
        email: GoogleDriveServiceModern.userEmail,
        name: GoogleDriveServiceModern.userName,
        picture: GoogleDriveServiceModern.userPicture
      });
      await loadLibraryFromDrive();
    } catch (error) {
      console.error('Failed to connect to Google Drive:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDriveDisconnect = async () => {
    try {
      await GoogleDriveServiceModern.signOut();
      setIsGoogleDriveConnected(false);
      setUserInfo(null);
      loadMockLibrary();
    } catch (error) {
      console.error('Failed to disconnect from Google Drive:', error);
    }
  };

  // Handler for Google Sign-In button success
  const handleGoogleSignInSuccess = async (tokenResponse) => {
    setIsLoading(true);
    try {
      // Use the modern service to handle the OAuth token
      await GoogleDriveServiceModern.handleOAuthToken(tokenResponse);
      
      setIsGoogleDriveConnected(true);
      setUserInfo({
        email: GoogleDriveServiceModern.userEmail,
        name: GoogleDriveServiceModern.userName,
        picture: GoogleDriveServiceModern.userPicture
      });
      
      // Load library after successful authentication
      await loadLibraryFromDrive();
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      alert('Failed to connect to Google Drive. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Google Sign-In button error
  const handleGoogleSignInError = (error) => {
    console.error('Google Sign-In error:', error);
    alert('Failed to sign in with Google. Please try again.');
  };

  // Handler for Google Sign-Out
  const handleGoogleSignOut = async () => {
    try {
      await GoogleDriveServiceModern.signOut();
      setIsGoogleDriveConnected(false);
      setUserInfo(null);
      loadMockLibrary();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Handle URL parameter changes
  useEffect(() => {
    if (artistName && library.artists.length) {
      const artist = library.artists.find(a => a.name === decodeURIComponent(artistName));
      if (artist) {
        setSelectedArtist(artist);

        if (albumTitle) {
          const album = artist.albums.find(a => a.title === decodeURIComponent(albumTitle));
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
  }, [artistName, albumTitle, songTitle, library]);

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setSelectedSong(null);
    navigate(`/crafts/tabs/artist/${encodeURIComponent(artist.name)}`);
  };

  const handleAlbumSelect = (album) => {
    setSelectedAlbum(album);
    setSelectedSong(null);
    navigate(`/crafts/tabs/artist/${encodeURIComponent(selectedArtist.name)}/album/${encodeURIComponent(album.title)}`);
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    navigate(`/crafts/tabs/artist/${encodeURIComponent(selectedArtist.name)}/album/${encodeURIComponent(selectedAlbum.title)}/song/${encodeURIComponent(song.title)}`);
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
        // Load current library first
        const currentLibrary = await GoogleDriveServiceModern.loadLibrary();
        
        // Update song using the modern service - find by names instead of IDs
        const artist = currentLibrary.artists.find(a => a.name === selectedArtist.name);
        const album = artist?.albums.find(a => a.title === selectedAlbum.title);
        const song = album?.songs.find(s => s.title === selectedSong.title);
        
        if (song) {
          // Update the song data
          Object.assign(song, updatedSong, { updatedAt: new Date().toISOString() });
          await GoogleDriveServiceModern.saveLibrary(currentLibrary);
        }
        
        // Reload the library to get the updated data
        const updatedLibrary = await GoogleDriveServiceModern.loadLibrary();
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

        // Update the song with proper timestamp
        const songWithTimestamp = {
          ...updatedSong,
          updatedAt: new Date().toISOString()
        };
        
        updatedLibrary.artists[artistIndex].albums[albumIndex].songs[songIndex] = songWithTimestamp;
        setLibrary(updatedLibrary);
        setSelectedSong(songWithTimestamp);
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
    setNewAlbumTitle('');
    // Focus will be set with useEffect
  };

  const startAddingSong = () => {
    setIsAddModalOpen(true);
  };

  // Handle adding new artist
  const handleAddArtist = async () => {
    if (newArtistName.trim()) {
      const tempArtist = {
        name: newArtistName.trim(),
        albums: [],
        isOptimistic: true
      };

      // Optimistic update
      setLibrary(prevLibrary => ({
        ...prevLibrary,
        artists: [...prevLibrary.artists, tempArtist]
      }));
      setIsAddingArtist(false);
      setNewArtistName('');

      try {
        if (isGoogleDriveConnected) {
          // Load current library first
          const currentLibrary = await GoogleDriveServiceModern.loadLibrary();
          
          // Add artist manually since GoogleDriveServiceModern uses IDs
          const newArtist = {
            name: newArtistName.trim(),
            albums: []
          };
          currentLibrary.artists.push(newArtist);
          await GoogleDriveServiceModern.saveLibrary(currentLibrary);
          
          // Reload the library to get the updated data
          const updatedLibrary = await GoogleDriveServiceModern.loadLibrary();
          setLibrary(updatedLibrary);
        } else {
          // For mock library, just keep the optimistic update without ID
          setLibrary(prevLibrary => ({
            ...prevLibrary,
            artists: prevLibrary.artists.map(artist => 
              artist.isOptimistic && artist.name === tempArtist.name
                ? { ...artist, isOptimistic: undefined }
                : artist
            )
          }));
        }
      } catch (error) {
        console.error('Failed to add artist:', error);
        // Revert optimistic update
        setLibrary(prevLibrary => ({
          ...prevLibrary,
          artists: prevLibrary.artists.filter(artist => artist.name !== tempArtist.name || !artist.isOptimistic)
        }));
        // Show the input again for retry
        setIsAddingArtist(true);
        setNewArtistName(tempArtist.name);
      }
    } else {
      setIsAddingArtist(false);
    }
  };

  // Handle adding new album
  const handleAddAlbum = async () => {
    if (newAlbumTitle.trim() && selectedArtist) {
      const tempAlbum = {
        name: newAlbumTitle.trim(),
        songs: [],
        isOptimistic: true
      };

      // Optimistic update
      setLibrary(prevLibrary => {
        const updatedLibrary = { ...prevLibrary };
        const artistIndex = updatedLibrary.artists.findIndex(a => a.name === selectedArtist.name);
        if (artistIndex !== -1) {
          updatedLibrary.artists[artistIndex] = {
            ...updatedLibrary.artists[artistIndex],
            albums: [...updatedLibrary.artists[artistIndex].albums, tempAlbum]
          };
        }
        return updatedLibrary;
      });
      setIsAddingAlbum(false);
      setNewAlbumTitle('');

      try {
        if (isGoogleDriveConnected) {
          // Load current library first
          const currentLibrary = await GoogleDriveServiceModern.loadLibrary();
          
          // Add album manually since GoogleDriveServiceModern uses IDs
          const artist = currentLibrary.artists.find(a => a.name === selectedArtist.name);
          if (artist) {
            const newAlbum = {
              name: newAlbumTitle.trim(),
              songs: []
            };
            artist.albums.push(newAlbum);
            await GoogleDriveServiceModern.saveLibrary(currentLibrary);
          }
          
          // Reload the library to get the updated data
          const updatedLibrary = await GoogleDriveServiceModern.loadLibrary();
          setLibrary(updatedLibrary);
        } else {
          // For mock library, just keep the optimistic update without ID
          setLibrary(prevLibrary => {
            const updatedLibrary = { ...prevLibrary };
            const artistIndex = updatedLibrary.artists.findIndex(a => a.name === selectedArtist.name);
            if (artistIndex !== -1) {
              updatedLibrary.artists[artistIndex] = {
                ...updatedLibrary.artists[artistIndex],
                albums: updatedLibrary.artists[artistIndex].albums.map(album => 
                  album.isOptimistic && album.title === tempAlbum.title
                    ? { ...album, isOptimistic: undefined }
                    : album
                )
              };
            }
            return updatedLibrary;
          });
        }
      } catch (error) {
        console.error('Failed to add album:', error);
        // Revert optimistic update
        setLibrary(prevLibrary => {
          const updatedLibrary = { ...prevLibrary };
          const artistIndex = updatedLibrary.artists.findIndex(a => a.name === selectedArtist.name);
          if (artistIndex !== -1) {
            updatedLibrary.artists[artistIndex] = {
              ...updatedLibrary.artists[artistIndex],
              albums: updatedLibrary.artists[artistIndex].albums.filter(album => 
                !(album.title === tempAlbum.title && album.isOptimistic))
            };
          }
          return updatedLibrary;
        });
        // Show the input again for retry
        setIsAddingAlbum(true);
        setNewAlbumTitle(tempAlbum.title);
      }
    } else {
      setIsAddingAlbum(false);
    }
  };

  // Handle adding new song from modal
  const handleAddSong = async (songData) => {
    // Close modal first
    setIsAddModalOpen(false);
    
    const { title, artist: artistName, album: albumTitle, lyrics } = songData;
    
    // Find or create artist and album
    let targetArtist = library.artists.find(a => a.name === artistName);
    let targetAlbum = null;
    
    if (targetArtist) {
      targetAlbum = targetArtist.albums.find(a => a.title === albumTitle);
    }
    
    const tempSong = {
      title: title.trim(),
      chords: '',
      lyrics: lyrics || '',
      notes: '',
      isOptimistic: true
    };

    // Optimistic update - handle creating artist and/or album if needed
    setLibrary(prevLibrary => {
      const updatedLibrary = { ...prevLibrary };
      let artistIndex = updatedLibrary.artists.findIndex(a => a.name === artistName);
      
      // Create artist if it doesn't exist
      if (artistIndex === -1) {
        updatedLibrary.artists.push({
          name: artistName,
          albums: [],
          isOptimistic: true
        });
        artistIndex = updatedLibrary.artists.length - 1;
      }
      
      let albumIndex = updatedLibrary.artists[artistIndex].albums.findIndex(a => a.title === albumTitle);
      
      // Create album if it doesn't exist
      if (albumIndex === -1) {
        updatedLibrary.artists[artistIndex].albums.push({
          title: albumTitle,
          songs: [],
          isOptimistic: true
        });
        albumIndex = updatedLibrary.artists[artistIndex].albums.length - 1;
      }
      
      // Add song to album
      updatedLibrary.artists[artistIndex].albums[albumIndex] = {
        ...updatedLibrary.artists[artistIndex].albums[albumIndex],
        songs: [...updatedLibrary.artists[artistIndex].albums[albumIndex].songs, tempSong]
      };
      
      return updatedLibrary;
    });

    try {
      if (isGoogleDriveConnected) {
        // Load current library first
        const currentLibrary = await GoogleDriveServiceModern.loadLibrary();
        
        // Find or create artist
        let artist = currentLibrary.artists.find(a => a.name === artistName);
        if (!artist) {
          artist = { name: artistName, albums: [] };
          currentLibrary.artists.push(artist);
        }
        
        // Find or create album
        let album = artist.albums.find(a => a.title === albumTitle);
        if (!album) {
          album = { title: albumTitle, songs: [] };
          artist.albums.push(album);
        }
        
        // Add song
        const songDataForSave = {
          name: title.trim(),
          title: title.trim(), // Some parts of the code expect 'title'
          chords: '',
          lyrics: lyrics || '',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        album.songs.push(songDataForSave);
        await GoogleDriveServiceModern.saveLibrary(currentLibrary);
        
        // Reload the library to get the updated data
        const updatedLibrary = await GoogleDriveServiceModern.loadLibrary();
        setLibrary(updatedLibrary);
        
        // Auto-select the new song
        const newArtist = updatedLibrary.artists.find(a => a.name === artistName);
        const newAlbum = newArtist?.albums.find(a => a.title === albumTitle);
        const newSong = newAlbum?.songs.find(s => s.title === title.trim());
        
        if (newArtist && newAlbum && newSong) {
          setSelectedArtist(newArtist);
          setSelectedAlbum(newAlbum);
          setSelectedSong(newSong);
          navigate(`/crafts/tabs/artist/${encodeURIComponent(artistName)}/album/${encodeURIComponent(albumTitle)}/song/${encodeURIComponent(title.trim())}`);
        }
      } else {
        // For mock library, remove optimistic flag
        setLibrary(prevLibrary => {
          const updatedLibrary = { ...prevLibrary };
          const artistIndex = updatedLibrary.artists.findIndex(a => a.name === artistName);
          if (artistIndex !== -1) {
            const albumIndex = updatedLibrary.artists[artistIndex].albums.findIndex(a => a.title === albumTitle);
            if (albumIndex !== -1) {
              updatedLibrary.artists[artistIndex].albums[albumIndex] = {
                ...updatedLibrary.artists[artistIndex].albums[albumIndex],
                songs: updatedLibrary.artists[artistIndex].albums[albumIndex].songs.map(song => 
                  song.isOptimistic && song.title === tempSong.title
                    ? { 
                        ...song, 
                        isOptimistic: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      }
                    : song
                )
              };
              
              // Remove optimistic flags from artist and album if they were new
              if (updatedLibrary.artists[artistIndex].isOptimistic) {
                delete updatedLibrary.artists[artistIndex].isOptimistic;
              }
              if (updatedLibrary.artists[artistIndex].albums[albumIndex].isOptimistic) {
                delete updatedLibrary.artists[artistIndex].albums[albumIndex].isOptimistic;
              }
            }
          }
          return updatedLibrary;
        });
      }
    } catch (error) {
      console.error('Failed to add song:', error);
      // Revert optimistic update
      setLibrary(prevLibrary => {
        const updatedLibrary = { ...prevLibrary };
        const artistIndex = updatedLibrary.artists.findIndex(a => a.name === artistName);
        if (artistIndex !== -1) {
          const albumIndex = updatedLibrary.artists[artistIndex].albums.findIndex(a => a.title === albumTitle);
          if (albumIndex !== -1) {
            updatedLibrary.artists[artistIndex].albums[albumIndex] = {
              ...updatedLibrary.artists[artistIndex].albums[albumIndex],
              songs: updatedLibrary.artists[artistIndex].albums[albumIndex].songs.filter(song =>
                !(song.isOptimistic && song.title === tempSong.title))
            };
          }
        }
        return updatedLibrary;
      });
      // Re-open modal with the data for retry
      setIsAddModalOpen(true);
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

  // When a song is selected, if it has a transpose property, sync it to redux
  useEffect(() => {
    if (selectedSong && typeof selectedSong.transpose === 'number') {
      dispatch(setTranspose({ songTitle: selectedSong.title, value: selectedSong.transpose }));
    }
    // eslint-disable-next-line
  }, [selectedSong]);

  // Handle Google Drive authentication expiration
  useEffect(() => {
    const handleAuthExpired = () => {
      setIsGoogleDriveConnected(false);
      setUserInfo(null);
      loadMockLibrary();
      window.alert('Your Google Drive session has expired. Please sign in again.');
    };

    window.addEventListener('gdriveAuthExpired', handleAuthExpired);
    return () => {
      window.removeEventListener('gdriveAuthExpired', handleAuthExpired);
    };
  }, []);

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
          {isGoogleDriveConnected && editingEnabled && (
            <button 
              className="add-song-header-button"
              onClick={startAddingSong}
              style={{
                marginRight: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              + Add Song
            </button>
          )}
          <div className="google-drive-section">
            {isGoogleDriveConnected ? (
              <GoogleSignInButton
                isSignedIn={true}
                onSignOut={handleGoogleSignOut}
                disabled={isLoading}
                userInfo={userInfo}
              />
            ) : (
              <GoogleSignInButton
                onSuccess={handleGoogleSignInSuccess}
                onError={handleGoogleSignInError}
                disabled={isLoading}
                loading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spin size="large" tip="Loading library..." />
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
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
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
                <button className="add-button" onClick={startAddingSong}>
                  +
                </button>
              )}
            </h2>
            <ul className="song-list">
              {selectedAlbum.songs.map(song => {
                const className = [
                  selectedSong?.title === song.title ? 'active' : '',
                  song.isOptimistic ? 'optimistic' : ''
                ].filter(Boolean).join(' ');

                return (
                  <li
                    key={song.title}
                    className={className}
                    onClick={() => !song.isOptimistic && handleSongSelect(song)}
                  >
                    {song.title}
                  </li>
                );
              })}
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
      
      {/* Add Song Modal */}
      <AddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSong}
        library={library}
        selectedArtist={selectedArtist}
        selectedAlbum={selectedAlbum}
      />
      
      {/* Floating Add Song Button */}
      {isGoogleDriveConnected && editingEnabled && (
        <button
          className="floating-add-button"
          onClick={startAddingSong}
          title="Add New Song"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#45a049';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4CAF50';
            e.target.style.transform = 'scale(1)';
          }}
        >
          +
        </button>
      )}
    </div>
  );
};

export default SongTabsApp;
