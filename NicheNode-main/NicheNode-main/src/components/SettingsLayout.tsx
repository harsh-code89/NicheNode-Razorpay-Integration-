import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Palette, Bell, Shield, HelpCircle, User, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AccountSettingsPage } from './settings/AccountSettingsPage';
import { AppearanceSettingsPage } from './settings/AppearanceSettingsPage';
import { NotificationsSettingsPage } from './settings/NotificationsSettingsPage';
import { PrivacySecurityPage } from './settings/PrivacySecurityPage';
import { HelpSupportPage } from './settings/HelpSupportPage';

interface SettingsLayoutProps {
  isOpen: boolean;
  onBack: () => void;
  onClose: () => void;
}

type SettingsPage = 'overview' | 'account' | 'appearance' | 'notifications' | 'privacy' | 'help';

export function SettingsLayout({ isOpen, onBack, onClose }: SettingsLayoutProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<SettingsPage>('overview');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (newTheme === 'light') {
      // Force light mode - remove dark class and reset all custom styles
      root.classList.remove('dark');
      
      // Reset all appearance settings to defaults for light mode
      root.classList.remove('text-sm', 'text-lg');
      root.classList.add('text-base');
      
      root.classList.remove('density-compact', 'density-spacious');
      root.classList.add('density-comfortable');
      
      root.classList.remove('reduce-motion');
      
      root.classList.remove('scheme-purple', 'scheme-green', 'scheme-orange', 'scheme-pink');
      root.classList.add('scheme-blue');
      
      // Reset appearance settings in localStorage
      const defaultSettings = {
        fontSize: 'medium',
        layoutDensity: 'comfortable',
        animationsEnabled: true,
        colorScheme: 'blue',
        reducedMotion: false
      };
      localStorage.setItem('appearanceSettings', JSON.stringify(defaultSettings));
      
    } else if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemPrefersDark);
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  const navigationItems = [
    {
      id: 'account' as const,
      label: 'Account Settings',
      icon: User,
      description: 'Manage your profile and account preferences',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'appearance' as const,
      label: 'Appearance',
      icon: Palette,
      description: 'Customize theme, colors, and layout',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      icon: Bell,
      description: 'Configure notification preferences',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'privacy' as const,
      label: 'Privacy & Security',
      icon: Shield,
      description: 'Manage privacy settings and security',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'help' as const,
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Get help and contact support',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'account':
        return <AccountSettingsPage onBack={() => setCurrentPage('overview')} />;
      case 'appearance':
        return <AppearanceSettingsPage onBack={() => setCurrentPage('overview')} theme={theme} onThemeChange={handleThemeChange} />;
      case 'notifications':
        return <NotificationsSettingsPage onBack={() => setCurrentPage('overview')} />;
      case 'privacy':
        return <PrivacySecurityPage onBack={() => setCurrentPage('overview')} />;
      case 'help':
        return <HelpSupportPage onBack={() => setCurrentPage('overview')} />;
      default:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                Settings
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Customize your experience and manage your account preferences
              </p>
            </div>

            {/* Quick Theme Toggle */}
            <div className="flex justify-center">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex space-x-1">
                  {[
                    { value: 'light' as const, icon: Sun, label: 'Light' },
                    { value: 'dark' as const, icon: Moon, label: 'Dark' },
                    { value: 'system' as const, icon: Monitor, label: 'System' }
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => handleThemeChange(value)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        theme === value
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Light Mode Notice */}
            {theme === 'light' && (
              <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Sun className="w-5 h-5" />
                  <span className="font-medium">Light Mode Active</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  You're using light mode with default white theme and optimal contrast ratios. All custom appearance settings have been reset to defaults.
                </p>
              </div>
            )}

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                </button>
              ))}
            </div>

            {/* User Info Card */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {user?.user_metadata?.full_name || 'User'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">{user?.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={currentPage === 'overview' ? onClose : () => setCurrentPage('overview')}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>{currentPage === 'overview' ? 'Close Settings' : 'Back to Settings'}</span>
        </button>

        {/* Content */}
        <div className="transition-all duration-300">
          {renderCurrentPage()}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}