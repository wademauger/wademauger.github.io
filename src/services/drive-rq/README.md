# Google Drive Adapter - React Query Integration

**Simplified, React Query-first approach**

This adapter is a **thin API client** for Google Drive. React Query handles all caching, state management, optimistic updates, retries, and background refetching.

## Why This Approach?

The previous implementation (~4,100 lines) re-implemented features that React Query already provides:
- ❌ Custom caching logic
- ❌ Custom state management  
- ❌ Complex result wrappers (CrudResult, FileOperationResult, MergeResult)
- ❌ Retry logic
- ❌ Optimistic update infrastructure

**This implementation (~600 lines) uses React Query's built-in features:**
- ✅ Automatic caching with configurable stale times
- ✅ Background refetching and synchronization
- ✅ Optimistic updates with automatic rollback
- ✅ Request deduplication
- ✅ Loading/error state management
- ✅ Garbage collection of unused queries

## Architecture

```
src/services/drive-rq/
├── types.ts          # TypeScript interfaces (90 lines)
├── utils.ts          # Merge utilities (110 lines)
├── MockAdapter.ts    # Mock for testing (250 lines)
├── hooks.ts          # React Query hooks (250 lines)
└── index.ts          # Public API (45 lines)
```

**Total: ~745 lines** (vs 4,100 lines in old implementation)

## Installation

```bash
npm install @tanstack/react-query
```

## Quick Start

### 1. Setup Query Client

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMockAdapter } from './services/drive-rq';

const queryClient = new QueryClient();
const driveAdapter = createMockAdapter(); // or GoogleDriveAdapter()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp adapter={driveAdapter} />
    </QueryClientProvider>
  );
}
```

### 2. Use Hooks

```tsx
import { useLibrary, useSaveLibrary } from './services/drive-rq';

function LibraryView({ adapter }) {
  // Fetch library (automatically cached, refetched in background)
  const { data: library, isLoading, error } = useLibrary(adapter);
  
  // Save library (with optimistic updates + rollback on error)
  const saveMutation = useSaveLibrary(adapter);
  
  const handleSave = (newData) => {
    saveMutation.mutate(newData, {
      onSuccess: () => console.log('Saved!'),
      onError: (err) => console.error('Failed:', err)
    });
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <button onClick={() => handleSave(library)}>
        {saveMutation.isLoading ? 'Saving...' : 'Save'}
      </button>
      {/* render library */}
    </div>
  );
}
```

## API Reference

### Authentication Hooks

#### `useAuthState(adapter)`
Fetches current authentication state.

```tsx
const { data: authState } = useAuthState(adapter);

if (authState?.isSignedIn) {
  // User is signed in
}
```

#### `useSignIn(adapter, options?)`
Signs the user in.

```tsx
const signInMutation = useSignIn(adapter, {
  onSuccess: (authState) => {
    console.log('Signed in as', authState.userEmail);
  }
});

<button onClick={() => signInMutation.mutate()}>
  Sign In
</button>
```

#### `useSignOut(adapter, options?)`
Signs the user out and clears all cached data.

```tsx
const signOutMutation = useSignOut(adapter);

<button onClick={() => signOutMutation.mutate()}>
  Sign Out
</button>
```

### Library Hooks

#### `useLibrary(adapter, fileId?, options?)`
Fetches a library with automatic caching.

```tsx
const { 
  data: library,
  isLoading,
  error,
  refetch 
} = useLibrary(adapter, 'my-file-id');
```

**Options:**
- Stale time: 5 minutes (configurable)
- Automatic background refetching
- Cache persists across component remounts

#### `useSaveLibrary(adapter, fileId?, options?)`
Saves a library with **optimistic updates**.

```tsx
const saveMutation = useSaveLibrary(adapter, 'my-file-id', {
  onSuccess: (savedFileId) => {
    console.log('Saved to', savedFileId);
  },
  onError: (error) => {
    // Automatic rollback already happened
    console.error('Save failed', error);
  }
});

saveMutation.mutate(updatedLibrary);
```

**Features:**
- ✅ Immediate UI update (optimistic)
- ✅ Automatic rollback on error
- ✅ Cache invalidation on success

#### `useMergeLibraries(adapter, options?)`
Merges multiple libraries.

```tsx
const mergeMutation = useMergeLibraries(adapter);

mergeMutation.mutate({
  fileIds: ['file-1', 'file-2', 'file-3'],
  mergeOptions: { precedence: 'last' }
});

if (mergeMutation.isSuccess) {
  const merged = mergeMutation.data;
}
```

### CRUD Hooks

#### `useEntry(adapter, collection, id, fileId?, options?)`
Fetches a single entry from a collection.

```tsx
const { data: artist } = useEntry(
  adapter,
  'artists',
  'artist-123'
);

console.log(artist?.name);
```

#### `useCreateEntry(adapter, collection, fileId?, options?)`
Creates a new entry.

```tsx
const createMutation = useCreateEntry(adapter, 'artists');

createMutation.mutate({
  id: 'artist-456',
  data: { name: 'New Artist', bio: '...' }
});
```

#### `useUpdateEntry(adapter, collection, id, fileId?, options?)`
Updates an existing entry with **optimistic updates**.

```tsx
const updateMutation = useUpdateEntry(adapter, 'artists', 'artist-123');

