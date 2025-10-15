/**
 * Google Drive Adapter Module
 * 
 * Unified export for all Google Drive adapter functionality
 */

// Type exports
export type {
  IGoogleDriveAdapter,
  AuthState,
  DriveAdapterConfig,
  DriveFile,
  FindFileOptions,
  FileOperationOptions,
  FileOperationResult,
  LibraryData,
  MergeOptions,
  MergeResult,
  CrudOperation,
  CrudOptions,
  CrudResult
} from './types';

// Error exports
export {
  DriveAdapterError,
  AuthenticationError,
  FileNotFoundError,
  MergeConflictError,
  NetworkError
} from './types';

// Utility exports
export {
  mergeLibraries,
  validateLibraryStructure,
  normalizeLibraryData
} from './merge';

export {
  createEntry,
  readEntry,
  updateEntry,
  deleteEntry,
  executeCrudOperation
} from './crud';

// Mock adapter export
export {
  MockGoogleDriveAdapter,
  createMockAdapter
} from './MockAdapter';

// TODO: Add real adapter when implementing gapi integration
// export { GoogleDriveAdapter } from './GoogleDriveAdapter';
