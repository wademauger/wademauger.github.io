import React, { useEffect, useState } from 'react';
import { Modal, List, Spin, message, Typography, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import store from '../store';
// We'll dynamically import library thunks from utils to avoid initializing Drive services on module load
import { openLibrarySettingsModal } from '../reducers/modal.reducer';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpen?: (library: any, fileRef?: any) => void;
}

export default function LibraryOpenDialog({ visible, onClose, onOpen }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const entries = useSelector((state: RootState) => state.library.entries || []);
  const isLoading = useSelector((state: RootState) => state.library.isLoading);
  const isSignedIn = useSelector((state: RootState) => state.auth?.isSignedIn);
  const selectedFile = useSelector((state: RootState) => state.library?.selectedFile);
  const [scanResults, setScanResults] = useState<Array<{ key: string; value: any }>>([]);
  // Fallback: probe localStorage for persisted library references in several places
  // 1) canonical app key 'app:libraryFileReference'
  // 2) user preference blobs created by GoogleDriveServiceModern (e.g. songsUserPreferences_{email})
  // 3) googleDriveSettings_{email}
  // We'll try to extract an id (preferred) or at least a filename.
  let persistedFileRef: { id?: string; name?: string } | null = null;
  try {
    // Primary canonical key
    const raw = localStorage.getItem('app:libraryFileReference');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.id || parsed.name)) persistedFileRef = { id: parsed.id, name: parsed.name };
    }

    // If not found, scan likely user preference keys for songs/recipes panels
    if (!persistedFileRef) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (key.startsWith('songsUserPreferences_') || key.startsWith('recipesUserPreferences_') || key.startsWith('songsUserPreferences_') || key.startsWith('googleDriveSettings_') || key.startsWith('songsUserPreferences_')) {
          try {
            const val = JSON.parse(String(localStorage.getItem(key)));
            if (val) {
              // Common shapes: { selectedFileId, selectedFile, songsLibraryFile, panelsLibraryFile }
              if (val.selectedFileId) {
                persistedFileRef = { id: val.selectedFileId, name: val.selectedFileName || val.songsLibraryFile || val.panelsLibraryFile };
                break;
              }
              if (val.selectedFile && val.selectedFile.id) {
                persistedFileRef = { id: val.selectedFile.id, name: val.selectedFile.name || val.selectedFile.fileName };
                break;
              }
              // If we only have a filename, keep it as name (no id)
              if (val.songsLibraryFile || val.recipesLibraryFile || val.panelsLibraryFile || val.songsLibraryFile) {
                persistedFileRef = { name: val.songsLibraryFile || val.recipesLibraryFile || val.panelsLibraryFile };
                // continue scanning to prefer an actual file id if available
              }
            }
          } catch (err) {
            // ignore JSON parse errors
          }
        }
      }
    }
  } catch (e) {
    // ignore parse errors; we'll treat as no persisted file
    persistedFileRef = persistedFileRef || null;
  }

  // Do not automatically load libraries on mount. Loading requires Drive initialization.
  // Provide a manual refresh button so users can opt-in to Drive operations.

  const detectPersistedLibrary = () => {
    const results: Array<{ key: string; value: any }> = [];
    try {
      // Check canonical key first
      const canonicalRaw = localStorage.getItem('app:libraryFileReference');
      if (canonicalRaw) {
        try {
          results.push({ key: 'app:libraryFileReference', value: JSON.parse(canonicalRaw) });
        } catch (e) {
          results.push({ key: 'app:libraryFileReference', value: canonicalRaw });
        }
      }

      // Scan for other likely preference keys that may embed selected file references
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (!key) continue;
        if (
          key.startsWith('songsUserPreferences_') ||
          key.startsWith('recipesUserPreferences_') ||
          key.startsWith('googleDriveSettings_') ||
          key.startsWith('songsUserPreferences_') ||
          key.startsWith('recipesUserPreferences_')
        ) {
          const raw = String(localStorage.getItem(key));
          try {
            results.push({ key, value: JSON.parse(raw) });
          } catch (e) {
            results.push({ key, value: raw });
          }
        }
      }
    } catch (e) {
      // ignore
    }

    setScanResults(results);
    if (!results.length) message.info('No persisted library-related keys found in localStorage');
    else message.success('Found ' + results.length + ' candidate keys in localStorage');
  };

  const handleOpen = async (item: any) => {
    try {
      // If the item represents a library file (fileId) we load the full library; otherwise
      // attempt to open a single entry (song/recipe/panel) from the current library using openEntry.
      if (item && item.fileId) {
        const { loadFullLibraryById } = await import('../utils/libraryThunks');
        const lib = await loadFullLibraryById(item.fileId);
        onOpen && onOpen(lib, { id: item.fileId, name: item.fileName || item.name });
      } else if (item && item.type && item.id) {
        // Open a specific entry (panel/song/recipe)
        const { openEntry } = await import('../store/librarySlice');
        const res = await dispatch(openEntry({ id: item.id, type: item.type }));
        const entry = res && res.payload ? res.payload : null;
        onOpen && onOpen(entry, null);
      } else {
        onOpen && onOpen(null);
      }
      onClose();
    } catch (err: any) {
      message.error('Failed to open library: ' + String(err));
    }
  };

  const handleOpenSettings = () => {
    dispatch(openLibrarySettingsModal('panels'));
    onClose();
  };

  return (
    <Modal open={visible} title="Open Library" onCancel={onClose} footer={null}>
      {(!isSignedIn && !selectedFile && !persistedFileRef) ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Typography.Paragraph>No Google sign-in detected. Sign in or open library settings to connect a library.</Typography.Paragraph>
          <div>
            <Button type="primary" onClick={handleOpenSettings}>Open Library Settings</Button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
            <Button onClick={async () => {
              try {
                const { loadFullLibrary } = await import('../utils/libraryThunks');
                // trigger a load to refresh state.library via helper
                await loadFullLibrary();
                message.success('Library refreshed');
              } catch (err: any) {
                message.error('Failed to refresh library: ' + String(err));
              }
            }}>Refresh</Button>
            <Button onClick={() => detectPersistedLibrary()}>Detect persisted library</Button>
            <Button onClick={handleOpenSettings}>Library Settings</Button>
          </div>

          {(selectedFile || persistedFileRef) && (
            <div style={{ marginBottom: 12 }}>
              <Typography.Paragraph>Selected library: <strong>{(selectedFile && (selectedFile.name || selectedFile.id)) || (persistedFileRef && (persistedFileRef.name || persistedFileRef.id))}</strong></Typography.Paragraph>
              <Button onClick={async () => {
                try {
                  const fileRefToOpen = selectedFile || persistedFileRef;
                  if (!fileRefToOpen || !fileRefToOpen.id) throw new Error('No persisted library file id available');
                  const { loadFullLibraryById } = await import('../utils/libraryThunks');
                  const lib = await loadFullLibraryById(fileRefToOpen.id);
                  // If lib contains panels, present them in the entries list instead of trying to open whole library
                  if (lib && lib.panels) {
                    // Replace the entries view with panels list (map to list item shape)
                    const panelEntries = Object.keys(lib.panels).map((k) => ({ id: k, type: 'panel', title: lib.panels[k].name || k, payload: lib.panels[k] }));
                    // Show a temporary modal listing panels to open
                    Modal.info({
                      title: 'Panels in library',
                      width: 640,
                      okText: 'Close',
                      content: (
                        <div>
                          <List
                            size="small"
                            dataSource={panelEntries}
                            renderItem={(p: any) => (
                              <List.Item style={{ cursor: 'pointer' }} onClick={async () => {
                                try {
                                  onOpen && onOpen(p.payload || null, fileRefToOpen);
                                  onClose();
                                } catch (err) {
                                  message.error('Failed to open panel: ' + String(err));
                                }
                              }}>{p.title}</List.Item>
                            )}
                          />
                        </div>
                      )
                    });
                  } else {
                    onOpen && onOpen(lib, fileRefToOpen);
                    onClose();
                  }
                } catch (err: any) {
                  message.error('Failed to load selected library: ' + String(err));
                }
              }}>Open Selected Library</Button>
            </div>
          )}

          {/* Debug info: show the raw selectedFile and persistedFileRef so developers can see why the dialog
              may be showing the sign-in message even when a persisted reference exists. */}
          <div style={{ marginTop: 8 }}>
            <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
              Debug: selectedFile: {JSON.stringify(selectedFile)}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
              Debug: persistedFileRef: {JSON.stringify(persistedFileRef)}
            </Typography.Paragraph>
            {scanResults.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 6 }}>Detected localStorage candidates:</Typography.Paragraph>
                {scanResults.map((r) => (
                  <Typography.Paragraph key={r.key} type="secondary" style={{ fontSize: 11, marginBottom: 4 }}>
                    <strong>{r.key}</strong>: {JSON.stringify(r.value)}
                  </Typography.Paragraph>
                ))}
              </div>
            )}
          </div>

          {isLoading ? <Spin /> : (
            <List dataSource={entries} renderItem={(item: any) => (
              <List.Item onClick={() => handleOpen(item)} style={{ cursor: 'pointer' }}>
                {item.title || item.name || item.fileName}
              </List.Item>
            )} />
          )}
        </div>
      )}
    </Modal>
  );
}
