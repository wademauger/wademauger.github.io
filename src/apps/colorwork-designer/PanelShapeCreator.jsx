import React, { useMemo, useState, useCallback } from 'react';
import { Card, Button, InputNumber, Space, Row, Col, Typography, List, Divider } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { PanelDiagram } from '@/components/PanelDiagram.jsx';

const { Title, Text } = Typography;

// Simple id generator
const genId = () => `trap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultTrap = () => ({
  id: genId(),
  height: 40,
  baseA: 20,
  baseB: 30,
  baseBHorizontalOffset: 0,
  successors: [],
  label: null // Will be assigned when computing labels
});

const defaultChild = () => ({
  id: genId(),
  height: 12,
  baseA: 16,
  baseB: 12,
  baseBHorizontalOffset: 0,
  successors: [],
  label: null // Will be assigned when computing labels
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

  const selectedInfo = useMemo(() => findNodeAndParent(root, selectedId), [root, selectedId]);
  const selected = selectedInfo.node || root;

  const handleField = useCallback((key, value) => {
    setRoot(prev => updateNode(prev, selected.id, (n) => { n[key] = value || 0; }));
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
            onSelect={(id) => id && setSelectedId(id)}
          />
        </Card>
      </div>

      {/* Inspector */}
      <div style={{ width: 420, padding: 16, borderLeft: '1px solid #f0f0f0' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>Selected {selected.label ? `Trapezoid ${selected.label}` : 'Trapezoid'}</Title>
            <Text type="secondary">ID: {selected.id}</Text>
          </div>
          <Space>
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

          <Divider />
          <Text type="secondary">Tip: Select a child to edit its geometry, use arrows to reorder, or Add Child to grow the tree.</Text>
        </Space>
      </div>
    </div>
  );
}
