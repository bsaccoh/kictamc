import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  DollarSign,
  Download,
  ShieldCheck,
  Building,
  Smartphone,
  Receipt,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { ActionMenu } from '../../components/ui/ActionMenu';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination, type PaginatedResponse } from '../../hooks/usePagination';

export const PaymentLedgerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get('status') || 'ALL';
  const [statusFilter, setStatusFilter] = useState<string>(urlStatus);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  // Sync filter when URL search params change (e.g. sidebar navigation)
  useEffect(() => {
    const s = searchParams.get('status') || 'ALL';
    setStatusFilter(s);
  }, [searchParams]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    const updated = new URLSearchParams(searchParams);
    if (newStatus === 'ALL') {
      updated.delete('status');
    } else {
      updated.set('status', newStatus);
    }
    setSearchParams(updated);
  };

  // Pagination
  const { page, limit, setPage, reset: resetPagination } = usePagination(15);
  useEffect(() => {
    resetPagination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, searchTerm]);

  // Fetch payments
  const { data: paginated, isLoading } = useQuery({
    queryKey: ['admin-payments', statusFilter, searchTerm, typeFilter, page, limit],
    queryFn: async () => {
      let queryUrl = '/admin/payments';
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (typeFilter !== 'ALL') params.append('paymentType', typeFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', String(page));
      params.append('limit', String(limit));
      queryUrl += `?${params.toString()}`;

      return api.get<PaginatedResponse<any>>(queryUrl);
    },
  });

  const payments = paginated?.items ?? [];
  const pagination = paginated?.pagination;

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      return api.post(`/admin/payments/${paymentId}/verify`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setSelectedPayment(null);
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to verify payment.');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
      return api.post(`/admin/payments/${paymentId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setIsRejectModalOpen(false);
      setSelectedPayment(null);
      setRejectReason('');
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to reject payment.');
    },
  });

  // Metrics
  const pendingCount = payments.filter((p) => p.status === 'PENDING_VERIFICATION').length;
  const verifiedCount = payments.filter((p) => p.status === 'PAID').length;
  const rejectedCount = payments.filter((p) => p.status === 'REJECTED').length;
  const totalCollectedMinor = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + (curr.expectedAmountMinor || 0), 0);

  const formatSLE = (minor: number) => (minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const handleExportPaymentsCSV = () => {
    if (payments.length === 0) return;

    const headers = [
      'Date',
      'Application Reference',
      'Applicant Name',
      'Phone',
      'Programme',
      'Payment Channel',
      'Provider / Teller Ref',
      'Internal Pay Ref',
      'Amount (SLE)',
      'Status',
    ];

    const rows = payments.map((p: any) => [
      `"${new Date(p.submittedAt).toLocaleDateString('en-GB')}"`,
      `"${p.application?.applicationReference || ''}"`,
      `"${p.application?.applicant?.firstName || ''} ${p.application?.applicant?.surname || ''}"`,
      `"${p.application?.applicant?.phone || ''}"`,
      `"${p.application?.course?.name || ''}"`,
      `"${p.paymentMethod?.replace(/MANUAL_/, '').replace(/_/g, ' ') || ''}"`,
      `"${p.providerTransactionReference || ''}"`,
      `"${p.internalReference || ''}"`,
      `"${((p.declaredAmountMinor || p.expectedAmountMinor || 0) / 100).toFixed(2)}"`,
      `"${p.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KICTAMC_Payments_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-serif font-bold text-navy-950">
              {statusFilter === 'PENDING_VERIFICATION'
                ? 'Payment Verification Queue'
                : statusFilter === 'PAID'
                ? 'Verified Payments'
                : statusFilter === 'REJECTED'
                ? 'Rejected Payment Submissions'
                : 'Finance & Payment Ledger'}
            </h1>
            {statusFilter === 'PENDING_VERIFICATION' && pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {pendingCount} Awaiting Verification
              </span>
            )}
            {statusFilter === 'PAID' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {verifiedCount} Verified
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {statusFilter === 'PENDING_VERIFICATION'
              ? 'Review candidate teller slips and mobile money transactions awaiting finance verification.'
              : statusFilter === 'PAID'
              ? 'Review verified and reconciled application fee payments with confirmed transaction references.'
              : 'Verify manual bank deposits, mobile money receipts, and track application revenues.'}
          </p>
        </div>
        <button
          onClick={handleExportPaymentsCSV}
          disabled={payments.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-gold-400" /> Export Ledger (CSV)
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-navy-950">
            SLE {formatSLE(totalCollectedMinor)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">From verified applications</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{pendingCount}</div>
          <span className="text-xs text-slate-400 mt-1 block">Awaiting bank verification</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Verified & Paid</span>
            <div className="w-8 h-8 rounded-lg bg-navy-100 text-navy-800 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-navy-900">{verifiedCount}</div>
          <span className="text-xs text-slate-400 mt-1 block">Confirmation tokens issued</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Rejected Evidence</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{rejectedCount}</div>
          <span className="text-xs text-slate-400 mt-1 block">Requires student re-submission</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref, applicant, matric #, teller #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Payment Type Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'APPLICATION_FEE', label: 'App Fees' },
              { id: 'TUITION_MATRICULATION', label: 'Tuition / Matric' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  typeFilter === t.id
                    ? 'bg-navy-900 text-gold-400 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-navy-950'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          {['ALL', 'PENDING_VERIFICATION', 'PAID', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-navy-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL'
                ? 'All Statuses'
                : st === 'PENDING_VERIFICATION'
                ? 'Pending Review'
                : st === 'PAID'
                ? 'Verified (Paid)'
                : 'Rejected'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Application / Matric Ref</th>
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Program</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Teller / Provider Ref</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-navy-800 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading payments ledger...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No payment records match the current filter.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const applicant = p.application?.applicant;
                  const course = p.application?.course;
                  const isTuition = p.paymentType === 'TUITION_MATRICULATION';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        {new Date(p.submittedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-navy-900 text-xs">
                          {p.application?.applicationReference}
                        </div>
                        {p.application?.matriculationNumber && (
                          <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-gold-700 bg-gold-50 px-1.5 py-0.5 rounded border border-gold-200">
                            Matric: {p.application.matriculationNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {applicant?.firstName} {applicant?.surname}
                        </div>
                        <div className="text-xs text-slate-400">{applicant?.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isTuition ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gold-100 text-gold-950 border border-gold-300">
                            Tuition &amp; Matric
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Application Fee
                          </span>
                        )}
                        {p.notes && (
                          <span className="block text-[10px] text-slate-400 truncate max-w-[120px]" title={p.notes}>
                            {p.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate" title={course?.name}>
                        {course?.name}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 rounded-md font-medium text-slate-700">
                          {p.paymentMethod.replace(/MANUAL_/, '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {p.providerTransactionReference || p.internalReference}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-navy-950 whitespace-nowrap">
                        SLE {formatSLE(p.declaredAmountMinor || p.expectedAmountMinor)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Paid
                          </span>
                        )}
                        {p.status === 'PENDING_VERIFICATION' && (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {p.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <ActionMenu
                          label={`Actions for transaction ${p.transactionReference}`}
                          items={[
                            {
                              label: 'Inspect & Verify',
                              icon: <Eye className="w-4 h-4 text-navy-800" />,
                              onClick: () => {
                                setSelectedPayment(p);
                                setActionError('');
                              }
                            },
                            {
                              label: 'View Application',
                              icon: <FileText className="w-4 h-4 text-slate-500" />,
                              to: `/admin/applications/${p.applicationId}`
                            },
                            {
                              label: 'Official Receipt',
                              icon: <Receipt className="w-4 h-4 text-emerald-600" />,
                              to: `/receipt/${p.applicationId}`
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* INSPECT & VERIFY MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-navy-950">Verify Payment Evidence</h3>
                <p className="text-xs text-slate-500">
                  Application Ref: <span className="font-mono font-semibold">{selectedPayment.application?.applicationReference}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {actionError}
              </div>
            )}

            {/* Tuition / Matriculation Notice Banner */}
            {selectedPayment.paymentType === 'TUITION_MATRICULATION' && (
              <div className="mb-4 p-3.5 bg-gradient-to-r from-gold-50 to-amber-50 border border-gold-300 rounded-xl text-gold-950 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-200 text-gold-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  🎓
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-900">
                    Tuition &amp; Matriculation Fee Settlement
                  </h4>
                  <p className="text-xs text-gold-800 mt-0.5 leading-relaxed">
                    Approving this payment will automatically enroll the candidate and issue an official collegiate <strong>Matriculation Number</strong> (e.g. KICTAMC/2026/CS/0001).
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 my-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Applicant</span>
                <span className="font-bold text-navy-900">
                  {selectedPayment.application?.applicant?.firstName} {selectedPayment.application?.applicant?.surname}
                </span>
                <span className="text-xs text-slate-500 block">{selectedPayment.application?.applicant?.phone}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Declared Amount</span>
                <span className="font-serif font-extrabold text-navy-900 text-base">
                  SLE {formatSLE(selectedPayment.declaredAmountMinor || selectedPayment.expectedAmountMinor)}
                </span>
                <span className="text-xs text-slate-500 block">Expected: SLE {formatSLE(selectedPayment.expectedAmountMinor)}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Payment Channel</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {selectedPayment.paymentMethod.replace(/MANUAL_/, '').replace(/_/g, ' ')}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Teller / Ref Number</span>
                <span className="font-mono font-bold text-navy-900">
                  {selectedPayment.providerTransactionReference || selectedPayment.internalReference}
                </span>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="mb-6">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Uploaded Teller Slip / Receipt
              </span>
              {selectedPayment.receiptDocumentPath ? (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
                  <a
                    href={`/api/v1/payments/${selectedPayment.id}/receipt-file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-navy-900 hover:bg-slate-100 shadow-sm"
                  >
                    <Eye className="w-4 h-4 text-navy-800" /> Open Full Receipt Document
                  </a>
                  <p className="text-xs text-slate-400 mt-2">
                    Click to view the authentic high-resolution bank teller slip.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 rounded-lg text-center text-xs text-slate-500">
                  No uploaded file attached (Instant / Automated settlement).
                </div>
              )}
            </div>

            {/* Issued Token (if already verified) */}
            {selectedPayment.confirmationToken && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-700 font-semibold uppercase">Confirmation Token Issued</span>
                  <div className="font-mono font-bold text-lg text-emerald-950">
                    {selectedPayment.confirmationToken.token}
                  </div>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
            )}

            {/* Actions for PENDING payments */}
            {selectedPayment.status === 'PENDING_VERIFICATION' && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Reject Evidence
                </button>
                <button
                  type="button"
                  disabled={verifyMutation.isPending}
                  onClick={() => verifyMutation.mutate(selectedPayment.id)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {verifyMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {selectedPayment.paymentType === 'TUITION_MATRICULATION'
                    ? 'Verify & Issue Matriculation Number'
                    : 'Approve & Issue Confirmation Token'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECT MODAL WITH REASON */}
      {isRejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-red-900 mb-1">Reject Payment Evidence</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the exact reason for rejection. This will be sent immediately to the applicant.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Teller reference does not appear on bank statement, or slip image is illegible."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                onClick={() =>
                  rejectMutation.mutate({
                    paymentId: selectedPayment.id,
                    reason: rejectReason.trim(),
                  })
                }
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
