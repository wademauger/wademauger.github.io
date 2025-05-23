import React from 'react';

const AlbumList = ({ albums, selectedAlbum, onSelectAlbum }) => {
  return (
    <div className="album-list">
      <ul>
        {albums.map(album => (
          <li 
            key={album.id} 
            className={selectedAlbum?.id === album.id ? 'active' : ''}
            onClick={() => onSelectAlbum(album)}
          >
            {album.title}
          </li>
        ))}
        {albums.length === 0 && (
          <li className="empty-message">No albums found.</li>
        )}
      </ul>
    </div>
  );
};

export default AlbumList;
