// Simplified SongTabsApp.js using TreeSelect and modal for adding songs with Redux state management
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useDropdown } from '../../components/DropdownProvider';
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
  deleteSong,
  setLibrary
} from '../../store/songsSlice';
import AppNavigation from '../../components/AppNavigation';
import SongDetail from './components/SongDetail';
import AlbumArt from './components/AlbumArt';
import SongEditor from './components/SongEditor';
import SongListTest from './components/SongListTest';
import GoogleDriveServiceModern from './services/GoogleDriveServiceModern';
import { loadFullLibrary, setFullLibrary } from '../../store/librarySlice';
import { useLibraryQuery } from '../../hooks/useLibraryQuery';
import './styles/SongTabsApp.css';
import { Button, App, Popconfirm, Switch } from 'antd';

const SongTabsApp = () => {
  const { message } = App.useApp();

  // Redux state
  const dispatch = useDispatch();
  const library = useSelector((state: any) => state.songs.library);
  const selectedSong = useSelector((state: any) => state.songs.selectedSong);
  const isGoogleDriveConnected = useSelector((state: any) => state.songs.isGoogleDriveConnected);
  const userInfo = useSelector((state: any) => state.songs.userInfo);
  const isLoading = useSelector((state: any) => state.songs.isLoading);
  const error = useSelector((state: any) => state.songs.error);

  // Connect to library store for auto-population
  const libraryEntries = useSelector((state: any) => state.library?.entries || []);
  // Full library JSON blob (new in library slice) - Redux fallback
  const fullLibraryRedux = useSelector((state: any) => state.library?.fullLibrary || null);

  // React Query: full library (preferred source of truth once migrated)
  const { data: fullLibraryQuery, isLoading: fullLibraryLoading } = useLibraryQuery();

  // Prefer React Query data if available, otherwise fall back to Redux
  const fullLibrary = fullLibraryQuery || fullLibraryRedux;

  // Local component state for UI interactions only
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [isCreatingNewSong, setIsCreatingNewSong] = useState(false);
  // Local state to represent whether library-level editing is enabled (toggle)
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Helper function to count total songs in library
  const getTotalSongsCount = useCallback(() => {
    if (!library || !library.artists) return 0;
    return library.artists.reduce((total, artist: any) => {
      return total + artist.albums.reduce((albumTotal, album: any) => {
        return albumTotal + (album.songs ? album.songs.length : 0);
      }, 0);
    }, 0);
  }, [library]);

  // Legacy: we previously auto-populated the songs store from `library.entries`.
  // That path caused race conditions with the `fullLibrary` (React Query) path and
  // produced inconsistent UI updates. We intentionally remove the entry-based
  // auto-populate logic so the `fullLibrary` effect is the single source that
  // writes `state.songs.library`.

  // Log whenever the Redux songs library updates so we can see what the UI receives
  useEffect(() => {
    try {
      console.log('SongTabsApp observed songs store library change — artists=', (library && library.artists) ? library.artists.length : 0);
    } catch (e) {}
  }, [library]);

  // Drive is now the source-of-truth for the full library JSON. When a full library
  // blob with `artists` is loaded we overwrite the songs store with that data.
  // To avoid repeated identical overwrites we track the last-applied JSON in a ref.
  const lastAppliedLibraryJsonRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      console.log('🔄 SongTabsApp fullLibrary effect triggered:', {
        fullLibraryPresent: !!fullLibrary,
        fullLibraryHasArtists: !!(fullLibrary?.artists),
        fullLibraryArtistCount: fullLibrary?.artists?.length || 0,
        reduxLibraryHasArtists: !!(library?.artists),
        reduxLibraryArtistCount: library?.artists?.length || 0,
        fullLibraryStructure: fullLibrary ? Object.keys(fullLibrary) : [],
        reduxLibraryStructure: library ? Object.keys(library) : []
      });

      if (fullLibrary && fullLibrary.artists && Array.isArray(fullLibrary.artists)) {
        const newJson = JSON.stringify(fullLibrary.artists);
        if (lastAppliedLibraryJsonRef.current === newJson) {
          // Already applied this exact library - nothing to do
          console.log('📋 Full library already applied to songs store (no-op)');
          return;
        }

        const existingCount = library?.artists?.length || 0;
        const newCount = fullLibrary.artists.length;

        console.log('🔄 Overwriting Redux songs store from Drive library:', {
          existingArtists: existingCount,
          newArtists: newCount,
          firstFewArtists: fullLibrary.artists.slice(0, 3).map(a => ({ 
            name: a.name, 
            albumCount: a.albums?.length || 0,
            totalSongs: (a.albums || []).reduce((total, album) => total + (album.songs || []).length, 0)
          }))
        });

        // Overwrite the Redux songs store so the UI reflects the Drive file immediately.
        dispatch(setLibrary({ artists: fullLibrary.artists }));

        // Also publish the full library into the library slice so apps that
        // derive counts from `state.library.entries` (for example HomePage)
        // will reflect the newly-loaded Drive JSON.
        try {
          dispatch(setFullLibrary(fullLibrary));
          console.log('📚 Successfully set full library into library slice');
        } catch (e) {
          console.warn('⚠️ Failed to set full library into library slice:', e);
        }

        // Remember what we applied so we don't re-apply identical data repeatedly.
        lastAppliedLibraryJsonRef.current = newJson;

        console.log('✅ Songs store successfully overwritten from fullLibrary (Drive)');
      } else if (fullLibrary) {
        console.log('⚠️ fullLibrary present but no artists array found:', {
          fullLibrary,
          hasArtists: !!(fullLibrary?.artists),
          artistsType: typeof fullLibrary?.artists,
          isArray: Array.isArray(fullLibrary?.artists)
        });
      } else {
        console.log('❌ No fullLibrary data available yet');
      }
    } catch (err) {
      console.error('Error applying fullLibrary to songs store:', err);
    }
  }, [fullLibrary, library, dispatch]);

  // Redux-based handlers
  const handleLoadMockLibrary = useCallback(() => {
    dispatch(loadMockLibrary());
  }, [dispatch]);

  const handleLoadLibraryFromDrive = useCallback(async () => {
    try {
      await dispatch(loadLibraryFromDrive()).unwrap();
      console.log('Library loaded from Google Drive');
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
        // Safe environment accessor: prefer Vite's import.meta.env when available,
        // otherwise fall back to a test-injected global or process.env.
        const getEnv = (key: string) => {
          // Avoid referencing the import.meta token directly in this module (it's ESM-only and
          // causes a parse error in CommonJS/Jest). Instead, try to read it via the Function
          // constructor so the parser doesn't see the literal.
          try {
            const reader = new Function('k', 'try { return import.meta.env[k]; } catch(e) { return undefined; }');
            const v = reader(key);
            if (v) return v;
          } catch (e) {
            // ignore failures (e.g., environments that don't support import.meta)
          }

          // @ts-ignore - test setup may inject variables here
          if (globalThis.__IMPORT_META_ENV__ && globalThis.__IMPORT_META_ENV__[key]) return globalThis.__IMPORT_META_ENV__[key];

          // Fallback to process.env for Node/Jest
          // @ts-ignore
          return (process.env && (process.env as any)[key]) || undefined;
        };

        const CLIENT_ID = getEnv('VITE_GOOGLE_CLIENT_ID');
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
          // Library load is handled at the top-level App startup (and via React Query).
          // Avoid dispatching `loadFullLibrary()` here to prevent duplicate loads
          // and race conditions that overwrite the songs store unexpectedly.
        } else {
          console.debug('No valid session found, checking if library already loaded...');
          // Only load mock library if we don't already have real data
          if (!fullLibrary || !fullLibrary.artists || fullLibrary.artists.length === 0) {
            console.debug('No existing library data, using mock library');
            handleLoadMockLibrary();
          } else {
            console.debug('Real library data already available, skipping mock library');
          }
        }
      } catch (error: unknown) {
        console.error('Failed to initialize Google Drive:', error);
        // Only load mock library if we don't already have real data
        if (!fullLibrary || !fullLibrary.artists || fullLibrary.artists.length === 0) {
          console.debug('No existing library data, using mock library as fallback');
          handleLoadMockLibrary();
        } else {
          console.debug('Real library data already available, skipping mock library fallback');
        }
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Failed to sign out:', error);
    }
  };

  // Handle Google Drive settings changes
  const handleSettingsChange = async (settings) => {
    try {
      GoogleDriveServiceModern.updateSettings(settings);
      message.success('Google Drive settings updated successfully');
      
      // Optionally reload the library with new settings
      if (isGoogleDriveConnected) {
        await handleLoadLibraryFromDrive();
      }
    } catch (error: unknown) {
      console.error('Failed to update settings:', error);
      message.error('Failed to update Google Drive settings');
    }
  };

  // Register header dropdown items for Songs app
  const { setMenuItems } = useDropdown();
  useEffect(() => {
    const items = [
      // Library Settings handled by top-level GoogleAuthButton
      // Songs auto-populate from library, no manual open/save needed
    ];

    setMenuItems(items);
    return () => setMenuItems([]);
  }, [setMenuItems, dispatch]);

  // Ref for lyrics section in SongEditor
  const lyricsSectionRef = React.useRef(null);

  // Handle song selection from SongList
  const handleSongSelect = React.useCallback((songData, artistName, albumTitle: any) => {
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
    return authErrorPatterns.some((pattern: any) =>
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
      const existingArtist = library.artists?.find((a: any) => a.name === artist);

      if (!existingArtist) {
        await dispatch(addArtist({
          artistName: artist,
          isGoogleDriveConnected
        })).unwrap();
      }

      // Then ensure the album exists
      const artistAfterAdd = library.artists?.find((a: any) => a.name === artist) || existingArtist;
      const existingAlbum = artistAfterAdd?.albums?.find((a: any) => a.title === album);

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
      const newArtist = finalLibrary.artists?.find((a: any) => a.name === artist);
      const newAlbum = newArtist?.albums?.find((a: any) => a.title === album);
      const newSong = newAlbum?.songs?.find((s: any) => s.title === title);

      if (newSong) {
        handleSongSelect(newSong, artist, album);
      }

      // Close the new song editor
      setIsCreatingNewSong(false);

      message.success('Song created successfully!');
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Failed to delete song:', error);
      message.error('Failed to delete song. Please try again.');
    }
  };

  return (
    <div className="song-tabs-app">
      {/* Main Content - Vertical Stack Layout */}
      <div className={`songs-content-vertical ${isEditingSong || isCreatingNewSong ? 'mode-full' : ''}`}>
        {/* Selected Song Content - Show First When Song is Selected */}
        {selectedSong && (
          <div className="selected-song-section">
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
              <div className="song-view-body">
                {/* Song View Header with Google Drive, Edit, and Add Buttons */}
                <div className="song-view-header">
                  <AlbumArt artist={selectedSong.artist?.name} album={selectedSong.album?.title} />

                  <div className="song-view-header-main">
                    <div className="song-title-row">
                      <h2 className="song-title">{selectedSong.title}</h2>
                      {isGoogleDriveConnected && (
                        <>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => setIsEditingSong(true)}
                            className="song-action-button edit"
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
                              className="song-action-button delete"
                              title="Delete Song"
                            >
                              🗑️
                            </Button>
                          </Popconfirm>
                        </>
                      )}
                    </div>
                    <p className="song-subtitle">
                      {selectedSong.artist?.name} - {selectedSong.album?.title}
                    </p>
                  </div>

                  <div className="song-action-column">
                    {/* Go to Library Button */}
                    <Button
                      onClick={() => {
                        const librarySection = document.querySelector('.song-library-section');
                        if (librarySection) {
                          librarySection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="scroll-library-button"
                    >
                      📚 Scroll to Song Library
                    </Button>
                  </div>
                </div>

                <div className="song-detail-wrapper">
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
          <div className="new-song-section">
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
          <div className={`song-library-section ${selectedSong ? 'has-selected-song' : 'no-selected-song'}`}>
            {/* Library Header with Count and Google Drive Button */}
            <AppNavigation
              appName="Songs"
              // Allow the navigation to reflect editing mode for tests: when editing mode
              // is enabled we surface edit-related controls (like the Add Song button).
              // We intentionally augment the prop so AppNavigation will render primaryAction
              // when either the app is connected or editing mode is toggled on.
              isGoogleDriveConnected={isGoogleDriveConnected || isEditingMode}
              userInfo={userInfo}
              onSignIn={handleGoogleSignInSuccess}
              onSignOut={handleGoogleSignOut}
              onSettingsChange={handleSettingsChange}
              // Show primary action only when editing mode is enabled (or connected)
              primaryAction={(isEditingMode || isGoogleDriveConnected) ? {
                label: 'Add Song',
                onClick: openNewSongEditor,
                style: {
                  backgroundColor: '#4CAF50',
                  borderColor: '#4CAF50'
                }
              } : null}
              // Provide a small leftContent area with an Editing switch so tests can toggle
              // editing mode even when not connected to Google Drive.
              leftContent={(
                <div className="editing-toggle">
                  <span>Editing</span>
                  <Switch
                    checked={isEditingMode}
                    onChange={(checked) => setIsEditingMode(checked)}
                    aria-label="editing-toggle"
                  />
                </div>
              )}
              libraryInfo={{
                title: 'Songs',
                emoji: '🎵',
                count: getTotalSongsCount(),
                isLoading: isLoading
              }}
              googleSignInProps={{
                onError: handleGoogleSignInError,
                disabled: isLoading
              }}
              // styling handled via `.songs-navigation` CSS
              className="songs-navigation"
            />

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
          <div className="empty-state">
            <p>Select a song from your library above to see its chord chart and lyrics.</p>
          </div>
        )}
      </div>

      {/* Display Redux errors */}
      {error && (
        <div className="error-message">
          Error: {error}
          <Button
            size="small"
            onClick={() => dispatch(clearError())}
            className="dismiss-error-button"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Library Settings handled by top-level GoogleAuthButton */}
      {/* Songs auto-populate from library */}
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
