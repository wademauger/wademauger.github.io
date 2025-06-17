import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import googleDriveService from '../apps/songs/services/GoogleDriveServiceModern';

// Async thunk for loading library from Google Drive
export const loadLibraryFromDrive = createAsyncThunk(
  'songs/loadLibraryFromDrive',
  async (_, { rejectWithValue }) => {
    try {
      const library = await googleDriveService.loadLibrary();
      return library;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating a song
export const updateSong = createAsyncThunk(
  'songs/updateSong',
  async ({ artistName, albumTitle, songTitle, updatedSongData, isGoogleDriveConnected }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // Create a deep clone to pass a plain JS object to the service
      const library = JSON.parse(JSON.stringify(state.songs.library));
      
      if (isGoogleDriveConnected) {
        await googleDriveService.updateSong(library, artistName, albumTitle, songTitle, updatedSongData);
        // Return the updated library from Google Drive
        const updatedLibrary = await googleDriveService.loadLibrary();
        return { library: updatedLibrary, artistName, albumTitle, songTitle };
      } else {
        // For local updates, we'll handle this in the reducer
        return { updatedSongData, artistName, albumTitle, songTitle, isLocal: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding a song
export const addSong = createAsyncThunk(
  'songs/addSong',
  async ({ artistName, albumTitle, songData, isGoogleDriveConnected }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // Create a deep clone to pass a plain JS object to the service
      const library = JSON.parse(JSON.stringify(state.songs.library));
      
      if (isGoogleDriveConnected) {
        await googleDriveService.addSong(library, artistName, albumTitle, songData);
        // Return the updated library from Google Drive
        const updatedLibrary = await googleDriveService.loadLibrary();
        return { library: updatedLibrary, artistName, albumTitle, songTitle: songData.title };
      } else {
        // For local updates, we'll handle this in the reducer
        return { songData, artistName, albumTitle, isLocal: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding an empty artist
export const addArtist = createAsyncThunk(
  'songs/addArtist',
  async ({ artistName, isGoogleDriveConnected }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // Create a deep clone to pass a plain JS object to the service
      const library = JSON.parse(JSON.stringify(state.songs.library));
      
      if (isGoogleDriveConnected) {
        await googleDriveService.addArtist(library, artistName);
        // Return the updated library from Google Drive
        const updatedLibrary = await googleDriveService.loadLibrary();
        return { library: updatedLibrary, artistName };
      } else {
        // For local updates, we'll handle this in the reducer
        return { artistName, isLocal: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding an empty album
export const addAlbum = createAsyncThunk(
  'songs/addAlbum',
  async ({ artistName, albumTitle, isGoogleDriveConnected }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // Create a deep clone to pass a plain JS object to the service
      const library = JSON.parse(JSON.stringify(state.songs.library));
      
      if (isGoogleDriveConnected) {
        await googleDriveService.addAlbum(library, artistName, albumTitle);
        // Return the updated library from Google Drive
        const updatedLibrary = await googleDriveService.loadLibrary();
        return { library: updatedLibrary, artistName, albumTitle };
      } else {
        // For local updates, we'll handle this in the reducer
        return { artistName, albumTitle, isLocal: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting a song
export const deleteSong = createAsyncThunk(
  'songs/deleteSong',
  async ({ artistName, albumTitle, songTitle, isGoogleDriveConnected }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // Create a deep clone to pass a plain JS object to the service
      const library = JSON.parse(JSON.stringify(state.songs.library));
      
      if (isGoogleDriveConnected) {
        await googleDriveService.deleteSong(library, artistName, albumTitle, songTitle);
        // Return the updated library from Google Drive
        const updatedLibrary = await googleDriveService.loadLibrary();
        return { library: updatedLibrary, artistName, albumTitle, songTitle };
      } else {
        // For local updates, we'll handle this in the reducer
        return { artistName, albumTitle, songTitle, isLocal: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating an artist
export const updateArtist = createAsyncThunk(
  'songs/updateArtist',
  async ({ oldArtistName, newArtistName, isGoogleDriveConnected }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));
      
      if (isGoogleDriveConnected) {
        await googleDriveService.updateArtist(library, oldArtistName, newArtistName);
        const updatedLibrary = await googleDriveService.loadLibrary();
        return { library: updatedLibrary, oldArtistName, newArtistName };
      } else {
        return { oldArtistName, newArtistName, isLocal: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating an album
export const updateAlbum = createAsyncThunk(
  'songs/updateAlbum',
  async ({ artistName, oldAlbumTitle, newAlbumTitle, isGoogleDriveConnected }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));
      
      if (isGoogleDriveConnected) {
        await googleDriveService.updateAlbum(library, artistName, oldAlbumTitle, newAlbumTitle);
        const updatedLibrary = await googleDriveService.loadLibrary();
        return { library: updatedLibrary, artistName, oldAlbumTitle, newAlbumTitle };
      } else {
        return { artistName, oldAlbumTitle, newAlbumTitle, isLocal: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting an artist
export const deleteArtist = createAsyncThunk(
  'songs/deleteArtist',
  async ({ artistName, isGoogleDriveConnected }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));
      
      if (isGoogleDriveConnected) {
        await googleDriveService.deleteArtist(library, artistName);
        const updatedLibrary = await googleDriveService.loadLibrary();
        return { library: updatedLibrary, artistName };
      } else {
        return { artistName, isLocal: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting an album
export const deleteAlbum = createAsyncThunk(
  'songs/deleteAlbum',
  async ({ artistName, albumTitle, isGoogleDriveConnected }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));
      
      if (isGoogleDriveConnected) {
        await googleDriveService.deleteAlbum(library, artistName, albumTitle);
        const updatedLibrary = await googleDriveService.loadLibrary();
        return { library: updatedLibrary, artistName, albumTitle };
      } else {
        return { artistName, albumTitle, isLocal: true };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  library: { artists: [] },
  selectedSong: null,
  isLoading: false,
  error: null,
  isGoogleDriveConnected: false,
  userInfo: null,
  editingEnabled: false,
};

// Helper function to normalize album property names
const normalizeAlbum = (album) => {
  if (!album) return album;
  // Albums should only have 'title' property
  // Create a completely new object to avoid read-only property issues
  const { name, title, ...rest } = album;
  return {
    ...rest,
    title: title || name,
  };
};

// Helper function to normalize song property names
const normalizeSong = (song) => {
  if (!song) return song;
  // Songs should only have 'title' property
  // Create a completely new object to avoid read-only property issues
  const { name, title, ...rest } = song;
  return {
    ...rest,
    title: title || name,
  };
};

// Helper function to find and return song with normalized structure
const findSongWithArtistAlbum = (library, artistName, albumTitle, songTitle) => {
  const artist = library.artists.find(a => a.name === artistName);
  if (!artist) return null;
  
  const album = artist.albums.find(a => a.title === albumTitle);
  if (!album) return null;
  
  const song = album.songs.find(s => s.title === songTitle);
  if (!song) return null;
  
  return {
    ...normalizeSong(song),
    artist: { name: artistName },
    album: { title: albumTitle }
  };
};

const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    setSelectedSong: (state, action) => {
      state.selectedSong = action.payload;
    },
    clearSelectedSong: (state) => {
      state.selectedSong = null;
    },
    setLibrary: (state, action) => {
      // Normalize all albums and songs in the library
      const normalizedLibrary = {
        ...action.payload,
        artists: action.payload.artists.map(artist => ({
          ...artist,
          albums: artist.albums.map(album => ({
            ...normalizeAlbum(album),
            songs: album.songs.map(normalizeSong)
          }))
        }))
      };
      state.library = normalizedLibrary;
    },
    loadMockLibrary: (state) => {
      state.library = {
        artists: [
          {
            name: 'Artist Test',
            albums: [
              {
                title: 'Album Test',
                songs: [
                  {
                    title: 'Song Test',
                    lyrics: [
                      "1234567890 [Cmaj7]0987654321",
                      "[Cm7]1234567890 [C7]0987654321",
                      "[C]12345 [Cmaj7]67890 [Cm7]12345 [C7]67890",
                    ],
                    notes: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                ]
              }
            ]
          }
        ],
        version: '1.0',
        lastUpdated: new Date().toISOString()
      };
    },
    setGoogleDriveConnection: (state, action) => {
      state.isGoogleDriveConnected = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    setEditingEnabled: (state, action) => {
      state.editingEnabled = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Local update for mock data
    updateSongLocal: (state, action) => {
      const { artistName, albumTitle, songTitle, updatedSongData } = action.payload;
      
      const artist = state.library.artists.find(a => a.name === artistName);
      if (!artist) return;
      
      const album = artist.albums.find(a => a.title === albumTitle);
      if (!album) return;
      
      const songIndex = album.songs.findIndex(s => s.title === songTitle);
      if (songIndex === -1) return;
      
      // Create a completely new song object to avoid immutability issues
      const currentSong = album.songs[songIndex];
      const newSongData = {
        ...currentSong,
        ...updatedSongData,
        updatedAt: new Date().toISOString()
      };
      
      // Update the song with normalized data
      album.songs[songIndex] = normalizeSong(newSongData);
      
      // Update selected song if it's the same song
      if (state.selectedSong && 
          state.selectedSong.artist.name === artistName &&
          state.selectedSong.album.title === albumTitle &&
          state.selectedSong.title === songTitle) {
        state.selectedSong = {
          ...album.songs[songIndex],
          artist: { name: artistName },
          album: { title: albumTitle }
        };
      }
    },
    // Local add for mock data
    addSongLocal: (state, action) => {
      const { artistName, albumTitle, songData } = action.payload;
      
      // Find or create artist
      let artist = state.library.artists.find(a => a.name === artistName);
      if (!artist) {
        artist = { name: artistName, albums: [] };
        state.library.artists.push(artist);
      }
      
      // Find or create album
      let album = artist.albums.find(a => a.title === albumTitle);
      if (!album) {
        album = normalizeAlbum({ 
          title: albumTitle, 
          songs: [] 
        });
        artist.albums.push(album);
      }
      
      // Add song
      const newSong = normalizeSong({
        ...songData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      album.songs.push(newSong);
    },
  },
  extraReducers: (builder) => {
    builder
      // Load library from Drive
      .addCase(loadLibraryFromDrive.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadLibraryFromDrive.fulfilled, (state, action) => {
        state.isLoading = false;
        // Normalize the library from Google Drive
        const normalizedLibrary = {
          ...action.payload,
          artists: action.payload.artists.map(artist => ({
            ...artist,
            albums: artist.albums.map(album => ({
              ...normalizeAlbum(album),
              songs: album.songs.map(normalizeSong)
            }))
          }))
        };
        state.library = normalizedLibrary;
      })
      .addCase(loadLibraryFromDrive.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Fall back to mock library
        state.library = {
          artists: [
            {
              name: 'Artist Test',
              albums: [
                {
                  title: 'Album Test',
                  songs: [
                    {
                      title: 'Song Test',
                      lyrics: [
                        "1234567890 [Cmaj7]0987654321",
                        "[Cm7]1234567890 [C7]0987654321",
                        "[C]12345 [Cmaj7]67890 [Cm7]12345 [C7]67890",
                      ],
                      notes: '',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }
                  ]
                }
              ]
            }
          ],
          version: '1.0',
          lastUpdated: new Date().toISOString()
        };
      })
      // Update song
      .addCase(updateSong.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSong.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, albumTitle, songTitle, updatedSongData, isLocal } = action.payload;
        
        if (isLocal) {
          // Handle local update
          songsSlice.caseReducers.updateSongLocal(state, {
            payload: { artistName, albumTitle, songTitle, updatedSongData }
          });
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map(artist => ({
              ...artist,
              albums: artist.albums.map(album => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;
          
          // Update selected song
          state.selectedSong = findSongWithArtistAlbum(state.library, artistName, albumTitle, songTitle);
        }
      })
      .addCase(updateSong.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add song
      .addCase(addSong.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addSong.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, albumTitle, songTitle, songData, isLocal } = action.payload;
        
        if (isLocal) {
          // Handle local add
          songsSlice.caseReducers.addSongLocal(state, {
            payload: { artistName, albumTitle, songData }
          });
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map(artist => ({
              ...artist,
              albums: artist.albums.map(album => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;
        }
        
        // Auto-select the newly added song
        state.selectedSong = findSongWithArtistAlbum(state.library, artistName, albumTitle, songTitle);
      })
      .addCase(addSong.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete song
      .addCase(deleteSong.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, albumTitle, songTitle, isLocal } = action.payload;
        
        if (isLocal) {
          // Handle local delete
          const artist = state.library.artists.find(a => a.name === artistName);
          if (artist) {
            const album = artist.albums.find(a => a.title === albumTitle);
            if (album) {
              // Remove song locally
              album.songs = album.songs.filter(s => s.title !== songTitle);
            }
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map(artist => ({
              ...artist,
              albums: artist.albums.map(album => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;
        }
        
        // Deselect song if it was the deleted song
        if (state.selectedSong && 
            state.selectedSong.artist.name === artistName &&
            state.selectedSong.album.title === albumTitle &&
            state.selectedSong.title === songTitle) {
          state.selectedSong = null;
        }
      })
      .addCase(deleteSong.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add artist
      .addCase(addArtist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addArtist.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, isLocal } = action.payload;
        
        if (isLocal) {
          // Handle local add
          const existingArtist = state.library.artists.find(a => a.name === artistName);
          if (!existingArtist) {
            state.library.artists.push({ name: artistName, albums: [] });
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map(artist => ({
              ...artist,
              albums: artist.albums.map(album => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;
        }
      })
      .addCase(addArtist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add album
      .addCase(addAlbum.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAlbum.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, albumTitle, isLocal } = action.payload;
        
        if (isLocal) {
          // Handle local add
          let artist = state.library.artists.find(a => a.name === artistName);
          if (!artist) {
            artist = { name: artistName, albums: [] };
            state.library.artists.push(artist);
          }
          
          const existingAlbum = artist.albums.find(a => a.title === albumTitle);
          if (!existingAlbum) {
            artist.albums.push(normalizeAlbum({ title: albumTitle, songs: [] }));
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map(artist => ({
              ...artist,
              albums: artist.albums.map(album => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;
        }
      })
      .addCase(addAlbum.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update artist
      .addCase(updateArtist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateArtist.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, oldArtistName, newArtistName, isLocal } = action.payload;
        
        if (isLocal) {
          // Handle local update - find and rename artist
          const artist = state.library.artists.find(a => a.name === oldArtistName);
          if (artist) {
            artist.name = newArtistName;
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map(artist => ({
              ...artist,
              albums: artist.albums.map(album => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;
        }
      })
      .addCase(updateArtist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update album
      .addCase(updateAlbum.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAlbum.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, oldAlbumTitle, newAlbumTitle, isLocal } = action.payload;
        
        if (isLocal) {
          // Handle local update - find and rename album
          const artist = state.library.artists.find(a => a.name === artistName);
          if (artist) {
            const album = artist.albums.find(a => a.title === oldAlbumTitle);
            if (album) {
              album.title = newAlbumTitle;
            }
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map(artist => ({
              ...artist,
              albums: artist.albums.map(album => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;
        }
      })
      .addCase(updateAlbum.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete artist
      .addCase(deleteArtist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteArtist.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, isLocal } = action.payload;
        
        if (isLocal) {
          // Handle local delete
          state.library.artists = state.library.artists.filter(a => a.name !== artistName);
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map(artist => ({
              ...artist,
              albums: artist.albums.map(album => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;
        }
        
        // Deselect song if the artist of the selected song was deleted
        if (state.selectedSong && state.selectedSong.artist.name === artistName) {
          state.selectedSong = null;
        }
      })
      .addCase(deleteArtist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete album
      .addCase(deleteAlbum.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAlbum.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, albumTitle, isLocal } = action.payload;
        
        if (isLocal) {
          // Handle local delete
          const artist = state.library.artists.find(a => a.name === artistName);
          if (artist) {
            artist.albums = artist.albums.filter(a => a.title !== albumTitle);
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map(artist => ({
              ...artist,
              albums: artist.albums.map(album => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;
        }
        
        // Deselect song if the album of the selected song was deleted
        if (state.selectedSong && 
            state.selectedSong.album.title === albumTitle &&
            state.selectedSong.artist.name === artistName) {
          state.selectedSong = null;
        }
      })
      .addCase(deleteAlbum.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSelectedSong, 
  clearSelectedSong, 
  setLibrary, 
  loadMockLibrary,
  setGoogleDriveConnection,
  setUserInfo,
  setEditingEnabled,
  setError, 
  clearError,
  updateSongLocal,
  addSongLocal 
} = songsSlice.actions;

// Selectors
export const selectLibrary = (state) => state.songs.library;
export const selectSelectedSong = (state) => state.songs.selectedSong;
export const selectIsLoading = (state) => state.songs.isLoading;
export const selectError = (state) => state.songs.error;
export const selectIsGoogleDriveConnected = (state) => state.songs.isGoogleDriveConnected;
export const selectUserInfo = (state) => state.songs.userInfo;

// Helper selector to get total songs count
export const selectTotalSongsCount = (state) => {
  const library = selectLibrary(state);
  if (!library || !library.artists) return 0;
  return library.artists.reduce((total, artist) => {
    return total + artist.albums.reduce((albumTotal, album) => {
      return albumTotal + (album.songs ? album.songs.length : 0);
    }, 0);
  }, 0);
};

// Helper selector to find a song by artist, album, and song names
export const selectSongByIdentifiers = (state, artistName, albumTitle, songTitle) => {
  const library = selectLibrary(state);
  return findSongWithArtistAlbum(library, artistName, albumTitle, songTitle);
};

export default songsSlice.reducer;
