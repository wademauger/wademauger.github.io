import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { unpinChord } from '@/store/chordsSlice';
import ChordChart from '@/apps/songs/components/ChordChart';
import { RootState } from '@/types';
import '@/styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, footer }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get pinned chords from Redux store
  const pinnedChords = useSelector((state: RootState) => state.chords?.pinnedChords || []);
  const currentInstrument = useSelector((state: RootState) => state.chords?.currentInstrument || 'ukulele');
  
  // Check if we're on a crafts page
  const isCraftsPage = location.pathname.startsWith('/crafts');
  
  const isActive = (path: string): string => {
    // For root path, check exact match to avoid highlighting on all pages
    if (path === '/') {
      return location.pathname === '/' ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };

  const handleUnpinChord = (chord: string): void => {
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
      height: '150px'
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
    <div className={`app-container ${isCraftsPage ? 'crafts-layout' : 'professional-layout'}`}>
      {/* Only show header for crafts pages */}
      {isCraftsPage && (
        <header className="main-header">
          <div className="header-content">
                <span className={isActive('/crafts')}>
                  <Link to="/crafts">
                      <span className="site-title">
                        <span className="home-icon">🏠</span>
                      </span>
                  </Link>
                </span>
            
            {/* Desktop navigation - will be visible only on desktop */}
            <nav className="desktop-navigation">
              <ul className="nav-list">
                <li className={isActive('/')}>
                  <Link to="/">Professional</Link>
                </li>
                <li className={isActive('/crafts/recipes')}>
                  <Link to="/crafts/recipes">Recipes</Link>
                </li>
                <li className={isActive('/crafts/tabs')}>
                  <Link to="/crafts/tabs">Music Tabs</Link>
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
      )}

      {/* Mobile navigation - will be visible only when toggled on mobile and on crafts pages */}
      {isCraftsPage && (
        <div className={`mobile-navigation-container ${menuOpen ? 'open' : ''}`}>
          <nav className="main-navigation">
            <ul className="nav-list">
              <li className={isActive('/')}>
                <Link to="/" onClick={() => setMenuOpen(false)}>Professional</Link>
              </li>
              <li className={isActive('/crafts/recipes')}>
                <Link to="/crafts/recipes" onClick={() => setMenuOpen(false)}>Recipes</Link>
              </li>
              <li className={isActive('/crafts/tabs')}>
                <Link to="/crafts/tabs" onClick={() => setMenuOpen(false)}>Music Tabs</Link>
              </li>
              
            </ul>
          </nav>
        </div>
      )}

      <main className={`content-container ${isCraftsPage ? 'crafts-content' : 'professional-content'}`}>
        {children}
      </main>

      {/* Always show the pinned chords footer if chords are selected */}
      {pinnedChordsFooter}

      {/* Only show the main footer for crafts pages */}
      {isCraftsPage && (footer || (
        <footer className="ant-layout-footer app-footer dark-footer css-ra95ns">
          Wade Ahlstrom © {new Date().getFullYear()}
        </footer>
      ))}
    </div>
  );
};

export default Layout;
