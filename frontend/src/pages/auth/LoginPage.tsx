import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(emailOrPhone, password);
      if (user.role === 'APPLICANT') {
        navigate('/dashboard');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative bg-white overflow-x-hidden font-sans select-none">
      {/* =========================================================================
          LEFT PANEL: Deep Navy (~40% width on desktop) with Campus Image & Crest
         ========================================================================= */}
      <div className="w-full md:w-[40%] lg:w-[38%] bg-[#0F223D] flex flex-col justify-between relative min-h-[460px] md:min-h-screen shrink-0 z-0">
        {/* Top Campus Building Photo with smooth downward gradient fade */}
        <div className="relative h-64 sm:h-72 md:h-[40vh] w-full overflow-hidden">
          <img
            src="/kictamc-campus.jpg"
            alt="KICTAMC College Campus"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Vertical gradient overlay smoothly fading the photo into the solid navy panel */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F223D]/50 to-[#0F223D]" />
        </div>

        {/* Center Branding Content (College Crest, KICTAMC, Subtitle, Motto & Tagline) */}
        <div className="my-auto py-8 px-6 text-center z-10 flex flex-col items-center">
          {/* Official College Crest Seal */}
          <img
            src="/kictamc-logo.png"
            alt="KICTAMC College Crest"
            className="w-24 sm:w-28 h-auto object-contain mb-3 drop-shadow-xl"
          />

          <h2 className="text-2xl sm:text-[28px] font-bold tracking-[0.14em] text-white uppercase font-sans">
            KICTAMC
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 font-normal mt-1 tracking-wide">
            Kenema ICT & Management College
          </p>

          <p className="text-[11px] uppercase tracking-widest text-gold-400 font-semibold mt-4">
            Non Sibi Sed Patriae
          </p>
          <p className="text-xs sm:text-sm text-slate-300 font-normal mt-2 tracking-wide">
            Your Future, Our Priority
          </p>
        </div>

        {/* Bottom spacer for balanced alignment */}
        <div className="h-10 hidden md:block" />
      </div>

      {/* =========================================================================
          RIGHT SECTION: Pure White Background with Centered Floating Card
         ========================================================================= */}
      <div className="flex-1 bg-white relative flex items-center justify-center p-6 sm:p-8 md:p-12 z-10">
        {/* Floating Login Card centered in the right section with balanced margins */}
        <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.10)] border border-slate-100 p-8 sm:p-11 transition-all">
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#0F223D] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-normal">
              Sign in to your student account
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Phone Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email or Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter your email or phone number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F223D]/15 focus:border-[#0F223D] transition-colors placeholder:text-slate-400 bg-white text-slate-900"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F223D]/15 focus:border-[#0F223D] transition-colors placeholder:text-slate-400 bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0F223D] focus:ring-[#0F223D]"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 text-sm font-normal"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#0A1C33] hover:bg-[#122A4A] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 mt-3"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Registration & Help Links */}
          <div className="mt-8 text-center text-sm text-slate-600 space-y-3">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:underline">
                Create an account
              </Link>
            </p>
            <p>
              Need help?{' '}
              <Link to="/support" className="font-medium text-blue-600 hover:underline">
                Contact Admissions
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
