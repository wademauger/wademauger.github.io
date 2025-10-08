import React from 'react';
import GoogleAuthButton from '@/components/GoogleAuthButton';

type Props = {
  onSuccess?: any;
  onError?: any;
  onSignOut?: any;
  menuItems?: any[];
  disabled?: boolean;
  loading?: boolean;
  isSignedIn?: boolean;
  userInfo?: any | null;
  buttonText?: string;
  size?: 'small' | 'middle' | 'large' | number;
  enablePopupResize?: boolean;
};

const GoogleSignInButtonShared: React.FC<Props> = ({
  onSuccess,
  onError,
  onSignOut,
  menuItems = [],
  disabled = false,
  loading = false,
  isSignedIn = false,
  userInfo = null,
  buttonText = 'Sign in with Google',
  size = 'small',
  enablePopupResize = false
}) => {
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
      size={size}
      enablePopupResize={enablePopupResize}
    />
  );
};

export default GoogleSignInButtonShared;
