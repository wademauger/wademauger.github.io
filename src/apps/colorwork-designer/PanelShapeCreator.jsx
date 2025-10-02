import React, { useMemo, useState, useCallback } from 'react';
import { Card, Button, InputNumber, Space, Row, Col, Typography, List, Divider } from 'antd';
import { Switch } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { PanelDiagram } from '@/components/PanelDiagram.jsx';
import GoogleDriveServiceModern from '../songs/services/GoogleDriveServiceModern';
import { useDriveAuth } from './context/DriveAuthContext.jsx';
import { Panel } from '@/models/Panel';
import mergePanelIntoLibrary from '@/utils/libraryMerge';
import { Modal, message } from 'antd';
import { useDispatch } from 'react-redux';
import { openModal } from '@/reducers/modal.reducer';
import { MODAL_TYPES } from '@/reducers/modal.reducer';

const { Text } = Typography;

// Simple id generator
const genId = () => `trap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultTrap = () => ({
  id: genId(),
  height: 40,
  baseA: 20,
  baseB: 30,
  baseBHorizontalOffset: 0,
  successors: [],
  label: null, // Will be assigned when computing labels
  isHem: false, // Whether this trapezoid is a hem (folded) - render at half height
  shortRows: []
});

const defaultChild = () => ({
  id: genId(),
  height: 12,
  baseA: 16,
  baseB: 12,
  baseBHorizontalOffset: 0,
  successors: [],
  label: null, // Will be assigned when computing labels
  isHem: false,
  shortRows: []
});

const defaultShortRow = () => ({
  id: `sr-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
  label: null,
  posX: 0.5,
  posY: 0.5, // centered by default
  // height in same units as trapezoid (inches). Width is implied by bases.
  height: 2,
  // Optional explicit bases: start/end base and pivot (turn) base. If omitted, width is used.
  baseStart: 5, // start base is assumed to match end base always
  basePivot: 1 // default to 0 means the short row comes to a point
});

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function findNodeAndParent(root, id, parent = null) {
  if (!root) return { node: null, parent: null, indexInParent: -1 };
  if (root.id === id) return { node: root, parent, indexInParent: -1 };
  for (let i = 0; i < (root.successors || []).length; i++) {
    const child = root.successors[i];
    const res = findNodeAndParent(child, id, root);
    if (res.node) return { ...res, indexInParent: parent === root ? i : res.indexInParent };
  }
  return { node: null, parent: null, indexInParent: -1 };
}

