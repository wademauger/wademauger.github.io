// Simplified SongTabsApp.js using TreeSelect and modal for adding songs with Redux state management
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pinChord } from '../../store/chordsSlice';
import { 
  loadLibraryFromDrive, 
  updateSong, 
  addSong, 
  setSelectedSong, 
  setGoogleDriveConnection,
  setUserInfo,
  setEditingEnabled,
  clearError,
  loadMockLibrary
} from '../../store/songsSlice';
import SongDetail from './components/SongDetail';
import GoogleSignInButton from './components/GoogleSignInButton';
import SessionTestingTools from './components/SessionTestingTools';
import GoogleDriveServiceModern from './services/GoogleDriveServiceModern';
import './styles/SongTabsApp.css';
import { Switch, TreeSelect, Modal, Form, Input, AutoComplete, Button, Spin, App } from 'antd';
import { FaUnlock, FaLock, FaPlus } from 'react-icons/fa';

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
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedArtist, setSelectedArtist] = useState('');

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

  // Generate tree data for TreeSelect
  const generateTreeData = () => {
    return library.artists.map(artist => ({
      title: artist.name,
      value: `artist_${artist.name}`,
      key: `artist_${artist.name}`,
      selectable: true,
      children: artist.albums.map(album => ({
        title: album.title,
        value: `album_${artist.name}_${album.title}`,
        key: `album_${artist.name}_${album.title}`,
        selectable: true,
        children: (album.songs || []).map(song => ({
          title: song.title,
          value: `song_${artist.name}_${album.title}_${song.title}`,
          key: `song_${artist.name}_${album.title}_${song.title}`,
          selectable: true,
          isLeaf: true
        }))
      }))
    }));
  };

  // Handle song selection from TreeSelect
  const handleSongSelect = (value) => {
    if (value && value.startsWith('song_')) {
      const parts = value.replace('song_', '').split('_');
      if (parts.length >= 3) {
        const artistName = parts[0];
        const albumTitle = parts[1];
        const songTitle = parts.slice(2).join('_');
        
        const artist = library.artists.find(a => a.name === artistName);
        const album = artist?.albums.find(a => a.title === albumTitle);
        const song = album?.songs.find(s => s.title === songTitle);
        
        if (song) {
          // Create normalized song object for Redux
          const normalizedSong = {
            ...song,
            title: song.title,
            artist: { name: artistName },
            album: { title: albumTitle }
          };
          dispatch(setSelectedSong(normalizedSong));
        }
      }
    } else if (value && (value.startsWith('artist_') || value.startsWith('album_'))) {
      const isExpanded = expandedKeys.includes(value);
      if (isExpanded) {
        setExpandedKeys(prev => prev.filter(key => key !== value));
      } else {
        setExpandedKeys(prev => [...prev, value]);
      }
      
      setTimeout(() => {
        setDropdownOpen(true);
      }, 0);
    }
  };

  // Handle dropdown visibility changes
  const handleDropdownVisibleChange = (open) => {
    setDropdownOpen(open);
  };

  // Handle tree expansion changes
  const handleTreeExpand = (expandedKeys) => {
    setExpandedKeys(expandedKeys);
  };

  // Get unique artist names for autocomplete
  const getArtistOptions = () => {
    return library.artists.map(artist => ({ value: artist.name }));
  };

  // Get album options based on selected artist
  const getAlbumOptions = (artistName) => {
    const artist = library.artists.find(a => a.name === artistName);
    return artist ? artist.albums.map(album => ({ 
      value: album.title 
    })) : [];
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
    return authErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  // Handle adding new song via modal
  const handleAddSong = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const songData = {
        title: values.songTitle,
        lyrics: [],
        notes: ''
      };

      await dispatch(addSong({
        artistName: values.artistName,
        albumTitle: values.albumTitle,
        songData,
        isGoogleDriveConnected
      })).unwrap();

      // Close modal and reset form
      setIsModalVisible(false);
      form.resetFields();
      
      // Auto-select the newly created song
      const newValue = `song_${values.artistName}_${values.albumTitle}_${values.songTitle}`;
      handleSongSelect(newValue);
      
      message.success('Song added successfully!');

    } catch (error) {
      console.error('Failed to add song:', error);
      
      // Check if this is an authentication error
      if (isAuthError(error)) {
        // Update UI state to reflect that user is no longer authenticated
        dispatch(setGoogleDriveConnection(false));
        dispatch(setUserInfo(null));
        
        message.error('Your Google Drive session has expired. Please sign in again to save songs.');
      } else {
        message.error(error.message || 'Failed to add song. Please try again.');
      }
    }
  }, [form, isGoogleDriveConnected, dispatch, handleSongSelect, message]);

  // Handle chord pinning
  const handlePinChord = (chord) => {
    dispatch(pinChord(chord));
  };

  // Handle editing toggle
  const handleEditingToggle = (enabled) => {
    dispatch(setEditingEnabled(enabled));
  };

  // Derive TreeSelect value from Redux state
  const treeSelectValue = selectedSong 
    ? `song_${selectedSong.artist.name}_${selectedSong.album.title}_${selectedSong.title}` 
    : null;

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

      {/* Main Content */}
      <div className="song-tabs-content">        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <TreeSelect
              style={{ width: '100%' }}
              value={treeSelectValue}
              open={dropdownOpen}
              onDropdownVisibleChange={handleDropdownVisibleChange}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={generateTreeData()}
              placeholder="Select a song..."
              treeDefaultExpandAll={false}
              treeExpandedKeys={expandedKeys}
              onTreeExpand={handleTreeExpand}
              onChange={handleSongSelect}
              showSearch
              treeNodeFilterProp="title"
            />
          </div>
          {editingEnabled && (
            <Button 
              type="primary" 
              icon={<FaPlus />}
              onClick={() => setIsModalVisible(true)}
            >
              Add Song
            </Button>
          )}
        </div>

        {selectedSong && (
          <SongDetail
            song={selectedSong}
            artist={selectedSong.artist}
            album={selectedSong.album}
            editingEnabled={editingEnabled}
            onUpdateSong={handleSongUpdate}
            onPinChord={handlePinChord}
          />
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

      {/* Add Song Modal */}
      <Modal
        title="Add New Song"
        open={isModalVisible}
        onOk={handleAddSong}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedArtist('');
        }}
        confirmLoading={isLoading}
        okText="Add Song"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          name="addSongForm"
        >
          <Form.Item
            name="songTitle"
            label="Song Title"
            rules={[{ required: true, message: 'Please enter a song title!' }]}
          >
            <Input placeholder="Enter song title" />
          </Form.Item>
          
          <Form.Item
            name="artistName"
            label="Artist"
            rules={[{ required: true, message: 'Please enter an artist name!' }]}
          >
            <AutoComplete
              placeholder="Enter or select artist"
              options={getArtistOptions()}
              filterOption={(input, option) =>
                option.value.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                setSelectedArtist(value || '');
                form.setFieldsValue({ albumTitle: undefined });
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="albumTitle"
            label="Album"
            rules={[{ required: true, message: 'Please enter an album title!' }]}
          >
            <AutoComplete
              placeholder="Enter or select album"
              options={getAlbumOptions(selectedArtist)}
              filterOption={(input, option) =>
                option.value.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>

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
