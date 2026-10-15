import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const VerifyContactPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const initialCode = (location.state as any)?.code || '';
  const [token, setToken] = useState(initialCode);
  const [type, setType] = useState<'EMAIL_VERIFICATION' | 'SMS_OTP'>('EMAIL_VERIFICATION');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await api.post('/auth/verify-otp', {
        token: token.trim(),
        type,
      });

      setSuccess('Verification successful! Your contact details have been confirmed.');
      await refreshProfile();
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the 6-digit code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-3">
          <img
            src="/kictamc-logo.png"
            alt="KICTAMC College Crest"
            className="w-16 h-16 object-contain mx-auto drop-shadow-md"
          />
        </Link>
        <h2 className="text-2xl font-bold text-navy-900 tracking-tight">
          Verify Contact Details
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Please enter the 6-digit code sent to your email or mobile phone
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-6 py-8 shadow-md border-slate-200">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {initialCode && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              <span className="font-semibold block">Development Mode OTP:</span>
              Your verification code is pre-filled: <strong>{initialCode}</strong>
            </div>
          )}

          <div className="flex rounded-md bg-slate-100 p-1 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setType('EMAIL_VERIFICATION')}
              className={`flex-1 py-1.5 rounded transition ${
                type === 'EMAIL_VERIFICATION' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Email Verification
            </button>
            <button
              type="button"
              onClick={() => setType('SMS_OTP')}
              className={`flex-1 py-1.5 rounded transition ${
                type === 'SMS_OTP' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              SMS OTP
            </button>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="6-Digit Verification Code"
              type="text"
              maxLength={6}
              placeholder="e.g. 123456"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="text-center text-lg tracking-widest font-mono"
            />

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Confirm & Continue to Dashboard
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Didn't receive a code?{' '}
            <button
              onClick={() => alert('Code re-sent in dev console.')}
              className="font-medium text-navy-800 hover:underline"
            >
              Resend Code
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
