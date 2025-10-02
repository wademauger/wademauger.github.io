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
      .map(artist => {
        const matchesArtist = artist.name?.toLowerCase().includes(searchTerm);
        const filteredAlbums = (artist.albums || [])
          .map(album => {
            const matchesAlbum = album.title?.toLowerCase().includes(searchTerm);
            const filteredSongs = (album.songs || [])
              .filter(song => song.title?.toLowerCase().includes(searchTerm));
            
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
  const toggleArtist = React.useCallback((artistName) => {
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
  const handleSongSelect = React.useCallback((song, artistName, albumTitle) => {
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
      
      <div className="song-tree" style={{ 
        border: '1px solid #ddd', 
        borderRadius: 8, 
        padding: '8px',
        maxHeight: '400px',
        overflowY: 'auto',
        backgroundColor: 'white'
      }}>
        {filteredLibrary.artists.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            {filterText ? 'No songs found matching your search.' : 'No songs available.'}
          </div>
        ) : (
          filteredLibrary.artists.map(artist => {
            const artistExpanded = expandedArtists.has(artist.name);
            return (
              <div key={artist.name} className="tree-artist">
                <div 
                  className="tree-node tree-artist-node"
                  onClick={() => toggleArtist(artist.name)}
                  style={{ cursor: 'pointer', fontWeight: 'bold', padding: '4px 8px' }}
                >
                  <span className="tree-toggle">
                    {artist.albums?.length > 0 ? (artistExpanded ? '▼' : '▶') : '•'}
                  </span>
                  <span style={{ marginLeft: '8px' }}>{artist.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
                    ({artist.albums?.length || 0} albums)
                  </span>
                </div>
                
                {artistExpanded && (
                  <div className="tree-albums" style={{ marginLeft: '20px' }}>
                    {(artist.albums || []).map(album => {
                      const albumId = `${artist.name}-${album.title}`;
                      const albumExpanded = expandedAlbums.has(albumId);
                      return (
                        <div key={albumId} className="tree-album">
                          <div 
                            className="tree-node tree-album-node"
                            onClick={() => toggleAlbum(albumId)}
                            style={{ cursor: 'pointer', padding: '4px 8px', fontWeight: '500' }}
                          >
                            <span className="tree-toggle">
                              {album.songs?.length > 0 ? (albumExpanded ? '▼' : '▶') : '•'}
                            </span>
                            <span style={{ marginLeft: '8px' }}>{album.title}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
                              ({album.songs?.length || 0} songs)
                            </span>
                          </div>
                          
                          {albumExpanded && (
                            <div className="tree-songs" style={{ marginLeft: '20px' }}>
                              {(album.songs || []).map(song => {
                                const songId = `${artist.name}-${album.title}-${song.title}`;
                                const isSelected = selectedSongId === songId;
                                return (
                                  <div 
                                    key={songId}
                                    className={`tree-node tree-song-node ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleSongSelect(song, artist.name, album.title)}
                                    style={{ 
                                      cursor: 'pointer', 
                                      padding: '4px 8px',
                                      backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                                      borderRadius: '4px',
                                      margin: '2px 0'
                                    }}
                                  >
                                    <span style={{ marginLeft: '16px' }}>♪ {song.title}</span>
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
