/**
 * Drive Auth Context - Compatibility Layer
 * 
 * Wraps the new React Query drive adapter with the old DriveAuthContext API
 * This allows gradual migration of components
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { setAuth, clearAuth } from '@/store/authSlice';
import { useDriveAdapter, useAuthState, useSignIn, useSignOut } from '@/services/drive-rq';

type DriveAuthContextValue = {
  isSignedIn: boolean;
  userInfo: { userName: string | null; userEmail: string | null; userPicture: string | null } | null;
  handleTokenResponse: (tokenResponse: any) => Promise<void>;
  signOut: () => void;
  // Legacy compatibility
  GoogleDriveServiceModern: any;
} | null;

const DriveAuthContext = createContext<DriveAuthContextValue>(null);

export const DriveAuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const adapter = useDriveAdapter();
  
  // Use React Query hooks for auth state
  const { data: authState } = useAuthState(adapter);
  const signInMutation = useSignIn(adapter);
  const signOutMutation = useSignOut(adapter);
  
  const [userInfo, setUserInfo] = useState<{ 
    userName: string | null; 
    userEmail: string | null; 
    userPicture: string | null 
  } | null>(null);
  
  // Sync auth state to local state and Redux
  useEffect(() => {
    if (authState) {
      const ui = {
        userName: authState.userName,
        userEmail: authState.userEmail,
        userPicture: null // Not available yet in new adapter
      };
      setUserInfo(ui);
      
      // Dispatch Redux action
      try {
        dispatch(setAuth({ 
          isSignedIn: authState.isSignedIn, 
          userInfo: ui 
        }));
        console.log('DriveAuthProvider: Updated Redux with auth state');
      } catch (e) {
        console.warn('DriveAuthProvider: failed to dispatch setAuth', e);
      }
      
      // Dispatch custom event
      try {
        if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('drive:auth-changed', { 
            detail: { isSignedIn: authState.isSignedIn, userInfo: ui } 
          }));
        }
      } catch (e) {
        console.warn('DriveAuthProvider: failed to dispatch event', e);
      }
    }
  }, [authState, dispatch]);
  
  // Handle token response from @react-oauth/google
  const handleTokenResponse = useCallback(async (tokenResponse: any) => {
    console.log('DriveAuthProvider: handleTokenResponse called with:', tokenResponse);
    try {
      // The new adapter handles OAuth through its own flow
      // For @react-oauth/google compatibility, we trigger sign in
      await signInMutation.mutateAsync();
      console.log('DriveAuthProvider: Sign in successful');
    } catch (err) {
      console.error('DriveAuthProvider: Sign in failed', err);
      throw err;
    }
  }, [signInMutation]);
  
  // Sign out
  const signOut = useCallback(() => {
    console.log('DriveAuthProvider: signOut called');
    signOutMutation.mutate();
    
    // Update Redux
    try {
      dispatch(clearAuth());
      console.log('DriveAuthProvider: Dispatched clearAuth to Redux');
    } catch (e) {
      console.warn('DriveAuthProvider: failed to dispatch clearAuth', e);
    }
    
    // Dispatch custom event
    try {
      if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('drive:auth-changed', { 
          detail: { isSignedIn: false, userInfo: null } 
        }));
      }
    } catch (e) {
      console.warn('DriveAuthProvider: failed to dispatch event on signOut', e);
    }
  }, [signOutMutation, dispatch]);
  
  // Legacy GoogleDriveServiceModern compatibility object
  const legacyServiceCompat = {
    isSignedIn: authState?.isSignedIn ?? false,
    userName: authState?.userName ?? null,
    userEmail: authState?.userEmail ?? null,
    userPicture: null,
    // Add any other methods that might be called
    handleOAuthToken: handleTokenResponse,
    signOut: signOut
  };
  
  const contextValue: DriveAuthContextValue = {
    isSignedIn: authState?.isSignedIn ?? false,
    userInfo,
    handleTokenResponse,
    signOut,
    GoogleDriveServiceModern: legacyServiceCompat
  };
  
  return (
    <DriveAuthContext.Provider value={contextValue}>
      {children}
    </DriveAuthContext.Provider>
  );
};

export const useDriveAuth = () => {
  const context = useContext(DriveAuthContext);
  if (!context) {
    throw new Error('useDriveAuth must be used within DriveAuthProvider');
  }
  return context;
};
