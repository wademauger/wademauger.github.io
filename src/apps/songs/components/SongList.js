import React from 'react';
import { Spin } from 'antd';

const SongList = ({ 
  artist,
  album,
  songs, 
  onSongSelect, 
  onBack,
  editingEnabled,
  isAddingSong,
  setIsAddingSong,
  isSavingSong,
  newSongTitle,
  setNewSongTitle,
  onAddSong,
  newSongInputRef
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSavingSong) {
      e.preventDefault(); // Prevent form submission or double event
      onAddSong();
    } else if (e.key === 'Escape' && !isSavingSong) {
      setIsAddingSong(false);
    }
  };

  return (
    <div className="navigation-column">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>
          Songs
          {editingEnabled && (
            <button 
              className="add-button" 
              onClick={() => setIsAddingSong(true)} 
              disabled={isAddingSong}
            >
              +
            </button>
          )}
        </h2>
        <button onClick={onBack} className="back-button">
          ← Back to Albums
        </button>
      </div>
      
      {isAddingSong && (
        <div className="add-item-container">
          <input
            ref={newSongInputRef}
            type="text"
            value={newSongTitle}
            onChange={(e) => setNewSongTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Song name..."
            className="add-item-input"
            // Ensure this input is not inside a <form> or, if it is, the form's onSubmit should not call onAddSong again
          />
          <div className="add-item-controls">
            <button type="button" onClick={onAddSong} disabled={isSavingSong}>
              {isSavingSong ? (
                <>
                  <Spin size="small" style={{ marginRight: 4 }} />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
            <button onClick={() => setIsAddingSong(false)} disabled={isSavingSong}>
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <ul className="song-list">
        {songs.map(song => {
          const className = [
            song.isOptimistic ? 'optimistic' : ''
          ].filter(Boolean).join(' ');

          return (
            <li
              key={song.title}
              className={className}
              onClick={() => !song.isOptimistic && onSongSelect(song)}
            >
              {song.title}
            </li>
          );
        })}
        {songs.length === 0 && (
          <li className="empty-message">No songs found.</li>
        )}
      </ul>
    </div>
  );
};

export default SongList;
