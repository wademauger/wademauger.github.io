import React, { useState, useEffect } from 'react';
import { Modal, List, Spin, Alert, Button, Empty, Typography } from 'antd';
import { FolderOpenOutlined, SettingOutlined } from '@ant-design/icons';
import GoogleDriveServiceModern from '../../apps/songs/services/GoogleDriveServiceModern';
import type { OpenModalProps, LibraryEntity } from './types';

const { Text } = Typography;

/**
 * OpenModal - Reusable modal for opening entities from a library JSON file
 * 
 * This modal loads a library JSON file from Google Drive, extracts entities
 * from the specified jsonKey, and displays them in a list for selection.
 * 
 * @example
 * <OpenModal
 *   visible={showOpen}
 *   jsonKey="panels"
 *   displayLabel="Panel"
 *   onOpen={(panel) => loadPanel(panel)}
 *   onClose={() => setShowOpen(false)}
 * />
 */
export const OpenModal = <T extends LibraryEntity = LibraryEntity>({
  visible,
  jsonKey,
  displayLabel,
  onOpen,
  onClose,
  settingsKey
}: OpenModalProps<T>) => {
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [libraryPath, setLibraryPath] = useState<string>('');
  const [service] = useState(() => GoogleDriveServiceModern);

  useEffect(() => {
    if (visible) {
      loadEntities();
    } else {
      // Reset state when modal closes
      setEntities([]);
      setError(null);
    }
  }, [visible, jsonKey]);

  const loadEntities = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to restore session if not already signed in
      if (!service.isSignedIn && service.restoreSession) {
        console.log('📚 OpenModal: Attempting to restore session...');
        service.restoreSession();
      }

      const isAuthenticated = service.isSignedIn && service.accessToken;
      console.log('📚 OpenModal: Auth check:', {
        isSignedIn: service.isSignedIn,
        hasToken: !!service.accessToken,
        isAuthenticated
      });

      if (!isAuthenticated) {
        setError('Not signed in to Google Drive. Please sign in to access your library.');
        setLoading(false);
        return;
      }

      // Get library file settings - use settingsKey if provided, otherwise use jsonKey
      const keyForSettings = settingsKey || jsonKey;
      let fileName: string | undefined;
      let folderPath: string | undefined;

      try {
        if (typeof service.getLibraryFilename === 'function') {
          fileName = service.getLibraryFilename();
        }
        if (typeof service.getLibraryFolder === 'function') {
          folderPath = service.getLibraryFolder();
        }
      } catch (e) { /* ignore and fallback */ }

      // Fallback to legacy per-jsonKey settings if unified methods not present
      if (!fileName || !folderPath) {
        const settings: any = typeof service.getSettings === 'function' ? service.getSettings() : {};
        fileName = fileName || settings[`${keyForSettings}LibraryFile`] || `library.json`;
        folderPath = folderPath || settings[`${keyForSettings}Folder`] || '/';
      }

      const fullPath = folderPath === '/' ? `/${fileName}` : `${folderPath}/${fileName}`;
      setLibraryPath(fullPath);
      console.log(`📚 OpenModal (${jsonKey}): Loading from: ${fullPath}`, {
        settingsKey: keyForSettings,
        fileName,
        folderPath
      });

      // Find and load the library file
      const fileResult = await service.findFile(fileName, folderPath);
      
      if (!fileResult.found) {
        setError(`Library file not found: ${fullPath}\n\nPlease save some ${displayLabel.toLowerCase()}s first or check your library settings.`);
        setLoading(false);
        return;
      }

      console.log('📚 OpenModal: File found:', fileResult);

      // Load library data
      const libraryData = await service.loadLibraryById(fileResult.fileId);
      console.log('📚 OpenModal: Library data loaded:', libraryData);

      // Extract entities from the specified key
      let entitiesData = libraryData[jsonKey];

      if (!entitiesData) {
        setError(`No ${displayLabel.toLowerCase()}s found in library.\n\nThe library file exists but contains no "${jsonKey}" data.`);
        setLoading(false);
        return;
      }

      // Convert to array if it's an object (support both formats)
      let entitiesArray: T[];
      if (Array.isArray(entitiesData)) {
        entitiesArray = entitiesData;
      } else if (typeof entitiesData === 'object') {
        // Convert object to array, preserving keys as id
        entitiesArray = Object.entries(entitiesData).map(([key, value]: [string, any]) => ({
          id: key,
          name: value.name || key,
          ...value
        })) as T[];
      } else {
        setError(`Invalid ${displayLabel.toLowerCase()} data format in library.`);
        setLoading(false);
        return;
      }

      console.log(`📚 OpenModal: Loaded ${entitiesArray.length} ${displayLabel.toLowerCase()}s`);
      setEntities(entitiesArray);
    } catch (err: any) {
      console.error('📚 OpenModal: Error loading entities:', err);
      setError(err.message || 'Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEntity = (entity: T) => {
    console.log(`📚 OpenModal: Selected ${displayLabel}:`, entity);
    onOpen(entity);
    onClose();
  };

  const handleOpenSettings = () => {
    // This would need to be passed as a prop or handled by parent
    console.log('Open settings clicked - parent should handle this');
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={`Open ${displayLabel} from Library`}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>
      ]}
      width={600}
    >
      {libraryPath && (
        <Alert
          message={`Loading from: ${libraryPath}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="link" icon={<SettingOutlined />} onClick={handleOpenSettings}>
              Settings
            </Button>
          }
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading {displayLabel.toLowerCase()}s...</Text>
          </div>
        </div>
      ) : entities.length === 0 && !error ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`No ${displayLabel.toLowerCase()}s found`}
        />
      ) : (
        <List
          dataSource={entities}
          renderItem={(entity: T) => (
            <List.Item
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => handleSelectEntity(entity)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <List.Item.Meta
                avatar={<FolderOpenOutlined style={{ fontSize: 20 }} />}
                title={entity.name}
                description={entity.id ? `ID: ${entity.id}` : undefined}
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default OpenModal;
