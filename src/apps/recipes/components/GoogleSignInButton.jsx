import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { GoogleOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { openLibrarySettingsModal } from '../../../reducers/modal.reducer';

const { Text } = Typography;

const GoogleSignInButton = ({ 
  onSuccess, 
  onError, 
  onSignOut,
  disabled = false, 
  isSignedIn = false, 
  loading = false,
  userInfo = null, // { userName, userEmail, userPicture }
  showDemoRecipes = true,
  onDemoRecipesToggle = null,
  buttonText = 'Connect Google Drive'
}) => {
  const [isLoading, setIsLoading] = useState(loading);
  const dispatch = useDispatch();

  // Check if we have a valid Google Client ID
  const hasValidClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                          import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'development-fallback';

  // Configure Google login with proper scopes for recipes
  const googleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata.readonly',
    onSuccess: async (tokenResponse) => {
      console.log('Google login successful:', tokenResponse);
      try {
        if (onSuccess) {
          await onSuccess(tokenResponse);
        }
      } catch (error) {
        console.error('Error handling Google login success:', error);
        if (onError) {
          onError(error);
        }
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      if (onError) {
        onError(error);
      }
    }
  });

  const handleSignIn = async () => {
    if (!hasValidClientId) {
      console.error('Google Client ID not configured');
      if (onError) {
        onError(new Error('Google Client ID not configured'));
      }
      return;
    }

    setIsLoading(true);
    try {
      console.log('About to trigger Google login...');
      googleLogin();
    } catch (error) {
      console.error('Sign in failed:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLibrarySettings = () => {
    console.log('🔧 Opening Library modal via Redux');
    dispatch(openLibrarySettingsModal('recipes', getCurrentSettings()));
  };

  const getCurrentSettings = () => {
    try {
      const userKey = `googleDriveSettings_${userInfo?.userEmail || 'default'}`;
      const saved = localStorage.getItem(userKey);
      const settings = saved ? JSON.parse(saved) : {};
      
      // Add demo recipes state and callback for recipes app
      return {
        ...settings,
        showDemoRecipes,
        onDemoRecipesToggle
      };
    } catch (error) {
      console.warn('Failed to load Google Drive settings:', error);
      return { showDemoRecipes, onDemoRecipesToggle };
    }
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  if (isSignedIn && userInfo) {
    const dropdownItems = [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: (
          <div>
            <div><strong>{userInfo.userName}</strong></div>
            <div style={{ fontSize: '12px', color: '#666' }}>{userInfo.userEmail}</div>
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
        label: 'Recipe Library Settings',
        onClick: handleLibrarySettings
      },
      {
        key: 'signout',
        icon: <LogoutOutlined />,
        label: 'Sign Out',
        onClick: handleSignOut
      }
    ];

    return (
      <>
        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
          <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
            <Space>
              {userInfo.userPicture ? (
                <Avatar src={userInfo.userPicture} size="small" />
              ) : (
                <Avatar icon={<UserOutlined />} size="small" />
              )}
              <Text style={{ display: { xs: 'none', sm: 'inline' } }}>
                {userInfo.userName}
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
        onClick={handleSignIn}
        loading={isLoading}
        disabled={disabled}
        size="small"
      >
        {buttonText}
      </Button>
    </>
  );
};

export default GoogleSignInButton;
