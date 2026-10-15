import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  Building,
  User,
  Calendar,
  CreditCard,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../services/api';

export const TokenLookupPage: React.FC = () => {
  const { token: urlToken } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState(urlToken || '');
  const [searchToken, setSearchToken] = useState(urlToken || '');

  useEffect(() => {
    if (urlToken) {
      setTokenInput(urlToken);
      setSearchToken(urlToken);
    }
  }, [urlToken]);

  const { data: tokenResult, isLoading, error } = useQuery({
    queryKey: ['token-lookup', searchToken],
    queryFn: async () => {
      if (!searchToken.trim()) return null;
      return api.get<any>(`/tokens/${encodeURIComponent(searchToken.trim().toUpperCase())}`);
    },
    enabled: !!searchToken.trim(),
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      setSearchToken(tokenInput.trim().toUpperCase());
      navigate(`/verify-token/${encodeURIComponent(tokenInput.trim().toUpperCase())}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Top Back Link */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-gold-400 font-serif font-black flex items-center justify-center text-xl mx-auto mb-3 shadow-md border-2 border-gold-500">
              K
            </div>
            <h1 className="text-2xl font-serif font-bold text-navy-950">
              Payment Token Verification
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify cryptographic payment authenticity for KICTAMC admissions
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter token e.g. KICTAMC-PAY-7F3A9C82"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-sm font-mono uppercase tracking-wider"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-navy-800 hover:bg-navy-900 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                Verify
              </button>
            </div>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-navy-800 border-t-gold-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Verifying cryptographic token with KICTAMC ledger...</p>
            </div>
          )}

          {/* Invalid / Not Found State */}
          {error && searchToken && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-red-900 mb-1">
                Invalid or Unissued Token
              </h3>
              <p className="text-sm text-red-700 max-w-md mx-auto">
                No verified payment record exists for token <strong>{searchToken}</strong>. 
                Please ensure the token was entered correctly.
              </p>
            </div>
          )}

          {/* Valid Token Result */}
          {tokenResult && (
            <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 text-emerald-800 mb-6 pb-4 border-b border-emerald-200">
                <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-emerald-950">
                    Officially Confirmed Payment
                  </h3>
                  <p className="text-xs text-emerald-700">
                    This token is authentic and recorded in the Kenema ICT & Management College finance ledger.
                  </p>
                </div>
              </div>

              {/* Token Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Token Number</span>
                  <div className="font-mono font-bold text-navy-950 text-base mt-0.5">
                    {tokenResult.token}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Application Reference</span>
                  <div className="font-mono font-bold text-navy-900 text-base mt-0.5">
                    {tokenResult.applicationReference}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Candidate Name</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {tokenResult.applicantName}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Program Applied</span>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {tokenResult.courseName}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Amount Verified</span>
                  <div className="font-serif font-extrabold text-navy-900 text-base mt-0.5">
                    SLE {tokenResult.amountPaidSLE}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Verified Date</span>
                  <div className="text-slate-800 font-medium mt-0.5">
                    {new Date(tokenResult.issuedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-200 flex justify-between items-center text-xs text-slate-500">
                <span>Verified by: <strong>{tokenResult.verifiedBy}</strong></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Status: Valid & Active
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
