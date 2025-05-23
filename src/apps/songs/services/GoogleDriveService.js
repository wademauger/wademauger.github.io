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
}

export default new GoogleDriveService();
