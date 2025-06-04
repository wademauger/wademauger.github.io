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

        // Load user profile
        this.loadUserProfile();
        
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

          // Load user profile
          this.loadUserProfile().then(() => {
            resolve(response);
          }).catch((error) => {
            console.warn('Failed to load user profile:', error);
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

    console.log('Signed out successfully');
  }

  async loadUserProfile() {
    if (!this.accessToken) {
      console.warn('No access token available for loading user profile');
      return;
    }

    try {
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
        console.log('User profile loaded:', { email: this.userEmail, name: this.userName });
      } else {
        console.warn('Failed to load user profile:', response.status);
      }
    } catch (error) {
      console.warn('Error loading user profile:', error);
    }
  }

  async validateToken() {
    if (!this.accessToken) {
      this.isSignedIn = false;
      return false;
    }

    try {
      // Test the token by making a simple API call
      const response = await gapi.client.drive.about.get({
        fields: 'user'
      });

      if (response.status === 200) {
        this.isSignedIn = true;
        this.userEmail = response.result.user?.emailAddress;
        // Also load full user profile to get name and picture
        await this.loadUserProfile();
        return true;
      }
    } catch (error) {
      console.warn('Token validation failed:', error);
      this.isSignedIn = false;
      this.accessToken = null;
      this.userEmail = null;
      this.userName = null;
      this.userPicture = null;
      
      // Clear GAPI token
      if (typeof gapi !== 'undefined' && gapi.client) {
        gapi.client.setToken(null);
      }
    }

    return false;
  }

  // API Methods - These remain largely the same but with simplified error handling

  async findLibraryFile() {
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
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      let libraryFile = await this.findLibraryFile();
      
      if (!libraryFile) {
        console.log('Library file not found, creating new one');
        libraryFile = await this.createLibraryFile();
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
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const libraryFile = await this.findLibraryFile();
      
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

  async addAlbum(libraryData, artistName, albumName) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    const artist = libraryData.artists.find(a => a.name === artistName);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const existingAlbum = artist.albums.find(a => a.name === albumName);
    if (existingAlbum) {
      throw new Error('Album already exists for this artist');
    }

    const newAlbum = {
      name: albumName,
      songs: []
    };

    artist.albums.push(newAlbum);
    await this.saveLibrary(libraryData);
    
    console.log('Album added successfully:', albumName);
    return newAlbum;
  }

  async addSong(libraryData, artistName, albumName, songData) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    const artist = libraryData.artists.find(a => a.name === artistName);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const album = artist.albums.find(a => a.name === albumName);
    if (!album) {
      throw new Error('Album not found');
    }

    const newSong = {
      name: songData.name,
      chords: songData.chords || '',
      lyrics: songData.lyrics || '',
      notes: songData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    album.songs.push(newSong);
    await this.saveLibrary(libraryData);
    
    console.log('Song added successfully:', songData.name);
    return newSong;
  }

  async updateSong(libraryData, artistName, albumName, songName, songData) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    const artist = libraryData.artists.find(a => a.name === artistName);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const album = artist.albums.find(a => a.name === albumName);
    if (!album) {
      throw new Error('Album not found');
    }

    const song = album.songs.find(s => s.name === songName);
    if (!song) {
      throw new Error('Song not found');
    }

    // Update song properties
    song.title = songData.name || song.title;
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
}

// Export singleton instance
const googleDriveServiceModern = new GoogleDriveServiceModern();
export default googleDriveServiceModern;
