import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Typography, Alert, Card, Spin, message, Select } from 'antd';
import { FileOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined, PlusOutlined, ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import GoogleDriveRecipeService from '../apps/recipes/services/GoogleDriveRecipeService';

const { Text, Paragraph } = Typography;

const RecipeLibraryModal = ({ 
  visible, 
  onClose, 
  userInfo = null,
  currentSettings = {}
}) => {
  console.log('🍽️ RecipeLibraryModal: Component called with visible:', visible);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [fileStatus, setFileStatus] = useState(null);
  const [lastSearchSettings, setLastSearchSettings] = useState(null);
  const [folderOptions, setFolderOptions] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  // Default settings for recipes
  const defaultSettings = {
    recipesLibraryFile: 'recipe-library.json',
    recipesFolder: '/',
    ...currentSettings
  };

  useEffect(() => {
    console.log('🍽️ RecipeLibraryModal: visible prop changed to:', visible);
    if (visible) {
      console.log('🍽️ RecipeLibraryModal: Modal is opening...');
      // Load user preferences first, then fallback to default settings
      const userPreferences = GoogleDriveRecipeService.getUserPreferences();
      const settingsToUse = {
        ...defaultSettings,
        ...userPreferences
      };
      
      console.log('🍽️ RecipeLibraryModal: Loading with preferences:', settingsToUse);
      
      form.setFieldsValue(settingsToUse);
      setFileStatus(null);
      setLastSearchSettings(null);
      // Load folder suggestions when modal opens
      loadFolderSuggestions();
      // Automatically search when modal opens
      setTimeout(() => {
        searchForFile(settingsToUse);
      }, 500);
    }
  }, [visible, currentSettings]);

  // Watch form changes and auto-search
  const handleFormChange = () => {
    const currentValues = form.getFieldsValue();
    if (currentValues.recipesLibraryFile && currentValues.recipesFolder) {
      // Debounce the search
      clearTimeout(window.recipeSearchTimeout);
      window.recipeSearchTimeout = setTimeout(() => {
        searchForFile(currentValues);
      }, 1000);
    }
  };

  const loadFolderSuggestions = async () => {
    setLoadingFolders(true);
    try {
      // Use the singleton instance instead of creating a new one
      const suggestions = await GoogleDriveRecipeService.getFolderSuggestions();
      setFolderOptions(suggestions);
    } catch (error) {
      console.error('Error loading folder suggestions:', error);
      
      // Check if it's a scope/permission error
      if (error.message && error.message.includes('insufficient authentication scopes')) {
        message.warning('Additional permissions needed. Please sign out and sign in again to browse folders.');
      }
      
      // Set default root folder option if loading fails
      setFolderOptions([
        {
          value: '/',
          label: '/ (Root folder)',
          key: 'root'
        }
      ]);
    } finally {
      setLoadingFolders(false);
    }
  };

  const searchForFile = async (settings = null) => {
    const searchSettings = settings || form.getFieldsValue();
    
    if (!searchSettings.recipesLibraryFile || !searchSettings.recipesFolder) {
      return;
    }

    setSearching(true);
    setLastSearchSettings(searchSettings);

    try {
      // Use the GoogleDriveRecipeService to search for the file
      const result = await GoogleDriveRecipeService.findFile(
        searchSettings.recipesLibraryFile,
        searchSettings.recipesFolder
      );

      setFileStatus({
        found: result.found,
        fileId: result.fileId,
        fileName: searchSettings.recipesLibraryFile,
        folderPath: searchSettings.recipesFolder,
        currentLocation: result.currentLocation,
        error: result.error
      });

    } catch (error) {
      console.error('Error searching for file:', error);
      setFileStatus({
        found: false,
        fileName: searchSettings.recipesLibraryFile,
        folderPath: searchSettings.recipesFolder,
        error: `Search failed: ${error.message}`
      });
    } finally {
      setSearching(false);
    }
  };

  const handleLoadExisting = async () => {
    if (!fileStatus?.found) return;

    setLoading(true);
    try {
      // Save settings FIRST so the service knows what file to load
      await saveSettings();
      
      // Load the library data using the specific file ID if available
      if (fileStatus.fileId) {
        await GoogleDriveRecipeService.loadLibraryById(fileStatus.fileId);
      } else {
        // Fallback to regular load if no fileId
        await GoogleDriveRecipeService.loadLibraryData();
      }
      
      message.success('Recipe library loaded successfully!');
      onClose();
    } catch (error) {
      console.error('Error loading library:', error);
      message.error('Failed to load recipe library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    setLoading(true);
    try {
      const settings = form.getFieldsValue();
      
      // Create new library file
      await GoogleDriveRecipeService.createNewLibrary(settings.recipesLibraryFile, settings.recipesFolder);
      
      // Save settings
      await saveSettings();
      
      message.success('New recipe library created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating new library:', error);
      message.error('Failed to create new recipe library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToLocation = async () => {
    if (!fileStatus?.found) return;

    setLoading(true);
    try {
      const settings = form.getFieldsValue();
      
      // Move the file to the new location
      await GoogleDriveRecipeService.moveFile(
        fileStatus.fileId,
        settings.recipesFolder,
        settings.recipesLibraryFile
      );
      
      // Save settings
      await saveSettings();
      
      message.success('Recipe library moved successfully!');
      onClose();
    } catch (error) {
      console.error('Error moving library:', error);
      message.error('Failed to move recipe library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    const values = form.getFieldsValue();
    const settingsToSave = {
      recipesLibraryFile: values.recipesLibraryFile,
      recipesFolder: values.recipesFolder,
      userEmail: userInfo?.email,
      lastUpdated: new Date().toISOString()
    };

    // Save to localStorage with user-specific key
    const storageKey = `googleDriveSettings_${userInfo?.email || 'default'}`;
    const existingSettings = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const updatedSettings = { ...existingSettings, ...settingsToSave };
    localStorage.setItem(storageKey, JSON.stringify(updatedSettings));

    // Also save as user preferences for quick loading
    const userPreferences = {
      recipesLibraryFile: values.recipesLibraryFile,
      recipesFolder: values.recipesFolder
    };
    GoogleDriveRecipeService.saveUserPreferences(userPreferences);
    
    console.log('🍽️ Saved both settings and user preferences:', userPreferences);
  };

  const handleClearPreferences = () => {
    GoogleDriveRecipeService.clearUserPreferences();
    // Reset form to defaults
    form.setFieldsValue(defaultSettings);
    // Clear current file status
    setFileStatus(null);
    setLastSearchSettings(null);
    message.success('User preferences cleared. Form reset to defaults.');
  };

  const renderFileStatus = () => {
    if (!lastSearchSettings && !searching) return null;

    return (
      <Card 
        title={
          <Space>
            <SearchOutlined />
            File Search Results
          </Space>
        } 
        size="small" 
        style={{ marginTop: 16 }}
      >
        {searching ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Spin />
            <Text style={{ marginLeft: 8 }}>Searching for recipe library file...</Text>
          </div>
        ) : fileStatus ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {fileStatus.found ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              )}
              <Text strong>Status:</Text>
              <Text type={fileStatus.found ? 'success' : 'warning'}>
                {fileStatus.found ? 'File found!' : 'File not found'}
              </Text>
            </div>

            <div>
              <Text strong>Looking for:</Text> {fileStatus.fileName} in {fileStatus.folderPath}
            </div>

            {fileStatus.found && fileStatus.currentLocation && (
              <div>
                <Text strong>Current location:</Text> {fileStatus.currentLocation}
              </div>
            )}

            {fileStatus.error && (
              <Alert
                message={fileStatus.error}
                type="warning"
                size="small"
              />
            )}

            {/* Action buttons */}
            <div style={{ marginTop: 16 }}>
              <Space wrap>
                {fileStatus.found ? (
                  <>
                    <Button 
                      type="primary" 
                      icon={<CheckCircleOutlined />}
                      onClick={handleLoadExisting}
                      loading={loading}
                    >
                      Load Existing Library
                    </Button>
                    {fileStatus.currentLocation !== fileStatus.folderPath && (
                      <Button 
                        icon={<ArrowRightOutlined />}
                        onClick={handleMoveToLocation}
                        loading={loading}
                      >
                        Move to New Location
                      </Button>
                    )}
                  </>
                ) : (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleCreateNew}
                    loading={loading}
                  >
                    Create New Library
                  </Button>
                )}
                
                {/* Clear preferences button */}
                <Button 
                  type="text" 
                  size="small"
                  onClick={handleClearPreferences}
                  style={{ color: '#8c8c8c' }}
                >
                  Clear Saved Preferences
                </Button>
              </Space>
            </div>
          </Space>
        ) : null}
      </Card>
    );
  };

  console.log('🍽️ RecipeLibraryModal: Rendering modal with visible:', visible);

  return (
    <Modal
      title={
        <Space>
          <FileOutlined />
          Recipe Library Manager
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>
      ]}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {userInfo && (
          <Alert
            message={`Managing recipe library for: ${userInfo.name || userInfo.email}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Paragraph>
          Configure your recipe library location in Google Drive. Enter the file name and folder path, 
          and we'll automatically search for it. If found, you can load it or move it to a new location. 
          If not found, you can create a new library.
        </Paragraph>

        <Form
          form={form}
          layout="vertical"
          initialValues={defaultSettings}
          onValuesChange={handleFormChange}
        >
          <Form.Item
            label="Recipe Library File Name"
            name="recipesLibraryFile"
            rules={[
              { required: true, message: 'Please enter a file name' },
              { pattern: /^[\w\-. ]+\.json$/, message: 'File name must end with .json' }
            ]}
            extra="The JSON file where your recipe data will be stored"
          >
            <Input 
              prefix={<FileOutlined />}
              placeholder="recipe-library.json"
            />
          </Form.Item>

          <Form.Item
            label="Folder Path"
            name="recipesFolder"
            rules={[{ required: true, message: 'Please enter a folder path' }]}
            extra="The folder path in Google Drive (use '/' for root folder)"
          >
            <Select
              showSearch
              placeholder="Select or type folder path"
              optionFilterProp="label"
              loading={loadingFolders}
              notFoundContent={loadingFolders ? <Spin size="small" /> : 'No folders found'}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px', borderTop: '1px solid #d9d9d9' }}>
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        loadFolderSuggestions();
                        message.info('Refreshing folder list...');
                      }}
                      style={{ padding: 0 }}
                    >
                      Refresh folders
                    </Button>
                  </div>
                </>
              )}
              options={folderOptions}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>

        {renderFileStatus()}

        <Alert
          message="How it works"
          description={
            <ul style={{ margin: '8px 0 0 16px', paddingLeft: 0 }}>
              <li><strong>File found:</strong> You can load the existing library or move it to a new location</li>
              <li><strong>File not found:</strong> You can create a new library at the specified location</li>
              <li><strong>Auto-search:</strong> We automatically search as you type file name and path</li>
              <li><strong>Folder browsing:</strong> Select from existing Google Drive folders or type a custom path</li>
              <li><strong>Safe operations:</strong> All operations preserve your existing data</li>
            </ul>
          }
          type="info"
          style={{ marginTop: 16 }}
        />
      </div>
    </Modal>
  );
};

export default RecipeLibraryModal;