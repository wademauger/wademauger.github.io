/**
 * Mock Google Drive Adapter
 * 
 * Simulates Google Drive API responses for testing without real API calls.
 * Implements the full IGoogleDriveAdapter interface with in-memory storage.
 */

import type {
  IGoogleDriveAdapter,
  AuthState,
  DriveAdapterConfig,
  DriveFile,
  FindFileOptions,
  FileOperationOptions,
  FileOperationResult,
  LibraryData,
  MergeOptions,
  MergeResult,
  CrudResult
} from './types';
import {
  AuthenticationError,
  FileNotFoundError,
  NetworkError
} from './types';
import { mergeLibraries, normalizeLibraryData } from './merge';
import { executeCrudOperation } from './crud';

/**
 * In-memory file storage for the mock adapter
 */
interface MockFileStorage {
  [fileId: string]: {
    metadata: DriveFile;
    content: LibraryData;
  };
}

/**
 * Mock Google Drive Adapter
 * Provides a complete implementation that simulates Drive behavior
 */
export class MockGoogleDriveAdapter implements IGoogleDriveAdapter {
  private authState: AuthState;
  private config: DriveAdapterConfig | null;
  private files: MockFileStorage;
  private nextFileId: number;
  private simulateNetworkDelay: boolean;
  private networkDelayMs: number;
  private shouldFailAuth: boolean;
  private shouldFailNetwork: boolean;
  
  constructor() {
    this.authState = {
      isSignedIn: false,
      accessToken: null,
      userEmail: null,
      userName: null,
      userPicture: null,
      tokenExpiry: null
    };
    this.config = null;
    this.files = {};
    this.nextFileId = 1;
    this.simulateNetworkDelay = false;
    this.networkDelayMs = 100;
    this.shouldFailAuth = false;
    this.shouldFailNetwork = false;
  }
  
  // ============================================================================
  // Test Configuration Methods (not part of IGoogleDriveAdapter interface)
  // ============================================================================
  
  /**
   * Configure the mock to simulate network delays
   */
  setNetworkDelay(enabled: boolean, delayMs: number = 100): void {
    this.simulateNetworkDelay = enabled;
    this.networkDelayMs = delayMs;
  }
  
  /**
   * Configure the mock to fail authentication
   */
  setAuthFailure(shouldFail: boolean): void {
    this.shouldFailAuth = shouldFail;
  }
  
  /**
   * Configure the mock to fail network requests
   */
  setNetworkFailure(shouldFail: boolean): void {
    this.shouldFailNetwork = shouldFail;
  }
  
  /**
   * Reset the mock state
   */
  reset(): void {
    this.authState = {
      isSignedIn: false,
      accessToken: null,
      userEmail: null,
      userName: null,
      userPicture: null,
      tokenExpiry: null
    };
    this.files = {};
    this.nextFileId = 1;
    this.shouldFailAuth = false;
    this.shouldFailNetwork = false;
  }
  
  /**
   * Seed mock files for testing
   */
  seedFiles(files: Array<{ name: string; content: LibraryData }>): string[] {
    const fileIds: string[] = [];
    
    for (const file of files) {
      const fileId = `mock-file-${this.nextFileId++}`;
      this.files[fileId] = {
        metadata: {
          id: fileId,
          name: file.name,
          mimeType: 'application/json',
          modifiedTime: new Date().toISOString(),
          size: JSON.stringify(file.content).length
        },
        content: normalizeLibraryData(file.content)
      };
      fileIds.push(fileId);
    }
    
    return fileIds;
  }
  
  /**
   * Get all files (for testing/inspection)
   */
  getAllFiles(): MockFileStorage {
    return { ...this.files };
  }
  
  // ============================================================================
  // IGoogleDriveAdapter Implementation
  // ============================================================================
  
  /**
   * Simulate network delay if configured
   */
  private async delay(): Promise<void> {
    if (this.simulateNetworkDelay) {
      await new Promise(resolve => setTimeout(resolve, this.networkDelayMs));
    }
  }
  
