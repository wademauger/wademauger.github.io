import React, { useEffect } from 'react';

const RoutePreloader: React.FC = () => {
  useEffect(() => {
    // Preload chunks for likely next routes when user hovers over navigation links
    const prefetchChunk = (chunkName: string): void => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = chunkName;
      document.head.appendChild(link);
    };

    // Add hover listeners to navigation links
    const handleMouseEnter = (e: Event): void => {
      const target = e.target as HTMLAnchorElement;
      const href = target.getAttribute('href');
      if (href && (href.startsWith('/crafts') || href.includes('#/crafts'))) {
        // Prefetch the Layout component and related chunks
        import('../components/Layout');
        
        if (href.includes('recipes')) {
          import('../apps/recipes/RecipesApp');
        } else if (href.includes('songs') || href.includes('tabs')) {
          import('../apps/songs/SongTabsAppModern.jsx');
        } else if (href.includes('knitting')) {
          // Knitting app preloading can be added here if needed
        }
      }
    };

    // Add listeners to all navigation links (both hash and non-hash)
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/crafts"], a[href*="#/crafts"]');
    links.forEach(link => {
      link.addEventListener('mouseenter', handleMouseEnter);
    });

    // Cleanup
    return () => {
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RoutePreloader;
