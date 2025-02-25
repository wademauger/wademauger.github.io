import React, { useState } from 'react';
import { Chord as chordtools, Interval } from 'tonal'; // Tonal.js for chord transposition
import allTabs from '../data/tabs';
import {
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { Typography, Flex, Button, Space } from 'antd';
const { Title } = Typography;

const LineWithChords = ({ line }) => (
  <div style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
    {line.map((section, idx) => (
      <div key={idx} style={{ float: 'left' }}>
        <strong style={{ textAlign: 'left', width: '100%', display: 'inline-block' }}>{section.chords.length > 0 ? section.chords.join(' ') : '\t'}</strong>
        <div>{section.text}</div>
      </div>
    ))}
  </div>
);

const Tabs = () => {
  const song = allTabs[0];  // Assuming we're working with the first song

  // Initialize state
  const [lyrics, setLyrics] = useState(song.lyrics);
  const [keyShift, setKeyShift] = useState(0);  // Track how much the key has shifted in semitones

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

  return (
    <div>
      <Title level={3}>{song.title} by <i>{song.artist}</i></Title>

      {/* Controls for transposing the song */}
      <Space>
        <Button onClick={() => transposeSong(-1)}>Transpose Down <ArrowDownOutlined /></Button>
        <Button onClick={() => transposeSong(1)}>Transpose Up <ArrowUpOutlined /></Button>
      </Space>
      <div>
        <strong>Current key shift: {keyShift} semitones</strong>
      </div>

      {/* Display lyrics with chords */}
      <Flex align="center" vertical={true}>
        {lyrics.map((line, lineIndex) => (
          <div key={lineIndex} style={{ marginBottom: '20px', display: 'flex' }}>
            <LineWithChords key={lineIndex} line={line} />
          </div>
        ))}
      </Flex>

    </div>
  );
};

export default Tabs;