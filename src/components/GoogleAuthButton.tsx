import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import GoogleButton from 'react-google-button';
import { useDriveAuth } from '../apps/colorwork-designer/context/DriveAuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { LibrarySettingsModal } from '@/components/modals';
import { RootState } from '@/types';
import { setAuth, clearAuth } from '@/store/authSlice';
import { useDropdown } from './DropdownProvider';

const { Text } = Typography;

interface GoogleAuthButtonProps {
  onSuccess?: (tr: any) => void;
  onError?: (err: any) => void;
  onSignOut?: () => void;
  menuItems?: any[];
  disabled?: boolean;
  loading?: boolean;
  isSignedIn?: boolean;
  userInfo?: any | null;
  buttonText?: string;
  scope?: string;
  enablePopupResize?: boolean;
  size?: 'small' | 'middle' | 'large' | number;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  onSignOut,
  menuItems = [],
  disabled = false,
  loading = false,
  isSignedIn: isSignedInProp = false,
  userInfo: userInfoProp = null,
  buttonText = 'Sign in with Google',
  scope = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata.readonly',
  enablePopupResize = false,
  size = 'small'
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  const [signedNow, setSignedNow] = useState<boolean>(false);
  const [showLibrarySettings, setShowLibrarySettings] = useState<boolean>(false);

  const hasValidClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'development-fallback';

  const driveAuth = useDriveAuth();
  const dispatch = useDispatch();
  const authState = useSelector((s: RootState) => (s as any).auth) as any;
  const { menuItems: ctxMenuItems } = useDropdown();
  const ctxHandleToken = driveAuth?.handleTokenResponse;
  const ctxSignOut = driveAuth?.signOut;
  const ctxIsSignedIn = driveAuth?.isSignedIn;
  const ctxUserInfo = driveAuth?.userInfo;

