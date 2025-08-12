import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeContext } from './ThemeProvider';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  variant = 'button', 
  size = 'md', 
  showLabels = true,
  className = '' 
}: ThemeToggleProps) {
  const { theme, switchToLight, switchToDark, switchToSystem } = useThemeContext();

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'dropdown') {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="flex space-x-1">
          {[
            { value: 'light', icon: Sun, label: 'Light', action: switchToLight },
            { value: 'dark', icon: Moon, label: 'Dark', action: switchToDark },
            { value: 'system', icon: Monitor, label: 'System', action: switchToSystem }
          ].map(({ value, icon: Icon, label, action }) => (
            <button
              key={value}
              onClick={action}
              className={`flex items-center space-x-2 ${sizeClasses[size]} rounded-xl transition-all duration-200 ${
                theme === value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className={iconSizes[size]} />
              {showLabels && <span className="font-medium">{label}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={switchToLight}
          className={`${sizeClasses[size]} rounded-lg transition-all duration-200 ${
            theme === 'light'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          title="Light mode"
        >
          <Sun className={iconSizes[size]} />
        </button>
        <button
          onClick={switchToDark}
          className={`${sizeClasses[size]} rounded-lg transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          title="Dark mode"
        >
          <Moon className={iconSizes[size]} />
        </button>
        <button
          onClick={switchToSystem}
          className={`${sizeClasses[size]} rounded-lg transition-all duration-200 ${
            theme === 'system'
              ? 'bg-purple-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          title="System theme"
        >
          <Monitor className={iconSizes[size]} />
        </button>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={switchToLight}
      className={`${sizeClasses[size]} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 flex items-center space-x-2 ${className}`}
      title="Switch to light mode"
    >
      <Sun className={iconSizes[size]} />
      {showLabels && <span>Light Mode</span>}
    </button>
  );
}