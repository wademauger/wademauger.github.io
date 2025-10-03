import React, { useState, useEffect } from 'react';
import SpotifyService from '../services/SpotifyService';

// Cache utility functions
const CACHE_KEY_PREFIX = 'albumArt_';
const CACHE_EXPIRY_HOURS = 24; // Cache for 24 hours

const getCacheKey = (artist, album: any) => {
  // Cache by artist and album only (not track)
  return `${CACHE_KEY_PREFIX}${artist}_${album || 'unknown'}`.replace(/[^a-zA-Z0-9_]/g, '_');
};

const getCachedData = (cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const expiryTime = timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
      
      if (now < expiryTime) {
        return data;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error: unknown) {
    console.warn('Cache read error:', error);
  }
  return null;
};

const setCachedData = (cacheKey, data: any) => {
  try {
    const cacheObject = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
  } catch (error: unknown) {
    console.warn('Cache write error:', error);
  }
};

const AlbumArt = ({ artist, album, size = 150 }) => {
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumArt = async () => {
      if (!artist) return; // Only require artist, not track

      const cacheKey = getCacheKey(artist, album);
      
      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log('🎯 Cache hit for:', artist, album ? `- ${album}` : '(any album)');
        setAlbumData(cachedData);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('🌐 API call for:', artist, album ? `- ${album}` : '(searching artist albums)');
        const data = await SpotifyService.searchAlbumArt(artist, album);
        setAlbumData(data);
        
        // Cache the result
        if (data) {
          setCachedData(cacheKey, data);
        }
      } catch (err: unknown) {
        // Detailed error handling
        let errorMessage = 'Failed to load album art';
        
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Cannot reach Spotify API service';
        } else if (err.message.includes('JSON')) {
          errorMessage = `JSON Parse Error: ${err.message}`;
        } else if (err.message.includes('404')) {
          errorMessage = 'API endpoint not found (404)';
        } else if (err.message.includes('401')) {
          errorMessage = 'Authentication failed (401) - Check Spotify credentials';
        } else if (err.message.includes('403')) {
          errorMessage = 'Access forbidden (403) - API quota exceeded?';
        } else if (err.message.includes('500')) {
          errorMessage = 'Server error (500) - Spotify API or Worker issue';
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
        console.error('Album art fetch error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          artist,
          album
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumArt();
  }, [artist, album]); // Remove track dependency

  if (loading) {
    return (
      <div className="album-art-placeholder" style={{ width: size, height: size }}>
        <div className="album-art-loading-text">Loading...</div>
      </div>
    );
  }

  if (error || !albumData?.albumArt) {
    return (
      <div className="album-art-placeholder album-art-missing" style={{ width: size, height: size }}>
        <div className="album-art-icon">♪</div>
        <div className="album-art-text">No album art found</div>
      </div>
    );
  }

  return (
    <div className="album-art-wrapper" style={{ width: size, height: size }}>
      <img
        src={albumData.albumArt}
        alt={`${albumData.albumName} album art`}
        className="album-art-image"
        style={{ width: size, height: size }}
        onError={(e: any) => {
          e.target.style.display = 'none';
          setError('Image failed to load');
        }}
      />
    </div>
  );
};

export default AlbumArt;