import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'normal' | 'halloween' | 'christmas' | 'eid' | 'ramadan' | 'diwali';

interface ThemeContextType {
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: (theme: ThemeMode) => void;
  isThemeActive: (theme: ThemeMode) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    try {
      const storedTheme = localStorage.getItem('active-theme') as ThemeMode;
      return storedTheme || 'normal';
    } catch (error) {
      console.error("Failed to read 'active-theme' from localStorage", error);
      return 'normal';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('active-theme', currentTheme);
    } catch (error) {
      console.error("Failed to write 'active-theme' to localStorage", error);
    }

    // Remove all theme classes
    document.body.classList.remove('halloween-mode', 'christmas-mode', 'eid-mode', 'ramadan-mode', 'diwali-mode');
    
    // Add current theme class
    if (currentTheme !== 'normal') {
      document.body.classList.add(`${currentTheme}-mode`);
    }
  }, [currentTheme]);

  const setTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
  };

  const toggleTheme = (theme: ThemeMode) => {
    if (currentTheme === theme) {
      setCurrentTheme('normal');
    } else {
      setCurrentTheme(theme);
    }
  };

  const isThemeActive = (theme: ThemeMode) => {
    return currentTheme === theme;
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, toggleTheme, isThemeActive }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Legacy Halloween-specific exports for backward compatibility
export const useHalloweenTheme = () => {
  const { currentTheme, toggleTheme, isThemeActive } = useTheme();
  return {
    isHalloweenMode: isThemeActive('halloween'),
    toggleHalloweenMode: () => toggleTheme('halloween')
  };
};

export const HalloweenThemeProvider = ThemeProvider;
