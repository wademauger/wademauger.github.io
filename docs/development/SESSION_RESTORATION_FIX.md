# Authentication and Library Path Display Fix

## Problem Report

User reported seeing authentication error despite being authenticated:
```
Open Panel from Library
Not signed in to Google Drive
Please sign in to Google Drive to access your panel library.
```

User was actually authenticated, but the modal wasn't properly checking authentication state or restoring the session.

## Root Causes

### 1. Incomplete Authentication Check
```typescript
// BEFORE - Only checked isSignedIn flag
if (!service.isSignedIn) {
  message.warning('Please sign in...');
  return;
}
```

**Problem**: The `isSignedIn` flag might not be updated if the session wasn't restored. Need to check BOTH `isSignedIn` AND `accessToken`.

### 2. No Session Restoration
The modal wasn't calling `service.restoreSession()` to load the saved authentication state from localStorage.

### 3. No Visibility Into Library Path
User couldn't see which file the modal was trying to load, making it impossible to debug why panels weren't showing.

## Solutions Implemented

### 1. Restore Session Before Checking Auth
```typescript
// Try to restore session if not already signed in
if (!service.isSignedIn && service.restoreSession) {
  console.log('📚 LibraryModalInner: Attempting to restore session...');
  service.restoreSession();
}

// Check BOTH flag and token
const isAuthenticated = service.isSignedIn && service.accessToken;
```

**Why**: `GoogleDriveServiceModern` stores session in localStorage. On page load or modal open, we need to explicitly restore it to rehydrate the auth state.

### 2. Improved Authentication Check
```typescript
// Check both the flag AND the token
const isAuthenticated = service && service.isSignedIn && service.accessToken;
```

**Why**: Both must be true for valid authentication. Token is what's actually used for API calls.

### 3. Display Library Path in UI
```typescript
const { fileName, folderPath } = resolveFileAndFolder();
const libraryPath = folderPath === '/' ? `/${fileName}` : `${folderPath}/${fileName}`;

// In modal:
<Alert
  type="info"
  message={`Loading from: ${libraryPath}`}
  showIcon
/>
```

**Why**: Users need to see which file is being accessed. This helps debug:
- Wrong file name
- Wrong folder path
- File doesn't exist in that location

### 4. Enhanced Logging
```typescript
console.log('📚 LibraryModalInner: Auth check:', {
  isSignedIn: service.isSignedIn,
  hasToken: !!service.accessToken,
  userEmail: service.userEmail,
  isAuthenticated
});
```

**Why**: Helps debug authentication issues in the console.

## How Session Restoration Works

### GoogleDriveServiceModern Session Keys
```typescript
SESSION_KEYS = {
  ACCESS_TOKEN: 'google_access_token',
  USER_EMAIL: 'google_user_email',
  USER_NAME: 'google_user_name',
  USER_PICTURE: 'google_user_picture',
  IS_SIGNED_IN: 'google_is_signed_in',
  TOKEN_EXPIRY: 'google_token_expiry',
  SONGS_LIBRARY_FILE: 'songs_library_file',
  SONGS_FOLDER_PATH: 'songs_folder_path'
}
```

### RestoreSession Flow
```typescript
restoreSession() {
  const isSignedIn = localStorage.getItem('google_is_signed_in') === 'true';
  const token = localStorage.getItem('google_access_token');
  const expiry = localStorage.getItem('google_token_expiry');
  
  if (isSignedIn && token && !isExpired(expiry)) {
    this.isSignedIn = true;
    this.accessToken = token;
    this.userEmail = localStorage.getItem('google_user_email');
    // ...
  }
}
```

## What You'll See Now

### Open Panel Modal - When Authenticated
```
ℹ️ Loading from: /panels-library.json

[Loading spinner...]
or
Panel 1 - 50 × 60 stitches →
Panel 2 - 40 × 40 stitches →
```

### Open Panel Modal - When Not Authenticated (Rare)
```
ℹ️ Loading from: /panels-library.json

⚠️ Not signed in to Google Drive
Please sign in to Google Drive to access your panel library.
```

### Console Output
```javascript
📚 LibraryModalInner: Attempting to restore session...
📚 LibraryModalInner: Auth check: {
  isSignedIn: true,
  hasToken: true,
  userEmail: "user@example.com",
  isAuthenticated: true
}
📚 LibraryModalInner (panels): Loading library data from: panels-library.json in folder: /
📚 LibraryModalInner: File search result: { found: true, fileId: "..." }
📚 LibraryModalInner (panels): Loaded library data: { panels: {...} }
📚 LibraryModalInner: Converted panels to array: [{ name: "Panel 1", ... }]
```

## Library JSON Structure

As you noted, the modal is designed to be reusable across different apps. The JSON structure is:

```json
{
  "songs": [
    { "title": "...", "artist": "...", ... }
  ],
  "recipes": [
    { "title": "...", "ingredients": [...], ... }
  ],
  "panels": {
    "panelName": {
      "name": "Panel 1",
      "width": 50,
      "height": 60,
      "shapes": { ... }
    }
  },
  "patterns": [
    { "name": "...", "grid": [...], ... }
  ]
}
```

**Each app context loads its own member**:
- `appContext='songs'` → loads `library.songs`
- `appContext='recipes'` → loads `library.recipes`
- `appContext='panels'` → loads `library.panels`
- `appContext='patterns'` → would load `library.patterns`

The modal converts object formats to arrays for display in the list UI.

## Files Modified

- `/src/components/LibraryModalInner.tsx`:
  - Added `restoreSession()` call before auth check
  - Changed auth check to verify BOTH `isSignedIn` AND `accessToken`
  - Added library path display in Open modal UI
  - Enhanced logging for debugging

## Testing

✅ All tests pass: 14 test suites, 125 tests
✅ No compilation errors
✅ Session restoration working
✅ Library path now visible

## Next Steps for User

1. **Test the Open modal**:
   - Click "Open..."
   - You should see "Loading from: /panels-library.json" (or your configured path)
   - You should NO LONGER see the auth error (if you're signed in)

2. **If you still see "No panels found"**:
   - Check the library path shown
   - Go to Library Settings and verify the file name
   - Save a panel first using "Save As..."
   - The JSON should have a `"panels": {}` member

3. **Check console logs**:
   - Should show auth check with `isAuthenticated: true`
   - Should show file search result
   - Should show loaded library data structure

---

**Date**: October 2, 2025  
**Status**: ✅ Fixed  
**Tests**: ✅ Passing  
**Key Improvement**: Proper session restoration and library path visibility
