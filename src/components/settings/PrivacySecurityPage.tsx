import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Smartphone, Key, AlertTriangle, Activity, Globe, Users } from 'lucide-react';
import { Toast, useToast } from '../Toast';

interface PrivacySecurityPageProps {
  onBack: () => void;
}

interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    method: 'sms' | 'app' | 'email';
    backupCodes: string[];
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'experts_only';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowDirectMessages: boolean;
  };
  dataSharing: {
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
    research: boolean;
  };
  security: {
    loginAlerts: boolean;
    deviceTracking: boolean;
    sessionTimeout: number;
    passwordExpiry: boolean;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  location: string;
  device: string;
  status: 'success' | 'failed' | 'suspicious';
}

export function PrivacySecurityPage({ onBack }: PrivacySecurityPageProps) {
  const { toast, showToast, hideToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'security' | 'privacy' | 'data' | 'activity'>('security');
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorAuth: {
      enabled: false,
      method: 'app',
      backupCodes: []
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      allowDirectMessages: true
    },
    dataSharing: {
      analytics: true,
      marketing: false,
      thirdParty: false,
      research: false
    },
    security: {
      loginAlerts: true,
      deviceTracking: true,
      sessionTimeout: 30,
      passwordExpiry: false
    }
  });

  const [activityLog] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Login',
      timestamp: '2024-01-15 14:30:00',
      location: 'New York, NY',
      device: 'Chrome on Windows',
      status: 'success'
    },
    {
      id: '2',
      action: 'Password Change',
      timestamp: '2024-01-14 09:15:00',
      location: 'New York, NY',
      device: 'Chrome on Windows',
      status: 'success'
    },
    {
      id: '3',
      action: 'Failed Login Attempt',
      timestamp: '2024-01-13 22:45:00',
      location: 'Unknown Location',
      device: 'Unknown Device',
      status: 'failed'
    },
    {
      id: '4',
      action: 'Profile Update',
      timestamp: '2024-01-12 16:20:00',
      location: 'New York, NY',
      device: 'Safari on iPhone',
      status: 'success'
    }
  ]);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('privacySecuritySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = (newSettings: SecuritySettings) => {
    setSettings(newSettings);
    localStorage.setItem('privacySecuritySettings', JSON.stringify(newSettings));
    showToast('Settings saved successfully!', 'success');
  };

  const enable2FA = () => {
    const newSettings = {
      ...settings,
      twoFactorAuth: {
        ...settings.twoFactorAuth,
        enabled: true,
        backupCodes: generateBackupCodes()
      }
    };
    saveSettings(newSettings);
    showToast('Two-factor authentication enabled!', 'success');
  };

  const disable2FA = () => {
    const newSettings = {
      ...settings,
      twoFactorAuth: {
        ...settings.twoFactorAuth,
        enabled: false,
        backupCodes: []
      }
    };
    saveSettings(newSettings);
    showToast('Two-factor authentication disabled!', 'warning');
  };

  const generateBackupCodes = (): string[] => {
    return Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
  };

  const tabs = [
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'privacy' as const, label: 'Privacy', icon: Eye },
    { id: 'data' as const, label: 'Data Sharing', icon: Globe },
    { id: 'activity' as const, label: 'Activity Log', icon: Activity }
  ];

  return (
    <div className="space-y-8">
      <Toast {...toast} onClose={hideToast} />
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-6 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
          Privacy & Security
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Protect your account and control your privacy settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        {activeTab === 'security' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">Security Settings</h2>
            
            {/* Two-Factor Authentication */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Two-Factor Authentication</h3>
                    <p className="text-blue-700 dark:text-blue-200">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  settings.twoFactorAuth.enabled 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {settings.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {!settings.twoFactorAuth.enabled ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Choose Authentication Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { value: 'app', label: 'Authenticator App', description: 'Google Authenticator, Authy' },
                        { value: 'sms', label: 'SMS', description: 'Text message to phone' },
                        { value: 'email', label: 'Email', description: 'Code sent to email' }
                      ].map(({ value, label, description }) => (
                        <button
                          key={value}
                          onClick={() => setSettings({
                            ...settings,
                            twoFactorAuth: { ...settings.twoFactorAuth, method: value as any }
                          })}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                            settings.twoFactorAuth.method === value
                              ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                              : 'border-slate-200 dark:border-slate-600 hover:border-blue-300'
                          }`}
                        >
                          <div className="font-medium text-slate-900 dark:text-white">{label}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={enable2FA}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Enable Two-Factor Authentication
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <Key className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Protected with {settings.twoFactorAuth.method === 'app' ? 'Authenticator App' : 
                                     settings.twoFactorAuth.method === 'sms' ? 'SMS' : 'Email'}
                    </span>
                  </div>
                  
                  {settings.twoFactorAuth.backupCodes.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Backup Codes</h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Save these codes in a safe place. You can use them to access your account if you lose your device.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm font-mono">
                        {settings.twoFactorAuth.backupCodes.map((code, index) => (
                          <div key={index} className="bg-white dark:bg-slate-700 p-2 rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={disable2FA}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Disable Two-Factor Authentication
                  </button>
                </div>
              )}
            </div>

            {/* Security Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security Preferences</h3>
              
              {[
                {
                  key: 'loginAlerts' as const,
                  label: 'Login Alerts',
                  description: 'Get notified when someone logs into your account',
                  icon: AlertTriangle
                },
                {
                  key: 'deviceTracking' as const,
                  label: 'Device Tracking',
                  description: 'Track devices that access your account',
                  icon: Smartphone
                },
                {
                  key: 'passwordExpiry' as const,
                  label: 'Password Expiry',
                  description: 'Require password changes every 90 days',
                  icon: Lock
                }
              ].map(({ key, label, description, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{label}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveSettings({
                      ...settings,
                      security: { ...settings.security, [key]: !settings.security[key] }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.security[key] ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.security[key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Session Timeout</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Automatically log out after inactivity</div>
                  </div>
                </div>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => saveSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                  })}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">Privacy Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Visibility</h3>
                <div className="space-y-3">
                  {[
                    { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
                    { value: 'experts_only', label: 'Experts Only', description: 'Only verified experts can view your profile' },
                    { value: 'private', label: 'Private', description: 'Only you can view your profile' }
                  ].map(({ value, label, description }) => (
                    <button
                      key={value}
                      onClick={() => saveSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: value as any }
                      })}
                      className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 text-left ${
                        settings.privacy.profileVisibility === value
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
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

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Information Visibility</h3>
                <div className="space-y-4">
                  {[
                    { key: 'showEmail' as const, label: 'Show Email Address', description: 'Display your email on your profile' },
                    { key: 'showPhone' as const, label: 'Show Phone Number', description: 'Display your phone number on your profile' },
                    { key: 'showLocation' as const, label: 'Show Location', description: 'Display your location on your profile' },
                    { key: 'allowDirectMessages' as const, label: 'Allow Direct Messages', description: 'Let others send you direct messages' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{label}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
                      </div>
                      <button
                        onClick={() => saveSettings({
                          ...settings,
                          privacy: { ...settings.privacy, [key]: !settings.privacy[key] }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.privacy[key] ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.privacy[key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">Data Sharing Preferences</h2>
            
            <div className="space-y-4">
              {[
                {
                  key: 'analytics' as const,
                  label: 'Analytics Data',
                  description: 'Help improve our service by sharing anonymous usage data',
                  icon: Activity
                },
                {
                  key: 'marketing' as const,
                  label: 'Marketing Communications',
                  description: 'Receive personalized offers and product updates',
                  icon: Users
                },
                {
                  key: 'thirdParty' as const,
                  label: 'Third-Party Integrations',
                  description: 'Allow data sharing with trusted partner services',
                  icon: Globe
                },
                {
                  key: 'research' as const,
                  label: 'Research & Development',
                  description: 'Participate in research to improve platform features',
                  icon: Eye
                }
              ].map(({ key, label, description, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{label}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveSettings({
                      ...settings,
                      dataSharing: { ...settings.dataSharing, [key]: !settings.dataSharing[key] }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.dataSharing[key] ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.dataSharing[key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Data Protection</h3>
              <div className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                <p>• Your personal data is encrypted and stored securely</p>
                <p>• We never sell your personal information to third parties</p>
                <p>• You can request data deletion at any time</p>
                <p>• All data sharing is optional and can be disabled</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">Account Activity Log</h2>
            
            <div className="space-y-4">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{activity.action}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {activity.location} • {activity.device}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Security Notice</h3>
              </div>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                If you notice any suspicious activity, please change your password immediately and contact our support team.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}