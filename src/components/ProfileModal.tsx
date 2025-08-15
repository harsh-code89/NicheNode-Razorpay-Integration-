import React, { useEffect, useRef } from 'react';
import { X, User, Settings, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile: () => void;
  onSignOut: () => void;
}

export function ProfileModal({ isOpen, onClose, onNavigateToProfile, onSignOut }: ProfileModalProps) {
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Focus the modal
      modalRef.current?.focus();
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Focus trap within modal
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  };

  if (!isOpen || !user) return null;

  const userInitials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || 'U';

  const profileCompletion = 67; // This would be calculated based on actual profile data

  const menuItems = [
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      action: () => {
        console.log('Navigate to notifications');
        onClose();
      }
    },
    {
      id: 'privacy',
      icon: Shield,
      label: 'Privacy & Security',
      action: () => {
        console.log('Navigate to privacy settings');
        onClose();
      }
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {
        console.log('Navigate to help');
        onClose();
      }
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm transform transition-all duration-300 ease-out ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 id="profile-modal-title" className="text-xl font-semibold text-slate-900 dark:text-white">
            Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
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
              onClose();
            }}
            className="w-full p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Profile Status</span>
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {profileCompletion >= 80 ? 'Complete' : 
                 profileCompletion >= 50 ? 'Good' : 'Pending'}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      profileCompletion >= 80 ? 'bg-green-500' :
                      profileCompletion >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{profileCompletion}%</span>
              </div>
            </div>
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150 group"
              >
                <item.icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
                <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

          {/* Sign Out */}
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 group"
          >
            <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600" />
            <span className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}