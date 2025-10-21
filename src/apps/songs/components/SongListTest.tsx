import * as React from 'react';
import SongListTest_MuiTreeView from './SongListTest_MuiTreeView';

interface SongListTestProps {
  library: any;
  selectedSong: any;
  editingEnabled: boolean;
  onSelectSong: (song: any) => void;
}

function SongListTest({ library, selectedSong, editingEnabled, onSelectSong }: SongListTestProps) {
  try {
    const libraryInfo = {
      libraryExists: !!library,
      hasArtists: !!(library?.artists),
      artistCount: library?.artists?.length || 0,
      totalSongs: library?.artists ? library.artists.reduce((total: number, artist: any) => {
        return total + (artist.albums || []).reduce((albumTotal: number, album: any) => {
          return albumTotal + (album.songs || []).length;
        }, 0);
      }, 0) : 0,
      selectedSongExists: !!selectedSong,
      editingEnabled,
      libraryStructure: library ? Object.keys(library) : []
    };
    
    console.log('🎵 SongListTest received props:', libraryInfo);
    
    if (library?.artists && library.artists.length > 0) {
      console.log('🎤 SongListTest first few artists:', library.artists.slice(0, 3).map((artist: any) => ({
        name: artist.name,
        albumCount: artist.albums?.length || 0,
        songCount: (artist.albums || []).reduce((total: number, album: any) => total + (album.songs || []).length, 0)
      })));
    } else {
      console.log('❌ SongListTest: No artists found in library');
    }
  } catch (e) {
    console.error('❌ SongListTest: Error analyzing props:', e);
  }
  return <SongListTest_MuiTreeView library={library} onSelectSong={onSelectSong} />;
}

export default SongListTest;
