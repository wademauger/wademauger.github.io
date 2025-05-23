import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArtistList from './components/ArtistList';
import AlbumList from './components/AlbumList';
import SongDetail from './components/SongDetail';
import ChordChart from './components/ChordChart';
import './styles/SongTabsApp.css';

const SongTabsApp = () => {
  const [library, setLibrary] = useState({artists: []});
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [instrument, setInstrument] = useState('ukulele');
  const [pinnedChords, setPinnedChords] = useState([]);
  
  const { artistId, albumId, songId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data - in production, you'd load a JSON file with song library
    const mockLibrary = {
      artists: [
        {
          id: '1',
          name: 'The Beatles',
          albums: [
            {
              id: '101',
              title: 'Abbey Road',
              songs: [
                {
                  id: '1001',
                  title: 'Come Together',
                  chords: ['A', 'D', 'E', 'G'],
                  lyrics: "Here come old flat top, he come grooving up slowly..."
                }
              ]
            }
          ]
        }
      ]
    };
    setLibrary(mockLibrary);
  }, []);

  // Handle URL parameter changes
  useEffect(() => {
    if (artistId && library.artists.length) {
      const artist = library.artists.find(a => a.id === artistId);
      if (artist) {
        setSelectedArtist(artist);
        
        if (albumId) {
          const album = artist.albums.find(a => a.id === albumId);
          if (album) {
            setSelectedAlbum(album);
            
            if (songId) {
              const song = album.songs.find(s => s.id === songId);
              if (song) {
                setSelectedSong(song);
              }
            }
          }
        }
      }
    }
  }, [artistId, albumId, songId, library]);

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setSelectedSong(null);
    navigate(`/songs/artist/${artist.id}`);
  };

  const handleAlbumSelect = (album) => {
    setSelectedAlbum(album);
    setSelectedSong(null);
    navigate(`/songs/album/${album.id}`);
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    navigate(`/songs/song/${song.id}`);
  };

  const handleInstrumentChange = (newInstrument) => {
    setInstrument(newInstrument);
  };

  const handlePinChord = (chord) => {
    if (!pinnedChords.includes(chord)) {
      setPinnedChords([...pinnedChords, chord]);
    }
  };

  const handleUnpinChord = (chord) => {
    setPinnedChords(pinnedChords.filter(c => c !== chord));
  };

  return (
    <div className="song-tabs-app">
      <div className="app-header">
        <h1>Song Tabs</h1>
        <div className="instrument-selector">
          <label htmlFor="instrument-select">Instrument:</label>
          <select 
            id="instrument-select" 
            value={instrument} 
            onChange={(e) => handleInstrumentChange(e.target.value)}
          >
            <option value="ukulele">Ukulele</option>
            <option value="guitar">Guitar</option>
            <option value="piano">Piano</option>
          </select>
        </div>
      </div>

      <div className="library-navigation">
        <div className="navigation-column">
          <h2>Artists</h2>
          <ArtistList 
            artists={library.artists} 
            selectedArtist={selectedArtist}
            onSelectArtist={handleArtistSelect}
          />
        </div>

        {selectedArtist && (
          <div className="navigation-column">
            <h2>Albums</h2>
            <AlbumList 
              albums={selectedArtist.albums} 
              selectedAlbum={selectedAlbum}
              onSelectAlbum={handleAlbumSelect}
            />
          </div>
        )}

        {selectedAlbum && (
          <div className="navigation-column">
            <h2>Songs</h2>
            <ul className="song-list">
              {selectedAlbum.songs.map(song => (
                <li 
                  key={song.id}
                  className={selectedSong?.id === song.id ? 'active' : ''}
                  onClick={() => handleSongSelect(song)}
                >
                  {song.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedSong && (
        <div className="song-content">
          <SongDetail 
            song={selectedSong} 
            instrument={instrument}
            onPinChord={handlePinChord}
          />
        </div>
      )}

      {pinnedChords.length > 0 && (
        <div className="pinned-chords">
          <h3>Pinned Chords</h3>
          <div className="chord-container">
            {pinnedChords.map(chord => (
              <div key={chord} className="pinned-chord">
                <ChordChart 
                  chord={chord} 
                  instrument={instrument} 
                  small={true}
                />
                <button 
                  className="unpin-button" 
                  onClick={() => handleUnpinChord(chord)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongTabsApp;
