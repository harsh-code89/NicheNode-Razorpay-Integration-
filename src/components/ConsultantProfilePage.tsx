import React, { useState, useEffect } from 'react';
import { User, Briefcase, DollarSign, Clock, Tag, Save, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Toast, useToast } from './Toast';

interface ConsultantProfilePageProps {
  onBack: () => void;
}

interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  reason: string;
}

export function ConsultantProfilePage({ onBack }: ConsultantProfilePageProps) {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Form state
  const [skillTitle, setSkillTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState(50);
  const [responseTime, setResponseTime] = useState('< 24 hours');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (user) {
      loadExistingProfile();
    }
  }, [user]);

  const loadExistingProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingProfile(data);
        setSkillTitle(data.skill_title || '');
        setDescription(data.description || '');
        setHourlyRate(data.hourly_rate || 50);
        setResponseTime(data.response_time || '< 24 hours');
        setTags(data.tags || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifySkill = async () => {
    if (!skillTitle.trim() || !description.trim()) {
      showToast('Please fill in both skill title and description before verifying', 'warning');
      return;
    }

    setVerifying(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-skills/verify`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          skill_title: skillTitle,
          skill_description: description
        })
      });

      if (!response.ok) {
        let errorMessage = `Verification request failed (${response.status}: ${response.statusText})`;
        
        try {
          const errorData = await response.text();
          if (errorData) {
            try {
              const parsedError = JSON.parse(errorData);
              if (parsedError.error || parsedError.message) {
                errorMessage = parsedError.error || parsedError.message;
              }
            } catch {
              errorMessage = errorData;
            }
          }
        } catch {
          // Use default message
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setVerificationResult(result);
      
      if (result.isVerified) {
        showToast('🎉 Skill verified successfully!', 'success');
      } else {
        showToast('Skill verification pending - may need manual review', 'info');
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Verification failed: ${errorMessage}`, 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      showToast('Tag added successfully', 'success');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    showToast('Tag removed', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const isVerified = verificationResult?.isVerified || false;

      if (existingProfile) {
        const { error } = await supabase
          .from('experts')
          .update({
            skill_title: skillTitle,
            description: description,
            hourly_rate: hourlyRate,
            response_time: responseTime,
            tags: tags,
            verified: isVerified,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('experts')
          .insert({
            user_id: user.id,
            skill_title: skillTitle,
            description: description,
            hourly_rate: hourlyRate,
            response_time: responseTime,
            tags: tags,
            verified: isVerified
          });

        if (error) throw error;

        await supabase
          .from('profiles')
          .update({ is_expert: true })
          .eq('id', user.id);
      }

      const message = isVerified 
        ? '🎉 Profile saved and automatically verified!' 
        : '✅ Profile saved! Your profile will be reviewed for verification.';
      
      showToast(message, 'success');
      
      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err) {
      console.error('Save error:', err);
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toast {...toast} onClose={hideToast} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            {existingProfile ? 'Edit Consultant Profile' : 'Create Consultant Profile'}
          </h1>
          <p className="text-slate-600 mt-2">
            Share your expertise and connect with clients looking for your specialized skills.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Skill Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Skill Title
              </label>
              <input
                type="text"
                value={skillTitle}
                onChange={(e) => setSkillTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="e.g., COBOL Legacy Systems, Victorian Button Authentication"
                required
              />
              <p className="text-sm text-slate-500 mt-1">
                Be specific about your niche expertise
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Describe your experience, background, and what makes you an expert in this field..."
                required
              />
              <p className="text-sm text-slate-500 mt-1">
                Include your years of experience, notable achievements, and what sets you apart
              </p>
            </div>

            {/* AI Verification Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>AI Skill Verification</span>
                </h3>
                <button
                  type="button"
                  onClick={verifySkill}
                  disabled={verifying || !skillTitle.trim() || !description.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
                >
                  {verifying ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify Skill</span>
                    </>
                  )}
                </button>
              </div>

              {verificationResult && (
                <div className={`p-4 rounded-lg flex items-start space-x-3 ${
                  verificationResult.isVerified 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  {verificationResult.isVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      verificationResult.isVerified ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {verificationResult.isVerified ? '🎉 Skill Verified!' : '⏳ Verification Pending'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      verificationResult.isVerified ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {verificationResult.reason}
                    </p>
                    <p className={`text-xs mt-1 ${
                      verificationResult.isVerified ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      Confidence: {Math.round(verificationResult.confidence * 100)}%
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-600 mt-3">
                Our AI analyzes your skill description for authenticity, technical depth, and professional quality. 
                Verified skills get better visibility in search results.
              </p>
            </div>

            {/* Hourly Rate and Response Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Hourly Rate (USD)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Response Time
                </label>
                <select
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="< 1 hour">Less than 1 hour</option>
                  <option value="< 2 hours">Less than 2 hours</option>
                  <option value="< 4 hours">Less than 4 hours</option>
                  <option value="< 24 hours">Less than 24 hours</option>
                  <option value="< 48 hours">Less than 48 hours</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Skills & Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1 hover:bg-blue-200 transition-colors"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Add a skill or tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Add relevant keywords that clients might search for
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}