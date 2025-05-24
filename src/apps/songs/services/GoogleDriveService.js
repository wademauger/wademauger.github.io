class GoogleDriveService {
  constructor() {
    this.isSignedIn = false;
    this.tokenClient = null;
    this.accessToken = null;
    this.userEmail = null;
    this.LIBRARY_FILENAME = 'song-tabs-library.json';
    this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    this.SCOPES = 'https://www.googleapis.com/auth/drive.file';
  }

  async initialize(clientId, apiKey) {
    return new Promise((resolve, reject) => {
      if (!window.gapi) {
        reject(new Error('Google API not loaded'));
        return;
      }

      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: apiKey,
            discoveryDocs: [this.DISCOVERY_DOC],
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
              window.gapi.client.setToken({access_token: this.accessToken});
              this.loadUserProfile();
            },
          });

          // Attempt to restore session from localStorage
          this.restoreSession();

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async signIn() {
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
        window.gapi.client.setToken({access_token: this.accessToken});
        this.loadUserProfile();
        this.persistSession();
        resolve();
      };

      this.tokenClient.requestAccessToken({prompt: 'consent'});
    });
  }

  async signOut() {
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
    try {
      // Use the token to get user info from Google's userinfo endpoint
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      const userInfo = await response.json();
      this.userEmail = userInfo.email;
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  getUserEmail() {
    return this.userEmail;
  }

  async findLibraryFile() {
    const response = await window.gapi.client.drive.files.list({
      q: `name='${this.LIBRARY_FILENAME}' and trashed=false`,
      spaces: 'drive'
    });
    
    return response.result.files.length > 0 ? response.result.files[0] : null;
  }

  async createLibraryFile() {
    const defaultLibrary = {
      artists: [
        {
          id: '1',
          name: 'The Beatles',
          albums: [
            {
              id: '101',
              title: 'Abbey Road',
              songs: [
                {
                  id: '1001',
                  title: 'Come Together',
                  chords: ['A', 'D', 'E', 'G'],
                  lyrics: "Here come old flat top, he come grooving up slowly..."
                }
              ]
            }
          ]
        }
      ]
    };

    const fileMetadata = {
      name: this.LIBRARY_FILENAME
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
    form.append('file', new Blob([JSON.stringify(defaultLibrary, null, 2)], {type: 'application/json'}));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${this.accessToken}`
      }),
      body: form
    });

    return await response.json();
  }

  async loadLibrary() {
    let file = await this.findLibraryFile();
    
    if (!file) {
      file = await this.createLibraryFile();
    }

    const response = await window.gapi.client.drive.files.get({
      fileId: file.id,
      alt: 'media'
    });

    return JSON.parse(response.body);
  }

  async saveLibrary(library) {
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
      
      return await response.json();
    }
  }

  // Add a new artist to the library
  async addArtist(artistName) {
    if (!this.isSignedIn) {
      throw new Error('User not signed in to Google Drive');
    }
    
    const library = await this.loadLibrary();
    
    // Check if artist already exists
    if (library.artists.some(artist => artist.name === artistName)) {
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
  }

  // Add a new album to an artist
  async addAlbum(artistName, albumName) {
    if (!this.isSignedIn) {
      throw new Error('User not signed in to Google Drive');
    }
    
    const library = await this.loadLibrary();
    
    // Find artist
    const artistIndex = library.artists.findIndex(artist => artist.name === artistName);
    if (artistIndex === -1) {
      throw new Error(`Artist "${artistName}" not found`);
    }
    
    // Check if album already exists
    if (library.artists[artistIndex].albums.some(album => album.title === albumName)) {
      throw new Error(`Album "${albumName}" already exists for artist "${artistName}"`);
    }
    
    // Create new album object
    const newAlbum = {
      title: albumName,
      songs: []
    };
    
    // Add to library
    library.artists[artistIndex].albums.push(newAlbum);
    
    // Save to Drive
    await this.saveLibrary(library);
    
    return library;
  }

  // Add a new song to an album
  async addSong(artistName, albumName, songName) {
    if (!this.isSignedIn) {
      throw new Error('User not signed in to Google Drive');
    }
    
    const library = await this.loadLibrary();
    
    // Find artist
    const artistIndex = library.artists.findIndex(artist => artist.name === artistName);
    if (artistIndex === -1) {
      throw new Error(`Artist "${artistName}" not found`);
    }
    
    // Find album
    const albumIndex = library.artists[artistIndex].albums.findIndex(album => album.title === albumName);
    if (albumIndex === -1) {
      throw new Error(`Album "${albumName}" not found for artist "${artistName}"`);
    }
    
    // Check if song already exists
    if (library.artists[artistIndex].albums[albumIndex].songs.some(song => song.title === songName)) {
      throw new Error(`Song "${songName}" already exists in album "${albumName}"`);
    }
    
    // Create new song object with required fields
    const newSong = {
      title: songName,
      id: Date.now().toString(), // Simple ID generation
      chords: [],
      lyrics: []
    };
    
    // Add to library
    library.artists[artistIndex].albums[albumIndex].songs.push(newSong);
    
    // Save to Drive
    await this.saveLibrary(library);
    
    return library;
  }

  // Add a method to update a song

  async updateSong(artistName, albumTitle, updatedSong) {
    if (!this.isSignedIn) {
      throw new Error('User not signed in to Google Drive');
    }
    
    const library = await this.loadLibrary();
    
    // Find artist
    const artistIndex = library.artists.findIndex(artist => artist.name === artistName);
    if (artistIndex === -1) {
      throw new Error(`Artist "${artistName}" not found`);
    }
    
    // Find album
    const albumIndex = library.artists[artistIndex].albums.findIndex(album => album.title === albumTitle);
    if (albumIndex === -1) {
      throw new Error(`Album "${albumTitle}" not found for artist "${artistName}"`);
    }
    
    // Find song
    const songIndex = library.artists[artistIndex].albums[albumIndex].songs.findIndex(song => song.id === updatedSong.id);
    if (songIndex === -1) {
      throw new Error(`Song with ID ${updatedSong.id} not found`);
    }
    
    // Update the song
    library.artists[artistIndex].albums[albumIndex].songs[songIndex] = updatedSong;
    
    // Save to Drive
    await this.saveLibrary(library);
    
    return library;
  }

  // Attempt silent sign-in (no prompt)
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

  // Call this after successful login or silent sign-in
  persistSession() {
    if (this.accessToken) {
      localStorage.setItem('gdrive_access_token', this.accessToken);
    }
    if (this.userEmail) {
      localStorage.setItem('gdrive_user_email', this.userEmail);
    }
  }

  // Call this to clear session
  clearSession() {
    localStorage.removeItem('gdrive_access_token');
    localStorage.removeItem('gdrive_user_email');
  }

  // Call this on app load to restore session if possible
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
}

export default new GoogleDriveService();
