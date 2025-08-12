import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, MessageCircle, CheckCircle, Users, Zap, Shield, LogOut, Settings, User, ExternalLink, Sun } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useExperts, Expert } from './hooks/useExperts';
import { useThemeContext } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthModal } from './components/AuthModal';
import { ExpertCard } from './components/ExpertCard';
import { ConsultationModal } from './components/ConsultationModal';
import { Web3ConsultationModal } from './components/Web3ConsultationModal';
import { UserDashboard } from './components/UserDashboard';
import { ConsultantProfilePage } from './components/ConsultantProfilePage';
import { BrowseConsultantsPage } from './components/BrowseConsultantsPage';
import { MyConsultationsPage } from './components/MyConsultationsPage';
import { CustomAuthPage } from './components/CustomAuthPage';
import { ProfileManagementPage } from './components/ProfileManagementPage';
import { LearningResourcesPage } from './components/LearningResourcesPage';
import { PerformanceAnalyticsPage } from './components/PerformanceAnalyticsPage';
import { UserProfileDropdown } from './components/UserProfileDropdown';
import { AuthRequiredModal } from './components/AuthRequiredModal';
import { HowItWorksPage } from './components/HowItWorksPage';
import { ExternalLinkButton, ExternalDocumentationButton, ExternalHelpButton } from './components/ExternalLinkButton';
import { SocialMediaButtons } from './components/SocialMediaButtons';

