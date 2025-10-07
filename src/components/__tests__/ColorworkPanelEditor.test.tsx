const mockDispatch = jest.fn();
const mockState = {
  colorworkGrid: {
    colors: {
      0: { color: '#ffffff' }
    }
  },
  knittingDesign: {
    patternData: {}
  }
};

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector(mockState)
}));

jest.mock('../../components/ColorworkCanvasEditor', () => {
  const React = require('react');
  return ({ onLayersChange }: any) => {
    React.useEffect(() => {
      onLayersChange((previousLayers: any[]) => [
        {
          id: 'mock-layer',
          name: 'Mock Layer',
          pattern: null,
          patternType: 'mock',
          patternConfig: {},
          priority: Number.MAX_SAFE_INTEGER,
          settings: {}
        },
        ...previousLayers
      ]);
    }, [onLayersChange]);
    return null;
  };
});

jest.mock('../../models/PanelColorworkComposer', () => ({
  PanelColorworkComposer: jest.fn().mockImplementation(() => ({
    combinePatterns: jest.fn(() => ({}))
  }))
}));

jest.mock('../../models/InstructionGenerator', () => ({
  InstructionGenerator: jest.fn().mockImplementation(() => ({
    generateInstructions: jest.fn(() => [])
  }))
}));

import React from 'react';
import { render, waitFor } from '@testing-library/react';

const ColorworkPanelEditor = require('../../components/ColorworkPanelEditor').default as React.ComponentType<any>;

describe('ColorworkPanelEditor layer updates', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('dispatches resolved layer arrays when children use functional updates', async () => {
    render(<ColorworkPanelEditor previewKey="test-panel" />);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('updatePanelPatternLayers')
        })
      );
    });

    const dispatchedActions = mockDispatch.mock.calls
      .map((call) => call[0])
      .filter((action) => action && action.type && action.type.includes('updatePanelPatternLayers'));

    expect(dispatchedActions.length).toBeGreaterThan(0);
    dispatchedActions.forEach((action) => {
      expect(Array.isArray(action.payload.layers)).toBe(true);
      expect(action.payload.layers.length).toBeGreaterThan(1);
      expect(action.payload.layers.every((layer: any) => typeof layer === 'object')).toBe(true);
    });
  });
});
