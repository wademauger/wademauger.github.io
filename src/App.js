import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProfessionalLanding from './components/ProfessionalLanding';
import RecipesApp from './apps/recipes/RecipesApp';
import SongTabsApp from './apps/songs/SongTabsAppModern';
import KnittingApp from './apps/knitting/KnittingApp';
import KnittingDesignApp from './apps/knitting-design/KnittingDesignApp';
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
              <Route path="/" element={<ProfessionalLanding />} />
              <Route path="/crafts" element={<HomePage />} />
              
              {/* Recipe App Routes */}
              <Route path="/crafts/recipes" element={<RecipesApp />} />
              <Route path="/crafts/recipes/:recipeId" element={<RecipesApp />} />
              <Route path="/crafts/recipes/reader-view/:recipeId" element={<RecipesApp view="reader" />} />
              
              {/* Music Tabs App Routes */}
              <Route path="/crafts/tabs" element={<SongTabsApp />} />
              <Route path="/crafts/songs" element={<SongTabsApp />} />
              
              {/* Knitting Pattern App Routes */}
              <Route path="/crafts/knitting" element={<KnittingApp />} />
              <Route path="/crafts/knitting/pattern/:patternId" element={<KnittingApp />} />
              <Route path="/crafts/knitting/editor" element={<KnittingApp view="editor" />} />
              
              {/* Knitting Design Studio Routes */}
              <Route path="/crafts/knitting-design" element={<KnittingDesignApp />} />
              <Route path="/crafts/knitting-design/designer" element={<KnittingDesignApp view="designer" />} />
              <Route path="/crafts/knitting-design/interactive" element={<KnittingDesignApp view="interactive" />} />
              
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
