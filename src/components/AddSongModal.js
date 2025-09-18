import React, { useState, useEffect } from 'react';
import { convertLyrics } from '../convert-lyrics';
import './AddSongModal.css';

const AddSongModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  library, 
  selectedArtist = null,
  selectedAlbum = null 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: selectedArtist?.name || '',
    album: selectedAlbum?.title || '',
    lyrics: ''
  });
  
  const [showNewArtistInput, setShowNewArtistInput] = useState(false);
  const [showNewAlbumInput, setShowNewAlbumInput] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [originalLyrics, setOriginalLyrics] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        artist: selectedArtist?.name || '',
        album: selectedAlbum?.title || '',
        lyrics: ''
      });
      setShowNewArtistInput(false);
      setShowNewAlbumInput(false);
      setNewArtistName('');
      setNewAlbumTitle('');
      setOriginalLyrics('');
    }
  }, [isOpen, selectedArtist, selectedAlbum]);

  // Get unique artists from library
  const getArtists = () => {
    if (!library || !library.artists) return [];
    return library.artists.map(artist => artist.name).sort();
  };

  // Get albums for selected artist
  const getAlbumsForArtist = (artistName) => {
    if (!library || !library.artists || !artistName) return [];
    const artist = library.artists.find(a => a.name === artistName);
    if (!artist || !artist.albums) return [];
    return artist.albums.map(album => album.title).sort();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset album selection if artist changes
    if (field === 'artist') {
      setFormData(prev => ({ ...prev, album: '' }));
    }
  };

  const handleArtistChange = (value) => {
    if (value === '__ADD_NEW__') {
      setShowNewArtistInput(true);
      setNewArtistName('');
    } else {
      setShowNewArtistInput(false);
      handleInputChange('artist', value);
    }
  };

  const handleAlbumChange = (value) => {
    if (value === '__ADD_NEW__') {
      setShowNewAlbumInput(true);
      setNewAlbumTitle('');
    } else {
      setShowNewAlbumInput(false);
      handleInputChange('album', value);
    }
  };

  const handleNewArtistSave = () => {
    if (newArtistName.trim()) {
      handleInputChange('artist', newArtistName.trim());
      setShowNewArtistInput(false);
      setNewArtistName('');
    }
  };

  const handleNewAlbumSave = () => {
    if (newAlbumTitle.trim()) {
      handleInputChange('album', newAlbumTitle.trim());
      setShowNewAlbumInput(false);
      setNewAlbumTitle('');
    }
  };

  const handleConvertLyrics = () => {
    if (originalLyrics.trim()) {
      const converted = convertLyrics(originalLyrics);
      setFormData(prev => ({ ...prev, lyrics: converted }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.artist.trim() || !formData.album.trim()) {
      alert('Please fill in all required fields (Song Title, Artist, Album)');
      return;
    }

    const songData = {
      title: formData.title.trim(),
      artist: formData.artist.trim(),
      album: formData.album.trim(),
      lyrics: formData.lyrics.trim(),
      chords: '', // Initialize empty chords
      notes: ''   // Initialize empty notes
    };

    onSave(songData);
  };

  const handleKeyPress = (e, handler) => {
    if (e.key === 'Enter') {
      handler();
    } else if (e.key === 'Escape') {
      if (handler === handleNewArtistSave) {
        setShowNewArtistInput(false);
      } else if (handler === handleNewAlbumSave) {
        setShowNewAlbumInput(false);
      }
    }
  };

  if (!isOpen) return null;

  const artists = getArtists();
  const albums = getAlbumsForArtist(formData.artist);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Song</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="song-title">Song Title *</label>
            <input
              id="song-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter song title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="artist-select">Artist *</label>
            {showNewArtistInput ? (
              <div className="new-entry-container">
                <input
                  type="text"
                  value={newArtistName}
                  onChange={(e) => setNewArtistName(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleNewArtistSave)}
                  placeholder="Enter new artist name..."
                  autoFocus
                />
                <button type="button" onClick={handleNewArtistSave}>Save</button>
                <button type="button" onClick={() => setShowNewArtistInput(false)}>Cancel</button>
              </div>
            ) : (
              <select
                id="artist-select"
                value={formData.artist}
                onChange={(e) => handleArtistChange(e.target.value)}
                required
              >
                <option value="">Select an artist...</option>
                {artists.map(artist => (
                  <option key={artist} value={artist}>{artist}</option>
                ))}
                <option value="__ADD_NEW__">+ Add New Artist</option>
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="album-select">Album *</label>
            {showNewAlbumInput ? (
              <div className="new-entry-container">
                <input
                  type="text"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleNewAlbumSave)}
                  placeholder="Enter new album title..."
                  autoFocus
                />
                <button type="button" onClick={handleNewAlbumSave}>Save</button>
                <button type="button" onClick={() => setShowNewAlbumInput(false)}>Cancel</button>
              </div>
            ) : (
              <select
                id="album-select"
                value={formData.album}
                onChange={(e) => handleAlbumChange(e.target.value)}
                required
                disabled={!formData.artist}
              >
                <option value="">Select an album...</option>
                {albums.map(album => (
                  <option key={album} value={album}>{album}</option>
                ))}
                <option value="__ADD_NEW__">+ Add New Album</option>
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lyrics-input">Lyrics (Optional)</label>
            <div className="lyrics-container">
              <textarea
                id="lyrics-input"
                value={formData.lyrics}
                onChange={(e) => handleInputChange('lyrics', e.target.value)}
                placeholder="Enter lyrics with chords..."
                rows={8}
              />
              
              <div className="lyrics-conversion-section">
                <h4>Convert External Format</h4>
                <textarea
                  value={originalLyrics}
                  onChange={(e) => setOriginalLyrics(e.target.value)}
                  placeholder="Paste lyrics in external format (chords on separate lines)..."
                  rows={6}
                />
                <button 
                  type="button" 
                  onClick={handleConvertLyrics}
                  disabled={!originalLyrics.trim()}
                  className="convert-button"
                >
                  Convert to Inline Format
                </button>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Add Song
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSongModal;