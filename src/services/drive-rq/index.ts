/**
 * Google Drive Adapter - React Query Integration
 * 
 * Thin API client + React Query hooks
 * Let React Query handle caching, state, retries, optimistic updates
 */

// Types
export type {
  IDriveAdapter,
  AuthState,
  DriveAdapterConfig,
  LibraryData,
  DriveFile,
  MergeOptions
} from './types';

export {
  DriveError,
  AuthError,
  NotFoundError,
  NetworkError
} from './types';

// Utilities
export { mergeLibraries } from './utils';

// Mock Adapter
export { MockDriveAdapter, createMockAdapter } from './MockAdapter';

// React Query Hooks
export {
  driveKeys,
  useAuthState,
  useSignIn,
  useSignOut,
  useLibrary,
  useSaveLibrary,
  useMergeLibraries,
  useEntry,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry
} from './hooks';
