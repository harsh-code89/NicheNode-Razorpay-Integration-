import React, { useState } from 'react';
import { Building, Globe, Shield, ChevronDown } from 'lucide-react';
import { useToast } from './Toast';

interface SSOAuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
}

export function SSOAuthForm({ mode, onSuccess, rememberMe, onRememberMeChange }: SSOAuthFormProps) {
  const [domain, setDomain] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const { showToast } = useToast();

  const ssoProviders = [
    { id: 'okta', name: 'Okta', logo: '🔐' },
    { id: 'azure', name: 'Microsoft Azure AD', logo: '🔷' },
    { id: 'google-workspace', name: 'Google Workspace', logo: '🔵' },
    { id: 'auth0', name: 'Auth0', logo: '🔒' },
    { id: 'onelogin', name: 'OneLogin', logo: '🔑' },
    { id: 'ping', name: 'PingIdentity', logo: '📡' },
    { id: 'saml', name: 'Generic SAML', logo: '🛡️' },
    { id: 'oidc', name: 'Generic OIDC', logo: '🔐' }
  ];

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate domain lookup for SSO provider
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock domain recognition
      const mockProviders = ['okta', 'azure', 'google-workspace'];
      const detectedProvider = mockProviders[Math.floor(Math.random() * mockProviders.length)];
      
      setSelectedProvider(detectedProvider);
      showToast(`🔍 Detected SSO provider for ${domain}`, 'success');
      setShowProviders(true);
    } catch (error) {
      showToast('Could not detect SSO provider for this domain.', 'error');
      setShowProviders(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (providerId: string) => {
    setLoading(true);
    
    try {
      // Simulate SSO redirect and authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const provider = ssoProviders.find(p => p.id === providerId);
      showToast(`✅ Successfully authenticated with ${provider?.name}!`, 'success');
      onSuccess?.();
    } catch (error) {
      showToast('SSO authentication failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showProviders) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Choose Your SSO Provider
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Select your organization's identity provider
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {ssoProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleSSOLogin(provider.id)}
              disabled={loading}
              className={`flex items-center space-x-3 p-4 border rounded-lg transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 ${
                selectedProvider === provider.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              <span className="text-2xl">{provider.logo}</span>
              <div className="flex-1 text-left">
                <div className="font-medium text-slate-900 dark:text-white">
                  {provider.name}
                </div>
                {selectedProvider === provider.id && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Detected for {domain}
                  </div>
                )}
              </div>
              {loading && selectedProvider === provider.id && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="sso-remember"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="sso-remember" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
            Remember this SSO session
          </label>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowProviders(false);
            setSelectedProvider('');
            setDomain('');
          }}
          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          ← Try a different domain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleDomainSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Company Domain
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="company.com"
            required
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your organization's domain to find your SSO provider
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Enterprise Single Sign-On
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Use your organization's existing identity provider for secure, seamless authentication.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !domain.trim()}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
      >
        {loading ? 'Detecting Provider...' : 'Find SSO Provider'}
      </button>

      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Don't see your provider? Contact your IT administrator for SSO setup assistance.
        </p>
      </div>
    </form>
  );
}