import { resolveEntryReference, resolveAllRefs } from './referenceResolver';

const sampleLib = {
  metadata: { name: 'L1' },
  namespaces: {
    panels: [{ id: 'panel-1', name: 'P1' }, { id: 'panel-2', name: 'P2' }],
    colorworks: [{ id: 'cw-1', name: 'CW' }]
  }
};

const loader = async (fileId) => {
  if (fileId === 'file1') return sampleLib;
  if (fileId === 'file2') return { namespaces: { panels: [{ id: 'panel-3', name: 'P3' }] } };
  return null;
};

test('resolveEntryReference finds entry by id', async () => {
  const res = await resolveEntryReference({ fileId: 'file1', namespace: 'panels', entryId: 'panel-2', loader });
  expect(res.entry).toBeDefined();
  expect(res.entry.name).toBe('P2');
});

test('resolveEntryReference throws for missing entry', async () => {
  await expect(resolveEntryReference({ fileId: 'file1', namespace: 'panels', entryId: 'nope', loader })).rejects.toThrow();
});

test('resolveAllRefs resolves refs and handles missing gracefully', async () => {
  const entry = {
    id: 'cw-1',
    refs: [{ namespace: 'panels', entryId: 'panel-1', fileId: 'file1' }, { namespace: 'panels', entryId: 'missing', fileId: 'file2' }]
  };
  const resolved = await resolveAllRefs(entry, { loader });
  expect(resolved.panels.length).toBe(2);
  expect(resolved.panels[0].name).toBe('P1');
  expect(resolved.panels[1].__missing).toBeTruthy();
});
