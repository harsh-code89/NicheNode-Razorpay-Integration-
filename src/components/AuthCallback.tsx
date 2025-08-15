import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './Toast';

export function AuthCallback() {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    // Handle OAuth callback
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (error) {
        showToast(`Authentication failed: ${errorDescription || error}`, 'error');
        // Redirect to login page
        window.location.href = '/';
        return;
      }

      if (user) {
        showToast('✅ Successfully authenticated!', 'success');
        // Redirect to dashboard or intended page
        const returnTo = localStorage.getItem('auth_return_to') || '/dashboard';
        localStorage.removeItem('auth_return_to');
        window.location.href = returnTo;
      }
    };

    handleAuthCallback();
  }, [user, showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Completing authentication...</p>
      </div>
    </div>
  );
}