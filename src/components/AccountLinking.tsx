import React, { useState } from 'react';
import { Link, Unlink, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './Toast';

interface AccountLinkingProps {
  onClose: () => void;
}

interface LinkedAccount {
  provider: string;
  email?: string;
  linkedAt: string;
  isActive: boolean;
}

export function AccountLinking({ onClose }: AccountLinkingProps) {
  const { user, linkAccount, unlinkAccount } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Mock linked accounts data - in real app, this would come from user metadata
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([
    {
      provider: 'google',
      email: 'user@gmail.com',
      linkedAt: '2024-01-15',
      isActive: true
    },
    {
      provider: 'linkedin',
      email: 'user@company.com',
      linkedAt: '2024-01-10',
      isActive: true
    }
  ]);

  const availableProviders = [
    { id: 'google', name: 'Google', icon: '🔵' },
    { id: 'facebook', name: 'Facebook', icon: '🔷' },
    { id: 'apple', name: 'Apple', icon: '🍎' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'github', name: 'GitHub', icon: '🐙' }
  ];

  const handleLinkAccount = async (provider: string) => {
    setLoading(provider);
    try {
      const { error } = await linkAccount(provider);
      if (error) throw error;

      // Update linked accounts
      setLinkedAccounts(prev => [...prev, {
        provider,
        email: `user@${provider}.com`,
        linkedAt: new Date().toISOString().split('T')[0],
        isActive: true
      }]);

      showToast(`✅ Successfully linked ${provider} account!`, 'success');
    } catch (error) {
      showToast(`Failed to link ${provider} account. Please try again.`, 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleUnlinkAccount = async (provider: string) => {
    if (linkedAccounts.length <= 1) {
      showToast('Cannot unlink the last authentication method.', 'warning');
      return;
    }

    setLoading(provider);
    try {
      const { error } = await unlinkAccount(provider);
      if (error) throw error;

      // Update linked accounts
      setLinkedAccounts(prev => prev.filter(account => account.provider !== provider));

      showToast(`✅ Successfully unlinked ${provider} account!`, 'success');
    } catch (error) {
      showToast(`Failed to unlink ${provider} account. Please try again.`, 'error');
    } finally {
      setLoading(null);
    }
  };

  const isLinked = (provider: string) => {
    return linkedAccounts.some(account => account.provider === provider);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Link className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Account Linking
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your connected authentication methods
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Enhanced Security
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Linking multiple accounts provides backup authentication methods and improved security.
                You can use any linked method to sign in to your account.
              </p>
            </div>
          </div>
        </div>

        {/* Linked Accounts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Linked Accounts ({linkedAccounts.length})
          </h3>
          
          {linkedAccounts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No accounts linked yet
            </div>
          ) : (
            <div className="space-y-3">
              {linkedAccounts.map((account) => {
                const provider = availableProviders.find(p => p.id === account.provider);
                return (
                  <div
                    key={account.provider}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{provider?.icon}</span>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {provider?.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {account.email} • Linked {account.linkedAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                      <button
                        onClick={() => handleUnlinkAccount(account.provider)}
                        disabled={loading === account.provider || linkedAccounts.length <= 1}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title={linkedAccounts.length <= 1 ? "Cannot unlink the last authentication method" : "Unlink account"}
                      >
                        {loading === account.provider ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Unlink className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Providers */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Link Additional Accounts
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableProviders
              .filter(provider => !isLinked(provider.id))
              .map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleLinkAccount(provider.id)}
                  disabled={loading === provider.id}
                  className="flex items-center space-x-3 p-4 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <span className="text-2xl">{provider.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-900 dark:text-white">
                      Link {provider.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Add {provider.name} as a sign-in option
                    </div>
                  </div>
                  {loading === provider.id && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              ))}
          </div>

          {availableProviders.filter(provider => !isLinked(provider.id)).length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              All available authentication methods are already linked
            </div>
          )}
        </div>

        {/* Warning */}
        {linkedAccounts.length === 1 && (
          <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Single Authentication Method
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Consider linking additional accounts for backup access. If you lose access to your current method, you won't be able to sign in.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}