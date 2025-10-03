import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import googleDriveService from '../apps/songs/services/GoogleDriveServiceModern';
import { loadFullLibrary, saveFullLibrary } from './librarySlice';

// Async thunk for loading library from Google Drive
export const loadLibraryFromDrive = createAsyncThunk(
  'songs/loadLibraryFromDrive',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const lib = await dispatch(loadFullLibrary()).unwrap();
      return lib;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : String(error));
    }
  }
);

// Async thunk for updating a song
export const updateSong = createAsyncThunk(
  'songs/updateSong',
  async (params: any, { getState, dispatch, rejectWithValue }) => {
    const {
      artistName,
      albumTitle,
      songTitle,
      updatedSongData,
      newArtistName,
      newAlbumTitle,
      newSongTitle,
      isGoogleDriveConnected
    } = params;

    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));

      const metadataChanged = (
        newArtistName && newArtistName !== artistName ||
        newAlbumTitle && newAlbumTitle !== albumTitle ||
        newSongTitle && newSongTitle !== songTitle
      );

      if (!isGoogleDriveConnected) {
        return { updatedSongData, artistName, albumTitle, songTitle, newArtistName, newAlbumTitle, newSongTitle, metadataChanged, isLocal: true };
      }

      // Apply update locally to the cloned library so we can persist whole payload via saveFullLibrary
      const artist = library.artists.find((a: any) => a.name === artistName);
      const album = artist?.albums.find((a: any) => a.title === albumTitle);
      const songIndex = album ? album.songs.findIndex((s: any) => s.title === songTitle) : -1;
      if (!artist || !album || songIndex === -1) {
        throw new Error('Original song not found');
      }

      const currentSong = album.songs[songIndex];

      if (metadataChanged) {
        const targetArtist = newArtistName || artistName;
        const targetAlbum = newAlbumTitle || albumTitle;
        const targetTitle = newSongTitle || songTitle;

        // Find or create target artist/album
        let targetArtistObj = library.artists.find((a: any) => a.name === targetArtist);
        if (!targetArtistObj) { targetArtistObj = { name: targetArtist, albums: [] }; library.artists.push(targetArtistObj); }
        let targetAlbumObj = targetArtistObj.albums.find((a: any) => a.title === targetAlbum);
        if (!targetAlbumObj) { targetAlbumObj = { title: targetAlbum, songs: [] }; targetArtistObj.albums.push(targetAlbumObj); }

        const newSongData = { ...currentSong, ...updatedSongData, title: targetTitle, updatedAt: new Date().toISOString() };
        targetAlbumObj.songs.push(newSongData);

        // Remove original
        album.songs.splice(songIndex, 1);
      } else {
        // Normal update
        const newSongData = { ...currentSong, ...updatedSongData, updatedAt: new Date().toISOString() };
        album.songs[songIndex] = newSongData;
      }

      // Persist full library
      await dispatch(saveFullLibrary(library)).unwrap();

      return {
        library,
        artistName,
        albumTitle,
        songTitle,
        updatedSongData,
        newArtistName,
        newAlbumTitle,
        newSongTitle,
        metadataChanged,
        isLocal: false
      };
    } catch (error: any) {
      return rejectWithValue(error.message || String(error));
    }
  }
);

// Async thunk for adding a song
export const addSong = createAsyncThunk(
  'songs/addSong',
  async ({ artistName, albumTitle, songData, isGoogleDriveConnected }: any, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));

      if (!isGoogleDriveConnected) {
        return { songData, artistName, albumTitle, isLocal: true };
      }

      // Find or create artist/album in cloned library
      let artist = library.artists.find((a: any) => a.name === artistName);
      if (!artist) { artist = { name: artistName, albums: [] }; library.artists.push(artist); }
      let album = artist.albums.find((a: any) => a.title === albumTitle);
      if (!album) { album = { title: albumTitle, songs: [] }; artist.albums.push(album); }

      const newSong = { ...songData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      album.songs.push(newSong);

      await dispatch(saveFullLibrary(library)).unwrap();

      return { library, artistName, albumTitle, songTitle: newSong.title };
    } catch (error: any) {
      return rejectWithValue(error.message || String(error));
    }
  }
);

