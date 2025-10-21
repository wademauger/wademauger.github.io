/**
 * Tests for MockDriveAdapter
 * 
 * Test adapter in isolation - just API calls
 * React Query handles caching/state
 */

import { MockDriveAdapter } from '../MockAdapter';
import { AuthError, NotFoundError, NetworkError } from '../types';
import type { LibraryData, DriveAdapterConfig } from '../types';

describe('MockDriveAdapter', () => {
  let adapter: MockDriveAdapter;
  const config: DriveAdapterConfig = {
    clientId: 'test-client-id',
    apiKey: 'test-api-key',
    appId: 'test-app-id'
  };

  beforeEach(() => {
    adapter = new MockDriveAdapter();
  });

  // ==========================================================================
  // Initialization
  // ==========================================================================
  
  describe('initialize', () => {
    it('should store config', async () => {
      await adapter.initialize(config);
      // Config stored - no need to verify, just that it doesn't throw
    });
  });

  // ==========================================================================
  // Authentication
  // ==========================================================================
  
  describe('authentication', () => {
    it('should sign in successfully', async () => {
      const authState = await adapter.signIn();
      
      expect(authState.isSignedIn).toBe(true);
      expect(authState.accessToken).toBeTruthy();
      expect(authState.userEmail).toBe('test@example.com');
      expect(authState.userName).toBe('Test User');
      expect(authState.tokenExpiry).toBeTruthy();
    });
    
    it('should fail sign in when configured', async () => {
      adapter.setAuthFailure(true);
      
      await expect(adapter.signIn()).rejects.toThrow(AuthError);
    });
    
    it('should sign out successfully', async () => {
      await adapter.signIn();
      await adapter.signOut();
      
      const authState = adapter.getAuthState();
      expect(authState.isSignedIn).toBe(false);
      expect(authState.accessToken).toBeNull();
    });
    
    it('should return current auth state', async () => {
      await adapter.signIn();
      const authState = adapter.getAuthState();
      
      expect(authState.isSignedIn).toBe(true);
    });
  });

  // ==========================================================================
  // Library Operations
  // ==========================================================================
  
  describe('library operations', () => {
    beforeEach(async () => {
      await adapter.signIn();
    });
    
    it('should return empty library when none exists', async () => {
      const library = await adapter.loadLibrary();
      
      expect(library.version).toBe('1.0.0');
      expect(library.lastModified).toBeTruthy();
    });
    
    it('should save and load library', async () => {
      const data: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Test Artist' } as any]
      };
      
      const fileId = await adapter.saveLibrary(data);
      const loaded = await adapter.loadLibrary(fileId);
      
      expect(loaded.artists).toHaveLength(1);
      expect(loaded.artists?.[0].name).toBe('Test Artist');
    });
    
    it('should require authentication', async () => {
      await adapter.signOut();
      
      await expect(adapter.loadLibrary()).rejects.toThrow(AuthError);
    });
    
    it('should fail on network error', async () => {
      adapter.setNetworkFailure(true);
      
      await expect(adapter.loadLibrary()).rejects.toThrow(NetworkError);
    });
    
    it('should update lastModified on save', async () => {
      const data: LibraryData = {
        version: '1.0.0',
        lastModified: '2020-01-01T00:00:00.000Z'
      };
      
      const fileId = await adapter.saveLibrary(data);
      const loaded = await adapter.loadLibrary(fileId);
      
      expect(loaded.lastModified).not.toBe(data.lastModified);
    });
  });

  // ==========================================================================
  // Merge Operations
  // ==========================================================================
  
  describe('merge operations', () => {
    beforeEach(async () => {
      await adapter.signIn();
    });
    
    it('should merge multiple libraries', async () => {
      const lib1: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Artist 1' } as any]
      };
      
      const lib2: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-2', name: 'Artist 2' } as any]
      };
      
      const id1 = await adapter.saveLibrary(lib1, 'file1');
      const id2 = await adapter.saveLibrary(lib2, 'file2');
      
      const merged = await adapter.mergeLibraries([id1, id2]);
      
      expect(merged.artists).toHaveLength(2);
    });
    
    it('should handle precedence option', async () => {
      const lib1: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Artist 1' } as any]
      };
      
      const lib2: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Updated Artist' } as any]
      };
      
      const id1 = await adapter.saveLibrary(lib1, 'file1');
      const id2 = await adapter.saveLibrary(lib2, 'file2');
      
      const merged = await adapter.mergeLibraries([id1, id2], { precedence: 'last' });
      
      expect(merged.artists?.[0].name).toBe('Updated Artist');
    });
  });

  // ==========================================================================
  // CRUD Operations
  // ==========================================================================
  
  describe('CRUD operations', () => {
    beforeEach(async () => {
      await adapter.signIn();
      
      const library: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [
          { id: 'artist-1', name: 'Artist 1' } as any,
          { id: 'artist-2', name: 'Artist 2' } as any
        ]
      };
      
      await adapter.saveLibrary(library, 'test-file');
    });
    
    it('should get existing entry', async () => {
      const entry = await adapter.getEntry('artists', 'artist-1', 'test-file');
      
      expect(entry).toBeTruthy();
      expect((entry as any).name).toBe('Artist 1');
    });
    
    it('should return null for non-existent entry', async () => {
      const entry = await adapter.getEntry('artists', 'artist-999', 'test-file');
      
      expect(entry).toBeNull();
    });
    
    it('should create new entry', async () => {
      await adapter.setEntry('artists', 'artist-3', { name: 'Artist 3' }, 'test-file');
      
      const entry = await adapter.getEntry('artists', 'artist-3', 'test-file');
      expect((entry as any).name).toBe('Artist 3');
    });
    
    it('should update existing entry', async () => {
      await adapter.setEntry('artists', 'artist-1', { name: 'Updated Artist' }, 'test-file');
      
      const entry = await adapter.getEntry('artists', 'artist-1', 'test-file');
      expect((entry as any).name).toBe('Updated Artist');
    });
    
    it('should delete entry', async () => {
      await adapter.deleteEntry('artists', 'artist-1', 'test-file');
      
      const entry = await adapter.getEntry('artists', 'artist-1', 'test-file');
      expect(entry).toBeNull();
    });
    
    it('should throw on delete non-existent collection', async () => {
      await expect(
        adapter.deleteEntry('nonexistent' as any, 'artist-1', 'test-file')
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ==========================================================================
  // Test Utilities
  // ==========================================================================
  
  describe('test utilities', () => {
    it('should reset state', async () => {
      await adapter.signIn();
      const library: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString()
      };
      await adapter.saveLibrary(library);
      
      adapter.reset();
      
      const authState = adapter.getAuthState();
      expect(authState.isSignedIn).toBe(false);
      
      await adapter.signIn();
      const loaded = await adapter.loadLibrary();
      expect(loaded.artists).toBeUndefined();
    });
    
    it('should seed files', async () => {
      await adapter.signIn();
      
      const library: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Seeded Artist' } as any]
      };
      
      adapter.seedFile('seeded-file', library);
      
      const loaded = await adapter.loadLibrary('seeded-file');
      expect(loaded.artists?.[0].name).toBe('Seeded Artist');
    });
    
    it('should respect network delay', async () => {
      await adapter.signIn();
      adapter.setNetworkDelay(100);
      
      const start = Date.now();
      await adapter.loadLibrary();
      const duration = Date.now() - start;
      
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });
});
