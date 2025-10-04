import React from 'react';

const WorkspaceView: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ padding: 8 }}>
        <h3>Advanced Workspace</h3>
        <p style={{ marginTop: 0 }}>Full editor surface with library, layers, and properties.</p>
      </div>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default WorkspaceView;
