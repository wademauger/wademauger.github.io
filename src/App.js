import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RecipesApp from './apps/recipes/RecipesApp';
import SongTabsApp from './apps/songs/SongTabsApp';
import KnittingApp from './apps/knitting/KnittingApp';
import NotFound from './pages/NotFound';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Recipe App Routes */}
          <Route path="/recipes" element={<RecipesApp />} />
          <Route path="/recipes/:recipeId" element={<RecipesApp />} />
          <Route path="/recipes/reader-view/:recipeId" element={<RecipesApp view="reader" />} />
          
          {/* Song Tabs App Routes */}
          <Route path="/songs" element={<SongTabsApp />} />
          <Route path="/songs/artist/:artistId" element={<SongTabsApp />} />
          <Route path="/songs/album/:albumId" element={<SongTabsApp />} />
          <Route path="/songs/song/:songId" element={<SongTabsApp />} />
          
          {/* Knitting Pattern App Routes */}
          <Route path="/knitting" element={<KnittingApp />} />
          <Route path="/knitting/pattern/:patternId" element={<KnittingApp />} />
          <Route path="/knitting/editor" element={<KnittingApp view="editor" />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
