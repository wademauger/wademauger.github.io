// Google Drive service for recipe management
// Adapted from the songs app's GoogleDriveServiceModern

/* global gapi, google */

class GoogleDriveRecipeService {
  isSignedIn: boolean;
  tokenClient: any;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
  userPicture: string | null;
  LIBRARY_FILENAME: string;
  DISCOVERY_DOC: string;
  SCOPES: string;
  CLIENT_ID: string | null;
  gapiInited: boolean;
  gisInited: boolean;
  authRetryAttempts: Map<string, number>;
  maxRetryAttempts: number;
  SESSION_KEYS: {
    ACCESS_TOKEN: string;
    USER_EMAIL: string;
    USER_NAME: string;
    USER_PICTURE: string;
    IS_SIGNED_IN: string;
    TOKEN_EXPIRY: string;
    RECIPES_LIBRARY_FILE: string;
    RECIPES_FOLDER_PATH: string;
  };

  constructor() {
    this.isSignedIn = false;
    this.tokenClient = null;
    this.accessToken = null;
    this.userEmail = null;
    this.userName = null;
    this.userPicture = null;
    this.LIBRARY_FILENAME = 'recipe-library.json'; // Default filename
    this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    this.SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata.readonly';
    this.CLIENT_ID = null; // Set this from your environment
    this.gapiInited = false;
    this.gisInited = false;
    // Track retry attempts to prevent infinite loops
    this.authRetryAttempts = new Map();
    this.maxRetryAttempts = 1;
    
    // Session persistence keys
    this.SESSION_KEYS = {
      ACCESS_TOKEN: 'googleDriveRecipes_accessToken',
      USER_EMAIL: 'googleDriveRecipes_userEmail',
      USER_NAME: 'googleDriveRecipes_userName',
      USER_PICTURE: 'googleDriveRecipes_userPicture',
      IS_SIGNED_IN: 'googleDriveRecipes_isSignedIn',
      TOKEN_EXPIRY: 'googleDriveRecipes_tokenExpiry',
      // User preferences for file locations
      RECIPES_LIBRARY_FILE: 'recipes_libraryFile',
      RECIPES_FOLDER_PATH: 'recipes_folderPath'
    };
    
    // Try to restore session from localStorage
    this.restoreSession();
  }

  /**
   * Get user-specific Google Drive settings
   */
  getSettings() {
    try {
      const userKey = `googleDriveSettings_${this.userEmail || 'default'}`;
      const saved = localStorage.getItem(userKey);
      const defaults = {
        songsLibraryFile: 'song-tabs-library.json',
        recipesLibraryFile: 'recipe-library.json',
        songsFolder: '/',
        recipesFolder: '/'
      };
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (error: unknown) {
      console.warn('Failed to load Google Drive settings:', error);
      return {
        songsLibraryFile: 'song-tabs-library.json',
        recipesLibraryFile: 'recipe-library.json',
        songsFolder: '/',
        recipesFolder: '/'
      };
    }
  }

  /**
   * Update user-specific Google Drive settings
   */
  updateSettings(settings) {
    try {
      const userKey = `googleDriveSettings_${this.userEmail || 'default'}`;
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(userKey, JSON.stringify(updatedSettings));
      
      // Update the current library filename if it was changed
      if (settings.recipesLibraryFile) {
        this.LIBRARY_FILENAME = settings.recipesLibraryFile;
      }
      
      console.log('Google Drive settings updated:', updatedSettings);
      return updatedSettings;
    } catch (error: unknown) {
      console.error('Failed to save Google Drive settings:', error);
      throw error;
    }
  }

  /**
   * Get the current library filename based on user settings
   */
  getLibraryFilename() {
    const settings = this.getSettings();
    return settings.recipesLibraryFile || 'recipe-library.json';
  }

  /**
   * Get cached user preferences for recipes library
   * Returns user's last used settings for file and folder
   */
  getUserPreferences() {
    const userKey = this.getUserPreferenceKey();
    try {
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const preferences = JSON.parse(saved);
        console.log('Loaded recipe user preferences:', preferences);
        return preferences;
      }
    } catch (error: unknown) {
      console.warn('Failed to load recipe user preferences:', error);
    }
    
    // Return defaults if no saved preferences
    return {
      recipesLibraryFile: 'recipe-library.json',
      recipesFolder: '/',
      lastUsed: null
    };
  }

