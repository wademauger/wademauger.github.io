import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trapezoid } from '../../models/Trapezoid';
import { StitchPlan } from '../../models/StitchPlan';
import PatternList from './components/PatternList';
import PatternEditor from './components/PatternEditor';
import PatternViewer from './components/PatternViewer';
import ColorworkEditor from './components/ColorworkEditor';
import './styles/KnittingApp.css';

const KnittingApp = ({ view = 'viewer' }) => {
  const [patterns, setPatterns] = useState([]);
  const [activePattern, setActivePattern] = useState(null);
  const [sizeModifier, setSizeModifier] = useState(1);
  const [colorworkPattern, setColorworkPattern] = useState(null);
  const [currentRow, setCurrentRow] = useState(1);
  const { patternId } = useParams();

  useEffect(() => {
    // Mock data - in production, you'd fetch patterns from storage
    const mockPatterns = [
      {
        id: '1',
        name: 'Basic Sweater Front',
        description: 'Simple sweater front panel with v-neck',
        panel: {
          height: 20,
          baseA: 16,
          baseB: 16,
          successors: [
            {
              height: 5,
              baseA: 8,
              baseB: 8,
              baseBHorizontalOffset: -2,
            },
            {
              height: 5,
              baseA: 8,
              baseB: 8,
              baseBHorizontalOffset: 2,
            }
          ]
        }
      }
    ];
    setPatterns(mockPatterns);
  }, []);

  useEffect(() => {
    if (patternId && patterns.length) {
      const pattern = patterns.find(p => p.id === patternId);
      if (pattern) {
        // Convert JSON panel to Trapezoid object
        const trapezoid = Trapezoid.fromObject(pattern.panel);
        setActivePattern({
          ...pattern,
          panel: trapezoid
        });
      }
    }
  }, [patternId, patterns]);

  const handleSizeChange = (newSize) => {
    setSizeModifier(newSize);
    if (activePattern?.panel) {
      activePattern.panel.setSizeModifier(newSize);
      // Force refresh
      setActivePattern({...activePattern});
    }
  };

  const handleRowChange = (rowNum) => {
    setCurrentRow(rowNum);
  };

  const handlePatternSelect = (pattern) => {
    // Convert JSON panel to Trapezoid object
    const trapezoid = Trapezoid.fromObject(pattern.panel);
    setActivePattern({
      ...pattern,
      panel: trapezoid
    });
    setCurrentRow(1); // Reset to first row
  };

  const handleColorworkChange = (colorwork) => {
    setColorworkPattern(colorwork);
  };

  return (
    <div className="knitting-app">
      <div className="app-header">
        <h1>Knitting Patterns</h1>
        <div className="view-controls">
          {activePattern && (
            <>
              <div className="size-controls">
                <label>Size: </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.05" 
                  value={sizeModifier}
                  onChange={(e) => handleSizeChange(parseFloat(e.target.value))}
                />
                <span>{Math.round(sizeModifier * 100)}%</span>
              </div>
              <div className="mode-toggle">
                {view === 'editor' ? 'Edit Mode' : 'View Mode'}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="knitting-content">
        <PatternList
          patterns={patterns}
          activePatternId={activePattern?.id}
          onSelectPattern={handlePatternSelect}
        />

        {view === 'editor' && activePattern ? (
          <div className="editor-container">
            <PatternEditor 
              pattern={activePattern}
              onPatternChange={(updatedPattern) => setActivePattern(updatedPattern)}
            />
            <ColorworkEditor
              pattern={activePattern}
              colorwork={colorworkPattern}
              onColorworkChange={handleColorworkChange}
            />
          </div>
        ) : activePattern ? (
          <PatternViewer
            pattern={activePattern}
            colorwork={colorworkPattern}
            currentRow={currentRow}
            onRowChange={handleRowChange}
            sizeModifier={sizeModifier}
          />
        ) : (
          <div className="empty-state">
            <p>Select a pattern to view or edit</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnittingApp;
