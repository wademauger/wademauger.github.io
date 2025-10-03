import React from 'react';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { useDispatch } from 'react-redux';
import { openLibrarySettingsModal } from '../../../reducers/modal.reducer';

const GoogleSignInButton = ({ onSuccess, onError, disabled = false, isSignedIn = false, onSignOut, loading = false, userInfo = null }) => {
  const dispatch = useDispatch();

  const getCurrentSettings = () => {
    try {
      const userKey = `googleDriveSettings_${userInfo?.email || 'default'}`;
      const saved = localStorage.getItem(userKey);
      return saved ? JSON.parse(saved) : {};
    } catch (error: unknown) {
      console.warn('Failed to load Google Drive settings:', error);
      return {};
    }
  };

  const handleSettingsClick = () => {
    dispatch(openLibrarySettingsModal('songs', getCurrentSettings()));
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div><strong>{userInfo?.name}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{userInfo?.email}</div>
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
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
      onClick: () => { if (isSignedIn && onSignOut) onSignOut(); }
    }
  ];

  return (
    <GoogleAuthButton
      onSuccess={onSuccess}
      onError={onError}
      onSignOut={onSignOut}
      menuItems={menuItems}
      disabled={disabled}
      loading={loading}
      isSignedIn={isSignedIn}
      userInfo={userInfo}
      buttonText={'Sign in with Google'}
      size="small"
      enablePopupResize={true}
    />
  );
};

export default GoogleSignInButton;
