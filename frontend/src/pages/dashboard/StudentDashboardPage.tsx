import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Check,
  FileCheck,
  ChevronRight,
  Award,
  Calendar,
  MapPin,
  Sparkles,
  Printer,
  QrCode,
  GraduationCap,
  Building,
  CheckCircle,
  Copy,
  ShieldCheck
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedMatric, setCopiedMatric] = useState(false);
  const [offerAcceptSuccess, setOfferAcceptSuccess] = useState(false);

  // Fetch applicant's current application
  const { data: myApps = [] } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get<any[]>('/applications/me'),
    enabled: !!user,
  });

  const activeApp =
    myApps.find((a: any) => a.isEnrolled || a.matriculationNumber) ||
    myApps.find((a: any) => a.status === 'APPROVED') ||
    myApps.find((a: any) => a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED' || a.status === 'AWAITING_PAYMENT') ||
    myApps?.[0];

  // Offer Acceptance Mutation
  const acceptOfferMutation = useMutation({
    mutationFn: async () => {
      if (!activeApp?.id) return;
      return api.post(`/applications/${activeApp.id}/accept-offer`, {});
    },
    onSuccess: () => {
      setOfferAcceptSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  const handleCopyMatric = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedMatric(true);
    setTimeout(() => setCopiedMatric(false), 2500);
  };

  // Fetch unread notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<any[]>('/users/notifications'),
    enabled: !!user,
  });

  // Calculate completion percentage based on application data
  const calculateCompletion = () => {
    if (!activeApp) return 16;
    if (activeApp.isEnrolled || activeApp.matriculationNumber) return 100;
    if (activeApp.offerAccepted) return 95;
    if (activeApp.status === 'APPROVED') return 90;
    if (activeApp.status === 'UNDER_REVIEW') return 75;
    if (activeApp.status === 'AWAITING_PAYMENT') return 60;
    if (activeApp.status === 'SUBMITTED') return 50;
    return 16;
  };

  const completionPct = calculateCompletion();

  const tuitionFeeSLE = activeApp?.course?.tuitionFeeMinor
    ? (activeApp.course.tuitionFeeMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '4,500.00';
  const installment60SLE = activeApp?.course?.tuitionFeeMinor
    ? (Math.round(activeApp.course.tuitionFeeMinor * 0.6) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '2,700.00';

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back, {user?.firstName || 'John'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official collegiate applicant portal • Academic Session {activeApp?.academicYear?.year || '2026/2027'}
          </p>
        </div>

        {activeApp?.matriculationNumber && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold-50 border border-gold-300 rounded-xl text-gold-950 text-xs font-mono font-bold shadow-xs">
            <GraduationCap className="w-4 h-4 text-gold-700" />
            <span>Matric: {activeApp.matriculationNumber}</span>
          </div>
        )}
      </div>

      {/* 1. ENROLLED STUDENT ID CARD (IF MATRICULATED) */}
      {(activeApp?.isEnrolled || activeApp?.matriculationNumber) && (
        <div className="bg-gradient-to-br from-[#0A192F] via-[#0F223D] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-gold-500/40 relative overflow-hidden">
          {/* Background decorative watermark */}
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
            <GraduationCap className="w-72 h-72 text-gold-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/15">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center flex-shrink-0 shadow-lg border border-gold-400/50">
                <img src="/kictamc-logo.png" alt="KICTAMC Crest" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-gold-500 text-navy-950 px-2.5 py-0.5 rounded-full font-mono">
                    OFFICIAL STUDENT CLEARANCE ID
                  </span>
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Active Collegiate Member
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-serif font-bold text-white mt-1">
                  Kenema ICT &amp; Management College
                </h2>
                <p className="text-xs text-slate-300">
                  Republic of Sierra Leone • Accredited Higher Educational Institution
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full md:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-gold-300" /> Print Clearance Card
              </button>
              <Link
                to="/admission-letter"
                className="w-full md:w-auto px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Letter &amp; Schedule
              </Link>
            </div>
          </div>

          {/* Student Identity Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
            <div className="flex items-center gap-4 md:col-span-1">
              <div className="w-20 h-24 rounded-xl bg-slate-800 border-2 border-gold-400/60 overflow-hidden flex flex-col items-center justify-center text-center p-2 relative shadow-md">
                <span className="text-2xl font-bold text-gold-400 font-serif">
                  {user?.firstName?.[0]}{user?.surname?.[0]}
                </span>
                <span className="text-[9px] text-slate-300 font-mono mt-1 uppercase">KICTAMC-ID</span>
              </div>
              <div>
                <span className="text-[10px] text-gold-300/80 uppercase font-semibold block">Student Name</span>
                <p className="text-sm font-bold text-white leading-tight">
                  {user?.firstName} {user?.surname}
                </p>
                <span className="text-[11px] text-slate-300 block mt-0.5 font-mono">
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Official Matriculation Number</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-base font-extrabold text-gold-400 tracking-wider">
                    {activeApp.matriculationNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyMatric(activeApp.matriculationNumber)}
                    className="p-1 hover:bg-white/10 rounded text-slate-300 transition"
                    title="Copy Matriculation Number"
                  >
                    {copiedMatric ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Programme Enrolled</span>
                <span className="text-xs font-bold text-white block mt-1 truncate">
                  {activeApp.course?.name || activeApp.courseNameSnapshot}
                </span>
                <span className="text-[10px] text-slate-300 block font-mono">
                  Code: {activeApp.course?.code || 'CS'} • {activeApp.studyMode || 'Full-Time'}
                </span>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic Session</span>
                <span className="text-xs font-semibold text-white block mt-0.5">
                  {activeApp.academicYear?.year || '2026/2027'}
                </span>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Date of Matriculation</span>
                <span className="text-xs font-semibold text-emerald-300 block mt-0.5 font-mono">
                  {activeApp.enrolledAt ? new Date(activeApp.enrolledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Confirmed'}
                </span>
              </div>
            </div>

            <div className="md:col-span-1 bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
              <QrCode className="w-12 h-12 text-gold-300 mb-1" />
              <span className="text-[9px] font-mono text-slate-300 uppercase">
                TOKEN: {activeApp.confirmationToken?.token || activeApp.applicationReference}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold mt-1">Registry Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADMISSION OFFER ACCEPTANCE & MATRICULATION FEE BANNER (IF APPROVED & NOT YET ENROLLED) */}
      {activeApp?.status === 'APPROVED' && !activeApp?.isEnrolled && (
        <div className="bg-gradient-to-r from-emerald-950 via-[#0F223D] to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-500/40 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">
                    {activeApp.offerAccepted ? 'Offer Formally Accepted' : 'Admission Offer Published'}
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-semibold">
                    {activeApp.applicationReference}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                  Congratulations, {user?.firstName}! Your Admission Offer is Confirmed.
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Offered admission to <strong>{activeApp.course?.name}</strong>. Complete the enrollment requirements below to receive your official Matriculation Number.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
              <Link
                to="/admission-letter"
                className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-300" /> View Acceptance Letter
              </Link>
            </div>
          </div>

          {/* Offer Acceptance Actions / Matriculation Payment Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            {/* Action 1: Formal Offer Acceptance */}
            <div className={`p-4 rounded-xl border ${activeApp.offerAccepted ? 'bg-emerald-900/30 border-emerald-500/40' : 'bg-white/5 border-white/15'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Step 1: Accept Admission Offer
                </span>
                {activeApp.offerAccepted && (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Accepted
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mb-3">
                {activeApp.offerAccepted
                  ? `Offer formally accepted on ${new Date(activeApp.offerAcceptedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.`
                  : 'Formally accept your provisional admission offer to reserve your collegiate seat.'}
              </p>
              {!activeApp.offerAccepted && (
                <button
                  type="button"
                  disabled={acceptOfferMutation.isPending}
                  onClick={() => acceptOfferMutation.mutate()}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {acceptOfferMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                      Recording Acceptance...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      Accept Admission Offer &amp; Reserve Seat
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Action 2: Matriculation & Tuition Payment */}
            <div className={`p-4 rounded-xl border ${activeApp.offerAccepted ? 'bg-gold-950/30 border-gold-500/40' : 'bg-white/5 border-white/10 opacity-70'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-300">
                  Step 2: Tuition &amp; Matriculation Fee
                </span>
                <span className="text-xs font-mono font-bold text-gold-400">
                  Min. 60%: SLE {installment60SLE}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                {activeApp.offerAccepted
                  ? `Full annual session fee is SLE ${tuitionFeeSLE}. Pay minimum 60% installment to be issued your official collegiate Matriculation Number.`
                  : 'You must formally accept your offer before initiating tuition fee settlement.'}
              </p>
              {activeApp.offerAccepted && (
                <Link
                  to={`/payment/${activeApp.id}?type=matriculation`}
                  className="w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Proceed to Matriculation Fee Payment
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Published Admissions Interview Schedule Banner */}
      {activeApp?.interviewStatus === 'SCHEDULED' && activeApp?.status !== 'APPROVED' && (
        <div className="bg-gradient-to-r from-[#0F223D] via-[#162D4E] to-[#0F223D] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-400/30 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-bold">
                    Interview Scheduled
                  </span>
                  <span className="text-xs text-blue-200 font-mono font-semibold">
                    {activeApp.applicationReference}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                  Admissions Interview Confirmed for {user?.firstName}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Programme: <strong>{activeApp.course?.name}</strong> ({activeApp.studyMode || 'Full-Time'})
                </p>
              </div>
            </div>

            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/15 text-right w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Scheduled Time</span>
              <span className="font-mono font-bold text-sm text-white">
                {activeApp.interviewDate
                  ? new Date(activeApp.interviewDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Upcoming'}{' '}
                • {activeApp.interviewTime || '10:00 AM'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Campus Venue / Location</span>
              <span className="text-slate-200 font-medium block mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                {activeApp.interviewVenue || '19 Bockarie Gbay Street Kenema (KICTAMC Main Campus)'}
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Interview Format</span>
              <span className="text-slate-200 font-medium block mt-0.5">
                {activeApp.interviewMode === 'ONLINE' ? 'Online Video Interview' : 'In-Person Panel Interview'}
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Interview Status</span>
              <span className="text-emerald-300 font-bold block mt-0.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Confirmed &amp; Ready for Verification
              </span>
            </div>
          </div>

          {activeApp.interviewNotes && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300">
              <strong className="text-amber-300 block mb-0.5">Instructions from Admissions Office:</strong>
              <p className="italic text-[11.5px] leading-relaxed">{activeApp.interviewNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Top 5-Column Info Strip Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          <div className="pt-2 sm:pt-0 lg:pr-4">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Application Reference
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono">
              {activeApp?.applicationReference || 'KICTAMC-2025-00123'}
            </span>
          </div>

          <div className="pt-2 sm:pt-0 lg:px-4">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Programme
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block">
              {activeApp?.course?.name || 'BSc. Computer Science'}
            </span>
          </div>

          <div className="pt-2 sm:pt-0 lg:px-4">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Academic Year
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {activeApp?.academicYear?.year || '2025/2026'}
            </span>
          </div>

          <div className="pt-2 sm:pt-0 lg:px-4">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Application Status
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {activeApp ? activeApp.status.replace(/_/g, ' ') : 'Draft'}
              </span>
            </div>
          </div>

          <div className="pt-2 sm:pt-0 lg:pl-4">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Payment Status
            </span>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                activeApp?.paymentStatus === 'PAID'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200/80'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  activeApp?.paymentStatus === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                {activeApp?.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Progress Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Application Progress
          </h2>
          <div className="sm:text-right">
            <div className="flex items-center sm:justify-end gap-2 text-xs font-medium text-slate-500 mb-1">
              <span>Completion</span>
              <span className="font-bold text-slate-800">{completionPct}%</span>
            </div>
            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 6 Step Nodes */}
        <div className="relative">
          <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
            {[
              { num: 1, name: 'Programme', completed: true },
              { num: 2, name: 'Personal Info', current: true },
              { num: 3, name: 'Guardian' },
              { num: 4, name: 'Education' },
              { num: 5, name: 'Documents' },
              { num: 6, name: 'Review' },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step.completed
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : step.current
                      ? 'bg-[#10223B] text-white ring-4 ring-slate-100 shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {step.completed ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.num}
                </div>
                <span
                  className={`text-[11px] font-medium mt-2 ${
                    step.current ? 'text-slate-900 font-bold' : 'text-slate-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Required Documents Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
              Required Documents
            </h3>
            <div className="space-y-3">
              {[
                'Examination Results / Certificates',
                'School Testimonial',
                'Birth Certificate',
                'National ID (if required)',
                'Passport Photo',
              ].map((docName, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-4 h-4 rounded-full border border-red-300 bg-red-50 text-red-600 flex items-center justify-center text-[10px] flex-shrink-0">
                      !
                    </span>
                    <span className="truncate max-w-[170px]">{docName}</span>
                  </div>
                  <span className="text-[10px] text-red-500 font-medium whitespace-nowrap">
                    Not uploaded
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link
              to="/documents"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All Documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Recent Notifications Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Recent Notifications
              </h3>
              <Link to="/notifications" className="text-xs font-medium text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 leading-tight">
                    Application created successfully
                  </p>
                  <span className="text-[10px] text-slate-400">2 hours ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 leading-tight">
                    Please upload your academic results
                  </p>
                  <span className="text-[10px] text-slate-400">5 hours ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3 h-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 leading-tight">
                    Payment verification is pending
                  </p>
                  <span className="text-[10px] text-slate-400">1 day ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-3 h-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 leading-tight">
                    Application under review
                  </p>
                  <span className="text-[10px] text-slate-400">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Next Action Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between text-center sm:text-left">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
              Next Action
            </h3>

            {activeApp?.isEnrolled || activeApp?.matriculationNumber ? (
              <div className="py-2 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-gold-50 border border-gold-200 text-gold-700 flex items-center justify-center mb-3">
                  <GraduationCap className="w-6 h-6 text-gold-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Enrolment &amp; Matriculation Complete
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  You are fully enrolled for the {activeApp.academicYear?.year || '2026/2027'} session. Print your collegiate clearance ID card.
                </p>
              </div>
            ) : activeApp?.status === 'APPROVED' && activeApp?.offerAccepted ? (
              <div className="py-2 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-gold-50 border border-gold-200 text-gold-700 flex items-center justify-center mb-3">
                  <CreditCard className="w-6 h-6 text-gold-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Matriculation &amp; Tuition Payment
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Offer accepted. Pay minimum 60% installment (SLE {installment60SLE}) to be issued your official collegiate Matriculation Number.
                </p>
              </div>
            ) : activeApp?.status === 'APPROVED' ? (
              <div className="py-2 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Accept Admission Offer
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Provisional admission offer published. Formally accept your offer to reserve your collegiate seat.
                </p>
              </div>
            ) : activeApp?.interviewStatus === 'SCHEDULED' ? (
              <div className="py-2 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Attend Admissions Interview
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Scheduled for {activeApp.interviewDate ? new Date(activeApp.interviewDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Upcoming'} at {activeApp.interviewTime || '10:00 AM'}.
                </p>
              </div>
            ) : activeApp?.status === 'AWAITING_PAYMENT' ? (
              <div className="py-2 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Application Fee Required
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Submit mobile money (Orange/Africell) or bank teller payment proof to complete submission.
                </p>
              </div>
            ) : activeApp?.status === 'UNDER_REVIEW' ? (
              <div className="py-2 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Academic Board Review
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Your WASSCE results and fee confirmation are under committee review for interview scheduling.
                </p>
              </div>
            ) : (
              <div className="py-2 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Complete your application
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Please fill in all sections and upload the required documents.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            {activeApp?.isEnrolled || activeApp?.matriculationNumber ? (
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 px-4 bg-[#0A192F] hover:bg-[#10223B] text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-gold-400" />
                <span>Print Official Clearance Card</span>
              </button>
            ) : activeApp?.status === 'APPROVED' && activeApp?.offerAccepted ? (
              <Link to={`/payment/${activeApp.id}?type=matriculation`}>
                <button
                  type="button"
                  className="w-full py-2.5 px-4 bg-gold-600 hover:bg-gold-700 text-navy-950 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Matriculation Fee</span>
                </button>
              </Link>
            ) : activeApp?.status === 'APPROVED' ? (
              <button
                type="button"
                disabled={acceptOfferMutation.isPending}
                onClick={() => acceptOfferMutation.mutate()}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{acceptOfferMutation.isPending ? 'Accepting...' : 'Accept Admission Offer'}</span>
              </button>
            ) : activeApp?.interviewStatus === 'SCHEDULED' ? (
              <div className="space-y-1">
                <span className="text-[10px] text-blue-700 font-bold block text-center">
                  Venue: 19 Bockarie Gbay Street Kenema
                </span>
                <Link to="/tracking">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 bg-[#0F223D] hover:bg-[#1A3358] text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Interview Dossier</span>
                  </button>
                </Link>
              </div>
            ) : activeApp?.status === 'AWAITING_PAYMENT' ? (
              <Link to={`/payment/${activeApp.id}`}>
                <button
                  type="button"
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Application Fee</span>
                </button>
              </Link>
            ) : activeApp?.status === 'UNDER_REVIEW' ? (
              <Link to={`/tracking/${activeApp.id}`}>
                <button
                  type="button"
                  className="w-full py-2.5 px-4 bg-[#10223B] hover:bg-[#162D4E] text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Track Application Status</span>
                </button>
              </Link>
            ) : (
              <Link to="/apply">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 bg-[#10223B] hover:bg-[#162D4E] text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Continue Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Dynamic Application Timeline Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-5">
          Application Progress Timeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 relative">
          {/* Step 1: Application Started */}
          <div className="flex items-start gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800">Application Started</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Dossier initialized</p>
            </div>
          </div>

          {/* Step 2: Submitted */}
          <div className="flex items-start gap-3">
            <span
              className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                activeApp?.status && activeApp.status !== 'DRAFT'
                  ? 'bg-emerald-500 ring-4 ring-emerald-50'
                  : 'border-2 border-slate-300 bg-white'
              }`}
            />
            <div>
              <p className="text-xs font-bold text-slate-800">Application Submitted</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeApp?.status && activeApp.status !== 'DRAFT' ? 'Completed' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Step 3: Fee Payment */}
          <div className="flex items-start gap-3">
            <span
              className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                activeApp?.paymentStatus === 'PAID'
                  ? 'bg-emerald-500 ring-4 ring-emerald-50'
                  : 'border-2 border-slate-300 bg-white'
              }`}
            />
            <div>
              <p className="text-xs font-bold text-slate-800">Fee Payment Verified</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeApp?.paymentStatus === 'PAID' ? 'Verified by Bursary' : 'Pending verification'}
              </p>
            </div>
          </div>

          {/* Step 4: Admissions Interview */}
          <div className="flex items-start gap-3">
            <span
              className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                activeApp?.interviewStatus === 'PASSED' || activeApp?.status === 'APPROVED'
                  ? 'bg-emerald-500 ring-4 ring-emerald-50'
                  : activeApp?.interviewStatus === 'SCHEDULED'
                  ? 'bg-blue-500 ring-4 ring-blue-50 animate-pulse'
                  : 'border-2 border-slate-300 bg-white'
              }`}
            />
            <div>
              <p className="text-xs font-bold text-slate-800">Admissions Interview</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeApp?.interviewStatus === 'PASSED' || activeApp?.status === 'APPROVED'
                  ? 'Passed & Verified'
                  : activeApp?.interviewStatus === 'SCHEDULED'
                  ? `Scheduled (${activeApp.interviewDate ? new Date(activeApp.interviewDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Upcoming'})`
                  : 'Pending schedule'}
              </p>
            </div>
          </div>

          {/* Step 5: Acceptance Letter */}
          <div className="flex items-start gap-3">
            <span
              className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                activeApp?.status === 'APPROVED'
                  ? 'bg-emerald-500 ring-4 ring-emerald-50'
                  : 'border-2 border-slate-300 bg-white'
              }`}
            />
            <div>
              <p className="text-xs font-bold text-slate-800">Acceptance Letter</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeApp?.status === 'APPROVED' ? 'Offer Published' : 'Pending approval'}
              </p>
            </div>
          </div>

          {/* Step 6: Matriculation & Enrolment */}
          <div className="flex items-start gap-3">
            <span
              className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                activeApp?.isEnrolled || activeApp?.matriculationNumber
                  ? 'bg-gold-500 ring-4 ring-gold-100'
                  : activeApp?.offerAccepted
                  ? 'bg-amber-400 ring-4 ring-amber-50 animate-pulse'
                  : 'border-2 border-slate-300 bg-white'
              }`}
            />
            <div>
              <p className="text-xs font-bold text-slate-800">Matriculation</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeApp?.matriculationNumber
                  ? activeApp.matriculationNumber
                  : activeApp?.offerAccepted
                  ? 'Tuition Pending'
                  : 'Pending Offer'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
