// Spotify Web API service for fetching album artwork and artist albums
// NOTE: This is the updated secure version that calls a backend API
class SpotifyService {
  apiEndpoint: string;
  albumCache: Map<string, any>;
  cacheExpiry: number;

  constructor() {
    // Backend API endpoint for Spotify searches - using your deployed Cloudflare worker
    this.apiEndpoint = import.meta.env.VITE_SPOTIFY_API_ENDPOINT || 'https://songs-spotify-api.ai-recipe-notepad.workers.dev/api/spotify-search';
    // Cache for artist albums to avoid repeated API calls
    this.albumCache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  // Search for album art by artist and album (no track required)
  async searchAlbumArt(artist, album = null) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          artist, 
          album,
          searchType: 'album' // Tell the worker to search for albums, not tracks
        })
      });

      if (!response.ok) {
        throw new Error(`Album search request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for album results first, then track results as fallback
      if (data.albums?.items?.length > 0) {
        const albumItem = data.albums.items[0];
        return {
          albumArt: albumItem.images?.[0]?.url || null,
          albumName: albumItem.name,
          artistName: albumItem.artists?.[0]?.name,
          releaseDate: albumItem.release_date,
          spotifyUrl: albumItem.external_urls?.spotify,
          totalTracks: albumItem.total_tracks
        };
      } else if (data.tracks?.items?.length > 0) {
        // Fallback to track search if no album found
        const trackItem = data.tracks.items[0];
        return {
          albumArt: trackItem.album.images?.[0]?.url || null,
          albumName: trackItem.album.name,
          artistName: trackItem.artists?.[0]?.name,
          trackName: trackItem.name,
          releaseDate: trackItem.album.release_date,
          spotifyUrl: trackItem.external_urls?.spotify
        };
      }

      return null;
    } catch (error: unknown) {
      console.error('Spotify album search failed:', error);
      return null;
    }
  }

  // Keep the original method for backwards compatibility
  async searchTrack(artist, track, album = null) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ artist, track, album })
      });

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.tracks?.items?.length > 0) {
        const trackItem = data.tracks.items[0];
        return {
          albumArt: trackItem.album.images?.[0]?.url || null,
          albumName: trackItem.album.name,
          artistName: trackItem.artists?.[0]?.name,
          trackName: trackItem.name,
          releaseDate: trackItem.album.release_date,
          spotifyUrl: trackItem.external_urls?.spotify
        };
      }

      return null;
    } catch (error: unknown) {
      console.error('Spotify search failed:', error);
      return null;
    }
  }

  // Get albums for an artist (cached)
  async getAlbumsForArtist(artistName) {
    if (!artistName || artistName.trim() === '') {
      return [];
    }

    const cacheKey = artistName.toLowerCase().trim();
    
    // Check cache first
    const cached = this.albumCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.albums;
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          artist: artistName,
          searchType: 'artist-albums' // Tell the backend to search for artist albums
        })
      });

      if (!response.ok) {
        // If it's a 404, the endpoint might not be set up yet
        if (response.status === 404) {
          console.warn('Spotify API endpoint not configured - album suggestions disabled');
        } else {
          console.error(`Artist albums search failed: ${response.status}`);
        }
        throw new Error(`Artist albums search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for error in response data
      if (data.error) {
        console.warn('Spotify API error:', data.error);
        throw new Error(data.error);
      }
      
      // Extract album names from the response
      let albums = [];
      if (data.albums?.items) {
        // Deduplicate and sort album names
        albums = [...new Set(
          data.albums.items.map(album => album.name)
        )].sort();
      }
      
      // Cache the result
      this.albumCache.set(cacheKey, {
        albums,
        timestamp: Date.now()
      });

      return albums;
    } catch (error: unknown) {
      console.error('Failed to get artist albums:', error);
      // Cache empty result to avoid repeated failed searches
      this.albumCache.set(cacheKey, {
        albums: [],
        timestamp: Date.now()
      });
      return [];
    }
  }

  // Search for artists by name (for fuzzy matching/autocomplete)
  async searchArtists(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const cacheKey = `artist_search_${searchTerm.toLowerCase().trim()}`;
    
    // Check cache first
    const cached = this.albumCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.artists;
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          artist: searchTerm,
          searchType: 'artist' // Tell the backend to search for artists
        })
      });

      if (!response.ok) {
        console.error(`Artist search failed: ${response.status}`);
        throw new Error(`Artist search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for error in response data
      if (data.error) {
        console.warn('Spotify API error:', data.error);
        throw new Error(data.error);
      }
      
      // Extract artist names from the response
      let artists = [];
      if (data.artists?.items) {
        // Deduplicate and sort artist names
        artists = [...new Set(
          data.artists.items.map(artist => artist.name)
        )].sort();
      }
      
      // Cache the result
      this.albumCache.set(cacheKey, {
        artists,
        timestamp: Date.now()
      });

      return artists;
    } catch (error: unknown) {
      console.error('Failed to search artists:', error);
      // Cache empty result to avoid repeated failed searches
      this.albumCache.set(cacheKey, {
        artists: [],
        timestamp: Date.now()
      });
      return [];
    }
  }

  // Clear the album cache (useful for testing or if needed)
  clearAlbumCache() {
    this.albumCache.clear();
  }

  // Get album cache stats (for debugging)
  getAlbumCacheStats() {
    return {
      size: this.albumCache.size,
      entries: Array.from(this.albumCache.keys())
    };
  }

  // Get album artwork URL with fallback handling
  getAlbumArtUrl(trackData) {
    if (!trackData?.albumArt) return null;
    return trackData.albumArt;
  }

  // Get tracks from a specific album (for song title suggestions)
  async getTracksFromAlbum(artistName, albumName) {
    if (!artistName || !albumName || artistName.trim() === '' || albumName.trim() === '') {
      return [];
    }

    const cacheKey = `album_tracks_${artistName.toLowerCase().trim()}_${albumName.toLowerCase().trim()}`;
    
    // Check cache first
    const cached = this.albumCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.tracks;
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          artist: artistName,
          album: albumName,
          searchType: 'tracks' // Tell the backend to search for tracks in an album
        })
      });

      if (!response.ok) {
        console.error(`Album tracks search failed: ${response.status}`);
        throw new Error(`Album tracks search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for error in response data
      if (data.error) {
        console.warn('Spotify API error:', data.error);
        throw new Error(data.error);
      }
      
      // Extract track names from the response
      let tracks = [];
      if (data.tracks?.items) {
        // Deduplicate and sort track names
        tracks = [...new Set(
          data.tracks.items.map(track => track.name)
        )].sort();
      }
      
      // Cache the result
      this.albumCache.set(cacheKey, {
        tracks,
        timestamp: Date.now()
      });

      return tracks;
    } catch (error: unknown) {
      console.error('Failed to get album tracks:', error);
      // Cache empty result to avoid repeated failed searches
      this.albumCache.set(cacheKey, {
        tracks: [],
        timestamp: Date.now()
      });
      return [];
    }
  }

  // Search for tracks by name (for fuzzy matching/autocomplete)
  async searchTracks(searchTerm, artistName = null) {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const cacheKey = `track_search_${searchTerm.toLowerCase().trim()}_${artistName ? artistName.toLowerCase().trim() : 'any'}`;
    
    // Check cache first
    const cached = this.albumCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.tracks;
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          track: searchTerm,
          artist: artistName,
          searchType: 'track-search' // Tell the backend to search for tracks by name
        })
      });

      if (!response.ok) {
        console.error(`Track search failed: ${response.status}`);
        throw new Error(`Track search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for error in response data
      if (data.error) {
        console.warn('Spotify API error:', data.error);
        throw new Error(data.error);
      }
      
      // Extract track names from the response
      let tracks = [];
      if (data.tracks?.items) {
        // Deduplicate and sort track names
        tracks = [...new Set(
          data.tracks.items.map(track => track.name)
        )].sort();
      }
      
      // Cache the result
      this.albumCache.set(cacheKey, {
        tracks,
        timestamp: Date.now()
      });

      return tracks;
    } catch (error: unknown) {
      console.error('Failed to search tracks:', error);
      // Cache empty result to avoid repeated failed searches
      this.albumCache.set(cacheKey, {
        tracks: [],
        timestamp: Date.now()
      });
      return [];
    }
  }
}

export default new SpotifyService();