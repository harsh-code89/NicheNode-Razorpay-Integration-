import React from 'react';
import { Star, Clock, MessageCircle, CheckCircle, Zap, Wallet } from 'lucide-react';
import { Expert } from '../hooks/useExperts';

interface ExpertCardProps {
  expert: Expert;
  onRequestConsultation: (expert: Expert) => void;
  onRequestWeb3Consultation?: (expert: Expert) => void;
}

export function ExpertCard({ expert, onRequestConsultation, onRequestWeb3Consultation }: ExpertCardProps) {
  const averageRating = expert.reviews && expert.reviews.length > 0
    ? expert.reviews.reduce((sum, review) => sum + review.rating, 0) / expert.reviews.length
    : 0;

  const reviewCount = expert.reviews?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={expert.profiles?.avatar_url || `https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400`}
          alt={expert.profiles?.full_name || 'Expert'}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-xl font-semibold text-slate-900">
              {expert.profiles?.full_name || 'Expert'}
            </h3>
            {expert.verified && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
            )}
          </div>
          <p className="text-blue-600 font-medium mb-2">{expert.skill_title}</p>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{averageRating > 0 ? averageRating.toFixed(1) : 'New'}</span>
              <span>({reviewCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{expert.response_time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      {expert.verified && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">AI Verified Skill</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs text-green-700 mt-1">
            This consultant's expertise has been verified by our AI system for authenticity and technical depth.
          </p>
        </div>
      )}

      <p className="text-slate-600 mb-4 line-clamp-3">{expert.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {expert.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-slate-900">
          ${expert.hourly_rate}
          <span className="text-lg font-normal text-slate-600">/hour</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => onRequestConsultation(expert)}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Request Consultation</span>
        </button>
        
        {onRequestWeb3Consultation && (
          <button
            onClick={() => onRequestWeb3Consultation(expert)}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>Web3 Consultation</span>
          </button>
        )}
      </div>
    </div>
  );
}