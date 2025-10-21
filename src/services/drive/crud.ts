/**
 * CRUD Operations Utility
 * 
 * Provides efficient read-modify-write operations for updating
 * individual members within library collections.
 */

import type {
  LibraryData,
  CrudOperation,
  CrudOptions,
  CrudResult
} from './types';

/**
 * Generate a unique ID for a new entry
 */
function generateId(collection: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${collection}-${timestamp}-${random}`;
}

/**
 * Get a collection from library data
 * Handles both object-based and array-based collections
 */
function getCollection(
  library: LibraryData,
  collectionName: keyof LibraryData
): any {
  return library[collectionName];
}

/**
 * Set a collection in library data
 */
function setCollection(
  library: LibraryData,
  collectionName: keyof LibraryData,
  collection: any
): void {
  library[collectionName] = collection;
}

/**
 * Create a new entry in a collection
 * 
 * @param library - The library data
 * @param collection - The collection name
 * @param data - The data to create
 * @returns Result with the created entry
 */
export function createEntry<T = any>(
  library: LibraryData,
  collection: keyof LibraryData,
  data: T
): CrudResult<T> {
  try {
    let col = getCollection(library, collection);
    
    // Initialize collection if it doesn't exist
    if (!col) {
      // Determine if this should be an array or object based on convention
      const arrayCollections = ['artists', 'entries'];
      col = arrayCollections.includes(collection as string) ? [] : {};
      setCollection(library, collection, col);
    }
    
    // Generate ID if not provided
    const entry = data as any;
    if (!entry.id) {
      entry.id = generateId(collection as string);
    }
    
    const id = entry.id;
    
    // Add to collection
    if (Array.isArray(col)) {
      // Check for duplicate ID
      const existing = col.find((item: any) => item.id === id);
      if (existing) {
        return {
          success: false,
          operation: 'create',
          collection: collection as string,
          error: `Entry with ID "${id}" already exists in collection "${collection}"`
        };
      }
      
      col.push(entry);
    } else if (typeof col === 'object') {
      // Check for duplicate ID
      if (col[id]) {
        return {
          success: false,
          operation: 'create',
          collection: collection as string,
          error: `Entry with ID "${id}" already exists in collection "${collection}"`
        };
      }
      
      col[id] = entry;
    } else {
      return {
        success: false,
        operation: 'create',
        collection: collection as string,
        error: `Collection "${collection}" has invalid type: ${typeof col}`
      };
    }
    
    // Update library metadata
    library.lastModified = new Date().toISOString();
    
    return {
      success: true,
      operation: 'create',
      collection: collection as string,
      id,
      data: entry
    };
  } catch (error: any) {
    return {
      success: false,
      operation: 'create',
      collection: collection as string,
      error: error.message || 'Unknown error during create operation'
    };
  }
}

/**
 * Read an entry from a collection
 * 
 * @param library - The library data
 * @param collection - The collection name
 * @param id - The entry ID
 * @returns Result with the entry data
 */
export function readEntry<T = any>(
  library: LibraryData,
  collection: keyof LibraryData,
  id: string
): CrudResult<T> {
  try {
    const col = getCollection(library, collection);
    
    if (!col) {
      return {
        success: false,
        operation: 'read',
        collection: collection as string,
        id,
        error: `Collection "${collection}" does not exist`
      };
    }
    
    let entry: any;
    
    if (Array.isArray(col)) {
      entry = col.find((item: any) => item.id === id);
    } else if (typeof col === 'object') {
      entry = col[id];
    } else {
      return {
        success: false,
        operation: 'read',
        collection: collection as string,
        id,
        error: `Collection "${collection}" has invalid type: ${typeof col}`
      };
    }
    
    if (!entry) {
      return {
        success: false,
        operation: 'read',
        collection: collection as string,
        id,
        error: `Entry with ID "${id}" not found in collection "${collection}"`
      };
    }
    
    return {
      success: true,
      operation: 'read',
      collection: collection as string,
      id,
      data: entry
    };
  } catch (error: any) {
    return {
      success: false,
      operation: 'read',
      collection: collection as string,
      id,
      error: error.message || 'Unknown error during read operation'
    };
  }
}

/**
 * Update an entry in a collection
 * 
 * @param library - The library data
 * @param collection - The collection name
 * @param id - The entry ID
 * @param updates - Partial data to update
 * @returns Result with the updated entry
 */
export function updateEntry<T = any>(
  library: LibraryData,
  collection: keyof LibraryData,
  id: string,
  updates: Partial<T>
): CrudResult<T> {
  try {
    const col = getCollection(library, collection);
    
    if (!col) {
      return {
        success: false,
        operation: 'update',
        collection: collection as string,
        id,
        error: `Collection "${collection}" does not exist`
      };
    }
    
    let entry: any;
    let found = false;
    
    if (Array.isArray(col)) {
      const index = col.findIndex((item: any) => item.id === id);
      if (index >= 0) {
        entry = col[index];
        // Merge updates
        col[index] = { ...entry, ...updates, id }; // Preserve ID
        entry = col[index];
        found = true;
      }
    } else if (typeof col === 'object') {
      entry = col[id];
      if (entry) {
        // Merge updates
        col[id] = { ...entry, ...updates, id }; // Preserve ID
        entry = col[id];
        found = true;
      }
    } else {
      return {
        success: false,
        operation: 'update',
        collection: collection as string,
        id,
        error: `Collection "${collection}" has invalid type: ${typeof col}`
      };
    }
    
    if (!found) {
      return {
        success: false,
        operation: 'update',
        collection: collection as string,
        id,
        error: `Entry with ID "${id}" not found in collection "${collection}"`
      };
    }
    
    // Update library metadata
    library.lastModified = new Date().toISOString();
    
    return {
      success: true,
      operation: 'update',
      collection: collection as string,
      id,
      data: entry
    };
  } catch (error: any) {
    return {
      success: false,
      operation: 'update',
      collection: collection as string,
      id,
      error: error.message || 'Unknown error during update operation'
    };
  }
}

/**
 * Delete an entry from a collection
 * 
 * @param library - The library data
 * @param collection - The collection name
 * @param id - The entry ID
 * @returns Result of the delete operation
 */
export function deleteEntry(
  library: LibraryData,
  collection: keyof LibraryData,
  id: string
): CrudResult<void> {
  try {
    const col = getCollection(library, collection);
    
    if (!col) {
      return {
        success: false,
        operation: 'delete',
        collection: collection as string,
        id,
        error: `Collection "${collection}" does not exist`
      };
    }
    
    let found = false;
    
    if (Array.isArray(col)) {
      const index = col.findIndex((item: any) => item.id === id);
      if (index >= 0) {
        col.splice(index, 1);
        found = true;
      }
    } else if (typeof col === 'object') {
      if (col[id]) {
        delete col[id];
        found = true;
      }
    } else {
      return {
        success: false,
        operation: 'delete',
        collection: collection as string,
        id,
        error: `Collection "${collection}" has invalid type: ${typeof col}`
      };
    }
    
    if (!found) {
      return {
        success: false,
        operation: 'delete',
        collection: collection as string,
        id,
        error: `Entry with ID "${id}" not found in collection "${collection}"`
      };
    }
    
    // Update library metadata
    library.lastModified = new Date().toISOString();
    
    return {
      success: true,
      operation: 'delete',
      collection: collection as string,
      id
    };
  } catch (error: any) {
    return {
      success: false,
      operation: 'delete',
      collection: collection as string,
      id,
      error: error.message || 'Unknown error during delete operation'
    };
  }
}

/**
 * Execute a CRUD operation
 * 
 * @param library - The library data
 * @param options - The CRUD operation options
 * @returns Result of the operation
 */
export function executeCrudOperation<T = any>(
  library: LibraryData,
  options: CrudOptions<T>
): CrudResult<T> {
  const { operation, collection, id, data } = options;
  
  switch (operation) {
    case 'create':
      if (!data) {
        return {
          success: false,
          operation,
          collection: collection as string,
          error: 'Data is required for create operation'
        };
      }
      return createEntry(library, collection, data);
      
    case 'read':
      if (!id) {
        return {
          success: false,
          operation,
          collection: collection as string,
          error: 'ID is required for read operation'
        };
      }
      return readEntry(library, collection, id);
      
    case 'update':
      if (!id || !data) {
        return {
          success: false,
          operation,
          collection: collection as string,
          id,
          error: 'ID and data are required for update operation'
        };
      }
      return updateEntry(library, collection, id, data);
      
    case 'delete':
      if (!id) {
        return {
          success: false,
          operation,
          collection: collection as string,
          error: 'ID is required for delete operation'
        };
      }
      return deleteEntry(library, collection, id) as CrudResult<T>;
      
    default:
      return {
        success: false,
        operation,
        collection: collection as string,
        error: `Unknown operation: ${operation}`
      };
  }
}
