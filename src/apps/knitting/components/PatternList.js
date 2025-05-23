import React from 'react';

const PatternList = ({ patterns, activePatternId, onSelectPattern }) => {
  return (
    <div className="pattern-list">
      <h2>My Patterns</h2>
      <ul>
        {patterns.map(pattern => (
          <li 
            key={pattern.id} 
            className={activePatternId === pattern.id ? 'active' : ''}
            onClick={() => onSelectPattern(pattern)}
          >
            {pattern.name}
            <span className="pattern-description">{pattern.description}</span>
          </li>
        ))}
        {patterns.length === 0 && (
          <li className="empty-message">No patterns found.</li>
        )}
      </ul>
    </div>
  );
};

export default PatternList;
