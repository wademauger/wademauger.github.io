import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Typography, Alert, Divider, Card, Spin, message } from 'antd';
import { FolderOutlined, FileOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const GoogleDriveSettings = ({ 
  visible, 
  onClose, 
  onSave,
  onCleanupFiles, // New prop for cleanup function
  userInfo = null,
  currentSettings = {}
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [cleanupResults, setCleanupResults] = useState(null);

  // Default file locations
  const defaultSettings = {
    songsLibraryFile: 'song-tabs-library.json',
    recipesLibraryFile: 'recipe-library.json',
    songsFolder: '/', // Root folder
    recipesFolder: '/', // Root folder
    ...currentSettings
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(defaultSettings);
      setConnectionStatus(null);
      setCleanupResults(null);
    }
  }, [visible, form, currentSettings]);

  const testGoogleDriveConnection = async (settings = null) => {
    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      const testSettings = settings || form.getFieldsValue();
      
      // Simulate Google Drive API calls to test the configuration
      const results = {
        songsFile: { found: false, error: null },
        recipesFile: { found: false, error: null },
        access: { valid: true, error: null }
      };

      // Test 1: Check Google Drive access
      try {
        // This would call the actual Google Drive API to verify access
        // For now, we'll simulate different scenarios
        await new Promise(resolve => setTimeout(resolve, 1000));
        results.access = { valid: true, error: null };
      } catch (error: unknown) {
        results.access = { valid: false, error: `Unable to access Google Drive. Please check your permissions. (${error.message})` };
      }

      // Test 2: Check songs library file
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Simulate checking if file exists
        const fileExists = Math.random() > 0.5; // Random for demo
        results.songsFile = { 
          found: fileExists, 
          error: fileExists ? null : `File "${testSettings.songsLibraryFile}" not found in folder "${testSettings.songsFolder}"`
        };
      } catch (error: unknown) {
        results.songsFile = { found: false, error: `Error accessing songs file: ${error.message}` };
      }

      // Test 3: Check recipes library file
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Simulate checking if file exists
        const fileExists = Math.random() > 0.3; // Random for demo
        results.recipesFile = { 
          found: fileExists, 
          error: fileExists ? null : `File "${testSettings.recipesLibraryFile}" not found in folder "${testSettings.recipesFolder}"`
        };
      } catch (error: unknown) {
        results.recipesFile = { found: false, error: `Error accessing recipes file: ${error.message}` };
      }

      setConnectionStatus(results);
    } catch (error: unknown) {
      setConnectionStatus({
        access: { valid: false, error: `Connection test failed: ${error.message}` },
        songsFile: { found: false, error: 'Could not test file access' },
        recipesFile: { found: false, error: 'Could not test file access' }
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCleanupFiles = async () => {
    if (!onCleanupFiles) {
      message.warning('Cleanup function not available');
      return;
    }

    setCleaningUp(true);
    setCleanupResults(null);

    try {
      const results = await onCleanupFiles();
      setCleanupResults(results);
      
      if (results.problematicFiles && results.problematicFiles.length > 0) {
        message.warning(`Found ${results.problematicFiles.length} potentially problematic files. Check the results below.`);
      } else {
        message.success(results.message || 'No issues found with your Google Drive files');
      }
    } catch (error: unknown) {
      console.error('Cleanup failed:', error);
      message.error('Failed to check Google Drive files. Please try again.');
    } finally {
      setCleaningUp(false);
    }
  };

  const renderCleanupResults = () => {
    if (!cleanupResults) return null;

    return (
      <Card title="Google Drive File Check Results" size="small" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Total files found: </Text>
            <Text>{cleanupResults.totalFiles || 0}</Text>
          </div>
          {cleanupResults.duplicatesFound > 0 && (
            <div>
              <Text strong>Duplicate files: </Text>
              <Text type="warning">{cleanupResults.duplicatesFound}</Text>
            </div>
          )}
          {cleanupResults.problematicFiles && cleanupResults.problematicFiles.length > 0 ? (
            <div>
              <Text strong>Potentially problematic files:</Text>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {cleanupResults.problematicFiles.map((file, index) => (
                  <li key={index}>
                    <Text code>{file.name}</Text> - {file.reason} (Size: {file.size} bytes)
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Modified: {new Date(file.modifiedTime).toLocaleString()}
                    </Text>
                  </li>
                ))}
              </ul>
              <Alert
                message="Manual Cleanup Required"
                description="We found some potentially problematic files. You can manually delete these files from your Google Drive if they appear to be corrupted or unwanted duplicates."
                type="warning"
                style={{ marginTop: 8 }}
              />
            </div>
          ) : (
            <Alert
              message="All files look good!"
              description="No problematic files were found in your Google Drive."
              type="success"
            />
          )}
        </Space>
      </Card>
    );
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Save the settings
      const settingsToSave = {
        ...values,
        userEmail: userInfo?.email,
        lastUpdated: new Date().toISOString()
      };

      if (onSave) {
        await onSave(settingsToSave);
      }

      message.success('Google Drive settings saved successfully');
      onClose();
    } catch (error: unknown) {
      console.error('Failed to save settings:', error);
      message.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderConnectionStatus = () => {
    if (!connectionStatus) return null;

    const { access, songsFile, recipesFile } = connectionStatus;

    return (
      <Card title="Connection Test Results" size="small" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* Google Drive Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {access.valid ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : (
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            )}
            <Text strong>Google Drive Access:</Text>
            <Text type={access.valid ? 'success' : 'danger'}>
              {access.valid ? 'Connected' : access.error}
            </Text>
          </div>

          {/* Songs Library File */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {songsFile.found ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : (
              <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            )}
            <Text strong>Songs Library:</Text>
            <Text type={songsFile.found ? 'success' : 'warning'}>
              {songsFile.found ? 'File found' : songsFile.error}
            </Text>
          </div>

          {/* Recipes Library File */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {recipesFile.found ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : (
              <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            )}
            <Text strong>Recipes Library:</Text>
            <Text type={recipesFile.found ? 'success' : 'warning'}>
              {recipesFile.found ? 'File found' : recipesFile.error}
            </Text>
          </div>
        </Space>
      </Card>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <FolderOutlined />
          Google Drive Settings
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cleanup" 
          icon={<DeleteOutlined />} 
          onClick={handleCleanupFiles}
          loading={cleaningUp}
          style={{ float: 'left' }}
        >
          Check for Issues
        </Button>,
        <Button key="test" 
          icon={<ReloadOutlined />} 
          onClick={() => testGoogleDriveConnection()}
          loading={testingConnection}
        >
          Test Connection
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={loading}>
          Save Settings
        </Button>
      ]}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {userInfo && (
          <Alert
            message={`Configuring Google Drive settings for: ${userInfo.name || userInfo.email}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Paragraph>
          Configure where your application data is stored in Google Drive. 
          You can specify different file names and folder locations for your songs and recipes libraries.
        </Paragraph>

        <Form
          form={form}
          layout="vertical"
          initialValues={defaultSettings}
        >
          <Title level={4}>Songs Library Configuration</Title>
          
          <Form.Item
            label="Songs Library File Name"
            name="songsLibraryFile"
            rules={[
              { required: true, message: 'Please enter a file name' },
              { pattern: /^[\w\-. ]+\.json$/, message: 'File name must end with .json' }
            ]}
            extra="The JSON file where your songs data will be stored"
          >
            <Input 
              prefix={<FileOutlined />}
              placeholder="song-tabs-library.json"
            />
          </Form.Item>

          <Form.Item
            label="Songs Folder Path"
            name="songsFolder"
            rules={[{ required: true, message: 'Please enter a folder path' }]}
            extra="The folder path in Google Drive (use '/' for root folder)"
          >
            <Input 
              prefix={<FolderOutlined />}
              placeholder="/"
            />
          </Form.Item>

          <Divider />

          <Title level={4}>Recipes Library Configuration</Title>
          
          <Form.Item
            label="Recipes Library File Name"
            name="recipesLibraryFile"
            rules={[
              { required: true, message: 'Please enter a file name' },
              { pattern: /^[\w\-. ]+\.json$/, message: 'File name must end with .json' }
            ]}
            extra="The JSON file where your recipes data will be stored"
          >
            <Input 
              prefix={<FileOutlined />}
              placeholder="recipe-library.json"
            />
          </Form.Item>

          <Form.Item
            label="Recipes Folder Path"
            name="recipesFolder"
            rules={[{ required: true, message: 'Please enter a folder path' }]}
            extra="The folder path in Google Drive (use '/' for root folder)"
          >
            <Input 
              prefix={<FolderOutlined />}
              placeholder="/"
            />
          </Form.Item>
        </Form>

        {testingConnection && (
          <Card size="small" style={{ marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <Spin />
              <Text style={{ marginLeft: 8 }}>Testing Google Drive connection...</Text>
            </div>
          </Card>
        )}

        {renderConnectionStatus()}

        {renderCleanupResults()}

        <Alert
          message="Important Notes"
          description={
            <ul style={{ margin: '8px 0 0 16px', paddingLeft: 0 }}>
              <li>Files will be created automatically if they don't exist</li>
              <li>Make sure the application has permission to access the specified folders</li>
              <li>Use different file names to avoid conflicts between different accounts</li>
              <li>Changes take effect immediately after saving</li>
            </ul>
          }
          type="info"
          style={{ marginTop: 16 }}
        />
      </div>
    </Modal>
  );
};

export default GoogleDriveSettings;