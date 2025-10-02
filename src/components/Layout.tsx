import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, ConfigProvider, theme as antdTheme } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { unpinChord } from '@/store/chordsSlice';
import ChordChart from '@/apps/songs/components/ChordChart';
import RecipesGoogleSignInButton from '@/apps/recipes/components/GoogleSignInButton';
import SongsGoogleSignInButton from '@/apps/songs/components/GoogleSignInButton';
import ColorworkGoogleSignInButton from '@/apps/colorwork-designer/components/GoogleSignInButton';
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

  // Breadcrumb items generation based on pathname
  const breadcrumbNameMap: Record<string, string> = {
    '/': 'Professional',
    '/crafts': 'Projects',
    '/crafts/recipes': 'Recipes',
    '/crafts/tabs': 'Music Tabs',
    '/crafts/knitting': 'Knitting',
    '/crafts/unified-designer': 'Unified Designer',
    '/crafts/colorwork-designer': 'Colorwork Designer'
  };

  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbItems = [
    {
      path: '/',
      breadcrumbName: breadcrumbNameMap['/']
    }
  ];

  // Build breadcrumb for crafts and deeper routes
  if (pathSnippets.length > 0) {
    let accumulated = '';
    pathSnippets.forEach((_, idx) => {
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
        <ConfigProvider theme={{ algorithm: antdTheme.darkAlgorithm }}>
          <header className="main-header">
            <div className="header-content">
              <div className="breadcrumb-wrapper" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                <Breadcrumb style={{ margin: 0 }}>
                  {breadcrumbItems.map((item, idx) => (
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
              {(() => {
                const noop = () => {};
                const signOut = async () => {
                  try {
                    const w: any = typeof window !== 'undefined' ? window : {};
                    if (w.GoogleDriveServiceModern && w.GoogleDriveServiceModern.signOut) {
                      await w.GoogleDriveServiceModern.signOut();
                    }
                    try { window.dispatchEvent(new CustomEvent('app:google-signout', { detail: { app: appNameFromPath(location.pathname) } })); } catch (e) { /* swallow */ }
                  } catch (err) {
                    // swallow
                  }
                };

                const emitSignInSuccess = (tokenResponse: any, appName: string) => {
                  try {
                    window.dispatchEvent(new CustomEvent('app:google-signin-success', { detail: { app: appName, tokenResponse } }));
                  } catch (e) { /* swallow */ }
                };
                const emitSignInError = (error: any, appName: string) => {
                  try {
                    window.dispatchEvent(new CustomEvent('app:google-signin-error', { detail: { app: appName, error } }));
                  } catch (e) { /* swallow */ }
                };

                const appNameFromPath = (path: string) => {
                  if (path.startsWith('/crafts/recipes')) return 'recipes';
                  if (path.startsWith('/crafts/tabs')) return 'songs';
                  if (path.startsWith('/crafts/colorwork-designer') || path.startsWith('/crafts/unified-designer') || path.startsWith('/crafts/knitting')) return 'colorwork';
                  return 'songs';
                };

                if (location.pathname.startsWith('/crafts/recipes')) {
                  const app = 'recipes';
                  return <RecipesGoogleSignInButton onSuccess={(tr: any) => emitSignInSuccess(tr, app)} onError={(err: any) => emitSignInError(err, app)} onSignOut={signOut} />;
                }
                if (location.pathname.startsWith('/crafts/tabs')) {
                  const app = 'songs';
                  return <SongsGoogleSignInButton onSuccess={(tr: any) => emitSignInSuccess(tr, app)} onError={(err: any) => emitSignInError(err, app)} onSignOut={signOut} />;
                }
                if (location.pathname.startsWith('/crafts/colorwork-designer') || location.pathname.startsWith('/crafts/unified-designer') || location.pathname.startsWith('/crafts/knitting')) {
                  const openHandler = () => {
                    try { window.dispatchEvent(new CustomEvent('colorwork:open')); } catch (e) { /* swallow */ }
                  };
                  const saveAsHandler = () => {
                    try { window.dispatchEvent(new CustomEvent('colorwork:save-as')); } catch (e) { /* swallow */ }
                  };
                  const app = 'colorwork';
                  return <ColorworkGoogleSignInButton onSuccess={(tr: any) => emitSignInSuccess(tr, app)} onError={(err: any) => emitSignInError(err, app)} onSignOut={signOut} onOpen={openHandler} onSaveAs={saveAsHandler} />;
                }
                return <SongsGoogleSignInButton onSuccess={noop} onError={noop} onSignOut={signOut} />;
              })()}
            </div>

          </div>
        </header>
        </ConfigProvider>
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
