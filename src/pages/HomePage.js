import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      
      <div className="app-cards">
        <div className="app-card">
          <h2>Recipes</h2>
          <p>
            Scalable recipes with adjustable font sizes.
            Perfect for kitchen use with an e-ink device!
          </p>
          <div className="app-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor" className="app-svg">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
            </svg>
          </div>
          <Link to="/crafts/recipes" className="app-link">Open Recipe App</Link>
        </div>
        
        <div className="app-card">
          <h2>Music Tabs</h2>
          <p>
            Explore your collection of music tabs organized by artist and album.
            View chord charts for various instruments.
          </p>
          <div className="app-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor" className="app-svg">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <Link to="/crafts/tabs" className="app-link">Open Music Tabs App</Link>
        </div>
        
        <div className="app-card">
          <h2>Knitting Studio</h2>
          <p>
            Scale and resize, apply decorate patterns, and interactively knit garments with row-by-row guidance. 
          </p>
          <div className="app-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor" className="app-svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <Link to="/crafts" className="app-link">Coming Soon</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
