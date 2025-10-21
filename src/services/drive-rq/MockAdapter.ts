/**
 * Simplified Mock Drive Adapter for React Query
 * 
 * Thin API client - no caching, no state management
 * React Query handles all that
 */

import type {
  IDriveAdapter,
  AuthState,
  DriveAdapterConfig,
  LibraryData,
  MergeOptions
} from './types';
import { AuthError, NotFoundError, NetworkError } from './types';
import { mergeLibraries } from './utils';

/**
 * Mock Drive Adapter - Pure API client
 */
export class MockDriveAdapter implements IDriveAdapter {
  private authState: AuthState = {
    isSignedIn: false,
    accessToken: null,
    userEmail: null,
    userName: null,
    tokenExpiry: null
  };
  
  private config: DriveAdapterConfig | null = null;
  private files: Map<string, LibraryData> = new Map();
  private nextFileId = 1;
  
  // Test configuration
  private shouldFailAuth = false;
  private shouldFailNetwork = false;
  private networkDelay = 0;
  
  // ============================================================================
  // Test Utilities
  // ============================================================================
  
  setAuthFailure(shouldFail: boolean): void {
    this.shouldFailAuth = shouldFail;
  }
  
  setNetworkFailure(shouldFail: boolean): void {
    this.shouldFailNetwork = shouldFail;
  }
  
  setNetworkDelay(ms: number): void {
    this.networkDelay = ms;
  }
  
  reset(): void {
    this.authState = {
      isSignedIn: false,
      accessToken: null,
      userEmail: null,
      userName: null,
      tokenExpiry: null
    };
    this.files.clear();
    this.nextFileId = 1;
  }
  
  seedFile(id: string, data: LibraryData): void {
    this.files.set(id, data);
  }
  
  // ============================================================================
  // IDriveAdapter Implementation
  // ============================================================================
  
  private async delay(): Promise<void> {
    if (this.networkDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.networkDelay));
    }
  }
  
  private checkAuth(): void {
    if (!this.authState.isSignedIn) {
      throw new AuthError('Not authenticated');
    }
  }
  
  private checkNetwork(): void {
    if (this.shouldFailNetwork) {
      throw new NetworkError('Network failure');
    }
  }
  
  async initialize(config: DriveAdapterConfig): Promise<void> {
    await this.delay();
    this.config = config;
  }
  
  async signIn(): Promise<AuthState> {
    await this.delay();
    
    if (this.shouldFailAuth) {
      throw new AuthError('Authentication failed');
    }
    
    this.authState = {
      isSignedIn: true,
      accessToken: 'mock-token-' + Date.now(),
      userEmail: 'test@example.com',
      userName: 'Test User',
      tokenExpiry: Date.now() + 3600000
    };
    
    return this.authState;
  }
  
  async signOut(): Promise<void> {
    await this.delay();
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
  
  async loadLibrary(fileId?: string): Promise<LibraryData> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const id = fileId || 'default';
    const library = this.files.get(id);
    
    if (!library) {
      return { version: '1.0.0', lastModified: new Date().toISOString() };
    }
    
    return JSON.parse(JSON.stringify(library));
  }
  
  async saveLibrary(data: LibraryData, fileId?: string): Promise<string> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const id = fileId || 'default';
    
    const toSave = {
      ...data,
      lastModified: new Date().toISOString(),
      version: data.version || '1.0.0'
    };
    
    this.files.set(id, toSave);
    return id;
  }
  
  async mergeLibraries(fileIds: string[], options?: MergeOptions): Promise<LibraryData> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const libraries: LibraryData[] = [];
    
    for (const id of fileIds) {
      const lib = await this.loadLibrary(id);
      libraries.push(lib);
    }
    
    return mergeLibraries(libraries, options);
  }
  
  async getEntry<T = unknown>(
    collection: keyof LibraryData,
    id: string,
    fileId?: string
  ): Promise<T | null> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const library = await this.loadLibrary(fileId);
    const col = library[collection];
    
    if (!col) return null;
    
    if (Array.isArray(col)) {
      const entry = col.find((item) => (item as { id?: string }).id === id);
      return (entry as T) || null;
    }
    
    if (typeof col === 'object' && col !== null) {
      return ((col as Record<string, unknown>)[id] as T) || null;
    }
    
    return null;
  }
  
  async setEntry<T = unknown>(
    collection: keyof LibraryData,
    id: string,
    data: T,
    fileId?: string
  ): Promise<void> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const library = await this.loadLibrary(fileId);
    
    // Initialize collection if needed
    if (!library[collection]) {
      const arrayCollections = ['artists', 'entries'];
      library[collection] = arrayCollections.includes(collection as string) ? [] : {};
    }
    
    const col = library[collection];
    const entry = { ...(data as object), id };
    
    if (Array.isArray(col)) {
      const index = col.findIndex((item) => (item as { id?: string }).id === id);
      if (index >= 0) {
        col[index] = entry;
      } else {
        col.push(entry);
      }
    } else if (typeof col === 'object' && col !== null) {
      (col as Record<string, unknown>)[id] = entry;
    }
    
    await this.saveLibrary(library, fileId);
  }
  
  async deleteEntry(
    collection: keyof LibraryData,
    id: string,
    fileId?: string
  ): Promise<void> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const library = await this.loadLibrary(fileId);
    const col = library[collection];
    
    if (!col) {
      throw new NotFoundError(`Collection ${collection} not found`);
    }
    
    if (Array.isArray(col)) {
      const index = col.findIndex((item) => (item as { id?: string }).id === id);
      if (index >= 0) {
        col.splice(index, 1);
      }
    } else if (typeof col === 'object' && col !== null) {
      delete (col as Record<string, unknown>)[id];
    }
    
    await this.saveLibrary(library, fileId);
  }
}

/**
 * Create a mock adapter instance
 */
export function createMockAdapter(): MockDriveAdapter {
  return new MockDriveAdapter();
}
