import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Shield, HelpCircle, LogOut, ChevronDown, Bell, Palette } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserProfileDropdownProps {
  onNavigateToProfile: () => void;
  onSignOut: () => void;
}

export function UserProfileDropdown({ onNavigateToProfile, onSignOut }: UserProfileDropdownProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const menuItems = [
    {
      id: 'profile',
      icon: User,
      label: 'Profile Settings',
      action: () => {
        onNavigateToProfile();
        setIsOpen(false);
      }
    },
    {
      id: 'account',
      icon: Settings,
      label: 'Account Settings',
      action: () => {
        // Future implementation
        setIsOpen(false);
      }
    },
    {
      id: 'appearance',
      icon: Palette,
      label: 'Appearance',
      action: () => {
        // Future implementation
        setIsOpen(false);
      }
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      action: () => {
        // Future implementation
        setIsOpen(false);
      }
    },
    {
      id: 'privacy',
      icon: Shield,
      label: 'Privacy & Security',
      action: () => {
        // Future implementation
        setIsOpen(false);
      }
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {
        // Future implementation
        setIsOpen(false);
      }
    }
  ];

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;

        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev < menuItems.length ? prev + 1 : 0;
            return nextIndex;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : menuItems.length;
            return nextIndex;
          });
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex === menuItems.length) {
            // Sign out option
            onSignOut();
            setIsOpen(false);
          } else if (focusedIndex >= 0 && focusedIndex < menuItems.length) {
            menuItems[focusedIndex].action();
          }
          break;

        case 'Tab':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, focusedIndex, menuItems, onSignOut]);

  // Early return after all hooks have been declared
  if (!user) return null;

  const userInitials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || 'U';

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
  };

  const profileCompletion = 67; // This would be calculated based on actual profile data

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Avatar Button */}
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="User menu"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <div className="relative">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors duration-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 hover:shadow-md">
                {userInitials}
              </div>
            )}
            
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
          </div>
          
          <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-end p-4 pt-20"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isOpen ? 'opacity-30' : 'opacity-0'
            }`}
          />

          {/* Modal Content */}
          <div
            className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm transform transition-all duration-300 ease-out ${
              isOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Info Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-4 mb-4">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-2 border-slate-200 dark:border-slate-600">
                    {userInitials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 id="profile-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {user.user_metadata?.full_name || 'User'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Profile Status Card */}
              <button
                onClick={() => {
                  onNavigateToProfile();
                  setIsOpen(false);
                }}
                className="w-full p-4 bg-gradient-to-br from-slate-700 to-slate-600 dark:from-slate-600 dark:to-slate-700 rounded-xl hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Profile Status</span>
                  <User className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">
                    {profileCompletion >= 80 ? 'Complete' : 
                     profileCompletion >= 50 ? 'Good' : 'Pending'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-slate-500 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          profileCompletion >= 80 ? 'bg-green-500' :
                          profileCompletion >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-300 font-medium">{profileCompletion}%</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4">
              <div className="space-y-1">
                {menuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group
                      ${focusedIndex === index 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                    `}
                    role="menuitem"
                    tabIndex={-1}
                  >
                    <item.icon className={`w-5 h-5 transition-colors ${
                      focusedIndex === index 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

              {/* Sign Out */}
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group
                  ${focusedIndex === menuItems.length 
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-sm' 
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }
                `}
                role="menuitem"
                tabIndex={-1}
              >
                <LogOut className={`w-5 h-5 transition-colors ${
                  focusedIndex === menuItems.length 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300'
                }`} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}