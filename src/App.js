import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RecipesApp from './apps/recipes/RecipesApp';
import SongTabsApp from './apps/songs/SongTabsAppModern';
import KnittingApp from './apps/knitting/KnittingApp';
import KnittingDesignApp from './apps/knitting-design/KnittingDesignApp.debug';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              
              {/* Recipe App Routes */}
              <Route path="/recipes" element={<RecipesApp />} />
              <Route path="/recipes/:recipeId" element={<RecipesApp />} />
              <Route path="/recipes/reader-view/:recipeId" element={<RecipesApp view="reader" />} />
              
              {/* Music Tabs App Routes */}
              <Route path="/tabs" element={<SongTabsApp />} />
              <Route path="/songs" element={<SongTabsApp />} />
              
              {/* Knitting Pattern App Routes */}
              <Route path="/knitting" element={<KnittingApp />} />
              <Route path="/knitting/pattern/:patternId" element={<KnittingApp />} />
              <Route path="/knitting/editor" element={<KnittingApp view="editor" />} />
              
              {/* Knitting Design Studio Routes */}
              <Route path="/knitting-design" element={<KnittingDesignApp />} />
              <Route path="/knitting-design/designer" element={<KnittingDesignApp view="designer" />} />
              <Route path="/knitting-design/interactive" element={<KnittingDesignApp view="interactive" />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
