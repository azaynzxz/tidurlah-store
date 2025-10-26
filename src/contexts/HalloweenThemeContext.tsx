import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HalloweenThemeContextType {
  isHalloweenMode: boolean;
  toggleHalloweenMode: () => void;
}

const HalloweenThemeContext = createContext<HalloweenThemeContextType | undefined>(undefined);

interface HalloweenThemeProviderProps {
  children: ReactNode;
}

export const HalloweenThemeProvider: React.FC<HalloweenThemeProviderProps> = ({ children }) => {
  const [isHalloweenMode, setIsHalloweenMode] = useState<boolean>(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('halloween-mode-enabled');
    if (savedTheme === 'true') {
      setIsHalloweenMode(true);
      document.body.classList.add('halloween-mode');
    }
  }, []);

  // Update localStorage and body class when theme changes
  useEffect(() => {
    localStorage.setItem('halloween-mode-enabled', isHalloweenMode.toString());
    if (isHalloweenMode) {
      document.body.classList.add('halloween-mode');
    } else {
      document.body.classList.remove('halloween-mode');
    }
  }, [isHalloweenMode]);

  const toggleHalloweenMode = () => {
    setIsHalloweenMode(prev => !prev);
  };

  return (
    <HalloweenThemeContext.Provider value={{ isHalloweenMode, toggleHalloweenMode }}>
      {children}
    </HalloweenThemeContext.Provider>
  );
};

export const useHalloweenTheme = (): HalloweenThemeContextType => {
  const context = useContext(HalloweenThemeContext);
  if (context === undefined) {
    throw new Error('useHalloweenTheme must be used within a HalloweenThemeProvider');
  }
  return context;
};
