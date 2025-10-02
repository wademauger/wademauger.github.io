import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { GoogleOutlined, UserOutlined, LogoutOutlined, SaveOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useDriveAuth } from '../context/DriveAuthContext.jsx';

const { Text } = Typography;

const GoogleSignInButton = ({
  onSuccess,
  onError,
  onSignOut,
  onOpen,
  onSaveAs,
  disabled = false,
  loading = false,
  isSignedIn = false,
  userInfo = null,
  buttonText = 'Connect Google Drive'
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

  // Prefer the underlying Drive service instance for authoritative state
  const svc = (driveAuth && driveAuth.GoogleDriveServiceModern) || null;
  const globalSvc = (typeof window !== 'undefined' && window.GoogleDriveServiceModern) ? window.GoogleDriveServiceModern : null;

  const googleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata.readonly',
    onSuccess: async (tokenResponse) => {
      try {
        // Prefer using context handler if present
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

  const signed = !!((svc && svc.isSignedIn) || (globalSvc && globalSvc.isSignedIn) || ctxIsSignedIn || isSignedIn || signedNow);
  const info = (svc && (svc.userName || svc.userPicture)) ? { userName: svc.userName, userPicture: svc.userPicture } : ((globalSvc && (globalSvc.userName || globalSvc.userPicture)) ? { userName: globalSvc.userName, userPicture: globalSvc.userPicture } : (ctxUserInfo || userInfo));

  // Clear local signed flag when sign out occurs
  React.useEffect(() => {
    if (!signed && signedNow) setSignedNow(false);
  }, [signed, signedNow]);

  // Listen for external auth change events so we can flip UI immediately
  React.useEffect(() => {
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
    const menuItems = [
      {
        key: 'saveas',
        label: 'Save As...',
        icon: <SaveOutlined />, 
        onClick: () => { console.log('GoogleSignInButton: Save As clicked'); if (onSaveAs) onSaveAs(); }
      },
      {
        key: 'open',
        label: 'Open...',
        icon: <FolderOpenOutlined />, 
        onClick: () => { if (onOpen) onOpen(); }
      },
      {
        key: 'signout',
        label: 'Sign Out',
        icon: <LogoutOutlined />,
        onClick: handleSignOut
      }
    ];

    return (
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
          <Space>
            {info && info.userPicture ? (
              <Avatar src={info.userPicture} size="small" />
            ) : (
              <Avatar icon={<UserOutlined />} size="small" />
            )}
            <Text style={{ display: { xs: 'none', sm: 'inline' } }}>{(info && info.userName) ? info.userName : 'Account'}</Text>
          </Space>
        </Button>
      </Dropdown>
    );
  }

  return (
    <Button
      type="primary"
      icon={<GoogleOutlined />}
      onClick={handleSignIn}
      loading={isLoading}
      disabled={disabled}
      size="small"
    >
      {buttonText}
    </Button>
  );
};

export default GoogleSignInButton;