function enumerateTrapezoids(root) {
  // Preorder traversal to build a stable label map A, B, C...
  const labels = {};
  let index = 0;
  const stack = [root];
  const toLetter = (n) => {
    // Excel-like letters: A, B, ..., Z, AA, AB, ... if many nodes
    let s = '';
    n += 1; // 1-based
    while (n > 0) {
      const rem = (n - 1) % 26;
      s = String.fromCharCode(65 + rem) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  };
  while (stack.length) {
    const n = stack.pop();
    if (!n) continue;
    labels[n.id] = toLetter(index++);
    // push children in reverse so natural order is left-to-right when popping
    if (n.successors && n.successors.length) {
      for (let i = n.successors.length - 1; i >= 0; i--) stack.push(n.successors[i]);
    }
  }
  return labels;
}

function assignLabelsToTrapezoids(root) {
  // Assign labels directly to trapezoid objects
  const labels = enumerateTrapezoids(root);
  const cloneDeep = (node) => {
    if (!node) return node;
    const n = { ...node };
    n.label = labels[node.id];
    n.title = labels[node.id] ? `Trapezoid ${labels[node.id]}` : 'Trapezoid';
    if (n.successors && n.successors.length) {
      n.successors = n.successors.map(cloneDeep);
    }
    return n;
  };
  return cloneDeep(root);
}

function updateNode(root, id, updater) {
  const next = clone(root);
  const stack = [next];
  while (stack.length) {
    const n = stack.pop();
    if (n.id === id) {
      updater(n);
      break;
    }
    (n.successors || []).forEach(c => stack.push(c));
  }
  return next;
}

function removeNode(root, id) {
  if (root.id === id) return root; // do not remove root
  const next = clone(root);
  const queue = [next];
  while (queue.length) {
    const n = queue.shift();
    if (!n.successors) continue;
    const idx = n.successors.findIndex(c => c.id === id);
    if (idx !== -1) {
      n.successors.splice(idx, 1);
      break;
    }
    n.successors.forEach(c => queue.push(c));
  }
  return next;
}

function addChild(root, parentId) {
  const next = clone(root);
  const stack = [next];
  while (stack.length) {
    const n = stack.pop();
    if (n.id === parentId) {
      n.successors = n.successors || [];
      n.successors.push(defaultChild());
      break;
    }
    (n.successors || []).forEach(c => stack.push(c));
  }
  return next;
}

function reorderChildren(root, parentId, from, to) {
  const next = clone(root);
  const stack = [next];
  while (stack.length) {
    const n = stack.pop();
    if (n.id === parentId) {
      if (!n.successors) break;
      const arr = n.successors;
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      break;
    }
    (n.successors || []).forEach(c => stack.push(c));
  }
  return next;
}

export default function PanelShapeCreator() {
  const [root, setRoot] = useState(() => assignLabelsToTrapezoids(defaultTrap()));
  const [selectedId, setSelectedId] = useState(root.id);
  const [selectedShortRowId, setSelectedShortRowId] = useState(null);

  const selectedInfo = useMemo(() => findNodeAndParent(root, selectedId), [root, selectedId]);
  const selected = selectedInfo.node || root;

  // Generic field handler for numeric fields — preserve falsy 0 values
  const handleField = useCallback((key, value) => {
    setRoot(prev => updateNode(prev, selected.id, (n) => { n[key] = (value === undefined || value === null) ? 0 : value; }));
  }, [selected?.id]);

  // Toggle boolean fields like isHem
  const handleToggle = useCallback((key, value) => {
    setRoot(prev => updateNode(prev, selected.id, (n) => { n[key] = !!value; }));
  }, [selected?.id]);

  const handleAddChild = useCallback(() => setRoot(prev => assignLabelsToTrapezoids(addChild(prev, selected.id))), [selected?.id]);
  const handleRemove = useCallback(() => setRoot(prev => assignLabelsToTrapezoids(removeNode(prev, selected.id))), [selected?.id]);
  const handleDuplicate = useCallback(() => {
    // duplicate selected as new sibling (or child of root if selected is root)
    if (selected.id === root.id) {
      setRoot(prev => ({ ...clone(prev), id: prev.id })); // no-op for root
      return;
    }
    const { parent } = findNodeAndParent(root, selected.id);
    if (!parent) return;
    const copy = clone(selected);
    copy.id = genId();
    const next = clone(root);
    const stack = [next];
    while (stack.length) {
      const n = stack.pop();
      if (n.id === parent.id) {
        const idx = n.successors.findIndex(c => c.id === selected.id);
        n.successors.splice(idx + 1, 0, copy);
        break;
      }
      (n.successors || []).forEach(c => stack.push(c));
    }
  setRoot(assignLabelsToTrapezoids(next));
  }, [root, selected]);

  const children = selected?.successors || [];
  const shortRows = selected?.shortRows || [];

  const { GoogleDriveServiceModern: DriveService } = useDriveAuth();
  const dispatch = useDispatch();

  const saveAs = async () => {
    try {
      // console.log('PanelShapeCreator.saveAs invoked');
      const panel = new Panel(selected, undefined, 1);
      const payload = panel.toJSON();

      // Always open the LibrarySettingsModal in 'panels' context so the user can pick filename/folder
      const svc = DriveService || GoogleDriveServiceModern;

      // Register callback in registry and pass the id into modal state (serializable)
      const { registerCallback } = await import('@/utils/modalCallbackRegistry');
      // Accept the modal's top-level `panelName` and `selectedSettings` arguments (passed by LibraryModal)
      const cbId = registerCallback(async ({ libraryData, fileStatus, panelName, selectedSettings }) => {
        console.log('PanelShapeCreator: modal callback invoked', { fileStatus, panelName, selectedSettings });
        try {
          if (fileStatus && fileStatus.fileId) {
            // Prefer the explicit panelName supplied by the modal (top-level) if present.
            // Fall back to libraryData.panelName, the embedded panel name, or derive from filename.
            const modalPanelName = panelName || (libraryData && libraryData.panelName) || (libraryData && libraryData.panel && libraryData.panel.name);
            const keyFromFile = (fileStatus.fileName || 'panel').replace('.json', '');
            const key = modalPanelName || keyFromFile;

            // Build a minimal payload that prefers the explicit panelName when present.
            const savePayload = { panel: payload, panelName: key, lastUpdated: new Date().toISOString() };

            // If a panel with this key already exists in the library, confirm with the user before overwriting.
            const existingPanel = libraryData && libraryData.panels && (libraryData.panels[key] || libraryData.panels[key.replace('.json','')]);
            if (existingPanel) {
              // Use Ant Design confirm dialog
              const confirmed = await new Promise((resolve) => {
                Modal.confirm({
                  title: 'Replace existing panel?',
                  content: `A panel named "${key}" already exists in the selected library. Replace it?`,
                  okText: 'Replace',
                  cancelText: 'Cancel',
                  onOk: () => resolve(true),
                  onCancel: () => resolve(false)
                });
              });
              if (!confirmed) {
                console.log('PanelShapeCreator: user canceled overwrite for panel', key);
                message.info('Save canceled');
                return;
              }
            }

            if (svc.saveLibraryToFile) {
              console.log('PanelShapeCreator: will fetch latest library and merge panel into existing library then call saveLibraryToFile for', fileStatus.fileId, 'panelName=', key);
                // Always try to load the freshest library content from the service before merging
                let currentLib = null;
                try {
                  if (svc.loadLibraryById) {
                    currentLib = await svc.loadLibraryById(fileStatus.fileId);
                  }
                } catch (ldErr) {
                  console.warn('PanelShapeCreator: failed to load library by id before merge, falling back to modal-provided libraryData', ldErr);
                  currentLib = libraryData && typeof libraryData === 'object' ? { ...libraryData } : null;
                }

                const libToSave = mergePanelIntoLibrary(currentLib, key, payload);
                console.log('PanelShapeCreator: merged library object (preview):', {
                  panelsKeys: Object.keys(libToSave.panels || {}).slice(0, 20),
                  panelInserted: !!libToSave.panels && !!libToSave.panels[key],
                  lastUpdated: libToSave.lastUpdated
                });

                try {
                  const res = await svc.saveLibraryToFile(fileStatus.fileId, libToSave);
                  console.log('PanelShapeCreator: saveLibraryToFile result', res);
                } catch (err) {
                  console.warn('PanelShapeCreator: saveLibraryToFile failed with merged payload, falling back to shorthand savePayload', err);
                  // Fallback to original shorthand in case the service expects that format
                  const res = await svc.saveLibraryToFile(fileStatus.fileId, savePayload);
                  console.log('PanelShapeCreator: saveLibraryToFile fallback result', res);
                }
            } else {
              // Fallback: if the service doesn't support saveLibraryToFile, build the full library
              // object and call the generic save method so older services keep working.
              let lib = libraryData || { panels: {}, lastUpdated: new Date().toISOString() };
              lib.panels = lib.panels || {};

              // If the panel already exists, confirm before overwriting (catch cases where libraryData exists but panels missing key)
              if (lib.panels[key]) {
                const confirmed2 = await new Promise((resolve) => {
                  Modal.confirm({
                    title: 'Replace existing panel?',
                    content: `A panel named "${key}" already exists in the selected library. Replace it?`,
                    okText: 'Replace',
                    cancelText: 'Cancel',
                    onOk: () => resolve(true),
                    onCancel: () => resolve(false)
                  });
                });
                if (!confirmed2) {
                  console.log('PanelShapeCreator: user canceled overwrite for panel (fallback)', key);
                  message.info('Save canceled');
                  return;
                }
              }

              lib.panels[key] = payload;
              await svc.saveLibrary(lib);
            }

            message.success(`Saved to Google Drive: ${fileStatus.fileName} (id: ${fileStatus.fileId})`);
          } else {
              // No explicit fileId returned - try to locate an existing library file by the service's
              // configured filename before creating a new file. This prevents creating duplicate files
              // with the same name.
              const libraryFilename = (svc.getLibraryFilename && svc.getLibraryFilename()) || 'panels-library.json';
              const typed = selectedSettings || {};
              
              // Normalize folder: ensure leading slash, no trailing slash (except root)
              const normalizeFolder = (f) => {
                if (!f) return '/';
                let s = String(f).trim();
                // If user pasted a full path with filename, we'll split below
                if (!s.startsWith('/')) s = '/' + s;
                if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
                return s || '/';
              };
              
              const candidateFilename = (typed.panelsLibraryFile || typed.libraryFile || typed.fileName || typed.filename || null) || libraryFilename;
              
              try {
                // Prefer the filename/folder the user typed in the modal when probing for an existing file.
                // Support several field names and normalize the path so typing the same path (with or without
                // a trailing slash, or including the filename in the folder field) will match existing files.
                const candidates = [];
                const candidateFolder = (typed.panelsFolder || typed.folder || typed.path || typed.directory || null) || '/';

                const normFolder = normalizeFolder(candidateFolder);

                // Primary candidate: typed filename + typed folder
                candidates.push({ filename: candidateFilename, folder: normFolder });

                // Build filename variants (with/without .json, lowercase, uppercase) to improve matching
                const makeVariants = (name) => {
                  if (!name) return [];
                  const n = String(name).trim();
                  const variants = new Set();
                  variants.add(n);
                  if (!n.toLowerCase().endsWith('.json')) variants.add(n + '.json');
                  if (n.toLowerCase().endsWith('.json')) variants.add(n.replace(/\.json$/i, ''));
                  variants.add(n.toLowerCase());
                  variants.add(n.toUpperCase());
                  return Array.from(variants).filter(Boolean);
                };

                const filenameVariants = makeVariants(candidateFilename || libraryFilename);
                for (const vf of filenameVariants) {
                  candidates.push({ filename: vf, folder: normFolder });
                }

                // If folder looks like it includes a filename (e.g. '/path/panels-library.json'), split that
                const folderParts = candidateFolder ? String(candidateFolder).trim().split('/') : [];
                if (folderParts.length > 1) {
                  const lastPart = folderParts[folderParts.length - 1];
                  if (lastPart && lastPart.includes('.') && lastPart !== '') {
                    // Treat lastPart as filename and the rest as folder
                    const inferredFilename = lastPart;
                    const inferredFolder = '/' + folderParts.slice(0, -1).filter(Boolean).join('/');
                    candidates.push({ filename: inferredFilename, folder: normalizeFolder(inferredFolder) });
                  }
                }

                // Also try root folder in case user omitted folder or service saved in root
                candidates.push({ filename: candidateFilename, folder: '/' });

                // Also try service default filename in the typed folder
                candidates.push({ filename: libraryFilename, folder: normFolder });

                // De-duplicate candidates
                const seen = new Set();
                const uniqCandidates = candidates.filter(c => {
                  const key = `${c.folder}::${c.filename}`;
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                });

                let found = null;
                for (const c of uniqCandidates) {
                  try {
                    if (!svc.findFile) continue;
                    const probe = await svc.findFile(c.filename, c.folder);
                    if (probe && probe.found && probe.fileId) {
                      found = probe;
                      break;
                    }
                  } catch (e) {
                    // ignore and continue trying other candidates
                    console.warn('PanelShapeCreator: findFile candidate probe failed', c, e);
                  }
                }

                if (found && found.found && found.fileId) {
                  // Load the existing file and merge/confirm overwrite
                  const existingLib = await svc.loadLibraryById(found.fileId);
                  const key = 'panel';
                  const existingPanel = existingLib && existingLib.panels && existingLib.panels[key];
                  if (existingPanel) {
                    const confirmed = await new Promise((resolve) => {
                      Modal.confirm({
                        title: 'Replace existing panel?',
                        content: `A panel named "${key}" already exists in ${found.fileName}. Replace it?`,
                        okText: 'Replace',
                        cancelText: 'Cancel',
                        onOk: () => resolve(true),
                        onCancel: () => resolve(false)
                      });
                    });
                    if (!confirmed) {
                      message.info('Save canceled');
                      return;
                    }
                  }
                  existingLib.panels = existingLib.panels || {};
                  existingLib.panels[key] = payload;
                  await svc.saveLibraryToFile(found.fileId, existingLib);
                  message.success(`Saved to Google Drive: ${found.fileName} (id: ${found.fileId})`);
                  return;
                }
              } catch (probeErr) {
                console.warn('PanelShapeCreator: error probing for existing library file', probeErr);
              }

              // No existing file found - prefer a createOrUpdate call if the service supports it
              try {
                const typed = selectedSettings || {};
                const filename = (typed.panelsLibraryFile || typed.libraryFile || candidateFilename || libraryFilename);
                const folderPath = normalizeFolder((typed.panelsFolder || typed.folder || '/') );

                if (svc.createOrUpdateLibraryFile) {
                  // Ask the service to create or update the library and insert/replace our panel entry
                  const opts = {
                    fileId: null,
                    folderPath: folderPath,
                    fileName: filename,
                    namespace: 'panels',
                    entry: { id: (payload && payload.id) || `panel-${Date.now()}`, name: (payload && payload.name) || 'panel', ...payload },
                    replaceExisting: true
                  };
                  const res = await svc.createOrUpdateLibraryFile(opts);
                  if (res && (res.fileId || res.fileId === 0 || res.id)) {
                    const fid = res.fileId || res.id;
                    const fname = (res.result && res.result.name) || filename;
                    message.success(`Saved to Google Drive: ${fname} (id: ${fid})`);
                  } else if (res && res.result && res.result.id) {
                    message.success(`Saved to Google Drive: ${res.result.name} (id: ${res.result.id})`);
                  } else {
                    message.success('Saved to Google Drive (file created/updated)');
                  }
                } else {
                  // Fallback: No createOrUpdate API - create a minimal library and call saveLibrary
                  let lib = { panels: {}, lastUpdated: new Date().toISOString() };
                  const key = 'panel';
                  lib.panels[key] = payload;
                  await svc.saveLibrary(lib);
                  const saved = await svc.findLibraryFile ? await svc.findLibraryFile(candidateFilename || libraryFilename, '/') : await svc.findLibraryFile();
                  if (saved && (saved.fileId || saved.id)) {
                    message.success(`Saved to Google Drive: ${saved.fileName || saved.name} (id: ${saved.fileId || saved.id})`);
                  } else {
                    message.success('Saved to Google Drive (file created/updated)');
                  }
                }
              } catch (createErr) {
                console.error('PanelShapeCreator: error creating new library file', createErr);
                message.error('Failed to create library file: ' + String(createErr));
              }
          }
        } catch (err) {
          console.error('PanelShapeCreator: Failed to save panel via modal callback', err);
          message.error('Failed to save panel: ' + String(err));
        }
      });

      // Open the library settings modal and include the callback id in the initial modal data
      dispatch(openModal({
        modalType: MODAL_TYPES.LIBRARY_SETTINGS,
        appContext: 'panels',
        data: {
          currentSettings: {
            // Force panels-specific default filename to avoid accidentally saving into the songs library
            panelsLibraryFile: 'panels-library.json',
            panelsFolder: '/'
          },
          userInfo: null,
          onSelectFileCallbackId: cbId
        }
      }));

  
    } catch (error) {
      console.error('Save failed', error);
  message.error('Save failed: ' + String(error));
    }
  };

  const openFromDrive = async () => {
    try {
      const svc = DriveService || GoogleDriveServiceModern;
      const library = await svc.loadLibrary();
      if (!library || !library.panels) {
  message.info('No panels found in Drive library');
        return;
      }
      const names = Object.keys(library.panels || {});
      if (!names.length) {
  message.info('No panels found in Drive library');
        return;
      }
      const choice = window.prompt('Open which panel?\n' + names.join('\n'), names[0]);
      if (!choice) return;
      const panelJson = library.panels[choice] || library.panels[choice.replace('.json','')];
      if (!panelJson) {
  message.error('Panel not found: ' + choice);
        return;
      }
      const p = Panel.fromObject(panelJson);
      setRoot(assignLabelsToTrapezoids(p.shape));
      setSelectedId(p.shape.id);
  message.success('Loaded panel: ' + choice);
    } catch (err) {
      console.error('Open failed', err);
  message.error('Open failed: ' + String(err));
    }
  };

  // Global event listeners for toolbar actions
  React.useEffect(() => {
    const onSave = () => { console.log('colorwork:save-as event received'); saveAs(); };
    const onOpen = () => { console.log('colorwork:open event received'); openFromDrive(); };
    window.addEventListener('colorwork:save-as', onSave);
    window.addEventListener('colorwork:open', onOpen);
    return () => {
      window.removeEventListener('colorwork:save-as', onSave);
      window.removeEventListener('colorwork:open', onOpen);
    };
  }, [saveAs]);

  // Short-row helpers: add/remove/duplicate/reorder/update
  const addShortRow = useCallback(() => {
    setRoot(prev => updateNode(prev, selected.id, (n) => { n.shortRows = n.shortRows || []; n.shortRows.push(defaultShortRow()); }));
  }, [selected?.id]);

  const removeShortRow = useCallback(() => {
    if (!selectedShortRowId) return;
    setRoot(prev => updateNode(prev, selected.id, (n) => { n.shortRows = (n.shortRows || []).filter(s => s.id !== selectedShortRowId); }));
    setSelectedShortRowId(null);
  }, [selected?.id, selectedShortRowId]);

  const duplicateShortRow = useCallback(() => {
    if (!selectedShortRowId) return;
    setRoot(prev => updateNode(prev, selected.id, (n) => {
      n.shortRows = n.shortRows || [];
      const idx = n.shortRows.findIndex(s => s.id === selectedShortRowId);
      if (idx === -1) return;
      const copy = { ...n.shortRows[idx], id: `sr-${Date.now()}-${Math.random().toString(36).slice(2,6)}` };
      n.shortRows.splice(idx + 1, 0, copy);
    }));
  }, [selected?.id, selectedShortRowId]);

  // short rows are positioned individually; no reordering needed

  const updateShortRowField = useCallback((id, key, value) => {
    // clamp posX/posY
    const v = (key === 'posX' || key === 'posY') ? Math.max(0, Math.min(1, value)) : value;
    setRoot(prev => updateNode(prev, selected.id, (n) => {
      if (!n.shortRows) return;
      const idx = n.shortRows.findIndex(s => s.id === id);
      if (idx === -1) return;
      n.shortRows[idx] = { ...n.shortRows[idx], [key]: v };
    }));
  }, [selected?.id]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Preview */}
      <div style={{ flex: 1, minWidth: 360, padding: 16 }}>
        <Card size="small" title="Preview">
          <PanelDiagram 
            key={JSON.stringify(root)} // Force re-render when structure changes
            shape={root} 
            size={560} 
            padding={20} 
            selectedId={selectedId}
            selectedShortRowId={selectedShortRowId}
            onSelect={(id) => id && setSelectedId(id)}
          />
        </Card>
      </div>
      <div style={{ width: 440, padding: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 8 }}>
            <Button size="small" onClick={() => setSelectedId(root.id)} disabled={selected.id === root.id}>Select Root</Button>
            <Button size="small" onClick={() => selectedInfo.parent && setSelectedId(selectedInfo.parent.id)} disabled={!selectedInfo.parent}>Select Parent</Button>
          </Space>

          <Card size="small" title="Geometry">
            <Row gutter={8}>
              <Col span={12}>
                <Text>Height</Text>
                <InputNumber value={selected.height} min={0} onChange={(v) => handleField('height', v)} style={{ width: '100%' }} />
              </Col>
              <Col span={12}>
                <Text>Lower Base (A)</Text>
                <InputNumber value={selected.baseA} min={0} onChange={(v) => handleField('baseA', v)} style={{ width: '100%' }} />
              </Col>
            </Row>
            <Row gutter={8} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text>Upper Base (B)</Text>
                <InputNumber value={selected.baseB} min={0} onChange={(v) => handleField('baseB', v)} style={{ width: '100%' }} />
              </Col>
              <Col span={12}>
                <Text>Horizontal Offset</Text>
                <InputNumber value={selected.baseBHorizontalOffset} onChange={(v) => handleField('baseBHorizontalOffset', v)} style={{ width: '100%' }} />
              </Col>
            </Row>

            <Row style={{ marginTop: 12 }} gutter={8}>
              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ whiteSpace: 'nowrap', marginRight: 8 }}>Is Hem</Text>
                  <Switch checked={!!selected.isHem} onChange={(v) => handleToggle('isHem', v)} />
                </div>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="Children">
            <Space style={{ marginBottom: 8 }}>
              <Button icon={<PlusOutlined />} onClick={handleAddChild}>Add Child</Button>
              <Button icon={<CopyOutlined />} onClick={handleDuplicate}>Duplicate</Button>
              <Button icon={<DeleteOutlined />} danger onClick={handleRemove} disabled={selected.id === root.id}>Remove</Button>
            </Space>
            <List
              size="small"
              bordered
              dataSource={children}
              rowKey={(item) => `${item.id}-${item.label || 'none'}`} // Include label in key to force re-render
              locale={{ emptyText: 'No children' }}
              renderItem={(item, index) => (
                <List.Item
                  style={{ cursor: 'pointer', background: item.id === selectedId ? '#f0f7ff' : 'transparent' }}
                  onClick={() => setSelectedId(item.id)}
                  actions={[
                    <Button key="up" icon={<ArrowUpOutlined />} size="small" disabled={index === 0}
                      onClick={(e) => { e.stopPropagation(); setRoot(prev => reorderChildren(prev, selected.id, index, index - 1)); }} />,
                    <Button key="down" icon={<ArrowDownOutlined />} size="small" disabled={index === children.length - 1}
                      onClick={(e) => { e.stopPropagation(); setRoot(prev => reorderChildren(prev, selected.id, index, index + 1)); }} />
                  ]}
                >
                  <Space>
                    <Text strong>{item.label ? `Trapezoid ${item.label}` : 'Trapezoid'}</Text>
                    <Text type="secondary">h:{item.height} A:{item.baseA} B:{item.baseB} off:{item.baseBHorizontalOffset}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          <Card size="small" title="Short Rows">
            <Space style={{ marginBottom: 8 }}>
              <Button icon={<PlusOutlined />} onClick={addShortRow}>Add Short Row</Button>
              <Button icon={<CopyOutlined />} onClick={duplicateShortRow} disabled={!selectedShortRowId}>Duplicate</Button>
              <Button icon={<DeleteOutlined />} danger onClick={removeShortRow} disabled={!selectedShortRowId}>Remove</Button>
            </Space>
            <List
              size="small"
              bordered
              dataSource={shortRows}
              rowKey={(item) => `${item.id}-${item.label || 'none'}`}
              locale={{ emptyText: 'No short rows' }}
              renderItem={(item, index) => (
                <List.Item
                  style={{ cursor: 'pointer', background: item.id === selectedShortRowId ? '#f0f7ff' : 'transparent' }}
                  onClick={() => setSelectedShortRowId(item.id)}
                >
                  <Space direction="vertical">
                    <Text strong>{item.label ? item.label : `Short Row ${index + 1}`}</Text>
                    <Text type="secondary">x:{(item.posX||0).toFixed(2)} y:{(item.posY||0).toFixed(2)} h:{(item.height||0).toFixed(2)}" A:{(item.baseStart||0).toFixed(2)} B:{(item.basePivot||0).toFixed(2)}</Text>
                  </Space>
                </List.Item>
              )}
            />

            {selectedShortRowId ? (
              (() => {
                const sr = (shortRows || []).find(s => s.id === selectedShortRowId);
                if (!sr) return null;
                return (
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{sr.label || `Short Row ${shortRows.indexOf(sr) + 1}`}</Text>
                    <Row gutter={8}>
                      <Col span={12}>
                        <Text>Pos X</Text>
                        <InputNumber min={0} max={1} step={0.01} value={sr.posX} onChange={(v) => updateShortRowField(sr.id, 'posX', v)} style={{ width: '100%' }} />
                      </Col>
                      <Col span={12}>
                        <Text>Pos Y</Text>
                        <InputNumber min={0} max={1} step={0.01} value={sr.posY} onChange={(v) => updateShortRowField(sr.id, 'posY', v)} style={{ width: '100%' }} />
                      </Col>
                    </Row>
                    <Row gutter={8} style={{ marginTop: 8 }}>
                      <Col span={12}>
                        <Text>Height (in)</Text>
                        <InputNumber min={0} step={0.1} value={sr.height} onChange={(v) => updateShortRowField(sr.id, 'height', v)} style={{ width: '100%' }} />
                      </Col>
                      <Col span={12}>
                        <Text> </Text>
                      </Col>
                    </Row>
                    <Row gutter={8} style={{ marginTop: 8 }}>
                      <Col span={12}>
                        <Text>Base Start (in)</Text>
                        <InputNumber min={0} step={0.1} value={sr.baseStart} onChange={(v) => updateShortRowField(sr.id, 'baseStart', v)} style={{ width: '100%' }} />
                      </Col>
                      <Col span={12}>
                        <Text>Base Pivot (in)</Text>
                        <InputNumber min={0} step={0.1} value={sr.basePivot} onChange={(v) => updateShortRowField(sr.id, 'basePivot', v)} style={{ width: '100%' }} />
                      </Col>
                    </Row>
                    {/* Label is intentionally omitted for short rows */}
                  </div>
                );
              })()
            ) : null}

          </Card>

          <Divider />
          <Text type="secondary">Tip: Select a child to edit its geometry, use arrows to reorder, or Add Child to grow the tree.</Text>
        </Space>
      </div>
    </div>
  );
}
