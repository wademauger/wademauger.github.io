import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
const KnittingApp = React.lazy(() => import('./apps/knitting/KnittingApp'));
const KnittingDesignApp = React.lazy(() => import('./apps/knitting-design/KnittingDesignApp'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  
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
            <Route path="/crafts/songs" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <SongTabsApp />
                </Layout>
              </Suspense>
            } />
            
            {/* Knitting Pattern App Routes */}
            <Route path="/crafts/knitting" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <KnittingApp />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/knitting/pattern/:patternId" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <KnittingApp />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/knitting/editor" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <KnittingApp view="editor" />
                </Layout>
              </Suspense>
            } />
            
            {/* Knitting Design Studio Routes */}
            <Route path="/crafts/knitting-design" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <KnittingDesignApp />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/knitting-design/designer" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <KnittingDesignApp view="designer" />
                </Layout>
              </Suspense>
            } />
            <Route path="/crafts/knitting-design/interactive" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <KnittingDesignApp view="interactive" />
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
}

export default App;
