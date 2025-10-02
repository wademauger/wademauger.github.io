import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Form, Input, Button, Space, Typography, Alert, Card, Spin, message, Select } from 'antd';
import { FileOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined, PlusOutlined, ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import { closeModal, selectCurrentModal, selectModalData, selectAppContext, MODAL_TYPES } from '../reducers/modal.reducer';
import { setLibrary } from '../store/songsSlice';
import { setDriveRecipes } from '../reducers/recipes.reducer';
import GoogleDriveServiceModern from '../apps/songs/services/GoogleDriveServiceModern';
import GoogleDriveRecipeService from '../apps/recipes/services/GoogleDriveRecipeService';

const { Title } = Typography;

const LibrarySettingsModal = () => {
  const dispatch = useDispatch();
  const currentModal = useSelector(selectCurrentModal);
  const modalData = useSelector(selectModalData);
  const appContext = useSelector(selectAppContext);
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [fileStatus, setFileStatus] = useState(null);
  const [lastSearchSettings, setLastSearchSettings] = useState(null);
  const [folderOptions, setFolderOptions] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  // Check if this modal should be visible
  const isVisible = currentModal === MODAL_TYPES.LIBRARY_SETTINGS;
  

  // Get the appropriate service based on app context
  const getService = () => {
    if (appContext === 'songs') {
      return GoogleDriveServiceModern;
    } else if (appContext === 'recipes') {
      return GoogleDriveRecipeService;
    } else if (appContext === 'panels') {
      // Reuse the generic Google Drive service for panels
      return GoogleDriveServiceModern;
    }
    return null;
  };

  // Default settings based on app context
  const getDefaultSettings = () => {
    if (appContext === 'songs') {
      return {
        songsLibraryFile: 'song-tabs-library.json',
        songsFolder: '/',
        ...modalData?.currentSettings
      };
    } else if (appContext === 'recipes') {
      return {
        recipesLibraryFile: 'recipe-library.json',
        recipesFolder: '/',
        ...modalData?.currentSettings
      };
    } else if (appContext === 'panels') {
      return {
        panelsLibraryFile: 'panels-library.json',
        panelsFolder: '/',
        ...modalData?.currentSettings
      };
    }
    return {};
  };

  // Helper to extract fileName and folderPath from form or provided settings depending on appContext
  const resolveFileAndFolder = (settings = null) => {
    const s = settings || form.getFieldsValue() || {};
    let fileName;
    let folderPath;
    if (appContext === 'songs') {
      fileName = s.songsLibraryFile;
      folderPath = s.songsFolder;
    } else if (appContext === 'recipes') {
      fileName = s.recipesLibraryFile;
      folderPath = s.recipesFolder;
    } else if (appContext === 'panels') {
      fileName = s.panelsLibraryFile;
      folderPath = s.panelsFolder;
    }

    // Fallback to defaults if still undefined
    const defaults = getDefaultSettings();
    fileName = fileName || defaults.songsLibraryFile || defaults.recipesLibraryFile || defaults.panelsLibraryFile;
    folderPath = folderPath || defaults.songsFolder || defaults.recipesFolder || defaults.panelsFolder || '/';

    return { fileName, folderPath };
  };

  useEffect(() => {
    if (isVisible && modalData) {
      console.log(`🎵 LibrarySettingsModal (${appContext}): Loading with preferences:`, modalData);
      // Debug: show whether callback id is present on modalData
      console.log('LibrarySettingsModal: modalData.onSelectFileCallbackId =', modalData && modalData.onSelectFileCallbackId);
      
      const service = getService();
      if (service) {
        // Load user preferences from the appropriate service
        const userPreferences = service.getUserPreferences ? service.getUserPreferences() : {};
        const settingsToUse = {
          ...getDefaultSettings(),
          ...userPreferences,
          // Include current demo recipes state for recipes app
          ...(appContext === 'recipes' && modalData?.showDemoRecipes !== undefined && {
            showDemoRecipes: modalData.showDemoRecipes
          })
        };
        
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
    }
  }, [isVisible, modalData, appContext]);
  

  const loadFolderSuggestions = async () => {
    const service = getService();
    if (!service) return;

    try {
      setLoadingFolders(true);
      console.log(`🔍 LibrarySettingsModal (${appContext}): Loading folder suggestions...`);
      console.log(`🔍 ${service.constructor.name} auth status:`, {
        isSignedIn: service.isSignedIn,
        hasToken: !!service.accessToken,
        userEmail: service.userEmail
      });

      const suggestions = await service.getFolderSuggestions();
      console.log(`🔍 LibrarySettingsModal (${appContext}): Received folder suggestions:`, suggestions);
      setFolderOptions(suggestions);
    } catch (error: unknown) {
      console.error('Error loading folder suggestions:', error);
      // Return at least the root folder option if there's an error
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
    const service = getService();
    if (!service) return;

    const { fileName, folderPath } = resolveFileAndFolder(settings);
    const searchSettings = { fileName, folderPath };
    
    if (!fileName) {
      return;
    }

    try {
      setSearching(true);
      console.log(`🔍 LibrarySettingsModal (${appContext}): Searching for file:`, fileName, 'in folder:', folderPath);
      
      // Use the appropriate service to search for the file
      const result = await service.findFile(fileName, folderPath);
      console.log(`🔍 LibrarySettingsModal (${appContext}): Search result:`, result);
      
      setFileStatus(result);
      setLastSearchSettings(searchSettings);
    } catch (error: unknown) {
      console.error('Error searching for file:', error);
      setFileStatus({
        found: false,
        fileName: fileName,
        folderPath: folderPath,
        error: error.message
      });
    } finally {
      setSearching(false);
    }
  };

  const handleFormChange = () => {
    // Debounce search when form values change
    const searchTimeout = setTimeout(() => {
      searchForFile();
    }, 1000); // 1 second debounce

    return () => clearTimeout(searchTimeout);
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleLoadExisting = async () => {
    const service = getService();
    if (!service || !fileStatus?.found) return;

    try {
      setLoading(true);
      
      let libraryData;
      if (fileStatus.fileId) {
        // Load by file ID and update settings to match this file's location
        libraryData = await service.loadLibraryById(fileStatus.fileId);
        
        // Update the form and settings to match the loaded file's location
        const updatedSettings = {
          ...form.getFieldsValue(),
          [appContext === 'songs' ? 'songsLibraryFile' : 'recipesLibraryFile']: fileStatus.fileName,
          [appContext === 'songs' ? 'songsFolder' : 'recipesFolder']: fileStatus.currentLocation
        };
        
        // Update form values
        form.setFieldsValue(updatedSettings);
        
        // Save settings to service
        if (service.updateSettings) {
          service.updateSettings(updatedSettings);
        }
        
        // Also save as user preferences for recipes
        if (appContext === 'recipes' && service.saveUserPreferences) {
          service.saveUserPreferences({
            recipesLibraryFile: fileStatus.fileName,
            recipesFolder: fileStatus.currentLocation,
            selectedFileId: fileStatus.fileId
          });
        }
      } else {
        // Load by default method
        libraryData = await service.loadLibraryData();
      }
      
      // If panels appContext, call any provided callback to hand data back to caller
      if (appContext === 'panels') {
        try {
          // The modal_data will hold a callback id which refers to a function in a separate registry
          const cbId = modalData && modalData.onSelectFileCallbackId;
          if (cbId) {
            const { getCallback, removeCallback } = await import('@/utils/modalCallbackRegistry');
            const cb = getCallback(cbId);
            if (cb) {
              const selectedSettings = form.getFieldsValue();
              await cb({ libraryData, fileStatus, selectedSettings });
              message.success('Panel library loaded and handed to caller');
            } else {
              console.warn('Callback not found for id', cbId);
              message.error('Failed to deliver panel data to caller (callback missing)');
            }
            // Clean up the callback after invocation
            removeCallback(cbId);
          } else {
            message.error('No callback configured to receive panel library');
          }
        } catch (cbErr: unknown) {
          console.error('Error invoking panel callback:', cbErr);
          message.error('Failed to hand panel data to caller');
        }
        handleClose();
        return;
      }

      // Update Redux store with loaded data for songs/recipes
      if (appContext === 'songs') {
        dispatch(setLibrary(libraryData));
      } else if (appContext === 'recipes') {
        dispatch(setDriveRecipes(libraryData.recipes || []));
      }
      
      message.success(`${appContext === 'songs' ? 'Song' : 'Recipe'} library loaded successfully`);
      handleClose();
    } catch (error: unknown) {
      console.error('Error loading existing library:', error);
      message.error(`Failed to load ${appContext === 'songs' ? 'song' : 'recipe'} library: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    const service = getService();
    if (!service) return;

    const settings = form.getFieldsValue();
    const { fileName, folderPath } = resolveFileAndFolder(settings);

    try {
      setLoading(true);
  await service.createNewLibrary(fileName, folderPath);
      message.success(`New ${appContext === 'songs' ? 'song' : 'recipe'} library created successfully`);
      
      // Refresh search to show the new file
      await searchForFile();
    } catch (error: unknown) {
      console.error('Error creating new library:', error);
      message.error(`Failed to create new ${appContext === 'songs' ? 'song' : 'recipe'} library: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    const service = getService();
    if (!service) return;

    const settings = form.getFieldsValue();
    
    try {
      // Save to localStorage for user preferences
      const userInfo = modalData?.userInfo;
      const storageKey = `googleDriveSettings_${userInfo?.email || 'default'}`;
      const userPreferences = {
        ...settings,
        userEmail: userInfo?.email,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(userPreferences));
      
      // Also save via service if available
      if (service.saveUserPreferences) {
        service.saveUserPreferences(userPreferences);
      }
      
      message.success('Settings saved successfully');
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    }
  };

  // When the modal is used as a Save As dialog for other apps (panels),
  // invoke the registered callback with the chosen file (existing or newly created).
  const handleSaveHere = async () => {
    const service = getService();
    if (!service) return;

    try {
      setLoading(true);

      // If we have a selected existing file with an ID, load it and invoke the callback
      if (fileStatus?.found && fileStatus.fileId) {
        const libraryData = await service.loadLibraryById(fileStatus.fileId);
        const cbId = modalData && modalData.onSelectFileCallbackId;
        if (cbId) {
          const { getCallback, removeCallback } = await import('@/utils/modalCallbackRegistry');
          const cb = getCallback(cbId);
          if (cb) {
            await cb({ libraryData, fileStatus });
            message.success('Saved to selected library');
          } else {
            console.warn('Callback not found for id', cbId);
            message.error('Failed to deliver data to caller (callback missing)');
          }
          removeCallback(cbId);
        } else {
          message.error('No callback configured to receive panel library');
        }

        handleClose();
        return;
      }

      // Otherwise, create a new library then load/locate it and invoke the callback
  const settings = form.getFieldsValue();
  const { fileName, folderPath } = resolveFileAndFolder(settings);

  await service.createNewLibrary(fileName, folderPath);

      // Try to find the newly created library file
      let saved = null;
      try {
        if (service.findLibraryFile) {
          saved = await service.findLibraryFile();
        }
      } catch (e: unknown) {
        console.warn('findLibraryFile failed after createNewLibrary', e);
      }

      let libraryData = null;
      let finalFileStatus = fileStatus;
      if (saved && (saved.id || saved.fileId)) {
        const id = saved.id || saved.fileId;
        libraryData = await service.loadLibraryById(id);
        finalFileStatus = { found: true, fileId: id, fileName: saved.name || fileName, currentLocation: folderPath };
      } else {
        // Fallback to loading via generic method
        try {
          libraryData = await service.loadLibraryData();
        } catch (e: unknown) {
          console.warn('Could not load library data after create', e);
        }
      }

      const cbId = modalData && modalData.onSelectFileCallbackId;
      if (cbId) {
        const { getCallback, removeCallback } = await import('@/utils/modalCallbackRegistry');
        const cb = getCallback(cbId);
        if (cb) {
          await cb({ libraryData, fileStatus: finalFileStatus });
          message.success('Saved to new library');
        } else {
          console.warn('Callback not found for id', cbId);
          message.error('Failed to deliver data to caller (callback missing)');
        }
        removeCallback(cbId);
      } else {
        message.error('No callback configured to receive panel library');
      }

      handleClose();
    } catch (error: unknown) {
      console.error('Error saving here:', error);
      message.error(`Failed to save: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSettings = () => {
    const service = getService();
    if (!service) return;

    if (service.clearUserPreferences) {
      service.clearUserPreferences();
    }
    
    // Reset form to defaults
    form.setFieldsValue(getDefaultSettings());
    setFileStatus(null);
    setLastSearchSettings(null);
    
    message.success('Settings cleared');
  };

  if (!isVisible || !appContext) {
    return null;
  }

  // Temporary visual debug: show an Alert at top of modal when visible so it's impossible to miss
  const debugAlert = (
    <Alert
      type="info"
      message={
        <div>
          <div><strong>DEBUG:</strong> LibrarySettingsModal is visible for appContext: {String(appContext)}</div>
          <div>callbackId: {modalData && modalData.onSelectFileCallbackId ? modalData.onSelectFileCallbackId : 'none'}</div>
        </div>
      }
      style={{ marginBottom: 12 }}
    />
  );

  const appName = appContext === 'songs' ? 'Song' : 'Recipe';
  const fileFieldName = appContext === 'songs' ? 'songsLibraryFile' : 'recipesLibraryFile';
  const folderFieldName = appContext === 'songs' ? 'songsFolder' : 'recipesFolder';

  return (
    <Modal
      title={
        <Space>
          <FileOutlined />
          {appName} Library Manager
        </Space>
      }
      open={isVisible}
      onCancel={handleClose}
      width={600}
      footer={
        modalData && modalData.onSelectFileCallbackId ? [
          <Button key="cancel" onClick={handleClose}>
            Cancel
          </Button>,
          <Button key="clear" onClick={handleClearSettings}>
            Clear Settings
          </Button>,
          <Button key="saveHere" type="primary" onClick={handleSaveHere} loading={loading}>
            Save Here
          </Button>
        ] : [
          <Button key="cancel" onClick={handleClose}>
            Cancel
          </Button>,
          <Button key="clear" onClick={handleClearSettings}>
            Clear Settings
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        ]
      }
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {debugAlert}
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFormChange}
        >
          <Form.Item
            label={`${appName} Library Filename`}
            name={fileFieldName}
            rules={[{ required: true, message: 'Please enter a filename' }]}
          >
            <Input 
              placeholder={`${appContext}-library.json`}
              suffix={
                <Button 
                  type="text" 
                  icon={<SearchOutlined />} 
                  loading={searching}
                  onClick={() => searchForFile()}
                  size="small"
                />
              }
            />
          </Form.Item>

          <Form.Item
            label="Google Drive Folder"
            name={folderFieldName}
          >
            <Select
              placeholder="Select or type folder path"
              loading={loadingFolders}
              showSearch
              allowClear
              options={folderOptions}
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div style={{ padding: '4px 8px', borderTop: '1px solid #f0f0f0', fontSize: '12px', color: '#666' }}>
                    💡 Tip: Type a custom path like "/MyFolder/Subfolder"
                  </div>
                </div>
              )}
            />
          </Form.Item>

          {/* Demo Recipes Toggle - only for recipes app */}
          {appContext === 'recipes' && (
            <Form.Item
              label="Display Options"
              name="showDemoRecipes"
              valuePropName="checked"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  type="info"
                  showIcon
                  message="Demo Recipe Visibility"
                  description="Toggle whether to show built-in demo recipes alongside your Google Drive recipes."
                  style={{ marginBottom: 8 }}
                />
                <Button
                  type={form.getFieldValue('showDemoRecipes') !== false ? 'primary' : 'default'}
                  icon={form.getFieldValue('showDemoRecipes') !== false ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                  onClick={() => {
                    const currentValue = form.getFieldValue('showDemoRecipes');
                    const newValue = currentValue === false;
                    form.setFieldsValue({ showDemoRecipes: newValue });
                    
                    // Call the callback to update parent component immediately
                    if (modalData?.onDemoRecipesToggle) {
                      modalData.onDemoRecipesToggle(newValue);
                    }
                  }}
                  block
                >
                  {form.getFieldValue('showDemoRecipes') !== false ? 'Hide Demo Recipes' : 'Show Demo Recipes'}
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>

        {/* File Status Display */}
        {(lastSearchSettings && !searching) && (
          <Card size="small" style={{ marginTop: 16 }}>
            <Title level={5}>
              <SearchOutlined /> Search Results
            </Title>
            
            {fileStatus?.found ? (
              <Alert
                type="success"
                icon={<CheckCircleOutlined />}
                message={`Found: ${fileStatus.fileName}`}
                description={
                  <div>
                    <p><strong>Location:</strong> {fileStatus.currentLocation}</p>
                    {fileStatus.differentLocation && (
                      <p style={{ color: '#faad14' }}>
                        ⚠️ File found in different location than specified
                      </p>
                    )}
                    <Space style={{ marginTop: 8 }}>
                      <Button
                        type="primary"
                        icon={<ArrowRightOutlined />}
                        onClick={handleLoadExisting}
                        loading={loading}
                        size="small"
                      >
                        Load This Library
                      </Button>
                    </Space>
                  </div>
                }
              />
            ) : (
              <Alert
                type="warning"
                icon={<ExclamationCircleOutlined />}
                message={`File not found: ${lastSearchSettings[fileFieldName]}`}
                description={
                  <div>
                    <p>The specified {appContext} library file doesn't exist in your Google Drive.</p>
                    <Space style={{ marginTop: 8 }}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateNew}
                        loading={loading}
                        size="small"
                      >
                        Create New Library
                      </Button>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => searchForFile()}
                        loading={searching}
                        size="small"
                      >
                        Search Again
                      </Button>
                    </Space>
                  </div>
                }
              />
            )}
          </Card>
        )}

        {searching && (
          <Card size="small" style={{ marginTop: 16 }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
              <p style={{ marginTop: 8 }}>Searching Google Drive...</p>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default LibrarySettingsModal;