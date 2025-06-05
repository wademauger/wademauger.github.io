// Modern Google Drive service using Google Identity Services
// This replaces the manual OAuth implementation with Google's recommended approach

/* global gapi, google */

class GoogleDriveServiceModern {
  constructor() {
    this.isSignedIn = false;
    this.tokenClient = null;
    this.accessToken = null;
    this.userEmail = null;
    this.userName = null;
    this.userPicture = null;
    this.LIBRARY_FILENAME = 'song-tabs-library.json';
    this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    this.SCOPES = 'https://www.googleapis.com/auth/drive.file';
    this.CLIENT_ID = null; // Set this from your environment
    this.gapiInited = false;
    this.gisInited = false;
    // Track retry attempts to prevent infinite loops
    this.authRetryAttempts = new Map();
    this.maxRetryAttempts = 1;
    
    // Session persistence keys
    this.SESSION_KEYS = {
      ACCESS_TOKEN: 'googleDrive_accessToken',
      USER_EMAIL: 'googleDrive_userEmail',
      USER_NAME: 'googleDrive_userName',
      USER_PICTURE: 'googleDrive_userPicture',
      IS_SIGNED_IN: 'googleDrive_isSignedIn',
      TOKEN_EXPIRY: 'googleDrive_tokenExpiry'
    };
    
    // Try to restore session from localStorage
    this.restoreSession();
  }

  async initialize(clientId) {
    this.CLIENT_ID = clientId;
    
    try {
      // Load Google APIs JavaScript client
      await this.loadGoogleAPIs();
      
      // Initialize both GAPI and GIS
      await Promise.all([
        this.initializeGapi(),
        this.initializeGis()
      ]);

      // If we have a restored session, set up the token for gapi
      if (this.isSignedIn && this.accessToken) {
        gapi.client.setToken({
          access_token: this.accessToken
        });
        console.log('Restored session set up for gapi client');
        
        // Validate the restored session
        const isValidSession = await this.validateSession();
        if (!isValidSession) {
          console.log('Restored session is invalid, user will need to sign in again');
        }
      }

      console.log('Google Drive service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive service:', error);
      throw error;
    }
  }

