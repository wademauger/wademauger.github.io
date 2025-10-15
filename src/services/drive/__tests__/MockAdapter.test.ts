/**
 * Unit Tests for Mock Google Drive Adapter
 * 
 * Tests authentication, file operations, CRUD, merge, and error handling
 */

import { MockGoogleDriveAdapter, createMockAdapter } from '../MockAdapter';
import type { LibraryData } from '../types';
import { AuthenticationError, FileNotFoundError, NetworkError } from '../types';

describe('MockGoogleDriveAdapter', () => {
  let adapter: MockGoogleDriveAdapter;
  
  beforeEach(() => {
    adapter = createMockAdapter();
  });
  
  describe('Authentication', () => {
    it('should initialize with config', async () => {
      await adapter.initialize({
        clientId: 'test-client-id',
        defaultLibraryFilename: 'test-library.json'
      });
      
      expect(adapter.isAuthenticated()).toBe(false);
    });
    
    it('should sign in successfully', async () => {
      await adapter.initialize({ clientId: 'test' });
      const authState = await adapter.signIn();
      
      expect(authState.isSignedIn).toBe(true);
      expect(authState.accessToken).toBeDefined();
      expect(authState.userEmail).toBe('test@example.com');
      expect(authState.userName).toBe('Test User');
      expect(adapter.isAuthenticated()).toBe(true);
    });
    
    it('should sign out successfully', async () => {
      await adapter.initialize({ clientId: 'test' });
      await adapter.signIn();
      await adapter.signOut();
      
      const authState = adapter.getAuthState();
      expect(authState.isSignedIn).toBe(false);
      expect(authState.accessToken).toBeNull();
      expect(adapter.isAuthenticated()).toBe(false);
    });
    
    it('should fail authentication when configured', async () => {
      await adapter.initialize({ clientId: 'test' });
      adapter.setAuthFailure(true);
      
      await expect(adapter.signIn()).rejects.toThrow(AuthenticationError);
    });
    
    it('should throw auth error for operations when not signed in', async () => {
      await adapter.initialize({ clientId: 'test' });
      
      await expect(adapter.listFiles()).rejects.toThrow(AuthenticationError);
      await expect(adapter.findFile({ filename: 'test.json' })).rejects.toThrow(AuthenticationError);
    });
    
    it('should get auth state', async () => {
      await adapter.initialize({ clientId: 'test' });
      await adapter.signIn();
      
      const state = adapter.getAuthState();
      expect(state.isSignedIn).toBe(true);
      expect(state.userEmail).toBe('test@example.com');
    });
  });
  
  describe('File Operations', () => {
    beforeEach(async () => {
      await adapter.initialize({ clientId: 'test' });
      await adapter.signIn();
    });
    
    it('should create a new file', async () => {
      const library: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Test Recipe' } }
      };
      
      const result = await adapter.writeFile({
        filename: 'library.json',
        content: library
      });
      
      expect(result.success).toBe(true);
      expect(result.fileId).toBeDefined();
      expect(result.file?.name).toBe('library.json');
    });
    
    it('should update an existing file', async () => {
      const library: LibraryData = { recipes: {} };
      const createResult = await adapter.writeFile({
        filename: 'library.json',
        content: library
      });
      
      const updatedLibrary: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'New Recipe' } }
      };
      
      const updateResult = await adapter.writeFile({
        fileId: createResult.fileId,
        filename: 'library.json',
        content: updatedLibrary
      });
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.fileId).toBe(createResult.fileId);
    });
    
    it('should read a file', async () => {
      const library: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Test Recipe' } }
      };
      
      const createResult = await adapter.writeFile({
        filename: 'library.json',
        content: library
      });
      
      const readLibrary = await adapter.readFile(createResult.fileId);
      
      expect(readLibrary).toEqual(expect.objectContaining({
        recipes: expect.objectContaining({
          'recipe-1': expect.objectContaining({
            id: 'recipe-1',
            name: 'Test Recipe'
          })
        })
      }));
    });
    
    it('should throw error when reading non-existent file', async () => {
      await expect(adapter.readFile('nonexistent')).rejects.toThrow(FileNotFoundError);
    });
    
    it('should throw error when updating non-existent file', async () => {
      await expect(
        adapter.writeFile({
          fileId: 'nonexistent',
          filename: 'test.json',
          content: {}
        })
      ).rejects.toThrow(FileNotFoundError);
    });
    
    it('should delete a file', async () => {
      const createResult = await adapter.writeFile({
        filename: 'test.json',
        content: {}
      });
      
      const deleted = await adapter.deleteFile(createResult.fileId);
      expect(deleted).toBe(true);
      
      await expect(adapter.readFile(createResult.fileId)).rejects.toThrow(FileNotFoundError);
    });
    
    it('should throw error when deleting non-existent file', async () => {
      await expect(adapter.deleteFile('nonexistent')).rejects.toThrow(FileNotFoundError);
    });
    
    it('should find file by name', async () => {
      await adapter.writeFile({
        filename: 'library.json',
        content: {}
      });
      
      const found = await adapter.findFile({ filename: 'library.json' });
      
      expect(found).toBeDefined();
      expect(found?.name).toBe('library.json');
    });
    
    it('should return null when file not found', async () => {
      const found = await adapter.findFile({ filename: 'nonexistent.json' });
      expect(found).toBeNull();
    });
    
    it('should list all files', async () => {
      await adapter.writeFile({ filename: 'file1.json', content: {} });
      await adapter.writeFile({ filename: 'file2.json', content: {} });
      
      const files = await adapter.listFiles();
      
      expect(files).toHaveLength(2);
      expect(files.some(f => f.name === 'file1.json')).toBe(true);
      expect(files.some(f => f.name === 'file2.json')).toBe(true);
    });
    
    it('should list files by folder', async () => {
      await adapter.writeFile({
        filename: 'file1.json',
        content: {},
        folder: 'folder-1'
      });
      await adapter.writeFile({
        filename: 'file2.json',
        content: {},
        folder: 'folder-2'
      });
      
      const files = await adapter.listFiles('folder-1');
      
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('file1.json');
    });
  });
  
  describe('Library Operations', () => {
    beforeEach(async () => {
      await adapter.initialize({
        clientId: 'test',
        defaultLibraryFilename: 'library.json'
      });
      await adapter.signIn();
    });
    
    it('should load library by fileId', async () => {
      const library: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe' } }
      };
      
      const result = await adapter.writeFile({
        filename: 'library.json',
        content: library
      });
      
      const loaded = await adapter.loadLibrary(result.fileId);
      
      expect(loaded.recipes).toBeDefined();
      expect(loaded.recipes?.['recipe-1']).toBeDefined();
    });
    
    it('should load default library', async () => {
      const library: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe' } }
      };
      
      await adapter.writeFile({
        filename: 'library.json',
        content: library
      });
      
      const loaded = await adapter.loadLibrary();
      
      expect(loaded.recipes).toBeDefined();
    });
    
    it('should return empty library when default not found', async () => {
      const loaded = await adapter.loadLibrary();
      
      expect(loaded).toBeDefined();
      expect(loaded.version).toBeDefined();
    });
    
    it('should save library to new file', async () => {
      const library: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe' } }
      };
      
      const result = await adapter.saveLibrary(library);
      
      expect(result.success).toBe(true);
      expect(result.fileId).toBeDefined();
    });
    
    it('should save library to existing file', async () => {
      const library: LibraryData = { recipes: {} };
      const createResult = await adapter.saveLibrary(library);
      
      const updated: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe' } }
      };
      
      const updateResult = await adapter.saveLibrary(updated, createResult.fileId);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.fileId).toBe(createResult.fileId);
    });
  });
  
  describe('Merge Operations', () => {
    beforeEach(async () => {
      await adapter.initialize({ clientId: 'test' });
      await adapter.signIn();
    });
    
    it('should merge multiple libraries from files', async () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe 1' } }
      };
      const lib2: LibraryData = {
        recipes: { 'recipe-2': { id: 'recipe-2', name: 'Recipe 2' } }
      };
      
      const file1 = await adapter.writeFile({ filename: 'lib1.json', content: lib1 });
      const file2 = await adapter.writeFile({ filename: 'lib2.json', content: lib2 });
      
      const result = await adapter.mergeLibraries([
        { fileId: file1.fileId },
        { fileId: file2.fileId }
      ]);
      
      expect(result.success).toBe(true);
      expect(result.data.recipes).toHaveProperty('recipe-1');
      expect(result.data.recipes).toHaveProperty('recipe-2');
    });
    
    it('should merge libraries from data', async () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe 1' } }
      };
      const lib2: LibraryData = {
        panels: { 'panel-1': { id: 'panel-1', name: 'Panel 1' } }
      };
      
      const result = await adapter.mergeLibraries([
        { data: lib1 },
        { data: lib2 }
      ]);
      
      expect(result.success).toBe(true);
      expect(result.data.recipes).toBeDefined();
      expect(result.data.panels).toBeDefined();
    });
    
    it('should merge with options', async () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe A' } }
      };
      const lib2: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe B' } }
      };
      
      const result = await adapter.mergeLibraries(
        [{ data: lib1 }, { data: lib2 }],
        { conflictResolution: 'keepLast' }
      );
      
      expect(result.success).toBe(true);
      expect(result.data.recipes?.['recipe-1'].name).toBe('Recipe B');
    });
  });
  
  describe('CRUD Operations', () => {
    beforeEach(async () => {
      await adapter.initialize({
        clientId: 'test',
        defaultLibraryFilename: 'library.json'
      });
      await adapter.signIn();
    });
    
    it('should create entry', async () => {
      const result = await adapter.createEntry('recipes', {
        id: 'recipe-1',
        name: 'Test Recipe'
      });
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('create');
      expect(result.id).toBe('recipe-1');
    });
    
    it('should read entry', async () => {
      await adapter.createEntry('recipes', {
        id: 'recipe-1',
        name: 'Test Recipe'
      });
      
      const result = await adapter.readEntry('recipes', 'recipe-1');
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Test Recipe');
    });
    
    it('should update entry', async () => {
      await adapter.createEntry('recipes', {
        id: 'recipe-1',
        name: 'Original'
      });
      
      const result = await adapter.updateEntry('recipes', 'recipe-1', {
        name: 'Updated'
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated');
    });
    
    it('should delete entry', async () => {
      await adapter.createEntry('recipes', {
        id: 'recipe-1',
        name: 'Test Recipe'
      });
      
      const deleteResult = await adapter.deleteEntry('recipes', 'recipe-1');
      expect(deleteResult.success).toBe(true);
      
      const readResult = await adapter.readEntry('recipes', 'recipe-1');
      expect(readResult.success).toBe(false);
    });
    
    it('should persist CRUD operations', async () => {
      await adapter.createEntry('recipes', {
        id: 'recipe-1',
        name: 'Test Recipe'
      });
      
      const library = await adapter.loadLibrary();
      expect(library.recipes?.['recipe-1']).toBeDefined();
    });
    
    it('should support CRUD with specific fileId', async () => {
      const lib: LibraryData = { recipes: {} };
      const file = await adapter.saveLibrary(lib);
      
      await adapter.createEntry('recipes', {
        id: 'recipe-1',
        name: 'Test'
      }, file.fileId);
      
      const result = await adapter.readEntry('recipes', 'recipe-1', file.fileId);
      expect(result.success).toBe(true);
    });
  });
  
  describe('Network Simulation', () => {
    beforeEach(async () => {
      await adapter.initialize({ clientId: 'test' });
      await adapter.signIn();
    });
    
    it('should simulate network delay', async () => {
      adapter.setNetworkDelay(true, 50);
      
      const start = Date.now();
      await adapter.listFiles();
      const duration = Date.now() - start;
      
      expect(duration).toBeGreaterThanOrEqual(50);
    });
    
    it('should simulate network failure', async () => {
      adapter.setNetworkFailure(true);
      
      await expect(adapter.listFiles()).rejects.toThrow(NetworkError);
    });
  });
  
  describe('Test Utilities', () => {
    it('should reset state', async () => {
      await adapter.initialize({ clientId: 'test' });
      await adapter.signIn();
      await adapter.writeFile({ filename: 'test.json', content: {} });
      
      adapter.reset();
      
      expect(adapter.isAuthenticated()).toBe(false);
      expect(adapter.getAllFiles()).toEqual({});
    });
    
    it('should seed files', async () => {
      await adapter.initialize({ clientId: 'test' });
      await adapter.signIn();
      
      const fileIds = adapter.seedFiles([
        { name: 'lib1.json', content: { recipes: {} } },
        { name: 'lib2.json', content: { panels: {} } }
      ]);
      
      expect(fileIds).toHaveLength(2);
      const files = await adapter.listFiles();
      expect(files).toHaveLength(2);
    });
    
    it('should get all files', async () => {
      await adapter.initialize({ clientId: 'test' });
      await adapter.signIn();
      await adapter.writeFile({ filename: 'test.json', content: {} });
      
      const allFiles = adapter.getAllFiles();
      expect(Object.keys(allFiles)).toHaveLength(1);
    });
  });
});
