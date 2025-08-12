import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Expert } from '../hooks/useExperts';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface ConsultationModalProps {
  expert: Expert | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConsultationModal({ expert, isOpen, onClose }: ConsultationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(0);
  const [timeline, setTimeline] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!isOpen || !expert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('consultations')
        .insert({
          expert_id: expert.id,
          client_id: user.id,
          title,
          description,
          budget,
          timeline,
          status: 'pending',
        });

      if (error) throw error;

      alert(`Consultation request sent to ${expert.profiles?.full_name}! They typically respond within ${expert.response_time}.`);
      onClose();
      setTitle('');
      setDescription('');
      setBudget(0);
      setTimeline('');
    } catch (err) {
      alert('Error sending consultation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={expert.profiles?.avatar_url || `https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400`}
              alt={expert.profiles?.full_name || 'Expert'}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {expert.profiles?.full_name || 'Expert'}
              </h3>
              <p className="text-blue-600 font-medium">{expert.skill_title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Consultation Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief title for your consultation request"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Description
            </label>
            <textarea
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your project, challenge, or question in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Budget Range
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                required
              >
                <option value={0}>Select budget range</option>
                <option value={100}>$50 - $100</option>
                <option value={250}>$100 - $250</option>
                <option value={500}>$250 - $500</option>
                <option value={1000}>$500 - $1000</option>
                <option value={2000}>$1000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timeline
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                required
              >
                <option value="">Select timeline</option>
                <option value="urgent">Urgent (within 24 hours)</option>
                <option value="week">Within a week</option>
                <option value="month">Within a month</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}