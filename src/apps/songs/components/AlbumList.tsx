import React from 'react';

interface AlbumListProps {
  albums: any[];
  selectedAlbum: any;
  onSelectAlbum: (album: any) => void;
}

const AlbumList = ({ albums, selectedAlbum, onSelectAlbum }: AlbumListProps) => {
  return (
    <div className="album-list">
      <ul>
        {albums.map((album: any) => {
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
