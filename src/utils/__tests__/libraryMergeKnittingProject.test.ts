import mergeKnittingProjectIntoLibrary from '../libraryMergeKnittingProject';

describe('mergeKnittingProjectIntoLibrary', () => {
  it('inserts knitting project into empty library', () => {
    const lib = null;
    const project = { id: 'test-project', name: 'Test Project', data: { some: 'data' } };
    const merged = mergeKnittingProjectIntoLibrary(lib, project);
    expect(merged).toHaveProperty('knittingProjects');
    expect(merged.knittingProjects).toHaveLength(1);
    expect(merged.knittingProjects[0]).toEqual(project);
  });

  it('replaces existing project with same id', () => {
    const existingProject = { id: 'test-project', name: 'Old Project', data: { old: 'data' } };
    const otherProject = { id: 'other-project', name: 'Other Project', data: { other: 'data' } };
    const lib = { knittingProjects: [existingProject, otherProject], lastUpdated: '2010-01-01' };
    
    const updatedProject = { id: 'test-project', name: 'Updated Project', data: { new: 'data' } };
    const merged = mergeKnittingProjectIntoLibrary(lib, updatedProject);
    
    expect(merged.knittingProjects).toHaveLength(2);
    expect(merged.knittingProjects[0]).toEqual(updatedProject);
    expect(merged.knittingProjects[1]).toEqual(otherProject);
  });

  it('replaces existing project with same name when no id match', () => {
    const existingProject = { id: 'old-id', name: 'Test Project', data: { old: 'data' } };
    const otherProject = { id: 'other-project', name: 'Other Project', data: { other: 'data' } };
    const lib = { knittingProjects: [existingProject, otherProject], lastUpdated: '2010-01-01' };
    
    const updatedProject = { id: 'new-id', name: 'Test Project', data: { new: 'data' } };
    const merged = mergeKnittingProjectIntoLibrary(lib, updatedProject);
    
    expect(merged.knittingProjects).toHaveLength(2);
    expect(merged.knittingProjects[0]).toEqual(updatedProject);
    expect(merged.knittingProjects[1]).toEqual(otherProject);
  });

  it('adds new project when no id or name match', () => {
    const existingProject = { id: 'existing-project', name: 'Existing Project', data: { existing: 'data' } };
    const lib = { knittingProjects: [existingProject], lastUpdated: '2010-01-01' };
    
    const newProject = { id: 'new-project', name: 'New Project', data: { new: 'data' } };
    const merged = mergeKnittingProjectIntoLibrary(lib, newProject);
    
    expect(merged.knittingProjects).toHaveLength(2);
    expect(merged.knittingProjects[0]).toEqual(existingProject);
    expect(merged.knittingProjects[1]).toEqual(newProject);
  });

  it('preserves non-knittingProjects keys and sets lastUpdated', () => {
    const lib = { panels: { somePanel: {} }, colorworkPatterns: [{ some: 'pattern' }] };
    const project = { id: 'test-project', name: 'Test Project' };
    const merged = mergeKnittingProjectIntoLibrary(lib, project);
    
    expect(merged.panels).toEqual(lib.panels);
    expect(merged.colorworkPatterns).toEqual(lib.colorworkPatterns);
    expect(typeof merged.lastUpdated).toBe('string');
    expect(merged.knittingProjects).toHaveLength(1);
    expect(merged.knittingProjects[0]).toEqual(project);
  });

  it('handles empty library object', () => {
    const lib = {};
    const project = { id: 'test-project', name: 'Test Project' };
    const merged = mergeKnittingProjectIntoLibrary(lib, project);
    
    expect(merged.knittingProjects).toHaveLength(1);
    expect(merged.knittingProjects[0]).toEqual(project);
    expect(typeof merged.lastUpdated).toBe('string');
  });
});