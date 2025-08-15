import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation with helpful error messages
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not set. Please add it to your .env file.');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not set. Please add it to your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('VITE_SUPABASE_URL is not a valid URL. Please check your .env file.');
}

// Log connection attempt for debugging (remove in production)
console.log('Connecting to Supabase:', supabaseUrl.replace(/\/\/.*@/, '//***@'));

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          is_expert: boolean;
          phone: string | null;
          location: string | null;
          bio: string | null;
          website: string | null;
          linkedin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_expert?: boolean;
          phone?: string | null;
          location?: string | null;
          bio?: string | null;
          website?: string | null;
          linkedin?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_expert?: boolean;
          phone?: string | null;
          location?: string | null;
          bio?: string | null;
          website?: string | null;
          linkedin?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      experts: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_title: string;
          description: string;
          hourly_rate: number;
          response_time?: string;
          verified?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_title?: string;
          description?: string;
          hourly_rate?: number;
          response_time?: string;
          verified?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      consultations: {
        Row: {
          id: string;
          expert_id: string;
          client_id: string;
          title: string;
          description: string;
          budget: number;
          timeline: string;
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expert_id: string;
          client_id: string;
          title: string;
          description: string;
          budget: number;
          timeline: string;
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          expert_id?: string;
          client_id?: string;
          title?: string;
          description?: string;
          budget?: number;
          timeline?: string;
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          expert_id: string;
          client_id: string;
          consultation_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          expert_id: string;
          client_id: string;
          consultation_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          expert_id?: string;
          client_id?: string;
          consultation_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
  };
};