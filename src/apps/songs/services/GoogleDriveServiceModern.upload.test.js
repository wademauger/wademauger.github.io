import googleDriveServiceModern from './GoogleDriveServiceModern';

describe('GoogleDriveServiceModern upload fallback', () => {
  let svc;
  const originalGapi = global.gapi;

  beforeEach(() => {
    svc = googleDriveServiceModern;
    // stub auth state
    svc.isSignedIn = true;
    svc.accessToken = 'fake-token';

    // Mock gapi client drive.files.update to return a resolved response
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

    // Mock fetch for the upload fallback
    global.fetch = jest.fn().mockResolvedValue({ status: 200, text: async () => JSON.stringify({ id: 'fileid' }) });
  });

  afterEach(() => {
    global.gapi = originalGapi;
    delete global.fetch;
  });

  it('calls upload fallback PATCH after files.update', async () => {
    const fileId = '1abc';
    const lib = { panels: { a: { shapes: {} } } };
    // Use the public wrapper which calls withAutoAuth
    await svc.saveLibraryToFile(fileId, lib);
    // Expect gapi update called
    expect(global.gapi.client.drive.files.update).toHaveBeenCalled();
    // Expect fetch called to upload endpoint
    const expectedUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({ method: 'PATCH' }));
  });
});