  async loadGoogleAPIs() {
    return new Promise((resolve, reject) => {
      // Load Google APIs JavaScript client if not already loaded
      if (typeof gapi !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google APIs JavaScript client'));
      document.head.appendChild(script);
    });
  }

  async initializeGapi() {
    return new Promise((resolve, reject) => {
      gapi.load('client', {
        callback: async () => {
          try {
            await gapi.client.init({
              discoveryDocs: [this.DISCOVERY_DOC],
            });
            this.gapiInited = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        onerror: () => reject(new Error('Failed to load GAPI client'))
      });
    });
  }

  async initializeGis() {
    return new Promise((resolve, reject) => {
      // Load Google Identity Services
      if (typeof google !== 'undefined' && google.accounts) {
        this.setupTokenClient();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.setupTokenClient();
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  setupTokenClient() {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: (response) => {
        if (response.error !== undefined) {
          console.error('Token client error:', response.error);
          throw new Error(`Authentication failed: ${response.error}`);
        }
        
        this.accessToken = response.access_token;
        this.isSignedIn = true;
        
        // Set the token for API calls
        gapi.client.setToken({
          access_token: this.accessToken
        });

        // Load user profile and save session
        this.loadUserProfile().then(() => {
          this.saveSession();
        }).catch((error) => {
          console.warn('Failed to load user profile:', error);
          this.saveSession(); // Still save session even if profile load fails
        });
        
        console.log('Authentication successful');
      },
    });
    
    this.gisInited = true;
  }

  async requestAccessToken() {
    if (!this.tokenClient) {
      throw new Error('Google Identity Services not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        // Store original callback to restore later
        const originalCallback = this.tokenClient.callback;
        
        // Temporarily override callback for this specific request
        this.tokenClient.callback = (response) => {
          // Restore original callback
          this.tokenClient.callback = originalCallback;
          
          if (response.error !== undefined) {
            reject(new Error(`Authentication failed: ${response.error}`));
            return;
          }
          
          this.accessToken = response.access_token;
          this.isSignedIn = true;
          
          // Set the token for API calls
          gapi.client.setToken({
            access_token: this.accessToken
          });

          // Load user profile and save session
          this.loadUserProfile().then(() => {
            this.saveSession();
            resolve(response);
          }).catch((error) => {
            console.warn('Failed to load user profile:', error);
            this.saveSession(); // Still save session even if profile load fails
            resolve(response); // Still resolve since auth was successful
          });
        };

        // Request access token
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (error) {
        reject(error);
      }
    });
  }

  async signIn() {
    if (!this.gapiInited || !this.gisInited) {
      throw new Error('Google services not initialized');
    }

    try {
      await this.requestAccessToken();
      return true;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  async signOut() {
    if (this.accessToken) {
      // Revoke the token
      google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log('Token revoked');
      });
    }

    // Clear local state
    this.isSignedIn = false;
    this.accessToken = null;
    this.userEmail = null;
    this.userName = null;
    this.userPicture = null;

    // Clear GAPI token
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken(null);
    }

    // Remove session data from localStorage
    this.clearSession();

    console.log('Signed out successfully');
  }

  async loadUserProfile() {
    console.log('=== LOADING USER PROFILE ===');
    
    if (!this.accessToken) {
      console.warn('✗ No access token available for loading user profile');
      return;
    }

    try {
      console.log('Making request to userinfo endpoint...');
      
      // Use the userinfo endpoint to get user details
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (response.ok) {
        const userInfo = await response.json();
        this.userEmail = userInfo.email;
        this.userName = userInfo.name;
        this.userPicture = userInfo.picture;
        
        console.log('✓ User profile loaded successfully:', { 
          email: this.userEmail, 
          name: this.userName,
          hasPicture: !!this.userPicture
        });
      } else {
        console.warn('✗ Failed to load user profile:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('✗ Error loading user profile:', error);
    }
    
    console.log('=== USER PROFILE LOAD COMPLETE ===');
  }

  async validateToken() {
    if (!this.accessToken) {
      console.log('validateToken: No access token available');
      this.isSignedIn = false;
      return false;
    }

    console.log('validateToken: Starting token validation with token:', this.accessToken.substring(0, 10) + '...');

    try {
      // Ensure gapi is initialized and token is set
      if (typeof gapi !== 'undefined' && gapi.client) {
        gapi.client.setToken({
          access_token: this.accessToken
        });
        console.log('validateToken: Token set in gapi client');
      } else {
        console.warn('validateToken: gapi not available or not initialized');
        return false;
      }

      console.log('validateToken: Making API call to validate token...');
      // Test the token by making a simple API call
      const response = await gapi.client.drive.about.get({
        fields: 'user'
      });

      console.log('validateToken: API response received:', response);

      if (response.status === 200) {
        this.isSignedIn = true;
        this.userEmail = response.result.user?.emailAddress;
        console.log('validateToken: Token is valid, user:', this.userEmail);
        // Also load full user profile to get name and picture
        await this.loadUserProfile();
        // Update session with fresh data
        this.saveSession();
        return true;
      } else {
        console.warn('validateToken: Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('validateToken: Token validation failed with error:', error);
      console.error('validateToken: Error details:', {
        message: error.message,
        status: error.status,
        result: error.result
      });
      
      // Don't immediately clear session for network errors or temporary issues
      // Only clear if it's definitely an auth error
      if (error.status === 401 || error.status === 403 || 
          (error.result && error.result.error && error.result.error.code === 401)) {
        console.log('validateToken: Authentication error detected, clearing session');
        this.isSignedIn = false;
        // Clear invalid session
        this.clearSession();
        this.accessToken = null;
        this.userEmail = null;
        this.userName = null;
        this.userPicture = null;
        
        // Clear GAPI token
        if (typeof gapi !== 'undefined' && gapi.client) {
          gapi.client.setToken(null);
        }
      } else {
        console.log('validateToken: Non-auth error, keeping session but marking as unvalidated');
        // For network errors or other issues, don't clear the session immediately
        // Let the user try to use it and handle auth errors in the withAutoAuth wrapper
      }
    }

    return false;
  }

  // API Methods - These remain largely the same but with simplified error handling

  async findLibraryFile() {
    return this.withAutoAuth(this._findLibraryFileInternal, 'findLibraryFile');
  }

  async _findLibraryFileInternal() {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const response = await gapi.client.drive.files.list({
        q: `name='${this.LIBRARY_FILENAME}' and trashed=false`,
        fields: 'files(id, name, modifiedTime)'
      });

      const files = response.result.files;
      return files.length > 0 ? files[0] : null;
    } catch (error) {
      console.error('Error finding library file:', error);
      throw new Error('Failed to search for library file');
    }
  }

  async createLibraryFile() {
    return this.withAutoAuth(this._createLibraryFileInternal, 'createLibraryFile');
  }

  async _createLibraryFileInternal() {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const emptyLibrary = {
        artists: [],
        version: '1.0',
        lastUpdated: new Date().toISOString()
      };

      const response = await gapi.client.drive.files.create({
        resource: {
          name: this.LIBRARY_FILENAME,
          mimeType: 'application/json'
        },
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(emptyLibrary, null, 2)
        }
      });

      console.log('Library file created:', response.result.id);
      return response.result;
    } catch (error) {
      console.error('Error creating library file:', error);
      throw new Error('Failed to create library file');
    }
  }

  async loadLibrary() {
    return this.withAutoAuth(this._loadLibraryInternal, 'loadLibrary');
  }

  async _loadLibraryInternal() {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      let libraryFile = await this._findLibraryFileInternal();
      
      if (!libraryFile) {
        console.log('Library file not found, creating new one');
        libraryFile = await this._createLibraryFileInternal();
      }

      // Download file content
      const response = await gapi.client.drive.files.get({
        fileId: libraryFile.id,
        alt: 'media'
      });

      const library = JSON.parse(response.body);
      console.log('Library loaded successfully');
      return library;
    } catch (error) {
      console.error('Error loading library:', error);
      throw new Error('Failed to load library from Google Drive');
    }
  }

  async saveLibrary(libraryData) {
    return this.withAutoAuth(this._saveLibraryInternal, 'saveLibrary', libraryData);
  }

  async _saveLibraryInternal(libraryData) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const libraryFile = await this._findLibraryFileInternal();
      
      if (!libraryFile) {
        throw new Error('Library file not found');
      }

      // Update the lastUpdated timestamp
      libraryData.lastUpdated = new Date().toISOString();

      // Upload updated content
      const response = await gapi.client.request({
        path: `https://www.googleapis.com/upload/drive/v3/files/${libraryFile.id}`,
        method: 'PATCH',
        params: {
          uploadType: 'media'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(libraryData, null, 2)
      });

      console.log('Library saved successfully');
      return response.result;
    } catch (error) {
      console.error('Error saving library:', error);
      throw new Error('Failed to save library to Google Drive');
    }
  }

  // Additional utility methods for managing songs, artists, albums
  // These would be implemented similar to your existing methods
  // but with the simplified error handling approach

  async addArtist(libraryData, artistName) {
    return this.withAutoAuth(this._addArtistInternal, 'addArtist', libraryData, artistName);
  }

  async _addArtistInternal(libraryData, artistName) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    const existingArtist = libraryData.artists.find(a => a.name === artistName);
    if (existingArtist) {
      throw new Error('Artist already exists');
    }

    const newArtist = {
      name: artistName,
      albums: []
    };

    libraryData.artists.push(newArtist);
    await this.saveLibrary(libraryData);
    
    console.log('Artist added successfully:', artistName);
    return newArtist;
  }

  async addAlbum(libraryData, artistName, albumTitle) {
    return this.withAutoAuth(this._addAlbumInternal, 'addAlbum', libraryData, artistName, albumTitle);
  }

  async _addAlbumInternal(libraryData, artistName, albumTitle) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    const artist = libraryData.artists.find(a => a.name === artistName);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const existingAlbum = artist.albums.find(a => a.title === albumTitle);
    if (existingAlbum) {
      throw new Error('Album already exists for this artist');
    }

    const newAlbum = {
      name: albumTitle,
      songs: []
    };

    artist.albums.push(newAlbum);
    await this.saveLibrary(libraryData);
    
    console.log('Album added successfully:', albumTitle);
    return newAlbum;
  }

  async addSong(libraryData, artistName, albumTitle, songData) {
    return this.withAutoAuth(this._addSongInternal, 'addSong', libraryData, artistName, albumTitle, songData);
  }

  async _addSongInternal(libraryData, artistName, albumTitle, songData) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    const artist = libraryData.artists.find(a => a.name === artistName);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const album = artist.albums.find(a => a.title === albumTitle);
    if (!album) {
      throw new Error('Album not found');
    }

    const newSong = {
      name: songData.title,
      chords: songData.chords || '',
      lyrics: songData.lyrics || '',
      notes: songData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    album.songs.push(newSong);
    await this.saveLibrary(libraryData);
    
    console.log('Song added successfully:', songData.title);
    return newSong;
  }

  async updateSong(libraryData, artistName, albumTitle, songTitle, songData) {
    return this.withAutoAuth(this._updateSongInternal, 'updateSong', libraryData, artistName, albumTitle, songTitle, songData);
  }

  async _updateSongInternal(libraryData, artistName, albumTitle, songTitle, songData) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    const artist = libraryData.artists.find(a => a.name === artistName);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const album = artist.albums.find(a => a.title === albumTitle);
    if (!album) {
      throw new Error('Album not found');
    }

    const song = album.songs.find(s => s.title === songTitle);
    if (!song) {
      throw new Error('Song not found');
    }

    // Update song properties
    song.title = song.title;
    song.chords = songData.chords !== undefined ? songData.chords : song.chords;
    song.lyrics = songData.lyrics !== undefined ? songData.lyrics : song.lyrics;
    song.notes = songData.notes !== undefined ? songData.notes : song.notes;
    song.updatedAt = new Date().toISOString();

    await this.saveLibrary(libraryData);
    
    console.log('Song updated successfully:', song.title);
    return song;
  }

