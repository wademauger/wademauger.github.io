import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge } from 'antd';
import '../styles/HomePage.css';
import RecipeIcon from '../img/icons/chef.svg';
import MusicIcon from '../img/icons/uke.svg';
import KnittingIcon from '../img/icons/sweater.svg';

const HomePage = () => {
  // Prefer the structured `fullLibrary` object when available (canonical source),
  // otherwise fall back to the legacy flattened `entries` array.
  const fullLib = useSelector((state: any) => state.library?.fullLibrary || null);
  const entries: any[] = useSelector((state: any) => state.library?.entries || []);

  // Derive counts from fullLibrary if present for robustness.
  let recipeCount = 0;
  let songCount = 0;
  let panelCount = 0;
  let colorworkCount = 0;

  if (fullLib) {
    if (fullLib.recipes && typeof fullLib.recipes === 'object') {
      recipeCount = Object.keys(fullLib.recipes).length;
    }
    if (fullLib.artists && Array.isArray(fullLib.artists)) {
      // Count songs by summing songs in each artist/album
      songCount = fullLib.artists.reduce((total: number, artist: any) => {
        if (!artist.albums) return total;
        return total + artist.albums.reduce((aTotal: number, album: any) => aTotal + (album.songs ? album.songs.length : 0), 0);
      }, 0);
    }
    if (fullLib.panels && typeof fullLib.panels === 'object') {
      panelCount = Object.keys(fullLib.panels).length;
    }
    if (fullLib.colorworkPatterns) {
      if (Array.isArray(fullLib.colorworkPatterns)) colorworkCount = fullLib.colorworkPatterns.length;
      else if (typeof fullLib.colorworkPatterns === 'object') colorworkCount = Object.keys(fullLib.colorworkPatterns).length;
    }
  } else {
    // Fallback: compute counts by type from entries
    const counts = entries.reduce((acc: any, e: any) => {
      const t = e?.type || 'unknown';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    recipeCount = counts['recipe'] || 0;
    songCount = counts['song'] || 0;
    panelCount = counts['panel'] || 0;
    // Fallback: count colorwork patterns from entries if present
    colorworkCount = counts['colorworkPatterns'] || counts['colorwork'] || counts['colorworkPattern'] || 0;
  }

  return (
    <div className="home-page">
      <div className="app-cards">
        <Badge.Ribbon text={`${recipeCount} recipe${recipeCount !== 1 ? 's' : ''}`} color={recipeCount ? 'blue' : 'gray'}>
          <div className="app-card">
            <h2>Recipes</h2>
            <p>
              Organize your recipes, with scalable ingredients and adjustable font sizes.
              Perfect for kitchen use with an e-ink device!
            </p>
            <img
              src={RecipeIcon}
              alt="Recipe"
              className="app-icon"
            />
            <Link to="/crafts/recipes" className="app-link">Open Recipe App</Link>
          </div>
        </Badge.Ribbon>

        <Badge.Ribbon text={`${songCount} song${songCount !== 1 ? 's' : ''}`} color={songCount ? 'green' : 'gray'}>
          <div className="app-card">
            <h2>Music Tabs</h2>
            <p>
              Explore your collection of music tabs organized by artist and album.
              View chord charts for various instruments.
            </p>
            <img
              src={MusicIcon}
              alt="Music"
              className="app-icon"
            />
            <Link to="/crafts/tabs" className="app-link">Open Music Tabs App</Link>
          </div>
        </Badge.Ribbon>

        <Badge.Ribbon text={`${colorworkCount} colorwork pattern${colorworkCount !== 1 ? 's' : ''}`} color={colorworkCount ? 'volcano' : 'gray'}>
          <Badge.Ribbon text={`${panelCount} panel${panelCount !== 1 ? 's' : ''}`} color={panelCount ? 'magenta' : 'gray'} style={{ top: 40 }}>
            <div className="app-card">
              <h2>Knitting Patterns</h2>
              <p>
                Design a garment in one size, then knit it in different sizes, using different yarns, using complex systems of colorwork patterns.
              </p>
              <img
                src={KnittingIcon}
                alt="Knitting"
                className="app-icon"
              />
              <Link to="/crafts/knitting-pattern-designer" className="app-link">Open Pattern Wizard</Link>
            </div>
          </Badge.Ribbon>
        </Badge.Ribbon>

      </div>
    </div>
  );
};

export default HomePage;
