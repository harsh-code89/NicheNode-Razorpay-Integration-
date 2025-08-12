import React from 'react';
import { X, Lock, UserPlus, LogIn } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  onLogIn: () => void;
}

export function AuthRequiredModal({ isOpen, onClose, onSignUp, onLogIn }: AuthRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Authentication Required</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-8">
          <p className="text-slate-600 text-lg mb-4">
            Please sign up or log in to access this feature
          </p>
          <p className="text-slate-500 text-sm">
            Create an account to connect with experts, request consultations, and access all platform features.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onSignUp}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Sign Up</span>
          </button>
          
          <button
            onClick={onLogIn}
            className="w-full px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Log In</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}