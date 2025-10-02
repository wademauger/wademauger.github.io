import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { GoogleOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { openLibrarySettingsModal } from '../../../reducers/modal.reducer';

const { Text } = Typography;

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
  const dispatch = useDispatch();
  
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
    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata.readonly',
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

    const handleSettingsClick = () => {
    console.log('🔧 Opening Song Library modal via Redux');
    dispatch(openLibrarySettingsModal('songs', getCurrentSettings()));
  };

  const getCurrentSettings = () => {
    try {
      const userKey = `googleDriveSettings_${userInfo?.email || 'default'}`;
      const saved = localStorage.getItem(userKey);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load Google Drive settings:', error);
      return {};
    }
  };

  if (isSignedIn && userInfo) {
    const dropdownItems = [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: (
          <div>
            <div><strong>{userInfo.name}</strong></div>
            <div style={{ fontSize: '12px', color: '#666' }}>{userInfo.email}</div>
          </div>
        ),
        disabled: true
      },
      {
        type: 'divider'
      },
      {
        key: 'library',
        icon: <SettingOutlined />,
        label: 'Song Library Settings',
        onClick: handleSettingsClick
      },
      {
        key: 'signout',
        icon: <LogoutOutlined />,
        label: 'Sign Out',
        onClick: () => {
          if (isSignedIn && onSignOut) {
            onSignOut();
          }
        }
      }
    ];

    return (
      <>
        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
          <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
            <Space>
              {userInfo.picture ? (
                <Avatar src={userInfo.picture} size="small" />
              ) : (
                <Avatar icon={<UserOutlined />} size="small" />
              )}
              <Text style={{ display: { xs: 'none', sm: 'inline' } }}>
                {userInfo.name}
              </Text>
            </Space>
          </Button>
        </Dropdown>


      </>
    );
  }

  return (
    <>
      <Button
        type="primary"
        icon={<GoogleOutlined />}
        onClick={handleClick}
        loading={isLoading}
        disabled={disabled || !hasValidClientId}
        size="small"
      >
        {!hasValidClientId 
          ? 'Google OAuth not configured'
          : 'Sign in with Google'
        }
      </Button>
    </>
  );
};

export default GoogleSignInButton;
