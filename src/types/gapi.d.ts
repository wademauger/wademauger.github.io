// Type declarations for Google API (gapi)
// Note: These are minimal type definitions. For production use, consider @types/gapi

interface GapiClient {
  init(config: {
    apiKey?: string;
    clientId?: string;
    discoveryDocs?: string[];
    scope?: string;
  }): Promise<void>;
  load(api: string, version: string): Promise<void>;
  setToken(token: { access_token: string }): void;
  drive?: {
    files: {
      list(params: Record<string, unknown>): Promise<{ result: { files: unknown[] } }>;
      get(params: Record<string, unknown>): Promise<{ result: unknown }>;
      create(params: Record<string, unknown>): Promise<{ result: unknown }>;
      update(params: Record<string, unknown>): Promise<{ result: unknown }>;
      delete(params: { fileId: string }): Promise<void>;
    };
  };
}

interface GapiAuth2 {
  init(params: Record<string, unknown>): void;
  getAuthInstance(): {
    isSignedIn: {
      get(): boolean;
      listen(callback: (isSignedIn: boolean) => void): void;
    };
    currentUser: {
      get(): {
        getBasicProfile(): {
          getName(): string;
          getEmail(): string;
          getImageUrl(): string;
        };
      };
    };
    signIn(): Promise<void>;
    signOut(): Promise<void>;
  };
}

interface Gapi {
  load(api: string, callback: () => void): void;
  client: GapiClient;
  auth2: GapiAuth2;
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient(config: {
      client_id: string;
      scope: string;
      callback?: (response: { access_token?: string; error?: string }) => void;
    }): {
      callback?: (response: { access_token?: string; error?: string }) => void;
      requestAccessToken(options?: { prompt?: string }): void;
    };
    hasGrantedAnyScope(token: { access_token: string }, scopes: string): boolean;
    hasGrantedAllScopes(token: { access_token: string }, ...scopes: string[]): boolean;
    revoke(accessToken: string, callback: () => void): void;
  };
}

interface Google {
  accounts: GoogleAccounts;
}

declare global {
  interface Window {
    gapi: Gapi;
    google: Google;
  }
  
  const gapi: Gapi;
  const google: Google;
}

export {};
