// Modern Google Drive service using Google Identity Services
// This replaces the manual OAuth implementation with Google's recommended approach

/* global gapi, google */

import GoogleDriveErrorHandler from '../../../utils/GoogleDriveErrorHandler';
import libFormat from '../../../utils/libraryFormat';

class GoogleDriveServiceModern {
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
    SONGS_LIBRARY_FILE: string;
    SONGS_FOLDER_PATH: string;
  };
  USE_UPLOAD_FALLBACK: boolean;

  constructor() {
    this.isSignedIn = false;
    this.tokenClient = null;
    this.accessToken = null;
    this.userEmail = null;
    this.userName = null;
    this.userPicture = null;
    this.LIBRARY_FILENAME = 'song-tabs-library.json'; // Default filename
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
      ACCESS_TOKEN: 'googleDrive_accessToken',
      USER_EMAIL: 'googleDrive_userEmail',
      USER_NAME: 'googleDrive_userName',
      USER_PICTURE: 'googleDrive_userPicture',
      IS_SIGNED_IN: 'googleDrive_isSignedIn',
      TOKEN_EXPIRY: 'googleDrive_tokenExpiry',
      // User preferences for file locations
      SONGS_LIBRARY_FILE: 'songs_libraryFile',
      SONGS_FOLDER_PATH: 'songs_folderPath'
    };
    
    // Try to restore session from localStorage
    this.restoreSession();
    // Feature flag: whether to use HTTP upload fallback after gapi.files.update
    // Default: enabled. Can be overridden by environment variable REACT_APP_DRIVE_UPLOAD_FALLBACK='false'
    try {
      const envVal = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_DRIVE_UPLOAD_FALLBACK) || undefined;
      this.USE_UPLOAD_FALLBACK = (envVal === 'false') ? false : true;
    } catch  {
      this.USE_UPLOAD_FALLBACK = true;
    }
  }

  setUseUploadFallback(value) {
    this.USE_UPLOAD_FALLBACK = !!value;
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
      if (settings.songsLibraryFile) {
        this.LIBRARY_FILENAME = settings.songsLibraryFile;
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
    return settings.songsLibraryFile || 'song-tabs-library.json';
  }

  /**
   * Get cached user preferences for songs library
   * Returns user's last used settings for file and folder
   */
  getUserPreferences() {
    const userKey = this.getUserPreferenceKey();
    try {
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const preferences = JSON.parse(saved);
        console.log('Loaded user preferences:', preferences);
        return preferences;
      }
    } catch (error: unknown) {
      console.warn('Failed to load user preferences:', error);
    }
    
    // Return defaults if no saved preferences
    return {
      songsLibraryFile: 'song-tabs-library.json',
      songsFolder: '/',
      lastUsed: null
    };
  }

  /**
   * Save user preferences for songs library
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
      console.log('Saved user preferences:', preferencesToSave);
      return preferencesToSave;
    } catch (error: unknown) {
      console.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user-specific preference key (includes email for multi-user support)
   */
  getUserPreferenceKey() {
    const email = this.userEmail || 'default';
    return `songsUserPreferences_${email}`;
  }

  /**
   * Clear user preferences (useful for reset functionality)
   */
  clearUserPreferences() {
    const userKey = this.getUserPreferenceKey();
    try {
      localStorage.removeItem(userKey);
      console.log('Cleared user preferences for:', this.userEmail);
    } catch (error: unknown) {
      console.error('Failed to clear user preferences:', error);
    }
  }

  /**
   * Check if user has saved preferences
   */
  hasUserPreferences() {
    const userKey = this.getUserPreferenceKey();
    return localStorage.getItem(userKey) !== null;
  }

  /**
   * Get folder path for search queries
   */
  getFolderQuery(folderPath = '/') {
    if (!folderPath || folderPath === '/') {
      return ''; // No folder restriction for root
    }
    // For non-root folders, we'd need to implement folder ID lookup
    // For now, just return empty (search in all folders)
    return '';
  }

  /**
   * Public wrapper to get (and optionally create) a folder by path and return its folderId
   * @param {string} folderPath - e.g. '/MyFolder/Subfolder'
   */
  async getFolderIdByPath(folderPath = '/') {
    return this.withAutoAuth(this._getFolderIdByPathInternal, 'getFolderIdByPath', folderPath);
  }

  async _getFolderIdByPathInternal(folderPath = '/') {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      if (!folderPath || folderPath === '/') return 'root';
      // Split and walk the path creating folders as necessary
      const parts = folderPath.split('/').filter(Boolean);
      let parentId = 'root';
      for (const part of parts) {
        // Escape single quotes in name for Drive queries
        const escaped = part.replace(/'/g, '\\\'');
        const q = `mimeType='application/vnd.google-apps.folder' and name='${escaped}' and trashed=false and '${parentId}' in parents`;
        const resp = await gapi.client.drive.files.list({ q, fields: 'files(id,name,parents)', spaces: 'drive' });
        const files = resp.result && resp.result.files ? resp.result.files : [];
        if (files.length > 0) {
          parentId = files[0].id;
        } else {
          // Create folder under parentId (omit parents for root)
          const resource = { name: part, mimeType: 'application/vnd.google-apps.folder' };
          if (parentId && parentId !== 'root') resource.parents = [parentId];
          const createResp = await gapi.client.drive.files.create({ resource, fields: 'id' });
          parentId = createResp.result.id;
        }
      }
      return parentId;
    } catch (error: unknown) {
      console.error('Error resolving/creating folder path:', folderPath, error);
      return 'root';
    }
  }

  /**
   * Clean up duplicate library files (utility method for maintenance)
   */
  async cleanupDuplicateFiles() {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      const libraryFilename = this.getLibraryFilename();
      const response = await gapi.client.drive.files.list({
        q: `name='${libraryFilename}' and trashed=false`,
        fields: 'files(id, name, modifiedTime, size)',
        orderBy: 'modifiedTime desc'
      });

      const files = response.result.files;
      if (files.length <= 1) {
        console.log('No duplicate files found');
        return { message: 'No duplicates found', duplicatesRemoved: 0 };
      }

      console.log(`Found ${files.length} files with name '${libraryFilename}'`);
      
      // Keep the most recently modified file, mark others for potential deletion
      const duplicates = files.slice(1); // Skip the first (most recent) file
      const filesToCheck = [];

      for (const file of duplicates) {
        // Check if file is empty or very small (might be a failed upload)
        const size = parseInt(file.size) || 0;
        if (size < 50) { // Files smaller than 50 bytes are likely empty/corrupted
          filesToCheck.push({
            id: file.id,
            name: file.name,
            size: size,
            modifiedTime: file.modifiedTime,
            reason: 'File too small (likely empty/corrupted)'
          });
        }
      }

      console.log('Potential problematic files found:', filesToCheck);
      return { 
        message: `Found ${files.length} total files, ${filesToCheck.length} potentially problematic`,
        totalFiles: files.length,
        duplicatesFound: duplicates.length,
        problematicFiles: filesToCheck
      };
    } catch (error: unknown) {
      console.error('Error checking for duplicate files:', error);
      throw new Error('Failed to check for duplicate files');
    }
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
        const isValidSession = await this.validateToken();
        if (!isValidSession) {
          console.log('Restored session is invalid, user will need to sign in again');
        }
      }

      console.log('Google Drive service initialized successfully');
      return true;
    } catch (error: unknown) {
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
    console.log('🔐 Setting up token client with scopes:', this.SCOPES);
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
        
        console.log('Authentication successful');
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

  /**
   * Force re-authentication with broader permissions to access files created outside the app
   * This clears the current session and requests fresh permissions
   */
  async reauthorizeForBroaderAccess() {
    console.log('🔄 Forcing re-authentication for broader Google Drive access...');
    
    try {
      // First sign out completely
      await this.signOut();
      
      // Clear any cached authentication state
      this.clearSession();
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sign in again with fresh permissions
      await this.signIn();
      
      console.log('✅ Re-authentication completed with broader permissions');
      return true;
    } catch (error: unknown) {
      console.error('❌ Re-authentication failed:', error);
      throw new Error(`Re-authentication failed: ${error.message}`);
    }
  }

  /**
   * Generate direct OAuth URL for debugging what scopes are actually being requested
   */
  generateDirectOAuthURL() {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: window.location.origin,
      response_type: 'token',
      scope: this.SCOPES,
      prompt: 'consent',
      include_granted_scopes: true
    });
    
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('🔗 Direct OAuth URL:', oauthUrl);
    console.log('🔐 Requested scopes:', this.SCOPES);
    
    return oauthUrl;
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
    } catch (error: unknown) {
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

    // Wait for GAPI to be ready before attempting validation
    if (!this.gapiInited) {
      console.warn('validateToken: GAPI not initialized yet, waiting...');
      
      // Wait up to 5 seconds for GAPI to initialize
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds with 100ms intervals
      
      while (!this.gapiInited && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!this.gapiInited) {
        console.error('validateToken: GAPI failed to initialize within timeout period');
        return false;
      }
    }

    try {
      // Ensure gapi is initialized and token is set
      if (typeof gapi !== 'undefined' && gapi.client) {
        gapi.client.setToken({
          access_token: this.accessToken
        });
        console.log('validateToken: Token set in gapi client');
      } else {
        console.error('validateToken: gapi client not available');
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
    } catch (error: unknown) {
      console.error('validateToken: Token validation failed with error:', error);
      console.error('validateToken: Error details:', {
        message: error.message,
        status: error.status,
        result: error.result
      });
      
      // Check if this is definitely an authentication error
      const isAuthError = this.isAuthenticationError(error);
      
      if (isAuthError) {
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

  /**
   * Normalize incoming library payloads so we only persist the minimal
   * expected shape to Drive. This strips out any wrapper fields that might
   * have been introduced (for example objects that look like { result, body, headers, status })
   * and prefers to write { panels: { [panelName]: panelObj }, lastUpdated }
   * If the caller supplied { panel, panelName } we prefer that mapping.
   */
  _normalizeLibraryPayload(libraryData) {
    try {
      if (!libraryData) return { panels: {}, lastUpdated: new Date().toISOString() };

      // If payload is a JSON string, try to parse it
      let lib = libraryData;
      if (typeof lib === 'string') {
        try { lib = JSON.parse(lib); } catch  { /* leave as string */ }
      }

      // If caller provided a single panel and a name, use that
      if (lib && lib.panel && lib.panelName) {
        return { panels: { [lib.panelName]: lib.panel }, lastUpdated: lib.lastUpdated || new Date().toISOString() };
      }

      // If this looks like a gapi wrapper with a string body, try to extract it
      if (lib && typeof lib === 'object' && lib.result === false && typeof lib.body === 'string' && lib.body.trim()) {
        try {
          const parsed = JSON.parse(lib.body);
          return this._normalizeLibraryPayload(parsed);
        } catch  {
          // fallthrough
        }
      }

      // If the object directly has a panels or colorworkPatterns namespace, preserve them
      if (lib && ( (lib.panels && typeof lib.panels === 'object') || Array.isArray(lib.colorworkPatterns) )) {
        const out = {};
        if (lib.panels && typeof lib.panels === 'object') out.panels = lib.panels;
        if (Array.isArray(lib.colorworkPatterns)) out.colorworkPatterns = lib.colorworkPatterns;
        out.lastUpdated = lib.lastUpdated || new Date().toISOString();
        return out;
      }

      // If the object uses 'namespaces' with a panels key (legacy), normalize that
      if (lib && lib.namespaces && lib.namespaces.panels) {
        return { panels: lib.namespaces.panels, lastUpdated: lib.lastUpdated || new Date().toISOString() };
      }

      // If the payload itself looks like the library (artists/versions), but no panels,
      // attempt to find anything that resembles panels and store under panels key.
      if (lib && typeof lib === 'object') {
        if (lib.panels || Array.isArray(lib.colorworkPatterns)) {
          const out = {};
          if (lib.panels) out.panels = lib.panels;
          if (Array.isArray(lib.colorworkPatterns)) out.colorworkPatterns = lib.colorworkPatterns;
          out.lastUpdated = lib.lastUpdated || new Date().toISOString();
          return out;
        }
        // Nothing recognizable: store an empty panels object to avoid leaking wrapper fields
        return { panels: {}, lastUpdated: lib.lastUpdated || new Date().toISOString() };
      }

      // Fallback: empty panels
      return { panels: {}, lastUpdated: new Date().toISOString() };
    } catch (err: unknown) {
      console.warn('Failed to normalize library payload, falling back to empty panels:', err);
      return { panels: {}, lastUpdated: new Date().toISOString() };
    }
  }

  // Session management methods
  saveSession() {
    if (this.accessToken) {
      localStorage.setItem(this.SESSION_KEYS.ACCESS_TOKEN, this.accessToken);
      localStorage.setItem(this.SESSION_KEYS.IS_SIGNED_IN, 'true');
      // Set token expiry to 1 hour from now (Google access tokens typically last 1 hour)
      const expiryTime = Date.now() + (60 * 60 * 1000);
      localStorage.setItem(this.SESSION_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    }
    if (this.userEmail) localStorage.setItem(this.SESSION_KEYS.USER_EMAIL, this.userEmail);
    if (this.userName) localStorage.setItem(this.SESSION_KEYS.USER_NAME, this.userName);
    if (this.userPicture) localStorage.setItem(this.SESSION_KEYS.USER_PICTURE, this.userPicture);
    
    console.log('Session saved to localStorage');
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
          
          console.log('Session restored from localStorage for user:', this.userEmail);
          return true;
        } else {
          console.log('Stored session has expired, clearing...');
          this.clearSession();
        }
      }
    } catch (error: unknown) {
      console.warn('Failed to restore session:', error);
      this.clearSession();
    }
    
    return false;
  }

  clearSession() {
    Object.values(this.SESSION_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Session cleared from localStorage');
  }

  getSignInStatus() {
    return {
      isSignedIn: this.isSignedIn,
      userEmail: this.userEmail,
      userName: this.userName,
      userPicture: this.userPicture
    };
  }

  // Debug method to help troubleshoot authentication issues
  debugCurrentState() {
    const state = {
      isSignedIn: this.isSignedIn,
      hasAccessToken: !!this.accessToken,
      accessTokenPreview: this.accessToken ? this.accessToken.substring(0, 10) + '...' : null,
      userEmail: this.userEmail,
      userName: this.userName,
      gapiInited: this.gapiInited,
      gisInited: this.gisInited,
      hasTokenClient: !!this.tokenClient,
      sessionKeys: Object.keys(this.SESSION_KEYS).reduce((acc, key) => {
        const storageKey = this.SESSION_KEYS[key];
        acc[key] = {
          key: storageKey,
          hasValue: !!localStorage.getItem(storageKey),
          value: key.includes('TOKEN') ? 
            (localStorage.getItem(storageKey) ? localStorage.getItem(storageKey).substring(0, 10) + '...' : null) :
            localStorage.getItem(storageKey)
        };
        return acc;
      }, {}),
      authRetryAttempts: Object.fromEntries(this.authRetryAttempts),
      gapiClientReady: typeof gapi !== 'undefined' && !!gapi.client,
      googleAccountsReady: typeof google !== 'undefined' && !!google.accounts
    };
    
    console.log('=== GoogleDriveServiceModern Debug State ===');
    console.log(JSON.stringify(state, null, 2));
    console.log('==========================================');
    
    return state;
  }

  // Test connection method for debugging and testing tools
  async testConnection() {
    try {
      // First check if we have basic requirements
      if (!this.isSignedIn || !this.accessToken) {
        return {
          success: false,
          error: 'User not signed in to Google Drive',
          details: 'No valid access token available'
        };
      }

      // Check if token is expired according to stored expiry
      const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
      if (expiry) {
        const expiryTime = parseInt(expiry);
        const now = Date.now();
        
        if (now > expiryTime) {
          return {
            success: false,
            error: 'Session expired according to stored expiry time',
            details: `Token expired at ${new Date(expiryTime).toLocaleString()}, current time: ${new Date(now).toLocaleString()}`
          };
        }
      }

      // Test the token with a simple API call
      gapi.client.setToken({ access_token: this.accessToken });
      
      const response = await gapi.client.drive.about.get({
        fields: 'user'
      });

      if (response.status === 200) {
        return {
          success: true,
          userEmail: response.result.user?.emailAddress || this.userEmail,
          details: 'Token is valid and API connection successful'
        };
      } else {
        return {
          success: false,
          error: `API call failed with status ${response.status}`,
          details: response.statusText || 'Unknown error'
        };
      }
    } catch (error: unknown) {
      // Check for specific authentication errors
      if (error.status === 401) {
        return {
          success: false,
          error: '401 UNAUTHENTICATED error detected',
          details: error.result?.error?.message || error.message,
          isAuthError: true
        };
      }
      
      return {
        success: false,
        error: error.message || 'Unknown error during connection test',
        details: error.toString()
      };
    }
  }

  // API Methods - These remain largely the same but with simplified error handling

  async findLibraryFile() {
    return this.withAutoAuth(this._findLibraryFileInternal, 'findLibraryFile');
  }

  async _findLibraryFileInternal() {
    // Ensure the GAPI client is available. If it's missing, attempt a lazy init when
    // we have a configured CLIENT_ID. Otherwise surface a clear error so callers
    // know to initialize the service first.
    if (typeof gapi === 'undefined' || !gapi.client) {
      if (this.CLIENT_ID) {
        try {
          await this.loadGoogleAPIs();
          await this.initializeGapi();
        } catch (err: unknown) {
          console.error('GAPI client initialization failed:', err);
          throw new Error('Google APIs client not initialized');
        }
      } else {
        throw new Error('Google APIs client not initialized. Call initialize(clientId) on GoogleDriveServiceModern before using Drive methods.');
      }
    }

    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
    }

    try {
      const libraryFilename = this.getLibraryFilename();
      const response = await gapi.client.drive.files.list({
        q: `name='${libraryFilename}' and trashed=false`,
        fields: 'files(id, name, modifiedTime)'
      });

      const files = response.result.files;
      const file = files.length > 0 ? files[0] : null;
      
      if (!file) {
        GoogleDriveErrorHandler.handleFileError(
          new Error('Library file not found'),
          libraryFilename,
          'find',
          { email: this.userEmail, name: this.userName }
        );
      }
      
      return file;
    } catch (error: unknown) {
      console.error('Error finding library file:', error);
      GoogleDriveErrorHandler.handleFileError(
        error,
        this.getLibraryFilename(),
        'find',
        { email: this.userEmail, name: this.userName }
      );
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

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
    }

    try {
      const libraryFilename = this.getLibraryFilename();
      
      // Double-check if file already exists before creating
      const existingFile = await this._findLibraryFileInternal();
      if (existingFile) {
        console.log('Library file already exists, returning existing file:', existingFile.id);
        return existingFile;
      }

      const emptyLibrary = {
        artists: [],
        version: '1.0',
        lastUpdated: new Date().toISOString()
      };

      const response = await gapi.client.drive.files.create({
        resource: {
          name: libraryFilename,
          mimeType: 'application/json'
        },
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(emptyLibrary, null, 2)
        }
      });

      console.log('GoogleDriveServiceModern: created library file id=', response.result && response.result.id);
      console.log('Library file created:', response.result.id);
      GoogleDriveErrorHandler.showSuccess('create', `Created ${libraryFilename}`);
      return response.result;
    } catch (error: unknown) {
      console.error('Error creating library file:', error);
      GoogleDriveErrorHandler.handleFileError(
        error,
        this.getLibraryFilename(),
        'create',
        { email: this.userEmail, name: this.userName }
      );
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

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
    }

    try {
      let libraryFile = await this._findLibraryFileInternal();
      
      if (!libraryFile) {
        console.log('Library file not found, creating new one');
        libraryFile = await this._createLibraryFileInternal();
      }

      // Download file content
      // Ensure gapi client has current access token
      if (this.accessToken && typeof gapi !== 'undefined' && gapi.client) {
        try { gapi.client.setToken({ access_token: this.accessToken }); } catch  { /* ignore */ }
      }
      const response = await gapi.client.drive.files.get({ fileId: libraryFile.id, alt: 'media' });

      const library = JSON.parse(response.body);
      console.log('Library loaded successfully');
      return library;
    } catch (error: unknown) {
      console.error('Error loading library:', error);
      throw new Error('Failed to load library from Google Drive', error);
    }
  }

  async saveLibrary(libraryData) {
    return this.withAutoAuth(this._saveLibraryInternal, 'saveLibrary', libraryData);
  }

  /**
   * Save library data directly to a specific fileId (useful when caller has explicit fileId)
   * @param {string} fileId
   * @param {Object} libraryData
   */
  async saveLibraryToFile(fileId, libraryData) {
    return this.withAutoAuth(this._saveLibraryToFileInternal, 'saveLibraryToFile', fileId, libraryData);
  }

  async _saveLibraryToFileInternal(fileId, libraryData) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    if (!fileId) throw new Error('fileId required to save to a specific Drive file');

    // Normalize the payload to ensure we only persist the expected 'panels' namespace
    const normalized = this._normalizeLibraryPayload(libraryData);
    normalized.lastUpdated = new Date().toISOString();
    const bodyStr = JSON.stringify(normalized, null, 2);
    
    try {
      // Debug: log preview of normalized payload (don't dump entire body if large)
        try {
        const previewObj = {
          panelsKeys: Object.keys(normalized.panels || {}).slice(0, 50),
          panelsCount: Object.keys(normalized.panels || {}).length,
          colorworkCount: Array.isArray(normalized.colorworkPatterns) ? normalized.colorworkPatterns.length : 0,
          lastUpdated: normalized.lastUpdated
        };
        console.log('GoogleDriveServiceModern: normalized payload preview for save:', previewObj);
      } catch (pvErr: unknown) {
        console.warn('GoogleDriveServiceModern: failed to build payload preview', pvErr);
      }
      console.log('GoogleDriveServiceModern: saving library to fileId=', fileId, 'size=', bodyStr.length);
      // Ensure gapi client has current access token before update
      if (this.accessToken && typeof gapi !== 'undefined' && gapi.client) {
        try { gapi.client.setToken({ access_token: this.accessToken }); } catch  { /* ignore */ }
      }
      const response = await gapi.client.drive.files.update({ fileId, media: { mimeType: 'application/json', body: bodyStr } });
      console.log('GoogleDriveServiceModern: files.update response for', fileId, response && response.status);
      // Additional upload via HTTP PATCH to the upload endpoint to ensure content is replaced
      if (this.USE_UPLOAD_FALLBACK) {
        try {
          const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
          const uploadResp = await fetch(uploadUrl, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: bodyStr
          });
          const uploadText = await uploadResp.text();
          console.log('GoogleDriveServiceModern: HTTP upload fallback response for', fileId, 'status=', uploadResp.status, 'len=', uploadText.length);
          try { console.log('GoogleDriveServiceModern: HTTP upload fallback parsed response=', JSON.parse(uploadText || '{}')); } catch  { /* ignore parse errors */ }
        } catch (uErr: unknown) {
          console.warn('GoogleDriveServiceModern: HTTP upload fallback failed', uErr);
        }
      } else {
        console.log('GoogleDriveServiceModern: upload fallback disabled by feature flag');
      }
      // Attempt to verify by fetching the file content immediately
      try {
        const verify = await gapi.client.drive.files.get({ fileId, alt: 'media' });
        const body = verify && (verify.body || verify.result || verify);
        const len = body ? (typeof body === 'string' ? body.length : JSON.stringify(body).length) : 0;
        // Debug: attempt to parse verification body and log panels keys/count
          try {
          let parsed = body;
          if (typeof body === 'string') parsed = JSON.parse(body);
          const parsedPanels = parsed && parsed.panels ? Object.keys(parsed.panels) : [];
          const parsedColorwork = parsed && parsed.colorworkPatterns ? (Array.isArray(parsed.colorworkPatterns) ? parsed.colorworkPatterns.map(p => p.name || p.id).slice(0,10) : []) : [];
          console.log('GoogleDriveServiceModern: verification parsed panels keys count=', parsedPanels.length, 'keysPreview=', parsedPanels.slice(0,10));
          console.log('GoogleDriveServiceModern: verification parsed colorwork count=', parsedColorwork.length, 'previewNames=', parsedColorwork);
        } catch (pvErr: unknown) {
          console.warn('GoogleDriveServiceModern: failed to parse verification body', pvErr);
        }
        // Log a small preview of the returned content to confirm what's actually stored
        try {
          const preview = typeof body === 'string' ? body.slice(0, 2000) : JSON.stringify(body).slice(0, 2000);
          console.log('GoogleDriveServiceModern: verification fetch succeeded for', fileId, 'len=', len, 'preview=', preview);
        } catch (pErr: unknown) {
          console.log('GoogleDriveServiceModern: verification fetch succeeded for', fileId, 'len=', len, '(preview unavailable)', pErr);
        }

        // If the verification shows empty content, attempt upload fallback to ensure Drive stores the media
        const looksEmpty = !body || (typeof body === 'object' && body.result === false && (!body.body || body.body === '')) || len === 0;
        if (looksEmpty) {
          console.warn('GoogleDriveServiceModern: verification returned empty content for', fileId, '- attempting upload fallback to replace media');
          try {
            const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
            const resp = await fetch(uploadUrl, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
              },
              body: bodyStr
            });
            if (!resp.ok) {
              const txt = await resp.text();
              console.error('GoogleDriveServiceModern: upload fallback (after empty verify) failed', resp.status, txt);
            } else {
              const txt = await resp.text();
              console.log('GoogleDriveServiceModern: upload fallback (after empty verify) succeeded for', fileId, 'respLen=', txt.length);
              // Return parsed result if present
              try { return JSON.parse(txt || '{}'); } catch { return txt; }
            }
          } catch (fbErr: unknown) {
            console.error('GoogleDriveServiceModern: upload fallback (after empty verify) error for', fileId, fbErr);
          }
        }
      } catch (vErr: unknown) {
        console.warn('GoogleDriveServiceModern: verification fetch failed for', fileId, vErr);
      }
      return response.result;
    } catch (error: unknown) {
      console.error('GoogleDriveServiceModern: Error saving library to fileId:', fileId, error);
      // Try upload fallback endpoint if update failed
      try {
        console.log('GoogleDriveServiceModern: attempting upload fallback for', fileId);
        const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
        const resp = await fetch(uploadUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: bodyStr
        });
        if (!resp.ok) {
          const txt = await resp.text();
          console.error('GoogleDriveServiceModern: upload fallback failed', resp.status, txt);
          throw new Error('Upload fallback failed');
        }
        const txt = await resp.text();
        console.log('GoogleDriveServiceModern: upload fallback succeeded for', fileId, 'respLen=', txt.length);
        return JSON.parse(txt || '{}');
      } catch (uploadErr: unknown) {
        console.error('GoogleDriveServiceModern: upload fallback error for', fileId, uploadErr);
      }
      throw new Error('Failed to save library to specified Drive file');
    }
  }

  async _saveLibraryInternal(libraryData) {
    // Ensure the GAPI client is available before attempting to save.
    if (typeof gapi === 'undefined' || !gapi.client) {
      if (this.CLIENT_ID) {
        try {
          await this.loadGoogleAPIs();
          await this.initializeGapi();
        } catch (err: unknown) {
          console.error('GAPI client initialization failed (save):', err);
          throw new Error('Google APIs client not initialized');
        }
      } else {
        throw new Error('Google APIs client not initialized. Call initialize(clientId) on GoogleDriveServiceModern before using Drive methods.');
      }
    }

    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
    }

    try {
      let libraryFile = await this._findLibraryFileInternal();
      
      // If the library file doesn't exist yet, create it rather than failing the save.
      if (!libraryFile) {
        console.log('Library file not found when saving; creating a new library file');
        libraryFile = await this._createLibraryFileInternal();
        if (!libraryFile) {
          throw new Error('Library file not found and could not be created');
        }
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

      console.log('GoogleDriveServiceModern: updated library file id=', response.result && response.result.id);
      console.log('Library saved successfully');
      return response.result;
    } catch (error: unknown) {
      console.error('Error saving library:', error);
      throw new Error('Failed to save library to Google Drive');
    }
  }

  /**
   * List JSON files in a folder and return lightweight counts and previews per namespace.
   * Note: This will download each file's content to compute namespace counts and small previews.
   */
  async listFilesInFolderWithCounts(folderPath = '/') {
    return this.withAutoAuth(this._listFilesInFolderWithCountsInternal, 'listFilesInFolderWithCounts', folderPath);
  }

  async _listFilesInFolderWithCountsInternal(folderPath = '/') {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      // Resolve folderPath to a folderId (create if needed) and restrict query to that folder
      const folderId = await this._getFolderIdByPathInternal(folderPath);
      let q = 'mimeType=\'application/json\' and trashed=false';
      if (folderId && folderId !== 'root') {
        q += ` and '${folderId}' in parents`;
      }
      const response = await gapi.client.drive.files.list({
        q,
        fields: 'files(id, name, modifiedTime, size, parents)'
      });

      const files = response.result.files || [];
      const results = [];

      for (const file of files) {
        try {
          const fileContentResp = await gapi.client.drive.files.get({ fileId: file.id, alt: 'media' });
          const body = fileContentResp.body || fileContentResp.result || fileContentResp;
          let parsed = null;
          try {
            parsed = typeof body === 'string' ? JSON.parse(body) : body;
          } catch  {
            // skip parsing if invalid JSON
            parsed = null;
          }

          const counts = parsed ? libFormat.countNamespaces(parsed) : {};
          const preview = {};
          if (parsed && parsed.namespaces) {
            Object.keys(parsed.namespaces).forEach((ns) => {
              const arr = parsed.namespaces[ns];
              if (Array.isArray(arr)) {
                preview[ns] = arr.slice(0, 3).map(e => ({ id: e && e.id, name: e && (e.name || e.title || '') }));
              }
            });
          }

          results.push({
            fileId: file.id,
            name: file.name,
            modifiedTime: file.modifiedTime,
            size: file.size,
            counts,
            preview
          });
        } catch {
          // If a single file fails to download/parse, still include metadata without counts
          results.push({ fileId: file.id, name: file.name, modifiedTime: file.modifiedTime, size: file.size, counts: {}, preview: {} });
        }
      }

      return results;
    } catch (error: unknown) {
      console.error('Error listing files with counts:', error);
      GoogleDriveErrorHandler.handleFileError(error, 'listFilesInFolderWithCounts', 'list', { email: this.userEmail, name: this.userName });
      throw new Error('Failed to list files');
    }
  }

  /**
   * Create or update a library file and insert/replace an entry within a namespace.
   * options: { fileId, folderPath, fileName, namespace, entry, replaceExisting }
   */
  async createOrUpdateLibraryFile(options = {}) {
    return this.withAutoAuth(this._createOrUpdateLibraryFileInternal, 'createOrUpdateLibraryFile', options);
  }

  async _createOrUpdateLibraryFileInternal(options = {}) {
    const { fileId, folderPath, fileName, namespace = 'panels', entry, replaceExisting = false } = options;

    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      let libObj = null;
      let targetFileId = fileId || null;

      if (targetFileId) {
        // load existing file
        const resp = await gapi.client.drive.files.get({ fileId: targetFileId, alt: 'media' });
        const body = resp.body || resp.result || resp;
        libObj = typeof body === 'string' ? JSON.parse(body) : body;
      } else {
        // Create skeleton
        const now = new Date().toISOString();
        libObj = { metadata: { name: fileName || 'library', createdAt: now, updatedAt: now, schemaVersion: 1 }, namespaces: { [namespace]: [] } };
      }

      // Migrate legacy if needed
      const legacy = libFormat.detectLegacyFormat(libObj);
      if (legacy.isLegacy) libObj = libFormat.migrateLegacyToNamespaced(libObj, legacy.inferredNamespace || namespace);

      if (!libObj.namespaces) libObj.namespaces = {};
      if (!Array.isArray(libObj.namespaces[namespace])) libObj.namespaces[namespace] = [];

      if (replaceExisting && entry && (entry.id || entry.name)) {
        const idx = libObj.namespaces[namespace].findIndex(e => e.id === entry.id || e.name === entry.name);
        if (idx !== -1) {
          libObj.namespaces[namespace][idx] = entry;
        } else {
          libObj.namespaces[namespace].push(entry);
        }
      } else if (entry) {
        libObj.namespaces[namespace].push(entry);
      }

      // Update metadata
      if (!libObj.metadata) libObj.metadata = {};
      libObj.metadata.updatedAt = new Date().toISOString();

      const bodyStr = JSON.stringify(libObj, null, 2);

      if (targetFileId) {
        const updateResp = await gapi.client.drive.files.update({ fileId: targetFileId, media: { mimeType: 'application/json', body: bodyStr } });
        return { fileId: targetFileId, result: updateResp.result };
      } else {
        // Create in specified folderPath
        if (!fileName || String(fileName).trim() === '') throw new Error('Filename required to create a new library file');
        const folderId = await this._getFolderIdByPathInternal(folderPath);
        const resource = { name: fileName || 'library.json', mimeType: 'application/json' };
        if (folderId && folderId !== 'root') resource.parents = [folderId];

        // Create the file resource first to ensure name/parents are set
        const createResp = await gapi.client.drive.files.create({ resource, fields: 'id,name' });
        const createdId = createResp.result && createResp.result.id;

        if (createdId) {
          try {
            const updateResp = await gapi.client.drive.files.update({ fileId: createdId, media: { mimeType: 'application/json', body: bodyStr } });
            return { fileId: createdId, result: updateResp.result };
          } catch (updateErr: unknown) {
            console.warn('Failed to upload content after create in createOrUpdate flow, returning created resource', updateErr);
            return { fileId: createdId, result: createResp.result };
          }
        }

        throw new Error('Failed to create Drive file resource');
      }
    } catch (error: unknown) {
      console.error('Error creating/updating library file:', error);
      throw new Error('Failed to create or update library file');
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

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
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

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
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

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
    }

    // Find or create artist
    let artist = libraryData.artists.find(a => a.name === artistName);
    if (!artist) {
      console.log(`Artist '${artistName}' not found, creating new artist`);
      artist = {
        name: artistName,
        albums: []
      };
      libraryData.artists.push(artist);
    }

    // Find or create album
    let album = artist.albums.find(a => a.title === albumTitle);
    if (!album) {
      console.log(`Album '${albumTitle}' not found for artist '${artistName}', creating new album`);
      album = {
        title: albumTitle,
        songs: []
      };
      artist.albums.push(album);
    }

    const newSong = {
      name: songData.title,
      chords: songData.chords || '',
      lyrics: songData.lyrics || '',
      notes: songData.notes || '',
      chordFingerings: songData.chordFingerings || {},
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

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
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
    if (songData.title !== undefined) song.title = songData.title;
    song.chords = songData.chords !== undefined ? songData.chords : song.chords;
    song.lyrics = songData.lyrics !== undefined ? songData.lyrics : song.lyrics;
    song.notes = songData.notes !== undefined ? songData.notes : song.notes;
    song.chordFingerings = songData.chordFingerings !== undefined ? songData.chordFingerings : song.chordFingerings;
    song.updatedAt = new Date().toISOString();

    await this.saveLibrary(libraryData);
    
    console.log('Song updated successfully:', song.title);
    return song;
  }

  async deleteSong(libraryData, artistName, albumTitle, songTitle) {
    return this.withAutoAuth(this._deleteSongInternal, 'deleteSong', libraryData, artistName, albumTitle, songTitle);
  }

  async _deleteSongInternal(libraryData, artistName, albumTitle, songTitle) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
    }

    const artist = libraryData.artists.find(a => a.name === artistName);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const album = artist.albums.find(a => a.title === albumTitle);
    if (!album) {
      throw new Error('Album not found');
    }

    const songIndex = album.songs.findIndex(s => s.title === songTitle);
    if (songIndex === -1) {
      throw new Error('Song not found');
    }

    // Remove the song from the album
    const deletedSong = album.songs.splice(songIndex, 1)[0];

    // If the album has no more songs, remove the album
    if (album.songs.length === 0) {
      const albumIndex = artist.albums.findIndex(a => a.title === albumTitle);
      artist.albums.splice(albumIndex, 1);
    }

    // If the artist has no more albums, remove the artist
    if (artist.albums.length === 0) {
      const artistIndex = libraryData.artists.findIndex(a => a.name === artistName);
      libraryData.artists.splice(artistIndex, 1);
    }

    await this.saveLibrary(libraryData);
    
    console.log('Song deleted successfully:', deletedSong.title);
    return deletedSong;
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
    } catch (error: unknown) {
      console.error('Failed to handle OAuth token:', error);
      throw error;
    }
  }

  /**
   * List all folders in Google Drive with their full paths
   * @param {string} parentId - Parent folder ID (optional, defaults to root)
   * @param {string} currentPath - Current path for building full paths
   * @returns {Promise<Array>} Array of folder objects with name, id, and fullPath
   */
  async listFolders(parentId = null, currentPath = '/') {
    return this.withAutoAuth(this._listFoldersInternal, 'listFolders', parentId, currentPath);
  }

  async _listFoldersInternal(parentId = null, currentPath = '/') {
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

      console.log('🔍 GoogleDriveServiceModern: Listing folders with query:', query);

      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id,name,parents)',
        orderBy: 'name',
        pageSize: 100
      });

      console.log('🔍 GoogleDriveServiceModern: Drive API response:', response);
      const folders = response.result.files || [];
      console.log('🔍 GoogleDriveServiceModern: Found', folders.length, 'folders at path:', currentPath);
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
            const subfolders = await this._listFoldersInternal(folder.id, fullPath);
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
    return this.withAutoAuth(this._getFolderSuggestionsInternal, 'getFolderSuggestions');
  }

  async _getFolderSuggestionsInternal() {
    try {
      console.log('🔍 GoogleDriveServiceModern: Starting folder suggestions...');
      const folders = await this._listFoldersInternal();
      console.log('🔍 GoogleDriveServiceModern: Found folders:', folders);
      
      // Always include root folder as first option
      const options = [
        {
          value: '/',
          label: '/ (Root folder)',
          key: 'root'
        }
      ];

      // Add all discovered folders
      folders.forEach(folder => {
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

      console.log('🔍 GoogleDriveServiceModern: Final folder options:', options);
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
    return this.withAutoAuth(this._findFileInternal, 'findFile', fileName, folderPath);
  }

  async _findFileInternal(fileName, folderPath = '/') {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    try {
      console.log('🔍 GoogleDriveServiceModern: Searching for file:', fileName, 'in folder:', folderPath);
      
      // First, search for the file by name across all folders
      let query = `name='${fileName}' and trashed=false`;

      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id,name,parents,modifiedTime)',
        spaces: 'drive'
      });

      const files = response.result.files;
      console.log('🔍 GoogleDriveServiceModern: Found files with name:', files);
      
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
        console.log('🔍 GoogleDriveServiceModern: File location:', actualLocation);
        
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
  async createNewLibrary(fileName, folderPath = '/') {
    return this.withAutoAuth(this._createNewLibraryInternal, 'createNewLibrary', fileName, folderPath);
  }

  async _createNewLibraryInternal(fileName, folderPath = '/') {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    if (!fileName || String(fileName).trim() === '') {
      throw new Error('Filename required to create a new library file');
    }

    try {
      // Create initial library structure
      const initialData = {
        version: '1.0',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        artists: {},
        songs: [],
        metadata: {
          createdBy: this.userEmail,
          libraryName: fileName.replace('.json', ''),
          description: 'Song library created with Song Tabs App'
        }
      };

      // Resolve folder and create the file in the intended folder
      const folderId = await this._getFolderIdByPathInternal(folderPath);
      const resource = { name: fileName, mimeType: 'application/json' };
      if (folderId && folderId !== 'root') resource.parents = [folderId];
      // Create the file resource first (ensure name/parents are set)
      const createResp = await gapi.client.drive.files.create({ resource, fields: 'id,name' });
      const createdId = createResp.result && createResp.result.id;
      const createdName = createResp.result && createResp.result.name;

      // Ensure we upload the initial JSON body; some environments can create an empty file when media
      // isn't properly attached during create. Use files.update to reliably write the content.
      if (createdId) {
        try {
          const updateResp = await gapi.client.drive.files.update({
            fileId: createdId,
            media: {
              mimeType: 'application/json',
              body: JSON.stringify(initialData, null, 2)
            }
          });

          console.log('New library created and initialized successfully:', updateResp.result || createResp.result);
          GoogleDriveErrorHandler.showSuccess('create', `Created ${fileName}`);
          // Return a consistent object with id and name
          return { id: createdId, name: createdName || fileName, result: updateResp.result || createResp.result };
        } catch (updateErr: unknown) {
          // If update fails, still return the created resource so caller can attempt to recover
          console.warn('Failed to upload initial content after create - returning created resource', updateErr);
          GoogleDriveErrorHandler.showSuccess('create', `Created ${fileName} (content upload failed)`);
          return { id: createdId, name: createdName || fileName, result: createResp.result };
        }
      }

      // If no id returned from create, throw
      throw new Error('Failed to create Drive file resource');
    } catch (error: unknown) {
      console.error('Error creating new library:', error);
      throw new Error(`Failed to create new library: ${error.message}`);
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
    return this.withAutoAuth(this._moveFileInternal, 'moveFile', fileId, newFolderPath, newFileName);
  }

  async _moveFileInternal(fileId, newFolderPath, newFileName = null) {
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

      console.log('File moved successfully:', response.result);
      return response.result;
    } catch (error: unknown) {
      console.error('Error moving file:', error);
      throw new Error(`Failed to move file: ${error.message}`);
    }
  }

  /**
   * Load library data (alias for loadLibrary for consistency with modal interface)
   * @returns {Promise<Object>} Library data
   */
  async loadLibraryData() {
    return this.loadLibrary();
  }

  /**
   * Load library data by specific file ID
   * @param {string} fileId - The Google Drive file ID to load
   * @returns {Promise<Object>} Library data
   */
  async loadLibraryById(fileId) {
    return this.withAutoAuth(this._loadLibraryByIdInternal, 'loadLibraryById', fileId);
  }

  async _loadLibraryByIdInternal(fileId) {
    if (!this.isSignedIn || !this.accessToken) {
      throw new Error('User not signed in to Google Drive');
    }

    // Check if token is expired according to stored expiry
    const expiry = localStorage.getItem(this.SESSION_KEYS.TOKEN_EXPIRY);
    if (expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      if (now > expiryTime) {
        throw new Error('User not signed in to Google Drive');
      }
    }

    try {
      console.log('Loading library by file ID:', fileId);
      
      // Download file content directly by ID
      const response = await gapi.client.drive.files.get({ fileId: fileId, alt: 'media' });

      // gapi client can return different shapes depending on environment:
      // - response.body (string)
      // - response.result (object or string)
      // - response (already the parsed object)
      let rawBody = null;
      if (response && response.body) rawBody = response.body;
      else if (response && response.result) {
        // If result is string, use it; if it's an object that has a 'body', try that; otherwise, if result is an object, use it directly
        if (typeof response.result === 'string') rawBody = response.result;
        else if (response.result.body) rawBody = response.result.body;
        else rawBody = response.result;
      } else {
        rawBody = response;
      }

      if (rawBody === null || rawBody === undefined) {
        throw new Error('No content received from file');
      }

      // If rawBody is a string, parse it as JSON; if it's already an object, use it
      const libraryData = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
      console.log('Library loaded successfully from file ID:', fileId);
      
      return libraryData;
    } catch (error: unknown) {
      console.error('Error loading library by ID:', error);
      
      if (error.status === 404) {
        throw new Error('Library file not found or access denied');
      }
      
      if (error.status === 403) {
        // Check for specific app authorization error
        if (error.body && error.body.includes('appNotAuthorizedToFile')) {
          throw new Error('🔐 SCOPE CONFIGURATION ISSUE: This file was created outside the app.\n\n' +
            '❌ The current OAuth scopes in Google Cloud Console are too restrictive.\n\n' +
            '✅ SOLUTION:\n' +
            '1. Go to Google Cloud Console → APIs & Services → Credentials\n' +
            '2. Find your OAuth Client ID: ' + (this.CLIENT_ID || 'Not set') + '\n' +
            '3. Add these scopes in the "Data access" section:\n' +
            '   - https://www.googleapis.com/auth/drive\n' +
            '   - https://www.googleapis.com/auth/drive.metadata.readonly\n' +
            '4. Clear browser cache and sign in again\n\n' +
            'This will allow access to files created manually or with other apps.');
        }
        throw new Error('Access Denied: You don\'t have permission to access this file. Please sign out and sign in again to refresh permissions.');
      }
      
      if (error.message && error.message.includes('insufficient authentication scopes')) {
        throw new Error('Insufficient permissions. Please sign out and sign in again to grant additional permissions.');
      }
      
      GoogleDriveErrorHandler.handleFileError(
        error,
        `File ID: ${fileId}`,
        'load',
        { email: this.userEmail, name: this.userName }
      );
      throw new Error(`Failed to load library file: ${error.message}`);
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
      
      console.log(`🔄 Executing operation: ${operationName}`);
      
      // Try to execute the operation
      const result = await operation.apply(this, args);
      
      console.log(`✅ Operation completed successfully: ${operationName}`);
      return result;
    } catch (error: unknown) {
      console.log(`❌ Operation failed: ${operationName}`, error.message);
      
      // Check for various authentication error patterns
      const isAuthError = this.isAuthenticationError(error);
      
      if (isAuthError) {
        const retryCount = this.authRetryAttempts.get(retryKey) || 0;
        
        if (retryCount < this.maxRetryAttempts) {
          console.log(`🔐 Authentication error detected for ${operationName}:`, error.message);
          console.log(`🔄 Attempting automatic re-authentication (attempt ${retryCount + 1}/${this.maxRetryAttempts})...`);
          
          // Increment retry counter
          this.authRetryAttempts.set(retryKey, retryCount + 1);
          
          try {
            // Clear any stale session data
            this.clearSession();
            this.isSignedIn = false;
            this.accessToken = null;
            
            // Trigger the authentication flow
            await this.signIn();
            
            console.log(`✅ Re-authentication successful. Retrying ${operationName}...`);
            
            // Retry the original operation
            const result = await operation.apply(this, args);
            
            // Clear retry counter on success
            this.authRetryAttempts.delete(retryKey);
            
            console.log(`✅ Retry successful for ${operationName}`);
            return result;
          } catch (authError: unknown) {
            console.error(`❌ Re-authentication failed for ${operationName}:`, authError);
            // Clear retry counter on auth failure
            this.authRetryAttempts.delete(retryKey);
            throw new Error(`Authentication failed: ${authError.message}`);
          }
        } else {
          console.error(`🚫 Max retry attempts reached for ${operationName}`);
          this.authRetryAttempts.delete(retryKey);
          throw error;
        }
      } else {
        // For non-auth errors, just throw the original error
        console.log(`🚫 Non-auth error for ${operationName}, not retrying:`, error.message);
        throw error;
      }
    }
  }

  /**
   * Check if an error is authentication-related
   * @param {Error} error - The error to check
   * @returns {boolean} True if the error is authentication-related
   */
  isAuthenticationError(error) {
    if (!error) return false;
    
    const message = error.message || '';
    const status = error.status || error.response?.status;
    const errorBody = error.body || '';
    
    // Check for specific app authorization error (files created outside the app)
    if (status === 403 && (
      errorBody.includes('appNotAuthorizedToFile') || 
      message.includes('appNotAuthorizedToFile') ||
      errorBody.includes('The user has not granted the app') ||
      message.includes('The user has not granted the app')
    )) {
      console.log('🔍 Detected appNotAuthorizedToFile error - this is a scope configuration issue, not a retry-able auth error');
      return false; // This is NOT a retry-able auth error - it requires scope reconfiguration
    }
    
    // Check for 401 status code (token expired/invalid)
    if (status === 401) {
      return true;
    }
    
    // Check for other 403 errors that might be auth-related
    if (status === 403 && !errorBody.includes('appNotAuthorizedToFile')) {
      return true;
    }
    
    // Check for specific authentication error messages
    const authErrorPatterns = [
      'User not signed in to Google Drive',
      'Expected OAuth 2 access token',
      'login cookie or other valid authentication credential',
      'Invalid Credentials',
      'unauthorized_client',
      'invalid_token',
      'expired_token',
      'access_denied',
      'token_expired',
      'missing required authentication credential',
      'Request had insufficient authentication scopes',
      'Unauthorized',
      'authorization required'
    ];
    
    return authErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
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
