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

// Adapters
export { MockDriveAdapter, createMockAdapter } from './MockAdapter';
export { GoogleDriveAdapter, createGoogleDriveAdapter } from './GoogleDriveAdapter';

// Provider & Context
export { DriveProvider, useDriveAdapter, useDriveAdapterStatus } from './DriveProvider';

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
