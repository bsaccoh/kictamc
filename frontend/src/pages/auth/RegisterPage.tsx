import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('You must agree to the Terms and Conditions and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        firstName: formData.firstName,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptTerms: true,
      });

      if (result.verificationCode) {
        setSuccessInfo(
          `Account created successfully! Your verification code is: ${result.verificationCode}`
        );
        setTimeout(() => {
          navigate('/verify-contact', { state: { email: formData.email, code: result.verificationCode } });
        }, 1500);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-block">
          <img
            src="/kictamc-logo.png"
            alt="KICTAMC College Crest"
            className="w-16 h-16 object-contain mx-auto mb-2.5 drop-shadow-md"
          />
        </Link>
        <h2 className="text-lg font-black tracking-widest text-slate-800 uppercase font-serif">
          KICTAMC
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Kenema ICT & Management College
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl shadow-md border border-slate-200">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Create your applicant account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Fill in the form below to create your account and start your 2025/2026 application.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successInfo && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successInfo}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: First Name & Surname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600 transition-colors placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Surname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="surname"
                  required
                  placeholder="Enter surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600 transition-colors placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Row 2: Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600 transition-colors placeholder:text-slate-400"
              />
            </div>

            {/* Row 3: Mobile Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600 transition-colors placeholder:text-slate-400"
              />
            </div>

            {/* Row 4: Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 pr-10 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600 transition-colors placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Row 5: Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 pr-10 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600 transition-colors placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 mt-0.5 rounded border-slate-300 text-navy-800 focus:ring-navy-600"
                />
                <span>
                  I agree to the <span className="text-blue-600 hover:underline">Terms and Conditions</span> and{' '}
                  <span className="text-blue-600 hover:underline">Privacy Policy</span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#10223B] hover:bg-[#162D4E] text-white rounded-md text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-5 mt-6 border-t border-slate-100 text-center text-xs text-slate-600 space-y-1">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-[11px] text-slate-400">
              Need help?{' '}
              <Link to="/support" className="text-slate-600 hover:underline">
                Contact Admissions
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