updateMutation.mutate({
  name: 'Updated Name',
  bio: 'Updated bio'
});
```

#### `useDeleteEntry(adapter, collection, fileId?, options?)`
Deletes an entry and removes it from cache.

```tsx
const deleteMutation = useDeleteEntry(adapter, 'artists');

deleteMutation.mutate('artist-123');
```

## Advanced Usage

### Custom Stale Time

```tsx
const { data } = useLibrary(adapter, undefined, {
  staleTime: 600000, // 10 minutes
  cacheTime: 900000, // 15 minutes
});
```

### Manual Cache Updates

```tsx
import { driveKeys } from './services/drive-rq';
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();
  
  const handleManualUpdate = () => {
    queryClient.setQueryData(
      driveKeys.library(),
      (old) => ({ ...old, artists: [...old.artists, newArtist] })
    );
  };
}
```

### Prefetching

```tsx
const queryClient = useQueryClient();

await queryClient.prefetchQuery({
  queryKey: driveKeys.library('file-123'),
  queryFn: () => adapter.loadLibrary('file-123')
});
```

### Dependent Queries

```tsx
const { data: authState } = useAuthState(adapter);

const { data: library } = useLibrary(adapter, undefined, {
  enabled: authState?.isSignedIn === true
});
```

## Testing

### Unit Tests (Adapter)

Test the adapter in isolation:

```tsx
import { MockDriveAdapter } from './services/drive-rq';

describe('MockAdapter', () => {
  let adapter: MockDriveAdapter;
  
  beforeEach(() => {
    adapter = new MockDriveAdapter();
  });
  
  it('should save and load library', async () => {
    await adapter.signIn();
    
    const data = { version: '1.0.0', artists: [] };
    const fileId = await adapter.saveLibrary(data);
    const loaded = await adapter.loadLibrary(fileId);
    
    expect(loaded.artists).toEqual([]);
  });
});
```

### Integration Tests (Hooks)

Test hooks with React Query:

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLibrary } from './services/drive-rq';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

it('should fetch library', async () => {
  const adapter = new MockDriveAdapter();
  await adapter.signIn();
  
  const { result } = renderHook(
    () => useLibrary(adapter),
    { wrapper: createWrapper() }
  );
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  
  expect(result.current.data?.version).toBe('1.0.0');
});
```

### Mock Configuration

```tsx
const adapter = new MockDriveAdapter();

// Simulate auth failure
adapter.setAuthFailure(true);
await expect(adapter.signIn()).rejects.toThrow();

// Simulate network delay
adapter.setNetworkDelay(1000);

// Seed test data
adapter.seedFile('test-file', {
  version: '1.0.0',
  artists: [{ id: '1', name: 'Test' }]
});

// Reset between tests
adapter.reset();
```

## Migration from Old Adapter

### Before (Old Approach)

```tsx
// Old: Custom result wrappers
const result = await adapter.saveLibrary(data);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}

// Old: Manual caching
const cached = getCachedLibrary();
if (cached) return cached;
const fresh = await adapter.loadLibrary();
cacheLibrary(fresh);

// Old: Manual optimistic updates
setLibrary(optimisticValue);
try {
  await adapter.saveLibrary(optimisticValue);
} catch (error) {
  setLibrary(previousValue); // Manual rollback
}
```

### After (React Query Approach)

```tsx
// New: Automatic error handling
const mutation = useSaveLibrary(adapter);
mutation.mutate(data, {
  onSuccess: (fileId) => console.log(fileId),
  onError: (error) => console.error(error)
});

// New: Automatic caching
const { data: library } = useLibrary(adapter);
// React Query handles caching, staleness, refetching

// New: Automatic optimistic updates
const mutation = useSaveLibrary(adapter);
mutation.mutate(newValue);
// React Query handles optimistic update + rollback
```

## Performance

| Feature | Old Adapter | React Query Adapter |
|---------|-------------|---------------------|
| Lines of Code | 4,100 | 745 |
| Bundle Size | ~45 KB | ~15 KB |
| Caching | Custom | Built-in |
| Optimistic Updates | Manual | Automatic |
| Request Deduplication | No | Yes |
| Background Refetching | No | Yes |
| Garbage Collection | Manual | Automatic |

## TypeScript

All hooks are fully typed:

```tsx
interface Artist {
  id: string;
  name: string;
  bio?: string;
}

const { data } = useEntry<Artist>(
  adapter,
  'artists',
  'artist-123'
);

// data is Artist | null | undefined
if (data) {
  console.log(data.name); // ✅ Type-safe
}
```

## FAQ

**Q: Why not use the old adapter?**  
A: The old adapter re-implements features React Query already provides. This creates more code to maintain, larger bundle size, and potential bugs in custom caching logic.

**Q: Can I use this with the real Google Drive API?**  
A: Yes! Replace `MockDriveAdapter` with a `GoogleDriveAdapter` that implements `IDriveAdapter` using the gapi client.

**Q: How do I handle authentication errors?**  
A: React Query provides `onError` callbacks:

```tsx
const { error } = useLibrary(adapter);

if (error instanceof AuthError) {
  // Show login prompt
}
```

**Q: Can I disable optimistic updates?**  
A: Yes, simply don't use the `onMutate` callback. Remove it from the hook implementation.

**Q: How do I test without React?**  
A: Test the adapter directly (it's just a class):

```tsx
const adapter = new MockDriveAdapter();
await adapter.signIn();
const data = await adapter.loadLibrary();
```

## License

MIT
