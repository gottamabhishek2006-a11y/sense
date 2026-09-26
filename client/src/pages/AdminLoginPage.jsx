import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { authAPI } from '../services/api';

/**
 * AdminLoginPage — Dedicated admin authentication page.
 *
 * This page is intentionally not linked anywhere in the normal citizen UI.
 * It is accessible at /admin/login for administrators who know the URL.
 * "Hiding" this URL is NOT the security mechanism — the backend independently
 * verifies that the authenticated account has role === 'admin'.
 *
 * Citizen credentials here will always return 401 Invalid credentials.
 */
const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // Use dedicated admin login endpoint — not the citizen /login endpoint
      const data = await authAPI.adminLogin({ email: cleanEmail, password: cleanPassword });

      if (data.token && data.user && data.user.role === 'admin') {
        // Store token and user (admin role comes from server, not client)
        localStorage.setItem('civicfix_token', data.token);
        localStorage.setItem('civicfix_user', JSON.stringify(data.user));

        // Reload to re-initialize AuthContext with new admin session
        window.location.href = '/admin';
      } else {
        setError('Invalid administrative credentials.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid administrative credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-transparent relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-indigo-950/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white shadow-lg shadow-indigo-700/30 mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Administrative Access
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Municipal authorized personnel only
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-6 sm:p-8 space-y-5"
          style={{
            background: 'rgba(20, 25, 40, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-700/30 text-xs text-indigo-300 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              This portal is for authorized municipal administrators only. All access attempts are logged.
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-700/40 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="admin@domain.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-600/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/60 border border-slate-600/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 p-0.5"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-all shadow-md shadow-indigo-700/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Municipal Console</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to public site — no link to citizen login from here */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Not an administrator?{' '}
          <a
            href="/"
            className="font-semibold text-slate-500 hover:text-slate-400 transition-colors"
          >
            Return to CivicSense
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
