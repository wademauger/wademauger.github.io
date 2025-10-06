// singleton Google Drive service
class GoogleDriveService {
  isSignedIn: boolean;
  tokenClient: any;
  accessToken: string | null;
  userEmail: string | null;
  LIBRARY_FILENAME: string;
  DISCOVERY_DOC: string;
  SCOPES: string;

  constructor() {
    this.isSignedIn = false;
    this.tokenClient = null;
    this.accessToken = null;
    this.userEmail = null;
    this.LIBRARY_FILENAME = 'library.json';
    this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    this.SCOPES = 'https://www.googleapis.com/auth/drive.file';
  }

  async handleAuthError(error) {
    // Extract error details from various error types
    const getErrorDetails = async (error) => {
      if (error instanceof Response) {
        const status = error.status;
        let message = '';
        try {
          const data = await error.clone().json();
          message = data.error?.message || '';
        } catch {
          try {
            message = await error.clone().text();
          } catch {
            message = error.statusText;
          }
        }
        return { status, message };
      }
      return {
        status: error?.response?.status || error?.result?.status || error?.status,
        message: error?.message || 'Unknown error'
      };
    };

    // Check if error is authentication related
    const isAuthFailure = async (error) => {
      const { status } = await getErrorDetails(error);
      return status === 401;
    };

    const authFailed = await isAuthFailure(error);
    if (authFailed) {
      const { message } = await getErrorDetails(error);
      
      // If user was never signed in (no access token), this is expected
      if (!this.accessToken) {
        // Don't throw error for expected "not signed in" state
        console.debug('API call failed: User not authenticated');
        throw new Error('User not signed in to Google Drive');
      }
      
      // Check if this is a "serious" auth error that requires re-authentication
      const isSeriousAuthError = message.includes('invalid_token') ||
                               message.includes('expired_token') ||
                               message.includes('unauthorized_client') ||
                               message.includes('Invalid Credentials') ||
                               message.includes('access_denied') ||
                               message.includes('token_expired');
      
      // Check if this is a benign auth error (expected when not authenticated)
      const isBenignAuthError = message.includes('missing required authentication credential') ||
                              message.includes('Expected OAuth 2 access token') ||
                              message.includes('Request had insufficient authentication scopes') ||
                              message.includes('Unauthorized') ||
                              message.toLowerCase().includes('authorization required');
      
      if (isSeriousAuthError) {
        // Count auth failures to prevent rapid re-auth attempts
        this.authFailureCount = (this.authFailureCount || 0) + 1;
        
        if (this.authFailureCount >= 3 || message?.includes('invalid_token')) {
          // Clean up the session
          this.isSignedIn = false;
          this.accessToken = null;
          this.userEmail = null;
          window.gapi?.client?.setToken(null);
          localStorage.removeItem('gdrive_access_token');
          localStorage.removeItem('gdrive_user_email');

          // Reset failure count
          this.authFailureCount = 0;

          // Notify any listeners that auth has expired
          window.dispatchEvent(new CustomEvent('gdriveAuthExpired'));
          
          throw new Error('Authentication expired. Please sign in again.');
        } else {
          // For early auth failures, just throw a simple auth error
          throw new Error('Authentication failed. Please try again.');
        }
      } else if (isBenignAuthError) {
        // For benign 401 errors (like missing auth credentials on initial load), don't show error
        console.debug('Benign authentication error:', message);
        throw new Error('User not signed in to Google Drive');
      } else {
        // For other 401 errors, treat as benign by default to avoid false positives
        console.debug('Unknown 401 error, treating as benign:', message);
        throw new Error('User not signed in to Google Drive');
      }
    }
    
    // For non-auth errors, create a proper error object
    const { status, message } = await getErrorDetails(error);
    const errorMessage = `API Error (${status}): ${message}`;
    throw new Error(errorMessage);
  }

