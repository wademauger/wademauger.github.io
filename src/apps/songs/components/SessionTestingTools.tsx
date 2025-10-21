import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, Collapse, Tag } from 'antd';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: string;
}

interface SessionInfo {
  hasToken: boolean;
  tokenPreview: string;
  email: string;
  isSignedIn: boolean;
  expiry: number | null;
  isExpired: boolean;
  timeRemaining: number | null;
}

interface SessionTestingToolsProps {
  googleDriveService: any;
  enabled?: boolean;
}

const SessionTestingTools: React.FC<SessionTestingToolsProps> = ({ googleDriveService, enabled = false }) => {
  // Initialize all hooks first (React requirement)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    hasToken: false,
    tokenPreview: 'None',
    email: 'None',
    isSignedIn: false,
    expiry: null,
    isExpired: false,
    timeRemaining: null
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpiring, setIsExpiring] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Session storage keys (matching GoogleDriveServiceModern)
  const SESSION_KEYS = {
    ACCESS_TOKEN: 'googleDrive_accessToken',
    USER_EMAIL: 'googleDrive_userEmail',
    USER_NAME: 'googleDrive_userName',
    USER_PICTURE: 'googleDrive_userPicture',
    IS_SIGNED_IN: 'googleDrive_isSignedIn',
    TOKEN_EXPIRY: 'googleDrive_tokenExpiry'
  };

  const addLog = (message: string, type: string = 'info') => {
    const timestamp = new Date().toLocaleString();
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp,
      message,
      type
    };
    setLogs(prev => [newLog, ...prev.slice(0, 19)]); // Keep last 20 logs
  };

  const updateSessionInfo = () => {
    const token = localStorage.getItem(SESSION_KEYS.ACCESS_TOKEN);
    const expiry = localStorage.getItem(SESSION_KEYS.TOKEN_EXPIRY);
    const email = localStorage.getItem(SESSION_KEYS.USER_EMAIL);
    const isSignedIn = localStorage.getItem(SESSION_KEYS.IS_SIGNED_IN);

    const info: SessionInfo = {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
      email: email || 'None',
      isSignedIn: isSignedIn === 'true',
      expiry: expiry ? parseInt(expiry) : null,
      isExpired: false,
      timeRemaining: null
    };

    if (info.expiry) {
      const now = Date.now();
      info.isExpired = now > info.expiry;
      info.timeRemaining = info.expiry - now;
    }

    setSessionInfo(info);
  };

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    
    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 2000);
    return () => clearInterval(interval);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    
    let countdownInterval: NodeJS.Timeout | undefined;
    if (isExpiring && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsExpiring(false);
            addLog('💥 Session has expired!', 'error');
            updateSessionInfo();
            return 0;
          }
          addLog(`Session expires in ${prev - 1} seconds...`, 'warning');
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isExpiring, countdown, enabled]);

  // Don't render anything if not enabled
  if (!enabled) {
    return null;
  }

  const expireSessionNow = () => {
    const pastTime = Date.now() - (60 * 60 * 1000); // 1 hour ago
    localStorage.setItem(SESSION_KEYS.TOKEN_EXPIRY, pastTime.toString());
    addLog('🕐 Session manually expired (set to 1 hour ago)', 'warning');
    updateSessionInfo();
  };

  const expireSessionIn5Seconds = () => {
    const futureTime = Date.now() + 5000; // 5 seconds from now
    localStorage.setItem(SESSION_KEYS.TOKEN_EXPIRY, futureTime.toString());
    setIsExpiring(true);
    setCountdown(5);
    addLog('⏱️ Session will expire in 5 seconds!', 'warning');
    updateSessionInfo();
  };

  const extendSession = () => {
    const futureTime = Date.now() + (60 * 60 * 1000); // 1 hour from now
    localStorage.setItem(SESSION_KEYS.TOKEN_EXPIRY, futureTime.toString());
    addLog('⏰ Session extended by 1 hour', 'success');
    updateSessionInfo();
  };

  const clearSession = () => {
    Object.values(SESSION_KEYS).forEach((key: any) => {
      localStorage.removeItem(key);
    });
    addLog('🗑️ Session cleared completely', 'info');
    updateSessionInfo();
  };

  const testTokenValidity = async () => {
    if (!googleDriveService) {
      addLog('❌ Google Drive service not available', 'error');
      return;
    }

    // First check if session is expired according to our stored expiry time
    if (sessionInfo.isExpired) {
      addLog('❌ Session is expired according to stored expiry time!', 'error');
      addLog('This should trigger a re-authentication prompt when using the service.', 'warning');
      return;
    }

    if (!sessionInfo.hasToken) {
      addLog('No access token to test', 'warning');
      return;
    }

    try {
      addLog('Testing token with Google Drive API...', 'info');
      
      // Try to call a simple Google Drive API method
      const result = await googleDriveService.testConnection();
      if (result.success) {
        addLog(`✓ Token is valid. Connected as: ${result.userEmail}`, 'success');
      } else {
        addLog(`Token test failed: ${result.error}`, 'error');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Token test failed: ${errorMessage}`, 'error');
      
      // Check for specific 401 error (expired token)
      if (errorMessage.includes('401') || errorMessage.includes('UNAUTHENTICATED')) {
        addLog('❌ 401 UNAUTHENTICATED error detected!', 'error');
        
        if (errorMessage.includes('Expected OAuth 2 access token')) {
          addLog('🎯 This is the exact error pattern we fixed!', 'error');
          addLog('The service should now detect this and trigger re-authentication.', 'info');
        }
      }
    }
  };

  const simulateUserAction = async () => {
    addLog('🎭 Simulating user action that would trigger authentication check...', 'info');
    
    // Check if session is expired
    if (sessionInfo.isExpired) {
      addLog('❌ Session expired detected! In real app, this would:', 'error');
      addLog('1. Clear the expired session', 'info');
      addLog('2. Show login prompt to user', 'info');
      addLog('3. After login, retry the original action', 'info');
      
      // Simulate what our service would do
      addLog('Clearing expired session...', 'warning');
      clearSession();
      addLog('🔄 User would now see the Google Sign-In button', 'info');
      return;
    }
    
    // If not expired, try to test the service
    await testTokenValidity();
  };

  const loadLibraryTest = async () => {
    if (!googleDriveService) {
      addLog('❌ Google Drive service not available', 'error');
      return;
    }

    try {
      addLog('Testing library loading...', 'info');
      const result = await googleDriveService.loadLibrary();
      if (result.success) {
        addLog('✓ Library loaded successfully', 'success');
      } else {
        addLog(`Library loading failed: ${result.error}`, 'error');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Library loading failed: ${errorMessage}`, 'error');
      
      if (errorMessage.includes('401') || errorMessage.includes('UNAUTHENTICATED')) {
        addLog('❌ Authentication error during library load!', 'error');
        addLog('In the real app, this would trigger automatic re-authentication.', 'info');
      }
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const formatTimeRemaining = (timeMs: number | null): string => {
    if (!timeMs || timeMs <= 0) return 'Expired';
    const minutes = Math.floor(timeMs / (1000 * 60));
    const seconds = Math.floor((timeMs % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getLogTypeColor = (type: string): string => {
    switch (type) {
      case 'error': return '#ff4d4f';
      case 'warning': return '#faad14';
      case 'success': return '#52c41a';
      default: return '#1890ff';
    }
  };

  return (
    <Card 
      title={
        <Space>
          <span>🧪</span>
          <span>Session Testing Tools</span>
          <Tag color="orange">DEV ONLY</Tag>
        </Space>
      }
      className="session-testing-card"
    >
      <Collapse ghost>
        <Panel header="🔧 Session Testing Controls" key="1">
          <Space direction="vertical" className="session-testing-space">
            
            {/* Session Info */}
            <Card size="small" title="Current Session Status">
              <Space direction="vertical" className="session-status-space">
                <Text>
                  <strong>Token:</strong> {sessionInfo.tokenPreview}
                </Text>
                <Text>
                  <strong>Email:</strong> {sessionInfo.email}
                </Text>
                <Text>
                  <strong>Signed In:</strong> {sessionInfo.isSignedIn ? '✅ Yes' : '❌ No'}
                </Text>
                {sessionInfo.expiry && (
                  <>
                    <Text>
                      <strong>Expiry:</strong> {new Date(sessionInfo.expiry).toLocaleString()}
                    </Text>
                    <Text>
                      <strong>Status:</strong> {' '}
                      {sessionInfo.isExpired ? (
                        <Tag color="red">❌ EXPIRED</Tag>
                      ) : (
                        <Tag color="green">✅ Valid</Tag>
                      )}
                    </Text>
                    {!sessionInfo.isExpired && (
                      <Text>
                        <strong>Time remaining:</strong> {formatTimeRemaining(sessionInfo.timeRemaining)}
                      </Text>
                    )}
                  </>
                )}
                {isExpiring && countdown > 0 && (
                  <Alert
                    message={`Session expires in ${countdown} seconds!`}
                    type="warning"
                    showIcon
                  />
                )}
              </Space>
            </Card>

            {/* Session Manipulation Controls */}
            <Card size="small" title="Session Manipulation">
                <Space wrap>
                <Button 
                  type="primary" 
                  danger
                  onClick={expireSessionNow}
                >
                  ⏰ Expire Now
                </Button>
                <Button 
                  type="default"
                  onClick={expireSessionIn5Seconds}
                >
                  ⚠️ Expire in 5s
                </Button>
                <Button 
                  type="default"
                  onClick={extendSession}
                >
                  Extend (+1h)
                </Button>
                <Button 
                  type="default"
                  onClick={clearSession}
                >
                  Clear Session
                </Button>
              </Space>
            </Card>

            {/* API Testing Controls */}
            <Card size="small" title="API Testing">
              <Space wrap>
                <Button 
                  type="default"
                  onClick={testTokenValidity}
                >
                  ℹ️ Test Token
                </Button>
                <Button 
                  type="default"
                  onClick={loadLibraryTest}
                >
                  Test Library Load
                </Button>
                <Button 
                  type="primary"
                  onClick={simulateUserAction}
                >
                  Simulate User Action
                </Button>
              </Space>
            </Card>

            {/* Debug Log */}
            <Card 
              size="small" 
              title="Debug Log"
              extra={
                <Button size="small" onClick={clearLogs}>
                  Clear
                </Button>
              }
            >
              <div className="session-log-container">
                {logs.length === 0 ? (
                  <Text type="secondary">No logs yet...</Text>
                ) : (
                  logs.map((log: any) => (
                    <div 
                      key={log.id} 
                      className="session-log-entry"
                      style={{ borderLeft: `3px solid ${getLogTypeColor(log.type)}` }}
                    >
                      <Text type="secondary">[{log.timestamp}]</Text>{' '}
                      <Text>{log.message}</Text>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Alert
              message="Instructions"
              description={
                <div>
                  <Paragraph className="session-instructions-paragraph">
                    1. <strong>Expire Session:</strong> Use "Expire Now" or "Expire in 5s" to test expired session detection
                  </Paragraph>
                  <Paragraph className="session-instructions-paragraph">
                    2. <strong>Test API:</strong> Use "Test Token" to check if expired sessions trigger 401 errors
                  </Paragraph>
                  <Paragraph className="session-instructions-paragraph last">
                    3. <strong>Simulate User Action:</strong> Tests the complete flow of expired session detection and cleanup
                  </Paragraph>
                </div>
              }
              type="info"
              showIcon
            />
          </Space>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default SessionTestingTools;
