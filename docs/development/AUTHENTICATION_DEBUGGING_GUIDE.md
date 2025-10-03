# Authentication Debugging Guide

## Problem: "Not signed in to Google Drive" Despite Being Authenticated

This guide helps debug authentication issues when the modal shows "Not signed in" even though you ARE signed in.

## What We Added

### Enhanced Console Logging

The `LibraryModalInner` component now logs comprehensive authentication state:

```javascript
📚 LibraryModalInner: Initial auth state: {
  isSignedIn: false,
  hasToken: false,
  userEmail: null,
  hasRestoreSession: true
}

📚 LibraryModalInner: localStorage session data: {
  hasAccessToken: true,
  isSignedIn: "true",
  userEmail: "your@email.com",
  tokenExpiry: "1727900000000",
  expiresIn: "45 minutes"
}

📚 LibraryModalInner: Attempting to restore session...
📚 LibraryModalInner: Session restore result: true

📚 LibraryModalInner: Auth state after restore: {
  isSignedIn: true,
  hasToken: true,
  userEmail: "your@email.com"
}

📚 LibraryModalInner: Final auth check: {
  isSignedIn: true,
  hasToken: true,
  userEmail: "your@email.com",
  isAuthenticated: true
}
```

## Diagnostic Steps

### Step 1: Open Browser Console
1. Press F12 or right-click → Inspect
2. Go to "Console" tab
3. Click "Open..." in the Panel Shape Creator dropdown

### Step 2: Check Initial Auth State

Look for: `📚 LibraryModalInner: Initial auth state:`

**If you see:**
```javascript
{
  isSignedIn: false,
  hasToken: false,
  userEmail: null,
  hasRestoreSession: true
}
```

This is NORMAL on first check. The service needs to restore from localStorage.

### Step 3: Check localStorage Data

Look for: `📚 LibraryModalInner: localStorage session data:`

#### Scenario A: Data EXISTS in localStorage
```javascript
{
  hasAccessToken: true,
  isSignedIn: "true",
  userEmail: "your@email.com",
  tokenExpiry: "1727900000000",
  expiresIn: "45 minutes"
}
```

**✅ This is GOOD** - Session data is saved, just needs to be restored into the service.

#### Scenario B: Data MISSING from localStorage
```javascript
{
  hasAccessToken: false,
  isSignedIn: null,
  userEmail: null,
  tokenExpiry: null,
  expiresIn: "N/A"
}
```

**❌ This is the PROBLEM** - You're not actually signed in or the session wasn't saved.

**Fix**: Sign out and sign back in using the "Sign out" button in the dropdown.

#### Scenario C: Token EXPIRED
```javascript
{
  hasAccessToken: true,
  isSignedIn: "true",
  userEmail: "your@email.com",
  tokenExpiry: "1727800000000",
  expiresIn: "-120 minutes"  // NEGATIVE = expired!
}
```

**❌ Token expired** - The session data exists but the token is no longer valid.

**Fix**: Sign out and sign back in.

### Step 4: Check Session Restore

Look for: `📚 LibraryModalInner: Session restore result:`

**Should see:**
```javascript
📚 LibraryModalInner: Session restore result: true
```

**If you see:**
```javascript
📚 LibraryModalInner: Session restore result: false
```

The restore failed. Check:
- Is the token expired? (see Step 3C)
- Was the session cleared? (see Step 3B)

### Step 5: Check Final Auth State

Look for: `📚 LibraryModalInner: Final auth check:`

**SUCCESS:**
```javascript
{
  isSignedIn: true,
  hasToken: true,
  userEmail: "your@email.com",
  isAuthenticated: true
}
```

**FAILURE:**
```javascript
{
  isSignedIn: false,
  hasToken: false,
  userEmail: null,
  isAuthenticated: false
}
```

## Common Issues & Solutions

### Issue 1: Not Actually Signed In

**Symptoms:**
- localStorage shows `isSignedIn: null` or `hasAccessToken: false`
- No user info in the top right corner of the page
- "Sign in" option appears in dropdown menu

**Solution:**
1. Click "Sign in" in the dropdown OR click the sign-in button in the header
2. Complete Google OAuth flow
3. Try "Open..." again

