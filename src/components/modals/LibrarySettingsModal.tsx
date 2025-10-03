import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Alert, message } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import GoogleDriveServiceModern from '../../apps/songs/services/GoogleDriveServiceModern';
import { loadFullLibrary } from '../../store/librarySlice';
import type { LibrarySettingsModalProps, LibrarySettings } from './types';

/**
 * LibrarySettingsModal - Dedicated modal for configuring library file location
 * 
 * This modal allows users to set the Google Drive file name and folder path
 * for their library JSON file. It's reusable across all apps (songs, recipes, panels, etc.)
 * 
 * @example
 * <LibrarySettingsModal
 *   visible={showSettings}
 *   jsonKey="panels"
 *   displayLabel="Panel"
 *   onClose={() => setShowSettings(false)}
 *   onSave={(settings) => console.log('Saved:', settings)}
 * />
 */
export const LibrarySettingsModal: React.FC<LibrarySettingsModalProps> = ({
  visible,
  jsonKey,
  displayLabel,
  onClose,
  onSave
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [service] = useState(() => GoogleDriveServiceModern);
  const dispatch = useDispatch();

  // Load current settings when modal opens
  useEffect(() => {
    if (visible) {
      loadCurrentSettings();
    }
  }, [visible, jsonKey]);

  const loadCurrentSettings = () => {
    try {
      // Try to restore session if not already signed in
      if (!service.isSignedIn && service.restoreSession) {
        service.restoreSession();
      }

      const settings = service.getSettings();
      
      // Map jsonKey to the appropriate settings field
      const fileKey = `${jsonKey}LibraryFile`;
      const folderKey = `${jsonKey}Folder`;
      
      const fileName = settings[fileKey] || `${jsonKey}-library.json`;
      const folderPath = settings[folderKey] || '/';

      form.setFieldsValue({
        fileName,
        folderPath
      });

      console.log(`📚 Loaded settings for ${jsonKey}:`, { fileName, folderPath });
    } catch (error) {
      console.error('Error loading settings:', error);
      // Set defaults if loading fails
      form.setFieldsValue({
        fileName: `${jsonKey}-library.json`,
        folderPath: '/'
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // For unified library system, always use 'library' prefix and clean up old app-specific settings
      const settingsUpdate: Record<string, any> = {
        libraryLibraryFile: values.fileName,
        libraryFolder: values.folderPath
      };
      
      // Remove legacy per-app settings if they exist
      const legacyKeys = ['songsLibraryFile', 'songsFolder', 'recipesLibraryFile', 'recipesFolder', 'panelsLibraryFile', 'panelsFolder'];
      legacyKeys.forEach(key => {
        const stored = localStorage.getItem(`googleDrive_${key}`);
        if (stored) {
          console.log(`🧹 Removing legacy setting: ${key}`);
          localStorage.removeItem(`googleDrive_${key}`);
        }
      });

      service.updateSettings(settingsUpdate);
      
      // After saving settings, automatically load the library data
      try {
        message.loading('Loading library data...', 1);
        const result = await dispatch(loadFullLibrary() as any);
        
        if (loadFullLibrary.fulfilled.match(result)) {
          message.success(`${displayLabel} library settings saved and data loaded successfully`);
        } else {
          message.warning(`${displayLabel} library settings saved, but failed to load data: ${result.payload}`);
        }
      } catch (loadError) {
        console.warn('Failed to load library after saving settings:', loadError);
        message.warning(`${displayLabel} library settings saved, but failed to load data`);
      }
      
      // Call onSave callback if provided
      if (onSave) {
        onSave({
          fileName: values.fileName,
          folderPath: values.folderPath
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={`${displayLabel} Library Settings`}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          Save Settings
        </Button>
      ]}
      width={600}
    >
      <Alert
        message="Configure Google Drive Library Location"
        description={`Specify where your ${displayLabel.toLowerCase()} library JSON file should be stored in Google Drive.`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical">
        <Form.Item
          label="Library File Name"
          name="fileName"
          rules={[
            { required: true, message: 'Please enter a file name' },
            { pattern: /^[^/\\:*?"<>|]+\.json$/, message: 'File name must end with .json and not contain special characters' }
          ]}
          tooltip="The name of your library JSON file in Google Drive"
        >
          <Input
            prefix={<FileOutlined />}
            placeholder={`${jsonKey}-library.json`}
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          label="Folder Path"
          name="folderPath"
          rules={[
            { required: true, message: 'Please enter a folder path' },
            { pattern: /^\/.*/, message: 'Folder path must start with /' }
          ]}
          tooltip="The folder path in Google Drive (use / for root folder)"
        >
          <Input
            prefix={<FolderOutlined />}
            placeholder="/"
            autoComplete="off"
          />
        </Form.Item>
      </Form>

      <Alert
        message="Note"
        description="If the file doesn't exist at this location, it will be created automatically when you save data."
        type="warning"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default LibrarySettingsModal;
