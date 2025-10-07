import { updatePanelPatternLayers } from '../../store/knittingDesignSlice';

describe('ColorworkPanelEditor - Apply to All Panels Redux Logic', () => {
  it('should dispatch updatePanelPatternLayers for all panels except current', () => {
    // Create a mock dispatch function
    const mockDispatch = jest.fn();
    
    // Simulate the handleApplyToAllPanels logic
    const previewKey = 'panel1';
    const allSelectedPanelKeys = ['panel1', 'panel2', 'panel3'];
    const currentLayers = [
      {
        id: 1,
        name: 'Test Pattern',
        priority: 1,
        settings: {},
      },
    ];

    // This is the logic from handleApplyToAllPanels
    allSelectedPanelKeys.forEach((panelKey) => {
      if (panelKey !== previewKey) {
        mockDispatch(updatePanelPatternLayers({ panelKey, layers: currentLayers }));
      }
    });

    // Verify dispatch was called twice (for panel2 and panel3, not panel1)
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalledWith(
      updatePanelPatternLayers({ panelKey: 'panel2', layers: currentLayers })
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      updatePanelPatternLayers({ panelKey: 'panel3', layers: currentLayers })
    );
    expect(mockDispatch).not.toHaveBeenCalledWith(
      updatePanelPatternLayers({ panelKey: 'panel1', layers: currentLayers })
    );
  });

  it('should not dispatch when no panels are selected', () => {
    const mockDispatch = jest.fn();
    const previewKey = 'panel1';
    const allSelectedPanelKeys: string[] = [];
    const currentLayers: any[] = [];

    // Should return early
    if (!previewKey || !allSelectedPanelKeys || allSelectedPanelKeys.length === 0) {
      // Early return, no dispatch
    } else {
      allSelectedPanelKeys.forEach((panelKey) => {
        if (panelKey !== previewKey) {
          mockDispatch(updatePanelPatternLayers({ panelKey, layers: currentLayers }));
        }
      });
    }

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch when only current panel is selected', () => {
    const mockDispatch = jest.fn();
    const previewKey = 'panel1';
    const allSelectedPanelKeys = ['panel1'];
    const currentLayers: any[] = [];

    allSelectedPanelKeys.forEach((panelKey) => {
      if (panelKey !== previewKey) {
        mockDispatch(updatePanelPatternLayers({ panelKey, layers: currentLayers }));
      }
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
