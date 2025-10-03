import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import GoogleDriveServiceModern from '../apps/songs/services/GoogleDriveServiceModern';

// Local storage key for persisted library file reference
const LIBRARY_FILE_KEY = 'app:libraryFileReference';

export interface LibraryFileRef {
  id: string;
  name?: string;
}

export interface LibraryState {
  selectedFile: LibraryFileRef | null;
  isLoading: boolean;
  lastError: string | null;
  entries: any[]; // entries loaded from library (apps will filter by type)
  fullLibrary: any | null; // raw library JSON blob
}

const initialState: LibraryState = {
  selectedFile: null,
  isLoading: false,
  lastError: null,
  entries: []
  , fullLibrary: null
};

// Thunks
export const initLibraryFromStorage = createAsyncThunk('library/initFromStorage', async (_, thunkAPI) => {
  try {
    const raw = localStorage.getItem(LIBRARY_FILE_KEY);
    if (!raw) return null;
    const parsed: LibraryFileRef = JSON.parse(raw);
    return parsed;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue('Failed to read library file reference');
  }
});

export const setLibraryFileAndPersist = createAsyncThunk('library/setLibraryFileAndPersist', async (fileRef: LibraryFileRef, thunkAPI) => {
  try {
    localStorage.setItem(LIBRARY_FILE_KEY, JSON.stringify(fileRef));
    return fileRef;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue('Failed to persist library file reference');
  }
});

// Load the library contents using GoogleDriveServiceModern.loadLibrary()
export const loadLibrary = createAsyncThunk('library/loadLibrary', async (_, thunkAPI) => {
  try {
    // Delegate to the service which handles creating the file if missing
    const lib = await GoogleDriveServiceModern.loadLibrary();
    // Normalize entries: expect an object with collections (songs, recipes, panels)
    // Flatten into an entries array where each entry has { id, type, title, ... }
    const entries: any[] = [];
    if (lib) {
      // Backwards-compatible: if library contains songs/recipes/panels namespaces, flatten them
      if (lib.songs) {
        Object.keys(lib.songs).forEach((k) => entries.push({ id: k, type: 'song', ...lib.songs[k] }));
      }
      if (lib.recipes) {
        Object.keys(lib.recipes).forEach((k) => entries.push({ id: k, type: 'recipe', ...lib.recipes[k] }));
      }
      if (lib.panels) {
        Object.keys(lib.panels).forEach((k) => entries.push({ id: k, type: 'panel', ...lib.panels[k] }));
      }

      // New unified format: if the library file contains an `artists` array (songs app format), expose it
      if (lib.artists && Array.isArray(lib.artists)) {
        // Push a single entry that contains the artists array so apps can detect and consume it
        entries.push({ id: 'artists', type: 'artists', artists: lib.artists });
      }
    }
    return entries;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to load library');
  }
});

// Return the full library object as produced by the Drive service
export const loadFullLibrary = createAsyncThunk('library/loadFullLibrary', async (_, thunkAPI) => {
  try {
    const lib = await GoogleDriveServiceModern.loadLibrary();
    return lib;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to load library');
  }
});

// Load a specific library file by id (returns full library object)
export const loadFullLibraryById = createAsyncThunk('library/loadFullLibraryById', async (fileId: string, thunkAPI) => {
  try {
    const lib = await GoogleDriveServiceModern.loadLibraryById(fileId);
    return lib;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to load library by id');
  }
});

// Probe Drive for a file by filename and folder (returns probe result or null)
export const findLibraryFile = createAsyncThunk('library/findLibraryFile', async ({ filename, folder }: { filename: string; folder: string }, thunkAPI) => {
  try {
    if (GoogleDriveServiceModern.findFile) {
      const probe = await GoogleDriveServiceModern.findFile(filename, folder);
      return probe;
    }
    return null;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to probe for library file');
  }
});

