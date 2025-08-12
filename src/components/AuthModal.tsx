import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Building, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Toast, useToast } from './Toast';
import { SocialAuthButtons } from './SocialAuthButtons';
import { PhoneAuthForm } from './PhoneAuthForm';
import { SSOAuthForm } from './SSOAuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  onSuccess?: () => void;
}

type AuthMethod = 'email' | 'phone' | 'sso';

export function AuthModal({ isOpen, onClose, mode, onModeChange, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const { signIn, signUp, signInWithProvider } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        showToast('🎉 Account created! Check your email for confirmation.', 'success');
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        const { error } = await signIn(email, password, rememberMe);
        if (error) throw error;
        showToast('✅ Welcome back!', 'success');
        onSuccess?.();
      }
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      if (mode === 'signin' && errorMessage === 'Invalid login credentials') {
        errorMessage = 'Unable to sign in. Please check your email and password. If you recently signed up, make sure to confirm your email address first.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setLoading(true);
    try {
      const { error } = await signInWithProvider(provider, rememberMe);
      if (error) throw error;
      showToast(`✅ Successfully signed in with ${provider}!`, 'success');
      onSuccess?.();
    } catch (err) {
      showToast(`Failed to sign in with ${provider}. Please try again.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderAuthMethodTabs = () => (
    <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-6">
      <button
        onClick={() => setAuthMethod('email')}
        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          authMethod === 'email'
            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Mail className="w-4 h-4" />
        <span>Email</span>
      </button>
      <button
        onClick={() => setAuthMethod('phone')}
        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          authMethod === 'phone'
            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Phone className="w-4 h-4" />
        <span>Phone</span>
      </button>
      <button
        onClick={() => setAuthMethod('sso')}
        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          authMethod === 'sso'
            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Building className="w-4 h-4" />
        <span>SSO</span>
      </button>
    </div>
  );

  const renderEmailForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Enter your password"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Remember me</span>
        </label>
        {mode === 'signin' && (
          <button
            type="button"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Forgot password?
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
      >
        {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
      </button>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toast {...toast} onClose={hideToast} />
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Join NicheNode'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Social Authentication Buttons */}
        <SocialAuthButtons
          onSocialAuth={handleSocialAuth}
          loading={loading}
          rememberMe={rememberMe}
          mode={mode}
        />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Authentication Method Tabs */}
        {renderAuthMethodTabs()}

        {/* Authentication Forms */}
        {authMethod === 'email' && renderEmailForm()}
        {authMethod === 'phone' && (
          <PhoneAuthForm
            mode={mode}
            onSuccess={onSuccess}
            rememberMe={rememberMe}
            onRememberMeChange={setRememberMe}
          />
        )}
        {authMethod === 'sso' && (
          <SSOAuthForm
            mode={mode}
            onSuccess={onSuccess}
            rememberMe={rememberMe}
            onRememberMeChange={setRememberMe}
          />
        )}

        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
              className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}