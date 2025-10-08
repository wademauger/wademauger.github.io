declare const mock: {
  isSignedIn: boolean;
  accessToken: string | null;
  SESSION_KEYS?: Record<string, string>;
  getSettings: jest.Mock<any, any>;
  restoreSession: jest.Mock<Promise<any>, any>;
  findFile: jest.Mock<Promise<any>, any>;
  createNewLibrary: jest.Mock<Promise<any>, any>;
  loadLibraryById: jest.Mock<Promise<any>, any>;
  saveLibraryToFile: jest.Mock<Promise<any>, any>;
  saveLibrary: jest.Mock<Promise<any>, any>;
  loadLibrary: jest.Mock<Promise<any>, any>;
  resetMockState: () => void;
};

export default mock;

export const isSignedIn: () => boolean;
export const accessToken: () => string | null;
export const getSettings: (...args: any[]) => any;
export const restoreSession: (...args: any[]) => Promise<any>;
export const findFile: (...args: any[]) => Promise<any>;
export const createNewLibrary: (...args: any[]) => Promise<any>;
export const loadLibraryById: (...args: any[]) => Promise<any>;
export const saveLibraryToFile: (...args: any[]) => Promise<any>;
export const saveLibrary: (...args: any[]) => Promise<any>;
export const loadLibrary: (...args: any[]) => Promise<any>;
