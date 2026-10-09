import React, { useState } from 'react';
import { PathfinderLogo } from '../components/common/PathfinderLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Lock, User, Eye, EyeOff, Shield, ArrowRight, AlertCircle } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { success, error } = useToast();

  // No prefilled values as required by security guidelines
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!identifier.trim()) {
      setFormError('Please enter your administrator username or email.');
      return;
    }

    if (!password) {
      setFormError('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier, password, 'admin');
      if (res.success) {
        success(res.message);
        onNavigate('admin');
      } else {
        setFormError(res.message);
        error(res.message);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Authentication failed.');
      error(err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="max-w-md w-full mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div
            onClick={() => onNavigate('landing')}
            className="inline-block cursor-pointer hover:opacity-90 transition-opacity"
          >
            <PathfinderLogo size={80} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-800" />
            <span>Pathfinder Internal Security</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B2147] tracking-tight">
            Administrator Console Login
          </h1>
          <p className="text-xs text-slate-500">
            Authorized academic faculty and institute staff only
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed">{formError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter administrator ID..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2147] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full pl-10 pr-11 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2147] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-[#0B2147] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center text-xs text-slate-500">
          <button
            onClick={() => onNavigate('landing')}
            className="hover:text-slate-800 underline underline-offset-4"
          >
            ← Return to Public Portal
          </button>
        </div>
      </div>
    </div>
  );
};
