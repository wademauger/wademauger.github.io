import React, { useState } from 'react';
import { Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { GoogleOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Text } = Typography;

const GoogleSignInButton = ({ 
  onSuccess, 
  onError, 
  onSignOut,
  disabled = false, 
  isSignedIn = false, 
  loading = false,
  userInfo = null // { userName, userEmail, userPicture }
}) => {
  const [isLoading, setIsLoading] = useState(loading);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
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
        key: 'signout',
        icon: <LogoutOutlined />,
        label: 'Sign Out',
        onClick: handleSignOut
      }
    ];

    return (
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
      Sign in with Google
    </Button>
  );
};

export default GoogleSignInButton;
