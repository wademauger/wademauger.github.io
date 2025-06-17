import { useEffect } from 'react';

const RoutePreloader = () => {
  useEffect(() => {
    // Preload chunks for likely next routes when user hovers over navigation links
    const prefetchChunk = (chunkName) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = chunkName;
      document.head.appendChild(link);
    };

    // Add hover listeners to navigation links
    const handleMouseEnter = (e) => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('/crafts')) {
        // Prefetch the Layout component and related chunks
        import('../components/Layout');
        
        if (href.includes('recipes')) {
          import('../apps/recipes/RecipesApp');
        } else if (href.includes('songs') || href.includes('tabs')) {
          import('../apps/songs/SongTabsAppModern');
        } else if (href.includes('knitting')) {
          import('../apps/knitting/KnittingApp');
        }
      }
    };

    // Add listeners to all navigation links
    const links = document.querySelectorAll('a[href^="/crafts"]');
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
