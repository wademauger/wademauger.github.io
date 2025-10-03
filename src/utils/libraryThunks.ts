import store from '../store';
import type { LibraryFileRef } from '../store/librarySlice';

// Thin wrappers that dispatch librarySlice thunks and unwrap results.
// Keep them small and typed for callers.

export async function loadFullLibraryById(fileId: string): Promise<any> {
  const { loadFullLibraryById } = await import('../store/librarySlice');
  return store.dispatch(loadFullLibraryById(fileId)).unwrap();
}

export async function saveFullLibraryToFile(fileId: string, libraryData: any): Promise<any> {
  const { saveFullLibraryToFile } = await import('../store/librarySlice');
  return store.dispatch(saveFullLibraryToFile({ fileId, libraryData })).unwrap();
}

export async function findLibraryFile(filename: string, folder: string): Promise<any> {
  const { findLibraryFile } = await import('../store/librarySlice');
  return store.dispatch(findLibraryFile({ filename, folder })).unwrap();
}

export async function createOrUpdateLibraryFile(opts: any): Promise<any> {
  const { createOrUpdateLibraryFile } = await import('../store/librarySlice');
  return store.dispatch(createOrUpdateLibraryFile(opts)).unwrap();
}

export async function loadFullLibrary(): Promise<any> {
  const { loadFullLibrary } = await import('../store/librarySlice');
  return store.dispatch(loadFullLibrary()).unwrap();
}

export async function saveFullLibrary(libraryData: any): Promise<any> {
  const { saveFullLibrary } = await import('../store/librarySlice');
  return store.dispatch(saveFullLibrary(libraryData)).unwrap();
}

export async function saveEntry(entry: any, type: string): Promise<any> {
  const { saveEntry } = await import('../store/librarySlice');
  return store.dispatch(saveEntry({ entry, type })).unwrap();
}

export async function openEntry(id: string, type: string): Promise<any> {
  const { openEntry } = await import('../store/librarySlice');
  return store.dispatch(openEntry({ id, type })).unwrap();
}
