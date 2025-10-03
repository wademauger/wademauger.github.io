import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import GoogleDriveServiceModern from '../../apps/songs/services/GoogleDriveServiceModern';
import { mergeEntityIntoLibrary } from '../../utils/mergeEntityIntoLibrary';
import type { SaveAsModalProps } from './types';

/**
 * SaveAsModal - Reusable modal for saving entities to a library JSON file
 * 
 * This modal prompts for a name, then saves the entity to the appropriate
 * key in the library JSON file on Google Drive.
 * 
 * @example
 * <SaveAsModal
 *   visible={showSaveAs}
 *   jsonKey="panels"
 *   displayLabel="Panel"
 *   entityData={currentPanel}
 *   onSave={async (name, panel) => {
 *     console.log('Saving panel:', name, panel);
 *   }}
 *   onClose={() => setShowSaveAs(false)}
 * />
 */
export const SaveAsModal = <T extends Record<string, any> = any>({
  visible,
  jsonKey,
  displayLabel,
  entityData,
  onSave,
  onClose
}: SaveAsModalProps<T>) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [service] = useState(() => GoogleDriveServiceModern);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const entityName = values.name.trim();

      // Try to restore session if not already signed in
      if (!service.isSignedIn && service.restoreSession) {
        console.log('📚 SaveAsModal: Attempting to restore session...');
        service.restoreSession();
      }

      const isAuthenticated = service.isSignedIn && service.accessToken;
      console.log('📚 SaveAsModal: Auth check:', {
        isSignedIn: service.isSignedIn,
        hasToken: !!service.accessToken,
        isAuthenticated
      });

      if (!isAuthenticated) {
        message.error('Not signed in to Google Drive. Please sign in first.');
        setLoading(false);
        return;
      }

      // Get library file settings
      const settings = service.getSettings();
      const fileName = settings[`${jsonKey}LibraryFile`] || `${jsonKey}-library.json`;
      const folderPath = settings[`${jsonKey}Folder`] || '/';
      const fullPath = folderPath === '/' ? `/${fileName}` : `${folderPath}/${fileName}`;

      console.log(`📚 SaveAsModal (${jsonKey}): Saving "${entityName}" to: ${fullPath}`);

      // Find or create the library file
      let fileId: string | null = null;
      const fileResult = await service.findFile(fileName, folderPath);

      if (fileResult.found) {
        fileId = fileResult.fileId;
        console.log('📚 SaveAsModal: Library file found:', fileId);
      } else {
        console.log('📚 SaveAsModal: Library file not found, creating new file...');
        const newFileResult = await service.createNewLibrary(fileName, folderPath);
        fileId = newFileResult.fileId;
        console.log('📚 SaveAsModal: New library file created:', fileId);
      }

      if (!fileId) {
        throw new Error('Failed to find or create library file');
      }

      // Load current library data
      let currentLibrary;
      try {
        currentLibrary = await service.loadLibraryById(fileId);
        console.log('📚 SaveAsModal: Loaded current library:', currentLibrary);
      } catch (err) {
        console.warn('📚 SaveAsModal: Could not load library, starting fresh:', err);
        currentLibrary = {};
      }

      // Merge entity into library
      const updatedLibrary = mergeEntityIntoLibrary(
        currentLibrary,
        jsonKey,
        entityName,
        entityData
      );

      console.log('📚 SaveAsModal: Merged library:', {
        [jsonKey]: Object.keys(updatedLibrary[jsonKey] || {})
      });

      // Save library back to file
      await service.saveLibraryToFile(fileId, updatedLibrary);
      
      console.log(`📚 SaveAsModal: Successfully saved ${displayLabel}: "${entityName}"`);
      message.success(`${displayLabel} "${entityName}" saved successfully`);

      // Call parent's onSave callback
      await onSave(entityName, entityData);

      // Reset form and close
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error('📚 SaveAsModal: Error saving:', error);
      message.error(error.message || `Failed to save ${displayLabel.toLowerCase()}`);
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
      title={`Save ${displayLabel} As`}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSave}
        >
          Save
        </Button>
      ]}
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label={`${displayLabel} Name`}
          name="name"
          rules={[
            { required: true, message: `Please enter a ${displayLabel.toLowerCase()} name` },
            { min: 1, message: 'Name must be at least 1 character' },
            { max: 100, message: 'Name must be less than 100 characters' }
          ]}
          tooltip={`Choose a unique name for this ${displayLabel.toLowerCase()}`}
        >
          <Input
            placeholder={`Enter ${displayLabel.toLowerCase()} name`}
            autoFocus
            autoComplete="off"
            onPressEnter={() => handleSave()}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SaveAsModal;
