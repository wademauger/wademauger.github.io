# Integration Guide - New Drive Adapter

## Overview

The new React Query-based Drive adapter has been integrated into the app. This guide explains how to use it and migrate existing code.

## What's New

### Architecture
- **Thin API Client**: `GoogleDriveAdapter` wraps gapi client
- **React Query Hooks**: Automatic caching, optimistic updates, background refetching
- **DriveProvider**: Context provider for adapter instance
- **Backward Compatibility**: Legacy `DriveAuthContext` still works

### Files Added
```
src/services/drive-rq/
├── GoogleDriveAdapter.ts       - Real gapi implementation
├── DriveProvider.tsx           - Context provider
└── index.ts                    - Updated exports

src/apps/colorwork-designer/context/
└── DriveAuthContext.new.tsx    - Compatibility wrapper
```

### Files Modified
```
src/App.tsx                     - Added DriveProvider
```

## Setup Complete

The app is now configured with:

1. ✅ `QueryClientProvider` - React Query client
2. ✅ `DriveProvider` - Drive adapter instance  
3. ✅ `DriveAuthContext.new.tsx` - Compatibility layer

## Usage

### Option 1: Use New Hooks (Recommended)

For new code or refactored components, use the React Query hooks directly:

```tsx
import { 
  useDriveAdapter, 
  useAuthState, 
  useSignIn, 
  useLibrary,
  useSaveLibrary 
} from '@/services/drive-rq';

function MyComponent() {
  const adapter = useDriveAdapter();
  
  // Auth
  const { data: authState } = useAuthState(adapter);
  const signInMutation = useSignIn(adapter);
  
  // Library
  const { data: library, isLoading } = useLibrary(adapter);
  const saveMutation = useSaveLibrary(adapter);
  
  const handleSave = () => {
    saveMutation.mutate(library, {
      onSuccess: () => console.log('Saved!'),
      onError: (error) => console.error(error)
    });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {authState?.isSignedIn ? (
        <div>Signed in as {authState.userEmail}</div>
      ) : (
        <button onClick={() => signInMutation.mutate()}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

### Option 2: Use Compatibility Layer

Existing components using `DriveAuthContext` can continue to work by swapping the import:

```tsx
// Old:
import { useDriveAuth } from './context/DriveAuthContext';

// New:
import { useDriveAuth } from './context/DriveAuthContext.new';

// Usage stays the same:
function MyComponent() {
  const { isSignedIn, userInfo, signOut } = useDriveAuth();
  
  return (
    <div>
      {isSignedIn && <div>Hello {userInfo?.userName}</div>}
    </div>
  );
}
```

## Migration Steps

### Step 1: Replace DriveAuthContext Import

Find components using the old context:

```bash
grep -r "DriveAuthContext" src/apps/
```

Replace imports:

```tsx
// Before
import { useDriveAuth } from '../context/DriveAuthContext';

// After
import { useDriveAuth } from '../context/DriveAuthContext.new';
```

### Step 2: Update Library Operations

Replace direct `GoogleDriveServiceModern` calls:

```tsx
// Before
import GoogleDriveServiceModern from '@/apps/songs/services/GoogleDriveServiceModern';

const library = await GoogleDriveServiceModern.loadLibrary();
await GoogleDriveServiceModern.saveLibrary(library);

// After
import { useDriveAdapter, useLibrary, useSaveLibrary } from '@/services/drive-rq';

function MyComponent() {
  const adapter = useDriveAdapter();
  const { data: library } = useLibrary(adapter);
  const saveMutation = useSaveLibrary(adapter);
  
  const handleSave = () => {
    saveMutation.mutate(library);
  };
}
```

### Step 3: Update CRUD Operations

```tsx
// Before
const songs = await GoogleDriveServiceModern.getSongs();
await GoogleDriveServiceModern.addSong(song);

// After
import { useDriveAdapter, useEntry, useCreateEntry } from '@/services/drive-rq';

function SongsList() {
  const adapter = useDriveAdapter();
  
  // Get all songs (from library artists collection)
  const { data: library } = useLibrary(adapter);
  const songs = library?.artists?.flatMap(a => a.albums) || [];
  
  // Create song
  const createMutation = useCreateEntry(adapter, 'artists');
  
  const handleAdd = (song) => {
    createMutation.mutate({
      id: song.id,
      data: song
    });
  };
}
```

### Step 4: Test Each Component

After migration, test:
- ✅ Sign in works
- ✅ Library loads
- ✅ CRUD operations work
- ✅ Optimistic updates happen
- ✅ Errors rollback correctly

## Benefits

### For Developers

- **Less code**: No more manual caching logic
- **Type safety**: Full TypeScript support
- **Better DX**: React Query DevTools
- **Standard patterns**: Industry-standard hooks

### For Users

- **Faster UI**: Optimistic updates
- **Offline support**: Cached data
- **Background sync**: Always fresh data
- **Better errors**: Automatic retries

## Files to Migrate

Priority order:

### High Priority (Active Use)
1. `src/apps/colorwork-designer/ColorworkDesignerApp.tsx`
2. `src/apps/knitting-designer/KnittingDesignerApp.tsx`
3. `src/apps/songs/SongTabsAppModern.tsx`
4. `src/hooks/useLibraryQuery.ts`

### Medium Priority
5. `src/apps/recipes/RecipesApp.tsx`
6. `src/apps/colorwork-designer/PanelShapeCreator.tsx`
7. `src/components/Layout.tsx`

### Low Priority (Testing/Docs)
8. Test files
9. Documentation files

## Troubleshooting

### "Drive adapter not initialized yet"

Make sure component is wrapped in `DriveProvider`:

```tsx
<DriveProvider clientId={GOOGLE_CLIENT_ID}>
  <YourComponent />
</DriveProvider>
```

### "useDriveAuth must be used within DriveAuthProvider"

Wrap component in the compatibility provider:

```tsx
import { DriveAuthProvider } from './context/DriveAuthContext.new';

<DriveAuthProvider>
  <YourComponent />
</DriveAuthProvider>
```

### Authentication not working

Check that:
1. `VITE_GOOGLE_CLIENT_ID` is set in `.env`
2. `VITE_GOOGLE_API_KEY` is set in `.env`
3. Google API scripts are loaded (check console)

### "gapi is not defined"

Add script tags to `index.html`:

```html
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://accounts.google.com/gsi/client"></script>
```

## Next Steps

1. ✅ **Integration Complete** - App.tsx updated
2. ⏳ **Migrate DriveAuthContext** - Replace old implementation
3. ⏳ **Migrate useLibraryQuery** - Use new hooks
4. ⏳ **Update components** - One by one
5. ⏳ **Test thoroughly** - All functionality works
6. ⏳ **Delete old code** - Remove `src/services/drive/`

## API Reference

See [README.md](./README.md) for full API documentation.

## Questions?

The new adapter is simpler and more powerful. If you have questions:

1. Check [README.md](./README.md) for examples
2. Check [COMPARISON.md](./COMPARISON.md) for before/after
3. Look at test files for usage patterns
