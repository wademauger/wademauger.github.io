import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import GoogleDriveServiceModern from '../../songs/services/GoogleDriveServiceModern';
import { setAuth, clearAuth } from '@/store/authSlice';

type DriveAuthContextValue = {
  isSignedIn: boolean;
  userInfo: { userName: string | null; userEmail: string | null; userPicture: string | null } | null;
  handleTokenResponse: (tokenResponse: any) => Promise<void>;
  signOut: () => void;
  GoogleDriveServiceModern: any;
} | null;

const DriveAuthContext = createContext<DriveAuthContextValue>(null);

export const DriveAuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(!!GoogleDriveServiceModern.isSignedIn);
  const [userInfo, setUserInfo] = useState<{ userName: string | null; userEmail: string | null; userPicture: string | null } | null>({ userName: GoogleDriveServiceModern.userName, userEmail: GoogleDriveServiceModern.userEmail, userPicture: GoogleDriveServiceModern.userPicture });

  // Handler that the Google sign-in button will call with the token response
  // The GoogleDriveServiceModern exposes `handleOAuthToken` for @react-oauth/google responses
  const handleTokenResponse = useCallback(async (tokenResponse: any) => {
    console.log('DriveAuthProvider: handleTokenResponse called with:', tokenResponse);
    try {
      if (typeof GoogleDriveServiceModern.handleOAuthToken === 'function') {
        console.log('DriveAuthProvider: Calling GoogleDriveServiceModern.handleOAuthToken');
        await GoogleDriveServiceModern.handleOAuthToken(tokenResponse);
      } else if (typeof (GoogleDriveServiceModern as any).handleTokenResponse === 'function') {
        // Backwards compatibility if a different method name exists
        console.log('DriveAuthProvider: Using legacy handleTokenResponse method');
        await (GoogleDriveServiceModern as any).handleTokenResponse(tokenResponse);
      } else {
        console.warn('DriveAuthProvider: no token handler found on GoogleDriveServiceModern');
      }
      console.log('DriveAuthProvider: Service sign-in successful, updating state');
      setIsSignedIn(!!GoogleDriveServiceModern.isSignedIn);
      const ui = { userName: GoogleDriveServiceModern.userName, userEmail: GoogleDriveServiceModern.userEmail, userPicture: GoogleDriveServiceModern.userPicture };
      setUserInfo(ui);
      console.log('DriveAuthProvider: Updated local state - signed in:', !!GoogleDriveServiceModern.isSignedIn, 'userInfo:', ui);

      // Dispatch Redux action for global state synchronization
      try { 
        dispatch(setAuth({ isSignedIn: !!GoogleDriveServiceModern.isSignedIn, userInfo: ui })); 
        console.log('DriveAuthProvider: Dispatched setAuth to Redux');
      } catch (e) {
        console.warn('DriveAuthProvider: failed to dispatch setAuth', e);
      }

      // Notify other parts of the app that auth changed so UI can react immediately
      try {
        if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('drive:auth-changed', { detail: { isSignedIn: !!GoogleDriveServiceModern.isSignedIn, userInfo: ui } }));
          console.log('DriveAuthProvider: Dispatched drive:auth-changed event');
        }
      } catch (e: unknown) {
        // non-fatal
        console.warn('DriveAuthProvider: failed to dispatch drive:auth-changed', e);
      }
    } catch (err: unknown) {
      console.error('DriveAuthProvider: token handling failed', err);
      throw err;
    }
  }, [dispatch]);

  const signOut = useCallback(() => {
    console.log('DriveAuthProvider: signOut called');
    try {
      // Call service signOut first to ensure proper cleanup
      if (GoogleDriveServiceModern.signOut) {
        console.log('DriveAuthProvider: Calling GoogleDriveServiceModern.signOut');
        GoogleDriveServiceModern.signOut();
      }
    } catch (e: unknown) {
      console.warn('DriveAuthProvider: service signOut failed', e);
    }
    
    // Update local state to match service state
    console.log('DriveAuthProvider: Updating local state to signed out');
    setIsSignedIn(false);
    setUserInfo(null);
    
    // Dispatch Redux action
    try { 
      dispatch(clearAuth()); 
      console.log('DriveAuthProvider: Dispatched clearAuth to Redux');
    } catch (e) {
      console.warn('DriveAuthProvider: failed to dispatch clearAuth', e);
    }
    
    // Notify other parts of the app
    try {
      if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('drive:auth-changed', { detail: { isSignedIn: false, userInfo: null } }));
        console.log('DriveAuthProvider: Dispatched drive:auth-changed event for signOut');
      }
    } catch (e: unknown) {
      console.warn('DriveAuthProvider: failed to dispatch drive:auth-changed on signOut', e);
    }
  }, [dispatch]);

  // Keep state in sync if the service mutates outside React (best-effort)
  useEffect(() => {
    const interval = setInterval(() => {
      const signed = !!GoogleDriveServiceModern.isSignedIn;
      const ui = { userName: GoogleDriveServiceModern.userName, userEmail: GoogleDriveServiceModern.userEmail, userPicture: GoogleDriveServiceModern.userPicture };
      
      // Check if state changed
      const stateChanged = signed !== isSignedIn || JSON.stringify(ui) !== JSON.stringify(userInfo);
      
      if (stateChanged) {
        setIsSignedIn(signed);
        setUserInfo(ui);
        
        // Sync to Redux when we detect external changes
        try { 
          if (signed) {
            dispatch(setAuth({ isSignedIn: signed, userInfo: ui })); 
          } else {
            dispatch(clearAuth());
          }
        } catch (e) {
          console.warn('DriveAuthProvider: failed to sync auth state to Redux', e);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSignedIn, userInfo, dispatch]);

  // Ensure the Drive service knows the configured client ID so it can lazily
  // initialize GAPI/GIS when required. This does not auto-initialize the
  // services (which require network access), it only provides the client ID.
  // Use a runtime-safe lookup to avoid referencing `import.meta` directly which
  // can throw in some test/SSR environments.
  useEffect(() => {
    try {
      let cid: string | undefined;
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('return (typeof import !== "undefined" && import.meta && import.meta.env) ? import.meta.env.VITE_GOOGLE_CLIENT_ID : undefined');
        cid = fn();
      } catch {
        // Fallback to test shim or process.env
        // @ts-ignore
        cid = (globalThis && (globalThis.__IMPORT_META_ENV__ || {}).VITE_GOOGLE_CLIENT_ID) || (process && process.env && process.env.VITE_GOOGLE_CLIENT_ID);
      }

      if (cid && cid !== 'development-fallback') {
        GoogleDriveServiceModern.CLIENT_ID = cid;
      }
    } catch {
      // ignore in non-browser/test environments
    }
  }, []);

  // Attempt a background initialization of Google APIs so gapi.client is ready
  // by the time the user tries to save. This is non-blocking and any errors
  // are swallowed to avoid breaking SSR or test environments.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      let cid: string | undefined;
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('return (typeof import !== "undefined" && import.meta && import.meta.env) ? import.meta.env.VITE_GOOGLE_CLIENT_ID : undefined');
        cid = fn();
      } catch {
        // @ts-ignore
        cid = (globalThis && (globalThis.__IMPORT_META_ENV__ || {}).VITE_GOOGLE_CLIENT_ID) || (process && process.env && process.env.VITE_GOOGLE_CLIENT_ID);
      }

      if (cid && cid !== 'development-fallback') {
        // Ensure CLIENT_ID is set
        GoogleDriveServiceModern.CLIENT_ID = cid;
        // Initialize in background; don't await and swallow errors
        GoogleDriveServiceModern.initialize(cid).then(() => {
          console.log('GoogleDriveServiceModern initialized in background');
        }).catch((err) => {
          console.warn('Background Google Drive init failed (non-fatal):', err && err.message ? err.message : err);
        });
      }
    } catch {
      // non-fatal
    }
  }, []);

  // On mount, try to restore a saved session so UI can display user info
  // immediately without waiting for a fresh sign-in.
  useEffect(() => {
    // If a session is stored, attempt to initialize Google services and
    // validate the token so the UI has a usable, validated session. This
    // prevents subsequent calls (e.g. folder/file listing) from triggering
    // automatic re-auth that fails because GIS/GAPI weren't initialized.
    (async () => {
      try {
        // Ensure CLIENT_ID is available for initialization (runtime-safe lookup)
        let cid: string | undefined;
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('return (typeof import !== "undefined" && import.meta && import.meta.env) ? import.meta.env.VITE_GOOGLE_CLIENT_ID : undefined');
          cid = fn();
        } catch {
          // @ts-ignore
          cid = (globalThis && (globalThis.__IMPORT_META_ENV__ || {}).VITE_GOOGLE_CLIENT_ID) || (process && process.env && process.env.VITE_GOOGLE_CLIENT_ID);
        }

        if (cid && cid !== 'development-fallback') {
          GoogleDriveServiceModern.CLIENT_ID = cid;
        }

        // Try to restore session from localStorage
        const restored = GoogleDriveServiceModern.restoreSession && GoogleDriveServiceModern.restoreSession();
        if (!restored) return;

        // If we restored a session, ensure services are initialized before
        // validating the token. initialize() is safe to call multiple times.
        try {
          if (cid && cid !== 'development-fallback') {
            await GoogleDriveServiceModern.initialize(cid);
          } else {
            // Attempt a background initialize if no CLIENT_ID; this may noop
            // in test/non-browser environments.
            if (typeof GoogleDriveServiceModern.initialize === 'function') {
              await GoogleDriveServiceModern.initialize(GoogleDriveServiceModern.CLIENT_ID || undefined);
            }
          }
        } catch (initErr) {
          console.warn('DriveAuthProvider: Google service initialization failed (non-fatal):', initErr);
        }

        // Validate token (this will also call loadUserProfile on success)
        try {
          const valid = await GoogleDriveServiceModern.validateToken();
          const ui = { userName: GoogleDriveServiceModern.userName, userEmail: GoogleDriveServiceModern.userEmail, userPicture: GoogleDriveServiceModern.userPicture };
          setIsSignedIn(!!GoogleDriveServiceModern.isSignedIn && !!valid);
          setUserInfo(ui);
          try {
            if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
              window.dispatchEvent(new CustomEvent('drive:auth-changed', { detail: { isSignedIn: !!GoogleDriveServiceModern.isSignedIn, userInfo: ui } }));
            }
          } catch (e: unknown) {
            console.warn('DriveAuthProvider: failed to dispatch drive:auth-changed on restore', e);
          }

          // Propagate to Redux global auth state
          try {
            dispatch(setAuth({ isSignedIn: !!GoogleDriveServiceModern.isSignedIn && !!valid, userInfo: ui }));
          } catch (e) {
            // non-fatal
          }
        } catch (valErr) {
          console.warn('DriveAuthProvider: token validation failed (will clear session):', valErr);
          // Ensure inconsistent or expired sessions don't linger
          try { GoogleDriveServiceModern.clearSession && GoogleDriveServiceModern.clearSession(); } catch {}
          setIsSignedIn(false);
          setUserInfo({ userName: null, userEmail: null, userPicture: null });
          try { dispatch(clearAuth()); } catch {}
        }
      } catch (e) {
        // Non-fatal; don't block app render
        console.warn('DriveAuthProvider: unexpected error during restore/init:', e);
      }
    })();
  }, []);

  const value: DriveAuthContextValue = {
    isSignedIn,
    userInfo,
    handleTokenResponse,
    signOut,
    GoogleDriveServiceModern
  };

  return (
    <DriveAuthContext.Provider value={value}>
      {children}
    </DriveAuthContext.Provider>
  );
};

export const useDriveAuth = () => {
  const ctx = useContext(DriveAuthContext);
  if (!ctx) {
    // Provide safe defaults to avoid runtime errors if used outside provider
    return { isSignedIn: false, userInfo: null, handleTokenResponse: async () => {}, signOut: () => {}, GoogleDriveServiceModern };
  }
  return ctx;
};

export default DriveAuthContext;
