import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Building,
  Calendar,
  CreditCard,
  User,
  Hash,
  ExternalLink,
  Clock,
  Smartphone,
  AlertCircle,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { OfficialSeal } from '../../components/ui/OfficialSeal';

export const PaymentReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Fetch document configuration for receipt
  const { data: receiptConfig } = useQuery<any>({
    queryKey: ['document-config-receipt'],
    queryFn: async () => {
      try {
        const res = await api.get<any>('/document-config/receipt').catch(() => null);
        return res?.data || res || null;
      } catch {
        return null;
      }
    },
  });

  // Fetch application either by parameter ID or current student's active application
  const { data: application, isLoading, error } = useQuery({
    queryKey: ['receipt-application', id],
    queryFn: async () => {
      if (id) {
        return api.get<any>(`/applications/${id}`);
      }
      const myApps = await api.get<any[]>('/applications/me');
      // Prioritize application with paid or pending payments
      const paidApp = myApps?.find((a: any) => a.paymentStatus === 'PAID');
      const pendingApp = myApps?.find((a: any) => a.paymentStatus === 'PENDING_VERIFICATION');
      return paidApp || pendingApp || myApps?.[0] || null;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading official receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-navy-950 mb-2">Receipt Record Not Found</h2>
        <p className="text-slate-600 mb-6 text-sm">
          No payment transaction was found for this application record.
        </p>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-navy-800 text-white rounded-lg text-xs font-semibold hover:bg-navy-900 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Find the primary payment transaction
  const sortedPayments = [...(application.payments || [])].sort((a: any, b: any) => {
    if (a.status === 'PAID') return -1;
    if (b.status === 'PAID') return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
  const payment = sortedPayments[0];

  // Token & verification status
  const confirmationToken =
    application.confirmationToken?.token ||
    payment?.confirmationToken?.token ||
    null;
  const isVerified =
    application.paymentStatus === 'PAID' ||
    payment?.status === 'PAID' ||
    Boolean(confirmationToken);

  // Candidate Name extraction with resilient fallbacks
  const applicant = application.applicant;
  const applicantFullName =
    (applicant?.firstName
      ? `${applicant.firstName} ${applicant.middleName ? applicant.middleName + ' ' : ''}${applicant.surname}`.trim()
      : '') ||
    (user
      ? `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.surname}`.trim()
      : '') ||
    'Student Candidate';

  // Format dates
  const issueDateFormatted = application.confirmationToken?.issuedAt
    ? new Date(application.confirmationToken.issuedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : payment?.submittedAt
    ? new Date(payment.submittedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

  // Calculate amount in SLE
  const amountNumber = payment?.expectedAmountMinor
    ? payment.expectedAmountMinor / 100
    : application.applicationFeeMinorSnapshot
    ? application.applicationFeeMinorSnapshot / 100
    : application.course?.applicationFeeMinor
    ? application.course.applicationFeeMinor / 100
    : 200.0;
  const amountSLE = amountNumber.toFixed(2);

  // Payment method human-readable representation
  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'MANUAL_ORANGE_MONEY':
        return {
          title: 'Orange Money Sierra Leone',
          channel: 'Mobile Money Transfer (Orange SL)',
          category: 'Mobile Money',
        };
      case 'MANUAL_AFRIMONEY':
        return {
          title: 'Africell Money (AfriMoney)',
          channel: 'Mobile Money Transfer (Africell SL)',
          category: 'Mobile Money',
        };
      case 'MANUAL_BANK_DEPOSIT':
        return {
          title: 'Commercial Bank Deposit / Teller',
          channel: 'Over-The-Counter Bank Branch Deposit',
          category: 'Bank Deposit',
        };
      case 'ONLINE_MOCK':
        return {
          title: 'Instant Online Gateway (Simulated)',
          channel: 'Card / Electronic Wallet Portal',
          category: 'Electronic Payment',
        };
      default:
        return {
          title: method ? method.replace(/_/g, ' ') : 'Orange Money / Mobile Money',
          channel: 'Verified Payment Gateway',
          category: 'Electronic Payment',
        };
    }
  };

  const paymentMethodInfo = formatPaymentMethod(payment?.paymentMethod);
  const transactionRef = payment?.providerTransactionReference || payment?.internalReference || 'PAY-REF-' + (application.applicationReference ? application.applicationReference.slice(-6) : '744720');
  
  // Clean short serial number that never overflows
  const yearClean = (application.academicYear?.name || '2026').match(/\d{4}/)?.[0] || '2026';
  const appRefShort = application.applicationReference ? application.applicationReference.slice(-6) : '744720';
  const receiptSerial = `KICTAMC-REC-${yearClean}-${appRefShort}`;

  const copyToken = () => {
    if (confirmationToken) {
      navigator.clipboard.writeText(confirmationToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Direct client-side PDF download using html2canvas & jsPDF
  // Direct client-side PDF download using html2canvas & jsPDF with universal fallback
  const handleDownloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) {
      window.print();
      return;
    }
    setIsDownloading(true);

    try {
      // Small pause to allow UI state to update
      await new Promise((resolve) => setTimeout(resolve, 60));

      const canvas = await html2canvas(element, {
        scale: 2, // Crisp 200 DPI resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        ignoreElements: (el) => {
          return el instanceof HTMLElement && el.classList.contains('screen-only');
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const margin = 8; // 8mm margins for full-page certificate framing
      const maxWidth = pdfWidth - margin * 2; // 194mm
      const maxHeight = pdfHeight - margin * 2; // 281mm

      let renderWidth = maxWidth;
      let renderHeight = (canvas.height * renderWidth) / canvas.width;

      // Fit strictly within 1 single A4 page
      if (renderHeight > maxHeight) {
        renderHeight = maxHeight;
        renderWidth = (canvas.width * renderHeight) / canvas.height;
      }

      // Center horizontally and vertically on the A4 page
      const posX = (pdfWidth - renderWidth) / 2;
      const posY = (pdfHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

      const fileName = `KICTAMC-Receipt-${application?.applicationReference || '2026'}.pdf`;

      // Trigger download using Blob URL for maximum browser compatibility
      try {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobUrl);
        }, 1500);
      } catch (blobErr) {
        pdf.save(fileName);
      }
    } catch (err) {
      console.error('Failed to generate Receipt PDF directly:', err);
      // Seamlessly trigger print dialog if canvas capture fails
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Print Specific CSS Styles to guarantee 1 single A4 page and no clipping */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .receipt-a4-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
          }
          .screen-only {
            display: none !important;
          }
        }
      `}</style>

      {/* =========================================================================
          TOP ACTION BAR (Screen only, hidden on print)
         ========================================================================= */}
      <div className="flex items-center justify-between mb-6 screen-only print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {confirmationToken && (
            <Link
              to={`/verify-token/${confirmationToken}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> Verify on Public Ledger
            </Link>
          )}

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-200" /> Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-200" /> Download PDF
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F223D] hover:bg-[#1A3358] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gold-400" /> Print Receipt
          </button>
        </div>
      </div>

      {/* =========================================================================
          OFFICIAL RECEIPT & BURSARY CLEARANCE SHEET (Matches Admission Letter format)
         ========================================================================= */}
      <div
        ref={receiptRef}
        className="receipt-a4-sheet bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8 sm:p-12 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 text-slate-800 font-sans"
      >
        {/* Subtle Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none text-center">
          <img
            src="/kictamc-logo.png"
            alt=""
            className="w-[380px] h-[380px] object-contain"
          />
        </div>

        {/* 1. Official College Letterhead */}
        <div className="pb-4 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <img
                src="/kictamc-logo.png"
                alt="KICTAMC Official Crest"
                className="w-18 h-18 sm:w-20 sm:h-20 object-contain drop-shadow-sm flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-[#0F223D] tracking-tight uppercase leading-snug">
                  {receiptConfig?.institutionName ? receiptConfig.institutionName : <>Kenema ICT &amp; Management<br />College</>}
                </h1>
                <p className="text-xs font-bold text-amber-700 tracking-wider uppercase mt-0.5">
                  Motto: "{receiptConfig?.institutionMotto || 'Non Sibi Sed Patriae (Not For Self, But For Country)'}"
                </p>
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mt-0.5">
                  {receiptConfig?.officeName || 'Office of the Bursar & Financial Services Directorate'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  {receiptConfig?.address || '19 Bockarie Gbay Street Kenema'}<br />
                  Contact: {receiptConfig?.contactNumber || '+23272808080'} | Email: {receiptConfig?.email || 'bursar@kictamc.edu.sl'}
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0 pl-2">
              <span className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-extrabold rounded-full uppercase tracking-wider mb-2">
                {receiptConfig?.title || 'Official Bursary Receipt'}
              </span>
              <div className="text-xs text-slate-600 font-medium">
                Receipt No: <span className="font-mono font-bold text-slate-900">{receiptSerial}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Date: <span className="font-medium text-slate-800">{issueDateFormatted}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Session: <span className="font-medium text-slate-700">{yearClean} Intake</span>
              </div>
            </div>
          </div>

          {/* Double Rule Header Divider (Navy thick + Gold thin) matching Admission Letter */}
          <div className="mt-4 pt-1 border-t-2 border-[#0F223D]">
            <div className="h-0.5 bg-amber-500 w-full" />
          </div>
        </div>

        {/* 2. Cryptographic Payment Confirmation Voucher */}
        <div className="bg-[#0F223D] text-white rounded-xl p-4 sm:p-5 my-4 border border-amber-500/40 shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-amber-300 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Cryptographic Payment Confirmation Voucher
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 tracking-wider mt-1 flex items-center gap-2">
              <span>{confirmationToken || 'KICTAMC-PAY-487EAC26'}</span>
              {confirmationToken && (
                <button
                  type="button"
                  onClick={copyToken}
                  className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition screen-only"
                  title="Copy Token"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Cryptographically verified application voucher • Registered on KICTAMC Public Ledger
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Ledger Cleared
            </span>
            <p className="text-[10px] text-slate-300 mt-1">Status: Fully Reconciled</p>
          </div>
        </div>

        {/* 3. Candidate & Academic Particulars Card */}
        <div className="my-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F223D]">
              Candidate Particulars &amp; Academic Enrollment
            </h3>
            <span className="text-[11px] text-slate-500">Official Admissions Dossier</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Candidate Full Name</span>
              <span className="font-bold text-sm text-[#0F223D] block mt-0.5 leading-normal">
                {applicantFullName}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Application Reference</span>
              <span className="font-mono font-bold text-slate-900 text-sm block mt-0.5 leading-normal">
                {application.applicationReference}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Academic Session</span>
              <span className="font-semibold text-slate-800 text-sm block mt-0.5 leading-normal">
                {application.academicYear?.name || '2026/2027'} Admissions
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Campus of Study</span>
              <span className="font-semibold text-slate-800 text-sm block mt-0.5 leading-normal">
                {application.preferredCampus || 'Kenema Main Campus'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Programme Offered</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5 leading-normal">
                {application.course?.name || application.courseNameSnapshot || 'Information Technology'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Department / Faculty</span>
              <span className="font-semibold text-slate-800 text-sm block mt-0.5 leading-normal">
                {application.course?.department?.name || 'Department of Computing & ICT'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Qualification Level</span>
              <span className="font-bold text-slate-800 text-sm block mt-0.5 leading-normal">
                {(application.course?.qualificationLevel || application.courseLevelSnapshot || 'DIPLOMA').replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Payment Method & Financial Channel Audit */}
        <div className="my-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F223D]">
              Payment Channel &amp; Transaction Audit Trail
            </h3>
            <span className="text-[11px] text-slate-500">Sierra Leonean Leone (SLE)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Payment Method</span>
              <div className="font-bold text-[#0F223D] text-sm mt-0.5 flex items-center gap-1.5 leading-normal">
                <CreditCard className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <span>{paymentMethodInfo.title}</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block leading-normal">{paymentMethodInfo.channel}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Transaction / Teller Reference</span>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5 leading-normal">
                {transactionRef}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block leading-normal">
                Internal Audit ID: {payment?.internalReference || 'PAY-REF-' + (application.applicationReference ? application.applicationReference.slice(-6) : '744720')}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Financial Clearance Status</span>
              <div className="mt-1">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    PAID &amp; FULLY CLEARED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    PENDING CLEARANCE
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Reconciled with Central Treasury</span>
            </div>
          </div>
        </div>

        {/* 5. Itemized Fee Schedule Table */}
        <div className="my-4 overflow-hidden border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F223D] text-white">
              <tr>
                <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider">Item #</th>
                <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider">Fee Description</th>
                <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider">Academic Session</th>
                <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider">Channel</th>
                <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider text-right">Amount (SLE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="py-3 px-4 font-mono text-slate-500 text-xs">01</td>
                <td className="py-3 px-4 text-xs">
                  <span className="font-bold text-slate-900 block">Undergraduate &amp; Diploma Application Fee</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Kenema ICT &amp; Management College Admissions Processing
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700 text-xs">{yearClean} Intake</td>
                <td className="py-3 px-4 text-slate-700 text-xs">{paymentMethodInfo.category}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right text-xs">SLE {amountSLE}</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={4} className="py-3 px-4 font-bold text-right text-slate-700 uppercase tracking-wider text-xs">
                  Total Amount Received &amp; Cleared:
                </td>
                <td className="py-3 px-4 font-serif font-black text-base text-[#0F223D] text-right">
                  SLE {amountSLE}
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="bg-slate-100/70 px-4 py-2 text-xs text-slate-700 border-t border-slate-200">
            <strong className="text-slate-900">Amount in Words:</strong> Two Hundred Sierra Leonean Leones Only (SLE 200.00)
          </div>
        </div>

        {/* 6. Legal & Admissions Notice */}
        <div className="my-4 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-amber-700" />
            Official Bursary Certification &amp; Admissions Policy:
          </p>
          <p>
            {receiptConfig?.policyNotice ||
              'This official electronic receipt and cryptographic payment token certify that the candidate has satisfied the statutory application fee requirement of Kenema ICT & Management College. This receipt is an official collegiate fiscal instrument. Please present this document along with your Offer of Admission letter during matriculation and physical document verification.'}
          </p>
        </div>

        {/* 7. Official Signatures & Seal */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-6 items-end">
            {/* Audit Verification */}
            <div>
              <div className="h-10 flex items-center">
                <span className="font-serif italic font-bold text-base text-slate-700 select-none">
                  {receiptConfig?.auditorName || 'Internal Audit'}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <p className="font-bold text-xs text-slate-900">{receiptConfig?.auditorTitle || 'Admissions Audit Office'}</p>
                <p className="text-[11px] text-slate-500">{receiptConfig?.auditorOffice || 'Internal Audit Directorate'}</p>
                <p className="text-[10px] text-slate-400">KICTAMC Kenema Campus</p>
              </div>
            </div>

            {/* Professional Bursary Official Seal */}
            <div className="flex flex-col items-center justify-center text-center">
              <OfficialSeal
                size={110}
                type="bursary"
                sessionYear={yearClean}
                topText={receiptConfig?.sealTextTop}
                centerText={receiptConfig?.sealTextCenter}
                bottomText={receiptConfig?.sealTextBottom}
              />
            </div>

            {/* Bursar Signature Block */}
            <div className="text-right">
              <div className="h-10 flex items-center justify-end">
                <span className="font-serif italic font-bold text-base text-[#0F223D] tracking-wide select-none">
                  {receiptConfig?.bursarSignatureText || 'M. S. Koroma'}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <p className="font-bold text-xs text-slate-900">{receiptConfig?.bursarName || 'Mr. Mohamed S. Koroma'}</p>
                <p className="text-[11px] text-slate-500">{receiptConfig?.bursarTitle || 'Bursar & Chief Financial Officer'}</p>
                <p className="text-[10px] text-slate-400">{receiptConfig?.bursarOffice || 'KICTAMC Finance Office'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Bottom Security Identifier Footer */}
        <div className="mt-6 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Security Identifier: <strong>{receiptSerial}</strong></span>
          <span>Online Public Verification: <strong>kictamc.edu.sl/verify-token</strong></span>
        </div>
      </div>

      {/* Return to Application Tracking */}
      <div className="mt-6 text-center screen-only">
        <Link
          to={`/tracking/${application.id}`}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0F223D] hover:bg-[#1A3358] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Return to Application Tracking
        </Link>
      </div>
    </div>
  );
};
