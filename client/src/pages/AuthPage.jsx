import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import {
  ShieldAlert,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
  Edit2,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, isLoading: authLoading, error: authError, clearError } = useAuth();

  // Multi-step state: 'email' | 'login' | 'signup'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [formError, setFormError] = useState('');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Preserve redirect destination
  const from = location.state?.from?.pathname || searchParams.get('from') || null;

  useEffect(() => {
    clearError();
  }, [step]);

  // Password rules validation criteria
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Step 1: Check Email Existence
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setFormError('Please enter your email address to continue.');
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setFormError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setIsCheckingEmail(true);

    try {
      const data = await authAPI.checkEmail(normalizedEmail);
      setEmail(normalizedEmail);
      if (data.exists) {
        setStep('login');
      } else {
        setStep('signup');
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Unable to verify email address. Please try again.'
      );
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Step 2: Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    const cleanPassword = password.trim();

    if (!cleanPassword) {
      setFormError('Please enter your password.');
      return;
    }

    const result = await login({ email, password: cleanPassword });
    if (result.success) {
      if (from) {
        navigate(from, { replace: true });
      } else if (result.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  // Step 3: Handle Signup
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!name.trim() || !password || !confirmPassword) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (name.trim().length < 2) {
      setFormError('Full name must be at least 2 characters long.');
      return;
    }

    if (!isPasswordValid) {
      setFormError('Password does not satisfy the security requirements below.');
      return;
    }

    if (!passwordsMatch) {
      setFormError('Passwords do not match. Please verify.');
      return;
    }

    const result = await signup({
      name: name.trim(),
      email,
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
      role: 'citizen',
    });

    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setPassword('');
    setConfirmPassword('');
    setFormError('');
    clearError();
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-transparent relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-emerald-950/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Civic<span className="text-emerald-600">Fix</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {step === 'email' && 'Get Started with CivicFix'}
            {step === 'login' && 'Welcome Back'}
            {step === 'signup' && 'Create Citizen Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {step === 'email' &&
              'Enter your email address to sign in or create a real citizen account.'}
            {step === 'login' &&
              'An account was found with your email. Please enter your password.'}
            {step === 'signup' &&
              'No account found with this email. Complete registration to get started.'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8 space-y-6"
          style={{
            background: 'rgba(235, 245, 238, 0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(180, 206, 188, 0.45)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Error Banner */}
          {(formError || authError) && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{formError || authError}</span>
            </div>
          )}

          {/* Active Email Pill (for Steps 2 and 3) */}
          {step !== 'email' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700 truncate pr-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
              >
                <Edit2 className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>
          )}

          {/* STEP 1: EMAIL ENTRY */}
          {step === 'email' && (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              <div>
                <label
                  htmlFor="auth-email-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    autoFocus
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                id="auth-continue-btn"
                type="submit"
                disabled={isCheckingEmail}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/25"
              >
                {isCheckingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking account...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: PASSWORD LOGIN (EXISTING USER) */}
          {step === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <button
                id="auth-login-submit-btn"
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/25"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: ACCOUNT SIGNUP (NEW USER) */}
          {step === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Default Role Indicator */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Assigned Role:</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-200 text-emerald-900">
                  Citizen
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="signup-name-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g., Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                {password.length > 0 && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                      Security Requirements:
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                        <Check className={`w-3 h-3 ${passwordChecks.length ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span>8+ Characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordChecks.uppercase ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                        <Check className={`w-3 h-3 ${passwordChecks.uppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span>1 Uppercase</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordChecks.lowercase ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                        <Check className={`w-3 h-3 ${passwordChecks.lowercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span>1 Lowercase</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordChecks.number ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                        <Check className={`w-3 h-3 ${passwordChecks.number ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span>1 Number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordChecks.special ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                        <Check className={`w-3 h-3 ${passwordChecks.special ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span>1 Special (!@#$)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="signup-confirm-password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="signup-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      confirmPassword && !passwordsMatch
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                        : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                id="auth-signup-submit-btn"
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/25"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <span>Create Citizen Account</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security Assurance */}
        <div className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted with bcrypt & JWT session security</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
            {forgotSent ? (
              <div className="space-y-3 text-center py-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs text-slate-600">
                  Password reset link sent to <strong>{forgotEmail}</strong>. Please check your inbox.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered email address and we'll send a password recovery token.
                </p>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
