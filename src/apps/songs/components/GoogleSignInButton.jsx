import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import './GoogleSignInButton.css';

/* global google */

const GoogleSignInButton = ({ 
  onSuccess, 
  onError, 
  disabled = false, 
  isSignedIn = false, 
  onSignOut,
  loading = false,
  userInfo = null // { name, picture, email }
}) => {
  const [isLoading, setIsLoading] = useState(loading);
  
  // Check if we have a valid Google Client ID
  const hasValidClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                          import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'development-fallback';

  // Configure popup window size for Google OAuth
  useEffect(() => {
    if (!hasValidClientId) return;
    
    const originalOpen = window.open;
    
    window.open = function(...args) {
      const [url, name, features] = args;
      
      // Check if this is a Google OAuth popup
      if (typeof url === 'string' && (
        url.includes('accounts.google.com') || 
        url.includes('oauth') ||
        url.includes('googleapis.com') ||
        name?.includes('oauth') ||
        features?.includes('popup')
      )) {
        const width = 600;
        const height = 700;
        const left = Math.round((window.screen.width - width) / 2);
        const top = Math.round((window.screen.height - height) / 2);
        
        const customFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`;
        
        console.log('Opening Google OAuth popup with custom dimensions:', { width, height, left, top });
        return originalOpen.call(this, url, name || 'google_oauth', customFeatures);
      }
      
      // Also resize any suspiciously small popups
      if (features && features.includes('width=')) {
        const widthMatch = features.match(/width=(\d+)/);
        if (widthMatch && parseInt(widthMatch[1]) < 400) {
          const width = 600;
          const height = 700;
          const left = Math.round((window.screen.width - width) / 2);
          const top = Math.round((window.screen.height - height) / 2);
          
          const customFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`;
          
          console.log('Resizing small popup to larger dimensions:', { width, height });
          return originalOpen.call(this, url, name, customFeatures);
        }
      }
      
      return originalOpen.apply(this, args);
    };

    return () => {
      window.open = originalOpen;
    };
  }, [hasValidClientId]);

  const login = hasValidClientId ? useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Google login successful:', tokenResponse);
      setIsLoading(false);
      if (onSuccess) {
        onSuccess(tokenResponse);
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      setIsLoading(false);
      if (onError) {
        onError(error);
      }
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
    flow: 'implicit', // Use implicit flow to get access token directly
    // Try to configure popup dimensions
    ux_mode: 'popup',
    width: 600,
    height: 700
  }) : null;

  const handleClick = () => {
    if (!hasValidClientId) {
      console.warn('Google Client ID not configured - Google authentication is disabled');
      if (onError) {
        onError(new Error('Google Client ID not configured'));
      }
      return;
    }
    
    if (isSignedIn && onSignOut) {
      onSignOut();
    } else if (login) {
      setIsLoading(true);
      console.log('About to trigger Google login...');
      login();
    }
  };

  const GoogleIcon = () => (
    <svg
      className="google-signin-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
    >
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div className="google-signin-container">
      <button
        className={`google-signin-button ${
          isSignedIn ? 'google-signout-button' : ''
        } ${disabled ? 'disabled' : ''} ${isLoading ? 'google-signin-loading' : ''}`}
        onClick={handleClick}
        disabled={disabled || isLoading || !hasValidClientId}
      >
        {isSignedIn && userInfo ? (
          <>
            {userInfo.picture ? (
              <img 
                src={userInfo.picture} 
                alt={userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '👤'}
                className="user-avatar"
                onError={(e) => {
                  console.warn('Failed to load user avatar:', userInfo.picture);
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'inline-flex';
                }}
              />
            ) : null}
            {!userInfo.picture && (
              <div className="user-avatar-fallback">
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '👤'}
              </div>
            )}
            <div className="user-info">
              <span className="user-name">
                {userInfo.name || userInfo.email}
              </span>
              <span className="logout-hint">
                Click to logout
              </span>
            </div>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span className="google-signin-text">
              {!hasValidClientId 
                ? 'Google OAuth not configured'
                : isLoading 
                  ? 'Signing in' 
                  : 'Sign in with Google'
              }
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleSignInButton;
