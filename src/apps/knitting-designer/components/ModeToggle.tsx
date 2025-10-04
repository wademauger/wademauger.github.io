import React from 'react';
import { Button } from 'antd';

type Props = {
  mode: 'wizard' | 'workspace';
  onChange: (m: 'wizard' | 'workspace') => void;
};

const ModeToggle: React.FC<Props> = ({ mode, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button type={mode === 'wizard' ? 'primary' : 'default'} onClick={() => onChange('wizard')}>
        Guided Wizard
      </Button>
      <Button type={mode === 'workspace' ? 'primary' : 'default'} onClick={() => onChange('workspace')}>
        Advanced Workspace
      </Button>
    </div>
  );
};

export default ModeToggle;