type AppPage = 'home' | 'dashboard' | 'profile' | 'browse' | 'consultations' | 'custom-auth' | 'profile-management' | 'how-it-works' | 'learning' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showWeb3ConsultationForm, setShowWeb3ConsultationForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { experts, loading: expertsLoading, searchExperts, fetchExperts } = useExperts();
  const { theme, isLight, switchToLight } = useThemeContext();

  useEffect(() => {
    // Redirect to dashboard if user is logged in and on home page
    if (user && currentPage === 'home') {
      setCurrentPage('dashboard');
    }
  }, [user, currentPage]);

  useEffect(() => {
    if (currentPage === 'home') {
      if (searchTerm.trim()) {
        const debounceTimer = setTimeout(() => {
          searchExperts(searchTerm);
        }, 300);
        return () => clearTimeout(debounceTimer);
      } else {
        fetchExperts();
      }
    }
  }, [searchTerm, currentPage]);

  // Authentication check function
  const requireAuth = (action: () => void, actionName?: string) => {
    if (!user) {
      setPendingAction(() => action);
      setShowAuthRequiredModal(true);
      return false;
    }
    action();
    return true;
  };

  // Handle authentication success
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowAuthRequiredModal(false);
    
    // Execute pending action if there is one
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleConsultationRequest = (expert: Expert) => {
    requireAuth(() => {
      setSelectedExpert(expert);
      setShowConsultationForm(true);
    });
  };

  const handleWeb3ConsultationRequest = (expert: Expert) => {
    requireAuth(() => {
      setSelectedExpert(expert);
      setShowWeb3ConsultationForm(true);
    });
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const handleNavigation = (page: AppPage) => {
    // Check if navigation requires authentication
    if (['dashboard', 'profile', 'consultations', 'custom-auth', 'profile-management'].includes(page)) {
      requireAuth(() => setCurrentPage(page));
    } else {
      setCurrentPage(page);
    }
  };

  const handleProtectedNavigation = (page: AppPage) => {
    requireAuth(() => setCurrentPage(page));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Render different pages based on current page
  if (currentPage === 'dashboard') {
    return <UserDashboard onNavigate={handleNavigation} />;
  }

  if (currentPage === 'profile') {
    return <ConsultantProfilePage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'browse') {
    return <BrowseConsultantsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'consultations') {
    return <MyConsultationsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'custom-auth') {
    return <CustomAuthPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'profile-management') {
    return <ProfileManagementPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'how-it-works') {
    return <HowItWorksPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'learning') {
    return <LearningResourcesPage onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'analytics') {
    return <PerformanceAnalyticsPage onBack={() => setCurrentPage('dashboard')} />;
  }

  // Home page (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">NicheNode</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => handleProtectedNavigation('browse')}
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Find Experts
              </button>
              <button 
                onClick={() => handleProtectedNavigation('profile')}
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Become an Expert
              </button>
              <button 
                onClick={() => setCurrentPage('how-it-works')}
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                How it Works
              </button>
            </nav>
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle variant="inline" size="sm" showLabels={false} />
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentPage('custom-auth')}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium flex items-center space-x-1"
                  >
                    <Settings className="w-4 h-4" />
                    <span>API Demo</span>
                  </button>
                  
                  {/* User Profile Dropdown */}
                  <UserProfileDropdown
                    onNavigateToProfile={() => setCurrentPage('profile-management')}
                    onSignOut={handleSignOut}
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Light Mode Banner */}
      {isLight && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-800">
              <Sun className="w-4 h-4" />
              <span className="text-sm font-medium">Light Mode Active</span>
              <span className="text-xs">All settings reset to defaults for optimal experience</span>
            </div>
            <button
              onClick={switchToLight}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Learn more
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Find Experts in the Most
            <span className="text-blue-600 dark:text-blue-400"> Niche Skills</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
            Connect with verified specialists who possess rare, specialized knowledge. From legacy programming languages to Victorian antiques.
          </p>
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              🤖 AI-Powered Matching
            </div>
            <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
              🔗 Blockchain-Secured
            </div>
            <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
              ✅ Expert Verification
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for niche skills... (e.g., COBOL, Victorian buttons, Excel macros)"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{experts.length}+</div>
              <div className="text-slate-600 dark:text-slate-400">Verified Experts</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <Zap className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">50+</div>
              <div className="text-slate-600 dark:text-slate-400">Niche Categories</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <Shield className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">98%</div>
              <div className="text-slate-600 dark:text-slate-400">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Expert Grid */}
        {expertsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading experts...</p>
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">No experts found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {experts.map((expert) => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                onRequestConsultation={handleConsultationRequest}
                onRequestWeb3Consultation={handleWeb3ConsultationRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with external link buttons */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">NicheNode</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Connecting the world's most specialized experts with those who need their unique knowledge.
              </p>
              <SocialMediaButtons size="sm" />
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleProtectedNavigation('browse')}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Find Experts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleProtectedNavigation('profile')}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Become an Expert
                  </button>
                </li>
                <li>
                  <ExternalDocumentationButton
                    href="https://docs.nichenode.com/pricing"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0 border-0 bg-transparent shadow-none"
                  >
                    Pricing
                  </ExternalDocumentationButton>
                </li>
                <li>
                  <ExternalDocumentationButton
                    href="https://docs.nichenode.com/api"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0 border-0 bg-transparent shadow-none"
                  >
                    API Documentation
                  </ExternalDocumentationButton>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <ExternalHelpButton
                    href="https://help.nichenode.com"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0 border-0 bg-transparent shadow-none"
                  >
                    Help Center
                  </ExternalHelpButton>
                </li>
                <li>
                  <ExternalLinkButton
                    href="https://nichenode.com/contact"
                    variant="link"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0 border-0 bg-transparent shadow-none"
                  >
                    Contact Us
                  </ExternalLinkButton>
                </li>
                <li>
                  <ExternalLinkButton
                    href="https://status.nichenode.com"
                    variant="link"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0 border-0 bg-transparent shadow-none"
                  >
                    System Status
                  </ExternalLinkButton>
                </li>
                <li>
                  <ExternalLinkButton
                    href="https://nichenode.com/privacy"
                    variant="link"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0 border-0 bg-transparent shadow-none"
                  >
                    Privacy Policy
                  </ExternalLinkButton>
                </li>
                <li>
                  <ExternalLinkButton
                    href="https://nichenode.com/terms"
                    variant="link"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0 border-0 bg-transparent shadow-none"
                  >
                    Terms of Service
                  </ExternalLinkButton>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center space-x-2">
              <span>© 2024 NicheNode. All rights reserved. Built with</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">bolt.</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                New
              </span>
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthRequiredModal}
        onClose={() => {
          setShowAuthRequiredModal(false);
          setPendingAction(null);
        }}
        onSignUp={() => {
          setShowAuthRequiredModal(false);
          setAuthMode('signup');
          setShowAuthModal(true);
        }}
        onLogIn={() => {
          setShowAuthRequiredModal(false);
          setAuthMode('signin');
          setShowAuthModal(true);
        }}
      />

      {/* Traditional Consultation Request Modal */}
      <ConsultationModal
        expert={selectedExpert}
        isOpen={showConsultationForm}
        onClose={() => {
          setShowConsultationForm(false);
          setSelectedExpert(null);
        }}
      />

      {/* Web3 Consultation Request Modal */}
      <Web3ConsultationModal
        expert={selectedExpert}
        isOpen={showWeb3ConsultationForm}
        onClose={() => {
          setShowWeb3ConsultationForm(false);
          setSelectedExpert(null);
        }}
      />
    </div>
  );
}

export default App;