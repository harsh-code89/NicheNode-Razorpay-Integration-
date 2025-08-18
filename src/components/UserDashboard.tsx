import React, { useState, useEffect } from 'react';
import { User, Briefcase, MessageSquare, Star, Settings, Plus, Search, Wallet, TrendingUp, AlertCircle, Zap, Users, Award, BarChart3, FileText, HelpCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Toast, useToast } from './Toast';
import { UserProfileDropdown } from './UserProfileDropdown';
import { SettingsLayout } from './SettingsLayout';
import { LearningResourcesPage } from './LearningResourcesPage';
import { PerformanceAnalyticsPage } from './PerformanceAnalyticsPage';
import { Button } from './ui/Button';
import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle } from './ui/DashboardCard';
import { FeatureCard, FeatureCardContent, FeatureCardHeader, FeatureCardTitle } from './ui/FeatureCard';

interface UserDashboardProps {
  onNavigate: (page: 'profile' | 'browse' | 'dashboard' | 'consultations' | 'profile-management' | 'settings' | 'learning' | 'analytics') => void;
}

interface DashboardStats {
  consultationsReceived: number;
  consultationsSent: number;
  averageRating: number;
  totalEarnings: number;
}

interface CustomFeatureCard {
  id: string;
  title: string;
  description:string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
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

  const features: CustomFeatureCard[] = [
    { id: 'browse', title: 'Browse Consultants', description: 'Find experts in specialized fields.', icon: Search, action: () => onNavigate('browse') },
    { id: 'profile', title: isExpert ? 'Edit Consultant Profile' : 'Become a Consultant', description: isExpert ? 'Update your profile and skills.' : 'Share your expertise and start earning.', icon: isExpert ? User : Plus, action: () => onNavigate('profile'), badge: isExpert && expertProfile?.verified ? 'Verified' : undefined },
    { id: 'consultations', title: 'My Consultations', description: 'View and manage your consultations.', icon: MessageSquare, action: () => onNavigate('consultations') },
    { id: 'web3', title: 'Web3 Ready', description: 'Blockchain-secured consultations.', icon: Wallet, action: () => onNavigate('browse'), badge: 'New' },
    { id: 'analytics', title: 'Performance Analytics', description: 'Track your success and earnings.', icon: BarChart3, action: handleAnalyticsClick },
    { id: 'resources', title: 'Learning Resources', description: 'Access guides and tutorials.', icon: FileText, action: handleLearningResourcesClick },
    { id: 'community', title: 'Community Forum', description: 'Connect with other experts.', icon: Users, action: () => showToast('Community forum coming soon!', 'info') },
    { id: 'support', title: 'Help & Support', description: 'Get help when you need it.', icon: HelpCircle, action: () => showToast('Support center coming soon!', 'info') },
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

  return (
    <div className="min-h-screen bg-background">
      <Toast {...toast} onClose={hideToast} />
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Zap className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
              </div>
              {isExpert && expertProfile?.verified && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <Award className="w-4 h-4" />
                  <span>Verified Expert</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handleSettingsClick}><Settings className="w-5 h-5" /></Button>
              <UserProfileDropdown onNavigateToProfile={() => onNavigate('profile-management')} onSignOut={handleSignOut} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <DashboardCard>
            <DashboardCardHeader className="flex flex-row items-center justify-between pb-2">
              <DashboardCardTitle className="text-sm font-medium">Consultations Sent</DashboardCardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </DashboardCardHeader>
            <DashboardCardContent>
              <div className="text-2xl font-bold">{stats.consultationsSent}</div>
            </DashboardCardContent>
          </DashboardCard>
          {isExpert && (
            <>
              <DashboardCard>
                <DashboardCardHeader className="flex flex-row items-center justify-between pb-2">
                  <DashboardCardTitle className="text-sm font-medium">Consultations Received</DashboardCardTitle>
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                </DashboardCardHeader>
                <DashboardCardContent>
                  <div className="text-2xl font-bold">{stats.consultationsReceived}</div>
                </DashboardCardContent>
              </DashboardCard>
              <DashboardCard>
                <DashboardCardHeader className="flex flex-row items-center justify-between pb-2">
                  <DashboardCardTitle className="text-sm font-medium">Average Rating</DashboardCardTitle>
                  <Star className="w-4 h-4 text-muted-foreground" />
                </DashboardCardHeader>
                <DashboardCardContent>
                  <div className="text-2xl font-bold">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}</div>
                </DashboardCardContent>
              </DashboardCard>
            </>
          )}
          <DashboardCard>
            <DashboardCardHeader className="flex flex-row items-center justify-between pb-2">
              <DashboardCardTitle className="text-sm font-medium">Profile Status</DashboardCardTitle>
              <User className="w-4 h-4 text-muted-foreground" />
            </DashboardCardHeader>
            <DashboardCardContent>
              <div className="text-2xl font-bold mb-2">{profileCompletion}% Complete</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
              </div>
            </DashboardCardContent>
          </DashboardCard>
        </div>

        {!isExpert && stats.consultationsSent === 0 && (
          <div className="bg-card border rounded-lg p-8 mb-8 text-center">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to NicheNode! 🎉</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">You're now part of the premier platform for specialized expertise. Find an expert or become one today.</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => onNavigate('browse')}>Find an Expert</Button>
              <Button onClick={() => onNavigate('profile')} variant="secondary">Become a Consultant</Button>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.id} onClick={feature.action} className="cursor-pointer">
              <FeatureCardHeader>
                <feature.icon className="w-8 h-8 text-primary mb-2" />
                <FeatureCardTitle>{feature.title}</FeatureCardTitle>
              </FeatureCardHeader>
              <FeatureCardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </FeatureCardContent>
            </FeatureCard>
          ))}
        </div>

        {recentConsultations.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
            <div className="bg-card border rounded-lg shadow-sm">
              <div className="divide-y">
                {recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="p-4 hover:bg-secondary">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{consultation.title}</h3>
                        <p className="text-sm text-muted-foreground">{consultation.type === 'sent' ? 'Sent to' : 'Received from'}: {consultation.type === 'sent' ? consultation.experts?.profiles?.full_name || 'Expert' : consultation.profiles?.full_name || 'Client'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{new Date(consultation.created_at).toLocaleDateString()}</p>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{consultation.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}