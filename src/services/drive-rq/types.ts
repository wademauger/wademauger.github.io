/**
 * Simplified Type Definitions for React Query Google Drive Adapter
 * 
 * Minimal types for a thin API client - React Query handles caching, states, etc.
 */

/**
 * Authentication state
 */
export interface AuthState {
  isSignedIn: boolean;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
  tokenExpiry: number | null;
}

/**
 * Configuration for the adapter
 */
export interface DriveAdapterConfig {
  clientId: string;
  apiKey?: string;
  appId?: string;
  scopes?: string[];
  discoveryDoc?: string;
  defaultLibraryFilename?: string;
}

/**
 * Drive file metadata
 */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  parents?: string[];
}

/**
 * Unified library structure
 */
export interface LibraryData {
  recipes?: Record<string, any>;
  artists?: Array<{ name: string; albums: any[] }>;
  panels?: Record<string, any>;
  projects?: Record<string, any>;
  knittingProjects?: Record<string, any>;
  colorworkPatterns?: Record<string, any>;
  entries?: Array<any>;
  version?: string;
  lastModified?: string;
  [key: string]: any;
}

/**
 * Merge options
 */
export interface MergeOptions {
  strategy?: 'deep' | 'shallow' | 'replace';
  precedence?: 'first' | 'last';
}

/**
 * Minimal adapter interface - just API calls
 * React Query handles caching, states, retries, etc.
 */
export interface IDriveAdapter {
  // Auth
  initialize(config: DriveAdapterConfig): Promise<void>;
  signIn(): Promise<AuthState>;
  signOut(): Promise<void>;
  getAuthState(): AuthState;
  
  // Library operations (React Query will cache these)
  loadLibrary(fileId?: string): Promise<LibraryData>;
  saveLibrary(data: LibraryData, fileId?: string): Promise<string>; // Returns fileId
  mergeLibraries(fileIds: string[], options?: MergeOptions): Promise<LibraryData>;
  
  // CRUD operations (React Query will cache these)
  getEntry<T = any>(collection: keyof LibraryData, id: string, fileId?: string): Promise<T | null>;
  setEntry<T = any>(collection: keyof LibraryData, id: string, data: T, fileId?: string): Promise<void>;
  deleteEntry(collection: keyof LibraryData, id: string, fileId?: string): Promise<void>;
}

/**
 * Error types
 */
export class DriveError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DriveError';
  }
}

export class AuthError extends DriveError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
  }
}

export class NotFoundError extends DriveError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

export class NetworkError extends DriveError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}
