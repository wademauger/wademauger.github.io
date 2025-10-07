/**
 * User Profile Cache Utility
 * 
 * Provides a persistent cache for user profile information (name, email, picture)
 * that survives session expiration and page refreshes. This ensures the UI can
 * always display user info even when the authentication token is temporarily invalid.
 * 
 * Uses sessionStorage for per-tab persistence (cleared when tab closes) and
 * localStorage as a fallback for cross-tab consistency.
 */

interface UserProfile {
  email: string;
  name?: string;
  picture?: string;
  cachedAt: number;
}

interface UserProfileMap {
  [email: string]: UserProfile;
}

const SESSION_STORAGE_KEY = 'google_user_profiles_session';
const LOCAL_STORAGE_KEY = 'google_user_profiles_local';
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

class UserProfileCache {
  /**
   * Store user profile information
   */
  storeProfile(email: string, name?: string, picture?: string): void {
    if (!email) return;

    const profile: UserProfile = {
      email,
      name,
      picture,
      cachedAt: Date.now()
    };

    // Store in both sessionStorage and localStorage
    this._updateStorage(SESSION_STORAGE_KEY, email, profile);
    this._updateStorage(LOCAL_STORAGE_KEY, email, profile);
  }

  /**
   * Retrieve user profile information by email
   */
  getProfile(email: string): UserProfile | null {
    if (!email) return null;

    // Try sessionStorage first (fastest, per-tab)
    let profile = this._getFromStorage(SESSION_STORAGE_KEY, email);
    
    // Fall back to localStorage if not in session
    if (!profile) {
      profile = this._getFromStorage(LOCAL_STORAGE_KEY, email);
      
      // If found in localStorage, copy to sessionStorage for faster access
      if (profile) {
        this._updateStorage(SESSION_STORAGE_KEY, email, profile);
      }
    }

    // Check if profile is too old
    if (profile && (Date.now() - profile.cachedAt) > MAX_CACHE_AGE_MS) {
      this.removeProfile(email);
      return null;
    }

    return profile;
  }

  /**
   * Remove a user profile from cache
   */
  removeProfile(email: string): void {
    if (!email) return;

    this._removeFromStorage(SESSION_STORAGE_KEY, email);
    this._removeFromStorage(LOCAL_STORAGE_KEY, email);
  }

  /**
   * Clear all cached profiles
   */
  clearAll(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear user profile cache:', error);
    }
  }

  /**
   * Get all cached profiles
   */
  getAllProfiles(): UserProfile[] {
    const profiles: UserProfile[] = [];
    
    // Get from sessionStorage first
    const sessionMap = this._getStorageMap(SESSION_STORAGE_KEY);
    const localMap = this._getStorageMap(LOCAL_STORAGE_KEY);
    
    // Merge both maps (sessionStorage takes precedence)
    const mergedMap = { ...localMap, ...sessionMap };
    
    // Filter out expired profiles
    const now = Date.now();
    for (const email in mergedMap) {
      const profile = mergedMap[email];
      if (profile && (now - profile.cachedAt) <= MAX_CACHE_AGE_MS) {
        profiles.push(profile);
      }
    }

    return profiles;
  }

  // Private helper methods

  private _getStorageMap(storageKey: string): UserProfileMap {
    try {
      const storage = storageKey === SESSION_STORAGE_KEY ? sessionStorage : localStorage;
      const data = storage.getItem(storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn(`Failed to read from storage (${storageKey}):`, error);
      return {};
    }
  }

  private _updateStorage(storageKey: string, email: string, profile: UserProfile): void {
    try {
      const storage = storageKey === SESSION_STORAGE_KEY ? sessionStorage : localStorage;
      const map = this._getStorageMap(storageKey);
      map[email] = profile;
      storage.setItem(storageKey, JSON.stringify(map));
    } catch (error) {
      console.warn(`Failed to update storage (${storageKey}):`, error);
    }
  }

  private _getFromStorage(storageKey: string, email: string): UserProfile | null {
    const map = this._getStorageMap(storageKey);
    return map[email] || null;
  }

  private _removeFromStorage(storageKey: string, email: string): void {
    try {
      const storage = storageKey === SESSION_STORAGE_KEY ? sessionStorage : localStorage;
      const map = this._getStorageMap(storageKey);
      delete map[email];
      storage.setItem(storageKey, JSON.stringify(map));
    } catch (error) {
      console.warn(`Failed to remove from storage (${storageKey}):`, error);
    }
  }
}

// Export singleton instance
export const userProfileCache = new UserProfileCache();

// Export class for testing
export default UserProfileCache;
