import googleDriveServiceModern from './GoogleDriveServiceModern';

describe('GoogleDriveServiceModern upload fallback feature flag', () => {
  const originalGapi = global.gapi;

  beforeEach(() => {
    // stub auth state
    googleDriveServiceModern.isSignedIn = true;
    googleDriveServiceModern.accessToken = 'fake-token';

    // Mock gapi client drive.files.update and get
    global.gapi = {
      client: {
        drive: {
          files: {
            update: jest.fn().mockResolvedValue({ status: 200, result: {} }),
            get: jest.fn().mockResolvedValue({ body: JSON.stringify({ panels: { a: {} }, lastUpdated: 'x' }) })
          }
        },
        setToken: jest.fn()
      }
    };

    global.fetch = jest.fn().mockResolvedValue({ status: 200, text: async () => JSON.stringify({ id: 'fileid' }) });
  });

  afterEach(() => {
    global.gapi = originalGapi;
    delete global.fetch;
    // reset flag to default true
    googleDriveServiceModern.setUseUploadFallback(true);
  });

  it('does not call fetch when flag disabled', async () => {
    googleDriveServiceModern.setUseUploadFallback(false);
    await googleDriveServiceModern.saveLibraryToFile('fid', { panels: { a: {} } });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls fetch when flag enabled', async () => {
    googleDriveServiceModern.setUseUploadFallback(true);
    await googleDriveServiceModern.saveLibraryToFile('fid', { panels: { a: {} } });
    expect(global.fetch).toHaveBeenCalled();
  });
});
