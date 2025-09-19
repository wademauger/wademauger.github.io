import React from 'react';

interface MinimalLayoutProps {
  children: React.ReactNode;
}

const MinimalLayout: React.FC<MinimalLayoutProps> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

export default MinimalLayout;
