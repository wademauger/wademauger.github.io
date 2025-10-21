/**
 * Library Merge Utilities
 * 
 * Provides logic for merging multiple library JSON files into a single
 * unified library object with conflict detection and resolution.
 */

import type {
  LibraryData,
  MergeOptions,
  MergeResult,
  MergeConflictError
} from './types';

/**
 * Default merge options
 */
const DEFAULT_MERGE_OPTIONS: Required<MergeOptions> = {
  strategy: 'deep',
  conflictResolution: 'keepLast',
  preserveArrays: false
};

/**
 * Deep clone an object
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  const cloned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Check if a value is a plain object (not Array, Date, etc.)
 */
function isPlainObject(value: any): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Deep merge two objects with conflict tracking
 * 
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @param path - Current path for conflict reporting
 * @param options - Merge options
 * @param conflicts - Array to collect conflicts
 * @returns The merged object
 */
function deepMergeWithConflicts(
  target: any,
  source: any,
  path: string,
  options: Required<MergeOptions>,
  conflicts: Array<{ path: string; message: string }>
): any {
  // If source is null/undefined, return target
  if (source === null || source === undefined) {
    return target;
  }
  
  // If target is null/undefined, return cloned source
  if (target === null || target === undefined) {
    return deepClone(source);
  }
  
  // Handle arrays
  if (Array.isArray(source)) {
    if (!Array.isArray(target)) {
      // Type conflict
      conflicts.push({
        path,
        message: `Type conflict: target is ${typeof target}, source is array`
      });
      
      if (options.conflictResolution === 'error') {
        throw new Error(`Type conflict at ${path}`);
      }
      
      return options.conflictResolution === 'keepLast' 
        ? deepClone(source)
        : target;
    }
    
    // Merge arrays
    if (options.preserveArrays) {
      // Concatenate arrays
      return [...target, ...source];
    } else {
      // Replace array
      return deepClone(source);
    }
  }
  
  // Handle plain objects
  if (isPlainObject(source)) {
    if (!isPlainObject(target)) {
      // Type conflict
      conflicts.push({
        path,
        message: `Type conflict: target is ${typeof target}, source is object`
      });
      
      if (options.conflictResolution === 'error') {
        throw new Error(`Type conflict at ${path}`);
      }
      
      return options.conflictResolution === 'keepLast'
        ? deepClone(source)
        : target;
    }
    
    // Deep merge objects
    const result: any = options.strategy === 'shallow' ? { ...target } : deepClone(target);
    
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const newPath = path ? `${path}.${key}` : key;
        const sourceValue = source[key];
        const targetValue = result[key];
        
        if (targetValue === undefined) {
          // No conflict, add new key
          result[key] = deepClone(sourceValue);
        } else if (options.strategy === 'shallow') {
          // Shallow merge: source overwrites target
          result[key] = deepClone(sourceValue);
        } else {
          // Deep merge
          result[key] = deepMergeWithConflicts(
            targetValue,
            sourceValue,
            newPath,
            options,
            conflicts
          );
        }
      }
    }
    
    return result;
  }
  
  // Primitive values
  if (target !== source) {
    // If one side is a plain object/array and the other is a primitive, treat as a type conflict
    if ((isPlainObject(target) || Array.isArray(target)) && !(isPlainObject(source) || Array.isArray(source))) {
      conflicts.push({
        path,
        message: `Type conflict: target is ${Array.isArray(target) ? 'array' : typeof target}, source is ${Array.isArray(source) ? 'array' : typeof source}`
      });

      if (options.conflictResolution === 'error') {
        throw new Error(`Type conflict at ${path}`);
      }

      return options.conflictResolution === 'keepLast' ? deepClone(source) : target;
    }

    // Otherwise this is a value conflict
    conflicts.push({
      path,
      message: `Value conflict: target="${target}", source="${source}"`
    });

    if (options.conflictResolution === 'error') {
      throw new Error(`Value conflict at ${path}`);
    }
  }

  return options.conflictResolution === 'keepLast' ? source : target;
}

/**
 * Merge multiple library objects into one
 * 
 * @param libraries - Array of library objects to merge
 * @param options - Merge options
 * @returns Merge result with merged data and any conflicts
 */
