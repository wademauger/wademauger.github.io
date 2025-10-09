// Example Cloudflare Worker for secure Spotify API calls
// Deploy this to Cloudflare Workers to handle Spotify API securely

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method === 'POST' && new URL(request.url).pathname === '/api/spotify-search') {
      try {
        const { artist, track, album, searchType } = await request.json();
        
        // Get access token from Spotify
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`
          },
          body: 'grant_type=client_credentials'
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to get Spotify access token');
        }

        const { access_token } = await tokenResponse.json();
        
        // Build search query based on search type
        let query, searchTypes;
        
        if ((searchType === 'album' || searchType === 'artist-albums') && artist) {
          // Search for albums by artist, optionally filtered by album name
          query = `artist:"${artist}"`;
          if (album) {
            query += ` album:"${album}"`;
          }
          searchTypes = 'album'; // Search for albums only when looking for artist albums
        } else if (searchType === 'artist' && artist) {
          // Search for artists by name for fuzzy matching
          query = artist; // Simple artist name search for fuzzy matching
          searchTypes = 'artist';
        } else if (searchType === 'tracks' && artist && album) {
          // Search for tracks in a specific album by an artist
          query = `artist:"${artist}" album:"${album}"`;
          searchTypes = 'track';
        } else if (searchType === 'track-search' && track) {
          // Search for tracks by name, optionally with artist
          query = `track:"${track}"`;
          if (artist) {
            query += ` artist:"${artist}"`;
          }
          searchTypes = 'track';
        } else if (track && artist) {
          // Original track-based search
          query = `track:"${track}" artist:"${artist}"`;
          if (album) {
            query += ` album:"${album}"`;
          }
          searchTypes = 'track';
        } else {
          throw new Error('Invalid search parameters');
        }

        // Search Spotify
        const searchResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${searchTypes}&limit=50`,
          {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          }
        );

        if (!searchResponse.ok) {
          throw new Error('Spotify search failed');
        }

        const data = await searchResponse.json();
        
        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });

      } catch (error) {
        // console.error('Spotify API error:', error);
        return new Response(JSON.stringify({ error: 'Failed to search Spotify' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
    // For all other requests, proxy through to origin and add a popup-friendly
    // Cross-Origin-Opener-Policy header on HTML responses so OAuth popups can
    // communicate (window.closed / postMessage) with the opener.
    // This keeps the worker's API behavior while letting the site use the
    // worker as a lightweight proxy for headers if you're fronting GitHub Pages
    // or similar.
    try {
      const resp = await fetch(request);
      // Clone headers and set COOP for HTML responses
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const newHeaders = new Headers(resp.headers);
        // Allow opener to access popups while preserving same-origin protections
        newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
        // If you are not intentionally using COEP, do NOT set Cross-Origin-Embedder-Policy

        const buffer = await resp.arrayBuffer();
        return new Response(buffer, {
          status: resp.status,
          statusText: resp.statusText,
          headers: newHeaders,
        });
      }

      return resp;
    } catch (err) {
      return new Response('Not found', { status: 404 });
    }
  },
};