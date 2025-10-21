import React from 'react';
import { SaveOutlined, FolderOpenOutlined, LogoutOutlined } from '@ant-design/icons';
import GoogleAuthButton from '@/components/GoogleAuthButton';

interface GoogleSignInButtonProps {
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  onSignOut: () => void;
  onOpen?: () => void;
  onSaveAs?: () => void;
  disabled?: boolean;
  loading?: boolean;
  isSignedIn?: boolean;
  userInfo?: any;
  buttonText?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError, onSignOut, onOpen, onSaveAs, disabled = false, loading = false, isSignedIn = false, userInfo = null, buttonText = 'Sign in with Google' }) => {
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
      onClick: onSignOut
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
      buttonText={buttonText}
      size="small"
    />
  );
};

export default GoogleSignInButton;
