import React from 'react';

const AlbumList = ({ albums, selectedAlbum, onSelectAlbum }) => {
  return (
    <div className="album-list">
      <ul>
        {albums.map(album => {
          const className = [
            selectedAlbum?.title === album.title ? 'active' : '',
            album.isOptimistic ? 'optimistic' : ''
          ].filter(Boolean).join(' ');

          return (
            <li 
              key={album.title} 
              className={className}
              onClick={() => !album.isOptimistic && onSelectAlbum(album)}
            >
              {album.title}
            </li>
          );
        })}
        {albums.length === 0 && (
          <li className="empty-message">No albums found.</li>
        )}
      </ul>
    </div>
  );
};

export default AlbumList;
