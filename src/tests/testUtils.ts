// Simple CommonJS shim that re-exports the .tsx test utilities implementation.
// This file exists only to provide a non-TypeScript-parsable entry so Jest
// doesn't choke on TypeScript-specific syntax when resolving imports.
/* eslint-disable @typescript-eslint/no-var-requires */
try {
  module.exports = require('./testUtils.tsx');
} catch (e) {
  // If for some reason the .tsx can't be required in this environment, export
  // a minimal no-op fallback to avoid breaking test runs.
  module.exports = {
    renderWithProviders: (c) => { throw new Error('testUtils shim: renderWithProviders not available'); },
    getDriveMock: () => ({}),
    resetDriveMock: () => {},
    getInnerInputByTestId: async () => { throw new Error('testUtils shim: getInnerInputByTestId not available'); },
    findInputByLabel: async () => { throw new Error('testUtils shim: findInputByLabel not available'); },
    findModalSubmitButton: async () => { throw new Error('testUtils shim: findModalSubmitButton not available'); },
    setTestLogLevel: () => {}
  };
}
