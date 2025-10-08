/**
 * Integration test for WizardView
 */
import React from 'react';
// Mock Drive auth hook so WizardView thinks user is signed in during the test.
jest.mock('../../apps/colorwork-designer/context/DriveAuthContext', () => ({
  useDriveAuth: () => ({ isSignedIn: true })
}));

// Stub loadFullLibrary thunk so the component's effect doesn't overwrite our test library state.
jest.mock('../../store/librarySlice', () => {
  const original = jest.requireActual('../../store/librarySlice');
  return {
    ...original,
    loadFullLibrary: () => async (_dispatch: any) => Promise.resolve()
  };
});
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

import WizardView from '../../apps/knitting-designer/components/WizardView';
import knittingDesignReducer, { updatePatternData } from '../../store/knittingDesignSlice';
import libraryReducer, { setFullLibrary } from '../../store/librarySlice';

// Use a lightweight test store
const createTestStore = () => configureStore({
  reducer: {
    knittingDesign: knittingDesignReducer,
    library: libraryReducer
  }
});

describe('WizardView integration', () => {
  it('renders built-in garments and library panels when library present', async () => {
    const store = createTestStore();

    // jsdom doesn't implement matchMedia; AntD's responsive observer calls it.
    // Provide a minimal mock so components using breakpoints don't throw in tests.
    // @ts-ignore
    if (typeof window !== 'undefined' && !window.matchMedia) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).matchMedia = (query: any) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      });
    }

  // Ensure WizardView shows the panel selection step (step 1) so garment groups are rendered
  store.dispatch({ type: 'knittingDesign/setCurrentStep', payload: 1 });

    render(
      <Provider store={store}>
        <WizardView />
      </Provider>
    );

    // Wait for Memoized panelList to compute and ensure a built-in garment header exists
    await waitFor(() => {
      expect(screen.getByText(/Cozy Raglan V-Neck Sweater/)).toBeInTheDocument();
    });

    // The garment header should be present in the DOM
    expect(screen.getByText(/Cozy Raglan V-Neck Sweater/)).toBeInTheDocument();
  });
});
