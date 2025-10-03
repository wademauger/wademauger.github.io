import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Card, Button, InputNumber, Space, Row, Col, Typography, List, Divider } from 'antd';
import { Switch } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PlusOutlined, DeleteOutlined, CopyOutlined, SettingOutlined, SaveOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { PanelDiagram } from '@/components/PanelDiagram';
import { useDriveAuth } from './context/DriveAuthContext';
import { Panel } from '@/models/Panel';
import { message } from 'antd';
import { LibrarySettingsModal, OpenModal, SaveAsModal } from '@/components/modals';
import { useDropdown } from '@/components/DropdownProvider';


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
    (n.successors || []).forEach((c: any) => stack.push(c));
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
    const idx = n.successors.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      n.successors.splice(idx, 1);
      break;
    }
    n.successors.forEach((c: any) => queue.push(c));
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
    (n.successors || []).forEach((c: any) => stack.push(c));
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
    (n.successors || []).forEach((c: any) => stack.push(c));
  }
  return next;
}

export default function PanelShapeCreator() {
  const [root, setRoot] = useState(() => assignLabelsToTrapezoids(defaultTrap()));
  const [selectedId, setSelectedId] = useState(root.id);
  const [selectedShortRowId, setSelectedShortRowId] = useState(null);

  // Modal visibility state
  const [showSettings, setShowSettings] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);

  // Register dropdown menu items
  const { setMenuItems } = useDropdown();

  const selectedInfo = useMemo(() => findNodeAndParent(root, selectedId), [root, selectedId]);
  const selected = selectedInfo.node || root;

  // Generic field handler for numeric fields — preserve falsy 0 values
  const handleField = useCallback((key, value: any) => {
    setRoot(prev => updateNode(prev, selected.id, (n) => { n[key] = (value === undefined || value === null) ? 0 : value; }));
  }, [selected?.id]);

  // Toggle boolean fields like isHem
  const handleToggle = useCallback((key, value: any) => {
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
        const idx = n.successors.findIndex((c: any) => c.id === selected.id);
        n.successors.splice(idx + 1, 0, copy);
        break;
      }
      (n.successors || []).forEach((c: any) => stack.push(c));
    }
  setRoot(assignLabelsToTrapezoids(next));
  }, [root, selected]);

  const children = selected?.successors || [];
  const shortRows = selected?.shortRows || [];


  // Handler for opening a panel from library
  const handleOpenPanel = useCallback((panelData: any) => {
    try {
      if (!panelData) {
        message.error('No panel data provided');
        return;
      }

      // Create Panel instance from the panel data
      const p: any = Panel.fromObject(panelData);
      setRoot(assignLabelsToTrapezoids(p.shape));
      setSelectedId(p.shape.id);
      message.success(`Loaded panel: ${panelData.name || 'Untitled'}`);
    } catch (err: unknown) {
      console.error('PanelShapeCreator: Error loading panel', err);
      message.error('Failed to load panel: ' + String(err));
    }
  }, []);

  // Handler for saving a panel (SaveAsModal handles the actual save)
  const handleSavePanel = useCallback(async (name: string, panelData: any) => {
    console.log(`Panel "${name}" saved successfully`);
    // The SaveAsModal already saved to Google Drive
    // This callback is just for any additional actions you need
  }, []);

  // Register dropdown menu items
  useEffect(() => {
    const items = [
      {
        key: 'panel-settings',
        label: 'Library Settings...',
        icon: <SettingOutlined />,
        onClick: () => setShowSettings(true)
      },
      {
        key: 'panel-save-as',
        label: 'Save As...',
        icon: <SaveOutlined />,
        onClick: () => setShowSaveAs(true)
      },
      {
        key: 'panel-open',
        label: 'Open...',
        icon: <FolderOpenOutlined />,
        onClick: () => setShowOpen(true)
      }
    ];
    setMenuItems(items);
    return () => setMenuItems([]);
  }, [setMenuItems]);

  // Short-row helpers: add/remove/duplicate/reorder/update
  const addShortRow = useCallback(() => {
    setRoot(prev => updateNode(prev, selected.id, (n) => { n.shortRows = n.shortRows || []; n.shortRows.push(defaultShortRow()); }));
  }, [selected?.id]);

  const removeShortRow = useCallback(() => {
    if (!selectedShortRowId) return;
    setRoot(prev => updateNode(prev, selected.id, (n) => { n.shortRows = (n.shortRows || []).filter((s: any) => s.id !== selectedShortRowId); }));
    setSelectedShortRowId(null);
  }, [selected?.id, selectedShortRowId]);

  const duplicateShortRow = useCallback(() => {
    if (!selectedShortRowId) return;
    setRoot(prev => updateNode(prev, selected.id, (n) => {
      n.shortRows = n.shortRows || [];
      const idx = n.shortRows.findIndex((s: any) => s.id === selectedShortRowId);
      if (idx === -1) return;
      const copy = { ...n.shortRows[idx], id: `sr-${Date.now()}-${Math.random().toString(36).slice(2,6)}` };
      n.shortRows.splice(idx + 1, 0, copy);
    }));
  }, [selected?.id, selectedShortRowId]);

  // short rows are positioned individually; no reordering needed

  const updateShortRowField = useCallback((id, key, value: any) => {
    // clamp posX/posY
    const v = (key === 'posX' || key === 'posY') ? Math.max(0, Math.min(1, value)) : value;
    setRoot(prev => updateNode(prev, selected.id, (n) => {
      if (!n.shortRows) return;
      const idx = n.shortRows.findIndex((s: any) => s.id === id);
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
              renderItem={(item, index: number) => (
                <List.Item
                  style={{ cursor: 'pointer', background: item.id === selectedId ? '#f0f7ff' : 'transparent' }}
                  onClick={() => setSelectedId(item.id)}
                  actions={[
                    <Button key="up" icon={<ArrowUpOutlined />} size="small" disabled={index === 0}
                      onClick={(e: any) => { e.stopPropagation(); setRoot(prev => reorderChildren(prev, selected.id, index, index - 1)); }} />,
                    <Button key="down" icon={<ArrowDownOutlined />} size="small" disabled={index === children.length - 1}
                      onClick={(e: any) => { e.stopPropagation(); setRoot(prev => reorderChildren(prev, selected.id, index, index + 1)); }} />
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
              renderItem={(item, index: number) => (
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
                const sr = (shortRows || []).find((s: any) => s.id === selectedShortRowId);
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

        {/* Library Modals */}
        <LibrarySettingsModal
          visible={showSettings}
          jsonKey="panels"
          displayLabel="Panel"
          onClose={() => setShowSettings(false)}
        />

        <OpenModal
          visible={showOpen}
          jsonKey="panels"
          displayLabel="Panel"
          onOpen={handleOpenPanel}
          onClose={() => setShowOpen(false)}
        />

        <SaveAsModal
          visible={showSaveAs}
          jsonKey="panels"
          displayLabel="Panel"
          entityData={new Panel(root, undefined, 1).toJSON()}
          onSave={handleSavePanel}
          onClose={() => setShowSaveAs(false)}
        />
      </div>
    </div>
  );
}
