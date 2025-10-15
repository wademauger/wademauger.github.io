/**
 * Unit Tests for CRUD Operations
 * 
 * Tests create, read, update, delete operations on library collections
 */

import {
  createEntry,
  readEntry,
  updateEntry,
  deleteEntry,
  executeCrudOperation
} from '../crud';
import type { LibraryData } from '../types';

describe('CRUD Operations', () => {
  describe('createEntry', () => {
    it('should create entry in object-based collection', () => {
      const library: LibraryData = {
        recipes: {}
      };
      
      const result = createEntry(library, 'recipes', {
        id: 'recipe-1',
        name: 'Test Recipe'
      });
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('create');
      expect(result.id).toBe('recipe-1');
      expect(library.recipes?.['recipe-1']).toBeDefined();
      expect(library.lastModified).toBeDefined();
    });
    
    it('should create entry in array-based collection', () => {
      const library: LibraryData = {
        artists: []
      };
      
      const result = createEntry(library, 'artists', {
        name: 'Test Artist',
        albums: []
      });
      
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(library.artists).toHaveLength(1);
    });
    
    it('should generate ID if not provided', () => {
      const library: LibraryData = {
        recipes: {}
      };
      
      const result = createEntry(library, 'recipes', {
        name: 'Test Recipe'
      });
      
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.id).toContain('recipes-');
    });
    
    it('should initialize collection if it does not exist', () => {
      const library: LibraryData = {};
      
      const result = createEntry(library, 'recipes', {
        id: 'recipe-1',
        name: 'Test Recipe'
      });
      
      expect(result.success).toBe(true);
      expect(library.recipes).toBeDefined();
    });
    
    it('should prevent duplicate IDs in object collections', () => {
      const library: LibraryData = {
        recipes: {
          'recipe-1': { id: 'recipe-1', name: 'Existing Recipe' }
        }
      };
      
      const result = createEntry(library, 'recipes', {
        id: 'recipe-1',
        name: 'Duplicate Recipe'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
    
    it('should prevent duplicate IDs in array collections', () => {
      const library: LibraryData = {
        artists: [
          { id: 'artist-1', name: 'Existing Artist', albums: [] }
        ]
      };
      
      const result = createEntry(library, 'artists', {
        id: 'artist-1',
        name: 'Duplicate Artist',
        albums: []
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
    
    it('should handle invalid collection type', () => {
      const library: LibraryData = {
        recipes: 'invalid' as any
      };
      
      const result = createEntry(library, 'recipes', {
        id: 'recipe-1',
        name: 'Test Recipe'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid type');
    });
  });
  
  describe('readEntry', () => {
    it('should read entry from object-based collection', () => {
      const library: LibraryData = {
        recipes: {
          'recipe-1': { id: 'recipe-1', name: 'Test Recipe' }
        }
      };
      
      const result = readEntry(library, 'recipes', 'recipe-1');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 'recipe-1', name: 'Test Recipe' });
    });
    
    it('should read entry from array-based collection', () => {
      const library: LibraryData = {
        artists: [
          { id: 'artist-1', name: 'Test Artist', albums: [] }
        ]
      };
      
      const result = readEntry(library, 'artists', 'artist-1');
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Test Artist');
    });
    
    it('should fail when collection does not exist', () => {
      const library: LibraryData = {};
      
      const result = readEntry(library, 'recipes', 'recipe-1');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('does not exist');
    });
    
    it('should fail when entry not found', () => {
      const library: LibraryData = {
        recipes: {}
      };
      
      const result = readEntry(library, 'recipes', 'nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
    
    it('should handle invalid collection type', () => {
      const library: LibraryData = {
        recipes: 'invalid' as any
      };
      
      const result = readEntry(library, 'recipes', 'recipe-1');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid type');
    });
  });
  
  describe('updateEntry', () => {
    it('should update entry in object-based collection', () => {
      const library: LibraryData = {
        recipes: {
          'recipe-1': { id: 'recipe-1', name: 'Original Name', steps: [] }
        }
      };
      
      const result = updateEntry(library, 'recipes', 'recipe-1', {
        name: 'Updated Name'
      });
      
      expect(result.success).toBe(true);
      expect(library.recipes?.['recipe-1'].name).toBe('Updated Name');
      expect(library.recipes?.['recipe-1'].steps).toEqual([]); // Preserved
      expect(library.recipes?.['recipe-1'].id).toBe('recipe-1'); // ID preserved
      expect(library.lastModified).toBeDefined();
    });
    
    it('should update entry in array-based collection', () => {
      const library: LibraryData = {
        artists: [
          { id: 'artist-1', name: 'Original Name', albums: [] }
        ]
      };
      
      const result = updateEntry(library, 'artists', 'artist-1', {
        name: 'Updated Name'
      });
      
      expect(result.success).toBe(true);
      expect(library.artists?.[0].name).toBe('Updated Name');
    });
    
    it('should preserve unmodified fields', () => {
      const library: LibraryData = {
        recipes: {
          'recipe-1': {
            id: 'recipe-1',
            name: 'Recipe',
            ingredients: ['flour', 'water'],
            steps: ['mix', 'bake']
          }
        }
      };
      
      const result = updateEntry(library, 'recipes', 'recipe-1', {
        name: 'Updated Recipe'
      });
      
      expect(result.success).toBe(true);
      const recipe = library.recipes?.['recipe-1'];
      expect(recipe.name).toBe('Updated Recipe');
      expect(recipe.ingredients).toEqual(['flour', 'water']);
      expect(recipe.steps).toEqual(['mix', 'bake']);
    });
    
    it('should fail when collection does not exist', () => {
      const library: LibraryData = {};
      
      const result = updateEntry(library, 'recipes', 'recipe-1', {
        name: 'Updated'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('does not exist');
    });
    
    it('should fail when entry not found', () => {
      const library: LibraryData = {
        recipes: {}
      };
      
      const result = updateEntry(library, 'recipes', 'nonexistent', {
        name: 'Updated'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
    
    it('should not allow changing ID', () => {
      const library: LibraryData = {
        recipes: {
          'recipe-1': { id: 'recipe-1', name: 'Recipe' }
        }
      };
      
      updateEntry(library, 'recipes', 'recipe-1', {
        id: 'different-id' as any,
        name: 'Updated'
      });
      
      // ID should be preserved
      expect(library.recipes?.['recipe-1'].id).toBe('recipe-1');
    });
  });
  
  describe('deleteEntry', () => {
    it('should delete entry from object-based collection', () => {
      const library: LibraryData = {
        recipes: {
          'recipe-1': { id: 'recipe-1', name: 'Recipe 1' },
          'recipe-2': { id: 'recipe-2', name: 'Recipe 2' }
        }
      };
      
      const result = deleteEntry(library, 'recipes', 'recipe-1');
      
      expect(result.success).toBe(true);
      expect(library.recipes?.['recipe-1']).toBeUndefined();
      expect(library.recipes?.['recipe-2']).toBeDefined();
      expect(library.lastModified).toBeDefined();
    });
    
    it('should delete entry from array-based collection', () => {
      const library: LibraryData = {
        artists: [
          { id: 'artist-1', name: 'Artist 1', albums: [] },
          { id: 'artist-2', name: 'Artist 2', albums: [] }
        ]
      };
      
      const result = deleteEntry(library, 'artists', 'artist-1');
      
      expect(result.success).toBe(true);
      expect(library.artists).toHaveLength(1);
      expect(library.artists?.[0].id).toBe('artist-2');
    });
    
    it('should fail when collection does not exist', () => {
      const library: LibraryData = {};
      
      const result = deleteEntry(library, 'recipes', 'recipe-1');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('does not exist');
    });
    
    it('should fail when entry not found', () => {
      const library: LibraryData = {
        recipes: {}
      };
      
      const result = deleteEntry(library, 'recipes', 'nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
  
  describe('executeCrudOperation', () => {
    it('should execute create operation', () => {
      const library: LibraryData = { recipes: {} };
      
      const result = executeCrudOperation(library, {
        operation: 'create',
        collection: 'recipes',
        data: { id: 'recipe-1', name: 'Recipe' }
      });
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('create');
    });
    
    it('should execute read operation', () => {
      const library: LibraryData = {
        recipes: {
          'recipe-1': { id: 'recipe-1', name: 'Recipe' }
        }
      };
      
      const result = executeCrudOperation(library, {
        operation: 'read',
        collection: 'recipes',
        id: 'recipe-1'
      });
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('read');
    });
    
    it('should execute update operation', () => {
      const library: LibraryData = {
        recipes: {
          'recipe-1': { id: 'recipe-1', name: 'Original' }
        }
      };
      
      const result = executeCrudOperation(library, {
        operation: 'update',
        collection: 'recipes',
        id: 'recipe-1',
        data: { name: 'Updated' }
      });
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('update');
    });
    
    it('should execute delete operation', () => {
      const library: LibraryData = {
        recipes: {
          'recipe-1': { id: 'recipe-1', name: 'Recipe' }
        }
      };
      
      const result = executeCrudOperation(library, {
        operation: 'delete',
        collection: 'recipes',
        id: 'recipe-1'
      });
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('delete');
    });
    
    it('should fail create without data', () => {
      const library: LibraryData = { recipes: {} };
      
      const result = executeCrudOperation(library, {
        operation: 'create',
        collection: 'recipes'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Data is required');
    });
    
    it('should fail read without id', () => {
      const library: LibraryData = { recipes: {} };
      
      const result = executeCrudOperation(library, {
        operation: 'read',
        collection: 'recipes'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('ID is required');
    });
    
    it('should fail update without id or data', () => {
      const library: LibraryData = { recipes: {} };
      
      const result = executeCrudOperation(library, {
        operation: 'update',
        collection: 'recipes'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
    
    it('should fail delete without id', () => {
      const library: LibraryData = { recipes: {} };
      
      const result = executeCrudOperation(library, {
        operation: 'delete',
        collection: 'recipes'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('ID is required');
    });
    
    it('should fail with unknown operation', () => {
      const library: LibraryData = { recipes: {} };
      
      const result = executeCrudOperation(library, {
        operation: 'invalid' as any,
        collection: 'recipes'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown operation');
    });
  });
});
