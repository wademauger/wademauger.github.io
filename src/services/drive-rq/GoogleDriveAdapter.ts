/**
 * Google Drive Adapter - Real Implementation
 * 
 * Wraps Google Drive API (gapi) for use with React Query
 */

/* global gapi, google */

import type {
  IDriveAdapter,
  AuthState,
  DriveAdapterConfig,
  LibraryData,
  MergeOptions
} from './types';
import { AuthError, NotFoundError, NetworkError, DriveError } from './types';
import { mergeLibraries as mergeLibrariesUtil } from './utils';

/**
 * Real Google Drive Adapter using gapi client
 */
export class GoogleDriveAdapter implements IDriveAdapter {
  private config: DriveAdapterConfig | null = null;
  private authState: AuthState = {
    isSignedIn: false,
    accessToken: null,
    userEmail: null,
    userName: null,
    tokenExpiry: null
  };
  
  private gapiInited = false;
  private gisInited = false;
  private tokenClient: any = null;
  
  // ============================================================================
  // Initialization
  // ============================================================================
  
  async initialize(config: DriveAdapterConfig): Promise<void> {
    this.config = config;
    
    // Initialize gapi
    await this.initializeGapi();
    
    // Initialize GIS (Google Identity Services)
    await this.initializeGis();
  }
  
