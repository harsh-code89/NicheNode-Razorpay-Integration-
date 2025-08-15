import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle remember me functionality
    if (!error && rememberMe) {
      localStorage.setItem('nichenode_remember_me', 'true');
    } else {
      localStorage.removeItem('nichenode_remember_me');
    }

    return { data, error };
  };

  const signInWithProvider = async (provider: string, rememberMe: boolean = false) => {
    // Map provider names to Supabase provider types
    const providerMap: { [key: string]: any } = {
      google: 'google',
      facebook: 'facebook',
      apple: 'apple',
      twitter: 'twitter',
      linkedin: 'linkedin_oidc'
    };

    const supabaseProvider = providerMap[provider.toLowerCase()];
    
    if (!supabaseProvider) {
      return { data: null, error: new Error(`Provider ${provider} not supported`) };
    }

    // Handle remember me for social auth
    if (rememberMe) {
      localStorage.setItem('nichenode_remember_me', 'true');
      localStorage.setItem('nichenode_social_provider', provider);
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    return { data, error };
  };

  const signInWithPhone = async (phone: string, password: string, rememberMe: boolean = false) => {
    // This would integrate with Supabase phone auth
    // For now, we'll simulate the functionality
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password,
    });

    if (!error && rememberMe) {
      localStorage.setItem('nichenode_remember_me', 'true');
      localStorage.setItem('nichenode_phone_auth', 'true');
    }

    return { data, error };
  };

  const signInWithSSO = async (domain: string, provider: string, rememberMe: boolean = false) => {
    // This would integrate with enterprise SSO providers
    // For demo purposes, we'll simulate the flow
    try {
      // In a real implementation, this would redirect to the SSO provider
      const mockSSOResponse = {
        user: {
          id: 'sso-user-' + Date.now(),
          email: `user@${domain}`,
          user_metadata: {
            full_name: 'SSO User',
            provider: provider,
            domain: domain
          }
        }
      };

      if (rememberMe) {
        localStorage.setItem('nichenode_remember_me', 'true');
        localStorage.setItem('nichenode_sso_domain', domain);
        localStorage.setItem('nichenode_sso_provider', provider);
      }

      return { data: mockSSOResponse, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    // Clear remember me settings
    localStorage.removeItem('nichenode_remember_me');
    localStorage.removeItem('nichenode_social_provider');
    localStorage.removeItem('nichenode_phone_auth');
    localStorage.removeItem('nichenode_sso_domain');
    localStorage.removeItem('nichenode_sso_provider');

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  };

  const linkAccount = async (provider: string) => {
    // This would handle linking multiple auth methods to the same account
    const { data, error } = await supabase.auth.linkIdentity({
      provider: provider as any
    });
    return { data, error };
  };

  const unlinkAccount = async (provider: string) => {
    // This would handle unlinking auth methods from an account
    const { data, error } = await supabase.auth.unlinkIdentity({
      provider: provider as any
    });
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signInWithPhone,
    signInWithSSO,
    signOut,
    resetPassword,
    updatePassword,
    linkAccount,
    unlinkAccount,
  };
}