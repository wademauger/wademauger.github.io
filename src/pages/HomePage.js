import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <p className="intro-text">
        This site hosts a collection of useful tools I've created for different hobbies and interests.
        Choose an application below to get started.
      </p>
      
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
          <Link to="/recipes" className="app-link">Open Recipe App</Link>
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
          <Link to="/tabs" className="app-link">Open Music Tabs App</Link>
        </div>
        
        <div className="app-card">
          <h2>Knitting Patterns</h2>
          <p>
            Design, modify, and follow machine knitting patterns with
            visualizations for shaping and colorwork.
          </p>
          <div className="app-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor" className="app-svg">
              <path d="M19 5.5c0-1.38-1.12-2.5-2.5-2.5S14 4.12 14 5.5c0 .86.44 1.61 1.1 2.05C14.42 8.99 12 10.87 12 14c0-3.13-2.42-5.01-3.1-6.45.66-.44 1.1-1.19 1.1-2.05C10 4.12 8.88 3 7.5 3S5 4.12 5 5.5c0 .86.44 1.61 1.1 2.05C5.42 8.99 3 10.87 3 14c0 3.87 3.13 7 7 7 0-2.76 2.24-5 5-5s5 2.24 5 5c3.87 0 7-3.13 7-7 0-3.13-2.42-5.01-3.1-6.45.66-.44 1.1-1.19 1.1-2.05z" />
            </svg>
          </div>
          <Link to="/knitting" className="app-link">Open Knitting App</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