  private async initializeGapi(): Promise<void> {
    if (this.gapiInited) return;
    
    return new Promise((resolve, reject) => {
      if (typeof gapi === 'undefined') {
        reject(new DriveError('Google API client not loaded', 'GAPI_NOT_LOADED'));
        return;
      }
      
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: this.config?.apiKey,
            discoveryDocs: [
              this.config?.discoveryDoc || 
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ]
          });
          this.gapiInited = true;
          resolve();
        } catch (error: any) {
          reject(new DriveError(
            `Failed to initialize Google API: ${error.message}`,
            'GAPI_INIT_FAILED'
          ));
        }
      });
    });
  }
  
  private async initializeGis(): Promise<void> {
    if (this.gisInited) return;
    
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.accounts) {
        reject(new DriveError(
          'Google Identity Services not loaded',
          'GIS_NOT_LOADED'
        ));
        return;
      }
      
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.config!.clientId,
          scope: this.config?.scopes?.join(' ') || 
            'openid https://www.googleapis.com/auth/userinfo.email ' +
            'https://www.googleapis.com/auth/userinfo.profile ' +
            'https://www.googleapis.com/auth/drive',
          callback: (tokenResponse: any) => {
            this.handleTokenResponse(tokenResponse);
          }
        });
        this.gisInited = true;
        resolve();
      } catch (error: any) {
        reject(new DriveError(
          `Failed to initialize GIS: ${error.message}`,
          'GIS_INIT_FAILED'
        ));
      }
    });
  }
  
  private handleTokenResponse(tokenResponse: any): void {
    if (tokenResponse.error) {
      console.error('Token error:', tokenResponse.error);
      return;
    }
    
    this.authState.accessToken = tokenResponse.access_token;
    this.authState.tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);
    this.authState.isSignedIn = true;
    
    // Fetch user info
    this.fetchUserInfo();
  }
  
  private async fetchUserInfo(): Promise<void> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${this.authState.accessToken}`
          }
        }
      );
      
      if (response.ok) {
        const userInfo = await response.json();
        this.authState.userEmail = userInfo.email || null;
        this.authState.userName = userInfo.name || null;
      }
    } catch (error) {
      console.warn('Failed to fetch user info:', error);
    }
  }
  
  // ============================================================================
  // Authentication
  // ============================================================================
  
  async signIn(): Promise<AuthState> {
    if (!this.tokenClient) {
      throw new AuthError('Token client not initialized');
    }
    
    return new Promise((resolve, reject) => {
      // Store resolve/reject for callback
      const originalCallback = this.tokenClient.callback;
      
      this.tokenClient.callback = (tokenResponse: any) => {
        // Restore original callback
        this.tokenClient.callback = originalCallback;
        
        if (tokenResponse.error) {
          reject(new AuthError(tokenResponse.error_description || tokenResponse.error));
          return;
        }
        
        this.handleTokenResponse(tokenResponse);
        
        // Wait a bit for user info to load
        setTimeout(() => {
          resolve({ ...this.authState });
        }, 500);
      };
      
      // Request token
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }
  
  async signOut(): Promise<void> {
    if (this.authState.accessToken && typeof google !== 'undefined') {
      google.accounts.oauth2.revoke(this.authState.accessToken, () => {
        console.log('Token revoked');
      });
    }
    
    this.authState = {
      isSignedIn: false,
      accessToken: null,
      userEmail: null,
      userName: null,
      tokenExpiry: null
    };
  }
  
  getAuthState(): AuthState {
    return { ...this.authState };
  }
  
  // ============================================================================
  // Library Operations
  // ============================================================================
  
  async loadLibrary(fileId?: string): Promise<LibraryData> {
    this.checkAuth();
    
    try {
      // If no fileId, try to find the default library file
      const id = fileId || await this.findLibraryFile();
      
      if (!id) {
        // Return empty library if no file exists
        return {
          version: '1.0.0',
          lastModified: new Date().toISOString()
        };
      }
      
      const response = await gapi.client.drive.files.get({
        fileId: id,
        alt: 'media'
      });
      
      return response.result as LibraryData;
    } catch (error: any) {
      if (error.status === 404) {
        throw new NotFoundError(`Library file not found: ${fileId}`);
      }
      if (error.status === 401) {
        throw new AuthError('Authentication expired');
      }
      throw new NetworkError(`Failed to load library: ${error.message}`);
    }
  }
  
  async saveLibrary(data: LibraryData, fileId?: string): Promise<string> {
    this.checkAuth();
    
    try {
      const content = JSON.stringify({
        ...data,
        lastModified: new Date().toISOString(),
        version: data.version || '1.0.0'
      }, null, 2);
      
      const metadata = {
        name: this.config?.defaultLibraryFilename || 'library.json',
        mimeType: 'application/json'
      };
      
      if (fileId) {
        // Update existing file
        const response = await gapi.client.request({
          path: `/upload/drive/v3/files/${fileId}`,
          method: 'PATCH',
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': 'multipart/related; boundary=boundary'
          },
          body: this.createMultipartBody(metadata, content)
        });
        
        return response.result.id;
      } else {
        // Create new file
        const response = await gapi.client.request({
          path: '/upload/drive/v3/files',
          method: 'POST',
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': 'multipart/related; boundary=boundary'
          },
          body: this.createMultipartBody(metadata, content)
        });
        
        return response.result.id;
      }
    } catch (error: any) {
      if (error.status === 401) {
        throw new AuthError('Authentication expired');
      }
      throw new NetworkError(`Failed to save library: ${error.message}`);
    }
  }
  
  async mergeLibraries(fileIds: string[], options?: MergeOptions): Promise<LibraryData> {
    this.checkAuth();
    
    const libraries: LibraryData[] = [];
    
    for (const id of fileIds) {
      try {
        const lib = await this.loadLibrary(id);
        libraries.push(lib);
      } catch (error) {
        console.warn(`Failed to load library ${id} for merge:`, error);
      }
    }
    
    return mergeLibrariesUtil(libraries, options);
  }
  
  // ============================================================================
  // CRUD Operations
  // ============================================================================
  
  async getEntry<T = any>(
    collection: keyof LibraryData,
    id: string,
    fileId?: string
  ): Promise<T | null> {
    const library = await this.loadLibrary(fileId);
    const col = library[collection];
    
    if (!col) return null;
    
    if (Array.isArray(col)) {
      const entry = col.find((item: any) => item.id === id);
      return entry || null;
    }
    
    if (typeof col === 'object') {
      return col[id] || null;
    }
    
    return null;
  }
  
  async setEntry<T = any>(
    collection: keyof LibraryData,
    id: string,
    data: T,
    fileId?: string
  ): Promise<void> {
    const library = await this.loadLibrary(fileId);
    
    // Initialize collection if needed
    if (!library[collection]) {
      const arrayCollections = ['artists', 'entries'];
      library[collection] = arrayCollections.includes(collection as string) ? [] : {};
    }
    
    const col = library[collection];
    const entry = { ...data, id } as any;
    
    if (Array.isArray(col)) {
      const index = col.findIndex((item: any) => item.id === id);
      if (index >= 0) {
        col[index] = entry;
      } else {
        col.push(entry);
      }
    } else if (typeof col === 'object') {
      col[id] = entry;
    }
    
    await this.saveLibrary(library, fileId);
  }
  
  async deleteEntry(
    collection: keyof LibraryData,
    id: string,
    fileId?: string
  ): Promise<void> {
    const library = await this.loadLibrary(fileId);
    const col = library[collection];
    
    if (!col) {
      throw new NotFoundError(`Collection ${collection} not found`);
    }
    
    if (Array.isArray(col)) {
      const index = col.findIndex((item: any) => item.id === id);
      if (index >= 0) {
        col.splice(index, 1);
      }
    } else if (typeof col === 'object') {
      delete col[id];
    }
    
    await this.saveLibrary(library, fileId);
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  private checkAuth(): void {
    if (!this.authState.isSignedIn) {
      throw new AuthError('Not authenticated');
    }
    
    // Check if token is expired
    if (this.authState.tokenExpiry && Date.now() >= this.authState.tokenExpiry) {
      this.authState.isSignedIn = false;
      throw new AuthError('Token expired');
    }
  }
  
  private async findLibraryFile(): Promise<string | null> {
    try {
      const response = await gapi.client.drive.files.list({
        q: `name='${this.config?.defaultLibraryFilename || 'library.json'}' and trashed=false`,
        fields: 'files(id, name)',
        pageSize: 1
      });
      
      const files = response.result.files;
      return files && files.length > 0 ? files[0].id : null;
    } catch (error) {
      console.warn('Failed to find library file:', error);
      return null;
    }
  }
  
  private createMultipartBody(metadata: any, content: string): string {
    const delimiter = '\r\n--boundary\r\n';
    const closeDelimiter = '\r\n--boundary--';
    
    const multipartBody = [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      JSON.stringify(metadata),
      delimiter,
      'Content-Type: application/json\r\n\r\n',
      content,
      closeDelimiter
    ].join('');
    
    return multipartBody;
  }
}

/**
 * Create a Google Drive adapter instance
 */
export function createGoogleDriveAdapter(): GoogleDriveAdapter {
  return new GoogleDriveAdapter();
}
