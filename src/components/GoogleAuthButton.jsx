import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { GoogleOutlined, UserOutlined } from '@ant-design/icons';
import { useDriveAuth } from '../apps/colorwork-designer/context/DriveAuthContext.jsx';

const { Text } = Typography;

// A shared Google auth button that renders either a primary Sign-in button
// or a Dropdown when signed-in. Accepts app-specific menu items and handlers.
const GoogleAuthButton = ({
  onSuccess,
  onError,
  onSignOut,
  menuItems = [], // array compatible with antd menu items
  disabled = false,
  loading = false,
  isSignedIn: isSignedInProp = false,
  userInfo: userInfoProp = null,
  buttonText = 'Sign in with Google',
  scope = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata.readonly',
  enablePopupResize = false,
  size = 'small'
}) => {
  const [isLoading, setIsLoading] = useState(loading);
  const [signedNow, setSignedNow] = useState(false);

  const hasValidClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'development-fallback';

  // Prefer context if available
  const driveAuth = useDriveAuth();
  const ctxHandleToken = driveAuth?.handleTokenResponse;
  const ctxSignOut = driveAuth?.signOut;
  const ctxIsSignedIn = driveAuth?.isSignedIn;
  const ctxUserInfo = driveAuth?.userInfo;

  const svc = (driveAuth && driveAuth.GoogleDriveServiceModern) || null;
  const globalSvc = (typeof window !== 'undefined' && window.GoogleDriveServiceModern) ? window.GoogleDriveServiceModern : null;

  // Optionally override window.open for nicer popup sizing (used by songs app)
  useEffect(() => {
    if (!enablePopupResize) return;
    if (!hasValidClientId) return;

    const originalOpen = window.open;
    window.open = function(...args) {
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
      } catch (err) {
        // fallthrough
      }
      return originalOpen.apply(this, args);
    };

    return () => { window.open = originalOpen; };
  }, [enablePopupResize, hasValidClientId]);

  const googleLogin = useGoogleLogin({
    scope,
    onSuccess: async (tokenResponse) => {
      try {
        if (ctxHandleToken) {
          await ctxHandleToken(tokenResponse);
          setSignedNow(true);
        } else if (onSuccess) {
          await onSuccess(tokenResponse);
          setSignedNow(true);
        }
      } catch (err) {
        if (onError) onError(err);
      }
    },
    onError: (err) => {
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
    } catch (err) {
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    if (ctxSignOut) return ctxSignOut();
    if (onSignOut) return onSignOut();
  };

  const signed = !!((svc && svc.isSignedIn) || (globalSvc && globalSvc.isSignedIn) || ctxIsSignedIn || isSignedInProp || signedNow);
  const info = (svc && (svc.userName || svc.userPicture)) ? { userName: svc.userName, userPicture: svc.userPicture } : ((globalSvc && (globalSvc.userName || globalSvc.userPicture)) ? { userName: globalSvc.userName, userPicture: globalSvc.userPicture } : (ctxUserInfo || userInfoProp));

  useEffect(() => {
    if (!signed && signedNow) setSignedNow(false);
  }, [signed, signedNow]);

  useEffect(() => {
    const handler = (ev) => {
      try {
        const d = ev && ev.detail;
        if (d && d.isSignedIn) setSignedNow(true);
        else setSignedNow(false);
      } catch {
        // swallow
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

  if (signed) {
    return (
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Button type="default" style={{ height: 'auto', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)' }} size={size}>
          <Space>
            {info && info.userPicture ? (
              <Avatar src={info.userPicture} size="small" />
            ) : (
              <Avatar icon={<UserOutlined />} size="small" />
            )}
            <Text style={{ display: { xs: 'none', sm: 'inline' } }}>{(info && (info.userName || info.userEmail || info.name)) ? (info.userName || info.userEmail || info.name) : 'Account'}</Text>
          </Space>
        </Button>
      </Dropdown>
    );
  }

  // Signed-out button: render dark-themed control so it reads on dark header
  return (
    <Button
      type="default"
      className="nav-google-button"
      icon={<GoogleOutlined style={{ color: '#fff' }} />}
      onClick={handleSignIn}
      loading={isLoading}
      disabled={disabled}
      size={size}
      style={{ height: 'auto', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)', color: '#fff' }}
    >
      {buttonText}
    </Button>
  );
};

export default GoogleAuthButton;