  // Method to handle tokens from @react-oauth/google
  async handleOAuthToken(tokenResponse) {
    try {
      // The tokenResponse from @react-oauth/google contains an access_token
      if (tokenResponse.access_token) {
        this.accessToken = tokenResponse.access_token;
        this.isSignedIn = true;

        // Set the token for API calls
        if (typeof gapi !== 'undefined' && gapi.client) {
          gapi.client.setToken({
            access_token: this.accessToken
          });
        }

        // Load user profile
        await this.loadUserProfile();
        
        // Save session after successful authentication and profile loading
        this.saveSession();
        
        console.log('OAuth token handled successfully');
        return true;
      } else if (tokenResponse.code) {
        // If we receive an authorization code instead, we need to exchange it for an access token
        console.warn('Received authorization code instead of access token. This requires server-side token exchange.');
        throw new Error('Authorization code flow not supported in client-side implementation');
      } else {
        throw new Error('No access token received from OAuth response');
      }
    } catch (error) {
      console.error('Failed to handle OAuth token:', error);
      throw error;
    }
  }

  /**
   * Wrapper function that automatically handles authentication errors and retries
   * @param {Function} operation - The operation to execute
   * @param {string} operationName - Name of the operation for logging
   * @param {Array} args - Arguments to pass to the operation
   * @returns {Promise} Result of the operation
   */
  async withAutoAuth(operation, operationName, ...args) {
    const retryKey = operationName;
    
    try {
      // Reset retry counter for this operation
      this.authRetryAttempts.delete(retryKey);
      
      // Try to execute the operation
      return await operation.apply(this, args);
    } catch (error) {
      // Check if this is the specific authentication error we want to handle
      if (error.message === 'User not signed in to Google Drive') {
        const retryCount = this.authRetryAttempts.get(retryKey) || 0;
        
        if (retryCount < this.maxRetryAttempts) {
          console.log(`Authentication required for ${operationName}. Attempting automatic sign-in...`);
          
          // Increment retry counter
          this.authRetryAttempts.set(retryKey, retryCount + 1);
          
          try {
            // Trigger the authentication flow
            await this.signIn();
            
            console.log(`Authentication successful. Retrying ${operationName}...`);
            
            // Retry the original operation
            const result = await operation.apply(this, args);
            
            // Clear retry counter on success
            this.authRetryAttempts.delete(retryKey);
            
            return result;
          } catch (authError) {
            console.error(`Authentication failed for ${operationName}:`, authError);
            // Clear retry counter on auth failure
            this.authRetryAttempts.delete(retryKey);
            throw new Error(`Authentication failed: ${authError.message}`);
          }
        } else {
          console.error(`Max retry attempts reached for ${operationName}`);
          this.authRetryAttempts.delete(retryKey);
          throw error;
        }
      } else {
        // For non-auth errors, just throw the original error
        throw error;
      }
    }
  }

