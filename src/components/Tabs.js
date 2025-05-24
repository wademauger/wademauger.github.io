import React, { useState, useEffect, useRef } from 'react';
import { Chord as chordtools, Interval } from 'tonal'; // Tonal.js for chord transposition
import allTabs from '../data/tabs';
import { Typography, Flex, Button, Tree, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import UkuleleChordChart from './UkuleleChordChart'; // Import the UkuleleChordChart component
import SongDetails from './SongDetails'; // Import the new SongDetails component
import moment from 'moment';

const { Text } = Typography;

const formatExample = `
{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name", // Optional
  "lyrics": [
    [
      [
        {
          "chords": ["Am", "G"],
          "text": "Verse 1 line 1"
        }
      ],
      [
        {
          "chords": ["C", "F"],
          "text": "Verse 1 line 2"
        }
      ]
    ],
    [
      [
        {
          "chords": ["Am", "G"],
          "text": "Chorus line 1"
        }
      ],
      [
        {
          "chords": ["C", "F"],
          "text": "Chorus line 2"
        }
      ]
    ]
  ]
}`;

const Tabs = () => {
  const [song, setSong] = useState(allTabs[0]);
  const [lyrics, setLyrics] = useState(song.lyrics);
  const [keyShift, setKeyShift] = useState(0);  // Track how much the key has shifted in semitones
  const [allChords, setAllChords] = useState([]);
  const [pinnedChords, setPinnedChords] = useState([]); // new state for pinned chords
  const [jsonInput, setJsonInput] = useState(JSON.stringify(song, null, 2)); // Initialize with the stringified version of the first song
  const [showFormatError, setShowFormatError] = useState(false);
  const textareaRef = useRef(null);

  // Function to transpose a single chord by a given interval
  const transposeChord = (chord, interval) => {
    return chordtools.transpose(chord, Interval.fromSemitones(interval));
  };

  // Function to transpose the entire song
  const transposeSong = (shiftAmount) => {
    const newKeyShift = keyShift + shiftAmount;
    const newLyrics = song.lyrics.map(line =>
      line.map(section => ({
        ...section,
        chords: section.chords.map(chord => transposeChord(chord, newKeyShift))  // Transpose each chord in the section
      }))
    );
    setKeyShift(newKeyShift);  // Update key shift
    setLyrics(newLyrics);  // Update lyrics state
  };

  // Update allChords whenever lyrics change
  useEffect(() => {
    const uniqueChords = Array.from(new Set(lyrics.flatMap(line => line.flatMap(section => section.chords))));
    setAllChords(uniqueChords);
  }, [lyrics]);

  // Function to handle pinning a chord
  const handlePinChord = (chord) => {
    if (pinnedChords.includes(chord)) {
      // If it's already pinned, unpin it
      setPinnedChords(pinnedChords.filter((pinnedChord) => pinnedChord !== chord));
    } else {
      // Otherwise, pin it
      setPinnedChords([...pinnedChords, chord]);
    }
  };

  // Function to handle unpinning a chord
  const handleUnpinChord = (chord) => {
    setPinnedChords(pinnedChords.filter((pinnedChord) => pinnedChord !== chord));
  };

  useEffect(() => {
    setLyrics(song.lyrics);
    setShowFormatError(false); // Hide the error when a valid song is loaded
  }, [song]);

  // Function to generate tree data from song data
  const generateTreeData = (songs) => {
    const artists = {};

    songs.forEach(song => {
      if (!artists[song.artist]) {
        artists[song.artist] = { _no_album: [] };
      }
      if (song.album) {
        if (!artists[song.artist][song.album]) {
          artists[song.artist][song.album] = [];
        }
        artists[song.artist][song.album].push({ title: song.title, key: song.title });
      } else {
        artists[song.artist]._no_album.push({ title: song.title, key: song.title });
      }
    });

    return Object.keys(artists).sort().map(artist => ({
      title: artist,
      key: artist,
      children: [
        ...artists[artist]._no_album.sort((a, b) => a.title.localeCompare(b.title)),
        ...Object.keys(artists[artist]).filter(album => album !== '_no_album').sort().map(album => ({
          title: album,
          key: `${artist}-${album}`,
          children: artists[artist][album].sort((a, b) => a.title.localeCompare(b.title))
        }))
      ]
    }));
  };

  const treeData = generateTreeData(allTabs);

  const onSelect = (selectedKeys, info) => {
    const selectedSong = allTabs.find(song => song.title === selectedKeys[0]);
    if (selectedSong) {
      setSong(selectedSong);
      setJsonInput(JSON.stringify(selectedSong, null, 2));
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const uploadedSongs = JSON.parse(e.target.result);
        // Assuming the uploaded JSON is an array of songs
        if (Array.isArray(uploadedSongs)) {
          setShowFormatError(false);
          // Update allTabs with the uploaded songs
          allTabs.splice(0, allTabs.length, ...uploadedSongs);
          // Update the tree data
          const newTreeData = generateTreeData(allTabs);
          setJsonInput(JSON.stringify(allTabs[0], null, 2));
          setSong(allTabs[0]);
          setLyrics(allTabs[0].lyrics);
        } else {
          setShowFormatError(true);
        }
      } catch (error) {
        console.error("Invalid JSON:", error);
        setShowFormatError(true);
      }
    };
    reader.readAsText(file);
    return false; // Prevent automatic upload
  };

  const handleFileDownload = () => {
    const json = JSON.stringify(allTabs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = moment();
    a.href = url;
    a.download = `songs_${now.format('YYYY-MM-DD_HH-mm-ss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Flex justify="center" gap="small" wrap="wrap">
        <Upload
          accept=".json"
          beforeUpload={handleFileUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Upload a Song Library file</Button>
        </Upload>
        <Button onClick={handleFileDownload}>Download Song Library</Button>
      </Flex>
      <Tree
        showLine
        onSelect={onSelect}
        treeData={treeData}
        showLeafIcon={'custom'}
      />
      {showFormatError ? (
        <div>
          <Text>
            <Text type="danger">JSON Format Error</Text>
            The JSON should have the following format:
          </Text>
          <code>{formatExample}</code>
        </div>
      ) : (
        <SongDetails
          song={song}
          keyShift={keyShift}
          transposeSong={transposeSong}
          allChords={allChords}
          handlePinChord={handlePinChord}
          lyrics={lyrics}
        />
      )}

      {/* Pinned Chords Display in Footer */}
      <div style={{
        position: 'fixed',
        bottom: '45px',
        left: 0,
        width: '100%',
        backgroundColor: 'rgba(240, 240, 240, 0.7)', // Use rgba for background color with opacity
        textAlign: 'center',
        height: '150px',
      }}>
        <Flex justify="center" gap="small" wrap="wrap">
          {pinnedChords.map((chord, index) => (
            <div key={index} onClick={() => handleUnpinChord(chord)} style={{ cursor: 'pointer' }}>
              <UkuleleChordChart chord={chord} />
            </div>
          ))}
        </Flex>
      </div>
    </div>
  );
};

export default Tabs;