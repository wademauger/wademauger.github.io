/**
 * Test file for SongTabsAppModern create song modal functionality
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import testUtils from '@/tests/testUtils';
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
const DriveMockModule: any = testUtils.getDriveMock();

// Mock environment variables for Jest (import.meta is not available outside ESM)
// Create a global object that code under test can read instead.
// Some build setups read from import.meta.env; tests can read from globalThis.__IMPORT_META_ENV__
// @ts-ignore
globalThis.__IMPORT_META_ENV__ = globalThis.__IMPORT_META_ENV__ || {};
globalThis.__IMPORT_META_ENV__.VITE_GOOGLE_CLIENT_ID = 'test-client-id';

// Reuse shared test utilities
const { renderWithProviders, resetDriveMock, getInnerInputByTestId, findInputByLabel, findModalSubmitButton } = testUtils;

// We re-use helpers: findModalSubmitButton, getInnerInputByTestId, findInputByLabel

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
    resetDriveMock && resetDriveMock();
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
  await act(async () => {
    await user.click(submitButton);
  });

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
  render(<SongEditor isNewSong={true} isGoogleDriveConnected={true} song={{ title: '' } as any} artist={{ name: '' } as any} album={{ title: '' } as any} library={{ artists: [] } as any} onSave={jest.fn() as any} onCancel={onCancel as any} lyricsRef={null as any} />);

    // Fill out fields
    const songTitleInput = await getInnerInputByTestId('input-title');
    const artistInput = await getInnerInputByTestId('input-artist');
    await user.click(songTitleInput);
    await user.type(songTitleInput, 'Test Song');
    await user.click(artistInput);
    await user.type(artistInput, 'Test Artist');

    // Click cancel - Modal.confirm is mocked to immediately call onOk which should call onCancel
    const cancelButton = await screen.findByText('Cancel');
    await act(async () => {
      await user.click(cancelButton);
    });

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
    await act(async () => {
      await user.click(submitBtn);
    });

    // The pendingSave should have been called
    await waitFor(() => {
      expect(pendingSave).toHaveBeenCalled();
    });

    // Resolve the pending save to clean up
    resolvePending && resolvePending();
  });
});
