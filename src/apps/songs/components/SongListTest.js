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
  const dispatch = useDispatch();
  const isGoogleDriveConnected = useSelector(selectIsGoogleDriveConnected);

  // Transform library data to react-folder-tree format
  const treeData = useMemo(() => {
    if (!library || !library.artists) return { name: 'Music Library', isOpen: true, children: [] };
    
    const tree = {
      name: 'Music Library',
      isOpen: true,
      children: []
    };

    library.artists.forEach(artist => {
      const artistNode = {
        name: artist.name,
        isOpen: true,
        type: 'artist',
        children: []
      };

      if (artist.albums) {
        artist.albums.forEach(album => {
          const albumNode = {
            name: album.title,
            isOpen: true,
            type: 'album',
            artistName: artist.name,
            children: []
          };

          if (album.songs) {
            album.songs.forEach(song => {
              // Check if this song is currently selected
              const isSelected = selectedSong && 
                selectedSong.title === song.title && 
                selectedSong.artist?.name === artist.name && 
                selectedSong.album?.title === album.title;
              
              albumNode.children.push({
                name: song.title,
                type: 'song',
                artistName: artist.name,
                albumTitle: album.title,
                songData: song,
                isSelected: isSelected
              });
            });
          }

          artistNode.children.push(albumNode);
        });
      }

      tree.children.push(artistNode);
    });

    return tree;
  }, [library, selectedSong]);

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
      <h3>Song Library</h3>
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px', 
        padding: '10px',
        maxHeight: '500px',
        overflowY: 'auto'
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
