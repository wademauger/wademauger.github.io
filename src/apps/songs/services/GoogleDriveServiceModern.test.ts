/**
 * Test file for GoogleDriveServiceModern automatic authentication retry mechanism
 * @jest-environment jsdom
 */

// Mock the Google APIs
global.gapi = {
  load: jest.fn((apis, callback) => callback()),
  client: {
    init: jest.fn(() => Promise.resolve()),
    setToken: jest.fn(),
    drive: {
      files: {
        list: jest.fn(),
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      }
    }
  }
};

global.google = {
  accounts: {
    oauth2: {
      initTokenClient: jest.fn(() => ({
        callback: null,
        requestAccessToken: jest.fn()
      }))
    }
  }
};

// Mock the GoogleDriveServiceModern class
class MockGoogleDriveServiceModern {
  constructor() {
    this.isSignedIn = false;
    this.tokenClient = null;
    this.authRetryAttempts = new Map();
    this.maxRetryAttempts = 1;
    this.accessToken = null;
    this.userEmail = null;
    this.userName = null;
    this.userPicture = null;
    
    // Session persistence keys
    this.SESSION_KEYS = {
      ACCESS_TOKEN: 'googleDrive_accessToken',
      USER_EMAIL: 'googleDrive_userEmail',
      USER_NAME: 'googleDrive_userName',
      USER_PICTURE: 'googleDrive_userPicture',
      IS_SIGNED_IN: 'googleDrive_isSignedIn',
      TOKEN_EXPIRY: 'googleDrive_tokenExpiry'
    };
  }