// Ask the underlying service to create or update a library file (useful for namespace inserts)
export const createOrUpdateLibraryFile = createAsyncThunk('library/createOrUpdateLibraryFile', async (opts: any, thunkAPI) => {
  try {
    if (GoogleDriveServiceModern.createOrUpdateLibraryFile) {
      const res = await GoogleDriveServiceModern.createOrUpdateLibraryFile(opts);
      return res;
    }
    return null;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to create or update library file');
  }
});

// Save a full library object to Drive (or default location). Returns the saved library.
export const saveFullLibrary = createAsyncThunk('library/saveFullLibrary', async (libraryData: any, thunkAPI) => {
  try {
    const state: any = thunkAPI.getState();
    const fileRef: LibraryFileRef | null = state.library?.selectedFile || null;
    if (fileRef && fileRef.id) {
      await GoogleDriveServiceModern.saveLibraryToFile(fileRef.id, libraryData);
    } else {
      await GoogleDriveServiceModern.saveLibrary(libraryData);
    }
    return libraryData;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to save library');
  }
});

// Save a full library object to a specific file id
export const saveFullLibraryToFile = createAsyncThunk('library/saveFullLibraryToFile', async ({ fileId, libraryData }: { fileId: string; libraryData: any }, thunkAPI) => {
  try {
    await GoogleDriveServiceModern.saveLibraryToFile(fileId, libraryData);
    return libraryData;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to save library to file');
  }
});

// Save a single entry (by type). This will load the current library and call saveLibraryToFile(fileId, libraryData)
export const saveEntry = createAsyncThunk('library/saveEntry', async ({ entry, type }: { entry: any; type: string }, thunkAPI) => {
  try {
    // Caller should ensure the selectedFile is set; attempt to read from state
    const state: any = thunkAPI.getState();
    const fileRef: LibraryFileRef | null = state.library?.selectedFile || null;
    if (!fileRef) {
      // If no fileRef is selected, let the service create or use its default create flow
      // GoogleDriveServiceModern.saveLibrary will operate on the default library file (creating if needed)
      // Build a minimal library object and call saveLibrary
      const payload: any = { lastUpdated: new Date().toISOString() };
      payload[type === 'song' ? 'songs' : type === 'recipe' ? 'recipes' : 'panels'] = { [entry.id || entry.permalink || Date.now()]: entry };
      await GoogleDriveServiceModern.saveLibrary(payload);
      return entry;
    }

    // Load current library, patch the entry into correct namespace, then save to file
    const currentLib = await GoogleDriveServiceModern.loadLibrary();
    const ns = type === 'song' ? 'songs' : type === 'recipe' ? 'recipes' : 'panels';
    currentLib[ns] = currentLib[ns] || {};
    currentLib[ns][entry.id || entry.permalink || Date.now()] = entry;
    await GoogleDriveServiceModern.saveLibraryToFile(fileRef.id, currentLib);
    return entry;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to save entry');
  }
});

