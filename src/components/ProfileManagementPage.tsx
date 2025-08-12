import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Camera, Globe, MapPin, Phone, Mail, Bell, Shield, Settings, Save, Upload, Loader, CheckCircle, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Toast, useToast } from './Toast';
import { ExternalLinkButton, ExternalDocumentationButton, ExternalHelpButton } from './ExternalLinkButton';

interface ProfileManagementPageProps {
  onBack: () => void;
}

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  is_expert: boolean;
}

interface NotificationSettings {
  email_consultations: boolean;
  email_messages: boolean;
  email_marketing: boolean;
  push_notifications: boolean;
}

interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'experts_only';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
}

export function ProfileManagementPage({ onBack }: ProfileManagementPageProps) {
  const { user, signOut } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  
  const [activeSection, setActiveSection] = useState<'personal' | 'contact' | 'photo' | 'preferences' | 'account' | 'privacy' | 'notifications'>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    linkedin: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_consultations: true,
    email_messages: true,
    email_marketing: false,
    push_notifications: true
  });
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    show_location: true
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile data', 'error');
        return;
      }

      setProfileData(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        website: data.website || '',
        linkedin: data.linkedin || ''
      });
    } catch (err) {
      console.error('Profile loading error:', err);
      showToast('Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    if (!profileData) return 0;

    const fields = [
      profileData.full_name,
      profileData.avatar_url,
      profileData.phone,
      profileData.location,
      profileData.bio,
      profileData.website || profileData.linkedin
    ];

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleProfileClick = () => {
    console.log('Profile status clicked, navigating to profile-management');
    onNavigate('profile-management');
  };

  // Validate URL format
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URLs are allowed
    
    try {
      const validUrl = new URL(url);
      return ['https:', 'http:'].includes(validUrl.protocol);
    } catch {
      return false;
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    try {
      const photoUrl = await uploadPhoto(file);
      if (!photoUrl) {
        throw new Error('Failed to get photo URL');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: photoUrl })
        .eq('id', user.id);

      if (error) {
        throw new Error(`Database update failed: ${error.message}`);
      }

      setProfileData(prev => prev ? { ...prev, avatar_url: photoUrl } : null);
      showToast('Profile photo updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating photo:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to update photo',
        'error'
      );
    }
  };

  const handleSave = async (section: string) => {
    if (!user) return;

    // Validate URLs before saving
    if (section === 'contact') {
      if (formData.website && !validateUrl(formData.website)) {
        showToast('Please enter a valid website URL (must start with http:// or https://)', 'error');
        return;
      }
      if (formData.linkedin && !validateUrl(formData.linkedin)) {
        showToast('Please enter a valid LinkedIn URL (must start with http:// or https://)', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      let updateData: Partial<ProfileData> = {};

      switch (section) {
        case 'personal':
          updateData = {
            full_name: formData.full_name.trim() || null,
            bio: formData.bio.trim() || null
          };
          break;
        case 'contact':
          updateData = {
            phone: formData.phone.trim() || null,
            location: formData.location.trim() || null,
            website: formData.website.trim() || null,
            linkedin: formData.linkedin.trim() || null
          };
          break;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw new Error(`Update failed: ${error.message}`);
      }

      setProfileData(prev => prev ? { ...prev, ...updateData } : null);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to save changes',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real app, you'd call a secure endpoint to handle account deletion
      showToast('Account deletion requested. Please contact support to complete the process.', 'info');
    } catch (error) {
      showToast('Failed to delete account. Please contact support.', 'error');
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Professional Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Tell others about your professional background, expertise, and what makes you unique..."
                maxLength={500}
              />
              <p className="text-sm text-slate-500 mt-2">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <button
              onClick={() => handleSave('personal')}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileData?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Email address cannot be changed for security reasons
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.website && !validateUrl(formData.website) 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-slate-300'
                }`}
                placeholder="https://yourwebsite.com"
              />
              {formData.website && !validateUrl(formData.website) && (
                <p className="text-sm text-red-600 mt-1">
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
              {formData.website && validateUrl(formData.website) && (
                <div className="mt-2">
                  <ExternalLinkButton
                    href={formData.website}
                    variant="link"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 p-0 border-0 bg-transparent shadow-none"
                  >
                    Test link
                  </ExternalLinkButton>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.linkedin && !validateUrl(formData.linkedin) 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-slate-300'
                }`}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              {formData.linkedin && !validateUrl(formData.linkedin) && (
                <p className="text-sm text-red-600 mt-1">
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
              {formData.linkedin && validateUrl(formData.linkedin) && (
                <div className="mt-2">
                  <ExternalLinkButton
                    href={formData.linkedin}
                    variant="link"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 p-0 border-0 bg-transparent shadow-none"
                  >
                    Test link
                  </ExternalLinkButton>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSave('contact')}
              disabled={saving || (formData.website && !validateUrl(formData.website)) || (formData.linkedin && !validateUrl(formData.linkedin))}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-6">
                {profileData?.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-slate-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center mx-auto">
                    <User className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />

              <label
                htmlFor="photo-upload"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2 mx-auto cursor-pointer inline-flex"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{profileData?.avatar_url ? 'Change Photo' : 'Upload Photo'}</span>
                  </>
                )}
              </label>

              <p className="text-sm text-slate-500 mt-3">
                Recommended: Square image, at least 400x400 pixels, max 5MB
              </p>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Account Information</h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-700">Account ID:</span>
                  <span className="text-sm text-slate-600">{user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-700">Member Since:</span>
                  <span className="text-sm text-slate-600">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-700">Account Type:</span>
                  <span className="text-sm text-slate-600">
                    {profileData?.is_expert ? 'Expert' : 'Client'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Password & Security</h3>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-left">
                  Change Password
                </button>
                <button className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-left">
                  Enable Two-Factor Authentication
                </button>
                <button className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-left">
                  Download Account Data
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">External Resources</h3>
              <div className="space-y-3">
                <ExternalDocumentationButton
                  href="https://help.nichenode.com/account-security"
                  className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-left justify-between"
                >
                  Account Security Guide
                </ExternalDocumentationButton>
                <ExternalLinkButton
                  href="https://nichenode.com/privacy"
                  variant="outline"
                  className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-left justify-between"
                >
                  Privacy Policy
                </ExternalLinkButton>
                <ExternalLinkButton
                  href="https://nichenode.com/terms"
                  variant="outline"
                  className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-left justify-between"
                >
                  Terms of Service
                </ExternalLinkButton>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );

      // Add other sections as needed...
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const completion = calculateCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toast {...toast} onClose={hideToast} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile Settings</h1>
              <p className="text-slate-600">Manage your account settings and preferences</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-slate-600">Profile Completion:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  completion >= 80 ? 'bg-green-100 text-green-800' :
                  completion >= 50 ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {completion}%
                </span>
              </div>
              <div className="w-32 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <nav className="space-y-2">
                {[
                  { id: 'personal', label: 'Personal Information', icon: User },
                  { id: 'contact', label: 'Contact Details', icon: Phone },
                  { id: 'photo', label: 'Profile Picture', icon: Camera },
                  { id: 'account', label: 'Account Settings', icon: Settings }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              {renderSectionContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}