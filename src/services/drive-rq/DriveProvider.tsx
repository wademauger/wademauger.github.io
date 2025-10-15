/**
 * Drive Provider Context
 * 
 * Provides the Google Drive adapter instance to the app
 * Use React Query hooks with this adapter for data fetching
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createGoogleDriveAdapter } from './GoogleDriveAdapter';
import type { IDriveAdapter } from './types';

interface DriveContextValue {
  adapter: IDriveAdapter | null;
  isInitialized: boolean;
}

const DriveContext = createContext<DriveContextValue>({
  adapter: null,
  isInitialized: false
});

interface DriveProviderProps {
  children: ReactNode;
  clientId: string;
  apiKey?: string;
  appId?: string;
}

export function DriveProvider({ children, clientId, apiKey, appId }: DriveProviderProps) {
  const [adapter, setAdapter] = useState<IDriveAdapter | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initAdapter = async () => {
      try {
        console.log('🔧 Initializing Google Drive adapter...');
        const driveAdapter = createGoogleDriveAdapter();
        
        await driveAdapter.initialize({
          clientId,
          apiKey,
          appId,
          scopes: [
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive'
          ],
          defaultLibraryFilename: 'library.json'
        });
        
        setAdapter(driveAdapter);
        setIsInitialized(true);
        console.log('✅ Google Drive adapter initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Google Drive adapter:', error);
        // Set to null adapter on error - components can handle gracefully
        setAdapter(null);
        setIsInitialized(true);
      }
    };
    
    initAdapter();
  }, [clientId, apiKey, appId]);
  
  return (
    <DriveContext.Provider value={{ adapter, isInitialized }}>
      {children}
    </DriveContext.Provider>
  );
}

/**
 * Hook to access the Drive adapter
 * 
 * @throws Error if used outside DriveProvider
 */
export function useDriveAdapter(): IDriveAdapter {
  const { adapter, isInitialized } = useContext(DriveContext);
  
  if (!isInitialized) {
    throw new Error('Drive adapter not initialized yet');
  }
  
  if (!adapter) {
    throw new Error('Drive adapter failed to initialize');
  }
  
  return adapter;
}

/**
 * Hook to check if adapter is ready (doesn't throw)
 */
export function useDriveAdapterStatus() {
  const context = useContext(DriveContext);
  return {
    adapter: context.adapter,
    isInitialized: context.isInitialized,
    isReady: context.isInitialized && context.adapter !== null
  };
}
