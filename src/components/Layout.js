import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { unpinChord } from '../store/chordsSlice';
import ChordChart from '../apps/songs/components/ChordChart';
import '../styles/Layout.css';

const Layout = ({ children, footer }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get pinned chords from Redux store
  const pinnedChords = useSelector((state) => state.chords?.pinnedChords || []);
  const currentInstrument = useSelector((state) => state.chords?.currentInstrument || 'ukulele');
  
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleUnpinChord = (chord) => {
    dispatch(unpinChord(chord));
  };

  // Create pinned chords footer content
  const pinnedChordsFooter = pinnedChords.length > 0 ? (
    <div style={{
      position: 'fixed',
      bottom: '45px',
      left: '0px',
      width: '100%',
      backgroundColor: 'rgba(240, 240, 240, 0.7)',
      textAlign: 'center',
      height: '150px',
    }}>
      <div className="ant-flex css-ra95ns ant-flex-wrap-wrap ant-flex-justify-center ant-flex-gap-small">
        {pinnedChords.map(chord => (
          <div key={chord} style={{ cursor: 'pointer', display: 'inline-block', transform: 'scale(0.75)', transformOrigin: 'top left', position: 'relative' }} onClick={() => handleUnpinChord(chord)}>
            <div className="chord-chart">
              <ChordChart
                chord={chord}
                instrument={currentInstrument}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
              <span className={isActive('/')}>
                <Link to="/">
                    <span className="site-title">
                      <span className="home-icon">🏠 Craft Center</span>
                    </span>
                </Link>
              </span>
          
          {/* Desktop navigation - will be visible only on desktop */}
          <nav className="desktop-navigation">
            <ul className="nav-list">
              <li className={isActive('/recipes')}>
                <Link to="/recipes">Recipes</Link>
              </li>
              <li className={isActive('/tabs')}>
                <Link to="/tabs">Music Tabs</Link>
              </li>
              <li className={isActive('/knitting')}>
                <Link to="/knitting">Knitting Patterns</Link>
              </li>
            </ul>
          </nav>
          
          {/* Mobile menu toggle - will be visible only on mobile */}
          <button 
            className="menu-toggle" 
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger"></span>
          </button>
        </div>
      </header>

      {/* Mobile navigation - will be visible only when toggled on mobile */}
      <div className={`mobile-navigation-container ${menuOpen ? 'open' : ''}`}>
        <nav className="main-navigation">
          <ul className="nav-list">
            <li className={isActive('/recipes')}>
              <Link to="/recipes" onClick={() => setMenuOpen(false)}>Recipes</Link>
            </li>
            <li className={isActive('/tabs')}>
              <Link to="/tabs" onClick={() => setMenuOpen(false)}>Music Tabs</Link>
            </li>
            <li className={isActive('/knitting')}>
              <Link to="/knitting" onClick={() => setMenuOpen(false)}>Knitting Patterns</Link>
            </li>
          </ul>
        </nav>
      </div>

      <main className="content-container">
        {children}
      </main>

      {/* Always show the pinned chords footer if chords are selected */}
      {pinnedChordsFooter}

      {/* Always show the main footer */}
      {footer || (
        <footer className="ant-layout-footer app-footer dark-footer css-ra95ns">
          Wade Ahlstrom © {new Date().getFullYear()}
        </footer>
      )}
    </div>
  );
};

export default Layout;
