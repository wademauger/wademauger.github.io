/**
 * Simplified Merge Utilities for React Query Adapter
 * 
 * Just the core merge logic - no caching, no complex options
 */

import type { LibraryData, MergeOptions } from './types';

/**
 * Merge two arrays, deduplicating by ID
 */
function mergeArrays(target: any[], source: any[], precedence: 'first' | 'last'): any[] {
  const idMap = new Map();
  
  // Add target items
  for (const item of target) {
    if (item?.id) {
      idMap.set(item.id, item);
    } else {
      // Items without ID are always kept
      idMap.set(Symbol(), item);
    }
  }
  
  // Add source items, respecting precedence
  for (const item of source) {
    if (item?.id) {
      if (precedence === 'last' || !idMap.has(item.id)) {
        idMap.set(item.id, item);
      }
    } else {
      idMap.set(Symbol(), item);
    }
  }
  
  return Array.from(idMap.values());
}

/**
 * Deep merge two objects
 */
function deepMerge(
  target: any,
  source: any,
  strategy: 'deep' | 'shallow' = 'deep',
  precedence: 'first' | 'last' = 'last'
): any {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return source;
  
  if (Array.isArray(source)) {
    if (Array.isArray(target)) {
      return mergeArrays(target, source, precedence);
    }
    return source;
  }
  
  const result = strategy === 'shallow' ? { ...target } : JSON.parse(JSON.stringify(target));
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (strategy === 'deep' && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key], strategy, precedence);
      } else if (Array.isArray(source[key])) {
        result[key] = mergeArrays(result[key] || [], source[key], precedence);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Merge multiple libraries into one
 */
export function mergeLibraries(
  libraries: LibraryData[],
  options: MergeOptions = {}
): LibraryData {
  const { strategy = 'deep', precedence = 'last' } = options;
  
  if (libraries.length === 0) return {};
  if (libraries.length === 1) return libraries[0];
  
  let merged: LibraryData = {};
  const precStrategy = precedence === 'first' ? 'first' : 'last';
  
  for (const lib of libraries) {
    merged = deepMerge(merged, lib, strategy === 'replace' ? 'shallow' : strategy, precStrategy);
  }
  
  merged.lastModified = new Date().toISOString();
  merged.version = merged.version || '1.0.0';
  
  return merged;
}
