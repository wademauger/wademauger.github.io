// Manual Jest mock for GoogleDriveServiceModern
// Tests can import the real module path and Jest will use this mock when jest.mock() is called
const mock = {
  isSignedIn: false,
  accessToken: null as string | null,
  getSettings: jest.fn(() => ({})),
  restoreSession: jest.fn(async () => {
    // default restore does nothing
    return undefined;
  }),
  findFile: jest.fn(async (query: any) => ({ found: false })),
  createNewLibrary: jest.fn(async (name: string) => ({ fileId: `mock-${name || 'new'}` })),
  loadLibraryById: jest.fn(async (fileId: string) => ({ panels: {} })),
  saveLibraryToFile: jest.fn(async (fileId: string, lib: any) => undefined),
  // Backwards-compatible method names used by some older tests
  saveLibrary: jest.fn(async (lib: any) => undefined),
  loadLibrary: jest.fn(async (ref: any) => undefined),
  // Convenience helpers used in some tests
  resetMockState: () => {
    mock.isSignedIn = false;
    mock.accessToken = null;
    mock.getSettings.mockClear();
    mock.restoreSession.mockClear();
    mock.findFile.mockClear();
    mock.createNewLibrary.mockClear();
    mock.loadLibraryById.mockClear();
    mock.saveLibraryToFile.mockClear();
    mock.saveLibrary.mockClear();
    mock.loadLibrary.mockClear();
  }
};

export default mock;

// Also export named functions to match the real module shape when imported with named imports
export const isSignedIn = () => mock.isSignedIn;
export const accessToken = () => mock.accessToken;
export const getSettings = mock.getSettings;
export const restoreSession = mock.restoreSession;
export const findFile = mock.findFile;
export const createNewLibrary = mock.createNewLibrary;
export const loadLibraryById = mock.loadLibraryById;
export const saveLibraryToFile = mock.saveLibraryToFile;
export const saveLibrary = mock.saveLibrary;
export const loadLibrary = mock.loadLibrary;
