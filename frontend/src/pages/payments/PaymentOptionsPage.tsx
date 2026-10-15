import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Building,
  Smartphone,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  Receipt,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const PaymentOptionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'manual' | 'online'>('manual');
  const [selectedMethod, setSelectedMethod] = useState<'BANK_DEPOSIT' | 'ORANGE_MONEY' | 'AFRIMONEY'>('BANK_DEPOSIT');
  const [selectedBank, setSelectedBank] = useState<'SLCB' | 'ROKEL'>('SLCB');
  const [installmentOption, setInstallmentOption] = useState<'INSTALLMENT_60' | 'FULL_SESSION'>('INSTALLMENT_60');
  
  // Manual submission form state
  const [providerRef, setProviderRef] = useState('');
  const [declaredAmountSLE, setDeclaredAmountSLE] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Fetch application details
  const { data: appData, isLoading: appLoading, refetch } = useQuery({
    queryKey: ['application-payment', id],
    queryFn: async () => {
      if (id) {
        return api.get<any>(`/applications/${id}`);
      }
      const myApps = await api.get<any[]>('/applications/me');
      if (myApps && myApps.length > 0) {
        // Return latest submitted or awaiting payment application
        return myApps[0];
      }
      return null;
    },
  });

  const application = appData;

  const isMatriculationPayment =
    searchParams.get('type') === 'matriculation' ||
    (application?.status === 'APPROVED' && application?.offerAccepted && !application?.isEnrolled);

  const fullTuitionMinor = application?.course?.tuitionFeeMinor || 450000;
  const installment60Minor = Math.round(fullTuitionMinor * 0.6);
  const fullTuitionSLE = (fullTuitionMinor / 100).toFixed(2);
  const installment60SLE = (installment60Minor / 100).toFixed(2);

  const appFeeSLE = application?.applicationFeeMinorSnapshot
    ? (application.applicationFeeMinorSnapshot / 100).toFixed(2)
    : application?.course?.applicationFeeMinor
    ? (application.course.applicationFeeMinor / 100).toFixed(2)
    : '200.00';

  const expectedFeeSLE = isMatriculationPayment
    ? installmentOption === 'INSTALLMENT_60'
      ? installment60SLE
      : fullTuitionSLE
    : appFeeSLE;

  // Initialize declared amount based on payment type
  useEffect(() => {
    if (isMatriculationPayment) {
      setDeclaredAmountSLE(installmentOption === 'INSTALLMENT_60' ? installment60SLE : fullTuitionSLE);
    } else {
      setDeclaredAmountSLE(appFeeSLE);
    }
  }, [isMatriculationPayment, installmentOption, installment60SLE, fullTuitionSLE, appFeeSLE]);

  // Manual Payment Mutation
  const manualPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!application?.id) throw new Error('No active application found.');
      if (!providerRef.trim()) throw new Error('Please enter your Bank Teller or Transaction Reference Number.');
      if (!receiptFile) throw new Error('Please upload a photo or PDF scan of your teller slip / receipt.');

      const methodKey =
        selectedMethod === 'BANK_DEPOSIT'
          ? 'MANUAL_BANK_DEPOSIT'
          : selectedMethod === 'ORANGE_MONEY'
          ? 'MANUAL_ORANGE_MONEY'
          : 'MANUAL_AFRIMONEY';

      const formData = new FormData();
      formData.append('paymentMethod', methodKey);
      formData.append('providerTransactionReference', providerRef.trim());
      formData.append('declaredAmountMinor', String(Math.round(parseFloat(declaredAmountSLE) * 100)));
      formData.append('receipt', receiptFile);
      if (isMatriculationPayment) {
        formData.append('paymentType', 'TUITION_MATRICULATION');
        formData.append('notes', installmentOption === 'INSTALLMENT_60' ? 'Tuition 1st Installment (60% Minimum)' : 'Full Session Tuition (100%)');
      }

      return api.post(`/applications/${application.id}/payments`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-payment'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      navigate(isMatriculationPayment ? '/dashboard' : `/tracking/${application?.id}`);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to submit payment evidence.');
    },
  });

  // Online Mock Payment Mutation
  const onlinePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!application?.id) throw new Error('No active application found.');
      return api.post<any>(`/applications/${application.id}/payments/simulate-online`, {
        paymentType: isMatriculationPayment ? 'TUITION_MATRICULATION' : 'APPLICATION_FEE',
        installmentType: installmentOption,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['application-payment'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      if (isMatriculationPayment) {
        navigate('/dashboard');
      } else {
        navigate(`/receipt/${application?.id}`);
      }
    },
    onError: (err: any) => {
      setFormError(err.message || 'Simulated payment processing failed.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setFormError('');

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy-900 mb-2">No Active Application Found</h2>
        <p className="text-slate-600 mb-6">
          You need an active submitted application to proceed to payment.
        </p>
        <Link
          to="/apply"
          className="inline-flex items-center gap-2 px-6 py-3 bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-colors"
        >
          Go to Application Wizard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // If already enrolled / matriculation paid
  if (isMatriculationPayment && (application.isEnrolled || application.matriculationNumber)) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-gold-300 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gold-100 text-gold-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-1">Matriculation Fee Settled</h2>
          <p className="text-sm text-slate-600 mb-4">
            Your collegiate enrollment is complete for <strong>{application.applicationReference}</strong>.
          </p>
          <div className="inline-block bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl mb-6 font-mono text-sm font-bold text-navy-900">
            Matriculation Number: <span className="text-gold-600">{application.matriculationNumber}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-800 hover:bg-navy-900 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              <FileText className="w-5 h-5" /> View Official Clearance Card
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If already paid application fee and not paying matriculation
  if (!isMatriculationPayment && application.paymentStatus === 'PAID') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Application Fee Paid</h2>
          <p className="text-slate-600 mb-6">
            Your application fee for <strong>{application.applicationReference}</strong> has already been confirmed by Finance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={`/receipt/${application.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-700 text-navy-950 font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Receipt className="w-5 h-5" /> View Official Receipt
            </Link>
            <Link
              to={`/tracking/${application.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-800 hover:bg-navy-900 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Clock className="w-5 h-5" /> Track Application Status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 rounded-2xl text-white p-6 sm:p-8 shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/20 text-gold-300 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isMatriculationPayment ? 'Collegiate Matriculation & Enrolment' : 'Official Fee Settlement'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
              {isMatriculationPayment ? 'Tuition & Matriculation Fee Payment' : 'Application Fee Payment'}
            </h1>
            <p className="text-navy-200 text-sm">
              Application Ref: <span className="text-gold-400 font-mono font-semibold">{application.applicationReference}</span>
              {' • '}{application.course?.name || application.courseNameSnapshot}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-right md:min-w-[220px]">
            <span className="text-xs text-navy-200 uppercase tracking-wider block">
              {isMatriculationPayment ? (installmentOption === 'INSTALLMENT_60' ? '1st Installment (60%)' : 'Full Session Fee') : 'Application Fee'}
            </span>
            <div className="text-3xl font-extrabold text-gold-400 font-serif">
              SLE {expectedFeeSLE}
            </div>
            <span className="text-xs text-emerald-300 flex items-center justify-end gap-1 mt-1">
              <CheckCircle className="w-3 h-3" />
              {isMatriculationPayment ? 'Enrolment & Matriculation' : 'One-time processing fee'}
            </span>
          </div>
        </div>

        {/* Installment Selector for Matriculation Payments */}
        {isMatriculationPayment && (
          <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setInstallmentOption('INSTALLMENT_60')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                installmentOption === 'INSTALLMENT_60'
                  ? 'bg-gold-500/20 border-gold-400 text-white shadow-sm ring-1 ring-gold-400'
                  : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-300">
                  Option 1: 60% Installment (Minimum)
                </span>
                <span className="text-sm font-mono font-bold text-gold-400">SLE {installment60SLE}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Qualifies applicant for official matriculation number and semester enrollment. 40% balance due prior to semester exams.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setInstallmentOption('FULL_SESSION')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                installmentOption === 'FULL_SESSION'
                  ? 'bg-gold-500/20 border-gold-400 text-white shadow-sm ring-1 ring-gold-400'
                  : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-300">
                  Option 2: 100% Full Academic Session
                </span>
                <span className="text-sm font-mono font-bold text-gold-400">SLE {fullTuitionSLE}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Full annual clearance with zero outstanding bursary balance for the {application.academicYear?.year || '2026/2027'} collegiate session.
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Rejection Alert if applicable */}
      {application.paymentStatus === 'REJECTED' && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-900">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Previous Payment Evidence Rejected</h4>
            <p className="text-sm mt-0.5 text-red-700">
              The Finance Office was unable to verify your previous payment slip. Please check your bank transaction or upload a clear, genuine teller receipt.
            </p>
          </div>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex border-b border-slate-200 mb-8 bg-white rounded-t-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'manual'
              ? 'border-navy-800 text-navy-900 bg-slate-50/50'
              : 'border-transparent text-slate-500 hover:text-navy-800'
          }`}
        >
          <Building className="w-4 h-4 text-navy-700" />
          Bank Deposit / Mobile Money (Manual Verification)
        </button>

        <button
          onClick={() => setActiveTab('online')}
          className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'online'
              ? 'border-gold-500 text-navy-900 bg-gold-50/30'
              : 'border-transparent text-slate-500 hover:text-gold-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-gold-600" />
          Instant Online Checkout (Simulated Gateway)
        </button>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
        </div>
      )}

      {/* TAB 1: MANUAL BANK DEPOSIT / MOBILE MONEY */}
      {activeTab === 'manual' && (
        <div className="space-y-8">
          {/* Method Selection Cards */}
          <div>
            <label className="block text-sm font-semibold text-navy-950 mb-3">
              1. Select Your Payment Channel
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setSelectedMethod('BANK_DEPOSIT')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedMethod === 'BANK_DEPOSIT'
                    ? 'border-navy-800 bg-navy-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-navy-100 text-navy-800 flex items-center justify-center mb-3">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-navy-900 text-sm">Commercial Bank</h3>
                <p className="text-xs text-slate-500 mt-1">SLCB or Rokel Commercial Bank teller slip deposit</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('ORANGE_MONEY')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedMethod === 'ORANGE_MONEY'
                    ? 'border-orange-500 bg-orange-50/30 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-navy-900 text-sm">Orange Money</h3>
                <p className="text-xs text-slate-500 mt-1">Pay via merchant code & upload SMS receipt</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('AFRIMONEY')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedMethod === 'AFRIMONEY'
                    ? 'border-red-500 bg-red-50/30 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-navy-900 text-sm">Afrimoney</h3>
                <p className="text-xs text-slate-500 mt-1">Pay via merchant code & upload SMS receipt</p>
              </button>
            </div>
          </div>

          {/* Official Bank Account / Merchant Details Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 2. Official Payment Instructions
            </h3>

            {selectedMethod === 'BANK_DEPOSIT' && (
              <div>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedBank('SLCB')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                      selectedBank === 'SLCB'
                        ? 'bg-navy-800 text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Sierra Leone Commercial Bank (SLCB)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBank('ROKEL')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                      selectedBank === 'ROKEL'
                        ? 'bg-navy-800 text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Rokel Commercial Bank
                  </button>
                </div>

                {selectedBank === 'SLCB' ? (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Bank Name:</span>
                      <span className="font-semibold text-navy-900">Sierra Leone Commercial Bank (SLCB)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-semibold text-navy-900">Kenema ICT & Management College</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Account Number:</span>
                      <span className="font-mono font-bold text-navy-900">003001004523010188</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Branch:</span>
                      <span className="font-medium text-navy-900">Kenema Main Branch (Hangha Road)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Deposit Reference / Narration:</span>
                      <span className="font-mono font-bold text-gold-600">{application.applicationReference}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Bank Name:</span>
                      <span className="font-semibold text-navy-900">Rokel Commercial Bank</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-semibold text-navy-900">KICTAMC Admissions Account</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Account Number:</span>
                      <span className="font-mono font-bold text-navy-900">02-011245601</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Branch:</span>
                      <span className="font-medium text-navy-900">Kenema Branch</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Deposit Reference / Narration:</span>
                      <span className="font-mono font-bold text-gold-600">{application.applicationReference}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedMethod === 'ORANGE_MONEY' && (
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">USSD Code:</span>
                  <span className="font-mono font-bold text-orange-600">*144*4*1*23489#</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Merchant ID:</span>
                  <span className="font-mono font-bold text-navy-900">884920</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Merchant Name:</span>
                  <span className="font-semibold text-navy-900">KICTAMC Admissions</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Payment Reference:</span>
                  <span className="font-mono font-bold text-gold-600">{application.applicationReference}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">SMS Txn ID Format:</span>
                  <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    e.g. PP261015.1838.A32759
                  </span>
                </div>
              </div>
            )}

            {selectedMethod === 'AFRIMONEY' && (
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">USSD Code:</span>
                  <span className="font-mono font-bold text-red-600">*161*2*9023#</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Merchant ID:</span>
                  <span className="font-mono font-bold text-navy-900">554109</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Merchant Name:</span>
                  <span className="font-semibold text-navy-900">KICTAMC Accounts</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Payment Reference:</span>
                  <span className="font-mono font-bold text-gold-600">{application.applicationReference}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">SMS Txn ID Format:</span>
                  <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    e.g. AF261015.1838.A10243
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submission Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-navy-950 mb-4">
              3. Submit Payment Evidence for Finance Verification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {selectedMethod === 'ORANGE_MONEY'
                    ? 'Orange Money Transaction ID'
                    : selectedMethod === 'AFRIMONEY'
                    ? 'Afrimoney Transaction Reference'
                    : 'Provider Transaction Reference / Bank Teller Number'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    selectedMethod === 'ORANGE_MONEY'
                      ? 'e.g. PP261015.1838.A32759'
                      : selectedMethod === 'AFRIMONEY'
                      ? 'e.g. AF261015.1838.A10243'
                      : 'e.g. SLCB-TX-984210 or 02-011245601-TXN'
                  }
                  value={providerRef}
                  onChange={(e) => setProviderRef(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-sm font-mono uppercase"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {selectedMethod === 'ORANGE_MONEY'
                    ? 'Enter the exact Orange Money Transaction ID from your confirmation SMS (e.g. PP261015.1838.A32759).'
                    : selectedMethod === 'AFRIMONEY'
                    ? 'Enter the Afrimoney confirmation code received via SMS.'
                    : 'Found printed at the top of your bank deposit slip or in your SMS receipt.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount Paid (SLE) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={declaredAmountSLE}
                  onChange={(e) => setDeclaredAmountSLE(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-sm font-semibold"
                />
                <p className="text-xs text-slate-500 mt-1">Must match the required application fee.</p>
              </div>
            </div>

            {/* Document Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Bank Slip or Transaction Screenshot <span className="text-red-500">*</span>
              </label>

              <div className="border-2 border-dashed border-slate-300 hover:border-navy-800 rounded-xl p-6 text-center transition-colors">
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-navy-800 hover:underline">
                    {receiptFile ? receiptFile.name : 'Click to select or drag and drop teller slip'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Accepts PNG, JPG, or PDF (Max 5MB)
                  </span>
                </label>
              </div>

              {filePreview && (
                <div className="mt-4 p-2 bg-slate-50 rounded-lg border border-slate-200 max-w-xs">
                  <p className="text-xs text-slate-500 mb-1 font-medium">Image Preview:</p>
                  <img
                    src={filePreview}
                    alt="Receipt preview"
                    className="h-32 object-contain rounded border border-slate-300"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={manualPaymentMutation.isPending}
              onClick={() => manualPaymentMutation.mutate()}
              className="w-full py-3.5 bg-navy-800 hover:bg-navy-900 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {manualPaymentMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Evidence to Finance...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-gold-400" />
                  Submit Payment Evidence for Verification
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: INSTANT SIMULATED ONLINE CHECKOUT (MILESTONE 7) */}
      {activeTab === 'online' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-16 h-16 bg-gold-100 text-gold-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-navy-950 mb-2">
              Instant Online Payment Simulator
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {isMatriculationPayment ? (
                <>
                  Simulate instant tuition &amp; matriculation settlement via Card or Mobile Money API sandbox. 
                  Upon confirmation, an official <strong>KICTAMC Matriculation Number</strong> will be immediately issued and your student clearance profile activated.
                </>
              ) : (
                <>
                  Simulate instant payment confirmation via Card or Mobile Money API sandbox. 
                  Upon confirmation, an official <strong>KICTAMC-PAY-XXXXXXXX</strong> cryptographic token will be automatically issued and your application will proceed directly to Admissions Review.
                </>
              )}
            </p>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Application Reference:</span>
                <span className="font-mono font-semibold text-navy-900">{application.applicationReference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-navy-900">{user?.firstName} {user?.surname}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Program:</span>
                <span className="font-semibold text-navy-900">{application.course?.name || application.courseNameSnapshot}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 pt-3">
                <span className="font-bold text-navy-900">Total Settlement:</span>
                <span className="font-serif font-extrabold text-lg text-gold-600">SLE {expectedFeeSLE}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={onlinePaymentMutation.isPending}
              onClick={() => onlinePaymentMutation.mutate()}
              className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {onlinePaymentMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  Simulating Gateway Settlement...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-navy-950" />
                  Pay SLE {expectedFeeSLE} Now (Simulate Instant Settlement)
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Automated Cryptographic Token Generation & Instant Receipt
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
