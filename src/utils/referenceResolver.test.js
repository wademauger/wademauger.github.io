import { resolveEntryReference, resolveAllRefs } from './referenceResolver.js';

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

test('resolveEntryReference finds entry by name', async () => {
  const res = await resolveEntryReference({ fileId: 'file1', namespace: 'panels', entryId: 'P1', loader });
  expect(res.entry).toBeDefined();
  expect(res.entry.id).toBe('panel-1');
});

test('resolveEntryReference throws for missing entry', async () => {
  await expect(resolveEntryReference({ fileId: 'file1', namespace: 'panels', entryId: 'nope', loader })).rejects.toThrow();
});

test('resolveEntryReference throws for missing library', async () => {
  await expect(resolveEntryReference({ fileId: 'nonexistent', namespace: 'panels', entryId: 'panel-1', loader })).rejects.toThrow();
});

test('resolveEntryReference throws if neither fileId nor libraryObj provided', async () => {
  await expect(resolveEntryReference({ namespace: 'panels', entryId: 'panel-1', loader })).rejects.toThrow();
});

test('resolveEntryReference uses cache for repeated loads', async () => {
  const cache = new Map();
  const res1 = await resolveEntryReference({ fileId: 'file1', namespace: 'panels', entryId: 'panel-1', loader, cache });
  expect(cache.size).toBe(1);
  
  const res2 = await resolveEntryReference({ fileId: 'file1', namespace: 'panels', entryId: 'panel-2', loader, cache });
  expect(res2.entry.name).toBe('P2');
  expect(cache.size).toBe(1); // Should still be 1, not 2
});

test('resolveEntryReference accepts libraryObj directly', async () => {
  const res = await resolveEntryReference({ 
    libraryObj: sampleLib, 
    namespace: 'panels', 
    entryId: 'panel-1' 
  });
  expect(res.entry.name).toBe('P1');
});

test('resolveEntryReference migrates legacy format with fileId', async () => {
  const legacyLoader = async (fileId) => {
    if (fileId === 'legacy') return [{ id: 'old-1', name: 'Old' }];
    return null;
  };
  const res = await resolveEntryReference({ 
    fileId: 'legacy', 
    namespace: 'panels', 
    entryId: 'old-1', 
    loader: legacyLoader 
  });
  expect(res.entry.name).toBe('Old');
});

test('resolveEntryReference migrates legacy format with libraryObj', async () => {
  const legacyLib = [{ id: 'old-1', name: 'Old' }];
  const res = await resolveEntryReference({ 
    libraryObj: legacyLib, 
    namespace: 'panels', 
    entryId: 'old-1' 
  });
  expect(res.entry.name).toBe('Old');
});

test('resolveEntryReference throws for invalid namespace', async () => {
  await expect(resolveEntryReference({ 
    fileId: 'file1', 
    namespace: 'invalid', 
    entryId: 'panel-1', 
    loader 
  })).rejects.toThrow();
});

test('resolveEntryReference handles namespace not as array', async () => {
  const badLoader = async () => ({ namespaces: { panels: 'not-an-array' } });
  await expect(resolveEntryReference({ 
    fileId: 'bad', 
    namespace: 'panels', 
    entryId: 'panel-1', 
    loader: badLoader 
  })).rejects.toThrow();
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

test('resolveAllRefs returns empty object for entry without refs', async () => {
  const entry = { id: 'test' };
  const resolved = await resolveAllRefs(entry, { loader });
  expect(resolved).toEqual({});
});

test('resolveAllRefs returns empty object for null entry', async () => {
  const resolved = await resolveAllRefs(null, { loader });
  expect(resolved).toEqual({});
});

test('resolveAllRefs returns empty object for entry with non-array refs', async () => {
  const entry = { id: 'test', refs: 'not-an-array' };
  const resolved = await resolveAllRefs(entry, { loader });
  expect(resolved).toEqual({});
});

test('resolveAllRefs groups by namespace', async () => {
  const entry = {
    id: 'test',
    refs: [
      { namespace: 'panels', entryId: 'panel-1', fileId: 'file1' },
      { namespace: 'panels', entryId: 'panel-2', fileId: 'file1' },
      { namespace: 'colorworks', entryId: 'cw-1', fileId: 'file1' }
    ]
  };
  const resolved = await resolveAllRefs(entry, { loader });
  expect(resolved.panels.length).toBe(2);
  expect(resolved.colorworks.length).toBe(1);
});

