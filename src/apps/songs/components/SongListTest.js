import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FolderTree from 'react-folder-tree';
import 'react-folder-tree/dist/style.css';
import {
  addSong,
  addAlbum, 
  addArtist,
  updateSong,
  updateArtist,
  updateAlbum,
  deleteSong,
  deleteArtist,
  deleteAlbum,
  selectIsGoogleDriveConnected
} from '../../../store/songsSlice';

function SongListTest({ library, selectedSong, editingEnabled, onSelectSong }) {
  // Controlled open nodes: only root expanded by default
  // Helper to generate unique node keys
  const ROOT_KEY = "Music Library";
  const [openNodes, setOpenNodes] = React.useState([]);
  // ...existing code...
  const dispatch = useDispatch();
  const isGoogleDriveConnected = useSelector(selectIsGoogleDriveConnected);
  const [filterText, setFilterText] = React.useState("");

  // Transform library data to react-folder-tree format, with filter
  const treeData = useMemo(() => {
    if (!library || !library.artists) return { name: 'Music Library', isOpen: true, children: [] };

    const filter = (str) =>
      filterText.trim() === "" ||
      (str && str.toLowerCase().includes(filterText.trim().toLowerCase()));

    // Helper to recursively collapse all nodes except root
    const collapseAll = (node) => {
      if (node && node.children && node.children.length > 0) {
        node.children = node.children.map(child => {
          return collapseAll({ ...child, isOpen: false });
        });
      }
      return node;
    };

    const tree = {
      name: 'Music Library',
      key: ROOT_KEY,
      isOpen: true,
      children: []
    };

    library.artists.forEach(artist => {
      const artistMatches = filter(artist.name);
      const artistKey = `${ROOT_KEY}/${artist.name}`;
      let artistNode = {
        name: artist.name,
        key: artistKey,
        isOpen: false,
        type: 'artist',
        children: []
      };

      if (artist.albums) {
        artist.albums.forEach(album => {
          const albumMatches = filter(album.title);
          const albumKey = `${artistKey}/${album.title}`;
          let albumNode = {
            name: album.title,
            key: albumKey,
            isOpen: false,
            type: 'album',
            artistName: artist.name,
            children: []
          };

          if (album.songs) {
            album.songs.forEach(song => {
              const songMatches = filter(song.title);
              const songKey = `${albumKey}/${song.title}`;
              const isSelected = selectedSong && 
                selectedSong.title === song.title && 
                selectedSong.artist?.name === artist.name && 
                selectedSong.album?.title === album.title;

              if (artistMatches || albumMatches || songMatches) {
                if (songMatches || albumMatches || artistMatches) {
                  albumNode.children.push({
                    name: song.title,
                    key: songKey,
                    type: 'song',
                    artistName: artist.name,
                    albumTitle: album.title,
                    songData: song,
                    isSelected: isSelected,
                    isOpen: false
                  });
                }
              }
            });
          }

          if (albumNode.children.length > 0 || albumMatches || artistMatches) {
            artistNode.children.push(albumNode);
          }
        });
      }

      if (artistNode.children.length > 0 || artistMatches) {
        tree.children.push(artistNode);
      }
    });

    return collapseAll(tree);
  }, [library, selectedSong, filterText]);

  const handleTreeStateChange = (newTreeState, event) => {
    console.log('Tree state changed:', { newTreeState, event });
  };

  const handleNameClick = ({ defaultOnClick, nodeData }) => {
    console.log('Name clicked:', { nodeData });
    
    // Handle song selection - only select if this is actually a song node
    if (nodeData && nodeData.type === 'song' && onSelectSong) {
      console.log('Selecting song:', nodeData.songData.title);
      onSelectSong(nodeData.songData, nodeData.artistName, nodeData.albumTitle);
    } else {
      // For non-song nodes, use default behavior (expand/collapse)
      defaultOnClick();
    }
  };

  const handleNameChange = async (prevName, name, nodeData) => {
    if (!editingEnabled || !name.trim()) return;

    try {
      if (nodeData.type === 'artist') {
        await dispatch(updateArtist({
          oldArtistName: prevName,
          newArtistName: name.trim(),
          isGoogleDriveConnected
        })).unwrap();
      } else if (nodeData.type === 'album') {
        await dispatch(updateAlbum({
          artistName: nodeData.artistName,
          oldAlbumTitle: prevName,
          newAlbumTitle: name.trim(),
          isGoogleDriveConnected
        })).unwrap();
      } else if (nodeData.type === 'song') {
        await dispatch(updateSong({
          artistName: nodeData.artistName,
          albumTitle: nodeData.albumTitle,
          songTitle: prevName,
          updatedSongData: { title: name.trim() },
          isGoogleDriveConnected
        })).unwrap();
      }
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleAddNode = async (name, parentNodeData) => {
    if (!editingEnabled || !name.trim()) return;

    try {
      if (!parentNodeData) {
        // Adding new artist at root level
        await dispatch(addArtist({
          artistName: name.trim(),
          isGoogleDriveConnected
        })).unwrap();
      } else if (parentNodeData.type === 'artist') {
        // Adding new album to artist
        await dispatch(addAlbum({
          artistName: parentNodeData.name,
          albumTitle: name.trim(),
          isGoogleDriveConnected
        })).unwrap();
      } else if (parentNodeData.type === 'album') {
        // Adding new song to album
        await dispatch(addSong({
          artistName: parentNodeData.artistName,
          albumTitle: parentNodeData.name,
          songData: {
            title: name.trim(),
            lyrics: '',
            notes: ''
          },
          isGoogleDriveConnected
        })).unwrap();
      }
    } catch (error) {
      console.error('Failed to add:', error);
    }
  };

  const handleDeleteNode = async (nodeData) => {
    if (!editingEnabled) return;

    try {
      if (nodeData.type === 'artist') {
        await dispatch(deleteArtist({
          artistName: nodeData.name,
          isGoogleDriveConnected
        })).unwrap();
      } else if (nodeData.type === 'album') {
        await dispatch(deleteAlbum({
          artistName: nodeData.artistName,
          albumTitle: nodeData.name,
          isGoogleDriveConnected
        })).unwrap();
      } else if (nodeData.type === 'song') {
        await dispatch(deleteSong({
          artistName: nodeData.artistName,
          albumTitle: nodeData.albumTitle,
          songTitle: nodeData.name,
          isGoogleDriveConnected
        })).unwrap();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          placeholder="Search by song, artist, or album..."
          style={{ width: '100%', padding: '8px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px', 
        padding: '10px'
      }}>
        <style>{`
          .FolderTree .TreeNode[data-selected="true"] {
            background-color: #e6f7ff !important;
            border-left: 3px solid #1890ff !important;
            padding-left: 7px !important;
          }
          .FolderTree .TreeNode[data-selected="true"] .EditableName .displayName {
            color: #1890ff !important;
            font-weight: 500 !important;
          }
        `}</style>
        <FolderTree
          data={treeData}
          nodeKey="key"
          openNodes={openNodes}
          onOpenNodesChange={setOpenNodes}
          onChange={handleTreeStateChange}
          onNameClick={handleNameClick}
          onNameChange={editingEnabled ? handleNameChange : undefined}
          onAddNode={editingEnabled ? handleAddNode : undefined}
          onDeleteNode={editingEnabled ? handleDeleteNode : undefined}
          showCheckbox={false}
          readOnly={!editingEnabled}
        />
      </div>
    </div>
  );
}

export default SongListTest;
