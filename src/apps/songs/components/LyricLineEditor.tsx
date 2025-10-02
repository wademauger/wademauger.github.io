import React, { useState, useEffect, useRef } from 'react';

const LyricLineEditor = ({ line, onSave, onCancel }) => {
  const [editedLine, setEditedLine] = useState(line || '');
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input when the editor opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    onSave(editedLine);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="lyric-line-editor">
      <input
        ref={inputRef}
        type="text"
        value={editedLine}
        onChange={(e: any) => setEditedLine(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter lyrics with [Chord] notation..."
        className="lyric-input"
      />
      <div className="editor-controls">
        <button onClick={handleSave} className="save-button">Save</button>
        <button onClick={onCancel} className="cancel-button">Cancel</button>
      </div>
    </div>
  );
};

export default LyricLineEditor;
