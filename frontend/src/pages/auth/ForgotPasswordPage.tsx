import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const res: any = await api.post('/auth/forgot-password', { email });
      setMessage(res.message);
      if (res.devCode) {
        setDevCode(res.devCode);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
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
        <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Reset Password</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your registered email address to receive reset instructions
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

          {message && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-emerald-800 text-sm">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p>{message}</p>
                {devCode && (
                  <div className="mt-2 text-xs bg-white p-2 rounded border border-emerald-200 font-mono text-emerald-950">
                    Dev Reset Token: <strong>{devCode}</strong>
                  </div>
                )}
                <Button
                  variant="secondary"
                  className="mt-3 text-xs py-1.5"
                  onClick={() => navigate('/reset-password', { state: { token: devCode } })}
                >
                  Proceed to Reset Form
                </Button>
              </div>
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="applicant@kictamc.edu.sl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                Send Reset Code
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-600 border-t border-slate-100 pt-4">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-navy-800 hover:text-navy-900 hover:underline">
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