  // Session management methods

  saveSession() {
    try {
      console.log('=== SAVING SESSION ===');
      console.log('Current state:', {
        accessToken: this.accessToken ? 'EXISTS' : 'NULL',
        userEmail: this.userEmail,
        userName: this.userName,
        userPicture: this.userPicture ? 'EXISTS' : 'NULL',
        isSignedIn: this.isSignedIn
      });
      
      if (this.accessToken) {
        localStorage.setItem(this.SESSION_KEYS.ACCESS_TOKEN, this.accessToken);
        localStorage.setItem(this.SESSION_KEYS.IS_SIGNED_IN, 'true');
        
        // Store token expiry time (Google tokens typically last 1 hour)
        const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour from now
        localStorage.setItem(this.SESSION_KEYS.TOKEN_EXPIRY, expiryTime.toString());
        
        console.log('✓ Saved access token and expiry');
      } else {
        console.log('✗ No access token to save');
      }
      
      if (this.userEmail) {
        localStorage.setItem(this.SESSION_KEYS.USER_EMAIL, this.userEmail);
        console.log('✓ Saved user email:', this.userEmail);
      } else {
        console.log('✗ No user email to save');
      }
      
      if (this.userName) {
        localStorage.setItem(this.SESSION_KEYS.USER_NAME, this.userName);
        console.log('✓ Saved user name:', this.userName);
      } else {
        console.log('✗ No user name to save');
      }
      
      if (this.userPicture) {
        localStorage.setItem(this.SESSION_KEYS.USER_PICTURE, this.userPicture);
        console.log('✓ Saved user picture');
      } else {
        console.log('✗ No user picture to save');
      }
      
      console.log('=== SESSION SAVE COMPLETE ===');
      
      // Verify what was actually saved
      this.debugLocalStorage();
    } catch (error) {
      console.warn('Failed to save session to localStorage:', error);
    }
  }

