import React, { useEffect, useRef } from 'react';
import { ChordBox } from 'vexchords';
import { ukuleleChords } from '@/apps/songs/data/ukuleleChords';

/**
 * Converts ukulele chord data from [G,C,E,A] format to VexChords [[string,fret]] format
 * @param frets - Array of fret positions [G, C, E, A]
 * @returns Array of [string, fret] pairs for VexChords
 */
const convertToVexChordsFormat = (frets: number[] | null): [number, number][] => {
  if (!frets || frets.length !== 4) {
    return [[4, 0], [3, 0], [2, 0], [1, 0]]; // Default open chord
  }
  
  // Convert from [G, C, E, A] to [[string, fret], ...] format
  // VexChords uses: string 4=G, 3=C, 2=E, 1=A (bottom to top)
  const result: [number, number][] = [];
  
  frets.forEach((fret, index) => {
    if (fret >= 0) { // Only include non-muted strings
      const stringNumber = 4 - index; // Convert array index to string number
      result.push([stringNumber, fret]);
    }
  });
  
  return result.length > 0 ? result : [[4, 0], [3, 0], [2, 0], [1, 0]];
};

interface UkuleleChordChartProps {
  chord: string;
}

const UkuleleChordChart: React.FC<UkuleleChordChartProps> = ({ chord }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.innerHTML = ''; // Clear the container before drawing the new chart

    const chordBox = new ChordBox(container, {
      width: 60,
      height: 72,
      circleRadius: 4,
      numStrings: 4,
      numFrets: 5,
      showTuning: true,
      defaultColor: '#000',
      bgColor: '#FFF',
      fretWidth: 1,
      stringWidth: 1
    });
    
    // Get chord data from ukuleleChords and convert to VexChords format
    const chordData = (ukuleleChords as any)[chord];
    const chordFrets = chordData ? chordData.frets : null;
    
    chordBox.draw({
      chord: convertToVexChordsFormat(chordFrets),
      tuning: ['G', 'C', 'E', 'A'],
      position: 0,
      barres: [],
      positionText: 0
    });
  }, [chord]);

  return <div className="chord-chart"><div ref={containerRef}></div>{chord}</div>;
};

export default UkuleleChordChart;