import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store/store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RecipesApp from './apps/recipes/RecipesApp';
import SongTabsApp from './apps/songs/SongTabsApp';
import KnittingApp from './apps/knitting/KnittingApp';
import NotFound from './pages/NotFound';
import './styles/App.css';

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
              <Route path="/tabs/artist/:artistName" element={<SongTabsApp />} />
              <Route path="/tabs/artist/:artistName/album/:albumName" element={<SongTabsApp />} />
              <Route path="/tabs/artist/:artistName/album/:albumName/song/:songName" element={<SongTabsApp />} />
              
              {/* Knitting Pattern App Routes */}
              <Route path="/knitting" element={<KnittingApp />} />
              <Route path="/knitting/pattern/:patternId" element={<KnittingApp />} />
              <Route path="/knitting/editor" element={<KnittingApp view="editor" />} />
              
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
