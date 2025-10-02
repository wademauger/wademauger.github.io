import mergePanelIntoLibrary from '../../../utils/libraryMerge';

describe('mergePanelIntoLibrary', () => {
  it('inserts panel into empty library', () => {
    const lib = null;
    const merged = mergePanelIntoLibrary(lib, 'test', { a: 1 });
    expect(merged).toHaveProperty('panels');
    expect(merged.panels.test).toEqual({ a: 1 });
  });

  it('overwrites existing panel with same name', () => {
    const lib = { panels: { old: { x: 1 }, test: { y: 2 } }, lastUpdated: '2010-01-01' };
    const merged = mergePanelIntoLibrary(lib, 'test', { a: 1 });
    expect(merged.panels.test).toEqual({ a: 1 });
    expect(merged.panels.old).toEqual({ x: 1 });
  });

  it('preserves non-panels keys and sets lastUpdated', () => {
    const lib = { foo: 'bar' };
    const merged = mergePanelIntoLibrary(lib, 'p', { foo: 2 });
    expect(merged.foo).toBe('bar');
    expect(typeof merged.lastUpdated).toBe('string');
  });
});
