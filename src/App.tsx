import { Suspense, lazy, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store';
import { loadFullLibrary } from './store/librarySlice';
import Layout from '@/components/Layout';
import MinimalLayout from '@/components/MinimalLayout';
import RoutePreloader from '@/components/RoutePreloader';
import ProfessionalLanding from '@/components/ProfessionalLanding';

// Lazy load apps for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const RecipesApp = lazy(() => import('./apps/recipes/RecipesApp'));
const SongTabsApp = lazy(() => import('./apps/songs/SongTabsAppModern'));
const KnittingDesignerApp = lazy(() => import('./apps/knitting-designer/KnittingDesignerApp'));
const ColorworkDesignerApp = lazy(() => import('./apps/colorwork-designer/ColorworkDesignerApp'));
const UnifiedDesignerApp = lazy(() => import('./apps/unified-designer/UnifiedDesignerApp'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AppInner() {
  const dispatch = useDispatch();

  // Loading component for suspense fallback
  const LoadingSpinner = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px',
      fontSize: '16px',
      color: '#556873'
    }}>
      Loading...
    </div>
  );

  // Auto-load library on startup if settings are configured
  useEffect(() => {
    const loadLibraryOnStartup = async () => {
      try {
        console.log('🔧 App startup: Attempting to load library data...');
        await dispatch(loadFullLibrary() as any);
        console.log('✅ Library data loaded on startup');
      } catch (error) {
        console.log('ℹ️ No library data loaded on startup (this is normal if not configured):', error);
      }
    };

    // Small delay to ensure services are initialized
    setTimeout(loadLibraryOnStartup, 1000);
  }, [dispatch]);

  return (
    <Router>
      <RoutePreloader />
      <Routes>
        <Route path="/" element={
          <Suspense fallback={<LoadingSpinner />}>
            <MinimalLayout>
              <ProfessionalLanding />
            </MinimalLayout>
          </Suspense>
        } />
        <Route path="/projects" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <HomePage />
            </Layout>
          </Suspense>
        } />
        <Route path="/crafts" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <HomePage />
            </Layout>
          </Suspense>
        } />
        <Route path="/crafts/recipes/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <RecipesApp />
            </Layout>
          </Suspense>
        } />
        <Route path="/crafts/tabs/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <SongTabsApp />
            </Layout>
          </Suspense>
        } />
        <Route path="/crafts/knitting-pattern-designer/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <ColorworkDesignerApp />
            </Layout>
          </Suspense>
        } />
        <Route path="/crafts/colorwork-designer/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <ColorworkDesignerApp />
            </Layout>
          </Suspense>
        } />
        <Route path="/crafts/unified-designer/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <UnifiedDesignerApp />
            </Layout>
          </Suspense>
        } />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/recipes/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <RecipesApp />
            </Layout>
          </Suspense>
        } />
        <Route path="/songs/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <SongTabsApp />
            </Layout>
          </Suspense>
        } />
        <Route path="/knitting/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <ColorworkDesignerApp />
            </Layout>
          </Suspense>
        } />
        <Route path="/colorwork/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <ColorworkDesignerApp />
            </Layout>
          </Suspense>
        } />
        <Route path="/unified-designer/*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <UnifiedDesignerApp />
            </Layout>
          </Suspense>
        } />
        
        <Route path="*" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <NotFound />
            </Layout>
          </Suspense>
        } />
      </Routes>
      
      {/* Global modals now handled by individual apps using /components/modals/ */}
    </Router>
  );
}

// Create a single QueryClient for the app
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 } } });

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'development-fallback';
  
  // Debug: Log client ID at startup to verify .env is loaded
  console.log('🔧 App startup: GOOGLE_CLIENT_ID =', GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.slice(0,6)}...${GOOGLE_CLIENT_ID.slice(-4)}` : 'null/undefined');
  
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AppInner />
        </QueryClientProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}export default App;