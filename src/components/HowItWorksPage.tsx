import React, { useState } from 'react';
import { ArrowLeft, Search, User, Zap, Shield, MessageCircle, Star, CheckCircle, AlertCircle, ExternalLink, ChevronRight, Play, Users, Wallet, Clock, Award } from 'lucide-react';

interface HowItWorksPageProps {
  onBack: () => void;
}

interface TableOfContentsItem {
  id: string;
  title: string;
  subsections?: { id: string; title: string }[];
}

export function HowItWorksPage({ onBack }: HowItWorksPageProps) {
  const [activeSection, setActiveSection] = useState<string>('introduction');

  const tableOfContents: TableOfContentsItem[] = [
    { id: 'introduction', title: 'Introduction' },
    { 
      id: 'getting-started', 
      title: 'Getting Started',
      subsections: [
        { id: 'creating-account', title: 'Creating Your Account' },
        { id: 'profile-setup', title: 'Setting Up Your Profile' }
      ]
    },
    {
      id: 'finding-experts',
      title: 'Finding Experts',
      subsections: [
        { id: 'browsing-consultants', title: 'Browsing Consultants' },
        { id: 'ai-search', title: 'AI-Powered Search' },
        { id: 'expert-verification', title: 'Expert Verification' }
      ]
    },
    {
      id: 'requesting-consultations',
      title: 'Requesting Consultations',
      subsections: [
        { id: 'traditional-consultation', title: 'Traditional Consultation' },
        { id: 'web3-consultation', title: 'Web3 Blockchain Consultation' }
      ]
    },
    {
      id: 'becoming-expert',
      title: 'Becoming an Expert',
      subsections: [
        { id: 'expert-profile', title: 'Creating Your Expert Profile' },
        { id: 'skill-verification', title: 'AI Skill Verification' },
        { id: 'managing-consultations', title: 'Managing Consultations' }
      ]
    },
    {
      id: 'web3-features',
      title: 'Web3 & Blockchain Features',
      subsections: [
        { id: 'wallet-connection', title: 'Connecting Your Wallet' },
        { id: 'smart-contracts', title: 'Smart Contract Escrow' },
        { id: 'blockchain-security', title: 'Blockchain Security' }
      ]
    },
    { id: 'troubleshooting', title: 'Troubleshooting' },
    { id: 'support', title: 'Support & Resources' }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Safe external link handler
  const handleExternalLink = (url: string, description: string) => {
    try {
      const validUrl = new URL(url);
      if (!['https:', 'http:'].includes(validUrl.protocol)) {
        console.error('Invalid protocol for external link:', validUrl.protocol);
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Invalid URL for external link:', url, error);
      alert(`Invalid link: ${description}. Please contact support if this issue persists.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              How NicheNode Works
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Your complete guide to connecting with specialized experts and offering your unique skills on the world's first AI-verified, blockchain-secured expertise platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {tableOfContents.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.title}
                    </button>
                    {item.subsections && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subsections.map((subsection) => (
                          <button
                            key={subsection.id}
                            onClick={() => scrollToSection(subsection.id)}
                            className={`w-full text-left px-3 py-1 text-sm rounded transition-colors ${
                              activeSection === subsection.id
                                ? 'text-blue-600 font-medium'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {subsection.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-12">
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Welcome to NicheNode</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-slate-600 mb-6">
                    NicheNode is the world's first platform specifically designed for ultra-specialized expertise. 
                    Whether you need a COBOL programmer to maintain legacy banking systems, a Victorian button 
                    authenticator for your antique collection, or an expert in medieval manuscript restoration, 
                    NicheNode connects you with verified specialists who possess rare, valuable knowledge.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-slate-900 mb-2">AI-Powered Matching</h3>
                      <p className="text-sm text-slate-600">Advanced AI verifies expertise and matches you with the perfect specialist</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-slate-900 mb-2">Blockchain Security</h3>
                      <p className="text-sm text-slate-600">Smart contract escrow ensures secure, transparent transactions</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-slate-900 mb-2">Expert Verification</h3>
                      <p className="text-sm text-slate-600">Rigorous AI verification ensures authentic, qualified specialists</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Getting Started */}
              <section id="getting-started" className="scroll-mt-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Getting Started</h2>
                
                <div id="creating-account" className="mb-8 scroll-mt-8">
                  <h3 className="text-2xl font-semibold text-slate-900 mb-4">Creating Your Account</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">1</div>
                      <div>
                        <h4 className="font-medium text-slate-900">Click "Get Started" or "Sign Up"</h4>
                        <p className="text-slate-600">Located in the top-right corner of the homepage</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">2</div>
                      <div>
                        <h4 className="font-medium text-slate-900">Enter your information</h4>
                        <p className="text-slate-600">Provide your full name, email address, and create a secure password</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">3</div>
                      <div>
                        <h4 className="font-medium text-slate-900">Verify your email</h4>
                        <p className="text-slate-600">Check your inbox and click the verification link (if required)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="profile-setup" className="scroll-mt-8">
                  <h3 className="text-2xl font-semibold text-slate-900 mb-4">Setting Up Your Profile</h3>
                  <div className="bg-slate-50 rounded-lg p-6">
                    <p className="text-slate-600 mb-4">
                      Complete your profile to get the most out of NicheNode. A complete profile helps experts 
                      understand your needs and builds trust in the community.
                    </p>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Upload a professional profile photo</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Add your location and contact information</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Write a brief bio about your background</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Link your website or LinkedIn profile</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Continue with other sections... */}
              <section id="troubleshooting" className="scroll-mt-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Troubleshooting</h2>
                <div className="space-y-6">
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-4">Common Issues & Solutions</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-900 mb-2">❌ Dropdown buttons not working</h4>
                        <p className="text-red-800 text-sm mb-2">
                          If dropdown menus don't open or close properly, this is usually a JavaScript state issue.
                        </p>
                        <p className="text-red-700 text-sm">
                          <strong>Solution:</strong> Refresh the page and ensure you're signed in. Check browser console for errors.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-900 mb-2">❌ "Authentication Required" popup</h4>
                        <p className="text-red-800 text-sm mb-2">
                          This appears when trying to access protected features without being signed in.
                        </p>
                        <p className="text-red-700 text-sm">
                          <strong>Solution:</strong> Click "Sign Up" or "Log In" to authenticate, then try the action again.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-900 mb-2">❌ Filter dropdowns not responding</h4>
                        <p className="text-red-800 text-sm mb-2">
                          Filter dropdowns on the Browse page may not respond to clicks or keyboard navigation.
                        </p>
                        <p className="text-red-700 text-sm">
                          <strong>Solution:</strong> Ensure you're on the Browse Consultants page and try clicking directly on the dropdown button.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Support & Resources */}
              <section id="support" className="scroll-mt-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Support & Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">📚 Additional Resources</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleExternalLink('https://docs.nichenode.com/api', 'API Documentation')}
                        className="flex items-center justify-between w-full text-left text-blue-800 hover:text-blue-900 transition-colors"
                      >
                        <span>API Documentation</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExternalLink('https://github.com/nichenode', 'GitHub Repository')}
                        className="flex items-center justify-between w-full text-left text-blue-800 hover:text-blue-900 transition-colors"
                      >
                        <span>GitHub Repository</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">🆘 Get Help</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleExternalLink('https://help.nichenode.com', 'Help Center')}
                        className="flex items-center justify-between w-full text-left text-green-800 hover:text-green-900 transition-colors"
                      >
                        <span>Help Center</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExternalLink('https://nichenode.com/contact', 'Contact Support')}
                        className="flex items-center justify-between w-full text-left text-green-800 hover:text-green-900 transition-colors"
                      >
                        <span>Contact Support</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
                    <p className="mb-4">Join the future of specialized expertise today!</p>
                    <button
                      onClick={onBack}
                      className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Return to NicheNode
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}