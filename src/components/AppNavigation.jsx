import React from 'react';
import { Button, Space, Switch, Spin } from 'antd';
import SongsGoogleSignInButton from '../apps/songs/components/GoogleSignInButton';
import RecipesGoogleSignInButton from '../apps/recipes/components/GoogleSignInButton';

/**
 * Reusable navigation header component for apps
 * Provides consistent Google Drive integration, action buttons, and status display
 */
const AppNavigation = ({
  // App identification
  appName = 'App',
  
  // Authentication props
  isGoogleDriveConnected = false,
  userInfo = null,
  onSignIn = null,
  onSignOut = null,
  onSettingsChange = null, // New prop for handling settings changes
  googleSignInProps = {},
  
  // Primary action button
  primaryAction = null, // { label, icon, onClick, loading, style, disabled }
  
  // Additional action buttons
  actions = [], // Array of button configs
  
  // Toggle switches
  toggles = [], // Array of { label, checked, onChange, disabled }
  
  // Library/content info
  libraryInfo = null, // { title, count, isLoading }
  
  // Custom content areas
  leftContent = null,
  centerContent = null,
  rightContent = null,
  
  // Styling
  className = '',
  style = {}
}) => {
  return (
    <div className={`app-navigation ${className}`} style={style}>
      <div className="app-header">
        <div className="header-controls" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%'
        }}>
          {/* Left Section - Controls and Actions */}
          <div className="left-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '0 0 auto' }}>
            {/* Left Content Area */}
            {leftContent}
            
            {/* Primary Action Button */}
            {primaryAction && isGoogleDriveConnected && (
              <Button 
                type="primary"
                style={{
                  background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                  borderColor: 'transparent',
                  ...primaryAction.style
                }}
                icon={primaryAction.icon}
                onClick={primaryAction.onClick}
                loading={primaryAction.loading}
                disabled={primaryAction.disabled}
              >
                {primaryAction.label}
              </Button>
            )}

            {/* Additional Action Buttons */}
            {actions.map((action, index) => (
              <Button
                key={index}
                type={action.type || 'default'}
                icon={action.icon}
                onClick={action.onClick}
                loading={action.loading}
                disabled={action.disabled}
                style={action.style}
              >
                {action.label}
              </Button>
            ))}

            {/* Toggle Switches */}
            {toggles.map((toggle, index) => (
              <div key={index} className="toggle-controls">
                <Space>
                  <span className="toggle-label">{toggle.label}:</span>
                  <Switch
                    checked={toggle.checked}
                    onChange={toggle.onChange}
                    disabled={toggle.disabled || !isGoogleDriveConnected}
                  />
                </Space>
              </div>
            ))}
          </div>

          {/* Center Section - Library Info */}
          <div className="center-section" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            flex: '1 1 auto',
            minWidth: 0
          }}>
            {/* Library Info Section */}
            {libraryInfo && (
              <div className="library-status-header">
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>
                    {libraryInfo.emoji && `${libraryInfo.emoji} `}{libraryInfo.title} Library
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                    {libraryInfo.count} {libraryInfo.count === 1 ? libraryInfo.title.toLowerCase().slice(0, -1) : libraryInfo.title.toLowerCase()} in library
                  </p>
                  {libraryInfo.isLoading && (
                    <div className="loading-indicator-header" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '0.25rem',
                      marginTop: '0.25rem'
                    }}>
                      <Spin size="small" />
                      <span className="loading-text-header">Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Center Content Area */}
            {centerContent}
          </div>

          {/* Right Section - Authentication and Right Content */}
          <div className="right-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '0 0 auto' }}>
            {/* Google Drive Authentication */}
            <div className="google-drive-section">
              {(appName === 'Recipes' || appName === 'Recipe AI Chat') ? (
                <RecipesGoogleSignInButton
                  onSuccess={onSignIn}
                  onSignOut={onSignOut}
                  onSettingsChange={onSettingsChange}
                  isSignedIn={isGoogleDriveConnected}
                  userInfo={userInfo}
                  {...googleSignInProps}
                />
              ) : (
                <SongsGoogleSignInButton
                  onSuccess={onSignIn}
                  onSignOut={onSignOut}
                  onSettingsChange={onSettingsChange}
                  isSignedIn={isGoogleDriveConnected}
                  userInfo={userInfo}
                  {...googleSignInProps}
                />
              )}
            </div>

            {/* Right Content Area */}
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNavigation;