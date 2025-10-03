import * as React from 'react';
import SongListTest_MuiTreeView from './SongListTest_MuiTreeView';

function SongListTest({ library, selectedSong, editingEnabled, onSelectSong }) {
  try {
    console.log('SongListTest props — libraryArtists=', library && library.artists ? library.artists.length : 0, 'selectedSong=', !!selectedSong, 'editingEnabled=', editingEnabled);
  } catch (e) {}
  return <SongListTest_MuiTreeView library={library} selectedSong={selectedSong} editingEnabled={editingEnabled} onSelectSong={onSelectSong} />;
}

export default SongListTest;
