import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, Download, Filter, RefreshCw, Target, Award, DollarSign, Users, Clock, Star, ExternalLink, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Toast, useToast } from './Toast';

interface PerformanceAnalyticsPageProps {
  onBack: () => void;
}

interface AnalyticsData {
  totalEarnings: number;
  earningsGrowth: number;
  totalConsultations: number;
  consultationsGrowth: number;
  averageRating: number;
  ratingGrowth: number;
  responseTime: number;
  responseTimeGrowth: number;
  completionRate: number;
  clientRetention: number;
}

interface ChartData {
  month: string;
  earnings: number;
  consultations: number;
  rating: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  achieved: boolean;
  progress: number;
  target: number;
  category: string;
}

export function PerformanceAnalyticsPage({ onBack }: PerformanceAnalyticsPageProps) {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  
  const [timeRange, setTimeRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const analyticsData: AnalyticsData = {
    totalEarnings: 12450,
    earningsGrowth: 23.5,
    totalConsultations: 47,
    consultationsGrowth: 18.2,
    averageRating: 4.8,
    ratingGrowth: 2.1,
    responseTime: 2.3,
    responseTimeGrowth: -15.4,
    completionRate: 94.7,
    clientRetention: 78.3
  };

  const chartData: ChartData[] = [
    { month: 'Jan', earnings: 1200, consultations: 5, rating: 4.6 },
    { month: 'Feb', earnings: 1800, consultations: 7, rating: 4.7 },
    { month: 'Mar', earnings: 2100, consultations: 8, rating: 4.8 },
    { month: 'Apr', earnings: 2800, consultations: 9, rating: 4.8 },
    { month: 'May', earnings: 2200, consultations: 6, rating: 4.9 },
    { month: 'Jun', earnings: 2350, consultations: 12, rating: 4.8 }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Consultation',
      description: 'Complete your first consultation',
      icon: Target,
      achieved: true,
      progress: 1,
      target: 1,
      category: 'milestones'
    },
    {
      id: '2',
      title: 'Rising Star',
      description: 'Maintain 4.5+ rating for 10 consultations',
      icon: Star,
      achieved: true,
      progress: 10,
      target: 10,
      category: 'quality'
    },
    {
      id: '3',
      title: 'Speed Demon',
      description: 'Respond to inquiries within 1 hour',
      icon: Clock,
      achieved: false,
      progress: 7,
      target: 10,
      category: 'efficiency'
    },
    {
      id: '4',
      title: 'Top Earner',
      description: 'Earn $10,000 in total consultations',
      icon: DollarSign,
      achieved: true,
      progress: 12450,
      target: 10000,
      category: 'earnings'
    },
    {
      id: '5',
      title: 'Client Magnet',
      description: 'Have 5 repeat clients',
      icon: Users,
      achieved: false,
      progress: 3,
      target: 5,
      category: 'retention'
    },
    {
      id: '6',
      title: 'Expert Level',
      description: 'Complete 50 consultations',
      icon: Award,
      achieved: false,
      progress: 47,
      target: 50,
      category: 'milestones'
    }
  ];

  const recommendations = [
    {
      title: 'Improve Response Time',
      description: 'Your average response time is 2.3 hours. Aim for under 1 hour to increase booking rates.',
      priority: 'high',
      action: 'Enable push notifications and set up auto-responses'
    },
    {
      title: 'Expand Service Offerings',
      description: 'Consider adding related skills to your profile to attract more diverse clients.',
      priority: 'medium',
      action: 'Add 2-3 complementary skills to your expertise'
    },
    {
      title: 'Optimize Pricing',
      description: 'Your completion rate is excellent. Consider a 10-15% rate increase.',
      priority: 'low',
      action: 'Test higher rates with new clients'
    }
  ];

  const handleExportData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Analytics data exported successfully!', 'success');
    }, 2000);
  };

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Data refreshed!', 'success');
    }, 1500);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-slate-600 dark:text-slate-400';
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? TrendingUp : TrendingDown;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
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
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Performance Analytics
              </h1>
              <p className="text-xl text-white max-w-3xl">
                Track your success metrics, analyze trends, and discover opportunities for growth
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-6 lg:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              
              <button
                onClick={handleRefreshData}
                disabled={loading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={handleExportData}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'recommendations', label: 'Recommendations', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className={`flex items-center space-x-1 ${getGrowthColor(analyticsData.earningsGrowth)}`}>
                    {React.createElement(getGrowthIcon(analyticsData.earningsGrowth), { className: 'w-4 h-4' })}
                    <span className="text-sm font-medium">{Math.abs(analyticsData.earningsGrowth)}%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  ${analyticsData.totalEarnings.toLocaleString()}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Earnings</p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className={`flex items-center space-x-1 ${getGrowthColor(analyticsData.consultationsGrowth)}`}>
                    {React.createElement(getGrowthIcon(analyticsData.consultationsGrowth), { className: 'w-4 h-4' })}
                    <span className="text-sm font-medium">{Math.abs(analyticsData.consultationsGrowth)}%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {analyticsData.totalConsultations}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Consultations</p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <Star className="w-8 h-8 text-yellow-500" />
                  <div className={`flex items-center space-x-1 ${getGrowthColor(analyticsData.ratingGrowth)}`}>
                    {React.createElement(getGrowthIcon(analyticsData.ratingGrowth), { className: 'w-4 h-4' })}
                    <span className="text-sm font-medium">{Math.abs(analyticsData.ratingGrowth)}%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {analyticsData.averageRating}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Average Rating</p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <div className={`flex items-center space-x-1 ${getGrowthColor(analyticsData.responseTimeGrowth)}`}>
                    {React.createElement(getGrowthIcon(analyticsData.responseTimeGrowth), { className: 'w-4 h-4' })}
                    <span className="text-sm font-medium">{Math.abs(analyticsData.responseTimeGrowth)}%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {analyticsData.responseTime}h
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</p>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Completion Rate</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.completionRate}%</span>
                  <span className="text-sm text-green-600 font-medium">Excellent</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.completionRate}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Industry average: 87%
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Client Retention</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.clientRetention}%</span>
                  <span className="text-sm text-blue-600 font-medium">Good</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.clientRetention}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Industry average: 65%
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-8">
            {/* Chart Placeholder */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Earnings Trend</h3>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">Interactive chart would be displayed here</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                    Showing earnings progression over {timeRange}
                  </p>
                </div>
              </div>
            </div>

            {/* Trend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {chartData.slice(-3).map((data, index) => (
                <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{data.month} Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Earnings:</span>
                      <span className="font-medium text-slate-900 dark:text-white">${data.earnings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Consultations:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{data.consultations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Rating:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{data.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border transition-all duration-300 ${
                  achievement.achieved 
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                    : 'border-slate-200/50 dark:border-slate-700/50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      achievement.achieved 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.achieved 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-slate-600 dark:text-slate-400'
                      }`} />
                    </div>
                    {achievement.achieved && (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                        Achieved
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    {achievement.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          achievement.achieved ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{rec.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">{rec.description}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      💡 {rec.action}
                    </p>
                  </div>
                  <Target className="w-6 h-6 text-slate-400 ml-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Resources Section */}
        <div className="mt-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Additional Analytics Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="https://analytics.google.com/analytics/academy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Analytics Academy
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Learn advanced analytics techniques</p>
              </div>
            </a>
            
            <a
              href="https://www.tableau.com/learn/training"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Data Visualization Training
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Master data visualization best practices</p>
              </div>
            </a>
            
            <a
              href="https://support.google.com/analytics/topic/9143232"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Analytics Help Center
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Comprehensive analytics documentation</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}