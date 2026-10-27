import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  CreditCard,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  BarChart2,
  Building2,
  GraduationCap,
  Percent,
  Check,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const ReportsPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<any>('/admin/stats'),
  });

  // Fetch applications list for report aggregations
  const { data: applicationsResp, isLoading: appsLoading } = useQuery({
    queryKey: ['admin-applications-report'],
    queryFn: () => api.get<any>('/admin/applications?limit=500'),
  });
  const applications: any[] = Array.isArray(applicationsResp)
    ? applicationsResp
    : (applicationsResp?.items ?? []);

  // Fetch payments list for revenue calculations
  const { data: paymentsResp, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments-report'],
    queryFn: () => api.get<any>('/admin/payments?limit=500'),
  });
  const payments: any[] = Array.isArray(paymentsResp)
    ? paymentsResp
    : (paymentsResp?.items ?? []);

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get<any[]>('/courses'),
  });

  // Helper to extract SLE amount
  const getPaymentSLE = (p: any) => Number(p.declaredAmountMinor || p.expectedAmountMinor || 0) / 100;

  // Aggregate verified revenue
  const verifiedPayments = payments.filter((p: any) => p.status === 'PAID');
  const totalVerifiedRevenue = verifiedPayments.reduce(
    (sum: number, p: any) => sum + getPaymentSLE(p),
    0
  );

  const appFeePayments = verifiedPayments.filter((p: any) => p.paymentType === 'APPLICATION_FEE' || !p.paymentType);
  const tuitionPayments = verifiedPayments.filter((p: any) => p.paymentType === 'TUITION_MATRICULATION');

  const appFeeRevenue = appFeePayments.reduce((sum: number, p: any) => sum + getPaymentSLE(p), 0);
  const tuitionRevenue = tuitionPayments.reduce((sum: number, p: any) => sum + getPaymentSLE(p), 0);

  // Funnel calculations
  const totalApplications = applications.length;
  const submittedCount = applications.filter((a: any) => a.status !== 'DRAFT').length;
  const feePaidCount = applications.filter((a: any) => a.paymentStatus === 'PAID').length;
  const interviewedCount = applications.filter((a: any) => a.interviewStatus === 'PASSED' || a.status === 'APPROVED').length;
  const approvedCount = applications.filter((a: any) => a.status === 'APPROVED').length;
  const matriculatedCount = applications.filter((a: any) => a.isEnrolled || a.matriculationNumber).length;

  const funnelStages = [
    {
      id: 'initiated',
      name: '1. Started / Drafted',
      count: totalApplications,
      pct: 100,
      color: 'bg-slate-400',
      description: 'Applicants initiated admission dossiers',
    },
    {
      id: 'submitted',
      name: '2. Formally Submitted',
      count: submittedCount,
      pct: totalApplications > 0 ? Math.round((submittedCount / totalApplications) * 100) : 0,
      color: 'bg-blue-500',
      description: 'Completed personal, academic & document details',
    },
    {
      id: 'fee_paid',
      name: '3. Application Fee Cleared',
      count: feePaidCount,
      pct: totalApplications > 0 ? Math.round((feePaidCount / totalApplications) * 100) : 0,
      color: 'bg-indigo-500',
      description: 'Bursary verified bank / mobile money payment',
    },
    {
      id: 'interviewed',
      name: '4. Interview Evaluated',
      count: interviewedCount,
      pct: totalApplications > 0 ? Math.round((interviewedCount / totalApplications) * 100) : 0,
      color: 'bg-amber-500',
      description: 'Passed panel or credential interview session',
    },
    {
      id: 'approved',
      name: '5. Admission Offered',
      count: approvedCount,
      pct: totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0,
      color: 'bg-emerald-500',
      description: 'Official acceptance letters published',
    },
    {
      id: 'matriculated',
      name: '6. Matriculated & Enrolled',
      count: matriculatedCount,
      pct: totalApplications > 0 ? Math.round((matriculatedCount / totalApplications) * 100) : 0,
      color: 'bg-gold-500',
      description: 'Matriculation numbers assigned & registered',
    },
  ];

  // Group applications by course with quotas
  const courseDistribution = courses.map((course: any) => {
    const courseApps = applications.filter((a: any) => a.courseId === course.id);
    const approved = courseApps.filter((a: any) => a.status === 'APPROVED').length;
    const underReview = courseApps.filter((a: any) => a.status === 'UNDER_REVIEW').length;
    const enrolled = courseApps.filter((a: any) => a.isEnrolled || a.matriculationNumber).length;
    const capacity = course.capacity || 50; // Standard collegiate intake quota per course
    const quotaUsedPct = Math.min(100, Math.round((enrolled / capacity) * 100));

    return {
      id: course.id,
      code: course.code,
      name: course.name,
      facultyName: course.department?.faculty?.name || 'School of Technology & Management',
      capacity,
      total: courseApps.length,
      approved,
      enrolled,
      underReview,
      quotaUsedPct,
    };
  });

  // Group payments by method (aligned with Prisma PaymentMethod enum)
  const paymentsByMethod = [
    {
      method: 'Sierra Leone Commercial Bank (SLCB)',
      count: payments.filter((p: any) => p.paymentMethod === 'MANUAL_BANK_DEPOSIT' || p.method === 'SLCB' || p.method === 'BANK_DEPOSIT').length,
      total: payments
        .filter((p: any) => (p.paymentMethod === 'MANUAL_BANK_DEPOSIT' || p.method === 'SLCB' || p.method === 'BANK_DEPOSIT') && p.status === 'PAID')
        .reduce((sum: number, p: any) => sum + getPaymentSLE(p), 0),
    },
    {
      method: 'Orange Money (SL)',
      count: payments.filter((p: any) => p.paymentMethod === 'MANUAL_ORANGE_MONEY' || p.method === 'ORANGE_MONEY').length,
      total: payments
        .filter((p: any) => (p.paymentMethod === 'MANUAL_ORANGE_MONEY' || p.method === 'ORANGE_MONEY') && p.status === 'PAID')
        .reduce((sum: number, p: any) => sum + getPaymentSLE(p), 0),
    },
    {
      method: 'Africell Afrimoney',
      count: payments.filter((p: any) => p.paymentMethod === 'MANUAL_AFRIMONEY' || p.method === 'AFRIMONEY').length,
      total: payments
        .filter((p: any) => (p.paymentMethod === 'MANUAL_AFRIMONEY' || p.method === 'AFRIMONEY') && p.status === 'PAID')
        .reduce((sum: number, p: any) => sum + getPaymentSLE(p), 0),
    },
    {
      method: 'Instant Online Gateway Settlement',
      count: payments.filter((p: any) => p.paymentMethod === 'ONLINE_MOCK' || p.method === 'ONLINE').length,
      total: payments
        .filter((p: any) => (p.paymentMethod === 'ONLINE_MOCK' || p.method === 'ONLINE') && p.status === 'PAID')
        .reduce((sum: number, p: any) => sum + getPaymentSLE(p), 0),
    },
  ];

  // CSV Export: Admissions Register
  const handleExportApplicationsCSV = () => {
    if (applications.length === 0) return;

    const headers = [
      'Application Reference',
      'Matriculation Number',
      'Applicant Name',
      'Email',
      'Phone',
      'Programme Code',
      'Programme Name',
      'Status',
      'Offer Accepted',
      'Enrolled',
      'Submission Date',
    ];

    const rows = applications.map((app: any) => {
      const applicantName =
        app.applicant ? `${app.applicant.firstName || ''} ${app.applicant.surname || ''}`.trim() :
        app.user ? `${app.user.firstName || ''} ${app.user.surname || ''}`.trim() :
        'Applicant';
      const email = app.applicant?.email || app.user?.email || '';
      const phone = app.applicant?.phone || app.user?.phone || '';
      const progCode = app.course?.code || app.courseCodeSnapshot || '';
      const progName = app.course?.name || app.courseNameSnapshot || '';
      const subDate = app.submittedAt
        ? new Date(app.submittedAt).toLocaleDateString('en-GB')
        : '';

      return [
        `"${app.applicationReference || app.id}"`,
        `"${app.matriculationNumber || ''}"`,
        `"${applicantName}"`,
        `"${email}"`,
        `"${phone}"`,
        `"${progCode}"`,
        `"${progName}"`,
        `"${app.status}"`,
        `"${app.offerAccepted ? 'YES' : 'NO'}"`,
        `"${app.isEnrolled ? 'YES' : 'NO'}"`,
        `"${subDate}"`,
      ];
    });

    downloadCSV(
      'KICTAMC_Admissions_Register',
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    );
  };

  // CSV Export: Bursary Payments Ledger
  const handleExportPaymentsCSV = () => {
    if (payments.length === 0) return;

    const headers = [
      'Date',
      'Application Reference',
      'Matriculation Number',
      'Applicant Name',
      'Payment Type',
      'Channel',
      'Provider / Teller Ref',
      'Internal Ref',
      'Amount (SLE)',
      'Status',
    ];

    const rows = payments.map((p: any) => [
      `"${new Date(p.submittedAt).toLocaleDateString('en-GB')}"`,
      `"${p.application?.applicationReference || ''}"`,
      `"${p.application?.matriculationNumber || ''}"`,
      `"${p.application?.applicant?.firstName || ''} ${p.application?.applicant?.surname || ''}"`,
      `"${p.paymentType === 'TUITION_MATRICULATION' ? 'Tuition & Matriculation' : 'Application Fee'}"`,
      `"${p.paymentMethod?.replace(/MANUAL_/, '').replace(/_/g, ' ') || ''}"`,
      `"${p.providerTransactionReference || ''}"`,
      `"${p.internalReference || ''}"`,
      `"${getPaymentSLE(p).toFixed(2)}"`,
      `"${p.status}"`,
    ]);

    downloadCSV(
      'KICTAMC_Bursary_Reconciliation',
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    );
  };

  // CSV Export: Programme Quotas Summary
  const handleExportQuotasCSV = () => {
    if (courses.length === 0) return;

    const headers = [
      'Programme Code',
      'Programme Title',
      'Faculty / Department',
      'Intake Capacity',
      'Total Applications',
      'Offers Granted',
      'Fully Enrolled',
      'Quota Utilization %',
    ];

    const rows = courseDistribution.map((c: any) => [
      `"${c.code}"`,
      `"${c.name}"`,
      `"${c.facultyName}"`,
      `"${c.capacity}"`,
      `"${c.total}"`,
      `"${c.approved}"`,
      `"${c.enrolled}"`,
      `"${c.quotaUsedPct}%"`,
    ]);

    downloadCSV(
      'KICTAMC_Programme_Quotas',
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    );
  };

  const downloadCSV = (filename: string, content: string) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + content;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-800 bg-navy-50 border border-navy-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Registry &amp; Institutional Analytics
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-950 font-serif">
            Admissions, Quotas &amp; Revenue Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time admissions pipeline, departmental enrolment quotas, and bursary reconciliations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={handlePrint}
            className="text-xs flex items-center gap-1.5 border-slate-300"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </Button>

          <Button
            variant="primary"
            onClick={handleExportApplicationsCSV}
            className="text-xs flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white"
          >
            <Download className="w-3.5 h-3.5 text-gold-400" />
            <span>Export Register (CSV)</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleExportPaymentsCSV}
            className="text-xs flex items-center gap-1.5 border-slate-300"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Bursary (CSV)</span>
          </Button>
        </div>
      </div>

      {/* High-Level Institutional KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Applications</span>
            <Users className="w-4 h-4 text-navy-600" />
          </div>
          <div className="text-2xl font-bold text-navy-950">
            {totalApplications}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all intakes &amp; departments</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Admissions Offered</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            {approvedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0}% acceptance rate
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Matriculated Students</span>
            <GraduationCap className="w-4 h-4 text-gold-600" />
          </div>
          <div className="text-2xl font-bold text-gold-700">
            {matriculatedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Collegiate numbers issued</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Verified Revenue</span>
            <CreditCard className="w-4 h-4 text-gold-600" />
          </div>
          <div className="text-2xl font-bold text-navy-950 font-serif">
            SLE {totalVerifiedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
            <span>App Fees: SLE {appFeeRevenue.toLocaleString()}</span>
            <span>Tuition: SLE {tuitionRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ADMISSIONS FUNNEL METRICS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-navy-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-navy-950">
              Admissions Conversion Funnel
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {totalApplications} Dossiers Analyzed
          </span>
        </div>

        <div className="space-y-4">
          {funnelStages.map((stage) => (
            <div key={stage.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{stage.name}</span>
                  <span className="text-slate-400 hidden sm:inline">• {stage.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-navy-900">{stage.count} candidates</span>
                  <span className="w-12 text-right font-mono font-bold text-slate-600">{stage.pct}%</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                  style={{ width: `${Math.max(stage.pct, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROGRAMME INTAKE & QUOTA CAPACITY UTILIZATION */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-navy-800" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-950">
              Departmental Intake Quotas &amp; Enrolment Capacity
            </h2>
          </div>
          <Button
            variant="secondary"
            onClick={handleExportQuotasCSV}
            className="text-xs flex items-center gap-1.5 border-slate-300"
          >
            <Download className="w-3 h-3 text-slate-600" />
            <span>Export Quota Summary (CSV)</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Programme Title</th>
                <th className="px-4 py-3.5">Faculty / Department</th>
                <th className="px-4 py-3.5 text-center">Intake Quota</th>
                <th className="px-4 py-3.5 text-center">Applications</th>
                <th className="px-4 py-3.5 text-center">Offers Granted</th>
                <th className="px-4 py-3.5 text-center">Matriculated</th>
                <th className="px-4 py-3.5 min-w-[160px]">Quota Utilization</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {courseDistribution.map((c: any) => {
                const isNearCapacity = c.quotaUsedPct >= 80 && c.quotaUsedPct < 100;
                const isFull = c.quotaUsedPct >= 100;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-navy-900">{c.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.facultyName}</td>
                    <td className="px-4 py-3 text-center font-bold text-navy-950">{c.capacity}</td>
                    <td className="px-4 py-3 text-center font-medium">{c.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                        {c.approved}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-gold-50 text-gold-900 font-bold font-mono">
                        {c.enrolled}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFull ? 'bg-rose-500' : isNearCapacity ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(c.quotaUsedPct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-600 w-10 text-right">
                          {c.quotaUsedPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isFull ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Quota Full
                        </span>
                      ) : isNearCapacity ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Near Quota
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Open Intake
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FINANCE & BURSARY REVENUE RECONCILIATION */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gold-600" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-950">
              Payment Gateway &amp; Channel Reconciliation
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total Ledger: {payments.length} Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Financial Gateway / Bank</th>
                <th className="px-4 py-3 text-center">Transactions Recorded</th>
                <th className="px-4 py-3 text-right">Settled Amount (SLE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paymentsByMethod.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-navy-950">{item.method}</td>
                  <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                    {item.count}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-navy-900">
                    SLE {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-navy-950">
              <tr>
                <td className="px-4 py-3.5">Total Reconciled Collections</td>
                <td className="px-4 py-3.5 text-center">{payments.length}</td>
                <td className="px-4 py-3.5 text-right font-mono text-emerald-800 text-sm">
                  SLE {totalVerifiedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
