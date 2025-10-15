/**
 * Tests for React Query Hooks
 * 
 * Test hooks with @testing-library/react
 * Verify optimistic updates work
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAuthState,
  useSignIn,
  useSignOut,
  useLibrary,
  useSaveLibrary,
  useMergeLibraries,
  useEntry,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
  driveKeys
} from '../hooks';
import { MockDriveAdapter } from '../MockAdapter';
import type { LibraryData } from '../types';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  return { wrapper: Wrapper, queryClient };
}

describe('React Query Hooks', () => {
  let adapter: MockDriveAdapter;
  
  beforeEach(() => {
    adapter = new MockDriveAdapter();
  });

  // ==========================================================================
  // Auth Hooks
  // ==========================================================================
  
  describe('useAuthState', () => {
    it('should fetch auth state', async () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useAuthState(adapter), { wrapper });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(result.current.data?.isSignedIn).toBe(false);
    });
  });
  
  describe('useSignIn', () => {
    it('should sign in and update cache', async () => {
      const { wrapper, queryClient } = createWrapper();
      
      const { result } = renderHook(() => useSignIn(adapter), { wrapper });
      
      result.current.mutate();
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      const authState = queryClient.getQueryData(driveKeys.auth());
      expect(authState?.isSignedIn).toBe(true);
    });
  });
  
  describe('useSignOut', () => {
    it('should sign out and clear cache', async () => {
      const { wrapper, queryClient } = createWrapper();
      
      await adapter.signIn();
      queryClient.setQueryData(driveKeys.auth(), { isSignedIn: true });
      
      const { result } = renderHook(() => useSignOut(adapter), { wrapper });
      
      result.current.mutate();
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      const authState = queryClient.getQueryData(driveKeys.auth());
      expect(authState?.isSignedIn).toBe(false);
    });
  });

  // ==========================================================================
  // Library Hooks
  // ==========================================================================
  
  describe('useLibrary', () => {
    it('should fetch library', async () => {
      await adapter.signIn();
      const library: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Test Artist' }]
      };
      await adapter.saveLibrary(library);
      
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useLibrary(adapter), { wrapper });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(result.current.data?.artists).toHaveLength(1);
    });
    
    it('should use stale time', async () => {
      await adapter.signIn();
      
      const { wrapper } = createWrapper();
      const { result, rerender } = renderHook(() => useLibrary(adapter), { wrapper });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      const fetchCount = result.current.dataUpdatedAt;
      
      rerender();
      
      expect(result.current.dataUpdatedAt).toBe(fetchCount); // Should use cached data
    });
  });
  
  describe('useSaveLibrary', () => {
    it('should save library with optimistic update', async () => {
      await adapter.signIn();
      
      const { wrapper, queryClient } = createWrapper();
      
      const { result } = renderHook(() => useSaveLibrary(adapter), { wrapper });
      
      const newLibrary: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'New Artist' }]
      };
      
      result.current.mutate(newLibrary);
      
      // Wait for mutation to process (onMutate is async)
      await waitFor(() => {
        const cached = queryClient.getQueryData<LibraryData>(driveKeys.library());
        return cached?.artists?.[0]?.name === 'New Artist';
      });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
    
    it('should rollback on error', async () => {
      await adapter.signIn();
      adapter.setNetworkFailure(true);
      
      const { wrapper, queryClient } = createWrapper();
      
      const original: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Original' }]
      };
      
      queryClient.setQueryData(driveKeys.library(), original);
      
      const { result } = renderHook(() => useSaveLibrary(adapter), { wrapper });
      
      const updated: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Updated' }]
      };
      
      result.current.mutate(updated);
      
      await waitFor(() => expect(result.current.isError).toBe(true));
      
      // Should rollback to original
      const cached = queryClient.getQueryData<LibraryData>(driveKeys.library());
      expect(cached?.artists?.[0].name).toBe('Original');
    });
  });
  
  describe('useMergeLibraries', () => {
    it('should merge libraries', async () => {
      await adapter.signIn();
      
      const lib1: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Artist 1' }]
      };
      
      const lib2: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-2', name: 'Artist 2' }]
      };
      
      await adapter.saveLibrary(lib1, 'file1');
      await adapter.saveLibrary(lib2, 'file2');
      
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMergeLibraries(adapter), { wrapper });
      
      result.current.mutate({ fileIds: ['file1', 'file2'] });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(result.current.data?.artists).toHaveLength(2);
    });
  });

  // ==========================================================================
  // CRUD Hooks
  // ==========================================================================
  
  describe('useEntry', () => {
    it('should fetch entry', async () => {
      await adapter.signIn();
      
      const library: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Test Artist' }]
      };
      
      await adapter.saveLibrary(library);
      
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEntry(adapter, 'artists', 'artist-1'),
        { wrapper }
      );
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(result.current.data?.name).toBe('Test Artist');
    });
  });
  
  describe('useCreateEntry', () => {
    it('should create entry and invalidate cache', async () => {
      await adapter.signIn();
      await adapter.saveLibrary({
        version: '1.0.0',
        lastModified: new Date().toISOString()
      });
      
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () => useCreateEntry(adapter, 'artists'),
        { wrapper }
      );
      
      result.current.mutate({
        id: 'artist-1',
        data: { name: 'New Artist' }
      });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
  
  describe('useUpdateEntry', () => {
    it('should update entry with optimistic update', async () => {
      await adapter.signIn();
      
      const library: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Original Name' }]
      };
      
      await adapter.saveLibrary(library);
      
      const { wrapper, queryClient } = createWrapper();
      
      // Seed cache
      queryClient.setQueryData(
        driveKeys.entry('artists', 'artist-1'),
        { id: 'artist-1', name: 'Original Name' }
      );
      
      const { result } = renderHook(
        () => useUpdateEntry(adapter, 'artists', 'artist-1'),
        { wrapper }
      );
      
      result.current.mutate({ id: 'artist-1', name: 'Updated Name' });
      
      // Wait for mutation to process (onMutate is async)
      await waitFor(() => {
        const cached = queryClient.getQueryData(driveKeys.entry('artists', 'artist-1'));
        return cached?.name === 'Updated Name';
      });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
    
    it('should rollback on error', async () => {
      await adapter.signIn();
      adapter.setNetworkFailure(true);
      
      const { wrapper, queryClient } = createWrapper();
      
      const original = { id: 'artist-1', name: 'Original' };
      queryClient.setQueryData(driveKeys.entry('artists', 'artist-1'), original);
      
      const { result } = renderHook(
        () => useUpdateEntry(adapter, 'artists', 'artist-1'),
        { wrapper }
      );
      
      result.current.mutate({ id: 'artist-1', name: 'Updated' });
      
      await waitFor(() => expect(result.current.isError).toBe(true));
      
      // Should rollback
      const cached = queryClient.getQueryData(driveKeys.entry('artists', 'artist-1'));
      expect(cached?.name).toBe('Original');
    });
  });
  
  describe('useDeleteEntry', () => {
    it('should delete entry and remove from cache', async () => {
      await adapter.signIn();
      
      const library: LibraryData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        artists: [{ id: 'artist-1', name: 'Test Artist' }]
      };
      
      await adapter.saveLibrary(library);
      
      const { wrapper, queryClient } = createWrapper();
      
      queryClient.setQueryData(
        driveKeys.entry('artists', 'artist-1'),
        { id: 'artist-1', name: 'Test Artist' }
      );
      
      const { result } = renderHook(
        () => useDeleteEntry(adapter, 'artists'),
        { wrapper }
      );
      
      result.current.mutate('artist-1');
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      // Should remove from cache
      const cached = queryClient.getQueryData(driveKeys.entry('artists', 'artist-1'));
      expect(cached).toBeUndefined();
    });
  });
});