// Open (fetch) a specific entry by id and type
export const openEntry = createAsyncThunk('library/openEntry', async ({ id, type }: { id: string; type: string }, thunkAPI) => {
  try {
    const lib = await GoogleDriveServiceModern.loadLibrary();
    const ns = type === 'song' ? 'songs' : type === 'recipe' ? 'recipes' : 'panels';
    if (!lib || !lib[ns]) return null;
    return lib[ns][id] || null;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message || 'Failed to open entry');
  }
});

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    // Set the full library JSON blob and update entries accordingly.
    // This is useful when an out-of-band loader (like React Query) fetches
    // the full library and we want to reflect it in the Redux `library` slice
    // so UI that reads `state.library.entries` (for example HomePage badges)
    // will update without re-fetching from Drive.
    setFullLibrary(state, action: PayloadAction<any>) {
      const lib = action.payload;
      state.fullLibrary = lib;
      const entries: any[] = [];
      if (lib) {
        if (lib.songs) {
          Object.keys(lib.songs).forEach((k) => entries.push({ id: k, type: 'song', ...lib.songs[k] }));
        }
        if (lib.recipes) {
          Object.keys(lib.recipes).forEach((k) => entries.push({ id: k, type: 'recipe', ...lib.recipes[k] }));
        }
        if (lib.panels) {
          Object.keys(lib.panels).forEach((k) => entries.push({ id: k, type: 'panel', ...lib.panels[k] }));
        }
        if (lib.artists && Array.isArray(lib.artists)) {
          entries.push({ id: 'artists', type: 'artists', artists: lib.artists });
        }
      }
      state.entries = entries;
    },
    clearLibraryError(state) {
      state.lastError = null;
    },
    clearEntries(state) {
      state.entries = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(initLibraryFromStorage.fulfilled, (state, action: PayloadAction<LibraryFileRef | null>) => {
      state.selectedFile = action.payload;
    });

    builder.addCase(setLibraryFileAndPersist.fulfilled, (state, action: PayloadAction<LibraryFileRef>) => {
      state.selectedFile = action.payload;
    });

    builder.addCase(loadLibrary.pending, (state) => {
      state.isLoading = true;
      state.lastError = null;
    });
    builder.addCase(loadLibrary.fulfilled, (state, action: PayloadAction<any[]>) => {
      state.isLoading = false;
      state.entries = action.payload;
    });
    
    // When a full library is loaded via loadFullLibrary, store the full JSON blob
    builder.addCase(loadFullLibrary.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.fullLibrary = action.payload;

      // Maintain entries as well to keep backward compatibility
      const lib = action.payload;
      const entries: any[] = [];
      if (lib) {
        if (lib.songs) {
          Object.keys(lib.songs).forEach((k) => entries.push({ id: k, type: 'song', ...lib.songs[k] }));
        }
        if (lib.recipes) {
          Object.keys(lib.recipes).forEach((k) => entries.push({ id: k, type: 'recipe', ...lib.recipes[k] }));
        }
        if (lib.panels) {
          Object.keys(lib.panels).forEach((k) => entries.push({ id: k, type: 'panel', ...lib.panels[k] }));
        }
        if (lib.artists && Array.isArray(lib.artists)) {
          entries.push({ id: 'artists', type: 'artists', artists: lib.artists });
        }
      }
      state.entries = entries;
    });
    builder.addCase(loadLibrary.rejected, (state, action) => {
      state.isLoading = false;
      state.lastError = action.payload as string || 'Load failed';
    });

    builder.addCase(saveEntry.pending, (state) => {
      state.isLoading = true;
      state.lastError = null;
    });
    builder.addCase(saveEntry.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      // optimistic: push into entries (caller may re-run loadLibrary to get canonical list)
      state.entries.push(action.payload);
    });
    builder.addCase(saveEntry.rejected, (state, action) => {
      state.isLoading = false;
      state.lastError = action.payload as string || 'Save failed';
    });

    builder.addCase(openEntry.pending, (state) => {
      state.isLoading = true;
      state.lastError = null;
    });
    builder.addCase(openEntry.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      // Do not mutate entries on open; consumer will receive payload
    });
    builder.addCase(openEntry.rejected, (state, action) => {
      state.isLoading = false;
      state.lastError = action.payload as string || 'Open failed';
    });

    builder.addCase(saveFullLibrary.pending, (state) => {
      state.isLoading = true;
      state.lastError = null;
    });
    builder.addCase(saveFullLibrary.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      // Update entries for convenience: re-run loadFullLibrary to get canonical entries if needed
      // For now, keep entries unchanged; callers may dispatch loadLibrary/loadFullLibrary after save
      // Also update the fullLibrary in state so consumers get the newest JSON
      state.fullLibrary = action.payload;
    });
    builder.addCase(saveFullLibrary.rejected, (state, action) => {
      state.isLoading = false;
      state.lastError = action.payload as string || 'Save failed';
    });
  }
});

export const { clearLibraryError, clearEntries } = librarySlice.actions;
export default librarySlice.reducer;
