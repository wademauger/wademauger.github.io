import React from 'react';
import { Typography, Flex, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import UkuleleChordChart from './UkuleleChordChart';
import LineWithChords from './LineWithChords';

const { Title } = Typography;

const SongDetails = ({ song, keyShift, transposeSong, allChords, handlePinChord, lyrics }) => (
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
        {allChords.map((chord, index: number) => (
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
);

export default SongDetails;