### Issue 2: Token Expired

**Symptoms:**
- localStorage shows negative `expiresIn` value
- Session restore returns `false`
- Console shows "Stored session has expired, clearing..."

**Solution:**
1. Click "Sign out" in dropdown
2. Sign back in
3. Tokens typically last 1 hour

### Issue 3: Session Not Persisted

**Symptoms:**
- You sign in successfully
- Page refresh loses authentication
- localStorage is empty on page load

**Possible Causes:**
- Browser privacy mode (Incognito/Private)
- Browser blocking cookies/localStorage
- Session not being saved after sign-in

**Solution:**
1. Check if you're in private/incognito mode
2. Check browser settings allow localStorage
3. Sign in again and verify localStorage gets populated

### Issue 4: Wrong Session Keys

**Symptoms:**
- Session restore always returns false
- localStorage has data but with different key names

**Check:**
The keys should be:
- `googleDrive_accessToken`
- `googleDrive_isSignedIn`
- `googleDrive_userEmail`
- `googleDrive_tokenExpiry`

NOT:
- `google_access_token` (different prefix)
- `songs_access_token` (old format)

**Solution:**
If keys are wrong, there might be multiple authentication systems. Sign out completely and sign back in.

## How Session Persistence Works

### 1. Sign In Flow
```javascript
// User clicks "Sign in with Google"
→ OAuth flow completes
→ GoogleDriveServiceModern receives token
→ Service saves to localStorage:
  - googleDrive_accessToken
  - googleDrive_isSignedIn = "true"
  - googleDrive_userEmail
  - googleDrive_tokenExpiry (timestamp)
```

### 2. Page Refresh / Modal Open
```javascript
// Service initialized (constructor)
→ this.restoreSession() called automatically
→ Checks localStorage for session data
→ If valid and not expired:
    this.isSignedIn = true
    this.accessToken = token
    this.userEmail = email
```

### 3. Modal Opens
```javascript
// loadLibraryDataForFile() called
→ Get service instance (singleton)
→ Check if isSignedIn is false
→ If false, call restoreSession() again (safety check)
→ Verify BOTH isSignedIn AND accessToken
→ If both true, proceed to load library
```

## Manual Testing Commands

You can check authentication state manually in the browser console:

### Check if Service Exists
```javascript
window.GoogleDriveServiceModern
```

Should return the service instance.

### Check Current Auth State
```javascript
window.debugGoogleDrive()
```

Should show:
```javascript
{
  isSignedIn: true,
  userEmail: "your@email.com",
  accessToken: "ya29.a0...",
  gapiInited: true,
  gisInited: true
}
```

### Check localStorage Manually
```javascript
Object.keys(localStorage)
  .filter(key => key.includes('googleDrive'))
  .map(key => ({
    key,
    value: localStorage.getItem(key)
  }))
```

### Force Session Restore
```javascript
window.GoogleDriveServiceModern.restoreSession()
```

Should return `true` if successful, `false` if failed.

### Check Token Expiry
```javascript
const expiry = parseInt(localStorage.getItem('googleDrive_tokenExpiry'));
const now = Date.now();
const minutesRemaining = Math.floor((expiry - now) / 60000);
console.log(`Token expires in ${minutesRemaining} minutes`);
```

## Next Steps Based on Console Output

### If You See "Session restore result: false"
→ Check localStorage (Step 3)
→ Token likely expired
→ Sign out and back in

### If You See "Session restore result: true" but "isAuthenticated: false"
→ This shouldn't happen (it's a bug)
→ Check that both `isSignedIn` and `accessToken` are truthy
→ May need to debug the service's restoreSession() method

### If localStorage is Empty
→ You're not signed in
→ Click "Sign in" in the dropdown or header
→ Complete OAuth flow
→ Check localStorage again

### If Everything Looks Good but Still Failing
→ Open an issue with the full console output
→ Include the localStorage session data (without the actual token)
→ Include the browser and OS info

---

**Last Updated**: October 2, 2025  
**File**: `/src/components/LibraryModalInner.tsx`  
**Lines**: ~183-230 (loadLibraryDataForFile function)
