import * as React from 'react';
import SongListTest_MuiTreeView from './SongListTest_MuiTreeView';

function SongListTest({ library, selectedSong, editingEnabled, onSelectSong }) {
  return <SongListTest_MuiTreeView library={library} selectedSong={selectedSong} editingEnabled={editingEnabled} onSelectSong={onSelectSong} />;
}

export default SongListTest;
