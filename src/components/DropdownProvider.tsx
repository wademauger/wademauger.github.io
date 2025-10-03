import React, { createContext, useContext, useState, ReactNode } from 'react';

type MenuItem = any; // Keep flexible for antd menu item shapes

interface DropdownContextValue {
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  return (
    <DropdownContext.Provider value={{ menuItems, setMenuItems }}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdown = () => {
  const ctx = useContext(DropdownContext);
  if (!ctx) return { menuItems: [], setMenuItems: (_: MenuItem[]) => {} };
  return ctx;
};

export default DropdownProvider;
