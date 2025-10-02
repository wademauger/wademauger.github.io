/**
 * Test file for SongTabsAppModern create song modal functionality
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import the component under test
import SongTabsAppWithProvider from './SongTabsAppModern';
import chordsSlice from '../../store/chordsSlice';
import songsSlice from '../../store/songsSlice';

// Mock Google Drive Service
jest.mock('./services/GoogleDriveServiceModern', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(() => Promise.resolve()),
    getSignInStatus: jest.fn(() => ({
      isSignedIn: false,
      userEmail: null,
      userName: null,
      userPicture: null
    })),
    addSong: jest.fn(() => Promise.resolve()),
    loadLibrary: jest.fn(() => Promise.resolve({
      artists: [
        {
          name: 'Test Artist',
          albums: [
            {
              name: 'Test Album',
              songs: []
            }
          ]
        }
      ]
    }))
  }
}));

// Mock environment variables
import.meta.env.VITE_GOOGLE_CLIENT_ID = 'test-client-id';

// Create a test store
const createTestStore = () => configureStore({
  reducer: {
    chords: chordsSlice,
    songs: songsSlice
  }
});

// Helper function to render component with providers
const renderWithProviders = (component) => {
  const store = createTestStore();
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      <Provider store={store}>
        {component}
      </Provider>
    </GoogleOAuthProvider>
  );
};

describe('SongTabsAppModern - Create Song Modal', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
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

    // Click Add Song button
    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

    // Modal should be open
    await waitFor(() => {
      expect(screen.getByText('Add New Song')).toBeInTheDocument();
    });
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

    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

    // Check all form fields are present
    await waitFor(() => {
      expect(screen.getByLabelText(/song title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/artist/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/album/i)).toBeInTheDocument();
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

    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

    // Try to submit without filling fields
    const submitButton = await screen.findByText('Add Song');
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/please enter a song title/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter an artist name/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter an album title/i)).toBeInTheDocument();
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

    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

    // Fill song title field
    const songTitleInput = await screen.findByLabelText(/song title/i);
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

    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

    // Fill artist field
    const artistInput = await screen.findByLabelText(/artist/i);
    await user.type(artistInput, 'Test Artist');

    expect(artistInput).toHaveValue('Test Artist');

    // Should show autocomplete dropdown with existing artists
    await waitFor(() => {
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
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

    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

    // First select an artist
    const artistInput = await screen.findByLabelText(/artist/i);
    await user.type(artistInput, 'Test Artist');

    // Then fill album field
    const albumInput = await screen.findByLabelText(/album/i);
    await user.type(albumInput, 'Test Album');

    expect(albumInput).toHaveValue('Test Album');
  });

  test('successful form submission creates song with correct data structure', async () => {
    const user = userEvent.setup();
    const mockAddSong = jest.fn(() => Promise.resolve());
    
    // Mock the GoogleDriveServiceModern with our spy
    jest.doMock('./services/GoogleDriveServiceModern', () => ({
      __esModule: true,
      default: {
        initialize: jest.fn(() => Promise.resolve()),
        getSignInStatus: jest.fn(() => ({
          isSignedIn: false,
          userEmail: null,
          userName: null,
          userPicture: null
        })),
        addSong: mockAddSong,
        loadLibrary: jest.fn(() => Promise.resolve({
          artists: [
            {
              name: 'Test Artist',
              albums: [
                {
                  name: 'Test Album',
                  songs: []
                }
              ]
            }
          ]
        }))
      }
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

    // Fill out the form
    const songTitleInput = await screen.findByLabelText(/song title/i);
    const artistInput = await screen.findByLabelText(/artist/i);
    const albumInput = await screen.findByLabelText(/album/i);

    await user.type(songTitleInput, 'My Test Song');
    await user.type(artistInput, 'My Test Artist');
    await user.type(albumInput, 'My Test Album');

    // Submit the form
    const submitButton = screen.getAllByText('Add Song').find((button: any) => 
      button.closest('button')?.type === 'button'
    );
    await user.click(submitButton);

    // Verify the song data structure passed to addSong
    await waitFor(() => {
      expect(mockAddSong).toHaveBeenCalledWith(
        expect.any(Object), // library
        'My Test Artist',   // artistName
        'My Test Album',    // albumTitle
        expect.objectContaining({
          name: 'My Test Song', // This is the critical fix - should be 'name', not 'title'
          lyrics: [],
          notes: ''
        })
      );
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
    const songTitleInput = await screen.findByLabelText(/song title/i);
    const artistInput = await screen.findByLabelText(/artist/i);
    const albumInput = await screen.findByLabelText(/album/i);

    await user.type(songTitleInput, 'My Test Song');
    await user.type(artistInput, 'My Test Artist');
    await user.type(albumInput, 'My Test Album');

    // Submit the form
    const submitButton = screen.getAllByText('Add Song').find((button: any) => 
      button.closest('button')?.type === 'button'
    );
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
    const songTitleInput = await screen.findByLabelText(/song title/i);
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
    renderWithProviders(<SongTabsAppWithProvider />);
    
    await waitFor(() => {
      expect(screen.getByText(/songs in library/i)).toBeInTheDocument();
    });

    // Enable editing mode and open modal
    const editToggle = screen.getByRole('switch');
    await user.click(editToggle);

    const addSongButton = await screen.findByText('Add Song');
    await user.click(addSongButton);

    // Fill out form fields
    const songTitleInput = await screen.findByLabelText(/song title/i);
    const artistInput = await screen.findByLabelText(/artist/i);
    await user.type(songTitleInput, 'Test Song');
    await user.type(artistInput, 'Test Artist');

    // Cancel
    const cancelButton = await screen.findByText('Cancel');
    await user.click(cancelButton);

    // Reopen modal
    await user.click(addSongButton);

    // Fields should be empty
    await waitFor(() => {
      const newSongTitleInput = screen.getByLabelText(/song title/i);
      const newArtistInput = screen.getByLabelText(/artist/i);
      expect(newSongTitleInput).toHaveValue('');
      expect(newArtistInput).toHaveValue('');
    });
  });

  test('error handling for failed song creation', async () => {
    const user = userEvent.setup();
    const mockAddSong = jest.fn(() => Promise.reject(new Error('Failed to add song')));
    
    jest.doMock('./services/GoogleDriveServiceModern', () => ({
      __esModule: true,
      default: {
        initialize: jest.fn(() => Promise.resolve()),
        getSignInStatus: jest.fn(() => ({
          isSignedIn: false,
          userEmail: null,
          userName: null,
          userPicture: null
        })),
        addSong: mockAddSong,
        loadLibrary: jest.fn(() => Promise.resolve({
          artists: []
        }))
      }
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

    // Fill out the form
    const songTitleInput = await screen.findByLabelText(/song title/i);
    const artistInput = await screen.findByLabelText(/artist/i);
    const albumInput = await screen.findByLabelText(/album/i);

    await user.type(songTitleInput, 'My Test Song');
    await user.type(artistInput, 'My Test Artist');
    await user.type(albumInput, 'My Test Album');

    // Submit the form
    const submitButton = screen.getAllByText('Add Song').find((button: any) => 
      button.closest('button')?.type === 'button'
    );
    await user.click(submitButton);

    // Should show error message (this will depend on your error handling implementation)
    await waitFor(() => {
      // The modal should stay open on error
      expect(screen.getByText('Add New Song')).toBeInTheDocument();
    });
  });

  test('loading state is shown during song creation', async () => {
    const user = userEvent.setup();
    let resolveAddSong;
    const mockAddSong = jest.fn(() => new Promise(resolve => {
      resolveAddSong = resolve;
    }));
    
    jest.doMock('./services/GoogleDriveServiceModern', () => ({
      __esModule: true,
      default: {
        initialize: jest.fn(() => Promise.resolve()),
        getSignInStatus: jest.fn(() => ({
          isSignedIn: false,
          userEmail: null,
          userName: null,
          userPicture: null
        })),
        addSong: mockAddSong,
        loadLibrary: jest.fn(() => Promise.resolve({
          artists: []
        }))
      }
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

    // Fill out the form
    const songTitleInput = await screen.findByLabelText(/song title/i);
    const artistInput = await screen.findByLabelText(/artist/i);
    const albumInput = await screen.findByLabelText(/album/i);

    await user.type(songTitleInput, 'My Test Song');
    await user.type(artistInput, 'My Test Artist');
    await user.type(albumInput, 'My Test Album');

    // Submit the form
    const submitButton = screen.getAllByText('Add Song').find((button: any) => 
      button.closest('button')?.type === 'button'
    );
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/adding.../i)).toBeInTheDocument();
    });

    // Resolve the promise
    resolveAddSong();
  });
});
