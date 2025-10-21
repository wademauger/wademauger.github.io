/**
 * Global type declarations for Google APIs
 */

/// <reference path="../../types/gapi.d.ts" />

// Re-export the gapi types for this module
declare const gapi: typeof globalThis.gapi;
declare const google: typeof globalThis.google;

declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
  }
}

export {};
