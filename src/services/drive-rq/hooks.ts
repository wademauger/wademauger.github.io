/**
 * React Query Hooks for Google Drive Adapter
 * 
 * Handles all caching, state management, optimistic updates
 * Adapter is just a thin API client
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from '@tanstack/react-query';

import type {
  IDriveAdapter,
  LibraryData,
  AuthState,
  MergeOptions
} from './types';

// ============================================================================
// Query Keys - For cache invalidation
// ============================================================================

export const driveKeys = {
  all: ['drive'] as const,
  auth: () => [...driveKeys.all, 'auth'] as const,
  library: (fileId?: string) => [...driveKeys.all, 'library', fileId || 'default'] as const,
  entry: (collection: string, id: string, fileId?: string) => 
    [...driveKeys.all, 'entry', collection, id, fileId || 'default'] as const,
};

// ============================================================================
// Auth Hooks
// ============================================================================

export function useAuthState(adapter: IDriveAdapter) {
  return useQuery({
    queryKey: driveKeys.auth(),
    queryFn: () => adapter.getAuthState(),
    staleTime: 60000, // 1 minute
  });
}

export function useSignIn(
  adapter: IDriveAdapter,
  options?: UseMutationOptions<AuthState, Error, void>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => adapter.signIn(),
    onSuccess: (data) => {
      queryClient.setQueryData(driveKeys.auth(), data);
    },
    ...options,
  });
}

export function useSignOut(
  adapter: IDriveAdapter,
  options?: UseMutationOptions<void, Error, void>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => adapter.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(driveKeys.auth(), {
        isSignedIn: false,
        accessToken: null,
        userEmail: null,
        userName: null,
        tokenExpiry: null,
      });
      // Clear all cached libraries
      queryClient.invalidateQueries({ queryKey: driveKeys.all });
    },
    ...options,
  });
}

// ============================================================================
// Library Hooks
// ============================================================================

export function useLibrary(
  adapter: IDriveAdapter,
  fileId?: string,
  options?: Omit<UseQueryOptions<LibraryData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: driveKeys.library(fileId),
    queryFn: () => adapter.loadLibrary(fileId),
    staleTime: 300000, // 5 minutes
    ...options,
  });
}

export function useSaveLibrary(
  adapter: IDriveAdapter,
  fileId?: string,
  options?: UseMutationOptions<string, Error, LibraryData>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LibraryData) => adapter.saveLibrary(data, fileId),
    onMutate: async (newData): Promise<{ previous: LibraryData | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: driveKeys.library(fileId) });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData<LibraryData>(driveKeys.library(fileId));
      
      // Optimistically update
      queryClient.setQueryData(driveKeys.library(fileId), newData);
      
      return { previous };
    },
    onError: (err: Error, variables: LibraryData, onMutateResult: unknown) => {
      // Rollback on error
      const context = onMutateResult as { previous?: LibraryData } | undefined;
      if (context?.previous) {
        queryClient.setQueryData(driveKeys.library(fileId), context.previous);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: driveKeys.library(fileId) });
    },
    ...options,
  });
}

export function useMergeLibraries(
  adapter: IDriveAdapter,
  options?: UseMutationOptions<
    LibraryData,
    Error,
    { fileIds: string[]; mergeOptions?: MergeOptions }
  >
) {
  return useMutation({
    mutationFn: ({ fileIds, mergeOptions }) => 
      adapter.mergeLibraries(fileIds, mergeOptions),
    ...options,
  });
}

// ============================================================================
// CRUD Hooks for Individual Entries
// ============================================================================

export function useEntry<T = unknown>(
  adapter: IDriveAdapter,
  collection: keyof LibraryData,
  id: string,
  fileId?: string,
  options?: Omit<UseQueryOptions<T | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: driveKeys.entry(collection as string, id, fileId),
    queryFn: () => adapter.getEntry<T>(collection, id, fileId),
    staleTime: 300000, // 5 minutes
    ...options,
  });
}

export function useCreateEntry<T = unknown>(
  adapter: IDriveAdapter,
  collection: keyof LibraryData,
  fileId?: string,
  options?: UseMutationOptions<void, Error, { id: string; data: T }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => adapter.setEntry<T>(collection, id, data, fileId),
    onSuccess: (_, variables) => {
      // Invalidate the specific entry and the library
      queryClient.invalidateQueries({ 
        queryKey: driveKeys.entry(collection as string, variables.id, fileId) 
      });
      queryClient.invalidateQueries({ queryKey: driveKeys.library(fileId) });
    },
    ...options,
  });
}

export function useUpdateEntry<T = unknown>(
  adapter: IDriveAdapter,
  collection: keyof LibraryData,
  id: string,
  fileId?: string,
  options?: UseMutationOptions<void, Error, T>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: T) => adapter.setEntry<T>(collection, id, data, fileId),
    onMutate: async (newData): Promise<{ previous: T | undefined }> => {
      const queryKey = driveKeys.entry(collection as string, id, fileId);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData<T>(queryKey);
      
      // Optimistically update
      queryClient.setQueryData(queryKey, newData);
      
      return { previous };
    },
    onError: (err: Error, variables: T, onMutateResult: unknown) => {
      // Rollback on error
      const context = onMutateResult as { previous?: T } | undefined;
      if (context?.previous) {
        const queryKey = driveKeys.entry(collection as string, id, fileId);
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ 
        queryKey: driveKeys.entry(collection as string, id, fileId) 
      });
      queryClient.invalidateQueries({ queryKey: driveKeys.library(fileId) });
    },
    ...options,
  });
}

export function useDeleteEntry(
  adapter: IDriveAdapter,
  collection: keyof LibraryData,
  fileId?: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adapter.deleteEntry(collection, id, fileId),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate library
      queryClient.removeQueries({ 
        queryKey: driveKeys.entry(collection as string, id, fileId) 
      });
      queryClient.invalidateQueries({ queryKey: driveKeys.library(fileId) });
    },
    ...options,
  });
}
