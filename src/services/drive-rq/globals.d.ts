/**
 * Global type declarations for Google APIs
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare const gapi: any;
declare const google: any;

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export {};
