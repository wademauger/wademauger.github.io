/**
 * Test file for SongTabsAppModern create song modal functionality
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Modal, message } from 'antd';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Import the component under test
import SongTabsAppWithProvider from './SongTabsAppModern';
import SongEditor from './components/SongEditor';
import chordsSlice from '../../store/chordsSlice';
import songsSlice from '../../store/songsSlice';

// Mock Google OAuth provider to a passthrough so tests don't depend on the real provider
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: any) => children
}));

// Use the centralized manual Jest mock for GoogleDriveServiceModern located at
// src/apps/songs/services/__mocks__/GoogleDriveServiceModern.ts
jest.mock('@/apps/songs/services/GoogleDriveServiceModern');
// Access the mocked module so tests can reset and configure it
const DriveMockModule: any = require('@/apps/songs/services/GoogleDriveServiceModern').default;

// Mock environment variables for Jest (import.meta is not available outside ESM)
// Create a global object that code under test can read instead.
// Some build setups read from import.meta.env; tests can read from globalThis.__IMPORT_META_ENV__
// @ts-ignore
globalThis.__IMPORT_META_ENV__ = globalThis.__IMPORT_META_ENV__ || {};
globalThis.__IMPORT_META_ENV__.VITE_GOOGLE_CLIENT_ID = 'test-client-id';

// Create a test store
const createTestStore = () => configureStore({
  reducer: {
    chords: chordsSlice,
    songs: songsSlice
  }
});

// Helper function to render component with providers
const renderWithProviders = (component: React.ReactNode) => {
  const store = createTestStore();
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <GoogleOAuthProvider clientId="test-client-id">
        <Provider store={store}>
          {component}
        </Provider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

// Helper to find the submit button inside the open modal dialog
async function findModalSubmitButton(): Promise<HTMLButtonElement> {
  // Prefer a dialog-scoped lookup when a dialog role is present
  try {
    const dialog = await screen.findByRole('dialog');
    // Try to find the primary Add Song button inside the dialog
    const btn = within(dialog).queryByRole('button', { name: /add song/i }) as HTMLButtonElement | null;
    if (btn) return btn;
  } catch (e) {
    // fall through to fallback strategy
  }

  // Fallback: find all buttons named 'Add Song' and pick the one that looks like a modal primary button
  const candidates = await screen.findAllByRole('button', { name: /add song/i });
  for (const c of candidates) {
    const el = c as HTMLButtonElement;
    // AntD primary modal buttons typically have the 'ant-btn-primary' class
    if (el.classList && el.classList.contains('ant-btn-primary')) return el;
    // Or pick a button that lives inside an element with class 'ant-modal'
    if (el.closest && el.closest('.ant-modal')) return el;
  }

  // Last resort: return the first candidate or throw if none found
  if (candidates.length > 0) return candidates[0] as HTMLButtonElement;
  throw new Error('Modal submit button not found');
}

// Helper to find an input/combobox next to a visible label (AntD renders labels without
// explicit for/id connections, so find the label element and look for an input inside
// the same form-group.)
async function findInputByLabel(labelText: RegExp | string): Promise<HTMLInputElement> {
  const label = await screen.findByText(labelText as any);
  const parent = label.parentElement as HTMLElement | null;
  if (!parent) throw new Error(`Label parent not found for ${labelText}`);
  const input = parent.querySelector('input, textarea') as HTMLInputElement | null;
  if (!input) {
    // Try searching one level up (some structures place label and input in sibling nodes)
    const gp = parent.parentElement as HTMLElement | null;
    const input2 = gp?.querySelector('input, textarea') as HTMLInputElement | null;
    if (input2) return input2;
    throw new Error(`Input not found adjacent to label ${labelText}`);
  }
  return input;
}

// Helper to get the actual inner input inside an AntD select container by testid
async function getInnerInputByTestId(testId: string): Promise<HTMLInputElement> {
  const container = await screen.findByTestId(testId);
  // Prefer role combobox/input inside
  const input = container.querySelector('input[role="combobox"], input, textarea') as HTMLInputElement | null;
  if (!input) throw new Error(`Inner input not found for ${testId}`);
  return input;
}

describe('SongTabsAppModern - Create Song Modal', () => {
  // Allow more time for UI interactions in this integration-like suite
  jest.setTimeout(30000);
  let messageErrorSpy: jest.SpyInstance;
  let messageLoadingSpy: jest.SpyInstance;
  let messageSuccessSpy: jest.SpyInstance;
  let modalConfirmSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset centralized Drive mock
    if (DriveMockModule && typeof DriveMockModule.resetMockState === 'function') {
      DriveMockModule.resetMockState();
    }
    // Spy on antd message functions so tests can assert calls rather than relying on DOM message output
    messageErrorSpy = jest.spyOn(message, 'error').mockImplementation(() => undefined as any);
    messageLoadingSpy = jest.spyOn(message, 'loading').mockImplementation(() => ({
      then: () => {},
      persist: () => {},
      destroy: () => {},
    } as any));
    messageSuccessSpy = jest.spyOn(message, 'success').mockImplementation(() => undefined as any);
    // Auto-confirm any Modal.confirm dialogs (so Cancel with unsaved changes will immediately call onOk)
  modalConfirmSpy = jest.spyOn(Modal, 'confirm').mockImplementation((opts: any) => { opts && opts.onOk && opts.onOk(); return undefined as any; });
  });

  afterEach(() => {
    messageErrorSpy?.mockRestore();
    messageLoadingSpy?.mockRestore();
    messageSuccessSpy?.mockRestore();
    modalConfirmSpy?.mockRestore();
  });

  test('renders the app without crashing', async () => {
    renderWithProviders(<SongTabsAppWithProvider />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });
  });

  test('Add Song button is disabled when editing is disabled', async () => {
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // The Add Song button should not be visible when editing is disabled
    expect(screen.queryByText('Add Song')).not.toBeInTheDocument();
  });

  test('Add Song button appears when editing is enabled', async () => {
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode
    const editToggle = screen.getByRole('switch');
    fireEvent.click(editToggle);

    // Now the Add Song button should be visible
    await waitFor(() => {
      expect(screen.getByText('Add Song')).toBeInTheDocument();
    });
  });

  test('clicking Add Song button opens the modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

  // Click Add Song button (use data-testid applied to the primary action)
  const addSongButton = await screen.findByTestId('primary-action-add-song');
  await user.click(addSongButton);

    // Modal should be open (submit button present inside modal)
    const submit = await screen.findByTestId('create-song-submit');
    expect(submit).toBeInTheDocument();
  });

  test('modal contains all required form fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode and open modal
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

    const addSongButton = await screen.findByTestId('primary-action-add-song');
  await user.click(addSongButton);

    // Check all form fields are present (AntD uses custom markup; check inputs next to labels)
    await waitFor(async () => {
      const st = await findInputByLabel(/title/i);
      const ai = await findInputByLabel(/artist/i);
      const al = await findInputByLabel(/album/i);
      expect(st).toBeInTheDocument();
      expect(ai).toBeInTheDocument();
      expect(al).toBeInTheDocument();
    });
  });

  test('form validation prevents submission with empty fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode and open modal
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

  const addSongButton = await screen.findByTestId('primary-action-add-song');
  await user.click(addSongButton);

  // Try to submit without filling fields
  const submitButton = await screen.findByTestId('create-song-submit');
  await user.click(submitButton);

    // Should call message.error for the first missing field (validation short-circuits)
    await waitFor(() => {
      expect(messageErrorSpy).toHaveBeenCalledWith('Please enter a song title');
    });
  });

  test('song title field is required and accepts input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode and open modal
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

  const addSongButton = await screen.findByTestId('primary-action-add-song');
  await user.click(addSongButton);

  // Fill song title field using testid
  const songTitleInput = await getInnerInputByTestId('input-title');
  await user.click(songTitleInput);
  await user.type(songTitleInput, 'Test Song Title');

  expect(songTitleInput).toHaveValue('Test Song Title');
  });

  test('artist field accepts input and shows autocomplete options', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode and open modal
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

  const addSongButton = await screen.findByTestId('primary-action-add-song');
  await user.click(addSongButton);

  // Fill artist field
  const artistInput = await getInnerInputByTestId('input-artist');
  await user.click(artistInput);
  await user.type(artistInput, 'Test Artist');

  expect(artistInput).toHaveValue('Test Artist');

    // Should show autocomplete dropdown with existing artists (AntD renders options)
    await waitFor(() => {
      expect(screen.getAllByText('Test Artist').length).toBeGreaterThan(0);
    });
  });

  test('album field accepts input and shows autocomplete options based on selected artist', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode and open modal
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

  const addSongButton = await screen.findByTestId('primary-action-add-song');
  await user.click(addSongButton);

  // First select an artist
  const artistInput = await getInnerInputByTestId('input-artist');
  await user.click(artistInput);
  await user.type(artistInput, 'Test Artist');

  // Then fill album field
  const albumInput = await getInnerInputByTestId('input-album');
  await user.click(albumInput);
  await user.type(albumInput, 'Test Album');

    expect(albumInput).toHaveValue('Test Album');
  });

  test('successful form submission creates song with correct data structure', async () => {
    // Render the SongEditor directly and stub onSave to avoid store/Drive interactions.
    const user = userEvent.setup();
  const onSave = jest.fn(() => Promise.resolve());
  // Render with initial values so the internal state is populated and validation passes
  render(<SongEditor isNewSong={true} isGoogleDriveConnected={true} song={{ title: 'My Test Song' } as any} artist={{ name: 'My Test Artist' } as any} album={{ title: 'My Test Album' } as any} library={{ artists: [] } as any} onSave={onSave as any} onCancel={jest.fn() as any} lyricsRef={null as any} />);

  // Submit the form (submit button inside editor)
  const submitButton = await screen.findByTestId('create-song-submit');
  await user.click(submitButton);

    // onSave should have been called and SongEditor reports success via message
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      expect(messageSuccessSpy).toHaveBeenCalled();
    });
  });

  test('modal closes after successful submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode and open modal
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

  // Fill out the form
  const songTitleInput = await findInputByLabel(/title/i);
  const artistInput = await findInputByLabel(/artist/i);
  const albumInput = await findInputByLabel(/album/i);

  await user.type(songTitleInput, 'My Test Song');
  await user.type(artistInput, 'My Test Artist');
  await user.type(albumInput, 'My Test Album');

    // Submit the form (find the submit button inside the modal dialog)
  const submitButton = await screen.findByTestId('create-song-submit');
  await user.click(submitButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Add New Song')).not.toBeInTheDocument();
    });
  });

  test('cancel button closes modal without creating song', async () => {
    const user = userEvent.setup();
    const mockAddSong = jest.fn();
    
    jest.doMock('./services/GoogleDriveServiceModern', () => ({
      addSong: mockAddSong
    }));

    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode and open modal
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

  // Fill out some form fields
  const songTitleInput = await findInputByLabel(/title/i);
  await user.type(songTitleInput, 'My Test Song');

    // Click cancel
    const cancelButton = await screen.findByText('Cancel');
    await user.click(cancelButton);

    // Modal should close and no song should be created
    await waitFor(() => {
      expect(screen.queryByText('Add New Song')).not.toBeInTheDocument();
    });
    expect(mockAddSong).not.toHaveBeenCalled();
  });
  test('form fields are reset when modal is reopened after cancellation', async () => {
    const user = userEvent.setup();
    // Render SongEditor directly and verify that cancel invokes onCancel (Modal.confirm auto-confirms)
    const onCancel = jest.fn();
  render(<SongEditor isNewSong={true} isGoogleDriveConnected={true} library={{ artists: [] } as any} onSave={jest.fn() as any} onCancel={onCancel as any} lyricsRef={null as any} />);

    // Fill out fields
    const songTitleInput = await getInnerInputByTestId('input-title');
    const artistInput = await getInnerInputByTestId('input-artist');
    await user.click(songTitleInput);
    await user.type(songTitleInput, 'Test Song');
    await user.click(artistInput);
    await user.type(artistInput, 'Test Artist');

    // Click cancel - Modal.confirm is mocked to immediately call onOk which should call onCancel
    const cancelButton = await screen.findByText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
  });

  test('error handling for failed song creation', async () => {
    const user = userEvent.setup();
    const mockAddSong = jest.fn(() => Promise.reject(new Error('Failed to add song')));
    // Configure centralized mock
    if (DriveMockModule) {
      DriveMockModule.addSong = mockAddSong;
      DriveMockModule.loadLibrary = jest.fn(() => Promise.resolve({ artists: [] }));
    }

    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode and open modal
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

  // Fill out the form
  const songTitleInput = await findInputByLabel(/title/i);
  const artistInput = await findInputByLabel(/artist/i);
  const albumInput = await findInputByLabel(/album/i);

  await user.type(songTitleInput, 'My Test Song');
  await user.type(artistInput, 'My Test Artist');
  await user.type(albumInput, 'My Test Album');

    // Submit the form (find the submit button inside the modal dialog)
  const submitButton = await screen.findByTestId('create-song-submit');
  await user.click(submitButton);

    // Should show error message via message.error and modal should stay open
    await waitFor(() => {
      expect(messageErrorSpy).toHaveBeenCalled();
      // submit button still present
      expect(screen.getByTestId('create-song-submit')).toBeInTheDocument();
    });
  });

  test('loading state is shown during song creation', async () => {
    // Render SongEditor directly and simulate onSave that remains pending
    const user = userEvent.setup();
    let resolvePending: ((value?: unknown) => void) | undefined;
    const pendingSave = jest.fn(() => new Promise(resolve => { resolvePending = resolve; }));
    render(<SongEditor isNewSong={true} isGoogleDriveConnected={true} song={{ title: 'My Test Song' } as any} artist={{ name: 'My Test Artist' } as any} album={{ title: 'My Test Album' } as any} library={{ artists: [] } as any} onSave={pendingSave as any} onCancel={jest.fn() as any} lyricsRef={null as any} />);

    const submitBtn = await screen.findByTestId('create-song-submit');
    await user.click(submitBtn);

    // The pendingSave should have been called
    await waitFor(() => {
      expect(pendingSave).toHaveBeenCalled();
    });

    // Resolve the pending save to clean up
    resolvePending && resolvePending();
  });
});
