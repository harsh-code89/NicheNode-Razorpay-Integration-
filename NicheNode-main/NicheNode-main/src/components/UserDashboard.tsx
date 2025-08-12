import React, { useState, useEffect } from 'react';
import { User, Briefcase, MessageSquare, Star, Settings, Plus, Search, LogOut, Wallet, TrendingUp, AlertCircle, Zap, Shield, Users, Clock, Award, BarChart3, FileText, Globe, HelpCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Toast, useToast } from './Toast';
import { UserProfileDropdown } from './UserProfileDropdown';
import { SettingsLayout } from './SettingsLayout';
import { LearningResourcesPage } from './LearningResourcesPage';
import { PerformanceAnalyticsPage } from './PerformanceAnalyticsPage';

interface UserDashboardProps {
  onNavigate: (page: 'profile' | 'browse' | 'dashboard' | 'consultations' | 'profile-management' | 'settings' | 'learning' | 'analytics') => void;
}

interface DashboardStats {
  consultationsReceived: number;
  consultationsSent: number;
  averageRating: number;
  totalEarnings: number;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: 'primary' | 'secondary' | 'info';
  gradient: string;
  badge?: string;
  tooltip?: string;
}

export function UserDashboard({ onNavigate }: UserDashboardProps) {
  const { user, signOut } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'learning' | 'analytics'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    consultationsReceived: 0,
    consultationsSent: 0,
    averageRating: 0,
    totalEarnings: 0
  });
  const [isExpert, setIsExpert] = useState(false);
  const [expertProfile, setExpertProfile] = useState<any>(null);
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setConnectionError(null);

      // Test Supabase connection first with better error handling
      let connectionTest;
      try {
        const result = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        connectionTest = result.error;
      } catch (networkError) {
        console.error('Network error during connection test:', networkError);
        setConnectionError('Network connection failed. Please check your internet connection and ensure the Supabase URL is accessible.');
        setLoading(false);
        return;
      }

      if (connectionTest) {
        console.error('Supabase connection test failed:', connectionTest);
        if (connectionTest.message?.includes('Failed to fetch')) {
          setConnectionError('Unable to connect to Supabase. Please check your network connection and Supabase configuration.');
        } else {
          setConnectionError(`Database connection error: ${connectionTest.message}`);
        }
        setLoading(false);
        return;
      }

      // Check if user is an expert
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_expert')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        
        // Handle network errors specifically
        if (profileError.message?.includes('Failed to fetch')) {
          setConnectionError('Network error while loading profile. Please check your connection.');
          setLoading(false);
          return;
        }
        
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || null,
              is_expert: false
            });

          if (insertError) {
            console.error('Failed to create profile:', insertError);
            
            if (insertError.message?.includes('Failed to fetch')) {
              setConnectionError('Network error while creating profile. Please check your connection.');
            } else {
              setConnectionError(`Failed to create user profile: ${insertError.message}`);
            }
            
            setConnectionError('Failed to create user profile. Please try again.');
            setLoading(false);
            return;
          }
          
          setIsExpert(false);
        } else {
          throw profileError;
        }
      } else {
        setIsExpert(profile?.is_expert || false);
      }

      // Load expert profile if exists
      if (profile?.is_expert) {
        let expertData, expertError;
        try {
          const result = await supabase
          .from('experts')
          .select(`
            *,
            reviews (rating)
          `)
          .eq('user_id', user.id)
          .maybeSingle();
          expertData = result.data;
          expertError = result.error;
        } catch (networkError) {
          console.error('Network error loading expert profile:', networkError);
          setConnectionError('Network error while loading expert profile. Please check your connection.');
          setLoading(false);
          return;
        }

        if (expertError) {
          console.error('Expert profile error:', expertError);
        } else {
          setExpertProfile(expertData);

          // Calculate average rating
          if (expertData?.reviews?.length > 0) {
            const avgRating = expertData.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / expertData.reviews.length;
            setStats(prev => ({ ...prev, averageRating: avgRating }));
          }
        }
      }

      // Load consultations with proper expert ID handling
      let expertIds: string[] = [];
      if (profile?.is_expert) {
        let expertProfile, expertProfileError;
        try {
          const result = await supabase
          .from('experts')
          .select('id')
          .eq('user_id', user.id);
          expertProfile = result.data;
          expertProfileError = result.error;
        } catch (networkError) {
          console.error('Network error loading expert IDs:', networkError);
          // Continue without expert consultations rather than failing completely
        }
        
        if (expertProfileError) {
          console.error('Expert profile lookup error:', expertProfileError);
        } else {
          expertIds = expertProfile?.map(e => e.id) || [];
        }
      }

      // Load consultations as expert
      let consultationsAsExpert: any[] = [];
      if (expertIds.length > 0) {
        let data, error;
        try {
          const result = await supabase
          .from('consultations')
          .select(`
            *,
            profiles!consultations_client_id_fkey (full_name)
          `)
          .in('expert_id', expertIds)
          .order('created_at', { ascending: false })
          .limit(5);
          data = result.data;
          error = result.error;
        } catch (networkError) {
          console.error('Network error loading expert consultations:', networkError);
          // Continue with empty array rather than failing
        }

        if (error) {
          console.error('Consultations as expert error:', error);
        } else {
          consultationsAsExpert = data || [];
        }
      }

      // Load consultations as client with better error handling
      let consultationsAsClient: any[] = [];
      try {
        const result = await supabase
          .from('consultations')
          .select(`
            *,
            experts!consultations_expert_id_fkey (
              skill_title,
              profiles!experts_user_id_fkey (full_name)
            )
          `)
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        const data = result.data;
        const clientConsultationsError = result.error;

        if (clientConsultationsError) {
          console.error('Client consultations error:', clientConsultationsError);
          // Don't throw error, just log it and continue with empty array
        } else {
          consultationsAsClient = data || [];
        }
      } catch (fetchError) {
        console.error('Network error fetching client consultations:', fetchError);
        // Continue with empty array rather than failing completely
      }

      setStats(prev => ({
        ...prev,
        consultationsReceived: consultationsAsExpert?.length || 0,
        consultationsSent: consultationsAsClient?.length || 0
      }));

      // Combine and sort recent consultations
      const allConsultations = [
        ...(consultationsAsExpert || []).map(c => ({ ...c, type: 'received' })),
        ...(consultationsAsClient || []).map(c => ({ ...c, type: 'sent' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecentConsultations(allConsultations.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Enhanced error handling for different types of errors
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        setConnectionError('Network connection failed. Please check your internet connection and Supabase configuration.');
      } else if (error instanceof Error && error.message.includes('NetworkError')) {
        setConnectionError('Network error occurred. Please check your internet connection.');
      } else if (error instanceof Error && error.message.includes('CORS')) {
        setConnectionError('CORS error. Please check your Supabase configuration and allowed origins.');
      } else {
        setConnectionError(`Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}. Please try refreshing the page.`);
      }
      
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('👋 Signed out successfully', 'info');
  };

  const calculateProfileCompletion = () => {
    if (!user) return 0;

    // Basic completion factors
    let completed = 0;
    let total = 6;

    // Check if user has basic info
    if (user.user_metadata?.full_name) completed++;
    if (user.email) completed++;
    
    // For experts, check additional fields
    if (isExpert && expertProfile) {
      if (expertProfile.skill_title) completed++;
      if (expertProfile.description) completed++;
      if (expertProfile.verified) completed++;
      if (expertProfile.tags && expertProfile.tags.length > 0) completed++;
    } else {
      // For non-experts, just check if they have basic profile info
      completed += 2; // Assume they have basic info if they're not an expert
    }

    return Math.round((completed / total) * 100);
  };

  const handleProfileClick = () => {
    console.log('Profile status clicked, navigating to profile-management');
    onNavigate('profile-management');
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleLearningResourcesClick = () => {
    setCurrentView('learning');
  };

  const handleAnalyticsClick = () => {
    setCurrentView('analytics');
  };

  // Show settings layout if settings is selected
  if (currentView === 'settings') {
    return <SettingsLayout isOpen={true} onBack={handleBackToDashboard} onClose={handleBackToDashboard} />;
  }

  // Show learning resources page
  if (currentView === 'learning') {
    return <LearningResourcesPage onBack={handleBackToDashboard} />;
  }

  // Show analytics page
  if (currentView === 'analytics') {
    return <PerformanceAnalyticsPage onBack={handleBackToDashboard} />;
  }

  // Define feature cards with clear organization
  const primaryFeatures: FeatureCard[] = [
    {
      id: 'browse',
      title: 'Browse Consultants',
      description: 'Find experts in specialized fields with AI-powered matching',
      icon: Search,
      action: () => onNavigate('browse'),
      category: 'primary',
      gradient: 'from-blue-500 to-cyan-500',
      tooltip: 'Search through verified experts using our intelligent matching system'
    },
    {
      id: 'profile',
      title: isExpert ? 'Edit Consultant Profile' : 'Become a Consultant',
      description: isExpert ? 'Update your consultant profile and skills' : 'Share your expertise with others and start earning',
      icon: isExpert ? User : Plus,
      action: () => onNavigate('profile'),
      category: 'primary',
      gradient: 'from-green-500 to-emerald-500',
      badge: isExpert && expertProfile?.verified ? 'Verified' : undefined,
      tooltip: isExpert ? 'Manage your expert profile and verification status' : 'Create your expert profile and get AI verification'
    },
    {
      id: 'consultations',
      title: 'My Consultations',
      description: 'View and manage your consultations with blockchain security',
      icon: MessageSquare,
      action: () => onNavigate('consultations'),
      category: 'primary',
      gradient: 'from-purple-500 to-pink-500',
      tooltip: 'Track all your consultation requests and ongoing projects'
    }
  ];

  const secondaryFeatures: FeatureCard[] = [
    {
      id: 'web3',
      title: 'Web3 Ready',
      description: 'Blockchain-secured consultations with smart contract escrow',
      icon: Wallet,
      action: () => onNavigate('browse'),
      category: 'secondary',
      gradient: 'from-indigo-500 to-purple-600',
      badge: 'New',
      tooltip: 'Experience secure, trustless payments with blockchain technology'
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      description: 'Track your success metrics and earnings',
      icon: BarChart3,
      action: handleAnalyticsClick,
      category: 'secondary',
      gradient: 'from-orange-500 to-red-500',
      tooltip: 'View detailed analytics about your consultation performance'
    },
    {
      id: 'resources',
      title: 'Learning Resources',
      description: 'Access guides, tutorials, and best practices',
      icon: FileText,
      action: handleLearningResourcesClick,
      category: 'secondary',
      gradient: 'from-teal-500 to-cyan-500',
      tooltip: 'Learn how to maximize your success on the platform'
    }
  ];

  const infoFeatures: FeatureCard[] = [
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Connect with other experts and share knowledge',
      icon: Users,
      action: () => showToast('Community forum coming soon!', 'info'),
      category: 'info',
      gradient: 'from-pink-500 to-rose-500',
      tooltip: 'Join discussions and network with other professionals'
    },
    {
      id: 'support',
      title: 'Help & Support',
      description: '24/7 support and comprehensive documentation',
      icon: HelpCircle,
      action: () => showToast('Support center coming soon!', 'info'),
      category: 'info',
      gradient: 'from-violet-500 to-purple-500',
      tooltip: 'Get help when you need it with our support team'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Connection Error</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{connectionError}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setLoading(true);
                loadDashboardData();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-left">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Troubleshooting:</h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify Supabase environment variables</li>
              <li>• Ensure Supabase project is active</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  const FeatureCardComponent = ({ feature }: { feature: FeatureCard }) => (
    <div className="group relative">
      <button
        onClick={feature.action}
        className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group-hover:scale-[1.02]"
        title={feature.tooltip}
      >
        {/* Badge */}
        {feature.badge && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-md">
              {feature.badge}
            </span>
          </div>
        )}

        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <feature.icon className="w-8 h-8 text-white" />
        </div>

        {/* Content - ALL TEXT IN WHITE */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
          {feature.title}
        </h3>
        <p className="text-white leading-relaxed text-base">
          {feature.description}
        </p>

        {/* Hover effect overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Toast {...toast} onClose={hideToast} />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-white text-sm">
                  Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </p>
              </div>
              {isExpert && expertProfile?.verified && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium shadow-lg">
                  <Award className="w-4 h-4" />
                  <span>Verified Expert</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSettingsClick}
                className="p-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
                title="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
              
              {/* User Profile Dropdown */}
              <UserProfileDropdown
                onNavigateToProfile={() => onNavigate('profile-management')}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Consultations Sent</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.consultationsSent}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {isExpert && (
            <>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Consultations Received</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.consultationsReceived}</p>
                  </div>
                  <Briefcase className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Average Rating</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                  <Star className="w-10 h-10 text-yellow-500" />
                </div>
              </div>
            </>
          )}

          {/* Clickable Profile Status Card */}
          <button
            onClick={handleProfileClick}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Profile Status</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {profileCompletion >= 80 ? 'Complete' : 
                   profileCompletion >= 50 ? 'Good' : 'Pending'}
                </p>
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
                  <span className="text-xs text-slate-600 dark:text-slate-400">{profileCompletion}%</span>
                </div>
              </div>
              <User className={`w-10 h-10 group-hover:scale-110 transition-transform ${
                profileCompletion >= 80 ? 'text-green-600' :
                profileCompletion >= 50 ? 'text-blue-600' : 'text-amber-600'
              }`} />
            </div>
          </button>
        </div>

        {/* Welcome Message for New Users */}
        {!isExpert && stats.consultationsSent === 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-12 border border-blue-200/50 dark:border-blue-800/50">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Welcome to NicheNode! 🎉</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                You're now part of the premier platform for specialized expertise. Whether you're looking for niche skills or ready to share your own expertise, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onNavigate('browse')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Find an Expert
                </button>
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-semibold"
                >
                  Become a Consultant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Categories */}
        <div className="space-y-12">
          {/* Primary Features */}
          <section>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Core Features</h2>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                Essential tools for your success
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {primaryFeatures.map((feature) => (
                <FeatureCardComponent key={feature.id} feature={feature} />
              ))}
            </div>
          </section>

          {/* Secondary Features */}
          <section>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Advanced Tools</h2>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium rounded-full">
                Enhance your experience
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {secondaryFeatures.map((feature) => (
                <FeatureCardComponent key={feature.id} feature={feature} />
              ))}
            </div>
          </section>

          {/* Info Features */}
          <section>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-cyan-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Community & Support</h2>
              <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 text-sm font-medium rounded-full">
                Connect and grow
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {infoFeatures.map((feature) => (
                <FeatureCardComponent key={feature.id} feature={feature} />
              ))}
            </div>
          </section>
        </div>

        {/* Recent Activity */}
        {recentConsultations.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {consultation.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {consultation.type === 'sent' ? 'Sent to' : 'Received from'}: {
                            consultation.type === 'sent' 
                              ? consultation.experts?.profiles?.full_name || 'Expert'
                              : consultation.profiles?.full_name || 'Client'
                          }
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>Budget: ${consultation.budget}</span>
                          <span>•</span>
                          <span>{consultation.timeline}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            consultation.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            consultation.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            consultation.status === 'accepted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                            consultation.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {consultation.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(consultation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}