import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Download, BookOpen, Video, FileText, ExternalLink, CheckCircle, Clock, Star, Users, Search, Filter, Bookmark, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Toast, useToast } from './Toast';

interface LearningResourcesPageProps {
  onBack: () => void;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'exercise' | 'download' | 'external';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  completed: boolean;
  rating: number;
  thumbnail?: string;
  url?: string;
}

interface UserProgress {
  totalResources: number;
  completedResources: number;
  currentStreak: number;
  totalTimeSpent: number;
  certificates: number;
}

export function LearningResourcesPage({ onBack }: LearningResourcesPageProps) {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalResources: 45,
    completedResources: 12,
    currentStreak: 7,
    totalTimeSpent: 24.5,
    certificates: 3
  });

  const categories = [
    { id: 'all', label: 'All Resources', count: 45 },
    { id: 'getting-started', label: 'Getting Started', count: 8 },
    { id: 'expert-skills', label: 'Expert Skills', count: 12 },
    { id: 'blockchain', label: 'Blockchain & Web3', count: 6 },
    { id: 'business', label: 'Business Growth', count: 10 },
    { id: 'communication', label: 'Communication', count: 9 }
  ];

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Getting Started with NicheNode',
      description: 'Complete guide to setting up your profile and finding your first consultation',
      type: 'video',
      category: 'getting-started',
      difficulty: 'beginner',
      duration: '15 min',
      completed: true,
      rating: 4.8,
      thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      title: 'AI Skill Verification Best Practices',
      description: 'Learn how to write compelling skill descriptions that pass AI verification',
      type: 'article',
      category: 'expert-skills',
      difficulty: 'intermediate',
      duration: '10 min',
      completed: false,
      rating: 4.9
    },
    {
      id: '3',
      title: 'Blockchain Consultation Walkthrough',
      description: 'Step-by-step guide to creating and managing Web3 consultations',
      type: 'video',
      category: 'blockchain',
      difficulty: 'intermediate',
      duration: '25 min',
      completed: false,
      rating: 4.7,
      thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '4',
      title: 'Building Your Expert Brand',
      description: 'Interactive exercises to develop your unique value proposition',
      type: 'exercise',
      category: 'business',
      difficulty: 'intermediate',
      duration: '45 min',
      completed: true,
      rating: 4.6
    },
    {
      id: '5',
      title: 'Client Communication Templates',
      description: 'Downloadable templates for professional client interactions',
      type: 'download',
      category: 'communication',
      difficulty: 'beginner',
      duration: '5 min',
      completed: false,
      rating: 4.5
    },
    {
      id: '6',
      title: 'Advanced Pricing Strategies',
      description: 'Master the art of pricing your specialized expertise',
      type: 'video',
      category: 'business',
      difficulty: 'advanced',
      duration: '35 min',
      completed: false,
      rating: 4.8,
      thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const faqs = [
    {
      question: 'How do I get my skills verified by AI?',
      answer: 'Write detailed, technical descriptions of your expertise. Include specific technologies, years of experience, and notable achievements. Our AI looks for authentic professional language patterns.'
    },
    {
      question: 'What makes a consultation successful?',
      answer: 'Clear communication, well-defined deliverables, realistic timelines, and regular updates. Always confirm requirements before starting and document your work thoroughly.'
    },
    {
      question: 'How do blockchain consultations work?',
      answer: 'Payments are held in smart contract escrow until both parties approve completion. This ensures security and trust without intermediaries. You need a Web3 wallet like MetaMask to participate.'
    },
    {
      question: 'How should I price my services?',
      answer: 'Research market rates for your skills, consider your experience level, and factor in the rarity of your expertise. Niche skills often command premium rates due to limited supply.'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || resource.difficulty === difficultyFilter;
    
    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  const handleResourceClick = (resource: Resource) => {
    if (resource.type === 'external' && resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } else {
      showToast(`Opening ${resource.title}...`, 'info');
      // In a real app, this would navigate to the resource or open a modal
    }
  };

  const toggleBookmark = (resourceId: string) => {
    showToast('Bookmark toggled!', 'success');
  };

  const markAsCompleted = (resourceId: string) => {
    showToast('Resource marked as completed!', 'success');
    setUserProgress(prev => ({
      ...prev,
      completedResources: prev.completedResources + 1
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'exercise': return BookOpen;
      case 'download': return Download;
      case 'external': return ExternalLink;
      default: return FileText;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Toast {...toast} onClose={hideToast} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-6 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Learning Resources
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Master the skills you need to succeed on NicheNode with our comprehensive learning materials
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {userProgress.completedResources}/{userProgress.totalResources}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Resources Completed</p>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(userProgress.completedResources / userProgress.totalResources) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{userProgress.totalTimeSpent}h</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Time Invested</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{userProgress.currentStreak}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Day Streak</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{userProgress.certificates}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Certificates</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">Top 15%</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Global Ranking</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                      activeCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-medium">{category.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeCategory === category.id
                        ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResources.map((resource) => {
                const TypeIcon = getTypeIcon(resource.type);
                return (
                  <div key={resource.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                    {resource.thumbnail && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={resource.thumbnail}
                          alt={resource.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                            {resource.difficulty}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={() => toggleBookmark(resource.id)}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                          >
                            <Bookmark className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        {resource.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-500 dark:text-slate-400">{resource.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{resource.rating}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleResourceClick(resource)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          {resource.type === 'video' ? 'Watch' : 
                           resource.type === 'download' ? 'Download' : 
                           resource.type === 'exercise' ? 'Start' : 'Read'}
                        </button>
                        
                        {!resource.completed && (
                          <button
                            onClick={() => markAsCompleted(resource.id)}
                            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                          >
                            Mark Complete
                          </button>
                        )}
                        
                        {resource.completed && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FAQ Section */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{faq.question}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* External Resources */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">External Learning Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="https://ethereum.org/en/developers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Ethereum Developer Resources
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Learn blockchain development fundamentals</p>
                  </div>
                </a>
                
                <a
                  href="https://www.coursera.org/specializations/blockchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Blockchain Specialization
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Comprehensive blockchain course series</p>
                  </div>
                </a>
                
                <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      Video Tutorial Series
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Step-by-step video guides for beginners</p>
                  </div>
                </a>
                
                <a
                  href="https://docs.soliditylang.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Solidity Documentation
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Official Solidity programming language docs</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}