/**
 * Unit Tests for Library Merge Utilities
 * 
 * Tests the merge logic for combining multiple library JSON files
 */

import {
  mergeLibraries,
  validateLibraryStructure,
  normalizeLibraryData
} from '../merge';
import type { LibraryData, MergeOptions } from '../types';

describe('Library Merge Utilities', () => {
  describe('mergeLibraries', () => {
    it('should merge two simple libraries', () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe 1' } }
      };
      
      const lib2: LibraryData = {
        recipes: { 'recipe-2': { id: 'recipe-2', name: 'Recipe 2' } }
      };
      
      const result = mergeLibraries([lib1, lib2]);
      
      expect(result.success).toBe(true);
      expect(result.data.recipes).toEqual({
        'recipe-1': { id: 'recipe-1', name: 'Recipe 1' },
        'recipe-2': { id: 'recipe-2', name: 'Recipe 2' }
      });
    });
    
    it('should handle empty library array', () => {
      const result = mergeLibraries([]);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
      expect(result.warnings).toContain('No libraries provided to merge');
    });
    
    it('should return clone of single library', () => {
      const lib: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe 1' } }
      };
      
      const result = mergeLibraries([lib]);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(lib);
      expect(result.data).not.toBe(lib); // Should be a clone
    });
    
    it('should detect conflicts with keepLast strategy', () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe A' } }
      };
      
      const lib2: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe B' } }
      };
      
      const result = mergeLibraries([lib1, lib2], {
        conflictResolution: 'keepLast'
      });
      
      expect(result.success).toBe(true);
      expect(result.data.recipes?.['recipe-1'].name).toBe('Recipe B');
      expect(result.conflicts).toBeDefined();
      expect(result.conflicts!.length).toBeGreaterThan(0);
    });
    
    it('should detect conflicts with keepFirst strategy', () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe A' } }
      };
      
      const lib2: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe B' } }
      };
      
      const result = mergeLibraries([lib1, lib2], {
        conflictResolution: 'keepFirst'
      });
      
      expect(result.success).toBe(true);
      expect(result.data.recipes?.['recipe-1'].name).toBe('Recipe A');
    });
    
    it('should throw error with error strategy on conflict', () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe A' } }
      };
      
      const lib2: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe B' } }
      };
      
      expect(() => {
        mergeLibraries([lib1, lib2], {
          conflictResolution: 'error'
        });
      }).toThrow();
    });
    
    it('should deep merge nested objects', () => {
      const lib1: LibraryData = {
        recipes: {
          'recipe-1': {
            id: 'recipe-1',
            name: 'Recipe 1',
            ingredients: ['flour', 'water']
          }
        }
      };
      
      const lib2: LibraryData = {
        recipes: {
          'recipe-1': {
            id: 'recipe-1',
            steps: ['mix', 'bake']
          }
        }
      };
      
      const result = mergeLibraries([lib1, lib2], { strategy: 'deep' });
      
      expect(result.success).toBe(true);
      const recipe = result.data.recipes?.['recipe-1'];
      expect(recipe).toHaveProperty('name', 'Recipe 1');
      expect(recipe).toHaveProperty('ingredients');
      expect(recipe).toHaveProperty('steps');
    });
    
    it('should handle array merge with preserveArrays', () => {
      const lib1: LibraryData = {
        artists: [
          { name: 'Artist 1', albums: [] }
        ]
      };
      
      const lib2: LibraryData = {
        artists: [
          { name: 'Artist 2', albums: [] }
        ]
      };
      
      const result = mergeLibraries([lib1, lib2], { preserveArrays: true });
      
      expect(result.success).toBe(true);
      expect(result.data.artists).toHaveLength(2);
    });
    
    it('should replace arrays without preserveArrays', () => {
      const lib1: LibraryData = {
        artists: [
          { name: 'Artist 1', albums: [] }
        ]
      };
      
      const lib2: LibraryData = {
        artists: [
          { name: 'Artist 2', albums: [] }
        ]
      };
      
      const result = mergeLibraries([lib1, lib2], { preserveArrays: false });
      
      expect(result.success).toBe(true);
      expect(result.data.artists).toHaveLength(1);
      expect(result.data.artists?.[0].name).toBe('Artist 2');
    });
    
    it('should handle type conflicts', () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe 1' } }
      };
      
      const lib2: LibraryData = {
        recipes: 'invalid' as any
      };
      
      const result = mergeLibraries([lib1, lib2]);
      
      expect(result.conflicts).toBeDefined();
      expect(result.conflicts!.some(c => c.message.includes('Type conflict'))).toBe(true);
    });
    
    it('should skip invalid libraries with warnings', () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe 1' } }
      };
      
      const result = mergeLibraries([lib1, null as any, undefined as any]);
      
      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
    });
    
    it('should update metadata after merge', () => {
      const lib1: LibraryData = {
        recipes: { 'recipe-1': { id: 'recipe-1', name: 'Recipe 1' } }
      };
      
      const lib2: LibraryData = {
        panels: { 'panel-1': { id: 'panel-1', name: 'Panel 1' } }
      };
      
      const result = mergeLibraries([lib1, lib2]);
      
      expect(result.success).toBe(true);
      expect(result.data.lastModified).toBeDefined();
      expect(result.data.version).toBeDefined();
    });
    
    it('should handle complex nested merges', () => {
      const lib1: LibraryData = {
        projects: {
          'proj-1': {
            id: 'proj-1',
            name: 'Project 1',
            panels: {
              'panel-1': { colorwork: [] }
            }
          }
        }
      };
      
      const lib2: LibraryData = {
        projects: {
          'proj-1': {
            id: 'proj-1',
            panels: {
              'panel-2': { colorwork: [] }
            }
          }
        }
      };
      
      const result = mergeLibraries([lib1, lib2], { strategy: 'deep' });
      
      expect(result.success).toBe(true);
      const proj = result.data.projects?.['proj-1'];
      expect(proj).toHaveProperty('name', 'Project 1');
      expect(proj.panels).toHaveProperty('panel-1');
      expect(proj.panels).toHaveProperty('panel-2');
    });
  });
  
  describe('validateLibraryStructure', () => {
    it('should validate valid library', () => {
      const lib: LibraryData = {
        recipes: {},
        version: '1.0.0'
      };
      
      expect(validateLibraryStructure(lib)).toBe(true);
    });
    
    it('should reject null', () => {
      expect(() => validateLibraryStructure(null)).toThrow();
    });
    
    it('should reject non-object', () => {
      expect(() => validateLibraryStructure('invalid')).toThrow();
    });
    
    it('should warn on empty library', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      validateLibraryStructure({});
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
  
  describe('normalizeLibraryData', () => {
    it('should add missing metadata', () => {
      const lib: LibraryData = {
        recipes: {}
      };
      
      const normalized = normalizeLibraryData(lib);
      
      expect(normalized.version).toBeDefined();
      expect(normalized.lastModified).toBeDefined();
    });
    
    it('should preserve existing metadata', () => {
      const lib: LibraryData = {
        version: '2.0.0',
        lastModified: '2024-01-01T00:00:00.000Z',
        recipes: {}
      };
      
      const normalized = normalizeLibraryData(lib);
      
      expect(normalized.version).toBe('2.0.0');
      expect(normalized.lastModified).toBe('2024-01-01T00:00:00.000Z');
    });
    
    it('should fix invalid collection types', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const lib: LibraryData = {
        recipes: 'invalid' as any,
        artists: 'invalid' as any
      };
      
      const normalized = normalizeLibraryData(lib);
      
      expect(normalized.recipes).toEqual({});
      expect(normalized.artists).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
    
    it('should handle all collection types', () => {
      const lib: LibraryData = {
        recipes: null as any,
        panels: null as any,
        projects: null as any,
        knittingProjects: null as any,
        colorworkPatterns: null as any,
        artists: null as any,
        entries: null as any
      };
      
      const normalized = normalizeLibraryData(lib);
      
      expect(typeof normalized.recipes).toBe('object');
      expect(typeof normalized.panels).toBe('object');
      expect(typeof normalized.projects).toBe('object');
      expect(typeof normalized.knittingProjects).toBe('object');
      expect(typeof normalized.colorworkPatterns).toBe('object');
      expect(Array.isArray(normalized.artists)).toBe(true);
      expect(Array.isArray(normalized.entries)).toBe(true);
    });
  });
});
