import React from 'react';
import { Flex } from 'antd';

interface LineWithChordsProps {
  line: { chords: string[]; text: string }[];
  togglePinChord: (chord: string) => void;
}

const LineWithChords: React.FC<LineWithChordsProps> = ({ line, togglePinChord }) => (
  <Flex style={{ fontFamily: 'monospace', whiteSpace: 'pre' }} align="end" wrap="wrap">
    {line.map((section: { chords: string[]; text: string }, idx: number) => (
      <div key={idx} style={{ float: 'left' }}>
        {section.chords.map((chord: string, chordIdx: number) => (
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

export default LineWithChords;