  initialize(clientId, apiKey) {
    return new Promise((resolve, reject) => {
      if (!window.gapi) {
        reject(new Error('Google API not loaded'));
        return;
      }

      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: apiKey,
            discoveryDocs: [this.DISCOVERY_DOC]
          });

          // Initialize the new OAuth2 token client
          this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: this.SCOPES,
            callback: (response) => {
              if (response.error) {
                console.error('Token response error:', response);
                return;
              }
              this.accessToken = response.access_token;
              this.isSignedIn = true;
              window.gapi.client.setToken({ access_token: this.accessToken });
              this.loadUserProfile();
            }
          });

          // Attempt to restore session from localStorage
          this.restoreSession();

          resolve();
        } catch (error: unknown) {
          reject(error);
        }
      });
    });
  }

  signIn() {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Google Drive not initialized'));
        return;
      }

      // Request an access token
      this.tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        
        this.accessToken = response.access_token;
        this.isSignedIn = true;
        window.gapi.client.setToken({ access_token: this.accessToken });
        this.loadUserProfile();
        this.persistSession();
        resolve();
      };

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  signOut() {
    if (this.accessToken) {
      window.google.accounts.oauth2.revoke(this.accessToken);
    }
    this.isSignedIn = false;
    this.accessToken = null;
    this.userEmail = null;
    window.gapi.client.setToken(null);
    this.clearSession();
  }

  async loadUserProfile() {
    // Don't attempt to load profile if we don't have a valid access token
    if (!this.accessToken) {
      console.debug('No access token available for loading user profile');
      return;
    }

    try {
      // Use the token to get user info from Google's userinfo endpoint
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      if (!response.ok) {
        throw response;
      }
      const userInfo = await response.json();
      this.userEmail = userInfo.email;
      localStorage.setItem('gdrive_user_email', this.userEmail);
    } catch (error: unknown) {
      console.error('Failed to load user profile:', error);
      this.handleAuthError(error);
    }
  }

  getUserEmail() {
    return this.userEmail;
  }

  async findLibraryFile() {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const response = await window.gapi.client.drive.files.list({
        q: `name='${this.LIBRARY_FILENAME}' and trashed=false`,
        spaces: 'drive'
      });
      return response.result.files.length > 0 ? response.result.files[0] : null;
    } catch (error: unknown) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async createLibraryFile() {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const defaultLibrary = {
        artists: []
      };

      const fileMetadata = {
        name: this.LIBRARY_FILENAME
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', new Blob([JSON.stringify(defaultLibrary, null, 2)], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${this.accessToken}`
        }),
        body: form
      });

      if (!response.ok) {
        throw response;
      }

      return await response.json();
    } catch (error: unknown) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async loadLibrary() {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      let file = await this.findLibraryFile();
      
      if (!file) {
        console.log('Library file not found, creating new one...');
        file = await this.createLibraryFile();
      }

      const response = await window.gapi.client.drive.files.get({
        fileId: file.id,
        alt: 'media'
      });

      if (!response.body) {
        throw new Error('Empty response from Google Drive API');
      }

      try {
        return JSON.parse(response.body);
      } catch (jsonError: unknown) {
        throw new Error(`Invalid JSON in library file: ${jsonError.message}`);
      }
    } catch (error: unknown) {
      // Enhanced error handling with specific messages
      if (error.message?.includes('JSON')) {
        throw error; // Re-throw JSON parsing errors as-is
      }
      
      if (error.status === 401) {
        throw new Error('Google Drive authentication expired (401)');
      } else if (error.status === 403) {
        throw new Error('Access forbidden to Google Drive (403) - check permissions');
      } else if (error.status === 404) {
        throw new Error('Library file not found in Google Drive (404)');
      } else if (error.status === 500) {
        throw new Error('Google Drive server error (500) - try again later');
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
        throw new Error('Network error - check your internet connection');
      }
      
      await this.handleAuthError(error);
      throw new Error(`Google Drive API error: ${error.message || error.toString()}`);
    }
  }

  async saveLibrary(library) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const file = await this.findLibraryFile();
      
      if (file) {
        const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`, {
          method: 'PATCH',
          headers: new Headers({
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(library, null, 2)
        });
        
        if (!response.ok) {
          throw response;
        }
        
        return await response.json();
      }
    } catch (error: unknown) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async addArtist(artistName) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }
    
    try {
      const library = await this.loadLibrary();
      
      // Check if artist already exists
      if (library.artists.some((artist: any) => artist.name === artistName)) {
        throw new Error(`Artist "${artistName}" already exists`);
      }
      
      // Create new artist object
      const newArtist = {
        name: artistName,
        albums: []
      };
      
      // Add to library
      library.artists.push(newArtist);
      
      // Save to Drive
      await this.saveLibrary(library);
      
      return library;
    } catch (error: unknown) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async addAlbum(artistName, albumTitle) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }
    
    try {
      const library = await this.loadLibrary();
      
      // Find artist
      const artistIndex = library.artists.findIndex((artist: any) => artist.name === artistName);
      if (artistIndex === -1) {
        throw new Error(`Artist "${artistName}" not found`);
      }
      
      // Check if album already exists
      if (library.artists[artistIndex].albums.some((album: any) => album.title === albumTitle)) {
        throw new Error(`Album "${albumTitle}" already exists for artist "${artistName}"`);
      }
      
      // Create new album object
      const newAlbum = {
        title: albumTitle,
        songs: []
      };
      
      // Add to library
      library.artists[artistIndex].albums.push(newAlbum);
      
      // Save to Drive
      await this.saveLibrary(library);
      
      return library;
    } catch (error: unknown) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async addSong(artistName, albumTitle, songTitle) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }
    
    try {
      const library = await this.loadLibrary();
      
      // Find artist
      const artistIndex = library.artists.findIndex((artist: any) => artist.name === artistName);
      if (artistIndex === -1) {
        throw new Error(`Artist "${artistName}" not found`);
      }
      
      // Find album
      const albumIndex = library.artists[artistIndex].albums.findIndex((album: any) => album.title === albumTitle);
      if (albumIndex === -1) {
        throw new Error(`Album "${albumTitle}" not found for artist "${artistName}"`);
      }
      
      // Check if song already exists
      if (library.artists[artistIndex].albums[albumIndex].songs.some((song: any) => song.title === songTitle)) {
        throw new Error(`Song "${songTitle}" already exists in album "${albumTitle}"`);
      }
      
      // Create new song object with required fields
      const newSong = {
        title: songTitle,
        id: Date.now().toString(), // Simple ID generation
        chords: [],
        lyrics: []
      };
      
      // Add to library
      library.artists[artistIndex].albums[albumIndex].songs.push(newSong);
      
      // Save to Drive
      await this.saveLibrary(library);
      
      return library;
    } catch (error: unknown) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async updateSong(artistName, albumTitle, updatedSong) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }
    
    try {
      const library = await this.loadLibrary();
      
      // Find artist
      const artistIndex = library.artists.findIndex((artist: any) => artist.name === artistName);
      if (artistIndex === -1) {
        throw new Error(`Artist "${artistName}" not found`);
      }
      
      // Find album
      const albumIndex = library.artists[artistIndex].albums.findIndex((album: any) => album.title === albumTitle);
      if (albumIndex === -1) {
        throw new Error(`Album "${albumTitle}" not found for artist "${artistName}"`);
      }
      
      // Find song
      const songIndex = library.artists[artistIndex].albums[albumIndex].songs.findIndex((song: any) => song.id === updatedSong.id);
      if (songIndex === -1) {
        throw new Error(`Song with ID ${updatedSong.id} not found`);
      }
      
      // Update the song
      library.artists[artistIndex].albums[albumIndex].songs[songIndex] = updatedSong;
      
      // Save to Drive
      await this.saveLibrary(library);
      
      return library;
    } catch (error: unknown) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async trySilentSignIn() {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Google Drive not initialized'));
        return;
      }
      // Set up callback for silent sign-in
      this.tokenClient.callback = (response) => {
        if (response.error || !response.access_token) {
          // Not signed in silently
          this.isSignedIn = false;
          resolve(false);
          return;
        }
        this.accessToken = response.access_token;
        this.isSignedIn = true;
        window.gapi.client.setToken({ access_token: this.accessToken });
        this.loadUserProfile();
        this.persistSession();
        resolve(true);
      };
      // Attempt silent sign-in
      this.tokenClient.requestAccessToken({ prompt: 'none' });
    });
  }

  persistSession() {
    if (this.accessToken) {
      localStorage.setItem('gdrive_access_token', this.accessToken);
    }
    if (this.userEmail) {
      localStorage.setItem('gdrive_user_email', this.userEmail);
    }
  }

  clearSession() {
    localStorage.removeItem('gdrive_access_token');
    localStorage.removeItem('gdrive_user_email');
  }

  restoreSession() {
    const token = localStorage.getItem('gdrive_access_token');
    const email = localStorage.getItem('gdrive_user_email');
    if (token) {
      this.accessToken = token;
      this.isSignedIn = true;
      window.gapi?.client?.setToken({ access_token: token });
    }
    if (email) {
      this.userEmail = email;
    }
    return this.isSignedIn;
  }

  // Validate that the current token is still valid
  async validateToken() {
    if (!this.accessToken) {
      return false;
    }

    try {
      // Make a simple API call to validate the token
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (response.ok) {
        this.isSignedIn = true;
        const userInfo = await response.json();
        this.userEmail = userInfo.email;
        localStorage.setItem('gdrive_user_email', this.userEmail);
        // Important: Set the token in the Google API client for subsequent calls
        window.gapi?.client?.setToken({ access_token: this.accessToken });
        return true;
      } else {
        // Token is invalid, clear the session quietly
        console.debug('Token validation failed, clearing session');
        this.clearSession();
        this.isSignedIn = false;
        this.accessToken = null;
        this.userEmail = null;
        window.gapi?.client?.setToken(null);
        return false;
      }
    } catch (error: unknown) {
      // Token validation failed, clear the session quietly
      console.debug('Token validation error, clearing session:', error);
      this.clearSession();
      this.isSignedIn = false;
      this.accessToken = null;
      this.userEmail = null;
      window.gapi?.client?.setToken(null);
      return false;
    }
  }
}

// Create and export singleton instance
const googleDriveService = new GoogleDriveService();
export default googleDriveService;
