// Lightweight mockDriveClient for tests — simulates minimal Drive service API used by thunks/components
const mockLibraryJson = {
  panels: {
    panel1: { id: 'panel1', name: 'Front Panel', shapes: { main: { height: 10, baseA: 8, baseB: 8, successors: [] } } }
  },
  colorworkPatterns: [ { id: 'color1', name: 'Checkerboard', pattern: [] } ],
  garmentPlans: []
};

const mockDriveClient = {
  loadLibrary: jest.fn(async () => mockLibraryJson),
  loadLibraryById: jest.fn(async (id: string) => mockLibraryJson),
  saveLibrary: jest.fn(async (lib: any) => lib),
  saveLibraryToFile: jest.fn(async (id: string, lib: any) => lib),
  findFile: jest.fn(async (filename: string, folder: string) => null),
  createOrUpdateLibraryFile: jest.fn(async (opts: any) => ({ fileId: 'fileid' }))
};

export { mockDriveClient, mockLibraryJson };
