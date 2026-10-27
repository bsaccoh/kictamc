import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  FinanceDashboardContent,
  FinanceDashboardData,
  RecentTransactionItem,
} from '../../components/finance/FinanceDashboardContent';
import { BookOpen, CheckCircle, ShieldAlert, X } from 'lucide-react';

export const FinanceDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Fetch real data from server API with active period filter
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<FinanceDashboardData>({
    queryKey: ['admin-finance-dashboard', selectedPeriod],
    queryFn: async () => {
      return api.get<FinanceDashboardData>(`/admin/payments/dashboard?period=${selectedPeriod}`);
    },
    staleTime: 30000,
  });

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'verification':
        navigate('/admin/payments?status=PENDING_VERIFICATION');
        break;
      case 'transactions':
        navigate('/admin/payments');
        break;
      case 'receipts':
        navigate('/verify-token');
        break;
      case 'reports':
        navigate('/admin/reports');
        break;
      case 'fees':
        navigate('/admin/fees');
        break;
      case 'payment-guide':
        setIsGuideOpen(true);
        break;
      default:
        break;
    }
  };

  const handleTransactionSelect = (tx: RecentTransactionItem) => {
    if (tx.href) {
      navigate(tx.href);
    } else {
      navigate('/admin/payments');
    }
  };

  return (
    <>
      <FinanceDashboardContent
        data={data}
        isLoading={isLoading}
        error={error ? (error as Error).message || 'Unable to connect to financial server.' : null}
        onRetry={() => refetch()}
        selectedPeriod={selectedPeriod}
        onPeriodChange={(newPeriod) => setSelectedPeriod(newPeriod)}
        onAction={handleAction}
        onViewAllTransactions={() => navigate('/admin/payments')}
        onTransactionSelect={handleTransactionSelect}
      />

      {/* Payment Verification Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-navy-50 text-navy-800 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5 text-[#142d4e]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#142d4e]">
                  Official Payment Verification Guide
                </h3>
                <p className="text-xs text-slate-500">
                  Standard operating procedures for KICTAMC Finance Officers
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-900 leading-relaxed">
                  <strong>Verification Audit Rule:</strong> Uploaded teller slips or transaction
                  receipts represent candidate claims awaiting clearance. An upload alone must not
                  be recorded as verified revenue until confirmed in the college account.
                </p>
              </div>

              <ol className="space-y-2.5 list-decimal pl-4 leading-relaxed">
                <li>
                  <strong>Match Reference Codes:</strong> Compare the candidate’s submitted teller
                  or mobile money transaction reference against the official bank statement or
                  mobile provider merchant dashboard.
                </li>
                <li>
                  <strong>Verify Exact Tariff:</strong> Ensure the deposited amount equals or
                  exceeds the approved fee tariff (e.g., SLE 2,500.00 for Application Fee).
                </li>
                <li>
                  <strong>Approve &amp; Issue Token:</strong> In the Payment Ledger, click
                  &quot;Verify Payment&quot;. The system will automatically generate a cryptographically
                  verifiable Payment Confirmation Token (e.g. <code>KICTAMC-PAY-XXXXXXXX</code>) and
                  advance the candidate&apos;s application to &quot;Under Review&quot;.
                </li>
                <li>
                  <strong>Handling Irregularities:</strong> If evidence is illegible, counterfeit, or
                  mismatched, click &quot;Reject Payment&quot; and state the precise audit reason so the
                  applicant can rectify it.
                </li>
              </ol>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setIsGuideOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsGuideOpen(false);
                  navigate('/admin/payments?status=PENDING_VERIFICATION');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#142d4e] hover:bg-[#1c416d] rounded-lg transition shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Go to Verification Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