export function mergeLibraries(
  libraries: LibraryData[],
  options: MergeOptions = {}
): MergeResult {
  const mergedOptions = { ...DEFAULT_MERGE_OPTIONS, ...options };
  const conflicts: Array<{ path: string; message: string }> = [];
  const warnings: string[] = [];
  
  // Validate inputs
  if (!libraries || libraries.length === 0) {
    return {
      success: true,
      data: {},
      warnings: ['No libraries provided to merge']
    };
  }
  
  // If only one library, return a clone
  if (libraries.length === 1) {
    return {
      success: true,
      data: deepClone(libraries[0])
    };
  }
  
  // Merge libraries sequentially
  let merged: LibraryData = {};
  
  try {
    for (let i = 0; i < libraries.length; i++) {
      const library = libraries[i];
      
      if (!library || typeof library !== 'object') {
        warnings.push(`Library at index ${i} is not a valid object, skipping`);
        continue;
      }
      
      merged = deepMergeWithConflicts(
        merged,
        library,
        '',
        mergedOptions,
        conflicts
      );
    }
    
    // Update metadata
    merged.lastModified = new Date().toISOString();
    if (!merged.version) {
      merged.version = '1.0.0';
    }
    
    return {
      success: true,
      data: merged,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error: any) {
    // Convert to MergeConflictError if needed
    if (error.message && error.message.includes('conflict')) {
      const conflictError = new (require('./types').MergeConflictError)(
        'Merge failed due to conflicts',
        conflicts,
        error
      );
      throw conflictError;
    }
    
    throw error;
  }
}

/**
 * Validate that a library object has a valid structure
 * 
 * @param data - The data to validate
 * @returns True if valid, throws error otherwise
 */
export function validateLibraryStructure(data: any): data is LibraryData {
  if (!data || typeof data !== 'object') {
    throw new Error('Library data must be an object');
  }
  
  // Check for at least one recognized collection
  const knownCollections = [
    'recipes',
    'artists',
    'panels',
    'projects',
    'knittingProjects',
    'colorworkPatterns',
    'entries'
  ];
  
  const hasKnownCollection = knownCollections.some(
    collection => collection in data
  );
  
  if (!hasKnownCollection) {
    console.warn(
      'Library data does not contain any recognized collections. ' +
      'This may be a new or empty library.'
    );
  }
  
  return true;
}

/**
 * Normalize a library object to ensure consistent structure
 * 
 * @param data - The library data to normalize
 * @returns Normalized library data
 */
export function normalizeLibraryData(data: LibraryData): LibraryData {
  const normalized = deepClone(data);
  
  // Ensure metadata fields exist
  if (!normalized.version) {
    normalized.version = '1.0.0';
  }
  
  if (!normalized.lastModified) {
    normalized.lastModified = new Date().toISOString();
  }
  
  // Ensure collection fields are properly typed
  if (normalized.recipes && typeof normalized.recipes !== 'object') {
    console.warn('Invalid recipes collection, resetting to empty object');
    normalized.recipes = {};
  }
  
  if (normalized.panels && typeof normalized.panels !== 'object') {
    console.warn('Invalid panels collection, resetting to empty object');
    normalized.panels = {};
  }
  
  if (normalized.projects && typeof normalized.projects !== 'object') {
    console.warn('Invalid projects collection, resetting to empty object');
    normalized.projects = {};
  }
  
  if (normalized.knittingProjects && typeof normalized.knittingProjects !== 'object') {
    console.warn('Invalid knittingProjects collection, resetting to empty object');
    normalized.knittingProjects = {};
  }
  
  if (normalized.colorworkPatterns && typeof normalized.colorworkPatterns !== 'object') {
    console.warn('Invalid colorworkPatterns collection, resetting to empty object');
    normalized.colorworkPatterns = {};
  }
  
  // If artists or entries are nullish or not arrays, ensure they are arrays
  if (!normalized.artists || !Array.isArray(normalized.artists)) {
    if (normalized.artists && typeof normalized.artists !== 'object') console.warn('Invalid artists collection, resetting to empty array');
    normalized.artists = [];
  }

  if (!normalized.entries || !Array.isArray(normalized.entries)) {
    if (normalized.entries && typeof normalized.entries !== 'object') console.warn('Invalid entries collection, resetting to empty array');
    normalized.entries = [];
  }
  
  return normalized;
}