  /**
   * Check authentication state
   */
  private checkAuth(): void {
    if (!this.authState.isSignedIn) {
      throw new AuthenticationError('User is not authenticated');
    }
  }
  
  /**
   * Check for network failure simulation
   */
  private checkNetwork(): void {
    if (this.shouldFailNetwork) {
      throw new NetworkError('Simulated network failure');
    }
  }
  
  async initialize(config: DriveAdapterConfig): Promise<void> {
    await this.delay();
    this.config = config;
  }
  
  async signIn(): Promise<AuthState> {
    await this.delay();
    
    if (this.shouldFailAuth) {
      throw new AuthenticationError('Mock authentication failed');
    }
    
    // Simulate successful sign-in
    this.authState = {
      isSignedIn: true,
      accessToken: 'mock-access-token-' + Date.now(),
      userEmail: 'test@example.com',
      userName: 'Test User',
      userPicture: 'https://example.com/avatar.jpg',
      tokenExpiry: Date.now() + 3600000 // 1 hour from now
    };
    
    return { ...this.authState };
  }
  
  async signOut(): Promise<void> {
    await this.delay();
    
    this.authState = {
      isSignedIn: false,
      accessToken: null,
      userEmail: null,
      userName: null,
      userPicture: null,
      tokenExpiry: null
    };
  }
  
  getAuthState(): AuthState {
    return { ...this.authState };
  }
  
  isAuthenticated(): boolean {
    return this.authState.isSignedIn;
  }
  
  async findFile(options: FindFileOptions): Promise<DriveFile | null> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    // Search for file by name (and optionally folder)
    for (const fileId in this.files) {
      const file = this.files[fileId];
      if (file.metadata.name === options.filename) {
        // If folder is specified, check parents
        if (options.folder) {
          if (file.metadata.parents?.includes(options.folder)) {
            return { ...file.metadata };
          }
        } else {
          return { ...file.metadata };
        }
      }
    }
    
