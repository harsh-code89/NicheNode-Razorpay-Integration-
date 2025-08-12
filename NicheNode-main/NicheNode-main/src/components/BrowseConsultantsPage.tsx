import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, ArrowLeft, Filter, Zap, Loader } from 'lucide-react';
import { ExpertCard } from './ExpertCard';
import { ConsultationModal } from './ConsultationModal';
import { Web3ConsultationModal } from './Web3ConsultationModal';
import { FilterDropdown } from './FilterDropdown';
import { DropdownOption } from './DropdownButton';
import { useAuth } from '../hooks/useAuth';
import { useExperts, Expert } from '../hooks/useExperts';

interface BrowseConsultantsPageProps {
  onBack: () => void;
}

interface AISearchResult {
  consultants: (Expert & { similarity_score: number })[];
  total_results: number;
  query: string;
}

export function BrowseConsultantsPage({ onBack }: BrowseConsultantsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showWeb3ConsultationForm, setShowWeb3ConsultationForm] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<AISearchResult | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [useAiSearch, setUseAiSearch] = useState(false);
  
  const { user } = useAuth();
  const { experts, loading, searchExperts, fetchExperts } = useExperts();

  // Filter options
  const priceOptions: DropdownOption[] = [
    { id: 'all', label: 'All Prices' },
    { id: 'under50', label: 'Under $50/hour' },
    { id: '50to100', label: '$50 - $100/hour' },
    { id: '100to200', label: '$100 - $200/hour' },
    { id: 'over200', label: 'Over $200/hour' }
  ];

  const ratingOptions: DropdownOption[] = [
    { id: 'all', label: 'All Ratings' },
    { id: '4plus', label: '4+ Stars' },
    { id: '3plus', label: '3+ Stars' },
    { id: '2plus', label: '2+ Stars' }
  ];

  const categoryOptions: DropdownOption[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'programming', label: 'Programming & Development' },
    { id: 'design', label: 'Design & Creative' },
    { id: 'business', label: 'Business & Consulting' },
    { id: 'academic', label: 'Academic & Research' },
    { id: 'technical', label: 'Technical & Engineering' },
    { id: 'arts', label: 'Arts & Culture' }
  ];

  useEffect(() => {
    if (!useAiSearch) {
      // Use traditional search
      if (searchTerm.trim()) {
        const debounceTimer = setTimeout(() => {
          searchExperts(searchTerm);
        }, 300);
        return () => clearTimeout(debounceTimer);
      } else {
        fetchExperts();
      }
    }
  }, [searchTerm, useAiSearch]);

  const handleAiSearch = async (query: string) => {
    if (!query.trim()) {
      setAiSearchResults(null);
      setUseAiSearch(false);
      return;
    }

    setIsAiSearching(true);
    setUseAiSearch(true);
    
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-skills/search?query=${encodeURIComponent(query)}&limit=20`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        }
      });

      if (!response.ok) {
        let errorMessage = 'AI search request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const results = await response.json();
      setAiSearchResults(results);
    } catch (error) {
      console.error('AI search error:', error);
      // Fall back to traditional search
      setUseAiSearch(false);
      searchExperts(query);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    if (value.trim()) {
      const debounceTimer = setTimeout(() => {
        handleAiSearch(value);
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setAiSearchResults(null);
      setUseAiSearch(false);
    }
  };

  const handleConsultationRequest = (expert: Expert) => {
    if (!user) {
      alert('Please sign in to request a consultation');
      return;
    }
    setSelectedExpert(expert);
    setShowConsultationForm(true);
  };

  const handleWeb3ConsultationRequest = (expert: Expert) => {
    if (!user) {
      alert('Please sign in to request a Web3 consultation');
      return;
    }
    setSelectedExpert(expert);
    setShowWeb3ConsultationForm(true);
  };

  // Get the experts to display based on search type
  const displayExperts = useAiSearch && aiSearchResults 
    ? aiSearchResults.consultants 
    : experts;

  const filteredExperts = displayExperts.filter(expert => {
    // Price filter
    if (priceFilter !== 'all') {
      const rate = expert.hourly_rate;
      switch (priceFilter) {
        case 'under50':
          if (rate >= 50) return false;
          break;
        case '50to100':
          if (rate < 50 || rate > 100) return false;
          break;
        case '100to200':
          if (rate < 100 || rate > 200) return false;
          break;
        case 'over200':
          if (rate <= 200) return false;
          break;
      }
    }

    // Rating filter
    if (ratingFilter !== 'all' && expert.reviews) {
      const avgRating = expert.reviews.length > 0
        ? expert.reviews.reduce((sum, review) => sum + review.rating, 0) / expert.reviews.length
        : 0;
      
      switch (ratingFilter) {
        case '4plus':
          if (avgRating < 4) return false;
          break;
        case '3plus':
          if (avgRating < 3) return false;
          break;
        case '2plus':
          if (avgRating < 2) return false;
          break;
      }
    }

    // Category filter (simplified - in real app would use proper categorization)
    if (categoryFilter !== 'all') {
      const skillTitle = expert.skill_title.toLowerCase();
      const description = expert.description.toLowerCase();
      const tags = expert.tags.join(' ').toLowerCase();
      const searchText = `${skillTitle} ${description} ${tags}`;
      
      switch (categoryFilter) {
        case 'programming':
          if (!searchText.includes('programming') && !searchText.includes('code') && !searchText.includes('software')) return false;
          break;
        case 'design':
          if (!searchText.includes('design') && !searchText.includes('creative') && !searchText.includes('art')) return false;
          break;
        case 'business':
          if (!searchText.includes('business') && !searchText.includes('consulting') && !searchText.includes('strategy')) return false;
          break;
        case 'academic':
          if (!searchText.includes('academic') && !searchText.includes('research') && !searchText.includes('professor')) return false;
          break;
        case 'technical':
          if (!searchText.includes('technical') && !searchText.includes('engineering') && !searchText.includes('system')) return false;
          break;
        case 'arts':
          if (!searchText.includes('art') && !searchText.includes('culture') && !searchText.includes('history')) return false;
          break;
      }
    }

    return true;
  });

  const isLoading = loading || isAiSearching;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Consultants</h1>
          <p className="text-slate-600">
            Find experts with specialized knowledge in niche fields
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for skills, expertise, or keywords..."
                className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {isAiSearching && (
                <Loader className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
              )}
            </div>

            {/* AI Search Indicator */}
            {useAiSearch && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <Zap className="w-4 h-4" />
                <span>AI-Powered Search</span>
              </div>
            )}

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* AI Search Results Info */}
          {useAiSearch && aiSearchResults && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Zap className="w-4 h-4 inline mr-1" />
                Found {aiSearchResults.total_results} consultants matching "{aiSearchResults.query}" using AI semantic search
              </p>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FilterDropdown
                  label="Price Range (per hour)"
                  options={priceOptions}
                  selectedId={priceFilter}
                  onSelect={(option) => setPriceFilter(option.id)}
                  placeholder="All Prices"
                />

                <FilterDropdown
                  label="Minimum Rating"
                  options={ratingOptions}
                  selectedId={ratingFilter}
                  onSelect={(option) => setRatingFilter(option.id)}
                  placeholder="All Ratings"
                />

                <FilterDropdown
                  label="Category"
                  options={categoryOptions}
                  selectedId={categoryFilter}
                  onSelect={(option) => setCategoryFilter(option.id)}
                  placeholder="All Categories"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-slate-600">
            {isLoading ? 'Searching...' : `${filteredExperts.length} consultant${filteredExperts.length !== 1 ? 's' : ''} found`}
            {useAiSearch && aiSearchResults && (
              <span className="ml-2 text-blue-600 text-sm">
                (AI-powered results)
              </span>
            )}
          </p>
        </div>

        {/* Expert Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">
              {isAiSearching ? 'AI is finding the best matches...' : 'Loading consultants...'}
            </p>
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No consultants found matching your criteria.</p>
            <p className="text-slate-500 mt-2">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredExperts.map((expert) => (
              <div key={expert.id} className="relative">
                <ExpertCard
                  expert={expert}
                  onRequestConsultation={handleConsultationRequest}
                  onRequestWeb3Consultation={handleWeb3ConsultationRequest}
                />
                {/* Show similarity score for AI search results */}
                {useAiSearch && 'similarity_score' in expert && (
                  <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {Math.round((expert as any).similarity_score * 100)}% match
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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