  /**
   * Save user preferences for recipes library
   * @param {Object} preferences - User preferences object
   */
  saveUserPreferences(preferences) {
    const userKey = this.getUserPreferenceKey();
    try {
      const preferencesToSave = {
        ...preferences,
        lastUsed: new Date().toISOString()
      };
      
      localStorage.setItem(userKey, JSON.stringify(preferencesToSave));
      console.log('Saved recipe user preferences:', preferencesToSave);
      return preferencesToSave;
    } catch (error: unknown) {
      console.error('Failed to save recipe user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user-specific preference key (includes email for multi-user support)
   */
  getUserPreferenceKey() {
    const email = this.userEmail || 'default';
    return `recipesUserPreferences_${email}`;
  }

  /**
   * Clear user preferences (useful for reset functionality)
   */
  clearUserPreferences() {
    const userKey = this.getUserPreferenceKey();
    try {
      localStorage.removeItem(userKey);
      console.log('Cleared recipe user preferences for:', this.userEmail);
    } catch (error: unknown) {
      console.error('Failed to clear recipe user preferences:', error);
    }
  }

  /**
   * Check if user has saved preferences
   */
  hasUserPreferences() {
    const userKey = this.getUserPreferenceKey();
    return localStorage.getItem(userKey) !== null;
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
        console.log('Restored recipe session set up for gapi client');
        
        // Validate the restored session
        const isValidSession = await this.validateToken();
        if (!isValidSession) {
          console.log('Restored recipe session is invalid, user will need to sign in again');
        }
      }

      console.log('Google Drive recipe service initialized successfully');
      return true;
    } catch (error: unknown) {
      console.error('Failed to initialize Google Drive recipe service:', error);
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
              discoveryDocs: [this.DISCOVERY_DOC]
            });
            this.gapiInited = true;
            resolve();
          } catch (error: unknown) {
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
    console.log('🔐 Setting up recipe token client with scopes:', this.SCOPES);
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      prompt: 'consent', // Force fresh consent screen to show updated permissions
      include_granted_scopes: true, // Include previously granted scopes
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
        
        console.log('Recipe authentication successful');
      }
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
      } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Recipe sign in failed:', error);
      throw error;
    }
  }

  async signOut() {
    if (this.accessToken) {
      // Revoke the token
      google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log('Recipe token revoked');
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

    console.log('Recipe signed out successfully');
  }

  /**
   * Force re-authentication with broader permissions to access files created outside the app
   * This clears the current session and requests fresh permissions
   */
  async reauthorizeForBroaderAccess() {
    console.log('🔄 Forcing recipe re-authentication for broader Google Drive access...');
    
    try {
      // First sign out completely
      await this.signOut();
      
      // Clear any cached authentication state
      this.clearSession();
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sign in again with fresh permissions
      await this.signIn();
      
      console.log('✅ Recipe re-authentication completed with broader permissions');
      return true;
    } catch (error: unknown) {
      console.error('❌ Recipe re-authentication failed:', error);
      throw new Error(`Recipe re-authentication failed: ${error.message}`);
    }
  }

  async loadUserProfile() {
    console.log('=== LOADING RECIPE USER PROFILE ===');
    
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
        
        console.log('✓ Recipe user profile loaded successfully:', { 
          email: this.userEmail, 
          name: this.userName,
          hasPicture: !!this.userPicture
        });
      } else {
        console.warn('✗ Failed to load recipe user profile:', response.status, response.statusText);
      }
    } catch (error: unknown) {
      console.warn('✗ Error loading recipe user profile:', error);
    }
    
    console.log('=== RECIPE USER PROFILE LOAD COMPLETE ===');
  }

  async validateToken() {
    if (!this.accessToken) {
      console.log('validateToken: No access token available');
      this.isSignedIn = false;
      return false;
    }

    try {
      // Test the token with a simple Drive API call
      const response = await gapi.client.drive.about.get({
        fields: 'user'
      });
      
      if (response.status === 200) {
        console.log('Token validation successful');
        return true;
      } else {
        console.log('Token validation failed:', response.status);
        this.isSignedIn = false;
        return false;
      }
    } catch (error: unknown) {
      console.log('Token validation error:', error);
      this.isSignedIn = false;
      return false;
    }
  }

  saveSession() {
    try {
      if (this.accessToken) {
        const tokenExpiry = Date.now() + (3600 * 1000); // Assume 1 hour expiry
        
        localStorage.setItem(this.SESSION_KEYS.ACCESS_TOKEN, this.accessToken);
        localStorage.setItem(this.SESSION_KEYS.TOKEN_EXPIRY, tokenExpiry.toString());
        localStorage.setItem(this.SESSION_KEYS.IS_SIGNED_IN, 'true');
        
        if (this.userEmail) localStorage.setItem(this.SESSION_KEYS.USER_EMAIL, this.userEmail);
        if (this.userName) localStorage.setItem(this.SESSION_KEYS.USER_NAME, this.userName);
        if (this.userPicture) localStorage.setItem(this.SESSION_KEYS.USER_PICTURE, this.userPicture);
        
        console.log('Recipe session saved to localStorage for user:', this.userEmail);
      }
    } catch (error: unknown) {
      console.warn('Failed to save recipe session:', error);
    }
  }

  restoreSession() {
    try {
      const savedToken = localStorage.getItem(this.SESSION_KEYS.ACCESS_TOKEN);
      const tokenExpiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
      const isSignedIn = localStorage.getItem(this.SESSION_KEYS.IS_SIGNED_IN) === 'true';
      
      if (savedToken && tokenExpiry && isSignedIn) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();
        
        // Check if token is not expired (with a 5-minute buffer to account for clock skew)
        if (now < (expiryTime - 5 * 60 * 1000)) {
          this.accessToken = savedToken;
          this.isSignedIn = true;
          this.userEmail = localStorage.getItem(this.SESSION_KEYS.USER_EMAIL);
          this.userName = localStorage.getItem(this.SESSION_KEYS.USER_NAME);
          this.userPicture = localStorage.getItem(this.SESSION_KEYS.USER_PICTURE);
          
          console.log('Recipe session restored from localStorage for user:', this.userEmail);
          return true;
        } else {
          console.log('Stored recipe session has expired, clearing...');
          this.clearSession();
        }
      }
    } catch (error: unknown) {
      console.warn('Failed to restore recipe session:', error);
      this.clearSession();
    }
    
    return false;
  }

  clearSession() {
    Object.values(this.SESSION_KEYS).forEach((key: any) => {
      localStorage.removeItem(key);
    });
    
    console.log('Recipe session cleared from localStorage');
  }

  getSignInStatus() {
    return {
      isSignedIn: this.isSignedIn,
      userEmail: this.userEmail,
      userName: this.userName,
      userPicture: this.userPicture
    };
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
        
        console.log('Recipe OAuth token handled successfully');
        return true;
      } else if (tokenResponse.code) {
        // If we receive an authorization code instead, we need to exchange it for an access token
        console.warn('Received authorization code instead of access token. This requires server-side token exchange.');
        throw new Error('Authorization code flow not supported in client-side implementation');
      } else {
        throw new Error('No access token received from OAuth response');
      }
    } catch (error: unknown) {
      console.error('Failed to handle recipe OAuth token:', error);
      throw error;
    }
  }

  // Recipe-specific methods
  async _findRecipeLibraryFile() {
    try {
      // First check if user has previously selected a specific file
      const userPreferences = this.getUserPreferences();
      if (userPreferences.selectedFileId) {
        console.log('🔍 Using user-selected recipe library file ID:', userPreferences.selectedFileId);
        try {
          const response = await gapi.client.drive.files.get({
            fileId: userPreferences.selectedFileId,
            fields: 'id, name, modifiedTime, parents, webViewLink'
          });
          console.log('✅ User-selected recipe library file found:', response.result);
          return response.result;
        } catch (error: unknown) {
          console.warn('⚠️ Previously selected file not found, falling back to search:', error);
          // Clear the invalid file ID from preferences
          this.saveUserPreferences({
            ...userPreferences,
            selectedFileId: undefined
          });
        }
      }

      const settings = this.getSettings();
      const libraryFilename = settings.recipesLibraryFile || this.LIBRARY_FILENAME;
      
      // Search for the file across all folders, not just root
      console.log('🔍 Searching for recipe library files with name:', libraryFilename);
      
      const response = await gapi.client.drive.files.list({
        q: `name='${libraryFilename}' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name, modifiedTime, parents, webViewLink)',
        orderBy: 'modifiedTime desc'
      });

      const files = response.result.files;
      console.log('🔍 Found recipe library files:', files);
      
      if (!files || files.length === 0) {
        console.log('📁 No recipe library files found with name:', libraryFilename);
        return null;
      }
      
      if (files.length === 1) {
        console.log('✅ Single recipe library file found:', files[0]);
        return files[0];
      }
      
      // Multiple files found - return null to trigger user selection
      console.log('⚠️ Multiple recipe library files found:', files.length, '- user selection required');
      return null;
      
    } catch (error: unknown) {
      console.error('Error finding recipe library file:', error);
      throw new Error('Failed to find recipe library file');
    }
  }

  // New method to search for all library files and return options for user selection
  async searchForLibraryFiles() {
    try {
      const settings = this.getSettings();
      const libraryFilename = settings.recipesLibraryFile || this.LIBRARY_FILENAME;
      
      console.log('🔍 Searching for all recipe library files with name:', libraryFilename);
      
      const response = await gapi.client.drive.files.list({
        q: `name='${libraryFilename}' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name, modifiedTime, parents, webViewLink, size)',
        orderBy: 'modifiedTime desc'
      });

      const files = response.result.files || [];
      console.log('🔍 Found recipe library files for selection:', files);
      
      // Get folder paths and recipe counts for each file
      const filesWithDetails = await Promise.all(
        files.map(async (file) => {
          let folderPath = '/';
          let recipeCount = 0;
          
          // Get folder path
          if (file.parents && file.parents.length > 0) {
            try {
              const parent = await gapi.client.drive.files.get({
                fileId: file.parents[0],
                fields: 'name, parents'
              });
              
              // Build folder path (simplified - just show parent folder name)
              folderPath = parent.result.name === 'root' ? '/' : `/${parent.result.name}`;
            } catch {
              console.warn('Failed to get parent folder info for file:', file.id);
            }
          }
          
          // Get recipe count by reading file content
          try {
            const contentResponse = await gapi.client.drive.files.get({
              fileId: file.id,
              alt: 'media'
            });
            
            const library = JSON.parse(contentResponse.body);
            recipeCount = library.recipes ? library.recipes.length : 0;
          } catch {
            console.warn('Failed to read recipe count for file:', file.id);
            recipeCount = 'Unknown';
          }
          
          return {
            ...file,
            folderPath,
            recipeCount,
            lastModified: new Date(file.modifiedTime).toLocaleDateString(),
            fileSize: file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown'
          };
        })
      );
      
      return filesWithDetails;
    } catch (error: unknown) {
      console.error('Error searching for library files:', error);
      throw new Error('Failed to search for library files');
    }
  }

  async _createRecipeLibraryFile() {
    try {
      const initialLibrary = {
        version: '1.0',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        recipes: []
      };

      const response = await gapi.client.request({
        path: 'https://www.googleapis.com/upload/drive/v3/files',
        method: 'POST',
        params: {
          uploadType: 'multipart'
        },
        headers: {
          'Content-Type': 'multipart/related; boundary="foo_bar_baz"'
        },
        body: [
          '--foo_bar_baz',
          'Content-Type: application/json; charset=UTF-8',
          '',
          JSON.stringify({
            name: this.LIBRARY_FILENAME,
            parents: ['root']
          }),
          '',
          '--foo_bar_baz',
          'Content-Type: application/json',
          '',
          JSON.stringify(initialLibrary, null, 2),
          '--foo_bar_baz--'
        ].join('\r\n')
      });

      console.log('Recipe library file created:', response.result.id);
      return response.result;
    } catch (error: unknown) {
      console.error('Error creating recipe library file:', error);
      throw new Error('Failed to create recipe library file');
    }
  }

  async loadRecipeLibrary() {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      let libraryFile = await this._findRecipeLibraryFile();
      
      if (!libraryFile) {
        // No library file found - don't auto-create, let user decide
        throw new Error('NO_LIBRARY_FOUND');
      }

      // If multiple files found, _findRecipeLibraryFile returns null
      // We need to handle this case differently
      if (libraryFile === null) {
        throw new Error('MULTIPLE_LIBRARIES_FOUND');
      }

      // Download file content
      const response = await gapi.client.drive.files.get({
        fileId: libraryFile.id,
        alt: 'media'
      });

      const library = JSON.parse(response.body);
      console.log('Recipe library loaded successfully');
      return library;
    } catch (error: unknown) {
      console.error('Error loading recipe library:', error);
      
      // Pass through specific errors for UI handling
      if (error.message === 'NO_LIBRARY_FOUND' || error.message === 'MULTIPLE_LIBRARIES_FOUND') {
        throw error;
      }
      
      throw new Error('Failed to load recipe library from Google Drive');
    }
  }

  async saveRecipeLibrary(libraryData) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const libraryFile = await this._findRecipeLibraryFile();
      
      if (!libraryFile) {
        throw new Error('Recipe library file not found');
      }

      // Update the lastUpdated timestamp
      libraryData.lastUpdated = new Date().toISOString();

      // Use the simpler files.update method instead of raw request
      const response = await gapi.client.drive.files.update({
        fileId: libraryFile.id,
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(libraryData, null, 2)
        }
      });

      console.log('Recipe library saved successfully');
      return response.result;
    } catch (error: unknown) {
      console.error('Error saving recipe library:', error);
      throw new Error('Failed to save recipe library to Google Drive');
    }
  }

  async addRecipe(recipeData) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      // Validate required fields
      if (!recipeData || !recipeData.permalink) {
        throw new Error('Recipe permalink is required');
      }

      // Load current library
      const library = await this.loadRecipeLibrary();
      
      // Validate permalink uniqueness
      const existingPermalinks = new Set(library.recipes.map((r: any) => r.permalink));
      if (existingPermalinks.has(recipeData.permalink)) {
        throw new Error('A recipe with this permalink already exists');
      }

      // Validate permalink format (only allow alphanumeric characters and hyphens)
      const permalinkRegex = /^[a-z0-9-]+$/;
      if (!permalinkRegex.test(recipeData.permalink)) {
        throw new Error('Permalink can only contain lowercase letters, numbers, and hyphens');
      }
      
      // Add recipe with timestamp and provided permalink
      const newRecipe = {
        title: recipeData.title || 'New Recipe',
        description: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: '',
        ...recipeData,
        // Ensure array fields are always arrays even if passed in recipeData
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps || recipeData.instructions || [], // Support both 'steps' and 'instructions' for backward compatibility
        notes: recipeData.notes || [],
        tags: recipeData.tags || [],
        id: Date.now().toString(), // Simple ID generation
        permalink: recipeData.permalink,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      library.recipes.push(newRecipe);
      
      // Save updated library
      await this.saveRecipeLibrary(library);
      
      console.log('Recipe added successfully:', newRecipe.title);
      return newRecipe;
    } catch (error: unknown) {
      console.error('Error adding recipe:', error);
      throw error; // Re-throw the original error to preserve the specific error message
    }
  }

  async updateRecipe(recipeId, updatedData) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      // Load current library
      const library = await this.loadRecipeLibrary();
      
      // Find and update recipe
      const recipeIndex = library.recipes.findIndex((r: any) => r.id === recipeId);
      if (recipeIndex === -1) {
        throw new Error('Recipe not found');
      }

      const originalRecipe = library.recipes[recipeIndex];
      const updatedRecipe = {
        ...originalRecipe,
        ...updatedData,
        // Ensure array fields are always arrays, even if updatedData doesn't include them
        ingredients: updatedData.ingredients || originalRecipe.ingredients || [],
        steps: updatedData.steps || updatedData.instructions || originalRecipe.steps || originalRecipe.instructions || [], // Support both 'steps' and 'instructions'
        notes: updatedData.notes || originalRecipe.notes || [],
        tags: updatedData.tags || originalRecipe.tags || [],
        lastModified: new Date().toISOString()
      };

      // If title is changed, update the permalink
      if (updatedData.title && updatedData.title !== originalRecipe.title) {
        const otherRecipes = library.recipes.filter((r: any) => r.id !== recipeId);
        updatedRecipe.permalink = this._generatePermalink(updatedData.title, otherRecipes);
      }
      
      library.recipes[recipeIndex] = updatedRecipe;
      
      // Save updated library
      await this.saveRecipeLibrary(library);
      
      console.log('Recipe updated successfully:', updatedRecipe.title);
      return updatedRecipe;
    } catch (error: unknown) {
      console.error('Error updating recipe:', error);
      throw new Error('Failed to update recipe in Google Drive');
    }
  }

  async deleteRecipe(recipeId) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      // Load current library
      const library = await this.loadRecipeLibrary();
      
      // Remove recipe
      const originalLength = library.recipes.length;
      library.recipes = library.recipes.filter((r: any) => r.id !== recipeId);
      
      if (library.recipes.length === originalLength) {
        throw new Error('Recipe not found');
      }
      
      // Save updated library
      await this.saveRecipeLibrary(library);
      
      console.log('Recipe deleted successfully');
      return true;
    } catch (error: unknown) {
      console.error('Error deleting recipe:', error);
      throw new Error('Failed to delete recipe from Google Drive');
    }
  }

  // Helper method to check if a permalink is available
  async isPermalinkAvailable(permalink) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const library = await this.loadRecipeLibrary();
      const existingPermalinks = new Set(library.recipes.map((r: any) => r.permalink));
      return !existingPermalinks.has(permalink);
    } catch (error: unknown) {
      console.error('Error checking permalink availability:', error);
      throw new Error('Failed to check permalink availability');
    }
  }

  /**
   * List all folders in Google Drive with their full paths
   * @param {string} parentId - Parent folder ID (optional, defaults to root)
   * @param {string} currentPath - Current path for building full paths
   * @returns {Promise<Array>} Array of folder objects with name, id, and fullPath
   */
  async listFolders(parentId = null, currentPath = '/') {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      let query = 'mimeType=\'application/vnd.google-apps.folder\' and trashed=false';
      
      // Add parent constraint
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      } else {
        // Root level folders
        query += ' and \'root\' in parents';
      }

      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id,name,parents)',
        orderBy: 'name',
        pageSize: 100
      });

      const folders = response.result.files || [];
      let allFolders = [];

      // Add current level folders
      for (const folder of folders) {
        const fullPath = currentPath === '/' ? `/${folder.name}` : `${currentPath}/${folder.name}`;
        allFolders.push({
          id: folder.id,
          name: folder.name,
          fullPath: fullPath,
          parentId: parentId
        });

        // Recursively get subfolders (limit depth to prevent infinite recursion)
        if (currentPath.split('/').length < 5) { // Max depth of 4 levels
          try {
            const subfolders = await this.listFolders(folder.id, fullPath);
            allFolders = allFolders.concat(subfolders);
          } catch (error: unknown) {
            console.warn(`Failed to load subfolders for ${folder.name}:`, error);
          }
        }
      }

      return allFolders;
    } catch (error: unknown) {
      console.error('Error listing folders:', error);
      throw new Error(`Failed to list folders: ${error.message}`);
    }
  }

  /**
   * Get folder suggestions for autocomplete/select components
   * Returns formatted options suitable for Ant Design Select component
   * @returns {Promise<Array>} Array of options with value and label
   */
  async getFolderSuggestions() {
    try {
      const folders = await this.listFolders();
      
      // Always include root folder as first option
      const options = [
        {
          value: '/',
          label: '/ (Root folder)',
          key: 'root'
        }
      ];

      // Add all discovered folders
      folders.forEach((folder: any) => {
        options.push({
          value: folder.fullPath,
          label: folder.fullPath,
          key: folder.id
        });
      });

      // Sort by path length first (shorter paths first), then alphabetically
      options.slice(1).sort((a, b) => {
        const depthA = a.value.split('/').length;
        const depthB = b.value.split('/').length;
        
        if (depthA !== depthB) {
          return depthA - depthB;
        }
        return a.value.localeCompare(b.value);
      });

      return options;
    } catch (error: unknown) {
      console.error('Error getting folder suggestions:', error);
      // Return at least the root folder option if there's an error
      return [
        {
          value: '/',
          label: '/ (Root folder)',
          key: 'root'
        }
      ];
    }
  }

  /**
   * Enhanced file search that accepts custom filename and folder path
   * @param {string} fileName - Name of the file to search for
   * @param {string} folderPath - Folder path to search in (default: '/')
   * @returns {Promise<Object>} Search result with found status and file info
   */
  async findFile(fileName, folderPath = '/') {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      console.log('🔍 GoogleDriveRecipeService: Searching for file:', fileName, 'in folder:', folderPath);
      
      // First, search for the file by name across all folders
      let query = `name='${fileName}' and trashed=false`;

      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id,name,parents,modifiedTime)',
        spaces: 'drive'
      });

      const files = response.result.files;
      console.log('🔍 GoogleDriveRecipeService: Found files with name:', files);
      
      if (!files || files.length === 0) {
        return {
          found: false,
          fileName: fileName,
          folderPath: folderPath,
          error: `File "${fileName}" not found in Google Drive`
        };
      }

      // Now find the actual location of the file(s)
      for (const file of files) {
        const actualLocation = await this._getFileLocation(file);
        console.log('🔍 GoogleDriveRecipeService: File location:', actualLocation);
        
        // Check if this file is in the requested folder
        if (folderPath === '/' && actualLocation === '/') {
          // Found in root as requested
          return {
            found: true,
            fileId: file.id,
            fileName: file.name,
            currentLocation: actualLocation,
            modifiedTime: file.modifiedTime
          };
        } else if (folderPath !== '/' && actualLocation === folderPath) {
          // Found in the specific folder as requested
          return {
            found: true,
            fileId: file.id,
            fileName: file.name,
            currentLocation: actualLocation,
            modifiedTime: file.modifiedTime
          };
        } else if (files.length === 1) {
          // Only one file found, but it's in a different location
          return {
            found: true,
            fileId: file.id,
            fileName: file.name,
            currentLocation: actualLocation,
            modifiedTime: file.modifiedTime,
            differentLocation: true
          };
        }
      }

      // If we get here, we found files but none in the requested location
      const firstFile = files[0];
      const actualLocation = await this._getFileLocation(firstFile);
      
      return {
        found: true,
        fileId: firstFile.id,
        fileName: firstFile.name,
        currentLocation: actualLocation,
        modifiedTime: firstFile.modifiedTime,
        differentLocation: true
      };

    } catch (error: unknown) {
      console.error('Error searching for file:', error);
      return {
        found: false,
        fileName: fileName,
        folderPath: folderPath,
        error: `Search failed: ${error.message}`
      };
    }
  }

  /**
   * Get the actual folder path for a file
   * @param {Object} file - File object with parents array
   * @returns {Promise<string>} Full folder path
   */
  async _getFileLocation(file) {
    try {
      if (!file.parents || file.parents.length === 0) {
        return '/';
      }

      const parentId = file.parents[0];
      if (parentId === 'root') {
        return '/';
      }

      // Get parent folder details
      const parentResponse = await gapi.client.drive.files.get({
        fileId: parentId,
        fields: 'id,name,parents'
      });

      const parent = parentResponse.result;
      if (!parent.parents || parent.parents[0] === 'root') {
        return `/${parent.name}`;
      }

      // Recursively build the path (simplified - could be optimized)
      const grandParentPath = await this._getFileLocation(parent);
      return grandParentPath === '/' ? `/${parent.name}` : `${grandParentPath}/${parent.name}`;
      
    } catch (error: unknown) {
      console.error('Error getting file location:', error);
      return '/'; // Fallback to root
    }
  }

  /**
   * Create a new library with custom filename and location
   * @param {string} fileName - Name of the new library file
   * @param {string} folderPath - Folder path to create the file in
   * @returns {Promise<Object>} Created file info
   */
  async createNewLibrary(fileName) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      // Create initial library structure
      const initialData = {
        version: '1.0',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        recipes: [],
        metadata: {
          createdBy: this.userEmail,
          libraryName: fileName.replace('.json', ''),
          description: 'Recipe library created with Recipe App'
        }
      };

      // For simplicity, create in root directory
      // A more robust implementation would handle folder creation
      const response = await gapi.client.drive.files.create({
        resource: {
          name: fileName,
          mimeType: 'application/json'
        },
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(initialData, null, 2)
        }
      });

      console.log('New recipe library created successfully:', response.result);
      return response.result;
    } catch (error: unknown) {
      console.error('Error creating new recipe library:', error);
      throw new Error(`Failed to create new recipe library: ${error.message}`);
    }
  }

  /**
   * Move an existing file to a new location
   * @param {string} fileId - ID of the file to move
   * @param {string} newFolderPath - New folder path
   * @param {string} newFileName - New file name (optional)
   * @returns {Promise<Object>} Updated file info
   */
  async moveFile(fileId, newFolderPath, newFileName = null) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const updateData = {};
      
      // Update filename if provided
      if (newFileName) {
        updateData.name = newFileName;
      }

      // For simplicity, we'll just update the name
      // A full implementation would handle folder moves by updating parents
      const response = await gapi.client.drive.files.update({
        fileId: fileId,
        resource: updateData
      });

      console.log('Recipe file moved successfully:', response.result);
      return response.result;
    } catch (error: unknown) {
      console.error('Error moving recipe file:', error);
      throw new Error(`Failed to move recipe file: ${error.message}`);
    }
  }

  /**
   * Load library data (alias for loadRecipeLibrary for consistency with modal interface)
   * @returns {Promise<Object>} Library data
   */
  async loadLibraryData() {
    return this.loadRecipeLibrary();
  }

  /**
   * Select and use a specific library file by ID
   * Updates user preferences to remember this choice
   * @param {string} fileId - The Google Drive file ID to select
   * @returns {Promise<Object>} Library data
   */
  async selectLibraryFile(fileId) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      // First, get file details to save user preferences
      const fileResponse = await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'id, name, parents, modifiedTime'
      });

      const file = fileResponse.result;
      
      // Get folder path for the selected file
      const folderPath = await this._getFileLocation(file);
      
      // Update user preferences to remember this selection
      this.saveUserPreferences({
        recipesLibraryFile: file.name,
        recipesFolder: folderPath,
        selectedFileId: fileId
      });

      // Load the library data
      return await this.loadLibraryById(fileId);
    } catch (error: unknown) {
      console.error('Error selecting library file:', error);
      throw new Error(`Failed to select library file: ${error.message}`);
    }
  }

  /**
   * Load library data by specific file ID
   * @param {string} fileId - The Google Drive file ID to load
   * @returns {Promise<Object>} Library data
   */
  async loadLibraryById(fileId) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      console.log('Loading recipe library by file ID:', fileId);
      
      // Download file content directly by ID
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      if (!response.body) {
        throw new Error('No content received from file');
      }

      const libraryData = JSON.parse(response.body);
      console.log('Recipe library loaded successfully from file ID:', fileId);
      
      return libraryData;
    } catch (error: unknown) {
      console.error('Error loading recipe library by ID:', error);
      
      if (error.status === 404) {
        throw new Error('Recipe library file not found or access denied');
      }
      
      if (error.status === 403) {
        // Check for specific app authorization error
        if (error.body && error.body.includes('appNotAuthorizedToFile')) {
          throw new Error('🔐 PERMISSION ISSUE: This recipe file was created outside the app.\n\n' +
            '✅ SOLUTION: Clear your browser cache and sign in again!\n\n' +
            '1. Clear all cookies/cache for this site\n' +
            '2. Sign out completely from the app\n' +
            '3. Sign back in to get broader Google Drive permissions\n\n' +
            'This will allow access to files created manually or with other apps.');
        }
        throw new Error('Access Denied: You don\'t have permission to access this file. Please clear your browser cache and sign in again to refresh permissions.');
      }
      
      if (error.message && error.message.includes('insufficient authentication scopes')) {
        throw new Error('Insufficient permissions. Please sign out and sign in again to grant additional permissions.');
      }
      
      throw new Error(`Failed to load recipe library file: ${error.message}`);
    }
  }

  // Helper method to validate permalink format
  validatePermalinkFormat(permalink) {
    if (!permalink || typeof permalink !== 'string') {
      return { isValid: false, error: 'Permalink is required' };
    }

    if (permalink.length < 2) {
      return { isValid: false, error: 'Permalink must be at least 2 characters long' };
    }

    if (permalink.length > 50) {
      return { isValid: false, error: 'Permalink must be less than 50 characters long' };
    }

    const permalinkRegex = /^[a-z0-9-]+$/;
    if (!permalinkRegex.test(permalink)) {
      return { isValid: false, error: 'Permalink can only contain lowercase letters, numbers, and hyphens' };
    }

    if (permalink.startsWith('-') || permalink.endsWith('-')) {
      return { isValid: false, error: 'Permalink cannot start or end with a hyphen' };
    }

    if (permalink.includes('--')) {
      return { isValid: false, error: 'Permalink cannot contain consecutive hyphens' };
    }

    return { isValid: true };
  }

  // Helper method to generate unique permalink from title
  _generatePermalink(title, existingRecipes) {
    if (!title || typeof title !== 'string') {
      title = 'untitled-recipe';
    }
    
    const basePermalink = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let permalink = basePermalink || 'untitled-recipe';
    let counter = 1;
    const existingPermalinks = new Set(existingRecipes.map((r: any) => r.permalink));
    
    while (existingPermalinks.has(permalink)) {
      permalink = `${basePermalink || 'untitled-recipe'}-${counter}`;
      counter++;
    }
    
    return permalink;
  }
}

// Export singleton instance
const googleDriveRecipeService = new GoogleDriveRecipeService();

// Expose to global scope for debugging
if (typeof window !== 'undefined') {
  window.GoogleDriveRecipeService = googleDriveRecipeService;
  // Note: debugCurrentState method not implemented yet for recipe service
}

export default googleDriveRecipeService;
