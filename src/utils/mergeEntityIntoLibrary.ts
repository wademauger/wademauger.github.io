/**
 * Generic library merge utility
 * Merges an entity into a library object under the specified key
 */

export interface LibraryObject {
  [key: string]: any;
  lastUpdated?: string;
}

/**
 * Merge an entity into a library object
 * @param library - The existing library object
 * @param jsonKey - The key in the library (e.g., 'panels', 'songs', 'recipes')
 * @param entityName - The name/ID of the entity
 * @param entityData - The entity data to merge
 * @returns Updated library object
 */
export function mergeEntityIntoLibrary(
  library: LibraryObject | null | undefined,
  jsonKey: string,
  entityName: string,
  entityData: any
): LibraryObject {
  const lib = (library && typeof library === 'object') ? { ...library } : {};
  
  // Ensure the jsonKey exists as an object
  lib[jsonKey] = lib[jsonKey] && typeof lib[jsonKey] === 'object' ? { ...lib[jsonKey] } : {};
  
  // Merge the entity
  lib[jsonKey][entityName] = entityData;
  
  // Update timestamp
  lib.lastUpdated = new Date().toISOString();
  
  return lib;
}

export default mergeEntityIntoLibrary;
