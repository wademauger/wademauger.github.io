import React, { useState, useEffect, useRef } from 'react';

interface LyricLineEditorProps {
  line: string;
  onSave: (line: string) => void;
  onCancel: () => void;
}

const LyricLineEditor: React.FC<LyricLineEditorProps> = ({ line, onSave, onCancel }) => {
  const [editedLine, setEditedLine] = useState<string>(line || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when the editor opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSave = (): void => {
    onSave(editedLine);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
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
        onChange={(e) => setEditedLine(e.target.value)}
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