  saveSession() {
    if (this.accessToken) {
      localStorage.setItem(this.SESSION_KEYS.ACCESS_TOKEN, this.accessToken);
      localStorage.setItem(this.SESSION_KEYS.IS_SIGNED_IN, 'true');
      const expiryTime = Date.now() + (60 * 60 * 1000);
      localStorage.setItem(this.SESSION_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    }
    if (this.userEmail) localStorage.setItem(this.SESSION_KEYS.USER_EMAIL, this.userEmail);
    if (this.userName) localStorage.setItem(this.SESSION_KEYS.USER_NAME, this.userName);
    if (this.userPicture) localStorage.setItem(this.SESSION_KEYS.USER_PICTURE, this.userPicture);
  }

  restoreSession() {
    const savedToken = localStorage.getItem(this.SESSION_KEYS.ACCESS_TOKEN);
    const tokenExpiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    const isSignedIn = localStorage.getItem(this.SESSION_KEYS.IS_SIGNED_IN) === 'true';
    
    if (savedToken && tokenExpiry && isSignedIn) {
      const expiryTime = parseInt(tokenExpiry);
      const now = Date.now();
      
      if (now < expiryTime) {
        this.accessToken = savedToken;
        this.isSignedIn = true;
        this.userEmail = localStorage.getItem(this.SESSION_KEYS.USER_EMAIL);
        this.userName = localStorage.getItem(this.SESSION_KEYS.USER_NAME);
        this.userPicture = localStorage.getItem(this.SESSION_KEYS.USER_PICTURE);
        return true;
      } else {
        this.clearSession();
      }
    }
    return false;
  }

  clearSession() {
    Object.values(this.SESSION_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  getSignInStatus() {
    return {
      isSignedIn: this.isSignedIn,
      userEmail: this.userEmail,
      userName: this.userName,
      userPicture: this.userPicture
    };
  }

  async withAutoAuth(operation, operationName, ...args) {
    const retryKey = operationName;
    
    try {
      this.authRetryAttempts.delete(retryKey);
      return await operation.apply(this, args);
    } catch (error: unknown) {
      if (error.message === 'User not signed in to Google Drive') {
        const retryCount = this.authRetryAttempts.get(retryKey) || 0;
        
        if (retryCount < this.maxRetryAttempts) {
          this.authRetryAttempts.set(retryKey, retryCount + 1);
          
          try {
            await this.signIn();
            const result = await operation.apply(this, args);
            this.authRetryAttempts.delete(retryKey);
            return result;
          } catch (authError: unknown) {
            this.authRetryAttempts.delete(retryKey);
            throw new Error(`Authentication failed: ${authError.message}`);
          }
        } else {
          this.authRetryAttempts.delete(retryKey);
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  async loadLibrary() {
    return this.withAutoAuth(this._loadLibraryInternal, 'loadLibrary');
  }

  async saveLibrary(libraryData) {
    return this.withAutoAuth(this._saveLibraryInternal, 'saveLibrary', libraryData);
  }
}

describe('GoogleDriveServiceModern - Automatic Authentication Retry', () => {
  let service;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;

    service = new MockGoogleDriveServiceModern();
    jest.clearAllMocks();
  });

  test('should automatically retry authentication when "User not signed in to Google Drive" error occurs', async () => {
    // Mock the internal method to throw auth error first, then succeed
    let callCount = 0;
    service._loadLibraryInternal = jest.fn(() => {
      callCount++;
      if (callCount === 1) {
        throw new Error('User not signed in to Google Drive');
      }
      return Promise.resolve({ artists: [] });
    });

    // Mock successful sign-in
    service.signIn = jest.fn(() => {
      service.isSignedIn = true;
      return Promise.resolve();
    });

    // Call the public method that uses withAutoAuth
    const result = await service.loadLibrary();

    // Verify the behavior
    expect(service._loadLibraryInternal).toHaveBeenCalledTimes(2); // First call fails, second succeeds
    expect(service.signIn).toHaveBeenCalledTimes(1); // Authentication was triggered
    expect(result).toEqual({ artists: [] }); // Final result is returned
  });

  test('should not retry for non-authentication errors', async () => {
    // Mock the internal method to throw a different error
    service._loadLibraryInternal = jest.fn(() => {
      throw new Error('Network error');
    });

    service.signIn = jest.fn();

    // Call should throw the original error without retry
    await expect(service.loadLibrary()).rejects.toThrow('Network error');

    // Verify no authentication was attempted
    expect(service._loadLibraryInternal).toHaveBeenCalledTimes(1);
    expect(service.signIn).not.toHaveBeenCalled();
  });

  test('should respect maximum retry attempts', async () => {
    // Mock the internal method to always throw auth error
    service._loadLibraryInternal = jest.fn(() => {
      throw new Error('User not signed in to Google Drive');
    });

    // Mock sign-in to always fail
    service.signIn = jest.fn(() => {
      throw new Error('Sign-in failed');
    });

    // Call should fail after max retry attempts
    await expect(service.loadLibrary()).rejects.toThrow('Authentication failed: Sign-in failed');

    // Verify it only tried once (maxRetryAttempts = 1)
    expect(service._loadLibraryInternal).toHaveBeenCalledTimes(1);
    expect(service.signIn).toHaveBeenCalledTimes(1);
  });

  test('should handle successful authentication but operation still fails', async () => {
    let callCount = 0;
    service._loadLibraryInternal = jest.fn(() => {
      callCount++;
      if (callCount === 1) {
        throw new Error('User not signed in to Google Drive');
      }
      // Second call throws a different error after successful auth
      throw new Error('File not found');
    });

    service.signIn = jest.fn(() => {
      service.isSignedIn = true;
      return Promise.resolve();
    });

    // Should throw the second error, not retry again
    await expect(service.loadLibrary()).rejects.toThrow('File not found');

    expect(service._loadLibraryInternal).toHaveBeenCalledTimes(2);
    expect(service.signIn).toHaveBeenCalledTimes(1);
  });

  test('should work correctly for different operation types', async () => {
    // Test with saveLibrary method
    const testData = { artists: [{ name: 'Test Artist', albums: [] }] };
    
    let callCount = 0;
    service._saveLibraryInternal = jest.fn(() => {
      callCount++;
      if (callCount === 1) {
        throw new Error('User not signed in to Google Drive');
      }
      return Promise.resolve(true);
    });

    service.signIn = jest.fn(() => {
      service.isSignedIn = true;
      return Promise.resolve();
    });

    const result = await service.saveLibrary(testData);

    expect(service._saveLibraryInternal).toHaveBeenCalledTimes(2);
    expect(service._saveLibraryInternal).toHaveBeenCalledWith(testData);
    expect(service.signIn).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  // Session persistence tests
  test('should save session to localStorage on successful authentication', () => {
    service.accessToken = 'test-access-token';
    service.isSignedIn = true;
    service.userEmail = 'test@example.com';
    service.userName = 'Test User';
    service.userPicture = 'https://example.com/picture.jpg';

    service.saveSession();

    expect(localStorage.getItem('googleDrive_accessToken')).toBe('test-access-token');
    expect(localStorage.getItem('googleDrive_isSignedIn')).toBe('true');
    expect(localStorage.getItem('googleDrive_userEmail')).toBe('test@example.com');
    expect(localStorage.getItem('googleDrive_userName')).toBe('Test User');
    expect(localStorage.getItem('googleDrive_userPicture')).toBe('https://example.com/picture.jpg');
    expect(localStorage.getItem('googleDrive_tokenExpiry')).toBeTruthy();
  });

  test('should restore session from localStorage on startup', () => {
    // Set up localStorage with valid session
    const futureTime = Date.now() + (30 * 60 * 1000); // 30 minutes from now
    localStorage.setItem('googleDrive_accessToken', 'stored-token');
    localStorage.setItem('googleDrive_isSignedIn', 'true');
    localStorage.setItem('googleDrive_userEmail', 'stored@example.com');
    localStorage.setItem('googleDrive_userName', 'Stored User');
    localStorage.setItem('googleDrive_userPicture', 'https://example.com/stored.jpg');
    localStorage.setItem('googleDrive_tokenExpiry', futureTime.toString());

    const restored = service.restoreSession();

    expect(restored).toBe(true);
    expect(service.isSignedIn).toBe(true);
    expect(service.accessToken).toBe('stored-token');
    expect(service.userEmail).toBe('stored@example.com');
    expect(service.userName).toBe('Stored User');
    expect(service.userPicture).toBe('https://example.com/stored.jpg');
  });

  test('should not restore expired session', () => {
    // Set up localStorage with expired session
    const pastTime = Date.now() - (60 * 60 * 1000); // 1 hour ago
    localStorage.setItem('googleDrive_accessToken', 'expired-token');
    localStorage.setItem('googleDrive_isSignedIn', 'true');
    localStorage.setItem('googleDrive_userEmail', 'expired@example.com');
    localStorage.setItem('googleDrive_tokenExpiry', pastTime.toString());

    const restored = service.restoreSession();

    expect(restored).toBe(false);
    expect(service.isSignedIn).toBe(false);
    expect(service.accessToken).toBe(null);
    // Session should be cleared
    expect(localStorage.getItem('googleDrive_accessToken')).toBe(null);
  });

  test('should clear all session data from localStorage', () => {
    // First set up some session data
    localStorage.setItem('googleDrive_accessToken', 'test-token');
    localStorage.setItem('googleDrive_isSignedIn', 'true');
    localStorage.setItem('googleDrive_userEmail', 'test@example.com');

    service.clearSession();

    expect(localStorage.getItem('googleDrive_accessToken')).toBe(null);
    expect(localStorage.getItem('googleDrive_isSignedIn')).toBe(null);
    expect(localStorage.getItem('googleDrive_userEmail')).toBe(null);
  });

  test('should return correct sign-in status', () => {
    service.isSignedIn = true;
    service.userEmail = 'test@example.com';
    service.userName = 'Test User';
    service.userPicture = 'https://example.com/picture.jpg';

    const status = service.getSignInStatus();

    expect(status).toEqual({
      isSignedIn: true,
      userEmail: 'test@example.com',
      userName: 'Test User',
      userPicture: 'https://example.com/picture.jpg'
    });
  });
});
