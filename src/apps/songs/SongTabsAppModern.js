// Simplified SongTabsApp.js using TreeSelect and modal for adding songs with Redux state management
import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pinChord, loadChordFingerings } from '../../store/chordsSlice';
import { 
  loadLibraryFromDrive, 
  updateSong, 
  setSelectedSong, 
  setGoogleDriveConnection,
  setUserInfo,
  setEditingEnabled,
  clearError,
  loadMockLibrary
} from '../../store/songsSlice';
import SongDetail from './components/SongDetail';
import SongListTest from './components/SongListTest';
import GoogleSignInButton from './components/GoogleSignInButton';
import SessionTestingTools from './components/SessionTestingTools';
import GoogleDriveServiceModern from './services/GoogleDriveServiceModern';
import './styles/SongTabsApp.css';
import { Switch, Button, Spin, App } from 'antd';
import { FaUnlock, FaLock } from 'react-icons/fa';

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
    editingEnabled,
    error
  } = useSelector(state => state.songs);
  
  // Local component state for UI interactions only
  // Note: Modal removed - using inline editing with RichTreeView

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
      
      // Check if this is an authentication error
      if (isAuthError(error)) {
        message.error('Your Google Drive session has expired. Please sign in again.');
        dispatch(setGoogleDriveConnection(false));
        dispatch(setUserInfo(null));
      } else {
        message.error('Failed to load library from Google Drive');
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

  // Handle song selection from SongList
  const handleSongSelect = useCallback((songData, artistName, albumTitle) => {
    if (songData && artistName && albumTitle) {
      // Create normalized song object for Redux
      const normalizedSong = {
        ...songData,
        title: songData.title,
        artist: { name: artistName },
        album: { title: albumTitle }
      };
      dispatch(setSelectedSong(normalizedSong));
      
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

  // Handle editing toggle
  const handleEditingToggle = (enabled) => {
    dispatch(setEditingEnabled(enabled));
  };

  return (
    <div className="song-tabs-app">
      {/* Header with Edit Toggle, Library Count, and Sign-in Button */}
      <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        {/* Edit Mode Toggle - Left side */}
        <div className="edit-controls">
          <label className="edit-toggle">
            <Switch
              checked={editingEnabled}
              onChange={handleEditingToggle}
              checkedChildren={<FaUnlock />}
              unCheckedChildren={<FaLock />}
            />
            <span className="edit-label">
              {editingEnabled ? 'Editing Enabled' : 'Read Only'}
            </span>
          </label>
        </div>

        {/* Library Count - Center */}
        <div className="library-status-header">
          {isLoading ? (
            <div className="loading-indicator-header">
              <Spin size="small" />
              <span className="loading-text-header">Loading songs...</span>
            </div>
          ) : (
            <span className="library-count-header">
              {getTotalSongsCount()} {getTotalSongsCount() === 1 ? 'song' : 'songs'} in library
            </span>
          )}
        </div>

        {/* Google Drive Sign-in - Right side */}
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
            />
          )}
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="songs-content">
        <SongListTest 
          library={library}
          onSelectSong={handleSongSelect}
          selectedSong={selectedSong}
          editingEnabled={editingEnabled}
        />

        {selectedSong ? (
          <SongDetail
            song={selectedSong}
            artist={selectedSong.artist}
            album={selectedSong.album}
            editingEnabled={editingEnabled}
            onUpdateSong={handleSongUpdate}
            onPinChord={handlePinChord}
          />
        ) : (
          <div className="empty-state">
            <p>Select a song to see its chord chart, or toggle the edit lock to add and edit songs in your Google Drive library.</p>
            {!isGoogleDriveConnected && (
              <p style={{ color: '#666', fontSize: '0.9em' }}>
                Sign in to Google Drive to access your saved songs, or use the mock library to get started.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Session Testing Tools - Development Only 
          To enable: Set ENABLE_SESSION_TESTING to true at the top of this component */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
          <SessionTestingTools 
            googleDriveService={GoogleDriveServiceModern}
            enabled={ENABLE_SESSION_TESTING}
          />
        </div>
      )}

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
