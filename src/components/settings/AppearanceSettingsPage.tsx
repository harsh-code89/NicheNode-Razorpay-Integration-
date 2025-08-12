import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Type, Layout, Zap, Eye, Sliders } from 'lucide-react';
import { Toast, useToast } from '../Toast';

interface AppearanceSettingsPageProps {
  onBack: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

interface AppearanceSettings {
  fontSize: 'small' | 'medium' | 'large';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  animationsEnabled: boolean;
  colorScheme: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  reducedMotion: boolean;
}

export function AppearanceSettingsPage({ onBack, theme, onThemeChange }: AppearanceSettingsPageProps) {
  const { toast, showToast, hideToast } = useToast();
  
  const [settings, setSettings] = useState<AppearanceSettings>({
    fontSize: 'medium',
    layoutDensity: 'comfortable',
    animationsEnabled: true,
    colorScheme: 'blue',
    reducedMotion: false
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appearanceSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = (newSettings: AppearanceSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appearanceSettings', JSON.stringify(newSettings));
    applySettings(newSettings);
    showToast('Appearance settings saved!', 'success');
  };

  const applySettings = (newSettings: AppearanceSettings) => {
    const root = document.documentElement;
    
    // Apply font size
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (newSettings.fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }

    // Apply layout density
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    root.classList.add(`density-${newSettings.layoutDensity}`);

    // Apply animations
    if (!newSettings.animationsEnabled || newSettings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply color scheme
    root.classList.remove('scheme-blue', 'scheme-purple', 'scheme-green', 'scheme-orange', 'scheme-pink');
    root.classList.add(`scheme-${newSettings.colorScheme}`);
  };

  const handleLightModeClick = () => {
    // Reset all custom settings to default when switching to light mode
    const defaultSettings: AppearanceSettings = {
      fontSize: 'medium',
      layoutDensity: 'comfortable',
      animationsEnabled: true,
      colorScheme: 'blue',
      reducedMotion: false
    };
    
    // Apply light theme
    onThemeChange('light');
    
    // Reset all appearance settings to defaults
    setSettings(defaultSettings);
    localStorage.setItem('appearanceSettings', JSON.stringify(defaultSettings));
    applySettings(defaultSettings);
    
    // Remove any custom theme classes and ensure light mode
    const root = document.documentElement;
    root.classList.remove('dark');
    
    showToast('Switched to light mode with default settings!', 'success');
  };

  const colorSchemes = [
    { id: 'blue' as const, name: 'Ocean Blue', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'purple' as const, name: 'Royal Purple', gradient: 'from-purple-500 to-pink-500' },
    { id: 'green' as const, name: 'Forest Green', gradient: 'from-green-500 to-emerald-500' },
    { id: 'orange' as const, name: 'Sunset Orange', gradient: 'from-orange-500 to-red-500' },
    { id: 'pink' as const, name: 'Cherry Blossom', gradient: 'from-pink-500 to-rose-500' }
  ];

  return (
    <div className="space-y-8">
      <Toast {...toast} onClose={hideToast} />
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
          Appearance Settings
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Customize the look and feel of your interface
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
            <Sun className="w-6 h-6" />
            <span>Theme</span>
          </h2>
          
          <div className="space-y-4">
            {[
              { 
                value: 'light' as const, 
                icon: Sun, 
                label: 'Light Mode', 
                description: 'Clean white interface with default settings',
                onClick: handleLightModeClick
              },
              { 
                value: 'dark' as const, 
                icon: Moon, 
                label: 'Dark Mode', 
                description: 'Easy on the eyes in low light',
                onClick: () => onThemeChange('dark')
              },
              { 
                value: 'system' as const, 
                icon: Monitor, 
                label: 'System', 
                description: 'Follows your device settings',
                onClick: () => onThemeChange('system')
              }
            ].map(({ value, icon: Icon, label, description, onClick }) => (
              <button
                key={value}
                onClick={onClick}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 text-left ${
                  theme === value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div>
                  <div className="font-medium">{label}</div>
                  <div className={`text-sm ${theme === value ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Light Mode Reset Notice */}
          {theme === 'light' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">Light Mode Active</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                All settings have been reset to default values for the optimal light theme experience.
              </p>
            </div>
          )}
        </div>

        {/* Color Scheme */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
            <Palette className="w-6 h-6" />
            <span>Color Scheme</span>
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => saveSettings({ ...settings, colorScheme: scheme.id })}
                disabled={theme === 'light' && scheme.id !== 'blue'}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 text-left ${
                  settings.colorScheme === scheme.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : theme === 'light' && scheme.id !== 'blue'
                      ? 'opacity-50 cursor-not-allowed border border-slate-200 dark:border-slate-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${scheme.gradient} shadow-md`} />
                <div className="flex-1">
                  <span className="font-medium text-slate-900 dark:text-white">{scheme.name}</span>
                  {theme === 'light' && scheme.id !== 'blue' && (
                    <div className="text-xs text-slate-500">Default in light mode</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
            <Type className="w-6 h-6" />
            <span>Typography</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Font Size
              </label>
              <div className="space-y-2">
                {[
                  { value: 'small' as const, label: 'Small', preview: 'The quick brown fox' },
                  { value: 'medium' as const, label: 'Medium', preview: 'The quick brown fox' },
                  { value: 'large' as const, label: 'Large', preview: 'The quick brown fox' }
                ].map(({ value, label, preview }) => (
                  <button
                    key={value}
                    onClick={() => saveSettings({ ...settings, fontSize: value })}
                    disabled={theme === 'light' && value !== 'medium'}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      settings.fontSize === value
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
                        : theme === 'light' && value !== 'medium'
                          ? 'bg-slate-50 dark:bg-slate-700 opacity-50 cursor-not-allowed'
                          : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                    <span className={`${value === 'small' ? 'text-sm' : value === 'large' ? 'text-lg' : 'text-base'} text-slate-600 dark:text-slate-400`}>
                      {preview}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Layout & Motion */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
            <Layout className="w-6 h-6" />
            <span>Layout & Motion</span>
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Layout Density
              </label>
              <div className="space-y-2">
                {[
                  { value: 'compact' as const, label: 'Compact', description: 'More content, less spacing' },
                  { value: 'comfortable' as const, label: 'Comfortable', description: 'Balanced spacing' },
                  { value: 'spacious' as const, label: 'Spacious', description: 'More breathing room' }
                ].map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => saveSettings({ ...settings, layoutDensity: value })}
                    disabled={theme === 'light' && value !== 'comfortable'}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left ${
                      settings.layoutDensity === value
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
                        : theme === 'light' && value !== 'comfortable'
                          ? 'bg-slate-50 dark:bg-slate-700 opacity-50 cursor-not-allowed'
                          : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Enable Animations
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Smooth transitions and hover effects
                  </p>
                </div>
                <button
                  onClick={() => saveSettings({ ...settings, animationsEnabled: !settings.animationsEnabled })}
                  disabled={theme === 'light'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'light'
                      ? 'bg-blue-600 opacity-50 cursor-not-allowed'
                      : settings.animationsEnabled 
                        ? 'bg-blue-600' 
                        : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      (theme === 'light' || settings.animationsEnabled) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Reduce Motion
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Minimize animations for accessibility
                  </p>
                </div>
                <button
                  onClick={() => saveSettings({ ...settings, reducedMotion: !settings.reducedMotion })}
                  disabled={theme === 'light'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'light'
                      ? 'bg-slate-300 dark:bg-slate-600 opacity-50 cursor-not-allowed'
                      : settings.reducedMotion 
                        ? 'bg-blue-600' 
                        : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reducedMotion && theme !== 'light' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
          <Eye className="w-6 h-6" />
          <span>Preview</span>
        </h2>
        
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${
              theme === 'light' 
                ? 'from-blue-500 to-cyan-500' 
                : colorSchemes.find(s => s.id === settings.colorScheme)?.gradient
            } shadow-md`} />
            <div>
              <h3 className={`font-semibold text-slate-900 dark:text-white ${
                theme === 'light' 
                  ? 'text-lg' 
                  : settings.fontSize === 'small' 
                    ? 'text-base' 
                    : settings.fontSize === 'large' 
                      ? 'text-xl' 
                      : 'text-lg'
              }`}>
                Sample Card Title
              </h3>
              <p className={`text-slate-600 dark:text-slate-400 ${
                theme === 'light' 
                  ? 'text-sm' 
                  : settings.fontSize === 'small' 
                    ? 'text-sm' 
                    : settings.fontSize === 'large' 
                      ? 'text-base' 
                      : 'text-sm'
              }`}>
                This is how your content will look with the current settings
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className={`px-4 py-2 bg-gradient-to-r ${
              theme === 'light' 
                ? 'from-blue-500 to-cyan-500' 
                : colorSchemes.find(s => s.id === settings.colorScheme)?.gradient
            } text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg ${
              (theme !== 'light' && settings.animationsEnabled && !settings.reducedMotion) ? 'hover:-translate-y-0.5' : ''
            }`}>
              Primary Button
            </button>
            <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Secondary Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}