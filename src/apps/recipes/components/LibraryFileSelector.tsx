import React, { useState, useEffect } from 'react';
import { Modal, List, Button, Typography, Tag, Space, Spin, Alert } from 'antd';
import { FolderOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LibraryFileSelector = ({ 
  isVisible, 
  onClose, 
  onSelectFile, 
  driveService, 
  isLoading = false 
}) => {
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load available library files when modal opens
  useEffect(() => {
    if (isVisible && driveService) {
      loadLibraryFiles();
    }
  }, [isVisible, driveService]);

  const loadLibraryFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const files = await driveService.searchForLibraryFiles();
      setLibraryFiles(files);
    } catch (error: unknown) {
      console.error('Failed to load library files:', error);
      setError('Failed to load library files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (file) => {
    onSelectFile(file);
    onClose();
  };

  const renderFileItem = (file) => {
    const recipeCountText = typeof file.recipeCount === 'number' 
      ? `${file.recipeCount} recipe${file.recipeCount !== 1 ? 's' : ''}` 
      : 'Unknown recipes';

    return (
      <List.Item
        key={file.id}
        actions={[
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleSelectFile(file)}
            disabled={isLoading}
          >
            Select
          </Button>
        ]}
      >
        <List.Item.Meta
          avatar={<FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
          title={
            <Space>
              <Text strong>{file.name}</Text>
              <Tag color="blue">{recipeCountText}</Tag>
            </Space>
          }
          description={
            <Space direction="vertical" size="small">
              <Space>
                <FolderOutlined />
                <Text type="secondary">{file.folderPath}</Text>
              </Space>
              <Space>
                <CalendarOutlined />
                <Text type="secondary">Modified: {file.lastModified}</Text>
              </Space>
              <Space>
                <Text type="secondary">Size: {file.fileSize}</Text>
              </Space>
            </Space>
          }
        />
      </List.Item>
    );
  };

  return (
    <Modal
      title="Select Recipe Library File"
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>
      ]}
      width={700}
    >
      <div>
        <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
          Multiple recipe library files were found in your Google Drive. 
          Please select which one you'd like to use:
        </Text>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={loadLibraryFiles}>
                Retry
              </Button>
            }
          />
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Loading library files...</Text>
            </div>
          </div>
        ) : libraryFiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">No library files found</Text>
          </div>
        ) : (
          <List
            dataSource={libraryFiles}
            renderItem={renderFileItem}
            size="large"
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          />
        )}
      </div>
    </Modal>
  );
};

export default LibraryFileSelector;