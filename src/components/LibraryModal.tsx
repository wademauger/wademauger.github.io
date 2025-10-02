import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Form, Input, AutoComplete, Button, Space, Alert, Card, Spin, message, Select, List } from 'antd';
import { FolderOutlined, FileOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined, PlusOutlined, ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import { closeModal, selectCurrentModal, selectModalData, selectAppContext, MODAL_TYPES } from '../reducers/modal.reducer';
import { setLibrary } from '../store/songsSlice';
import { setDriveRecipes } from '../reducers/recipes.reducer';
import GoogleDriveServiceModern from '../apps/songs/services/GoogleDriveServiceModern';
import GoogleDriveRecipeService from '../apps/recipes/services/GoogleDriveRecipeService';

const LibraryModal = () => {
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
  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedLibraryData, setSelectedLibraryData] = useState(null);
  const [panelNameConflict, setPanelNameConflict] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const panelNameValue = Form.useWatch ? Form.useWatch('panelName', form) : form.getFieldValue('panelName');

  // Check if this modal should be visible
  const isVisible = currentModal === MODAL_TYPES.LIBRARY_SETTINGS;
  
  // silence debug logging
  useEffect(() => {}, [isVisible, currentModal, appContext]);

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
        songsFolder: '/'
      };
    } else if (appContext === 'recipes') {
      return {
        recipesLibraryFile: 'recipe-library.json',
        recipesFolder: '/'
      };
    } else if (appContext === 'panels') {
      return {
        panelsLibraryFile: 'panels-library.json',
        panelsFolder: '/'
      };
    }
    return {};
  };

  // Helper to extract fileName and folderPath from form or provided settings depending on appContext
  const resolveFileAndFolder = (settings = null) => {
    const s = settings || form.getFieldsValue() || {};
    let fileName;
    let folderPath;
    // If a combined location path is provided (Save As mode), parse it
    const locationPath = s.locationPath;
    if (locationPath) {
      const trimmed = String(locationPath).trim();
      if (trimmed.endsWith('.json')) {
        const idx = trimmed.lastIndexOf('/');
        if (idx >= 0) {
          folderPath = trimmed.substring(0, idx) || '/';
          fileName = trimmed.substring(idx + 1);
        } else {
          fileName = trimmed;
          folderPath = '/';
        }
      } else {
        // treat as folder path
        folderPath = trimmed || '/';
      }
    }
    if (appContext === 'songs') {
      if (s.songsLibraryFile !== undefined && s.songsLibraryFile !== '') fileName = s.songsLibraryFile;
      if (s.songsFolder !== undefined && s.songsFolder !== '') folderPath = s.songsFolder;
    } else if (appContext === 'recipes') {
      if (s.recipesLibraryFile !== undefined && s.recipesLibraryFile !== '') fileName = s.recipesLibraryFile;
      if (s.recipesFolder !== undefined && s.recipesFolder !== '') folderPath = s.recipesFolder;
    } else if (appContext === 'panels') {
      if (s.panelsLibraryFile !== undefined && s.panelsLibraryFile !== '') fileName = s.panelsLibraryFile;
      if (s.panelsFolder !== undefined && s.panelsFolder !== '') folderPath = s.panelsFolder;
    }

  // Fallback to defaults if still undefined - prefer current appContext's default
  const defaults = getDefaultSettings();
  const contextKey = appContext === 'songs' ? 'songsLibraryFile' : (appContext === 'recipes' ? 'recipesLibraryFile' : 'panelsLibraryFile');
  const contextFolderKey = appContext === 'songs' ? 'songsFolder' : (appContext === 'recipes' ? 'recipesFolder' : 'panelsFolder');
  fileName = fileName || defaults[contextKey] || defaults.songsLibraryFile || defaults.recipesLibraryFile || defaults.panelsLibraryFile;
  folderPath = folderPath || defaults[contextFolderKey] || defaults.songsFolder || defaults.recipesFolder || defaults.panelsFolder || '/';

    return { fileName, folderPath };
  };

  useEffect(() => {
    if (isVisible && modalData) {
      const service = getService();
      if (service) {
        // Load user preferences from the appropriate service and filter them
        // so preferences from other app contexts (e.g. songs) don't override
        // the defaults for the current context (e.g. panels).
        const rawUserPreferences = service.getUserPreferences ? service.getUserPreferences() : {};
        const filteredPrefs = {};
        if (appContext === 'songs') {
          ['songsLibraryFile', 'songsFolder'].forEach((k: any) => { if (rawUserPreferences[k] !== undefined) filteredPrefs[k] = rawUserPreferences[k]; });
        } else if (appContext === 'recipes') {
          ['recipesLibraryFile', 'recipesFolder', 'showDemoRecipes'].forEach((k: any) => { if (rawUserPreferences[k] !== undefined) filteredPrefs[k] = rawUserPreferences[k]; });
        } else if (appContext === 'panels') {
          ['panelsLibraryFile', 'panelsFolder'].forEach((k: any) => { if (rawUserPreferences[k] !== undefined) filteredPrefs[k] = rawUserPreferences[k]; });
        }

        // Merge modalData.currentSettings but only include keys relevant to the current appContext
        const modalCurrent = modalData?.currentSettings || {};
        const filteredModalCurrent = {};
        if (appContext === 'songs') {
          ['songsLibraryFile', 'songsFolder'].forEach((k: any) => { if (modalCurrent[k] !== undefined) filteredModalCurrent[k] = modalCurrent[k]; });
        } else if (appContext === 'recipes') {
          ['recipesLibraryFile', 'recipesFolder', 'showDemoRecipes'].forEach((k: any) => { if (modalCurrent[k] !== undefined) filteredModalCurrent[k] = modalCurrent[k]; });
        } else if (appContext === 'panels') {
          ['panelsLibraryFile', 'panelsFolder'].forEach((k: any) => { if (modalCurrent[k] !== undefined) filteredModalCurrent[k] = modalCurrent[k]; });
        }

        const settingsToUse = {
          ...getDefaultSettings(),
          ...filteredPrefs,
          ...filteredModalCurrent,
          // Include current demo recipes state for recipes app (modal-level override)
          ...(appContext === 'recipes' && modalData?.showDemoRecipes !== undefined && {
            showDemoRecipes: modalData.showDemoRecipes
          })
        };
        // Ensure namespace is set from app context (inferred, not user-editable)
        const withNamespace = { ...settingsToUse, namespace: appContext || 'panels' };
        form.setFieldsValue(withNamespace);
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

  // When a fileStatus is selected/changed, attempt to load its library data
  useEffect(() => {
    if (fileStatus && fileStatus.found && appContext === 'panels') {
      // load the library so we can show contained panels for selection
      loadLibraryDataForFile(fileStatus).catch(err => {
        console.warn('LibraryModal: failed to load library data for panels list', err);
      });
    } else {
      // clear previously loaded library when file selection is cleared
      setSelectedLibraryData(null);
    }
  }, [fileStatus, appContext]);


  const loadFolderSuggestions = async (query = '') => {
    const service = getService();
    if (!service) return;

    try {
      setLoadingFolders(true);
      // Some services support a query param to scope suggestions as user types
      const suggestions = await (service.getFolderSuggestions ? service.getFolderSuggestions(query) : []);
      // Normalize fallback option shape
      if (!suggestions || suggestions.length === 0) {
        setFolderOptions([
          { value: '/', label: '/ (Root folder)', key: 'root' }
        ]);
      } else {
        setFolderOptions(suggestions);
      }
    } catch (error: unknown) {
      console.error('Error loading folder suggestions:', error);
      setFolderOptions([
        { value: '/', label: '/ (Root folder)', key: 'root' }
      ]);
    } finally {
      setLoadingFolders(false);
    }
  };

  const listJsonFilesInFolder = async (folderPath) => {
    const service = getService();
    if (!service) return [];

    try {
      // Prefer a service method that provides counts and previews
      if (service.listFilesInFolderWithCounts) {
        const all = await service.listFilesInFolderWithCounts(folderPath);
        // Normalize output
        return (all || []).map((f: any) => ({
          id: f.fileId || f.fileId,
          fileId: f.fileId || f.fileId,
          name: f.name || f.fileName || f.name,
          count: f.counts ? (f.counts.panels || Object.values(f.counts).reduce((a,b)=>a+(b||0),0)) : undefined,
          counts: f.counts || {},
          preview: f.preview || {}
        }));
      }

      // Fallback: use findFile for common library names and also try a generic list
      const candidates = [];
      const commonNames = ['song-tabs-library.json','recipe-library.json','panels-library.json'];
      for (const name of commonNames) {
        const found = await service.findFile(name, folderPath).catch(() => null);
        if (found && found.found) {
          const entry = { name: found.fileName, id: found.fileId, currentLocation: found.currentLocation };
          // try to load and get count
          try {
            if (entry.id && service.loadLibraryById) {
              const data = await service.loadLibraryById(entry.id);
              entry.count = countPanels(data);
            }
          } catch {
            entry.count = undefined;
          }
          candidates.push(entry);
        }
      }
      return candidates;
    } catch (e: unknown) {
      console.warn('Error listing JSON files in folder', e);
      return [];
    }
  };

  // Watch folder/location changes to update jsonFiles list
  useEffect(() => {
    const settings = form.getFieldsValue();
    const { folderPath } = resolveFileAndFolder(settings);
    let mounted = true;
    if (folderPath) {
      listJsonFilesInFolder(folderPath).then(files => {
        if (mounted) setJsonFiles(files || []);
      });
    }
    return () => { mounted = false; };
  }, [form, appContext, modalData]);

  const searchForFile = async (settings = null) => {
    const service = getService();
    if (!service) return;

    const { fileName, folderPath } = resolveFileAndFolder(settings);
    
    if (!fileName) {
      return;
    }

    try {
  setSearching(true);
  // Use the appropriate service to search for the file
  const result = await service.findFile(fileName, folderPath);
  setFileStatus(result);
      setLastSearchSettings({ ...resolveFileAndFolder(settings) });
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

  const loadLibraryDataForFile = async (status) => {
    const service = getService();
    if (!service || !status?.found) return null;
    try {
      let libraryData = null;
      if (status.fileId) {
        try {
          libraryData = await service.loadLibraryById(status.fileId);
        } catch (e: unknown) {
          // Some Drive files are not downloadable (e.g. Docs editors) and API returns a 403
          // with reason 'fileNotDownloadable'. Normalize this into a user-friendly error.
          console.warn('loadLibraryDataForFile: loadLibraryById failed', e);
          const body = e && (e.body || e.result || e.response || e.message);
          // show a helpful message when file is a Drive native type or not downloadable
          message.error('Selected file cannot be downloaded from Google Drive. It may be a Google Docs/Sheets/Slides file or you lack permission.');
          setSelectedLibraryData(null);
          return null;
        }
      } else {
        libraryData = await service.loadLibraryData();
      }

      // Defensive: sometimes the service may return a Drive file resource (e.g. folder)
      // instead of the expected JSON library object. Detect common indicators and
      // surface a helpful error instead of trying to treat it as library data.
      if (libraryData && libraryData.mimeType && String(libraryData.mimeType).includes('application/vnd.google-apps')) {
        console.warn('loadLibraryDataForFile: returned resource appears to be a Drive native file (mimeType)', libraryData.mimeType);
        message.error('The selected Drive item is not a JSON library file. Please select a .json library file.');
        setSelectedLibraryData(null);
        return null;
      }
      // attach a panel count for convenience
      const c = countPanels(libraryData);
      const wrapped = { __data: libraryData, __count: c };
      setSelectedLibraryData(wrapped);
      return libraryData;
    } catch (e: unknown) {
      console.warn('Failed to load library data for fileStatus', e);
      setSelectedLibraryData(null);
      // Surface a friendly message when load fails
      message.error('Failed to load library data: ' + (e && e.message ? e.message : String(e)));
      return null;
    }
  };

  const countPanels = (libraryData) => {
    if (!libraryData || typeof libraryData !== 'object') return 0;
    let total = 0;
    const arrays = Object.values(libraryData).filter((v: any) => Array.isArray(v));
    for (const arr of arrays) {
      total += arr.length;
    }
    return total;
  };

  const checkPanelConflict = (panelName, libraryData) => {
    if (!panelName) return false;
    const lib = libraryData || selectedLibraryData;
    if (!lib || typeof lib !== 'object') return false;
    const arrays = Object.values(lib).filter((v: any) => Array.isArray(v));
    for (const arr of arrays) {
      for (const item of arr) {
        if (!item) continue;
        const itemName = item.name || item.title || item.id || '';
        if (String(itemName).toLowerCase() === String(panelName).toLowerCase()) return true;
      }
    }
    return false;
  };

  const handleFormChange = (changedValues, allValues) => {
    // Debounce search when filename/location values change
    if (changedValues.locationPath || changedValues[ fileFieldName ]) {
      const searchTimeout = setTimeout(() => {
        searchForFile();
      }, 500); // shorter debounce
      return () => clearTimeout(searchTimeout);
    }

  // When panelName changes, check for conflict with loaded library data
    if (changedValues.panelName !== undefined) {
      const panelName = (allValues && allValues.panelName) || '';
      if (!panelName) {
        setPanelNameConflict(false);
        return;
      }
      // quick heuristic: look for any array inside selectedLibraryData that contains an item with matching name/title
      const lib = selectedLibraryData;
      let conflict = false;
      if (lib && typeof lib === 'object') {
        const arrays = Object.values(lib).filter((v: any) => Array.isArray(v));
        for (const arr of arrays) {
          for (const item of arr) {
            if (!item) continue;
            const itemName = item.name || item.title || item.id || '';
            if (String(itemName).toLowerCase() === String(panelName).toLowerCase()) {
              conflict = true; break;
            }
          }
          if (conflict) break;
        }
      }
      setPanelNameConflict(conflict);
    }

    // When user types a locationPath (may include filename), update selectedFileName and append will-create entry
    if (changedValues.locationPath !== undefined) {
      const loc = allValues.locationPath || '';
      const { fileName } = resolveFileAndFolder({ locationPath: loc });
      setSelectedFileName(fileName || '');
      // If the typed fileName is not in jsonFiles, append a will-create entry
      if (fileName) {
        const exists = (jsonFiles || []).some((f: any) => String(f.name || f.fileName).toLowerCase() === String(fileName).toLowerCase());
        if (!exists) {
          setJsonFiles(prev => ([...(prev || []), { name: fileName, id: null, __willCreate: true, count: 0 }]));
        }
      }
    }

    // When the user types (or selects) a filename field for non-saveAs modes, update selectedFileName too
    if (changedValues[fileFieldName] !== undefined) {
      setSelectedFileName(changedValues[fileFieldName] || '');
    }
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
        try {
          libraryData = await service.loadLibraryById(fileStatus.fileId);
        } catch (loadErr: unknown) {
          console.warn('handleLoadExisting: loadLibraryById failed', loadErr);
          message.error('Cannot load the selected file. It may not be a downloadable JSON file or you lack permission.');
          setLoading(false);
          return;
        }
        
        // Update the form and settings to match the loaded file's location
        const updatedSettings = {
          ...form.getFieldsValue(),
          [appContext === 'songs' ? 'songsLibraryFile' : (appContext === 'recipes' ? 'recipesLibraryFile' : 'panelsLibraryFile')]: fileStatus.fileName,
          [appContext === 'songs' ? 'songsFolder' : (appContext === 'recipes' ? 'recipesFolder' : 'panelsFolder')]: fileStatus.currentLocation
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
            console.log('LibraryModal: invoking callback id', cbId, 'fileStatus:', fileStatus && fileStatus.fileId);
            const cb = getCallback(cbId);
            if (cb) {
              const panelName = panelNameValue;
              await cb({ libraryData, fileStatus, panelName });
              message.success('Panel library loaded and handed to caller');
            } else {
              console.warn('LibraryModal: Callback not found for id', cbId);
              message.error('Failed to deliver panel data to caller (callback missing)');
            }
            // Clean up the callback after invocation
            removeCallback(cbId);
          } else {
            console.warn('LibraryModal: No callback configured to receive panel library');
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
        let libraryData = null;
        try {
          libraryData = await service.loadLibraryById(fileStatus.fileId);
        } catch (loadErr: unknown) {
          console.warn('handleSaveHere: loadLibraryById failed', loadErr);
          message.error('Cannot load the selected file. It may not be a downloadable JSON file or you lack permission.');
          setLoading(false);
          return;
        }
        const cbId = modalData && modalData.onSelectFileCallbackId;
        if (cbId) {
          const { getCallback, removeCallback } = await import('@/utils/modalCallbackRegistry');
          const cb = getCallback(cbId);
          if (cb) {
            const panelName = panelNameValue;
            await cb({ libraryData, fileStatus, panelName });
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
  console.log('LibraryModal: handleSaveHere resolved fileName, folderPath =', fileName, folderPath, 'appContext=', appContext);

      if (!fileName || String(fileName).trim() === '') {
        message.error('Please supply a filename (e.g. panel-library.json) before creating.');
        setLoading(false);
        return;
      }

      // If the user typed a path/filename but fileStatus isn't set, probe for an existing file
      if (!(fileStatus && fileStatus.found) && service && service.findFile) {
        try {
          const probe = await service.findFile(fileName, folderPath);
          if (probe && probe.found && probe.fileId) {
            // Found an existing file that matches the typed path — load and invoke callback
            const libraryData = await service.loadLibraryById(probe.fileId).catch(() => null);
            const cbId = modalData && modalData.onSelectFileCallbackId;
            if (cbId) {
              const { getCallback, removeCallback } = await import('@/utils/modalCallbackRegistry');
              const cb = getCallback(cbId);
              if (cb) {
                const panelName = panelNameValue;
                await cb({ libraryData, fileStatus: probe, panelName });
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
            setLoading(false);
            return;
          }
        } catch (probeErr: unknown) {
          console.warn('LibraryModal: probe for existing file failed', probeErr);
          // fall through to create path below
        }
      }

      // Create the new library and use the create response directly
      let libraryData = null;
      let finalFileStatus = fileStatus;
        try {
        console.log('LibraryModal: creating new library', fileName, 'in', folderPath);
        const created = await service.createNewLibrary(fileName, folderPath);
        // created is expected to be the Drive file resource (response.result)
        const createdId = created && (created.id || created.fileId || (created.result && created.result.id));
        const createdName = created && (created.name || created.fileName || (created.result && created.result.name));
        console.log('LibraryModal: createNewLibrary returned id', createdId, 'name', createdName);
        if (createdId) {
          try {
            libraryData = await service.loadLibraryById(createdId);
          } catch (loadErr: unknown) {
            console.warn('LibraryModal: Could not load newly created library immediately; proceeding with fileId only', loadErr);
            libraryData = null;
          }
          finalFileStatus = { found: true, fileId: createdId, fileName: createdName || fileName, currentLocation: folderPath };
        } else {
          // fallback: try to find by filename
          let saved = null;
          try {
            if (service.findFile) saved = await service.findFile(fileName, folderPath);
            else if (service.findLibraryFile) saved = await service.findLibraryFile();
          } catch (e: unknown) {
            console.warn('finding newly created library failed', e);
          }
          if (saved && (saved.id || saved.fileId)) {
            const id = saved.id || saved.fileId;
            libraryData = await service.loadLibraryById(id);
            finalFileStatus = { found: true, fileId: id, fileName: saved.name || fileName, currentLocation: folderPath };
          } else {
            try {
              libraryData = await service.loadLibraryData();
            } catch (e: unknown) {
              console.warn('Could not load library data after create', e);
            }
          }
        }
      } catch (createErr: unknown) {
        console.error('Error creating new library file:', createErr);
        // Attempt fallback find
        let saved = null;
        try {
          if (service.findFile) saved = await service.findFile(fileName, folderPath);
        } catch (e: unknown) {
          console.warn('finding newly created library failed', e);
        }
        if (saved && (saved.id || saved.fileId)) {
          const id = saved.id || saved.fileId;
          libraryData = await service.loadLibraryById(id);
          finalFileStatus = { found: true, fileId: id, fileName: saved.name || fileName, currentLocation: folderPath };
        } else {
          try {
            libraryData = await service.loadLibraryData();
          } catch (e: unknown) {
            console.warn('Could not load library data after create fallback', e);
          }
        }
      }

      const cbId = modalData && modalData.onSelectFileCallbackId;
      if (cbId) {
        const { getCallback, removeCallback } = await import('@/utils/modalCallbackRegistry');
        const cb = getCallback(cbId);
        if (cb) {
          const panelName = panelNameValue;
          await cb({ libraryData, fileStatus: finalFileStatus, panelName });
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

  const handleReplaceExisting = async () => {
    const service = getService();
    if (!service || !fileStatus?.found) return;

    try {
      setLoading(true);
      // Load the library so caller can perform a replacement
      let libraryData = null;
      if (fileStatus.fileId) {
        libraryData = await service.loadLibraryById(fileStatus.fileId);
      } else {
        // Try to load generically
        try {
          libraryData = await service.loadLibraryData();
        } catch (e: unknown) {
          console.warn('Could not load library data for replace', e);
        }
      }

      const cbId = modalData && modalData.onSelectFileCallbackId;
      if (cbId) {
        const { getCallback, removeCallback } = await import('@/utils/modalCallbackRegistry');
        const cb = getCallback(cbId);
        if (cb) {
          const panelName = panelNameValue;
          await cb({ libraryData, fileStatus, panelName, replaceExisting: true });
          message.success('Replaced existing panel in library');
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
      console.error('Error replacing existing panel:', error);
      message.error('Failed to replace existing panel');
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

  const appName = appContext === 'songs' ? 'Song' : (appContext === 'recipes' ? 'Recipe' : 'Panel');
  const fileFieldName = appContext === 'songs' ? 'songsLibraryFile' : (appContext === 'recipes' ? 'recipesLibraryFile' : 'panelsLibraryFile');
  const folderFieldName = appContext === 'songs' ? 'songsFolder' : (appContext === 'recipes' ? 'recipesFolder' : 'panelsFolder');

  const isSaveAsMode = !!(modalData && modalData.onSelectFileCallbackId);
  // Intent can be used to change UI language (e.g. 'open' vs 'save')
  const intent = modalData && modalData.intent ? modalData.intent : (isSaveAsMode ? 'save' : null);

  return (
    <Modal
      title={
        <Space>
          <FileOutlined />
          {intent === 'open' ? `Open — Select ${appName}` : (isSaveAsMode ? 'Save As — Select destination' : `${appName} Library Manager`)}
        </Space>
      }
      open={isVisible}
      onCancel={handleClose}
      width={600}
      footer={
        intent === 'open' ? [
          <Button key="cancel" onClick={handleClose}>
            Cancel
          </Button>,
          <Button key="clear" onClick={handleClearSettings}>
            Clear Settings
          </Button>,
          <Button key="open" type="primary" onClick={handleLoadExisting} loading={loading}>
            Open
          </Button>
        ] : modalData && modalData.onSelectFileCallbackId ? [
          <Button key="cancel" onClick={handleClose}>
            Cancel
          </Button>,
          <Button key="clear" onClick={handleClearSettings}>
            Clear Settings
          </Button>,
          <Button key="saveHere" type="primary" onClick={handleSaveHere} loading={loading} disabled={!panelNameValue || loading}>
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
          {/* Combined location input (Windows-style Save As) - visible in Save As mode */}
          {isSaveAsMode && (
            <Form.Item
              label="Location (folder or folder/filename.json)"
              name="locationPath"
            >
              <AutoComplete
                options={folderOptions}
                onSearch={(value) => loadFolderSuggestions(value)}
                onSelect={(value) => {
                  form.setFieldsValue({ locationPath: value });
                  // refresh json file list for selected folder
                  const { folderPath } = resolveFileAndFolder(form.getFieldsValue());
                  listJsonFilesInFolder(folderPath).then(files => setJsonFiles(files || []));
                }}
                placeholder="/MyFolder or /MyFolder/panels-library.json"
                notFoundContent={loadingFolders ? <Spin size="small" /> : null}
              />
            </Form.Item>
          )}

          {/* List JSON files in the selected folder (Save As mode) */}
          {isSaveAsMode && jsonFiles?.length > 0 && (
            <Card size="small" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '13px', marginBottom: 8 }}><strong>JSON files in path</strong></div>
              {jsonFiles.map((f: any) => {
                const name = f.name || f.fileName;
                const isSelected = String(name).toLowerCase() === String(selectedFileName).toLowerCase();
                return (
                  <div key={f.id || name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', background: isSelected ? '#f6ffed' : undefined }}>
                    <div>
                      <div>{name} {f.__willCreate ? <em style={{ color: '#888' }}>(will be created)</em> : null}</div>
                      <div style={{ fontSize: 11, color: '#666' }}>
                        {/** Prefer explicit counts object; only show namespaces with count>0 **/}
                        {(() => {
                          const counts = f.counts || {};
                          // Special formatting for songs namespace
                          if ((counts.artists !== undefined || counts.songs !== undefined) && (counts.artists || counts.songs)) {
                            const parts = [];
                            if (counts.artists !== undefined) parts.push(`${counts.artists} artists`);
                            if (counts.songs !== undefined) parts.push(`${counts.songs} songs`);
                            return parts.join('; ');
                          }
                          const entries = Object.entries(counts).filter(([,v]) => Number(v) > 0);
                          if (entries.length === 1) {
                            const [k,v] = entries[0];
                            return `${v} ${k}`;
                          }
                          if (entries.length > 1) {
                            return entries.map(([k,v]) => `${k}:${v}`).join(', ');
                          }
                          // fallback to f.count (legacy) if present
                          if (f.count !== undefined) return `${f.count} panels`;
                          return '';
                        })()}
                      </div>
                      {f.preview && Object.keys(f.preview).length > 0 && (
                        <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                          {Object.entries(f.preview).map(([ns, items]) => (
                            <div key={ns}><strong>{ns}:</strong> {items.map((it: any) => it.name || it.id).filter(Boolean).slice(0,3).join(', ')}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Button
                        size="small"
                        onClick={async () => {
                          // append filename onto the locationPath input
                          const currentLoc = form.getFieldValue('locationPath') || '';
                          const base = currentLoc.endsWith('/') ? currentLoc.slice(0, -1) : currentLoc;
                          const newLoc = (base || '') + '/' + name;
                          form.setFieldsValue({ locationPath: newLoc });
                          setSelectedFileName(name);
                          // set fileStatus and load library data for conflict checks
                          const status = { found: true, fileId: f.id || f.fileId, fileName: name, currentLocation: base || '/' };
                          setFileStatus(status);
                          const lib = await loadLibraryDataForFile(status);
                          const pn = panelNameValue;
                          setPanelNameConflict(checkPanelConflict(pn, lib));
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}

          {/* Inline CTA when a file is selected in Save As mode */}
          {isSaveAsMode && fileStatus?.found && (
            <Card size="small" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px' }}>
                  <strong>Location:</strong>&nbsp;{fileStatus.fileName} &nbsp;•&nbsp; {fileStatus.currentLocation}
                </div>
                <div>
                  <Button
                    type={panelNameConflict ? 'default' : 'primary'}
                    danger={panelNameConflict}
                    icon={<ArrowRightOutlined />}
                    onClick={async () => {
                      const pn = panelNameValue;
                      if (!pn) return;
                      if (panelNameConflict) {
                        Modal.confirm({
                          title: 'Panel name conflict',
                          content: `A panel named "${pn}" already exists in ${fileStatus.fileName}. Replace it?`,
                          okText: 'Replace',
                          okType: 'danger',
                          onOk: () => handleReplaceExisting()
                        });
                      } else {
                        await handleSaveHere();
                      }
                    }}
                    loading={loading}
                    size="small"
                    disabled={!panelNameValue || loading}
                  >
                    {panelNameConflict ? 'Replace Existing Panel' : 'Add to This Library'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* When in Open mode for panels, show list of panels inside selected library */}
          {!isSaveAsMode && appContext === 'panels' && selectedLibraryData && selectedLibraryData.__data && selectedLibraryData.__data.panels && (
            <Card size="small" style={{ marginTop: 12 }}>
              <div style={{ fontSize: '13px', marginBottom: 8 }}><strong>Panels in selected library</strong></div>
              <List
                size="small"
                bordered
                dataSource={Object.entries(selectedLibraryData.__data.panels || {}).map(([k,v]) => ({ key: k, panel: v }))}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="open"
                        type="link"
                        onClick={async () => {
                          try {
                            // If this modal was opened with a callback id, invoke it
                            const cbId = modalData && modalData.onSelectFileCallbackId;
                            if (cbId) {
                              const { getCallback, removeCallback } = await import('@/utils/modalCallbackRegistry');
                              const cb = getCallback(cbId);
                              if (cb) {
                                await cb({ libraryData: selectedLibraryData.__data, fileStatus, panelName: item.key });
                                message.success('Panel handed to caller');
                              } else {
                                message.error('Panel callback not found');
                              }
                              // remove callback to avoid leaks
                              removeCallback(cbId);
                            } else {
                              // No callback: load directly into active app (fallback)
                              if (getService() && getService().loadLibraryById) {
                                // attempt to load library and then dispatch to relevant store
                                const svc = getService();
                                let lib = null;
                                try {
                                  if (fileStatus && fileStatus.fileId) lib = await svc.loadLibraryById(fileStatus.fileId);
                                  else lib = selectedLibraryData.__data;
                                } catch (e: unknown) {
                                  lib = selectedLibraryData.__data;
                                }
                                // mimic handleLoadExisting behavior for panels: no redux action, just show message
                                message.success('Selected panel: ' + item.key);
                              }
                            }
                            handleClose();
                          } catch (err: unknown) {
                            console.error('Error selecting panel from modal', err);
                            message.error('Failed to select panel: ' + String(err));
                          }
                        }}
                      >
                        Open
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.key}
                      description={item.panel && (item.panel.name || item.panel.title) ? (item.panel.name || item.panel.title) : null}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Panel name (in Save As mode shown after results) */}
          {isSaveAsMode && (
            <>
              {/* Namespace is inferred from the current app context; do not show selector to users */}
              <Form.Item name="namespace" initialValue={appContext || 'panels'} hidden>
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                label="Panel Name"
                name="panelName"
                rules={[{ required: true, message: 'Please enter a panel name' }]}
              >
                <Input placeholder="Name this panel (e.g. FrontPanel)" />
              </Form.Item>
            </>
          )}

          {!isSaveAsMode && (
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
  {!isSaveAsMode && (lastSearchSettings && !searching) && (
          <Card size="small" style={{ marginTop: 16 }}>
            <FolderOutlined /> Existing Files
            {fileStatus?.found ? (
              isSaveAsMode ? (
                <Card size="small" style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px' }}>
                      <strong>Location:</strong> {fileStatus.currentLocation}/<strong>{fileStatus.fileName}</strong>
                    </div>
                    <div>
                      <Button
                        type="primary"
                        icon={<ArrowRightOutlined />}
                        onClick={handleSaveHere}
                        loading={loading}
                        size="small"
                        disabled={!panelNameValue || loading}
                      >
                        Add to This Library
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
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
              )
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

export default LibraryModal;
