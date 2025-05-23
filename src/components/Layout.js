import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
              <li className={isActive('/songs')}>
                <Link to="/songs">Song Tabs</Link>
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
            <li className={isActive('/songs')}>
              <Link to="/songs" onClick={() => setMenuOpen(false)}>Song Tabs</Link>
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

      <footer className="main-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Wade Ahlstrom</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
