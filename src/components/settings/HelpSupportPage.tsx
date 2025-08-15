import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Book, Video, Search, Send, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { Toast, useToast } from '../Toast';

interface HelpSupportPageProps {
  onBack: () => void;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export function HelpSupportPage({ onBack }: HelpSupportPageProps) {
  const { toast, showToast, hideToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'resources' | 'status'>('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [supportTicket, setSupportTicket] = useState<SupportTicket>({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create a consultant profile?',
      answer: 'To create a consultant profile, go to your dashboard and click "Become a Consultant". Fill out your expertise details, set your hourly rate, and our AI will verify your skills.',
      category: 'Getting Started'
    },
    {
      id: '2',
      question: 'How does the AI skill verification work?',
      answer: 'Our AI analyzes your skill description for technical depth, professional language patterns, and specific expertise indicators. It checks for authenticity and assigns a confidence score.',
      category: 'Verification'
    },
    {
      id: '3',
      question: 'What is Web3 consultation and how does it work?',
      answer: 'Web3 consultations use blockchain smart contracts for secure escrow payments. Your payment is held in the contract until both parties approve completion, ensuring trust and transparency.',
      category: 'Blockchain'
    },
    {
      id: '4',
      question: 'How do I connect my MetaMask wallet?',
      answer: 'Click on any "Web3 Consultation" button and you\'ll be prompted to connect your MetaMask wallet. Make sure you\'re on the Hardhat local network (Chain ID: 1337) for testing.',
      category: 'Blockchain'
    },
    {
      id: '5',
      question: 'How are payments processed?',
      answer: 'We offer two payment methods: traditional payments through our platform, and blockchain-secured payments using smart contracts. Both methods protect buyers and sellers.',
      category: 'Payments'
    },
    {
      id: '6',
      question: 'What happens if there\'s a dispute?',
      answer: 'For traditional consultations, our support team mediates disputes. For blockchain consultations, there\'s a built-in dispute mechanism in the smart contract.',
      category: 'Disputes'
    },
    {
      id: '7',
      question: 'How do I search for specific expertise?',
      answer: 'Use our AI-powered search to find experts by describing what you need. The system understands context and matches you with relevant specialists, not just keyword matches.',
      category: 'Search'
    },
    {
      id: '8',
      question: 'Can I update my profile after verification?',
      answer: 'Yes, you can update your profile anytime. Major changes to your expertise may require re-verification by our AI system.',
      category: 'Profile'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (!supportTicket.subject.trim() || !supportTicket.message.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // In a real app, this would submit to a support system
    showToast('Support ticket submitted successfully! We\'ll get back to you within 24 hours.', 'success');
    setSupportTicket({
      subject: '',
      message: '',
      priority: 'medium',
      category: 'general'
    });
  };

  const tabs = [
    { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
    { id: 'contact' as const, label: 'Contact Support', icon: MessageCircle },
    { id: 'resources' as const, label: 'Resources', icon: Book },
    { id: 'status' as const, label: 'System Status', icon: CheckCircle }
  ];

  return (
    <div className="space-y-8">
      <Toast {...toast} onClose={hideToast} />
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl mb-6 shadow-lg">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
          Help & Support
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Get help, find answers, and contact our support team
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
                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
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
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{faq.question}</h3>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{faq.category}</span>
                    </div>
                    <div className={`transform transition-transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-4 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">No FAQs found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Contact Support</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={supportTicket.subject}
                    onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={supportTicket.category}
                      onChange={(e) => setSupportTicket({ ...supportTicket, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing</option>
                      <option value="account">Account</option>
                      <option value="verification">Verification</option>
                      <option value="blockchain">Blockchain/Web3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={supportTicket.priority}
                      onChange={(e) => setSupportTicket({ ...supportTicket, priority: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={supportTicket.message}
                    onChange={(e) => setSupportTicket({ ...supportTicket, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please describe your issue in detail..."
                  />
                </div>

                <button
                  onClick={handleSubmitTicket}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </button>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Other Ways to Reach Us</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">Email Support</div>
                        <div className="text-blue-700 dark:text-blue-200">support@nichenode.com</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">Phone Support</div>
                        <div className="text-blue-700 dark:text-blue-200">+1 (555) 123-4567</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">Support Hours</div>
                        <div className="text-blue-700 dark:text-blue-200">Mon-Fri: 9AM-6PM EST</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">Response Times</h3>
                  <div className="space-y-2 text-green-800 dark:text-green-200 text-sm">
                    <p>• High Priority: Within 2 hours</p>
                    <p>• Medium Priority: Within 24 hours</p>
                    <p>• Low Priority: Within 48 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Resources & Documentation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Getting Started Guide',
                  description: 'Learn the basics of using NicheNode',
                  icon: Book,
                  type: 'Documentation',
                  color: 'blue'
                },
                {
                  title: 'Video Tutorials',
                  description: 'Step-by-step video guides',
                  icon: Video,
                  type: 'Video',
                  color: 'purple'
                },
                {
                  title: 'API Documentation',
                  description: 'Technical documentation for developers',
                  icon: Book,
                  type: 'API',
                  color: 'green'
                },
                {
                  title: 'Blockchain Guide',
                  description: 'Understanding Web3 consultations',
                  icon: Book,
                  type: 'Guide',
                  color: 'orange'
                },
                {
                  title: 'Best Practices',
                  description: 'Tips for successful consultations',
                  icon: Book,
                  type: 'Guide',
                  color: 'pink'
                },
                {
                  title: 'Community Forum',
                  description: 'Connect with other users',
                  icon: MessageCircle,
                  type: 'Community',
                  color: 'indigo'
                }
              ].map((resource, index) => (
                <div key={index} className={`bg-${resource.color}-50 dark:bg-${resource.color}-900/20 rounded-lg p-6 border border-${resource.color}-200 dark:border-${resource.color}-800 hover:shadow-md transition-shadow cursor-pointer`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-${resource.color}-100 dark:bg-${resource.color}-900/40 rounded-lg mb-4`}>
                    <resource.icon className={`w-6 h-6 text-${resource.color}-600`} />
                  </div>
                  <h3 className={`text-lg font-semibold text-${resource.color}-900 dark:text-${resource.color}-100 mb-2`}>
                    {resource.title}
                  </h3>
                  <p className={`text-${resource.color}-700 dark:text-${resource.color}-200 text-sm mb-3`}>
                    {resource.description}
                  </p>
                  <span className={`inline-block px-2 py-1 bg-${resource.color}-100 dark:bg-${resource.color}-900/30 text-${resource.color}-800 dark:text-${resource.color}-200 text-xs rounded-full`}>
                    {resource.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">System Status</h2>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">All Systems Operational</h3>
              </div>
              <p className="text-green-800 dark:text-green-200">
                All services are running normally. Last updated: {new Date().toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { service: 'Web Application', status: 'operational', uptime: '99.9%' },
                { service: 'API Services', status: 'operational', uptime: '99.8%' },
                { service: 'Database', status: 'operational', uptime: '99.9%' },
                { service: 'Blockchain Integration', status: 'operational', uptime: '99.7%' },
                { service: 'AI Verification', status: 'operational', uptime: '99.6%' },
                { service: 'Email Notifications', status: 'operational', uptime: '99.9%' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-slate-900 dark:text-white">{service.service}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Uptime: {service.uptime}</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                      Operational
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Recent Updates</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">Performance Improvements</div>
                    <div className="text-blue-700 dark:text-blue-200 text-sm">Enhanced search speed and AI verification accuracy</div>
                    <div className="text-blue-600 dark:text-blue-300 text-xs">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">Security Update</div>
                    <div className="text-blue-700 dark:text-blue-200 text-sm">Enhanced encryption for user data protection</div>
                    <div className="text-blue-600 dark:text-blue-300 text-xs">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}