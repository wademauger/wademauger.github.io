// Google Drive service for recipe management
// Adapted from the songs app's GoogleDriveServiceModern

/* global gapi, google */

class GoogleDriveRecipeService {
  constructor() {
    this.isSignedIn = false;
    this.tokenClient = null;
    this.accessToken = null;
    this.userEmail = null;
    this.userName = null;
    this.userPicture = null;
    this.LIBRARY_FILENAME = 'recipe-library.json';
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
      ACCESS_TOKEN: 'googleDriveRecipes_accessToken',
      USER_EMAIL: 'googleDriveRecipes_userEmail',
      USER_NAME: 'googleDriveRecipes_userName',
      USER_PICTURE: 'googleDriveRecipes_userPicture',
      IS_SIGNED_IN: 'googleDriveRecipes_isSignedIn',
      TOKEN_EXPIRY: 'googleDriveRecipes_tokenExpiry'
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
        console.log('Restored recipe session set up for gapi client');
        
        // Validate the restored session
        const isValidSession = await this.validateToken();
        if (!isValidSession) {
          console.log('Restored recipe session is invalid, user will need to sign in again');
        }
      }

      console.log('Google Drive recipe service initialized successfully');
      return true;
    } catch (error) {
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
        
        console.log('Recipe authentication successful');
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.warn('Failed to restore recipe session:', error);
      this.clearSession();
    }
    
    return false;
  }

  clearSession() {
    Object.values(this.SESSION_KEYS).forEach(key => {
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

  // Recipe-specific methods
  async _findRecipeLibraryFile() {
    try {
      const response = await gapi.client.drive.files.list({
        q: `name='${this.LIBRARY_FILENAME}' and parents in 'root' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name, modifiedTime)'
      });

      const files = response.result.files;
      return files && files.length > 0 ? files[0] : null;
    } catch (error) {
      console.error('Error finding recipe library file:', error);
      throw new Error('Failed to find recipe library file');
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
    } catch (error) {
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
        console.log('Recipe library file not found, creating new one');
        libraryFile = await this._createRecipeLibraryFile();
      }

      // Download file content
      const response = await gapi.client.drive.files.get({
        fileId: libraryFile.id,
        alt: 'media'
      });

      const library = JSON.parse(response.body);
      console.log('Recipe library loaded successfully');
      return library;
    } catch (error) {
      console.error('Error loading recipe library:', error);
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

      console.log('Recipe library saved successfully');
      return response.result;
    } catch (error) {
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
      const existingPermalinks = new Set(library.recipes.map(r => r.permalink));
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
        ingredients: [],
        steps: [], // Changed from 'instructions' to 'steps' to match RecipeDetail component
        notes: [], // Ensure notes array is always initialized
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: '',
        tags: [],
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
    } catch (error) {
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
      const recipeIndex = library.recipes.findIndex(r => r.id === recipeId);
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
        const otherRecipes = library.recipes.filter(r => r.id !== recipeId);
        updatedRecipe.permalink = this._generatePermalink(updatedData.title, otherRecipes);
      }
      
      library.recipes[recipeIndex] = updatedRecipe;
      
      // Save updated library
      await this.saveRecipeLibrary(library);
      
      console.log('Recipe updated successfully:', updatedRecipe.title);
      return updatedRecipe;
    } catch (error) {
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
      library.recipes = library.recipes.filter(r => r.id !== recipeId);
      
      if (library.recipes.length === originalLength) {
        throw new Error('Recipe not found');
      }
      
      // Save updated library
      await this.saveRecipeLibrary(library);
      
      console.log('Recipe deleted successfully');
      return true;
    } catch (error) {
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
      const existingPermalinks = new Set(library.recipes.map(r => r.permalink));
      return !existingPermalinks.has(permalink);
    } catch (error) {
      console.error('Error checking permalink availability:', error);
      throw new Error('Failed to check permalink availability');
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
    const existingPermalinks = new Set(existingRecipes.map(r => r.permalink));
    
    while (existingPermalinks.has(permalink)) {
      permalink = `${basePermalink || 'untitled-recipe'}-${counter}`;
      counter++;
    }
    
    return permalink;
  }
}

export default GoogleDriveRecipeService;
