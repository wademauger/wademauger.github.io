// Simplified SongTabsApp.js using TreeSelect and modal for adding songs with Redux state management
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pinChord, loadChordFingerings } from '../../store/chordsSlice';
import {
  loadLibraryFromDrive,
  updateSong,
  setSelectedSong,
  setGoogleDriveConnection,
  setUserInfo,
  clearError,
  loadMockLibrary,
  addSong,
  addArtist,
  addAlbum,
  deleteSong
} from '../../store/songsSlice';
import SongDetail from './components/SongDetail';
import AlbumArt from './components/AlbumArt';
import SongEditor from './components/SongEditor';
import SongListTest from './components/SongListTest';
import GoogleSignInButton from './components/GoogleSignInButton';
import SessionTestingTools from './components/SessionTestingTools';
import GoogleDriveServiceModern from './services/GoogleDriveServiceModern';
import './styles/SongTabsApp.css';
import { Button, Spin, App, Popconfirm } from 'antd';

const SongTabsApp = () => {
  const { message } = App.useApp();

  // Developer flag to enable session testing tools
  // Set this to true when you need to test session expiry scenarios
  // The testing tools will only appear in development mode when this flag is true
  const ENABLE_SESSION_TESTING = false; // Change to true to enable testing tools

  // Redux state
  const dispatch = useDispatch();
  const {
    library,
    selectedSong,
    isGoogleDriveConnected,
    userInfo,
    isLoading,
    error
  } = useSelector(state => state.songs);

  // Local component state for UI interactions only
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [isCreatingNewSong, setIsCreatingNewSong] = useState(false);

  // Helper function to count total songs in library
  const getTotalSongsCount = useCallback(() => {
    if (!library || !library.artists) return 0;
    return library.artists.reduce((total, artist) => {
      return total + artist.albums.reduce((albumTotal, album) => {
        return albumTotal + (album.songs ? album.songs.length : 0);
      }, 0);
    }, 0);
  }, [library]);

  // Redux-based handlers
  const handleLoadMockLibrary = useCallback(() => {
    dispatch(loadMockLibrary());
  }, [dispatch]);

  const handleLoadLibraryFromDrive = useCallback(async () => {
    try {
      await dispatch(loadLibraryFromDrive()).unwrap();
      console.log('Library loaded from Google Drive');
    } catch (error) {
      console.error('Failed to load library from Google Drive:', error);

      // Detailed error analysis
      let errorMessage = 'Failed to load library from Google Drive';

      if (typeof error === 'string') {
        if (error.includes('User not signed in')) {
          errorMessage = 'Please sign in to Google Drive to access your music library';
        } else if (error.includes('JSON')) {
          errorMessage = 'Invalid JSON format in Google Drive library file';
        } else if (error.includes('401')) {
          errorMessage = 'Google Drive authentication expired - please sign in again';
        } else if (error.includes('403')) {
          errorMessage = 'Access denied to Google Drive - check permissions';
        } else if (error.includes('404')) {
          errorMessage = 'Library file not found in Google Drive - will create new one';
        } else if (error.includes('500')) {
          errorMessage = 'Google Drive server error - try again later';
        } else if (error.includes('Network Error') || error.includes('Failed to fetch')) {
          errorMessage = 'Network error - check your internet connection';
        } else {
          errorMessage = `Google Drive error: ${error}`;
        }
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }

      console.error('Detailed error info:', {
        errorType: typeof error,
        errorMessage: error?.message || error,
        errorStack: error?.stack,
        timestamp: new Date().toISOString()
      });

      // Check if this is an authentication error
      if (isAuthError(error) || errorMessage.includes('sign in') || errorMessage.includes('authentication')) {
        message.error(errorMessage);
        dispatch(setGoogleDriveConnection(false));
        dispatch(setUserInfo(null));
      } else {
        message.error(errorMessage);
      }

      // Fall back to mock library
      dispatch(loadMockLibrary());
    }
  }, [dispatch, message]);

  // Simplified song update handler using Redux
  const handleSongUpdate = async (updatedSongData) => {
    if (!selectedSong) return;

    try {
      const artistName = selectedSong.artist.name;
      const albumTitle = selectedSong.album.title; // Use consistent property name
      const songTitle = selectedSong.title;

      await dispatch(updateSong({
        artistName,
        albumTitle,
        songTitle,
        updatedSongData,
        isGoogleDriveConnected
      })).unwrap();

      message.success('Song updated successfully');
    } catch (error) {
      console.error('Failed to update song:', error);

      // Check if this is an authentication error
      if (isAuthError(error)) {
        // Update UI state to reflect that user is no longer authenticated
        dispatch(setGoogleDriveConnection(false));
        dispatch(setUserInfo(null));

        message.error('Your Google Drive session has expired. Please sign in again to save changes.');
      } else {
        message.error('Failed to save song changes. Please try again.');
      }
    }
  };

  // Handler for song updates from the editor (exits editing mode on success)
  const handleSongEditorSave = async (updatedSongData, newMetadata = null) => {
    if (!selectedSong) return;

    try {
      // Use original metadata unless new metadata is provided
      const artistName = newMetadata?.artist || selectedSong.artist.name;
      const albumTitle = newMetadata?.album || selectedSong.album.title;
      const songTitle = updatedSongData.title || selectedSong.title;

      await dispatch(updateSong({
        artistName: selectedSong.artist.name, // Original location for deletion
        albumTitle: selectedSong.album.title, // Original location for deletion
        songTitle: selectedSong.title, // Original song title for deletion
        updatedSongData,
        newArtistName: artistName, // New location if different
        newAlbumTitle: albumTitle, // New location if different
        newSongTitle: songTitle, // New song title if different
        isGoogleDriveConnected
      })).unwrap();

      message.success('Song updated successfully');
      setIsEditingSong(false); // Exit editing mode after successful save
    } catch (error) {
      console.error('Failed to update song:', error);

      // Check if this is an authentication error
      if (isAuthError(error)) {
        // Update UI state to reflect that user is no longer authenticated
        dispatch(setGoogleDriveConnection(false));
        dispatch(setUserInfo(null));

        message.error('Your Google Drive session has expired. Please sign in again to save changes.');
      } else {
        message.error('Failed to save song changes. Please try again.');
      }
    }
  };

  // Initialize Google Drive API
  useEffect(() => {
    const initGoogleDrive = async () => {
      try {
        const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!CLIENT_ID) {
          throw new Error('Google Client ID not found in environment variables');
        }

        await GoogleDriveServiceModern.initialize(CLIENT_ID);
        const signInStatus = GoogleDriveServiceModern.getSignInStatus();

        if (signInStatus.isSignedIn) {
          dispatch(setGoogleDriveConnection(true));
          dispatch(setUserInfo({
            email: signInStatus.userEmail,
            name: signInStatus.userName,
            picture: signInStatus.userPicture
          }));
          console.log('Restored user session for:', signInStatus.userEmail);
          await handleLoadLibraryFromDrive();
        } else {
          console.debug('No valid session found, using mock library');
          handleLoadMockLibrary();
        }
      } catch (error) {
        console.error('Failed to initialize Google Drive:', error);
        handleLoadMockLibrary();
      }
    };

    initGoogleDrive();
  }, [dispatch, handleLoadLibraryFromDrive, handleLoadMockLibrary]);

  // Google Drive handlers
  const handleGoogleSignInSuccess = async (tokenResponse) => {
    try {
      await GoogleDriveServiceModern.handleOAuthToken(tokenResponse);
      const signInStatus = GoogleDriveServiceModern.getSignInStatus();

      dispatch(setGoogleDriveConnection(true));
      dispatch(setUserInfo({
        email: signInStatus.userEmail,
        name: signInStatus.userName,
        picture: signInStatus.userPicture
      }));

      await handleLoadLibraryFromDrive();
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      message.error('Failed to connect to Google Drive. Please try again.');
    }
  };

  const handleGoogleSignInError = (error) => {
    console.error('Google Sign-In error:', error);
    message.error('Failed to sign in with Google. Please try again.');
  };

  const handleGoogleSignOut = async () => {
    try {
      await GoogleDriveServiceModern.signOut();
      dispatch(setGoogleDriveConnection(false));
      dispatch(setUserInfo(null));
      handleLoadMockLibrary();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Ref for lyrics section in SongEditor
  const lyricsSectionRef = React.useRef(null);

  // Handle song selection from SongList
  const handleSongSelect = React.useCallback((songData, artistName, albumTitle) => {
    if (songData && artistName && albumTitle) {
      // Create normalized song object for Redux
      const normalizedSong = {
        ...songData,
        title: songData.title,
        artist: { name: artistName },
        album: { title: albumTitle }
      };
      dispatch(setSelectedSong(normalizedSong));

      // Scroll to lyrics section after selecting song
      setTimeout(() => {
        if (lyricsSectionRef.current) {
          lyricsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);

      // Load chord fingerings if they exist in the song data
      if (songData.chordFingerings) {
        dispatch(loadChordFingerings(songData.chordFingerings));
      } else {
        // Clear chord fingerings if song doesn't have any saved
        dispatch(loadChordFingerings({}));
      }
    }
  }, [dispatch]);

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
    return authErrorPatterns.some(pattern =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  // Handle chord pinning
  const handlePinChord = (chord) => {
    dispatch(pinChord(chord));
  };

  // Open new song editor
  const openNewSongEditor = () => {
    setIsCreatingNewSong(true);
  };

  // Handle new song creation using SongEditor
  const handleCreateNewSong = async (newSongData) => {
    try {
      const { title, artist, album, lyrics } = newSongData;

      // First ensure the artist exists
      const existingArtist = library.artists?.find(a => a.name === artist);

      if (!existingArtist) {
        await dispatch(addArtist({
          artistName: artist,
          isGoogleDriveConnected
        })).unwrap();
      }

      // Then ensure the album exists
      const artistAfterAdd = library.artists?.find(a => a.name === artist) || existingArtist;
      const existingAlbum = artistAfterAdd?.albums?.find(a => a.title === album);

      if (!existingAlbum) {
        await dispatch(addAlbum({
          artistName: artist,
          albumTitle: album,
          isGoogleDriveConnected
        })).unwrap();
      }

      // Finally, add the song
      await dispatch(addSong({
        artistName: artist,
        albumTitle: album,
        songData: {
          title: title,
          lyrics: lyrics || '',
          notes: '',
          chords: ''
        },
        isGoogleDriveConnected
      })).unwrap();

      // Reload library to get updated data
      const finalLibrary = await dispatch(loadLibraryFromDrive()).unwrap();

      // Auto-select the new song
      const newArtist = finalLibrary.artists?.find(a => a.name === artist);
      const newAlbum = newArtist?.albums?.find(a => a.title === album);
      const newSong = newAlbum?.songs?.find(s => s.title === title);

      if (newSong) {
        handleSongSelect(newSong, artist, album);
      }

      // Close the new song editor
      setIsCreatingNewSong(false);

      message.success('Song created successfully!');
    } catch (error) {
      console.error('Failed to create song:', error);
      message.error('Failed to create song. Please try again.');
    }
  };

  // Handle song deletion
  const handleDeleteSong = async () => {
    try {
      await dispatch(deleteSong({
        artistName: selectedSong.artist?.name,
        albumTitle: selectedSong.album?.title,
        songTitle: selectedSong.title,
        isGoogleDriveConnected
      })).unwrap();

      // Clear selected song since it was deleted
      dispatch(setSelectedSong(null));
      
      message.success('Song deleted successfully!');
    } catch (error) {
      console.error('Failed to delete song:', error);
      message.error('Failed to delete song. Please try again.');
    }
  };

  return (
    <div className="song-tabs-app">
      {/* Main Content - Vertical Stack Layout */}
      <div className="songs-content-vertical" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        margin: (isEditingSong || isCreatingNewSong) ? '0' : '0 auto',
        width: (isEditingSong || isCreatingNewSong) ? '100%' : 'auto',
        maxWidth: (isEditingSong || isCreatingNewSong) ? 'none' : '1200px'
      }}>
        {/* Selected Song Content - Show First When Song is Selected */}
        {selectedSong && (
          <div className="selected-song-section" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            width: '100%',
            minHeight: 'fit-content'
          }}>
            {isEditingSong ? (
              <SongEditor
                song={selectedSong}
                artist={selectedSong.artist}
                album={selectedSong.album}
                onSave={handleSongEditorSave}
                onCancel={() => setIsEditingSong(false)}
                isGoogleDriveConnected={isGoogleDriveConnected}
                lyricsRef={lyricsSectionRef}
              />
            ) : (
              <div style={{ width: '100%' }}>
                {/* Song View Header with Google Drive, Edit, and Add Buttons */}
                <div className="song-view-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  gap: '1rem'
                }}>
                  <AlbumArt artist={selectedSong.artist?.name} album={selectedSong.album?.title} />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h2 style={{ margin: 0 }}>{selectedSong.title}</h2>
                      {isGoogleDriveConnected && (
                        <>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => setIsEditingSong(true)}
                            style={{
                              color: '#666',
                              padding: '4px',
                              minWidth: 'auto',
                              height: 'auto',
                              fontSize: '16px'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                            onMouseLeave={(e) => e.target.style.color = '#666'}
                            title="Edit Song"
                          >
                            ✏️
                          </Button>
                          <Popconfirm
                            title="Delete Song"
                            description={`Are you sure you want to delete "${selectedSong.title}"? This action cannot be undone.`}
                            onConfirm={handleDeleteSong}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okType="danger"
                          >
                            <Button
                              type="text"
                              size="small"
                              style={{
                                color: '#666',
                                padding: '4px',
                                minWidth: 'auto',
                                height: 'auto',
                                fontSize: '16px'
                              }}
                              onMouseEnter={(e) => e.target.style.color = '#ff4d4f'}
                              onMouseLeave={(e) => e.target.style.color = '#666'}
                              title="Delete Song"
                            >
                              🗑️
                            </Button>
                          </Popconfirm>
                        </>
                      )}
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>
                      {selectedSong.artist?.name} - {selectedSong.album?.title}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {/* Go to Library Button */}
                    <Button
                      onClick={() => {
                        const librarySection = document.querySelector('.song-library-section');
                        if (librarySection) {
                          librarySection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      style={{
                        backgroundColor: '#f0f0f0',
                        borderColor: '#d9d9d9',
                        color: '#333'
                      }}
                    >
                      📚 Scroll to Song Library
                    </Button>
                  </div>
                </div>

                <div style={{ width: '100%', minHeight: 'fit-content' }}>
                  <SongDetail
                    song={selectedSong}
                    artist={selectedSong.artist}
                    album={selectedSong.album}
                    editingEnabled={false}
                    onUpdateSong={handleSongUpdate}
                    onPinChord={handlePinChord}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Song Creation Section */}
        {isCreatingNewSong && (
          <div className="new-song-section" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            width: '100%',
            minHeight: 'fit-content'
          }}>
            <SongEditor
              song={{ lyrics: '' }}
              artist={{ name: '' }}
              album={{ title: '' }}
              onSave={handleCreateNewSong}
              onCancel={() => setIsCreatingNewSong(false)}
              isGoogleDriveConnected={isGoogleDriveConnected}
              isNewSong={true}
              library={library}
            />
          </div>
        )}

        {/* Song Library - Show Only When Not Editing and Not Creating */}
        {!isEditingSong && !isCreatingNewSong && (
          <div className="song-library-section" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '1rem',
            minHeight: selectedSong ? '300px' : '500px'
          }}>
            {/* Library Header with Count and Google Drive Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div>
                <h3 style={{ margin: 0 }}>Song Library</h3>
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <Spin size="small" />
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>Loading songs...</span>
                  </div>
                ) : (
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                    {getTotalSongsCount()} {getTotalSongsCount() === 1 ? 'song' : 'songs'} in library
                  </p>
                )}
              </div>

              {/* Always show Google Drive button and Add Song button */}
              <div className="google-drive-section">
                {isGoogleDriveConnected ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <GoogleSignInButton
                      isSignedIn={true}
                      onSignOut={handleGoogleSignOut}
                      disabled={isLoading}
                      userInfo={userInfo}
                    />
                    <Button
                      type="primary"
                      onClick={openNewSongEditor}
                      style={{
                        backgroundColor: '#4CAF50',
                        borderColor: '#4CAF50'
                      }}
                    >
                      + Add New Song
                    </Button>
                  </div>
                ) : (
                  <GoogleSignInButton
                    onSuccess={handleGoogleSignInSuccess}
                    onError={handleGoogleSignInError}
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>

            <SongListTest
              library={library}
              onSelectSong={handleSongSelect}
              selectedSong={selectedSong}
              editingEnabled={isGoogleDriveConnected}
            />
          </div>
        )}

        {/* Empty State - Only Show When No Song Selected and Not Creating New Song */}
        {!selectedSong && !isCreatingNewSong && (
          <div className="empty-state" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            textAlign: 'center',
            color: '#666'
          }}>
            <p>Select a song from your library above to see its chord chart and lyrics.</p>
          </div>
        )}
      </div>

      {/* Session Testing Tools - Development Only 
          To enable: Set ENABLE_SESSION_TESTING to true at the top of this component */}
      {/* Temporarily disabled SessionTestingTools due to Ant Design/MUI conflicts
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
          <SessionTestingTools 
            googleDriveService={GoogleDriveServiceModern}
            enabled={ENABLE_SESSION_TESTING}
          />
        </div>
      )}
      */}

      {/* Display Redux errors */}
      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          Error: {error}
          <Button
            size="small"
            onClick={() => dispatch(clearError())}
            style={{ marginLeft: '0.5rem' }}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
};

// Wrap component with App provider for message API
const SongTabsAppWithProvider = () => (
  <App>
    <SongTabsApp />
  </App>
);

export default SongTabsAppWithProvider;
