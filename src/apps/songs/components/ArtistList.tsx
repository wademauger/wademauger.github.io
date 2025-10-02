import React from 'react';

const ArtistList = ({ artists, selectedArtist, onSelectArtist }) => {
  return (
    <div className="artist-list">
      <ul>
        {artists.map((artist: any) => {
          const className = [
            selectedArtist?.name === artist.name ? 'active' : '',
            artist.isOptimistic ? 'optimistic' : ''
          ].filter(Boolean).join(' ');

          return (
            <li 
              key={artist.name} 
              className={className}
              onClick={() => !artist.isOptimistic && onSelectArtist(artist)}
            >
              {artist.name}
            </li>
          );
        })}
        {artists.length === 0 && (
          <li className="empty-message">No artists found.</li>
        )}
      </ul>
    </div>
  );
};

export default ArtistList;