// Async thunk for adding an empty artist
export const addArtist = createAsyncThunk(
  'songs/addArtist',
  async ({ artistName, isGoogleDriveConnected }: any, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));

      if (!isGoogleDriveConnected) {
        return { artistName, isLocal: true };
      }

      // Add artist locally and persist
      library.artists = library.artists || [];
      if (!library.artists.find((a: any) => a.name === artistName)) {
        library.artists.push({ name: artistName, albums: [] });
      }

      await dispatch(saveFullLibrary(library)).unwrap();
      return { library, artistName };
    } catch (error: any) {
      return rejectWithValue(error.message || String(error));
    }
  }
);

// Async thunk for adding an empty album
export const addAlbum = createAsyncThunk(
  'songs/addAlbum',
  async ({ artistName, albumTitle, isGoogleDriveConnected }: any, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));

      if (!isGoogleDriveConnected) {
        return { artistName, albumTitle, isLocal: true };
      }

      // Find or create artist
      let artist = library.artists.find((a: any) => a.name === artistName);
      if (!artist) { artist = { name: artistName, albums: [] }; library.artists.push(artist); }

      if (!artist.albums.find((al: any) => al.title === albumTitle)) {
        artist.albums.push({ title: albumTitle, songs: [] });
      }

      await dispatch(saveFullLibrary(library)).unwrap();
      return { library, artistName, albumTitle };
    } catch (error: any) {
      return rejectWithValue(error.message || String(error));
    }
  }
);

// Async thunk for deleting a song
export const deleteSong = createAsyncThunk(
  'songs/deleteSong',
  async ({ artistName, albumTitle, songTitle, isGoogleDriveConnected }: any, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));

      if (!isGoogleDriveConnected) {
        return { artistName, albumTitle, songTitle, isLocal: true };
      }

      const artist = library.artists.find((a: any) => a.name === artistName);
      if (!artist) throw new Error('Artist not found');
      const album = artist.albums.find((a: any) => a.title === albumTitle);
      if (!album) throw new Error('Album not found');

      album.songs = album.songs.filter((s: any) => s.title !== songTitle);

      // Cleanup empty album/artist
      if (album.songs.length === 0) {
        artist.albums = artist.albums.filter((a: any) => a.title !== albumTitle);
      }
      if (artist.albums.length === 0) {
        library.artists = library.artists.filter((a: any) => a.name !== artistName);
      }

      await dispatch(saveFullLibrary(library)).unwrap();

      return { library, artistName, albumTitle, songTitle };
    } catch (error: any) {
      return rejectWithValue(error.message || String(error));
    }
  }
);

// Async thunk for updating an artist
export const updateArtist = createAsyncThunk(
  'songs/updateArtist',
  async ({ oldArtistName, newArtistName, isGoogleDriveConnected }: any, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));

      if (!isGoogleDriveConnected) {
        return { oldArtistName, newArtistName, isLocal: true };
      }

      const artist = library.artists.find((a: any) => a.name === oldArtistName);
      if (!artist) throw new Error('Artist not found');
      artist.name = newArtistName;

      await dispatch(saveFullLibrary(library)).unwrap();
      return { library, oldArtistName, newArtistName };
    } catch (error: any) {
      return rejectWithValue(error.message || String(error));
    }
  }
);

// Async thunk for updating an album
export const updateAlbum = createAsyncThunk(
  'songs/updateAlbum',
  async ({ artistName, oldAlbumTitle, newAlbumTitle, isGoogleDriveConnected }: any, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));

      if (!isGoogleDriveConnected) {
        return { artistName, oldAlbumTitle, newAlbumTitle, isLocal: true };
      }

      const artist = library.artists.find((a: any) => a.name === artistName);
      if (!artist) throw new Error('Artist not found');
      const album = artist.albums.find((a: any) => a.title === oldAlbumTitle);
      if (!album) throw new Error('Album not found');
      album.title = newAlbumTitle;

      await dispatch(saveFullLibrary(library)).unwrap();
      return { library, artistName, oldAlbumTitle, newAlbumTitle };
    } catch (error: any) {
      return rejectWithValue(error.message || String(error));
    }
  }
);

