import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme, Theme } from '../hooks/useTheme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
  switchToLight: () => void;
  switchToDark: () => void;
  switchToSystem: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeState = useTheme();
  
  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}