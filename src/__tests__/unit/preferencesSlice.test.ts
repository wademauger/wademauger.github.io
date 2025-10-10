import reducer, { setShowDemoData } from '../../store/preferencesSlice';

describe('preferencesSlice', () => {
  it('should return the initial state', () => {
    const state = reducer(undefined as any, { type: '@@INIT' } as any);
    expect(state).toEqual({ showDemoData: false });
  });

  it('should handle setShowDemoData', () => {
    const prev = { showDemoData: false };
    const next = reducer(prev as any, setShowDemoData(true));
    expect(next.showDemoData).toBe(true);
  });
});
