import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store';
import MinimalLayout from './components/MinimalLayout';
import ProfessionalLanding from './components/ProfessionalLanding';
import RoutePreloader from './components/RoutePreloader';
import './App.css';

// Lazy load heavy components to split bundles
const Layout = React.lazy(() => import('./components/Layout'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const RecipesApp = React.lazy(() => import('./apps/recipes/RecipesApp'));
const SongTabsApp = React.lazy(() => import('./apps/songs/SongTabsAppModern'));
const KnittingDesignerApp = React.lazy(() => import('./apps/knitting-designer/KnittingDesignerApp'));
const ColorworkDesignerApp = React.lazy(() => import('./apps/colorwork-designer/ColorworkDesignerApp'));
const UnifiedDesignerApp = React.lazy(() => import('./apps/unified-designer/UnifiedDesignerApp'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  
  // Loading component for suspense fallback
  const LoadingSpinner: React.FC = () => (
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
            
            {/* Recipe App Routes */}
            <Route path="/crafts/recipes" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <RecipesApp />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/recipes/:recipeId" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <RecipesApp />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/recipes/reader-view/:recipeId" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <RecipesApp view="reader" />
                </Layout>
              </Suspense>
            } />
            
            {/* Music Tabs App Routes */}
            <Route path="/crafts/tabs" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <SongTabsApp />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/tabs/artist/:artistName" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <SongTabsApp />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/tabs/artist/:artistName/album/:albumTitle" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <SongTabsApp />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/tabs/artist/:artistName/album/:albumTitle/song/:songTitle" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <SongTabsApp />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/songs" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <SongTabsApp />
                </Layout>
              </Suspense>
            } />
            
            {/* Colorwork Designer App Routes */}
            <Route path="/crafts/colorwork-designer" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <KnittingDesignerApp />
                </Layout>
              </Suspense>
            } />
            
            {/* Knitting Pattern Designer App Routes */}
            <Route path="/crafts/knitting-pattern-designer" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <ColorworkDesignerApp />
                </Layout>
              </Suspense>
            } />
            
            {/* Unified Designer App Routes */}
            <Route path="/crafts/unified-designer" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <UnifiedDesignerApp />
                </Layout>
              </Suspense>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <NotFound />
                </Layout>
              </Suspense>
            } />
          </Routes>
        </Router>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default App;