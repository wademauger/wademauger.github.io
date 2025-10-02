import React from 'react';
import { Flex } from 'antd';

const LineWithChords = ({ line, togglePinChord }) => (
  <Flex style={{ fontFamily: 'monospace', whiteSpace: 'pre' }} align="end" wrap="wrap">
    {line.map((section, idx: number) => (
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

export default LineWithChords;