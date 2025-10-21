import googleDriveServiceModern from './GoogleDriveServiceModern';

describe('GoogleDriveServiceModern concurrency / race integration style', () => {
  let originalGapi: any;

  beforeEach(() => {
    originalGapi = (global as any).gapi;

    // stub auth state
    googleDriveServiceModern.isSignedIn = true;
    googleDriveServiceModern.accessToken = 'fake-token';

    // In-memory remote representation of the Drive file content
    let remoteLib = { panels: { existing: { meta: 'orig' } }, lastUpdated: new Date().toISOString() };

    // Mock gapi client drive methods. get returns the current remoteLib; update writes into remoteLib
    (global as any).gapi = {
      client: {
        drive: {
          files: {
            get: jest.fn().mockImplementation(async () => {
              return { body: JSON.stringify(remoteLib) };
            }),
            update: jest.fn().mockImplementation(async ({ fileId, media }) => {
              try { remoteLib = JSON.parse(media.body); } catch { /* ignore parse errors */ }
              return { status: 200, result: { id: fileId } };
            }),
            create: jest.fn(),
            list: jest.fn()
          }
        },
        setToken: jest.fn()
      }
    };

    // Mock fetch to behave like the HTTP upload fallback endpoint and update remoteLib when called
    global.fetch = jest.fn().mockImplementation(async (url, opts) => {
      if (url.includes('/upload/drive/v3/files/')) {
        try { remoteLib = JSON.parse(opts.body); } catch { /* ignore parse errors */ }
        return { ok: true, status: 200, text: async () => JSON.stringify({ id: 'fileid' }) };
      }
      return { ok: true, status: 200, text: async () => '{}' };
    });
  });

  afterEach(() => {
    (global as any).gapi = originalGapi;
    delete (global as any).fetch;
    // reset flag to default true
    googleDriveServiceModern.setUseUploadFallback(true);
  });

  it('serializes two updates so that second sees first and final remote has both panels', async () => {
    const fileId = 'fid-concurrency';

    // Client 1: load existing library, add panel 'A', and save
    const lib1 = await googleDriveServiceModern.loadLibraryById(fileId);
    lib1.panels = lib1.panels || {};
    lib1.panels['A'] = { createdBy: 'client1' };
    await googleDriveServiceModern.saveLibraryToFile(fileId, lib1);

    // Client 2: load after client1 saved, add panel 'B', and save
    const lib2 = await googleDriveServiceModern.loadLibraryById(fileId);
    lib2.panels = lib2.panels || {};
    lib2.panels['B'] = { createdBy: 'client2' };
    await googleDriveServiceModern.saveLibraryToFile(fileId, lib2);

    // Final verification: the mocked get returns the latest remoteLib (as JSON string)
    const finalResp = await (global as any).gapi.client.drive.files.get({ fileId, alt: 'media' });
    const finalBody = JSON.parse(finalResp.body);

    expect(finalBody.panels).toHaveProperty('existing');
    expect(finalBody.panels).toHaveProperty('A');
    expect(finalBody.panels).toHaveProperty('B');

    // The upload fallback should have been invoked at least once (default is enabled)
    expect(global.fetch).toHaveBeenCalled();
  });
});
