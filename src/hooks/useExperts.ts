import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Expert {
  id: string;
  user_id: string;
  skill_title: string;
  description: string;
  hourly_rate: number;
  response_time: string;
  verified: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
  reviews?: {
    rating: number;
  }[];
}

export function useExperts() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experts')
        .select(`
          *,
          profiles!experts_user_id_fkey (
            full_name,
            avatar_url
          ),
          reviews (
            rating
          )
        `)
        .eq('verified', true);

      if (error) throw error;
      setExperts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const searchExperts = async (searchTerm: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experts')
        .select(`
          *,
          profiles!experts_user_id_fkey (
            full_name,
            avatar_url
          ),
          reviews (
            rating
          )
        `)
        .eq('verified', true)
        .or(`skill_title.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);

      if (error) throw error;
      setExperts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    experts,
    loading,
    error,
    fetchExperts,
    searchExperts,
  };
}