  // Initialize/restore when possible and sync to Redux
  useEffect(() => {
    (async () => {
      try {
        const service = (driveAuth && (driveAuth as any).GoogleDriveServiceModern) || ((typeof window !== 'undefined' && (window as any).GoogleDriveServiceModern) ? (window as any).GoogleDriveServiceModern : null);
        if (!service) return;

        // runtime-safe CLIENT_ID lookup
        let cid: string | undefined;
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('return (typeof import !== "undefined" && import.meta && import.meta.env) ? import.meta.env.VITE_GOOGLE_CLIENT_ID : undefined');
          cid = fn();
        } catch {
          // @ts-ignore
          cid = (globalThis && (globalThis.__IMPORT_META_ENV__ || {}).VITE_GOOGLE_CLIENT_ID) || (process && (process.env as any) && (process.env as any).VITE_GOOGLE_CLIENT_ID);
        }

        if (cid && cid !== 'development-fallback') {
          service.CLIENT_ID = cid;
        }

        if (typeof service.initialize === 'function') {
          try { await service.initialize(service.CLIENT_ID || cid); } catch (e) { /* non-fatal */ }
        }

        try {
          const restored = service.restoreSession && service.restoreSession();
          if (restored && typeof service.validateToken === 'function') {
            const valid = await service.validateToken();
            const ui = { userName: service.userName, userEmail: service.userEmail, userPicture: service.userPicture };
            try {
              if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
                window.dispatchEvent(new CustomEvent('drive:auth-changed', { detail: { isSignedIn: !!service.isSignedIn && !!valid, userInfo: ui } }));
              }
            } catch (e) { /* swallow */ }

            try { dispatch(setAuth({ isSignedIn: !!service.isSignedIn && !!valid, userInfo: ui })); } catch {}
          }
        } catch (e) {
          try { service.clearSession && service.clearSession(); } catch {}
        }
      } catch (e) {
        // non-fatal
      }
    })();
    // run once on mount
  }, []);

  // Debug info
  useEffect(() => {
    try {
      const svc = (driveAuth && (driveAuth as any).GoogleDriveServiceModern) || ((typeof window !== 'undefined' && (window as any).GoogleDriveServiceModern) ? (window as any).GoogleDriveServiceModern : null);
      console.debug('GoogleAuthButton debug - ctxIsSignedIn:', ctxIsSignedIn, 'authState:', authState);
      if (svc) {
        console.debug('GoogleAuthButton debug - service state:', { isSignedIn: svc.isSignedIn, userName: svc.userName, userEmail: svc.userEmail, userPicture: svc.userPicture });
      }
    } catch (e) {
      // swallow
    }
  }, []);

  // Optionally override window.open for nicer popup sizing
  useEffect(() => {
    if (!enablePopupResize) return;
    if (!hasValidClientId) return;

    const originalOpen = window.open;
    window.open = function(...args: any[]) {
      try {
        const [url, name, features] = args;
        if (typeof url === 'string' && (url.includes('accounts.google.com') || url.includes('oauth') || url.includes('googleapis.com') || (name && name.includes('oauth')) || (features && features.includes('popup')))) {
          const width = 600;
          const height = 700;
          const left = Math.round((window.screen.width - width) / 2);
          const top = Math.round((window.screen.height - height) / 2);
          const customFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`;
          return originalOpen.call(this, url, name || 'google_oauth', customFeatures);
        }
      } catch (err: unknown) {
        // fallthrough
      }
      return originalOpen.apply(this, args as any);
    };

    return () => { window.open = originalOpen; };
  }, [enablePopupResize, hasValidClientId]);

  const googleLogin = useGoogleLogin({
    scope,
    onSuccess: async (tokenResponse: any) => {
      console.log('GoogleAuthButton: Login success, token response:', tokenResponse);
      try {
        if (ctxHandleToken) {
          console.log('GoogleAuthButton: Using context handleToken');
          await ctxHandleToken(tokenResponse);
          setSignedNow(true);
        } else if (onSuccess) {
          console.log('GoogleAuthButton: Using prop onSuccess callback');
          await onSuccess(tokenResponse);
          setSignedNow(true);
        }
        console.log('GoogleAuthButton: Login flow completed successfully');
      } catch (err: unknown) {
        console.error('GoogleAuthButton: Login flow failed:', err);
        if (onError) onError(err);
      }
    },
    onError: (err: any) => {
      console.error('GoogleAuthButton: Login error:', err);
      if (onError) onError(err);
    }
  });

  const handleSignIn = async () => {
    if (!hasValidClientId) {
      if (onError) onError(new Error('Google Client ID not configured'));
      return;
    }
    setIsLoading(true);
    try {
      googleLogin();
    } catch (err: unknown) {
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    if (ctxSignOut) return ctxSignOut();
    if (onSignOut) return onSignOut();
  };

  // Check multiple sources for auth state, prioritizing context and Redux
  const svc = (driveAuth && (driveAuth as any).GoogleDriveServiceModern) || ((typeof window !== 'undefined' && (window as any).GoogleDriveServiceModern) ? (window as any).GoogleDriveServiceModern : null);
  const globalSvc = (typeof window !== 'undefined' && (window as any).GoogleDriveServiceModern) ? (window as any).GoogleDriveServiceModern : null;
  
  const signed = !!(ctxIsSignedIn || authState?.isSignedIn || (svc && svc.isSignedIn) || (globalSvc && globalSvc.isSignedIn) || isSignedInProp || signedNow);
  const info = ctxUserInfo || authState?.userInfo || (svc && (svc.userName || svc.userPicture) ? { userName: svc.userName, userPicture: svc.userPicture } : ((globalSvc && (globalSvc.userName || globalSvc.userPicture)) ? { userName: globalSvc.userName, userPicture: globalSvc.userPicture } : userInfoProp));
  const isButtonDisabled = disabled || isLoading || !hasValidClientId;

  const resolveSize = () => {
    if (typeof size === 'number') {
      const height = Math.max(32, size);
      const fontScale = Math.max(13, Math.round((height / 36) * 14));
      return { height, fontSize: fontScale, paddingX: Math.round(height * 0.45) };
    }
    const presets: Record<'small' | 'middle' | 'large', { height: number; fontSize: number; paddingX: number }> = {
      small: { height: 36, fontSize: 14, paddingX: 18 },
      middle: { height: 40, fontSize: 15, paddingX: 20 },
      large: { height: 44, fontSize: 16, paddingX: 22 }
    };
    return presets[size as 'small' | 'middle' | 'large'] || presets.small;
  };

  const { height: resolvedHeight, fontSize: resolvedFontSize, paddingX } = resolveSize();

  const customGoogleButton = (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isButtonDisabled}
      aria-label={buttonText}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.65rem',
        backgroundColor: '#fff',
        border: '1px solid rgba(60,64,67,0.35)',
        borderRadius: `${resolvedHeight / 2}px`,
        padding: `0 ${paddingX}px`,
        height: `${resolvedHeight}px`,
        minWidth: 'min(280px, 90vw)',
        boxShadow: isButtonDisabled ? 'none' : '0 1px 2px rgba(0,0,0,0.15)',
        color: '#3c4043',
        fontSize: `${resolvedFontSize}px`,
        fontWeight: 500,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
        opacity: isButtonDisabled ? 0.7 : 1,
        transition: 'box-shadow 0.15s ease, transform 0.15s ease'
      }}
      onMouseDown={(ev) => {
        if (!isButtonDisabled) {
          (ev.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
        }
      }}
      onMouseUp={(ev) => {
        (ev.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
      onMouseLeave={(ev) => {
        (ev.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${resolvedHeight - 12}px`,
          height: `${resolvedHeight - 12}px`,
          borderRadius: '50%'
        }}
      >
        <svg viewBox="0 0 18 18" width={resolvedHeight - 18} height={resolvedHeight - 18} xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M9 7.5v3.6h4.99A4.98 4.98 0 0 1 9 14.5 5.5 5.5 0 0 1 9 3.5c1.49 0 2.84.57 3.87 1.5l2.74-2.74A9.01 9.01 0 1 0 9 18c4.59 0 8.42-3.42 8.99-7.84H9z" />
          <path fill="#34A853" d="M1.64 5.27A8.98 8.98 0 0 0 0 9c0 1.4.32 2.72.9 3.89l2.74-2.74A5.47 5.47 0 0 1 3.5 9c0-.74.13-1.46.37-2.12L1.64 5.27z" />
          <path fill="#FBBC05" d="M9 3.5c1.49 0 2.84.57 3.87 1.5l2.74-2.74A8.99 8.99 0 0 0 1.64 5.27l2.23 1.61A5.45 5.45 0 0 1 9 3.5z" />
          <path fill="#4285F4" d="M9 18a8.99 8.99 0 0 0 6.74-2.73l-2.58-2.44c-.73.52-1.65.82-3.16.82A5.48 5.48 0 0 1 3.64 11.1L.9 13.9A8.99 8.99 0 0 0 9 18z" />
        </svg>
      </span>
      <span>{buttonText}</span>
    </button>
  );

  // Reset signedNow state when we detect logout via other means (Redux, context)
  useEffect(() => {
    if (!signed && signedNow) {
      setSignedNow(false);
    }
    // Also reset if Redux explicitly says we're signed out
    if (authState?.isSignedIn === false && signedNow) {
      setSignedNow(false);
    }
  }, [signed, signedNow, authState?.isSignedIn]);

  useEffect(() => {
    const handler = (ev: any) => {
      try {
        const d = ev && ev.detail;
        console.log('GoogleAuthButton: received drive:auth-changed event', d);
        
        // Force component re-render by updating local state
        if (d && d.isSignedIn) {
          setSignedNow(true);
        } else {
          setSignedNow(false);
        }
        
        // Sync to Redux for global state consistency
        try {
          if (d && d.isSignedIn) {
            dispatch(setAuth({ isSignedIn: true, userInfo: d.userInfo }));
          } else {
            dispatch(clearAuth());
          }
        } catch (e) { 
          console.warn('Failed to sync auth state to Redux:', e);
        }
      } catch (e) {
        console.warn('Error handling drive:auth-changed event:', e);
      }
    };
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('drive:auth-changed', handler);
    }
    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('drive:auth-changed', handler);
      }
    };
  }, []);

  // Merge menu items: combine passed-in items with contextual items from provider
  const mergedMenuItems = Array.isArray(menuItems) || Array.isArray(ctxMenuItems) ? ([...(menuItems || []), ...(ctxMenuItems || [])]) : [];

  // Helper to infer app context from current path (hash-based routing)
  const inferAppFromLocation = (loc?: string) => {
    try {
      const path = loc || (typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '/');
      if (path.startsWith('/crafts/recipes') || path.startsWith('/recipes')) return 'recipes';
      if (path.startsWith('/crafts/tabs') || path.startsWith('/songs') || path.startsWith('/crafts/tabs')) return 'songs';
      if (path.startsWith('/crafts/colorwork-designer') || path.startsWith('/crafts/unified-designer') || path.startsWith('/crafts/knitting') || path.startsWith('/colorwork') || path.startsWith('/knitting')) return 'panels';
      // default to songs
      return 'songs';
    } catch (e) { return 'songs'; }
  };

  // Prepend a global library settings action so it's always available in the dropdown
  const libraryMenuItem = {
    key: 'global-library-settings',
    label: 'Library Settings',
    onClick: () => setShowLibrarySettings(true)
  };

  const finalMenuItems = [libraryMenuItem, ...mergedMenuItems];

  // Add a persistent Sign out action for signed-in users
  const signOutMenuItem = {
    key: 'sign-out',
    label: 'Sign out',
    onClick: handleSignOut
  };

  const menuForSigned = [...finalMenuItems, signOutMenuItem];

  // Only render the dropdown when the user is signed in. When not signed in
  // show only the sign-in button (no options) because app options require auth.
  const childButton = (
    <Button type="default" style={{ height: 'auto', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)' }} size={size as any}>
      <Space>
        {info && info.userPicture ? (
          <Avatar src={info.userPicture} size="small" />
        ) : (
          <Avatar icon={<UserOutlined />} size="small" />
        )}
        <Text style={{ display: 'inline' }}>{(info && (info.userName || info.userEmail || info.name)) ? (info.userName || info.userEmail || info.name) : 'Account'}</Text>
      </Space>
    </Button>
  );
  // If signed in, render the dropdown with menu items; otherwise just the sign-in button
  if (signed) {
    // Map items into AntD menu format and handle clicks by delegating to the item's onClick
    const itemsMap = menuForSigned.map((it: any) => ({ key: it.key, label: it.label }));
    const onMenuClick = ({ key }: any) => {
      try {
        const it = (menuForSigned || []).find((m: any) => m.key === key);
        if (it && typeof it.onClick === 'function') {
          it.onClick();
          return;
        }
        // Fallback: if key is a string representing an encoded callback, ignore
      } catch (e) { /* swallow */ }
    };

    return (
      <>
        <Dropdown menu={{ items: itemsMap, onClick: onMenuClick }} placement="bottomRight">
          {childButton}
        </Dropdown>
        
        <LibrarySettingsModal
          visible={showLibrarySettings}
          jsonKey="library"
          displayLabel="Library"
          onClose={() => setShowLibrarySettings(false)}
        />
      </>
    );
  }

  return (
    <>
      {customGoogleButton}
      
      <LibrarySettingsModal
        visible={showLibrarySettings}
        jsonKey="library"
        displayLabel="Library"
        onClose={() => setShowLibrarySettings(false)}
      />
    </>
  );
};

export default GoogleAuthButton;
