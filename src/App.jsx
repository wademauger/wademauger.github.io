import { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store';
import Layout from '@/components/Layout';
import MinimalLayout from '@/components/MinimalLayout';
import RoutePreloader from '@/components/RoutePreloader';
import ProfessionalLanding from '@/components/ProfessionalLanding';
import LibraryModal from '@/components/LibraryModal';

// Lazy load apps for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const RecipesApp = lazy(() => import('./apps/recipes/RecipesApp'));
const SongTabsApp = lazy(() => import('./apps/songs/SongTabsAppModern.jsx'));
const KnittingDesignerApp = lazy(() => import('./apps/knitting-designer/KnittingDesignerApp'));
const ColorworkDesignerApp = lazy(() => import('./apps/colorwork-designer/ColorworkDesignerApp'));
const UnifiedDesignerApp = lazy(() => import('./apps/unified-designer/UnifiedDesignerApp'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'development-fallback';
  
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
  
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Router>
          <RoutePreloader />
          <Routes>
            {/* Landing page with minimal layout for fastest loading */}
            <Route path="/" element={
              <MinimalLayout>
                <ProfessionalLanding />
              </MinimalLayout>
            } />
            
            {/* All other routes use the full layout with lazy loading */}
            <Route path="/crafts" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <HomePage />
                </Layout>
              </Suspense>
            } />
            
            {/* App Routes under /crafts */}

            
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
                  <KnittingDesignerApp />
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
                  <KnittingDesignerApp />
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
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <NotFound />
                </Layout>
              </Suspense>
            } />
          </Routes>
          
          {/* Global Modals - controlled by Redux */}
          <LibraryModal />
        </Router>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;