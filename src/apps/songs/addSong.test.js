/**
 * Simple test to verify that addSong creates artist if not found
 */

import GoogleDriveServiceModern from './services/GoogleDriveServiceModern';

// Mock the service methods we don't want to actually call
const mockService = {
  isSignedIn: true,
  accessToken: 'mock-token',
  SESSION_KEYS: {
    TOKEN_EXPIRY: 'mockExpiry'
  },
  saveLibrary: jest.fn().mockResolvedValue(),
  loadLibrary: jest.fn()
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => (Date.now() + 3600000).toString()), // Valid expiry
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('GoogleDriveServiceModern addSong', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Apply mocks to the service instance
    Object.assign(GoogleDriveServiceModern, mockService);
  });

  test('should create artist and album if they do not exist', async () => {
    const libraryData = {
      artists: []
    };

    const songData = {
      title: 'Test Song',
      lyrics: [],
      notes: ''
    };

    try {
      await GoogleDriveServiceModern._addSongInternal(libraryData, 'New Artist', 'New Album', songData);
      
      // Check that artist was created
      expect(libraryData.artists).toHaveLength(1);
      expect(libraryData.artists[0].name).toBe('New Artist');
      
      // Check that album was created
      expect(libraryData.artists[0].albums).toHaveLength(1);
      expect(libraryData.artists[0].albums[0].title).toBe('New Album');
      
      // Check that song was added
      expect(libraryData.artists[0].albums[0].songs).toHaveLength(1);
      expect(libraryData.artists[0].albums[0].songs[0].name).toBe('Test Song');
      
      // Check that saveLibrary was called
      expect(mockService.saveLibrary).toHaveBeenCalledWith(libraryData);
    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });

  test('should add song to existing artist and album', async () => {
    const libraryData = {
      artists: [
        {
          name: 'Existing Artist',
          albums: [
            {
              title: 'Existing Album',
              songs: []
            }
          ]
        }
      ]
    };

    const songData = {
      title: 'Test Song 2',
      lyrics: [],
      notes: ''
    };

    await GoogleDriveServiceModern._addSongInternal(libraryData, 'Existing Artist', 'Existing Album', songData);
    
    // Check that no new artist was created
    expect(libraryData.artists).toHaveLength(1);
    
    // Check that no new album was created
    expect(libraryData.artists[0].albums).toHaveLength(1);
    
    // Check that song was added
    expect(libraryData.artists[0].albums[0].songs).toHaveLength(1);
    expect(libraryData.artists[0].albums[0].songs[0].name).toBe('Test Song 2');
  });

  test('should create album if artist exists but album does not', async () => {
    const libraryData = {
      artists: [
        {
          name: 'Existing Artist',
          albums: []
        }
      ]
    };

    const songData = {
      title: 'Test Song 3',
      lyrics: [],
      notes: ''
    };

    await GoogleDriveServiceModern._addSongInternal(libraryData, 'Existing Artist', 'New Album', songData);
    
    // Check that no new artist was created
    expect(libraryData.artists).toHaveLength(1);
    
    // Check that album was created
    expect(libraryData.artists[0].albums).toHaveLength(1);
    expect(libraryData.artists[0].albums[0].title).toBe('New Album');
    
    // Check that song was added
    expect(libraryData.artists[0].albums[0].songs).toHaveLength(1);
    expect(libraryData.artists[0].albums[0].songs[0].name).toBe('Test Song 3');
  });
});