  restoreSession() {
    try {
      console.log('=== RESTORING SESSION ===');
      
      const savedToken = localStorage.getItem(this.SESSION_KEYS.ACCESS_TOKEN);
      const tokenExpiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
      const isSignedIn = localStorage.getItem(this.SESSION_KEYS.IS_SIGNED_IN) === 'true';
      
      console.log('localStorage check:', {
        hasToken: !!savedToken,
        hasExpiry: !!tokenExpiry,
        wasSignedIn: isSignedIn,
        currentTime: new Date().toISOString()
      });
      
      if (!savedToken) {
        console.log('✗ No saved token found');
        return false;
      }
      
      if (!tokenExpiry) {
        console.log('✗ No token expiry found');
        return false;
      }
      
      if (!isSignedIn) {
        console.log('✗ User was not signed in');
        return false;
      }
      
      // Check if token exists and hasn't expired
      const expiryTime = parseInt(tokenExpiry);
      const now = Date.now();
      
      console.log('Token expiry check:', {
        expiryTime: new Date(expiryTime).toISOString(),
        now: new Date(now).toISOString(),
        isValid: now < expiryTime,
        timeRemaining: Math.round((expiryTime - now) / 1000 / 60) + ' minutes'
      });
      
      if (now >= expiryTime) {
        console.log('✗ Token has expired, clearing session');
        this.clearSession();
        return false;
      }
      
      // Token is still valid, restore session
      this.accessToken = savedToken;
      this.isSignedIn = true;
      this.userEmail = localStorage.getItem(this.SESSION_KEYS.USER_EMAIL);
      this.userName = localStorage.getItem(this.SESSION_KEYS.USER_NAME);
      this.userPicture = localStorage.getItem(this.SESSION_KEYS.USER_PICTURE);
      
      console.log('✓ Session restored successfully:', {
        userEmail: this.userEmail,
        userName: this.userName,
        hasToken: !!this.accessToken,
        hasPicture: !!this.userPicture
      });
      
      // Set token for gapi if it's already loaded
      if (typeof gapi !== 'undefined' && gapi.client && gapi.client.setToken) {
        gapi.client.setToken({
          access_token: this.accessToken
            });
        console.log('✓ Token set for gapi client');
      }
      
      console.log('=== SESSION RESTORE COMPLETE ===');
      return true;
    } catch (error) {
      console.warn('Failed to restore session from localStorage:', error);
      this.clearSession();
      return false;
    }
  }

