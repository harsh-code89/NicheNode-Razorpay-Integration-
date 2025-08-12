import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme, systemPrefersDark);
    } else {
      setTheme('system');
      applyTheme('system', systemPrefersDark);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme('system', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (newTheme: Theme, systemPrefersDark?: boolean) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme-related classes
    root.classList.remove('dark');
    body.classList.remove('dark');
    
    // Remove all custom appearance classes
    root.classList.remove(
      'text-sm', 'text-lg', 'text-xl',
      'density-compact', 'density-spacious',
      'reduce-motion',
      'scheme-purple', 'scheme-green', 'scheme-orange', 'scheme-pink'
    );

    let shouldBeDark = false;

    if (newTheme === 'light') {
      // Force light mode with all default settings
      shouldBeDark = false;
      
      // Reset all appearance settings to defaults
      root.classList.add('text-base', 'density-comfortable', 'scheme-blue');
      
      // Force light mode styles
      root.style.setProperty('--tw-bg-opacity', '1');
      root.style.setProperty('color-scheme', 'light');
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#1e293b';
      
      // Reset appearance settings in localStorage
      const defaultAppearanceSettings = {
        fontSize: 'medium',
        layoutDensity: 'comfortable',
        animationsEnabled: true,
        colorScheme: 'blue',
        reducedMotion: false
      };
      localStorage.setItem('appearanceSettings', JSON.stringify(defaultAppearanceSettings));
      
    } else if (newTheme === 'dark') {
      shouldBeDark = true;
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.setProperty('color-scheme', 'dark');
      
    } else if (newTheme === 'system') {
      const systemDark = systemPrefersDark ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
      shouldBeDark = systemDark;
      
      if (systemDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.style.setProperty('color-scheme', 'dark');
      } else {
        root.style.setProperty('color-scheme', 'light');
      }
    }

    setIsDark(shouldBeDark);
    localStorage.setItem('theme', newTheme);
  };

  const switchToLight = () => {
    setTheme('light');
    applyTheme('light');
    
    // Dispatch custom event for components to react to theme change
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: 'light', isDark: false } 
    }));
  };

  const switchToDark = () => {
    setTheme('dark');
    applyTheme('dark');
    
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: 'dark', isDark: true } 
    }));
  };

  const switchToSystem = () => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme('system');
    applyTheme('system', systemPrefersDark);
    
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: 'system', isDark: systemPrefersDark } 
    }));
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      switchToDark();
    } else {
      switchToLight();
    }
  };

  return {
    theme,
    isDark,
    isLight: theme === 'light',
    isSystem: theme === 'system',
    switchToLight,
    switchToDark,
    switchToSystem,
    toggleTheme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      applyTheme(newTheme);
    }
  };
}