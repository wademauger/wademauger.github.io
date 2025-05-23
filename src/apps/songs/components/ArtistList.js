import React from 'react';

const ArtistList = ({ artists, selectedArtist, onSelectArtist }) => {
  return (
    <div className="artist-list">
      <ul>
        {artists.map(artist => (
          <li 
            key={artist.id} 
            className={selectedArtist?.id === artist.id ? 'active' : ''}
            onClick={() => onSelectArtist(artist)}
          >
            {artist.name}
          </li>
        ))}
        {artists.length === 0 && (
          <li className="empty-message">No artists found.</li>
        )}
      </ul>
    </div>
  );
};

export default ArtistList;
