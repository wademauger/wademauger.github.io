/**
 * Type definitions for Google Drive Adapter
 * 
 * This module defines all TypeScript interfaces and types used
 * by the Google Drive adapter for library file management.
 */

/**
 * Authentication state for a user
 */
export interface AuthState {
  isSignedIn: boolean;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
  userPicture: string | null;
  tokenExpiry: number | null; // Unix timestamp (ms)
}

/**
 * Configuration for the Google Drive adapter
 */
export interface DriveAdapterConfig {
  clientId: string;
  scopes?: string[];
  discoveryDoc?: string;
  defaultLibraryFilename?: string;
}

/**
 * Represents a file on Google Drive
 */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: number;
  parents?: string[];
}

/**
 * Options for finding files
 */
export interface FindFileOptions {
  filename: string;
  folder?: string;
  mimeType?: string;
}

/**
 * Options for creating or updating files
 */
export interface FileOperationOptions {
  fileId?: string; // If provided, update; otherwise create
  filename: string;
  content: any; // Will be JSON.stringified
  folder?: string;
  mimeType?: string;
}

/**
 * Result of a file operation
 */
export interface FileOperationResult {
  fileId: string;
  success: boolean;
  file?: DriveFile;
  error?: string;
}

/**
 * Structure of the unified library object
 * All apps store their data in this single JSON structure
 */
export interface LibraryData {
  // Recipe app data
  recipes?: Record<string, any>;
  
  // Music tabs app data  
  artists?: Array<{
    name: string;
    albums: Array<{
      title: string;
      songs: Array<any>;
    }>;
  }>;
  
  // Knitting designer data
  panels?: Record<string, any>;
  projects?: Record<string, any>;
  knittingProjects?: Record<string, any>;
  colorworkPatterns?: Record<string, any>;
  
  // Generic entries (legacy format)
  entries?: Array<any>;
  
  // Metadata
  version?: string;
  lastModified?: string;
  
  // Allow additional properties
  [key: string]: any;
}

/**
 * Options for merging library files
 */
export interface MergeOptions {
  strategy?: 'deep' | 'shallow' | 'replace';
  conflictResolution?: 'keepFirst' | 'keepLast' | 'error';
  preserveArrays?: boolean;
}

/**
 * Result of a merge operation
 */
export interface MergeResult {
  success: boolean;
  data: LibraryData;
  conflicts?: Array<{
    path: string;
    message: string;
  }>;
  warnings?: string[];
}

/**
 * CRUD operation types
 */
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

/**
 * Options for CRUD operations on library members
 */
export interface CrudOptions<T = any> {
  operation: CrudOperation;
  collection: keyof LibraryData; // e.g., 'recipes', 'projects', 'panels'
  id?: string; // Required for read, update, delete
  data?: T; // Required for create, update
}

/**
 * Result of a CRUD operation
 */
export interface CrudResult<T = any> {
  success: boolean;
  operation: CrudOperation;
  collection: string;
  id?: string;
  data?: T;
  error?: string;
}

/**
 * Interface for Google Drive adapter implementations
 * Both real and mock implementations must conform to this interface
 */
export interface IGoogleDriveAdapter {
  // Authentication
  initialize(config: DriveAdapterConfig): Promise<void>;
  signIn(): Promise<AuthState>;
  signOut(): Promise<void>;
  getAuthState(): AuthState;
  isAuthenticated(): boolean;
  
  // File operations
  findFile(options: FindFileOptions): Promise<DriveFile | null>;
  readFile(fileId: string): Promise<LibraryData>;
  writeFile(options: FileOperationOptions): Promise<FileOperationResult>;
  deleteFile(fileId: string): Promise<boolean>;
  listFiles(folder?: string): Promise<DriveFile[]>;
  
  // Library operations
  loadLibrary(fileId?: string): Promise<LibraryData>;
  saveLibrary(data: LibraryData, fileId?: string): Promise<FileOperationResult>;
  
  // Merge operations
  mergeLibraries(
    files: Array<{ fileId?: string; data?: LibraryData }>,
    options?: MergeOptions
  ): Promise<MergeResult>;
  
  // CRUD operations
  createEntry<T = any>(
    collection: keyof LibraryData,
    data: T,
    fileId?: string
  ): Promise<CrudResult<T>>;
  
  readEntry<T = any>(
    collection: keyof LibraryData,
    id: string,
    fileId?: string
  ): Promise<CrudResult<T>>;
  
  updateEntry<T = any>(
    collection: keyof LibraryData,
    id: string,
    data: Partial<T>,
    fileId?: string
  ): Promise<CrudResult<T>>;
  
  deleteEntry(
    collection: keyof LibraryData,
    id: string,
    fileId?: string
  ): Promise<CrudResult<void>>;
}

/**
 * Error types specific to Drive operations
 */
export class DriveAdapterError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'DriveAdapterError';
  }
}

export class AuthenticationError extends DriveAdapterError {
  constructor(message: string, originalError?: any) {
    super(message, 'AUTH_ERROR', originalError);
    this.name = 'AuthenticationError';
  }
}

export class FileNotFoundError extends DriveAdapterError {
  constructor(message: string, originalError?: any) {
    super(message, 'FILE_NOT_FOUND', originalError);
    this.name = 'FileNotFoundError';
  }
}

export class MergeConflictError extends DriveAdapterError {
  constructor(
    message: string,
    public conflicts: Array<{ path: string; message: string }>,
    originalError?: any
  ) {
    super(message, 'MERGE_CONFLICT', originalError);
    this.name = 'MergeConflictError';
  }
}

export class NetworkError extends DriveAdapterError {
  constructor(message: string, originalError?: any) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}