    return null;
  }
  
  async readFile(fileId: string): Promise<LibraryData> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const file = this.files[fileId];
    if (!file) {
      throw new FileNotFoundError(`File with ID "${fileId}" not found`);
    }
    
    // Return a deep clone to prevent external mutation
    return JSON.parse(JSON.stringify(file.content));
  }
  
  async writeFile(options: FileOperationOptions): Promise<FileOperationResult> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const { fileId, filename, content, folder, mimeType = 'application/json' } = options;
    
    // Normalize content
    const normalizedContent = normalizeLibraryData(content);
    
    if (fileId) {
      // Update existing file
      const file = this.files[fileId];
      if (!file) {
        throw new FileNotFoundError(`File with ID "${fileId}" not found`);
      }
      
      file.content = normalizedContent;
      file.metadata.modifiedTime = new Date().toISOString();
      file.metadata.size = JSON.stringify(normalizedContent).length;
      
      return {
        fileId,
        success: true,
        file: { ...file.metadata }
      };
    } else {
      // Create new file
      const newFileId = `mock-file-${this.nextFileId++}`;
      const metadata: DriveFile = {
        id: newFileId,
        name: filename,
        mimeType,
        modifiedTime: new Date().toISOString(),
        size: JSON.stringify(normalizedContent).length,
        parents: folder ? [folder] : undefined
      };
      
      this.files[newFileId] = {
        metadata,
        content: normalizedContent
      };
      
      return {
        fileId: newFileId,
        success: true,
        file: { ...metadata }
      };
    }
  }
  
  async deleteFile(fileId: string): Promise<boolean> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    if (!this.files[fileId]) {
      throw new FileNotFoundError(`File with ID "${fileId}" not found`);
    }
    
    delete this.files[fileId];
    return true;
  }
  
  async listFiles(folder?: string): Promise<DriveFile[]> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const files: DriveFile[] = [];
    
    for (const fileId in this.files) {
      const file = this.files[fileId];
      if (folder) {
        if (file.metadata.parents?.includes(folder)) {
          files.push({ ...file.metadata });
        }
      } else {
        files.push({ ...file.metadata });
      }
    }
    
    return files;
  }
  
  async loadLibrary(fileId?: string): Promise<LibraryData> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    // If fileId provided, load that file
    if (fileId) {
      return this.readFile(fileId);
    }
    
    // Otherwise, load default library file
    const defaultFilename = this.config?.defaultLibraryFilename || 'library.json';
    const file = await this.findFile({ filename: defaultFilename });
    
    if (!file) {
      // Return empty library if not found
      return normalizeLibraryData({});
    }
    
    return this.readFile(file.id);
  }
  
  async saveLibrary(data: LibraryData, fileId?: string): Promise<FileOperationResult> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    // If fileId provided, update that file
    if (fileId) {
      return this.writeFile({ fileId, filename: '', content: data });
    }
    
    // Otherwise, find or create default library file
    const defaultFilename = this.config?.defaultLibraryFilename || 'library.json';
    const existingFile = await this.findFile({ filename: defaultFilename });
    
    if (existingFile) {
      return this.writeFile({
        fileId: existingFile.id,
        filename: defaultFilename,
        content: data
      });
    } else {
      return this.writeFile({
        filename: defaultFilename,
        content: data
      });
    }
  }
  
  async mergeLibraries(
    files: Array<{ fileId?: string; data?: LibraryData }>,
    options?: MergeOptions
  ): Promise<MergeResult> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    const libraries: LibraryData[] = [];
    
    // Load all files
    for (const file of files) {
      if (file.data) {
        libraries.push(file.data);
      } else if (file.fileId) {
        const data = await this.readFile(file.fileId);
        libraries.push(data);
      }
    }
    
    // Merge using utility
    return mergeLibraries(libraries, options);
  }
  
  async createEntry<T = any>(
    collection: keyof LibraryData,
    data: T,
    fileId?: string
  ): Promise<CrudResult<T>> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    // Load library
    const library = await this.loadLibrary(fileId);
    
    // Execute CRUD operation
    const result = executeCrudOperation(library, {
      operation: 'create',
      collection,
      data
    });
    
    // Save if successful
    if (result.success) {
      await this.saveLibrary(library, fileId);
    }
    
    return result;
  }
  
  async readEntry<T = any>(
    collection: keyof LibraryData,
    id: string,
    fileId?: string
  ): Promise<CrudResult<T>> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    // Load library
    const library = await this.loadLibrary(fileId);
    
    // Execute CRUD operation
    return executeCrudOperation(library, {
      operation: 'read',
      collection,
      id
    });
  }
  
  async updateEntry<T = any>(
    collection: keyof LibraryData,
    id: string,
    data: Partial<T>,
    fileId?: string
  ): Promise<CrudResult<T>> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    // Load library
    const library = await this.loadLibrary(fileId);
    
    // Execute CRUD operation
    const result = executeCrudOperation(library, {
      operation: 'update',
      collection,
      id,
      data
    }) as CrudResult<T>;
    
    // Save if successful
    if (result.success) {
      await this.saveLibrary(library, fileId);
    }
    
    return result;
  }
  
  async deleteEntry(
    collection: keyof LibraryData,
    id: string,
    fileId?: string
  ): Promise<CrudResult<void>> {
    await this.delay();
    this.checkAuth();
    this.checkNetwork();
    
    // Load library
    const library = await this.loadLibrary(fileId);
    
    // Execute CRUD operation
    const result = executeCrudOperation(library, {
      operation: 'delete',
      collection,
      id
    });
    
    // Save if successful
    if (result.success) {
      await this.saveLibrary(library, fileId);
    }
    
    return result as CrudResult<void>;
  }
}

/**
 * Create a new mock adapter instance
 */
export function createMockAdapter(): MockGoogleDriveAdapter {
  return new MockGoogleDriveAdapter();
}

/**
 * Default export for compatibility
 */
export default MockGoogleDriveAdapter;
