import { countNamespaces, detectLegacyFormat, migrateLegacyToNamespaced } from './libraryFormat.js';

test('countNamespaces returns counts for namespaced object', () => {
  const lib = { namespaces: { panels: [{}, {}], recipes: [{}], songs: [] } };
  expect(countNamespaces(lib)).toEqual({ panels: 2, recipes: 1, songs: 0 });
});

test('detectLegacyFormat detects array legacy', () => {
  const arr = [{ id: 1 }];
  expect(detectLegacyFormat(arr)).toEqual({ isLegacy: true, inferredNamespace: 'panels' });
});

test('detectLegacyFormat detects single-key array legacy', () => {
  const obj = { panels: [{}, {}] };
  expect(detectLegacyFormat(obj)).toEqual({ isLegacy: true, inferredNamespace: 'panels' });
});

test('migrateLegacyToNamespaced wraps array into namespaces', () => {
  const arr = [{ id: 'a' }, { id: 'b' }];
  const migrated = migrateLegacyToNamespaced(arr, 'panels');
  expect(migrated.namespaces.panels.length).toBe(2);
  expect(migrated.metadata.schemaVersion).toBe(1);
});
