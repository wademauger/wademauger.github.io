/**
 * Simple test to verify that addSong creates artist if not found
 */


// Use manual jest mock for the Drive service
jest.mock('./services/GoogleDriveServiceModern');
import GoogleDriveServiceModern from './services/GoogleDriveServiceModern';

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
    // Configure the manual mock defaults for this test file
  GoogleDriveServiceModern.isSignedIn = true;
  GoogleDriveServiceModern.accessToken = 'mock-token';
  GoogleDriveServiceModern.SESSION_KEYS = { TOKEN_EXPIRY: 'mockExpiry' } as any;
  // Ensure the mock methods are jest.fn so tests can configure resolves
  // @ts-ignore
  GoogleDriveServiceModern.saveLibrary = jest.fn().mockResolvedValue(undefined);
  // @ts-ignore
  GoogleDriveServiceModern.loadLibrary = jest.fn().mockResolvedValue(undefined as any);
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
      
  // Check that saveLibrary was called on the mocked service
  expect(GoogleDriveServiceModern.saveLibrary).toHaveBeenCalledWith(libraryData);
    } catch (error: unknown) {
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
