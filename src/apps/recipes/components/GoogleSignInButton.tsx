import React from 'react';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import GoogleSignInButtonShared from '@/components/GoogleSignInButtonShared';
import { useDispatch } from 'react-redux';
import { openLibrarySettingsModal } from '../../../reducers/modal.reducer';

const GoogleSignInButton = (props: any) => {
  const { onSuccess, onError, onSignOut, disabled = false, isSignedIn = false, loading = false, userInfo = null, showDemoRecipes = true, onDemoRecipesToggle = null, buttonText = 'Sign in with Google' } = props;
  const dispatch = useDispatch();

  const getCurrentSettings = () => {
    try {
      const userKey = `googleDriveSettings_${userInfo?.userEmail || 'default'}`;
      const saved = localStorage.getItem(userKey);
      const settings = saved ? JSON.parse(saved) : {};
      return { ...settings, showDemoRecipes, onDemoRecipesToggle };
    } catch (error: unknown) {
      console.warn('Failed to load Google Drive settings:', error);
      return { showDemoRecipes, onDemoRecipesToggle };
    }
  };

  const handleLibrarySettings = () => {
    dispatch(openLibrarySettingsModal('recipes', getCurrentSettings()));
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div><strong>{userInfo?.userName}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{userInfo?.userEmail}</div>
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
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
      onClick: onSignOut
    }
  ];

  return (
    <GoogleSignInButtonShared
      onSuccess={onSuccess}
      onError={onError}
      onSignOut={onSignOut}
      menuItems={menuItems}
      disabled={disabled}
      loading={loading}
      isSignedIn={isSignedIn}
      userInfo={userInfo}
      buttonText={buttonText}
      size="small"
    />
  );
};

export default GoogleSignInButton;
