import React, { useState, useEffect } from 'react';
import { Chord as chordtools, Interval } from 'tonal'; // Tonal.js for chord transposition
import allTabs from '../data/tabs';
import {
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { Typography, Flex, Button, Collapse, Input } from 'antd';
import UkuleleChordChart from './UkuleleChordChart'; // Import the UkuleleChordChart component

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const LineWithChords = ({ line, togglePinChord }) => (
  <Flex style={{ fontFamily: 'monospace', whiteSpace: 'pre' }} align="end" wrap="wrap">
    {line.map((section, idx) => (
      <div key={idx} style={{ float: 'left' }}>
        {section.chords.map((chord, chordIdx) => (
          <strong
            key={chordIdx}
            style={{ textAlign: 'left', width: '100%', display: 'inline-block', cursor: 'pointer' }}
            onClick={() => togglePinChord(chord)} // Toggle pin on chord click
          >
            {chord}
          </strong>
        ))}
        <div>{section.text}</div>
      </div>
    ))}
  </Flex>
);

const Tabs = () => {
  // const song = allTabs[0];  // Assuming we're working with the first song
  const [song, setSong] = useState(allTabs[0]);
  // Initialize state
  const [lyrics, setLyrics] = useState(song.lyrics);
  const [keyShift, setKeyShift] = useState(0);  // Track how much the key has shifted in semitones
  const [allChords, setAllChords] = useState([]);
  const [pinnedChords, setPinnedChords] = useState([]); // new state for pinned chords
  const [jsonInput, setJsonInput] = useState(JSON.stringify(song, null, 2)); // Initialize with the stringified version of the first song
  const [showFormatError, setShowFormatError] = useState(false);

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

  const handleJsonInputChange = (e) => {
    setJsonInput(e.target.value);
  };

  const handleJsonSubmit = () => {
    try {
      const parsedSong = JSON.parse(jsonInput);
      if (Object.keys(parsedSong).length === 0) {
        // If the parsed object is empty, show the format description
        setShowFormatError(true);
        setSong({ title: '', artist: '', lyrics: [] });
        setLyrics([]);
      } else {
        setShowFormatError(false);
        setSong(parsedSong);
        setLyrics(parsedSong.lyrics);
      }
    } catch (error) {
      console.error("Invalid JSON:", error);
      setShowFormatError(true);
      // Optionally, display an error message to the user
    }
  };

  useEffect(() => {
    setLyrics(song.lyrics);
    setShowFormatError(false); // Hide the error when a valid song is loaded
  }, [song]);

  return (
    <div>
      <Collapse defaultActiveKey={['1']}>
        <Panel header="Edit Song JSON" key="1">
          <TextArea
            rows={4}
            value={jsonInput}
            onChange={handleJsonInputChange}
          />
          <Button onClick={handleJsonSubmit}>Update Song</Button>
        </Panel>
      </Collapse>
      {showFormatError ? (
        <div>
          <Text>
            <Text type="danger">JSON Format Error</Text>
            The JSON should have the following format:
          </Text>
          <pre style={{ textAlign: 'left' }}>
            <Text code>
              {`
{
  "title": "Song Title",
  "artist": "Artist Name",
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
}
              `}
            </Text>
          </pre>
        </div>
      ) : (
        <div>
          <Title level={3}>{song.title} by <i>{song.artist}</i></Title>

          {/* Controls for transposing the song */}
          <Flex justify="center" gap="small" wrap="wrap">
            <Button onClick={() => transposeSong(1)}>Transpose Up <ArrowUpOutlined /></Button>
            <Button onClick={() => transposeSong(-1)}>Transpose Down <ArrowDownOutlined /></Button>
          </Flex>
          <div>
            <strong>Current key shift: {keyShift} semitones</strong>
          </div>
          {/* Display all the charts for the chords in the current song */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Flex justify="center" gap="small" wrap="wrap">
              {allChords.map((chord, index) => (
                <div key={index} onClick={() => handlePinChord(chord)} style={{ cursor: 'pointer' }}>
                  <UkuleleChordChart chord={chord} />
                </div>
              ))}
            </Flex>
          </div>

          {/* Display lyrics with chords */}
          <Flex align="center" vertical={true}>
            {lyrics.map((line, lineIndex) => (
              <div key={lineIndex} style={{ marginBottom: '20px', display: 'flex' }}>
                <LineWithChords key={lineIndex} line={line} togglePinChord={handlePinChord} />
              </div>
            ))}
          </Flex>
        </div>
      )}


      {/* Pinned Chords Display in Footer */}
      <div style={{
        position: 'fixed',
        bottom: '45px',
        left: 0,
        width: '100%',
        backgroundColor: 'rgba(240, 240, 240, 0.7)', // Use rgba for background color with opacity
        textAlign: 'center',
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