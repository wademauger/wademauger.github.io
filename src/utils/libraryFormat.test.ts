import { countNamespaces, detectLegacyFormat, migrateLegacyToNamespaced } from './libraryFormat';

test('countNamespaces returns counts for namespaced object', () => {
  const lib = { namespaces: { panels: [{}, {}], recipes: [{}], songs: [] } };
  expect(countNamespaces(lib)).toEqual({ panels: 2, recipes: 1, songs: 0 });
});

test('countNamespaces handles null input', () => {
  expect(countNamespaces(null)).toEqual({});
  expect(countNamespaces(undefined)).toEqual({});
});

test('countNamespaces handles non-object input', () => {
  expect(countNamespaces('string')).toEqual({});
  expect(countNamespaces(123)).toEqual({});
});

test('countNamespaces counts songs with artists structure', () => {
  const lib = {
    namespaces: {
      songs: {
        artists: [
          {
            name: 'Artist 1',
            albums: [
              { name: 'Album 1', songs: [{}, {}, {}] }
            ]
          }
        ]
      }
    }
  };
  const counts = countNamespaces(lib);
  expect(counts.artists).toBe(1);
  expect(counts.songs).toBe(3);
});

test('countNamespaces handles songs as array (legacy)', () => {
  const lib = { namespaces: { songs: [{}, {}, {}] } };
  expect(countNamespaces(lib).songs).toBe(3);
});

test('countNamespaces handles songs with object albums', () => {
  const lib = {
    namespaces: {
      songs: {
        artists: [
          {
            name: 'Artist 1',
            albums: { 'Album 1': { songs: [{}, {}] } }
          }
        ]
      }
    }
  };
  const counts = countNamespaces(lib);
  expect(counts.songs).toBe(2);
});

test('countNamespaces handles songs with object structure', () => {
  const lib = {
    namespaces: {
      songs: {
        artists: [
          {
            name: 'Artist 1',
            albums: [
              { name: 'Album 1', songs: { 'song1': {}, 'song2': {} } }
            ]
          }
        ]
      }
    }
  };
  const counts = countNamespaces(lib);
  expect(counts.songs).toBe(2);
});

test('countNamespaces handles songs fallback with object keys', () => {
  const lib = {
    namespaces: {
      songs: {
        'Artist 1': {
          albums: [{ songs: [{}, {}] }]
        }
      }
    }
  };
  const counts = countNamespaces(lib);
  expect(counts.artists).toBe(1);
  expect(counts.songs).toBe(2);
});

test('countNamespaces handles songs fallback with direct songs array', () => {
  const lib = {
    namespaces: {
      songs: {
        'Artist 1': {
          songs: [{}, {}]
        }
      }
    }
  };
  const counts = countNamespaces(lib);
  expect(counts.songs).toBe(2);
});

test('countNamespaces handles songs fallback with object songs', () => {
  const lib = {
    namespaces: {
      songs: {
        'Artist 1': {
          'song1': {},
          'song2': {}
        }
      }
    }
  };
  const counts = countNamespaces(lib);
  expect(counts.songs).toBe(2);
});

test('countNamespaces handles object namespace', () => {
  const lib = { namespaces: { panels: { a: {}, b: {} } } };
  expect(countNamespaces(lib).panels).toBe(2);
});

test('countNamespaces handles non-array/non-object namespace', () => {
  const lib = { namespaces: { panels: 'invalid' } };
  expect(countNamespaces(lib).panels).toBe(0);
});

test('countNamespaces skips null artists', () => {
  const lib = {
    namespaces: {
      songs: {
        artists: [null, { name: 'Artist', albums: [{ songs: [{}] }] }]
      }
    }
  };
  expect(countNamespaces(lib).songs).toBe(1);
});

test('countNamespaces skips null albums', () => {
  const lib = {
    namespaces: {
      songs: {
        artists: [
          { name: 'Artist', albums: [null, { songs: [{}] }] }
        ]
      }
    }
  };
  expect(countNamespaces(lib).songs).toBe(1);
});

test('detectLegacyFormat detects array legacy', () => {
  const arr = [{ id: 1 }];
  expect(detectLegacyFormat(arr)).toEqual({ isLegacy: true, inferredNamespace: 'panels' });
});

test('detectLegacyFormat detects single-key array legacy', () => {
  const obj = { panels: [{}, {}] };
  expect(detectLegacyFormat(obj)).toEqual({ isLegacy: true, inferredNamespace: 'panels' });
});

test('detectLegacyFormat returns false for namespaced object', () => {
  const obj = { namespaces: { panels: [] } };
  expect(detectLegacyFormat(obj)).toEqual({ isLegacy: false });
});

test('detectLegacyFormat returns false for multiple namespaces at top level', () => {
  const obj = { panels: [], recipes: [] };
  expect(detectLegacyFormat(obj)).toEqual({ isLegacy: false });
});

test('detectLegacyFormat returns false for null input', () => {
  expect(detectLegacyFormat(null)).toEqual({ isLegacy: false });
});

test('detectLegacyFormat returns false for non-object input', () => {
  expect(detectLegacyFormat('string')).toEqual({ isLegacy: false });
});

test('detectLegacyFormat returns false for object without matching keys', () => {
  const obj = { other: [] };
  expect(detectLegacyFormat(obj)).toEqual({ isLegacy: true, inferredNamespace: 'other' });
});

test('migrateLegacyToNamespaced wraps array into namespaces', () => {
  const arr = [{ id: 'a' }, { id: 'b' }];
  const migrated = migrateLegacyToNamespaced(arr, 'panels');
  expect(migrated.namespaces.panels.length).toBe(2);
  expect(migrated.metadata.schemaVersion).toBe(1);
});

test('migrateLegacyToNamespaced handles null input', () => {
  const migrated = migrateLegacyToNamespaced(null, 'panels');
  expect(migrated.namespaces.panels).toEqual([]);
});

test('migrateLegacyToNamespaced returns already namespaced object', () => {
  const obj = { namespaces: { panels: [] } };
  const migrated = migrateLegacyToNamespaced(obj);
  expect(migrated).toBe(obj);
});

test('migrateLegacyToNamespaced handles single-key object', () => {
  const obj = { panels: [{ id: 'a' }] };
  const migrated = migrateLegacyToNamespaced(obj, 'panels');
  expect(migrated.namespaces.panels.length).toBe(1);
});

test('migrateLegacyToNamespaced handles object without array', () => {
  const obj = { key: 'value' };
  const migrated = migrateLegacyToNamespaced(obj, 'panels');
  expect(migrated.namespaces.panels).toEqual([]);
});