// Async thunk for deleting an artist
export const deleteArtist = createAsyncThunk(
  'songs/deleteArtist',
  async ({ artistName, isGoogleDriveConnected }: any, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));

      if (!isGoogleDriveConnected) {
        return { artistName, isLocal: true };
      }

      library.artists = library.artists.filter((a: any) => a.name !== artistName);

      await dispatch(saveFullLibrary(library)).unwrap();
      return { library, artistName };
    } catch (error: any) {
      return rejectWithValue(error.message || String(error));
    }
  }
);

// Async thunk for deleting an album
export const deleteAlbum = createAsyncThunk(
  'songs/deleteAlbum',
  async ({ artistName, albumTitle, isGoogleDriveConnected }: any, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const library = JSON.parse(JSON.stringify(state.songs.library));

      if (!isGoogleDriveConnected) {
        return { artistName, albumTitle, isLocal: true };
      }

      const artist = library.artists.find((a: any) => a.name === artistName);
      if (!artist) throw new Error('Artist not found');
      artist.albums = artist.albums.filter((a: any) => a.title !== albumTitle);

      // Cleanup artist if empty
      if (!artist.albums || artist.albums.length === 0) {
        library.artists = library.artists.filter((a: any) => a.name !== artistName);
      }

      await dispatch(saveFullLibrary(library)).unwrap();
      return { library, artistName, albumTitle };
    } catch (error: any) {
      return rejectWithValue(error.message || String(error));
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
  editingEnabled: false
};

// Helper function to normalize album property names
const normalizeAlbum = (album: any) => {
  if (!album) return album;
  // Albums should only have 'title' property
  // Create a completely new object to avoid read-only property issues
  const { name, title, ...rest } = album;
  return {
    ...rest,
    title: title || name
  };
};

// Helper function to normalize song property names
const normalizeSong = (song: any) => {
  if (!song) return song;
  // Songs should only have 'title' property
  // Create a completely new object to avoid read-only property issues
  const { name, title, lyrics, ...rest } = song;

  // Convert lyrics from array to string if needed
  let normalizedLyrics = lyrics;
  if (Array.isArray(lyrics)) {
    normalizedLyrics = lyrics.join('\n');
  } else if (typeof lyrics !== 'string') {
    normalizedLyrics = '';
  }

  return {
    ...rest,
    title: title || name,
    lyrics: normalizedLyrics
  };
};

// Helper function to find and return song with normalized structure
const findSongWithArtistAlbum = (library, artistName, albumTitle, songTitle) => {
  const artist = library.artists.find((a: any) => a.name === artistName);
  if (!artist) return null;

  const album = artist.albums.find((a: any) => a.title === albumTitle);
  if (!album) return null;

  const song = album.songs.find((s: any) => s.title === songTitle);
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
    clearSelectedSong: (state: any) => {
      state.selectedSong = null;
    },
    setLibrary: (state, action) => {
      // Normalize all albums and songs in the library
      try {
        console.log('songsSlice.setLibrary called — incoming artists=', (action.payload && action.payload.artists) ? action.payload.artists.length : 0);
      } catch (e) {
        // ignore
      }
      const normalizedLibrary = {
        ...action.payload,
        artists: action.payload.artists.map((artist: any) => ({
          ...artist,
          albums: artist.albums.map((album: any) => ({
            ...normalizeAlbum(album),
            songs: album.songs.map(normalizeSong)
          }))
        }))
      };
      state.library = normalizedLibrary;
      try {
        console.log('songsSlice.setLibrary applied — resulting artists=', state.library.artists.length);
      } catch (e) {}
    },
    loadMockLibrary: (state: any) => {
      const mockLibrary = {
        artists: [
          {
            name: 'Demo Artist',
            albums: [
              {
                title: 'Demo Album',
                songs: [
                  {
                    title: 'Morning Light',
                    lyrics: [
                      '[C]Waking up to [G]morning skies',
                      '[Am]Colors painting [F]both my eyes',
                      '[C]Hope is rising, [G]soft and clear',
                      '[Am]Every day I [F]find you near'
                    ],
                    notes: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  },
                  {
                    title: 'Old River Blues',
                    lyrics: [
                      '[G]I went down to the [C]river,',
                      '[G]sang a lonesome [D7]tune.',
                      '[G]I went down to the [C]river,',
                      '[G]sang a lonesome [D7]tune.',
                      '[G]Water keeps on [C]rolling,',
                      '[D7]Morning comes too [G]soon.'
                    ],
                    notes: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  },
                  {
                    title: 'Wandering Home',
                    lyrics: [
                      '[Dm]Steps along the [G]empty street,',
                      '[C]Dreams beneath my [Am]tired feet.',
                      '[Dm]Shadows whisper, [G]soft and low,',
                      '[C]Guiding me back [Am]home I go.'
                    ],
                    notes: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  },
                  {
                    title: 'Highway Turning',
                    lyrics: [
                      '[G]Wheels keep rolling [D]down the line,',
                      '[Em]Chasing hours I [C]left behind.',
                      '[G]Every town I [D]pass on through,',
                      '[Em]Holds a memory [C]left with you.',
                      '',
                      '[G]Skyline fading [D]into gray,',
                      '[Em]Sunset pulls the [C]night my way.',
                      '[G]Every mile the [D]engine sings,',
                      '[Em]Hope is carried [C]on the strings.',
                      '',
                      '[Am]Will I find you [Em]waiting still?',
                      '[F]Standing by the [C]window sill.',
                      '[Am]Or has time pulled [Em]you away,',
                      '[F]Like the night steals [C]light from day?'
                    ],
                    notes: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  },
                  {
                    title: 'Cascadia Chords',
                    lyrics: [
                      '[C]  [Cmaj7]      [C7]   [F]  [Fm]   [C]  [A7]   [Dm]   [G7]',
                      '[Em]   [A7]   [Dm7]    [G7]   [Cmaj7]      [F]  [Bm7b5]      [E7]   [Am]',
                      '[D7]   [G7]   [Cmaj7]      [Fmaj7]      [Fm]   [C]  [G]  [C]'
                    ],
                    notes: 'Instrumental / chord progression only',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  },
                  {
                    title: 'Midnight Café',
                    lyrics: [
                      '[Am7]Lonely tables [D9]under neon [Gmaj7]glow,',
                      '[C#m7b5]Coffee cooling [F#7b9]while the night winds [Bm7]slow.',
                      '[E7#9]Laughter lingers [Am7]from another [D13]booth,',
                      '[Gmaj7]Every stranger [C9]speaks a bit of [F#7b13]truth.',
                      '',
                      '[Bm7]City breathing [E7alt]soft and low,',
                      '[Am7]Midnight café [D9]where the dreamers [Gmaj7]go.'
                    ],
                    notes: 'Jazz-inspired with complex chords',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  },
                  {
                    title: 'Fire Escape',
                    lyrics: [
                      '[C]I was waiting on the [Am]fire escape,',
                      '[G]Counting stars as the [F]night grew late.',
                      '[C]Every shadow seemed to [Am]call my name,',
                      '[G]But the world keeps [F]turning all the same.',
                      '',
                      '[Am]Hold on, [F]I’ll find a [C]way,',
                      '[G]Through the dark into the [Am]day.',
                      '[F]Every step I [C]take is true,',
                      '[G]Every road comes [F]back to you.',
                      '',
                      'Bridge:',
                      '[Dm]Voices in the [G]night,',
                      '[C]Pulling me to [Am]fight.',
                      '[Dm]But I won’t [G]lose my place,',
                      '[F]Climbing back to [G]grace.'
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


      // Apply normalization like setLibrary does
      const normalizedLibrary = {
        ...mockLibrary,
        artists: mockLibrary.artists.map((artist: any) => ({
          ...artist,
          albums: artist.albums.map((album: any) => ({
            ...normalizeAlbum(album),
            songs: album.songs.map(normalizeSong)
          }))
        }))
      };

      state.library = normalizedLibrary;
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
    clearError: (state: any) => {
      state.error = null;
    },
    // Local update for mock data
    updateSongLocal: (state, action) => {
      const {
        artistName,
        albumTitle,
        songTitle,
        updatedSongData,
        newArtistName,
        newAlbumTitle,
        newSongTitle,
        metadataChanged
      } = action.payload;

      // Find the original song
      const artist = state.library.artists.find((a: any) => a.name === artistName);
      if (!artist) return;

      const album = artist.albums.find((a: any) => a.title === albumTitle);
      if (!album) return;

      const songIndex = album.songs.findIndex((s: any) => s.title === songTitle);
      if (songIndex === -1) return;

      const currentSong = album.songs[songIndex];

      if (metadataChanged) {
        // Moving song to new location - create in new location and delete from old
        const targetArtist = newArtistName || artistName;
        const targetAlbum = newAlbumTitle || albumTitle;
        const targetTitle = newSongTitle || songTitle;

        // Find or create target artist
        let targetArtistObj = state.library.artists.find((a: any) => a.name === targetArtist);
        if (!targetArtistObj) {
          targetArtistObj = { name: targetArtist, albums: [] };
          state.library.artists.push(targetArtistObj);
        }

        // Find or create target album
        let targetAlbumObj = targetArtistObj.albums.find((a: any) => a.title === targetAlbum);
        if (!targetAlbumObj) {
          targetAlbumObj = normalizeAlbum({ title: targetAlbum, songs: [] });
          targetArtistObj.albums.push(targetAlbumObj);
        }

        // Create new song in target location
        const newSongData = {
          ...currentSong,
          ...updatedSongData,
          title: targetTitle,
          updatedAt: new Date().toISOString()
        };
        targetAlbumObj.songs.push(normalizeSong(newSongData));

        // Remove from original location
        album.songs.splice(songIndex, 1);

        // Clean up empty albums/artists
        if (album.songs.length === 0) {
          const albumIndex = artist.albums.findIndex((a: any) => a.title === albumTitle);
          if (albumIndex !== -1) {
            artist.albums.splice(albumIndex, 1);
          }
        }
        if (artist.albums.length === 0) {
          const artistIndex = state.library.artists.findIndex((a: any) => a.name === artistName);
          if (artistIndex !== -1) {
            state.library.artists.splice(artistIndex, 1);
          }
        }

        // Update selected song if it's the same song
        if (state.selectedSong &&
          state.selectedSong.artist.name === artistName &&
          state.selectedSong.album.title === albumTitle &&
          state.selectedSong.title === songTitle) {
          state.selectedSong = {
            ...normalizeSong(newSongData),
            artist: { name: targetArtist },
            album: { title: targetAlbum }
          };
        }
      } else {
        // Normal update - no metadata change
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
      }
    },
    // Local add for mock data
    addSongLocal: (state, action) => {
      const { artistName, albumTitle, songData } = action.payload;

      // Find or create artist
      let artist = state.library.artists.find((a: any) => a.name === artistName);
      if (!artist) {
        artist = { name: artistName, albums: [] };
        state.library.artists.push(artist);
      }

      // Find or create album
      let album = artist.albums.find((a: any) => a.title === albumTitle);
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Load library from Drive
      .addCase(loadLibraryFromDrive.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadLibraryFromDrive.fulfilled, (state, action) => {
        state.isLoading = false;
        // Normalize the library from Google Drive
        const normalizedLibrary = {
          ...action.payload,
          artists: action.payload.artists.map((artist: any) => ({
            ...artist,
            albums: artist.albums.map((album: any) => ({
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
                        '1234567890 [Cmaj7]0987654321',
                        '[Cm7]1234567890 [C7]0987654321',
                        '[C]12345 [Cmaj7]67890 [Cm7]12345 [C7]67890'
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
      .addCase(updateSong.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSong.fulfilled, (state, action) => {
        state.isLoading = false;
        const {
          library,
          artistName,
          albumTitle,
          songTitle,
          updatedSongData,
          newArtistName,
          newAlbumTitle,
          newSongTitle,
          metadataChanged,
          isLocal
        } = action.payload;

        if (isLocal) {
          // Handle local update
          songsSlice.caseReducers.updateSongLocal(state, {
            payload: {
              artistName,
              albumTitle,
              songTitle,
              updatedSongData,
              newArtistName,
              newAlbumTitle,
              newSongTitle,
              metadataChanged
            }
          });
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map((artist: any) => ({
              ...artist,
              albums: artist.albums.map((album: any) => ({
                ...normalizeAlbum(album),
                songs: album.songs.map(normalizeSong)
              }))
            }))
          };
          state.library = normalizedLibrary;

          // Update selected song - use new metadata if it changed
          const targetArtist = newArtistName || artistName;
          const targetAlbum = newAlbumTitle || albumTitle;
          const targetTitle = newSongTitle || songTitle;
          state.selectedSong = findSongWithArtistAlbum(state.library, targetArtist, targetAlbum, targetTitle);
        }
      })
      .addCase(updateSong.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add song
      .addCase(addSong.pending, (state: any) => {
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
            artists: library.artists.map((artist: any) => ({
              ...artist,
              albums: artist.albums.map((album: any) => ({
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
      .addCase(deleteSong.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, albumTitle, songTitle, isLocal } = action.payload;

        if (isLocal) {
          // Handle local delete
          const artist = state.library.artists.find((a: any) => a.name === artistName);
          if (artist) {
            const album = artist.albums.find((a: any) => a.title === albumTitle);
            if (album) {
              // Remove song locally
              album.songs = album.songs.filter((s: any) => s.title !== songTitle);
            }
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map((artist: any) => ({
              ...artist,
              albums: artist.albums.map((album: any) => ({
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
      .addCase(addArtist.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addArtist.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, isLocal } = action.payload;

        if (isLocal) {
          // Handle local add
          const existingArtist = state.library.artists.find((a: any) => a.name === artistName);
          if (!existingArtist) {
            state.library.artists.push({ name: artistName, albums: [] });
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map((artist: any) => ({
              ...artist,
              albums: artist.albums.map((album: any) => ({
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
      .addCase(addAlbum.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAlbum.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, albumTitle, isLocal } = action.payload;

        if (isLocal) {
          // Handle local add
          let artist = state.library.artists.find((a: any) => a.name === artistName);
          if (!artist) {
            artist = { name: artistName, albums: [] };
            state.library.artists.push(artist);
          }

          const existingAlbum = artist.albums.find((a: any) => a.title === albumTitle);
          if (!existingAlbum) {
            artist.albums.push(normalizeAlbum({ title: albumTitle, songs: [] }));
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map((artist: any) => ({
              ...artist,
              albums: artist.albums.map((album: any) => ({
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
      .addCase(updateArtist.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateArtist.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, oldArtistName, newArtistName, isLocal } = action.payload;

        if (isLocal) {
          // Handle local update - find and rename artist
          const artist = state.library.artists.find((a: any) => a.name === oldArtistName);
          if (artist) {
            artist.name = newArtistName;
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map((artist: any) => ({
              ...artist,
              albums: artist.albums.map((album: any) => ({
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
      .addCase(updateAlbum.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAlbum.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, oldAlbumTitle, newAlbumTitle, isLocal } = action.payload;

        if (isLocal) {
          // Handle local update - find and rename album
          const artist = state.library.artists.find((a: any) => a.name === artistName);
          if (artist) {
            const album = artist.albums.find((a: any) => a.title === oldAlbumTitle);
            if (album) {
              album.title = newAlbumTitle;
            }
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map((artist: any) => ({
              ...artist,
              albums: artist.albums.map((album: any) => ({
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
      .addCase(deleteArtist.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteArtist.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, isLocal } = action.payload;

        if (isLocal) {
          // Handle local delete
          state.library.artists = state.library.artists.filter((a: any) => a.name !== artistName);
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map((artist: any) => ({
              ...artist,
              albums: artist.albums.map((album: any) => ({
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
      .addCase(deleteAlbum.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAlbum.fulfilled, (state, action) => {
        state.isLoading = false;
        const { library, artistName, albumTitle, isLocal } = action.payload;

        if (isLocal) {
          // Handle local delete
          const artist = state.library.artists.find((a: any) => a.name === artistName);
          if (artist) {
            artist.albums = artist.albums.filter((a: any) => a.title !== albumTitle);
          }
        } else {
          // Update with library from Google Drive
          const normalizedLibrary = {
            ...library,
            artists: library.artists.map((artist: any) => ({
              ...artist,
              albums: artist.albums.map((album: any) => ({
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
  }
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
export const selectLibrary = (state: any) => state.songs.library;
export const selectSelectedSong = (state: any) => state.songs.selectedSong;
export const selectIsLoading = (state: any) => state.songs.isLoading;
export const selectError = (state: any) => state.songs.error;
export const selectIsGoogleDriveConnected = (state: any) => state.songs.isGoogleDriveConnected;
export const selectUserInfo = (state: any) => state.songs.userInfo;

// Helper selector to get total songs count
export const selectTotalSongsCount = (state: any) => {
  const library = selectLibrary(state);
  if (!library || !library.artists) return 0;
  return library.artists.reduce((total, artist: any) => {
    return total + artist.albums.reduce((albumTotal, album: any) => {
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
