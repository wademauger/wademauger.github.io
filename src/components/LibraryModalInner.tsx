import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Form, Input, Button, Space, Typography, Alert, Card, Spin, message, Select, List } from 'antd';
import { FileOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined, PlusOutlined, ArrowRightOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { closeModal, selectCurrentModal, selectModalData, selectAppContext, MODAL_TYPES, openModal } from '../reducers/modal.reducer';
import { setLibrary } from '../store/songsSlice';
import { setDriveRecipes } from '../reducers/recipes.reducer';
import GoogleDriveServiceModern from '../apps/songs/services/GoogleDriveServiceModern';
import GoogleDriveRecipeService from '../apps/recipes/services/GoogleDriveRecipeService';

const { Title } = Typography;

interface FileStatus {
  found: boolean;
  fileName?: string;
  fileId?: string;
  currentLocation?: string;
  differentLocation?: boolean;
  error?: string;
}

const LibraryModalInner = () => {
  const dispatch = useDispatch();
  const currentModal = useSelector(selectCurrentModal);
  const modalData = useSelector(selectModalData);
  const appContext = useSelector(selectAppContext);
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [fileStatus, setFileStatus] = useState<FileStatus | null>(null);
  const [lastSearchSettings, setLastSearchSettings] = useState<any>(null);
  const [folderOptions, setFolderOptions] = useState<any[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [panelsList, setPanelsList] = useState<any[]>([]);

  // Check if this modal should be visible
  const isVisible = currentModal === MODAL_TYPES.LIBRARY_SETTINGS;

  // Determine the modal mode based on the data passed
  // Priority: Open mode > Save As mode > Settings mode
  const isOpenMode = modalData && modalData.intent === 'open';
  const isSaveAsMode = !isOpenMode && modalData && modalData.onSelectFileCallbackId;
  
  // Hide file/folder/location inputs ONLY for panels app when in Save As or Open modes
  // Always show them in Settings mode (when user clicks "Library Settings..." directly)
  const showFileInputs = appContext !== 'panels' || (!isSaveAsMode && !isOpenMode);

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
      console.log(`🎵 LibraryModalInner (${appContext}): Loading with preferences:`, modalData);
      // Debug: show whether callback id is present on modalData
      console.log('LibraryModalInner: modalData.onSelectFileCallbackId =', modalData && modalData.onSelectFileCallbackId);
      
      const service: any = getService();
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
        
        // For panels in 'open' mode, automatically load the library and show panel list
        if (appContext === 'panels' && isOpenMode) {
          setTimeout(() => {
            loadLibraryDataForFile(settingsToUse);
          }, 500);
        } else {
          // Automatically search when modal opens for other contexts
          setTimeout(() => {
            searchForFile(settingsToUse);
          }, 500);
        }
      }
    }
  }, [isVisible, modalData, appContext]);
  
  const loadFolderSuggestions = async () => {
    const service: any = getService();
    if (!service) return;

    try {
      setLoadingFolders(true);
      console.log(`🔍 LibraryModalInner (${appContext}): Loading folder suggestions...`);
      console.log(`🔍 ${service.constructor.name} auth status:`, {
        isSignedIn: service.isSignedIn,
        hasToken: !!service.accessToken,
        userEmail: service.userEmail
      });

      const suggestions = await service.getFolderSuggestions();
      console.log(`🔍 LibraryModalInner (${appContext}): Received folder suggestions:`, suggestions);
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

  const loadLibraryDataForFile = async (settings = null) => {
    const service: any = getService();
    if (!service) {
      message.error('Service not available');
      return;
    }

    console.log('📚 LibraryModalInner: Initial auth state:', {
      isSignedIn: service.isSignedIn,
      hasToken: !!service.accessToken,
      userEmail: service.userEmail,
      hasRestoreSession: typeof service.restoreSession === 'function'
    });

    // If the service exposes a richer debug method, print it for deeper insight
    try {
      if (typeof service.debugCurrentState === 'function') {
        try {
          const dbg = service.debugCurrentState();
          // Log a compact summary to avoid dumping secrets
          console.log('🔎 LibraryModalInner: service.debugCurrentState() summary =>', {
            isSignedIn: dbg.isSignedIn,
            hasAccessToken: dbg.hasAccessToken,
            accessTokenPreview: dbg.accessTokenPreview,
            userEmail: dbg.userEmail,
            gapiInited: dbg.gapiInited,
            gisInited: dbg.gisInited,
            hasTokenClient: dbg.hasTokenClient
          });
        } catch (dbgErr) {
          console.warn('LibraryModalInner: service.debugCurrentState() threw an error', dbgErr);
        }
      }
    } catch (err) {
      console.warn('LibraryModalInner: error calling debugCurrentState on service', err);
    }

    // Debug: Check what's in localStorage
    if (typeof localStorage !== 'undefined') {
      const sessionKeys = {
        ACCESS_TOKEN: 'googleDrive_accessToken',
        IS_SIGNED_IN: 'googleDrive_isSignedIn',
        USER_EMAIL: 'googleDrive_userEmail',
        TOKEN_EXPIRY: 'googleDrive_tokenExpiry'
      };
      console.log('📚 LibraryModalInner: localStorage session data:', {
        hasAccessToken: !!localStorage.getItem(sessionKeys.ACCESS_TOKEN),
        isSignedIn: localStorage.getItem(sessionKeys.IS_SIGNED_IN),
        userEmail: localStorage.getItem(sessionKeys.USER_EMAIL),
        tokenExpiry: localStorage.getItem(sessionKeys.TOKEN_EXPIRY),
        expiresIn: localStorage.getItem(sessionKeys.TOKEN_EXPIRY) 
          ? Math.floor((parseInt(localStorage.getItem(sessionKeys.TOKEN_EXPIRY)!) - Date.now()) / 60000) + ' minutes'
          : 'N/A'
      });
    }

    // Try to restore session if not already signed in
    if (!service.isSignedIn && service.restoreSession) {
      console.log('📚 LibraryModalInner: Attempting to restore session...');
      const restored = service.restoreSession();
      console.log('📚 LibraryModalInner: Session restore result:', restored);
      console.log('📚 LibraryModalInner: Auth state after restore:', {
        isSignedIn: service.isSignedIn,
        hasToken: !!service.accessToken,
        userEmail: service.userEmail
      });
    } else {
      console.log('📚 LibraryModalInner: Skipping session restore (already signed in or no restore method)');
    }

    // Check if user is signed in (check both flag and token)
    const isAuthenticated = service.isSignedIn && service.accessToken;
    console.log(`📚 LibraryModalInner: Final auth check:`, {
      isSignedIn: service.isSignedIn,
      hasToken: !!service.accessToken,
      userEmail: service.userEmail,
      isAuthenticated
    });

    if (!isAuthenticated) {
      message.warning('Please sign in to Google Drive to access your library');
      console.log('📚 LibraryModalInner: User not authenticated to Google Drive');
      console.log('📚 LibraryModalInner: Please check if you are signed in at the top right of the page');

      // Extra diagnostics: dump service state and a summary of localStorage session keys
      try {
        if (typeof service.debugCurrentState === 'function') {
          const s = service.debugCurrentState();
          console.warn('🧭 LibraryModalInner: debugCurrentState summary:', {
            isSignedIn: s.isSignedIn,
            hasAccessToken: s.hasAccessToken,
            userEmail: s.userEmail,
            gapiInited: s.gapiInited,
            gisInited: s.gisInited
          });
        } else {
          console.warn('🧭 LibraryModalInner: service.debugCurrentState not available, falling back to basic status');
          console.warn('🧭 LibraryModalInner: service basic status:', {
            isSignedIn: service.isSignedIn,
            hasToken: !!service.accessToken,
            userEmail: service.userEmail
          });
        }
      } catch (sdErr) {
        console.warn('LibraryModalInner: failed to collect service debug state', sdErr);
      }

      // Try to show client_id source (masked) to help debug missing client_id problems
      try {
        const maybeCid = (service && (service.CLIENT_ID || service.clientId || service.getClientId && service.getClientId())) || null;
        const maskedCid = maybeCid ? `${String(maybeCid).slice(0, 6)}...${String(maybeCid).slice(-4)}` : null;
        console.warn('🧾 LibraryModalInner: Detected CLIENT_ID (masked) =', maskedCid);
        if (!maybeCid) {
          console.warn('🧾 LibraryModalInner: No CLIENT_ID detected on service. If running locally, ensure VITE_GOOGLE_CLIENT_ID or equivalent env is set and the service.initialize(clientId) is called.');
        }
      } catch (cidErr) {
        console.warn('LibraryModalInner: error trying to inspect CLIENT_ID', cidErr);
      }

      setLoading(false);
      return;
    }

    const { fileName, folderPath } = resolveFileAndFolder(settings);
    
    if (!fileName) {
      console.log('📚 LibraryModalInner: No fileName specified');
      return;
    }

    try {
      setLoading(true);
      console.log(`📚 LibraryModalInner (${appContext}): Loading library data from:`, fileName, 'in folder:', folderPath);
      console.log(`📚 LibraryModalInner: Service auth status:`, {
        isSignedIn: service.isSignedIn,
        hasToken: !!service.accessToken,
        userEmail: service.userEmail
      });
      
      // First find the file
      const result = await service.findFile(fileName, folderPath);
      console.log(`📚 LibraryModalInner (${appContext}): File search result:`, result);
      
      setFileStatus(result);
      
      if (result?.found && result.fileId) {
        // Load the library data
        const libraryData = await service.loadLibraryById(result.fileId);
        console.log(`📚 LibraryModalInner (${appContext}): Loaded library data:`, libraryData);
        
        // For panels, extract the panels and convert to array if needed
        if (appContext === 'panels' && libraryData?.panels) {
          // Handle both array and object formats
          let panelsArray = [];
          if (Array.isArray(libraryData.panels)) {
            panelsArray = libraryData.panels;
          } else if (typeof libraryData.panels === 'object') {
            // Convert object to array of panels with names
            panelsArray = Object.entries(libraryData.panels).map(([name, panel]: [string, any]) => ({
              ...panel,
              name: panel.name || name,
              id: panel.id || name
            }));
          }
          console.log(`📚 LibraryModalInner: Converted panels to array:`, panelsArray);
          setPanelsList(panelsArray);
        }
      } else {
        console.log(`📚 LibraryModalInner: File not found or no fileId`);
        message.info('Library file not found. You may need to create a new library or check your library settings.');
      }
    } catch (error: unknown) {
      console.error('Error loading library data:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Check for authentication errors
      if (errorMsg.includes('not signed in') || errorMsg.includes('authentication') || errorMsg.includes('401')) {
        message.error('Authentication failed. Please sign in to Google Drive.');
      } else {
        message.error(`Failed to load library: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const searchForFile = async (settings = null) => {
    const service: any = getService();
    if (!service) return;

    const { fileName, folderPath } = resolveFileAndFolder(settings);
    const searchSettings = { fileName, folderPath };
    
    if (!fileName) {
      return;
    }

    try {
      setSearching(true);
      console.log(`🔍 LibraryModalInner (${appContext}): Searching for file:`, fileName, 'in folder:', folderPath);
      
      // Use the appropriate service to search for the file
      const result = await service.findFile(fileName, folderPath);
      console.log(`🔍 LibraryModalInner (${appContext}): Search result:`, result);
      
      setFileStatus(result);
      setLastSearchSettings(searchSettings);
    } catch (error: unknown) {
      console.error('Error searching for file:', error);
      setFileStatus({
        found: false,
        fileName: fileName,
        folderPath: folderPath,
        error: error instanceof Error ? error.message : String(error)
      } as any);
    } finally {
      setSearching(false);
    }
  };

  const handleFormChange = () => {
    // Debounce search when form values change
    const searchTimeout = setTimeout(() => {
      if (appContext === 'panels' && isOpenMode) {
        loadLibraryDataForFile();
      } else {
        searchForFile();
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(searchTimeout);
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleLoadExisting = async () => {
    const service: any = getService();
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
          [appContext === 'songs' ? 'songsLibraryFile' : appContext === 'recipes' ? 'recipesLibraryFile' : 'panelsLibraryFile']: fileStatus.fileName,
          [appContext === 'songs' ? 'songsFolder' : appContext === 'recipes' ? 'recipesFolder' : 'panelsFolder']: fileStatus.currentLocation
        };
        
        // Update form values
        form.setFieldsValue(updatedSettings);
        
        // Save settings to service
        if (service.updateSettings) {
          service.updateSettings(updatedSettings);
        }
        
        // Also save as user preferences
        if (service.saveUserPreferences) {
          const fileKey = appContext === 'songs' ? 'songsLibraryFile' : appContext === 'recipes' ? 'recipesLibraryFile' : 'panelsLibraryFile';
          const folderKey = appContext === 'songs' ? 'songsFolder' : appContext === 'recipes' ? 'recipesFolder' : 'panelsFolder';
          service.saveUserPreferences({
            [fileKey]: fileStatus.fileName,
            [folderKey]: fileStatus.currentLocation,
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
      
      message.success(`${appContext === 'songs' ? 'Song' : appContext === 'recipes' ? 'Recipe' : 'Panel'} library loaded successfully`);
      handleClose();
    } catch (error: unknown) {
      console.error('Error loading existing library:', error);
      message.error(`Failed to load ${appContext === 'songs' ? 'song' : appContext === 'recipes' ? 'recipe' : 'panel'} library: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    const service: any = getService();
    if (!service) return;

    const settings = form.getFieldsValue();
    const { fileName, folderPath } = resolveFileAndFolder(settings);

    try {
      setLoading(true);
      await service.createNewLibrary(fileName, folderPath);
      message.success(`New ${appContext === 'songs' ? 'song' : appContext === 'recipes' ? 'recipe' : 'panel'} library created successfully`);
      
      // Refresh search to show the new file
      if (appContext === 'panels' && isOpenMode) {
        await loadLibraryDataForFile();
      } else {
        await searchForFile();
      }
    } catch (error: unknown) {
      console.error('Error creating new library:', error);
      message.error(`Failed to create new ${appContext === 'songs' ? 'song' : appContext === 'recipes' ? 'recipe' : 'panel'} library: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    const service: any = getService();
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
      
      // Check if we need to return to a previous modal
      if (modalData?.returnToModal) {
        const { modalType, modalData: returnData } = modalData.returnToModal;
        dispatch(closeModal());
        setTimeout(() => {
          dispatch(openModal({ modalType, appContext, data: returnData }));
        }, 100);
      } else {
        handleClose();
      }
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    }
  };

  // When the modal is used as a Save As dialog for other apps (panels),
  // invoke the registered callback with the chosen file (existing or newly created).
  const handleSaveHere = async () => {
    const service: any = getService();
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

  const handleSelectPanel = async (panel: any) => {
    const cbId = modalData && modalData.onSelectFileCallbackId;
    if (cbId) {
      try {
        const { getCallback, removeCallback } = await import('@/utils/modalCallbackRegistry');
        const cb = getCallback(cbId);
        if (cb) {
          await cb({ panel });
          message.success(`Loaded panel: ${panel.name}`);
          removeCallback(cbId);
          handleClose();
        } else {
          console.warn('Callback not found for id', cbId);
          message.error('Failed to deliver panel to caller (callback missing)');
        }
      } catch (cbErr: unknown) {
        console.error('Error invoking panel selection callback:', cbErr);
        message.error('Failed to load panel');
      }
    }
  };

  const handleOpenLibrarySettings = () => {
    // Store current modal state to return to it later
    const returnData = {
      ...modalData,
      returnToModal: {
        modalType: MODAL_TYPES.LIBRARY_SETTINGS,
        modalData: { ...modalData }
      }
    };
    
    // Close current modal and open library settings
    dispatch(closeModal());
    setTimeout(() => {
      dispatch(openModal({ 
        modalType: MODAL_TYPES.LIBRARY_SETTINGS, 
        appContext, 
        data: returnData
      }));
    }, 100);
  };

  const handleClearSettings = () => {
    const service: any = getService();
    if (!service) return;

    if (service.clearUserPreferences) {
      service.clearUserPreferences();
    }
    
    // Reset form to defaults
    form.setFieldsValue(getDefaultSettings());
    setFileStatus(null);
    setLastSearchSettings(null);
    setPanelsList([]);
    
    message.success('Settings cleared');
  };

  if (!isVisible || !appContext) {
    return null;
  }

  const appName = appContext === 'songs' ? 'Song' : appContext === 'recipes' ? 'Recipe' : 'Panel';
  const fileFieldName = appContext === 'songs' ? 'songsLibraryFile' : appContext === 'recipes' ? 'recipesLibraryFile' : 'panelsLibraryFile';
  const folderFieldName = appContext === 'songs' ? 'songsFolder' : appContext === 'recipes' ? 'recipesFolder' : 'panelsFolder';

  // For panels in Open mode, show the panel list
  if (appContext === 'panels' && isOpenMode) {
    const service: any = getService();
    
    // Try to restore session if needed
    if (service && !service.isSignedIn && service.restoreSession) {
      service.restoreSession();
    }
    
    const isAuthenticated = service && service.isSignedIn && service.accessToken;
    const { fileName, folderPath } = resolveFileAndFolder();
    const libraryPath = folderPath === '/' ? `/${fileName}` : `${folderPath}/${fileName}`;
    
    return (
      <Modal
        title={
          <Space>
            <FileOutlined />
            Open Panel from Library
          </Space>
        }
        open={isVisible}
        onCancel={handleClose}
        width={600}
        footer={[
          <Button key="settings" icon={<SettingOutlined />} onClick={handleOpenLibrarySettings}>
            Library Settings
          </Button>,
          <Button key="cancel" onClick={handleClose}>
            Cancel
          </Button>
        ]}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Show library path being accessed */}
          <Alert
            type="info"
            message={`Loading from: ${libraryPath}`}
            style={{ marginBottom: 16 }}
            showIcon
          />
          
          {!isAuthenticated ? (
            <Alert
              type="warning"
              message="Not signed in to Google Drive"
              description="Please sign in to Google Drive to access your panel library."
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin />
              <p style={{ marginTop: 16 }}>Loading panels...</p>
            </div>
          ) : panelsList.length > 0 ? (
            <List
              dataSource={panelsList}
              renderItem={(panel: any) => (
                <List.Item
                  key={panel.id}
                  onClick={() => handleSelectPanel(panel)}
                  style={{ cursor: 'pointer', padding: '12px 16px' }}
                  className="hover:bg-gray-700"
                >
                  <List.Item.Meta
                    title={panel.name}
                    description={`${panel.width} × ${panel.height} stitches`}
                  />
                  <ArrowRightOutlined />
                </List.Item>
              )}
            />
          ) : (
            <Alert
              type="info"
              message="No panels found"
              description="The current library doesn't contain any saved panels. Create a new panel or check your library settings."
              showIcon
            />
          )}
        </div>
      </Modal>
    );
  }

  // For panels in Save As mode, show simplified save interface
  if (appContext === 'panels' && isSaveAsMode) {
    return (
      <Modal
        title={
          <Space>
            <FileOutlined />
            Save Panel As...
          </Space>
        }
        open={isVisible}
        onCancel={handleClose}
        width={600}
        footer={[
          <Button key="settings" icon={<SettingOutlined />} onClick={handleOpenLibrarySettings}>
            Library Settings
          </Button>,
          <Button key="cancel" onClick={handleClose}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveHere} loading={loading}>
            Save Panel
          </Button>
        ]}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Panel Name"
              name="panelName"
              rules={[{ required: true, message: 'Please enter a panel name' }]}
            >
              <Input placeholder="Enter panel name" />
            </Form.Item>
          </Form>
          
          {fileStatus && (
            <Alert
              type={fileStatus.found ? "success" : "info"}
              message={fileStatus.found ? `Will save to: ${fileStatus.fileName}` : "Will create new library"}
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      </Modal>
    );
  }

  // Default: Full library settings modal
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
        isSaveAsMode ? [
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
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFormChange}
        >
          {/* Show configuration warning when Drive service isn't configured */}
          {(() => {
            const service: any = getService();
            const notConfigured = service && (service.configured === false || !service.CLIENT_ID);
            if (notConfigured) {
              return (
                <Alert
                  type="warning"
                  message="Google Drive not configured"
                  description="No Google Client ID found. Set VITE_GOOGLE_CLIENT_ID in your environment or call GoogleDriveServiceModern.initialize(clientId) to enable Drive features."
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              );
            }
            return null;
          })()}
          {showFileInputs && (
            <>
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
            </>
          )}

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
        {showFileInputs && (lastSearchSettings && !searching) && (
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

export default LibraryModalInner;