  clearSession() {
    try {
      localStorage.removeItem(this.SESSION_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(this.SESSION_KEYS.USER_EMAIL);
      localStorage.removeItem(this.SESSION_KEYS.USER_NAME);
      localStorage.removeItem(this.SESSION_KEYS.USER_PICTURE);
      localStorage.removeItem(this.SESSION_KEYS.IS_SIGNED_IN);
      localStorage.removeItem(this.SESSION_KEYS.TOKEN_EXPIRY);
      
      console.log('Session cleared from localStorage');
    } catch (error) {
      console.warn('Failed to clear session from localStorage:', error);
    }
  }

  // Check if we have a valid session and validate it
  async validateSession() {
    if (!this.isSignedIn || !this.accessToken) {
      console.log('validateSession: No session to validate');
      return false;
    }

    console.log('validateSession: Validating session for user:', this.userEmail);

    try {
      // Check if gapi is available and validate the token
      if (typeof gapi !== 'undefined' && gapi.client && this.gapiInited) {
        console.log('validateSession: gapi is ready, validating token...');
        const isValid = await this.validateToken();
        if (isValid) {
          console.log('validateSession: Session validation successful for user:', this.userEmail);
          return true;
        } else {
          console.log('validateSession: Token validation failed');
          return false;
        }
      } else {
        // gapi not ready yet, but we have a token - assume it's valid for now
        // It will be validated when gapi becomes available
        console.log('validateSession: gapi not ready yet, assuming session is valid for now');
        console.log('validateSession: gapi available:', typeof gapi !== 'undefined');
        console.log('validateSession: gapi.client available:', typeof gapi !== 'undefined' && !!gapi.client);
        console.log('validateSession: gapiInited:', this.gapiInited);
        return true;
      }
    } catch (error) {
      console.error('validateSession: Session validation failed with error:', error);
      // Don't clear session for temporary errors - let withAutoAuth handle auth errors
      // this.clearSession();
    }

    return false;
  }

  // Public methods for UI components
  getSignInStatus() {
    return {
      isSignedIn: this.isSignedIn,
      userEmail: this.userEmail,
      userName: this.userName,
      userPicture: this.userPicture
    };
  }

  isUserSignedIn() {
    return this.isSignedIn && this.accessToken !== null;
  }

  // Debugging methods
  debugLocalStorage() {
    console.log('=== localStorage Debug ===');
    Object.values(this.SESSION_KEYS).forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value);
    });
    console.log('========================');
  }

  // Test method to simulate session saving/restoration
  testSessionPersistence() {
    console.log('=== Testing Session Persistence ===');
    
    // Save test session
    const testToken = 'test_token_12345';
    const testEmail = 'test@example.com';
    const testName = 'Test User';
    
    this.accessToken = testToken;
    this.userEmail = testEmail;
    this.userName = testName;
    this.isSignedIn = true;
    
    console.log('Saving test session...');
    this.saveSession();
    
    // Clear in-memory state
    this.accessToken = null;
    this.userEmail = null;
    this.userName = null;
    this.isSignedIn = false;
    
    console.log('Cleared in-memory state');
    
    // Try to restore
    console.log('Attempting to restore session...');
    const restored = this.restoreSession();
    
    console.log('Restoration result:', restored);
    console.log('Current state:', {
      isSignedIn: this.isSignedIn,
      accessToken: this.accessToken,
      userEmail: this.userEmail,
      userName: this.userName
    });
    
    // Clean up test data
    this.clearSession();
    this.accessToken = null;
    this.userEmail = null;
    this.userName = null;
    this.isSignedIn = false;
    
    console.log('=== Test Complete ===');
    return restored;
  }

  // Method to expose for browser console testing
  debugCurrentState() {
    console.log('=== CURRENT DRIVE SERVICE STATE ===');
    console.log('Authentication state:', {
      isSignedIn: this.isSignedIn,
      hasAccessToken: !!this.accessToken,
      userEmail: this.userEmail,
      userName: this.userName,
      hasPicture: !!this.userPicture
    });
    this.debugLocalStorage();
    console.log('=== END STATE ===');
  }
}

// Export singleton instance
const googleDriveServiceModern = new GoogleDriveServiceModern();

// Expose to global scope for debugging
if (typeof window !== 'undefined') {
  window.GoogleDriveServiceModern = googleDriveServiceModern;
  window.debugGoogleDrive = () => googleDriveServiceModern.debugCurrentState();
}

export default googleDriveServiceModern;
