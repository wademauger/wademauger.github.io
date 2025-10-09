import React from 'react';
import { Button, Space, Switch, Spin } from 'antd';
import './styles/AppNavigation.css';
// Per-app sign-in button wrappers removed in favor of the shared component.

/**
 * Reusable navigation header component for apps
 * Provides consistent Google Drive integration, action buttons, and status display
 */
type PrimaryAction = {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
};

type AppNavigationProps = {
  appName?: string;
  isGoogleDriveConnected?: boolean;
  userInfo?: any;
  onSignIn?: (() => void) | null;
  onSignOut?: (() => void) | null;
  onSettingsChange?: ((...args: any[]) => void) | null;
  googleSignInProps?: Record<string, any>;
  primaryAction?: PrimaryAction | null;
  actions?: Array<any>;
  toggles?: Array<any>;
  libraryInfo?: any;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

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
  primaryAction = null as PrimaryAction | null, // { label, icon, onClick, loading, style, disabled }
  
  // Additional action buttons
  actions = [] as Array<any>, // Array of button configs
  
  // Toggle switches
  toggles = [] as Array<any>, // Array of { label, checked, onChange, disabled }
  
  // Library/content info
  libraryInfo = null as any, // { title, count, isLoading }
  
  // Custom content areas
  leftContent = null as React.ReactNode,
  centerContent = null as React.ReactNode,
  rightContent = null as React.ReactNode,
  
  // Styling
  className = '',
  style = {}
}: AppNavigationProps) => {
  return (
    <div className={`app-navigation ${className}`} style={style}>
      <div className="app-header">
        <div className="header-controls">
          {/* Left Section - Controls and Actions */}
          <div className="left-section">
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
                data-testid={primaryAction.label ? `primary-action-${primaryAction.label.replace(/\s+/g, '-').toLowerCase()}` : undefined}
                loading={primaryAction.loading}
                disabled={primaryAction.disabled}
              >
                {primaryAction.label}
              </Button>
            )}

            {/* Additional Action Buttons */}
            {actions.map((action, index: number) => (
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
            {toggles.map((toggle, index: number) => (
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
          <div className="center-section">
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
          <div className="right-section">
            {/* Right Content Area (header now contains the Google sign-in control) */}
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNavigation;