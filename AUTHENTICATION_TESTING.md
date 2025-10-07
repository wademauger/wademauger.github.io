# Authentication Improvements Testing Guide

This guide explains how to test the authentication improvements made to fix flaky authentication issues.

## Changes Made

### 1. User Profile Cache
- Created `userProfileCache` utility that stores user profiles in both sessionStorage and localStorage
- Profiles persist for 7 days and survive page refreshes
- Services now cache profiles on successful authentication
- Services fall back to cached profiles when API calls fail

### 2. Proactive Token Validation
- Added `isTokenExpired()` method to check if token is expired/expiring (within 2 minutes)
- Added `ensureValidToken()` method to validate token before API calls
- Enhanced `withAutoAuth()` wrapper to proactively check token expiry before operations

### 3. Enhanced Session Restoration
- `restoreSession()` now augments missing user info from cache
- User profile info (name, picture) now survives even when localStorage is incomplete

### 4. GoogleAuthButton Improvements
- Button now falls back to cached user info when services don't provide it
- User name and picture should always display when authenticated

## Testing Instructions

### Test 1: User Profile Persistence

1. Sign in to the app
2. Wait for profile info (name, picture) to load
3. Refresh the page
4. **Expected**: Profile info should display immediately on the login button

### Test 2: Token Expiry Detection

1. Open `test-session-expiry.html` in your browser
2. Click "Initialize Auth" then "Sign In"
3. Click "🕐 Expire Session Now" to manually expire the token
4. Click "📚 Load Library" to trigger an API call
5. **Expected**: System should detect expired token and attempt re-authentication

### Test 3: Proactive Token Renewal

1. Sign in to the app
2. Manually set token expiry to 1 minute from now:
   ```javascript
   localStorage.setItem('googleDrive_tokenExpiry', (Date.now() + 60000).toString())
   ```
3. Wait 1 minute
4. Try to save or load data
5. **Expected**: System should proactively detect expiring token and validate it before operation

### Test 4: Profile Fallback on API Failure

1. Sign in to the app
2. Note your profile name/picture displayed
3. Open browser DevTools console
4. Simulate API failure:
   ```javascript
   // Break the userinfo endpoint temporarily
   const originalFetch = window.fetch;
   window.fetch = (url, ...args) => {
     if (url.includes('userinfo')) {
       return Promise.reject(new Error('Simulated network error'));
     }
     return originalFetch(url, ...args);
   };
   ```
5. Refresh the page
6. **Expected**: Profile info should still display from cache

### Test 5: Session Expiry with ephemeral state

1. Open the Songs app and create a new song (don't save yet)
2. Manually expire the session:
   ```javascript
   localStorage.setItem('googleDrive_tokenExpiry', (Date.now() - 60000).toString())
   ```
3. Try to save the song
4. **Expected**: 
   - Re-authentication should trigger automatically
   - After re-auth, save should complete successfully
   - Ephemeral song data should NOT be lost

### Test 6: Cross-Tab Profile Consistency

1. Sign in to the app in one tab
2. Open the same app in a new tab
3. **Expected**: User profile should be visible in both tabs (from localStorage cache)

## Automated Tests

Run the automated test suite:

```bash
npm test -- userProfileCache.test.ts
```

**Expected**: All 12 tests should pass with >89% code coverage

## Debug Tools

### Check Cached Profiles

In browser console:
```javascript
// View all cached profiles
const profiles = JSON.parse(sessionStorage.getItem('google_user_profiles_session') || '{}');
console.log('Session profiles:', profiles);

const localProfiles = JSON.parse(localStorage.getItem('google_user_profiles_local') || '{}');
console.log('Local profiles:', localProfiles);
```

### Check Token Expiry

```javascript
const expiry = localStorage.getItem('googleDrive_tokenExpiry');
if (expiry) {
  const expiryTime = new Date(parseInt(expiry));
  const now = new Date();
  console.log('Token expires:', expiryTime);
  console.log('Is expired:', now > expiryTime);
  console.log('Time until expiry:', expiryTime - now, 'ms');
}
```

### Monitor Auth State

Enable detailed logging in browser console:
```javascript
// The services already log extensively
// Filter console by:
// - "validateToken" - token validation attempts
// - "cache" - profile cache operations  
// - "Session" - session save/restore operations
// - "withAutoAuth" - automatic re-auth attempts
```

## Common Issues and Solutions

### Issue: "Account" shows instead of user name

**Cause**: Profile fetch failed and cache is empty

**Solution**: Check:
1. Network connectivity
2. Browser console for errors
3. Profile cache: `localStorage.getItem('google_user_profiles_local')`

### Issue: Re-authentication not triggering automatically

**Cause**: Token not actually expired or API call not using `withAutoAuth`

**Solution**: 
1. Verify token is expired with debug tools above
2. Check that API method uses `withAutoAuth` wrapper
3. Look for "🔐 Authentication error detected" logs

### Issue: Profile picture not displaying

**Cause**: Cache may only have email, not picture URL

**Solution**: 
1. Sign out and sign in again to refresh full profile
2. Check cache has `picture` field: 
   ```javascript
   const cache = JSON.parse(localStorage.getItem('google_user_profiles_local') || '{}');
   console.log(cache);
   ```

## Files Modified

- `src/utils/userProfileCache.ts` - New profile cache utility
- `src/apps/songs/services/GoogleDriveServiceModern.ts` - Enhanced with cache and proactive validation
- `src/apps/recipes/services/GoogleDriveRecipeService.ts` - Enhanced with cache
- `src/apps/songs/services/GoogleDriveService.ts` - Enhanced with cache (legacy service)
- `src/components/GoogleAuthButton.tsx` - Added cache fallback
- `src/utils/userProfileCache.test.ts` - Test suite

## Success Criteria

✅ User profile (name, picture) persists across page refreshes
✅ Token expiry is detected proactively (2 min before expiry)  
✅ Automatic re-authentication triggers on expired tokens
✅ Profile info displays even when API calls fail (from cache)
✅ Ephemeral app state survives re-authentication
✅ All automated tests pass
