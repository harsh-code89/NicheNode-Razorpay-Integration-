import React, { useState } from 'react';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';

interface CustomAuthPageProps {
  onBack: () => void;
}

export function CustomAuthPage({ onBack }: CustomAuthPageProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    userType: 'seeker' as 'consultant' | 'seeker'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = mode === 'register' ? '/register' : '/login';
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-api${endpoint}`;
      
      const payload = mode === 'register' 
        ? {
            username: formData.username,
            password: formData.password,
            user_type: formData.userType,
            full_name: formData.fullName
          }
        : {
            username: formData.username,
            password: formData.password
          };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      if (mode === 'register') {
        setMessage('Registration successful! You can now sign in with your credentials.');
        setMode('login');
      } else {
        setMessage('Login successful! Token: ' + data.access_token.substring(0, 20) + '...');
        // In a real app, you would store the token and redirect
        localStorage.setItem('custom_auth_token', data.access_token);
      }

    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Custom API {mode === 'register' ? 'Registration' : 'Login'}
            </h1>
            <p className="text-slate-600 mt-2">
              Using custom API endpoints alongside Supabase
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    User Type
                  </label>
                  <select
                    value={formData.userType}
                    onChange={(e) => setFormData({...formData, userType: e.target.value as 'consultant' | 'seeker'})}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="seeker">Seeker (Looking for expertise)</option>
                    <option value="consultant">Consultant (Offering expertise)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-green-50 text-green-600'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'register' ? 'Register' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === 'register' ? 'Sign in' : 'Register'}
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-2">API Endpoints Available:</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• POST /register - Create new user account</li>
              <li>• POST /login - Authenticate user</li>
              <li>• POST /consultants/profile - Create/update consultant profile</li>
              <li>• GET /consultants - List all consultants</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}