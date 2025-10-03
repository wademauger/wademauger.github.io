import * as React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import './SongTree.css';

// Custom tree implementation replacing MUI TreeView to avoid recursion issues
// This simple tree provides the same functionality without the complexity and bugs of MUI's TreeView
function SongListTest_MuiTreeView({ library, onSelectSong }) {
  const [filterText, setFilterText] = React.useState('');
  const [expandedArtists, setExpandedArtists] = React.useState(new Set());
  const [expandedAlbums, setExpandedAlbums] = React.useState(new Set());
  const [selectedSongId, setSelectedSongId] = React.useState(null);

  // Filter library data based on search text
  const filteredLibrary = React.useMemo(() => {
    if (!library?.artists) return { artists: [] };
    
    const searchTerm = filterText.toLowerCase().trim();
    if (!searchTerm) return library;

    const filteredArtists = library.artists
      .map((artist: any) => {
        const matchesArtist = artist.name?.toLowerCase().includes(searchTerm);
        const filteredAlbums = (artist.albums || [])
          .map((album: any) => {
            const matchesAlbum = album.title?.toLowerCase().includes(searchTerm);
            const filteredSongs = (album.songs || [])
              .filter((song: any) => song.title?.toLowerCase().includes(searchTerm));
            
            if (matchesAlbum || filteredSongs.length > 0) {
              return { ...album, songs: matchesAlbum ? album.songs : filteredSongs };
            }
            return null;
          })
          .filter(Boolean);

        if (matchesArtist || filteredAlbums.length > 0) {
          return { ...artist, albums: matchesArtist ? artist.albums : filteredAlbums };
        }
        return null;
      })
      .filter(Boolean);

    return { artists: filteredArtists };
  }, [library, filterText]);

  // Toggle artist expansion
  const toggleArtist = React.useCallback((artistName: any) => {
    setExpandedArtists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(artistName)) {
        newSet.delete(artistName);
      } else {
        newSet.add(artistName);
      }
      return newSet;
    });
  }, []);

  // Toggle album expansion
  const toggleAlbum = React.useCallback((albumId) => {
    setExpandedAlbums(prev => {
      const newSet = new Set(prev);
      if (newSet.has(albumId)) {
        newSet.delete(albumId);
      } else {
        newSet.add(albumId);
      }
      return newSet;
    });
  }, []);

  // Handle song selection
  const handleSongSelect = React.useCallback((song, artistName, albumTitle: any) => {
    const songId = `${artistName}-${albumTitle}-${song.title}`;
    setSelectedSongId(songId);
    if (onSelectSong) {
      onSelectSong(song, artistName, albumTitle);
    }
  }, [onSelectSong]);

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        placeholder="Filter by song, artist, or album..."
        sx={{ mb: 2 }}
      />
      
      <div className="song-tree">
        {filteredLibrary.artists.length === 0 ? (
          <div className="song-tree-empty">
            {filterText ? 'No songs found matching your search.' : 'No songs available.'}
          </div>
        ) : (
          filteredLibrary.artists.map((artist: any) => {
            const artistExpanded = expandedArtists.has(artist.name);
            return (
              <div key={artist.name} className="tree-artist">
                <div 
                  className="tree-node tree-artist-node"
                  onClick={() => toggleArtist(artist.name)}
                >
                  <span className="tree-toggle">
                    {artist.albums?.length > 0 ? (artistExpanded ? '▼' : '▶') : '•'}
                  </span>
                  <span className="tree-artist-name">{artist.name}</span>
                  <span className="tree-count">({artist.albums?.length || 0} albums)</span>
                </div>
                
                {artistExpanded && (
                  <div className="tree-albums" style={{ marginLeft: '20px' }}>
                    {(artist.albums || []).map((album: any) => {
                      const albumId = `${artist.name}-${album.title}`;
                      const albumExpanded = expandedAlbums.has(albumId);
                      return (
                        <div key={albumId} className="tree-album">
                          <div 
                            className="tree-node tree-album-node"
                            onClick={() => toggleAlbum(albumId)}
                          >
                            <span className="tree-toggle">
                              {album.songs?.length > 0 ? (albumExpanded ? '▼' : '▶') : '•'}
                            </span>
                            <span className="tree-album-title">{album.title}</span>
                            <span className="tree-count">({album.songs?.length || 0} songs)</span>
                          </div>
                          
                          {albumExpanded && (
                            <div className="tree-songs">
                              {(album.songs || []).map((song: any) => {
                                const songId = `${artist.name}-${album.title}-${song.title}`;
                                const isSelected = selectedSongId === songId;
                                return (
                                  <div 
                                    key={songId}
                                    className={`tree-node tree-song-node ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleSongSelect(song, artist.name, album.title)}
                                    
                                  >
                                    <span className="tree-song-text">♪ {song.title}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Box>
  );
}

export default SongListTest_MuiTreeView;
