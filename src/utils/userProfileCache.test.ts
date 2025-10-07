/**
 * Tests for UserProfileCache
 */

import UserProfileCache, { userProfileCache } from './userProfileCache';

// Mock sessionStorage and localStorage
const createStorageMock = () => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
};

describe('UserProfileCache', () => {
  let cache: UserProfileCache;
  
  beforeEach(() => {
    // Setup mocks
    global.sessionStorage = createStorageMock() as any;
    global.localStorage = createStorageMock() as any;
    
    // Create fresh instance
    cache = new UserProfileCache();
  });
  
  afterEach(() => {
    cache.clearAll();
  });
  
  describe('storeProfile', () => {
    it('should store profile in both sessionStorage and localStorage', () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const picture = 'https://example.com/pic.jpg';
      
      cache.storeProfile(email, name, picture);
      
      const retrieved = cache.getProfile(email);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.email).toBe(email);
      expect(retrieved?.name).toBe(name);
      expect(retrieved?.picture).toBe(picture);
    });
    
    it('should handle missing optional fields', () => {
      const email = 'test@example.com';
      
      cache.storeProfile(email);
      
      const retrieved = cache.getProfile(email);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.email).toBe(email);
      expect(retrieved?.name).toBeUndefined();
      expect(retrieved?.picture).toBeUndefined();
    });
    
    it('should not store if email is missing', () => {
      cache.storeProfile('', 'Name', 'Picture');
      
      const retrieved = cache.getProfile('');
      expect(retrieved).toBeNull();
    });
  });
  
  describe('getProfile', () => {
    it('should return null for non-existent profile', () => {
      const retrieved = cache.getProfile('nonexistent@example.com');
      expect(retrieved).toBeNull();
    });
    
    it('should return cached profile from sessionStorage first', () => {
      const email = 'test@example.com';
      cache.storeProfile(email, 'Session Name', 'session-pic');
      
      // Manually set different value in localStorage
      localStorage.setItem('google_user_profiles_local', JSON.stringify({
        [email]: {
          email,
          name: 'Local Name',
          picture: 'local-pic',
          cachedAt: Date.now()
        }
      }));
      
      const retrieved = cache.getProfile(email);
      expect(retrieved?.name).toBe('Session Name');
    });
    
    it('should fall back to localStorage if not in sessionStorage', () => {
      const email = 'test@example.com';
      
      // Set only in localStorage
      localStorage.setItem('google_user_profiles_local', JSON.stringify({
        [email]: {
          email,
          name: 'Local Name',
          picture: 'local-pic',
          cachedAt: Date.now()
        }
      }));
      
      const retrieved = cache.getProfile(email);
      expect(retrieved?.name).toBe('Local Name');
    });
    
    it('should reject expired profiles', () => {
      const email = 'test@example.com';
      const expiredTime = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
      
      localStorage.setItem('google_user_profiles_local', JSON.stringify({
        [email]: {
          email,
          name: 'Expired Name',
          picture: 'expired-pic',
          cachedAt: expiredTime
        }
      }));
      
      const retrieved = cache.getProfile(email);
      expect(retrieved).toBeNull();
    });
  });
  
  describe('removeProfile', () => {
    it('should remove profile from both storage', () => {
      const email = 'test@example.com';
      cache.storeProfile(email, 'Test', 'pic');
      
      cache.removeProfile(email);
      
      const retrieved = cache.getProfile(email);
      expect(retrieved).toBeNull();
    });
  });
  
  describe('clearAll', () => {
    it('should clear all cached profiles', () => {
      cache.storeProfile('test1@example.com', 'User 1', 'pic1');
      cache.storeProfile('test2@example.com', 'User 2', 'pic2');
      
      cache.clearAll();
      
      expect(cache.getProfile('test1@example.com')).toBeNull();
      expect(cache.getProfile('test2@example.com')).toBeNull();
    });
  });
  
  describe('getAllProfiles', () => {
    it('should return all non-expired profiles', () => {
      cache.storeProfile('test1@example.com', 'User 1', 'pic1');
      cache.storeProfile('test2@example.com', 'User 2', 'pic2');
      
      const profiles = cache.getAllProfiles();
      expect(profiles.length).toBe(2);
      expect(profiles.some(p => p.email === 'test1@example.com')).toBe(true);
      expect(profiles.some(p => p.email === 'test2@example.com')).toBe(true);
    });
    
    it('should filter out expired profiles', () => {
      const email = 'expired@example.com';
      const expiredTime = Date.now() - (8 * 24 * 60 * 60 * 1000);
      
      localStorage.setItem('google_user_profiles_local', JSON.stringify({
        [email]: {
          email,
          name: 'Expired',
          cachedAt: expiredTime
        },
        'valid@example.com': {
          email: 'valid@example.com',
          name: 'Valid',
          cachedAt: Date.now()
        }
      }));
      
      const profiles = cache.getAllProfiles();
      expect(profiles.length).toBe(1);
      expect(profiles[0].email).toBe('valid@example.com');
    });
  });
  
  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(userProfileCache).toBeInstanceOf(UserProfileCache);
    });
  });
});
