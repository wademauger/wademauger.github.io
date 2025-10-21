import React from 'react';

interface MinimalLayoutProps {
  children: React.ReactNode;
}

const MinimalLayout = ({ children }: MinimalLayoutProps) => {
  return (
    <div>
      {children}
    </div>
  );
};

export default MinimalLayout;
