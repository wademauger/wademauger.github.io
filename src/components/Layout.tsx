import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, ConfigProvider, theme as antdTheme } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { unpinChord } from '@/store/chordsSlice';
import ChordChart from '@/apps/songs/components/ChordChart';
import GoogleAuthButton from './GoogleAuthButton';
import { RootState } from '@/types';
import { openLibrarySettingsModal } from '../reducers/modal.reducer';
import '@/styles/Layout.css';
import { DropdownProvider } from './DropdownProvider';

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

  // Breadcrumb items generation based on pathname
  const breadcrumbNameMap: Record<string, string> = {
    '/': 'Professional',
    '/crafts': 'Projects',
    '/crafts/recipes': 'Recipes',
    '/crafts/tabs': 'Music Tabs',
    '/crafts/knitting-pattern-designer': 'Knitting',
    '/crafts/knitting-pattern-designer/panel-shape-creator': 'Panel Designer',
    '/crafts/knitting-pattern-designer/pattern-wizard': 'Pattern Wizard',
    '/crafts/knitting-pattern-designer/colorwork-pattern-designer': 'Colorwork Designer'
  };

  const pathSnippets = location.pathname.split('/').filter((i: any) => i);
  const breadcrumbItems = [
    {
      path: '/',
      breadcrumbName: breadcrumbNameMap['/']
    }
  ];

  // Build breadcrumb for crafts and deeper routes
  if (pathSnippets.length > 0) {
    let accumulated = '';
    pathSnippets.forEach((_, idx: number) => {
      accumulated += `/${pathSnippets[idx]}`;
      const name = breadcrumbNameMap[accumulated] || pathSnippets[idx];
      breadcrumbItems.push({ path: accumulated, breadcrumbName: name });
    });
  }
  
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
        {pinnedChords.map((chord: any) => (
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
        <DropdownProvider>
          {/* Limit dark theme to header/navigation only */}
          <header className="main-header">
            <ConfigProvider theme={{ algorithm: antdTheme.darkAlgorithm }}>
              <div className="header-content">
                <div className="breadcrumb-wrapper" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                  <Breadcrumb style={{ margin: 0 }}>
                    {breadcrumbItems.map((item, idx: number) => (
                      <Breadcrumb.Item key={item.path}>
                        <Link to={item.path} style={{ color: 'rgba(255,255,255,0.9)', display: 'inline-flex', alignItems: 'center' }}>
                          {idx === 0 ? <HomeOutlined style={{ fontSize: '20px' }} /> : null}
                          {idx === 0 ? null : item.breadcrumbName}
                        </Link>
                      </Breadcrumb.Item>
                    ))}
                  </Breadcrumb>
                </div>

                {/* Right-side header area: unified Google login button that shows app-specific dropdowns */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                  {/* Global Google Auth Button (contains Library Settings in dropdown) */}
                  <GoogleAuthButton />
                </div>

              </div>
            </ConfigProvider>
          </header>

          {/* Listen for global open-library-settings events and map to Redux modal */}
            {/* This is outside of header markup but runs while Layout is mounted */}
            {(() => {
              // hook into window events via a one-off component-like effect
              try {
                const listener = (ev: any) => {
                  try {
                    const app = (function(p: string) {
                      if (p.startsWith('/crafts/recipes')) return 'recipes';
                      if (p.startsWith('/crafts/tabs')) return 'songs';
                      if (p.startsWith('/crafts/colorwork-designer') || p.startsWith('/crafts/unified-designer') || p.startsWith('/crafts/knitting')) return 'colorwork';
                      return 'songs';
                    })(location.pathname);
                    dispatch(openLibrarySettingsModal(app, {}));
                  } catch (e) { /* swallow */ }
                };
                if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                  window.addEventListener('app:open-library-settings', listener);
                }
              } catch (e) { /* swallow */ }
              return null;
            })()}

                {/* Mobile navigation - will be visible only when toggled on mobile and on crafts pages */}
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

            <main className={`content-container ${isCraftsPage ? 'crafts-content' : 'professional-content'}`}>
              {children}
            </main>

            {/* Always show the pinned chords footer if chords are selected */}
            {pinnedChordsFooter}

            {/* Only show the main footer for crafts pages */}
            {footer || (
              <footer className="ant-layout-footer app-footer dark-footer css-ra95ns">
                Wade Ahlstrom © {new Date().getFullYear()}
              </footer>
            )}

          </DropdownProvider>
      )}

      {/* If not on crafts pages just render children */}
      {!isCraftsPage && (
        <main className={`content-container ${isCraftsPage ? 'crafts-content' : 'professional-content'}`}>
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;
