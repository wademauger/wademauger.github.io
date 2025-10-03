// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Provide a test-time shim for Vite's import.meta.env used throughout the codebase.
// The custom Jest transformer replaces `import.meta.env.` with `globalThis.__IMPORT_META_ENV__.`
// Ensure the object exists and contains sensible defaults for tests.
// @ts-ignore
globalThis.__IMPORT_META_ENV__ = globalThis.__IMPORT_META_ENV__ || {};
globalThis.__IMPORT_META_ENV__.VITE_GOOGLE_CLIENT_ID = globalThis.__IMPORT_META_ENV__.VITE_GOOGLE_CLIENT_ID || 'test-client-id';
globalThis.__IMPORT_META_ENV__.VITE_SPOTIFY_API_ENDPOINT = globalThis.__IMPORT_META_ENV__.VITE_SPOTIFY_API_ENDPOINT || 'https://example.com/spotify';
