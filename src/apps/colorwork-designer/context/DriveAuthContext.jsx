import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import GoogleDriveServiceModern from '../../songs/services/GoogleDriveServiceModern';

const DriveAuthContext = createContext(null);

export const DriveAuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(!!GoogleDriveServiceModern.isSignedIn);
  const [userInfo, setUserInfo] = useState({ userName: GoogleDriveServiceModern.userName, userEmail: GoogleDriveServiceModern.userEmail, userPicture: GoogleDriveServiceModern.userPicture });

  // Handler that the Google sign-in button will call with the token response
  // The GoogleDriveServiceModern exposes `handleOAuthToken` for @react-oauth/google responses
  const handleTokenResponse = useCallback(async (tokenResponse) => {
    try {
      if (typeof GoogleDriveServiceModern.handleOAuthToken === 'function') {
        await GoogleDriveServiceModern.handleOAuthToken(tokenResponse);
      } else if (typeof GoogleDriveServiceModern.handleTokenResponse === 'function') {
        // Backwards compatibility if a different method name exists
        await GoogleDriveServiceModern.handleTokenResponse(tokenResponse);
      } else {
        console.warn('DriveAuthProvider: no token handler found on GoogleDriveServiceModern');
      }
      setIsSignedIn(!!GoogleDriveServiceModern.isSignedIn);
      const ui = { userName: GoogleDriveServiceModern.userName, userEmail: GoogleDriveServiceModern.userEmail, userPicture: GoogleDriveServiceModern.userPicture };
      setUserInfo(ui);

      // Notify other parts of the app that auth changed so UI can react immediately
      try {
        if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('drive:auth-changed', { detail: { isSignedIn: !!GoogleDriveServiceModern.isSignedIn, userInfo: ui } }));
        }
      } catch (e) {
        // non-fatal
        console.warn('DriveAuthProvider: failed to dispatch drive:auth-changed', e);
      }
    } catch (err) {
      console.error('DriveAuthProvider: token handling failed', err);
      throw err;
    }
  }, []);

  const signOut = useCallback(() => {
    try {
      GoogleDriveServiceModern.signOut?.();
    } finally {
      setIsSignedIn(false);
      setUserInfo(null);
      try {
        if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('drive:auth-changed', { detail: { isSignedIn: false, userInfo: null } }));
        }
      } catch (e) {
        console.warn('DriveAuthProvider: failed to dispatch drive:auth-changed on signOut', e);
      }
    }
  }, []);

  // Keep state in sync if the service mutates outside React (best-effort)
  useEffect(() => {
    const interval = setInterval(() => {
      const signed = !!GoogleDriveServiceModern.isSignedIn;
      if (signed !== isSignedIn) setIsSignedIn(signed);
      const ui = { userName: GoogleDriveServiceModern.userName, userEmail: GoogleDriveServiceModern.userEmail, userPicture: GoogleDriveServiceModern.userPicture };
      if (JSON.stringify(ui) !== JSON.stringify(userInfo)) setUserInfo(ui);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSignedIn, userInfo]);

  // Ensure the Drive service knows the configured client ID so it can lazily
  // initialize GAPI/GIS when required. This does not auto-initialize the
  // services (which require network access), it only provides the client ID.
  useEffect(() => {
    try {
      const cid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
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
      const cid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
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

  const value = {
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
