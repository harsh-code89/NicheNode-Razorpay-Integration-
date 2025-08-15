import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Volume2, Clock, Shield, Zap, MessageSquare, Star, Calendar } from 'lucide-react';
import { Toast, useToast } from '../Toast';

interface NotificationsSettingsPageProps {
  onBack: () => void;
}

interface NotificationSettings {
  email: {
    consultations: boolean;
    messages: boolean;
    reviews: boolean;
    marketing: boolean;
    security: boolean;
  };
  push: {
    enabled: boolean;
    consultations: boolean;
    messages: boolean;
    reviews: boolean;
    reminders: boolean;
  };
  sound: {
    enabled: boolean;
    volume: number;
    tone: 'default' | 'chime' | 'bell' | 'notification';
  };
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    weekendsOnly: boolean;
  };
  priority: {
    urgent: boolean;
    important: boolean;
    normal: boolean;
  };
}

export function NotificationsSettingsPage({ onBack }: NotificationsSettingsPageProps) {
  const { toast, showToast, hideToast } = useToast();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      consultations: true,
      messages: true,
      reviews: true,
      marketing: false,
      security: true
    },
    push: {
      enabled: true,
      consultations: true,
      messages: true,
      reviews: false,
      reminders: true
    },
    sound: {
      enabled: true,
      volume: 70,
      tone: 'default'
    },
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      weekendsOnly: false
    },
    priority: {
      urgent: true,
      important: true,
      normal: true
    }
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    showToast('Notification settings saved!', 'success');
  };

  const updateEmailSettings = (key: keyof NotificationSettings['email'], value: boolean) => {
    const newSettings = {
      ...settings,
      email: { ...settings.email, [key]: value }
    };
    saveSettings(newSettings);
  };

  const updatePushSettings = (key: keyof NotificationSettings['push'], value: boolean) => {
    const newSettings = {
      ...settings,
      push: { ...settings.push, [key]: value }
    };
    saveSettings(newSettings);
  };

  const updateSoundSettings = (updates: Partial<NotificationSettings['sound']>) => {
    const newSettings = {
      ...settings,
      sound: { ...settings.sound, ...updates }
    };
    saveSettings(newSettings);
  };

  const updateDoNotDisturbSettings = (updates: Partial<NotificationSettings['doNotDisturb']>) => {
    const newSettings = {
      ...settings,
      doNotDisturb: { ...settings.doNotDisturb, ...updates }
    };
    saveSettings(newSettings);
  };

  const updatePrioritySettings = (key: keyof NotificationSettings['priority'], value: boolean) => {
    const newSettings = {
      ...settings,
      priority: { ...settings.priority, [key]: value }
    };
    saveSettings(newSettings);
  };

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is how notifications will appear on your device.',
          icon: '/favicon.ico'
        });
        showToast('Test notification sent!', 'success');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Test Notification', {
              body: 'This is how notifications will appear on your device.',
              icon: '/favicon.ico'
            });
            showToast('Test notification sent!', 'success');
          }
        });
      } else {
        showToast('Notifications are blocked. Please enable them in your browser settings.', 'warning');
      }
    } else {
      showToast('Notifications are not supported in this browser.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <Toast {...toast} onClose={hideToast} />
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6 shadow-lg">
          <Bell className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
          Notification Settings
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Manage how and when you receive notifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Email Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
            <Mail className="w-6 h-6" />
            <span>Email Notifications</span>
          </h2>
          
          <div className="space-y-4">
            {[
              { key: 'consultations' as const, label: 'New Consultations', description: 'When someone requests a consultation', icon: MessageSquare },
              { key: 'messages' as const, label: 'Messages', description: 'Direct messages and updates', icon: Mail },
              { key: 'reviews' as const, label: 'Reviews & Ratings', description: 'When you receive a new review', icon: Star },
              { key: 'marketing' as const, label: 'Marketing & Updates', description: 'Product updates and promotions', icon: Zap },
              { key: 'security' as const, label: 'Security Alerts', description: 'Login attempts and security notices', icon: Shield }
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
                  onClick={() => updateEmailSettings(key, !settings.email[key])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.email[key] ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.email[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
            <Smartphone className="w-6 h-6" />
            <span>Push Notifications</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">Enable Push Notifications</div>
                  <div className="text-sm text-blue-700 dark:text-blue-200">Master toggle for all push notifications</div>
                </div>
              </div>
              <button
                onClick={() => updatePushSettings('enabled', !settings.push.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.push.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.push.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.push.enabled && (
              <>
                {[
                  { key: 'consultations' as const, label: 'Consultation Updates', description: 'Status changes and new requests', icon: MessageSquare },
                  { key: 'messages' as const, label: 'Direct Messages', description: 'New messages from clients/experts', icon: Mail },
                  { key: 'reviews' as const, label: 'Review Notifications', description: 'New reviews and ratings', icon: Star },
                  { key: 'reminders' as const, label: 'Reminders', description: 'Upcoming consultations and deadlines', icon: Calendar }
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
                      onClick={() => updatePushSettings(key, !settings.push[key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.push[key] ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.push[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <button
                  onClick={testNotification}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Test Notification</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sound Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
            <Volume2 className="w-6 h-6" />
            <span>Sound Settings</span>
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Enable Sounds</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Play sounds for notifications</div>
              </div>
              <button
                onClick={() => updateSoundSettings({ enabled: !settings.sound.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.sound.enabled ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.sound.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.sound.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Volume: {settings.sound.volume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sound.volume}
                    onChange={(e) => updateSoundSettings({ volume: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Notification Tone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'default', label: 'Default' },
                      { value: 'chime', label: 'Chime' },
                      { value: 'bell', label: 'Bell' },
                      { value: 'notification', label: 'Notification' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateSoundSettings({ tone: value as any })}
                        className={`p-3 rounded-lg transition-all duration-200 ${
                          settings.sound.tone === value
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
                            : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Do Not Disturb */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
            <Clock className="w-6 h-6" />
            <span>Do Not Disturb</span>
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Enable Do Not Disturb</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Silence notifications during specified hours</div>
              </div>
              <button
                onClick={() => updateDoNotDisturbSettings({ enabled: !settings.doNotDisturb.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.doNotDisturb.enabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.doNotDisturb.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.doNotDisturb.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={settings.doNotDisturb.startTime}
                      onChange={(e) => updateDoNotDisturbSettings({ startTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={settings.doNotDisturb.endTime}
                      onChange={(e) => updateDoNotDisturbSettings({ endTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Weekends Only</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Apply only on weekends</div>
                  </div>
                  <button
                    onClick={() => updateDoNotDisturbSettings({ weekendsOnly: !settings.doNotDisturb.weekendsOnly })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.doNotDisturb.weekendsOnly ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.doNotDisturb.weekendsOnly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Priority Levels */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-3">
          <Shield className="w-6 h-6" />
          <span>Priority Levels</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'urgent' as const, label: 'Urgent', description: 'Critical notifications that require immediate attention', color: 'red' },
            { key: 'important' as const, label: 'Important', description: 'High-priority notifications that should be seen soon', color: 'orange' },
            { key: 'normal' as const, label: 'Normal', description: 'Regular notifications and updates', color: 'blue' }
          ].map(({ key, label, description, color }) => (
            <div key={key} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              settings.priority[key] 
                ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20` 
                : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${
                  settings.priority[key] 
                    ? `text-${color}-900 dark:text-${color}-100` 
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {label}
                </h3>
                <button
                  onClick={() => updatePrioritySettings(key, !settings.priority[key])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.priority[key] ? `bg-${color}-600` : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.priority[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className={`text-sm ${
                settings.priority[key] 
                  ? `text-${color}-700 dark:text-${color}-200` 
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}