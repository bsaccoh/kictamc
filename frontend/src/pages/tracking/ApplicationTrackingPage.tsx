import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Printer,
  ShieldCheck,
  ChevronRight,
  User,
  GraduationCap,
} from 'lucide-react';

export const ApplicationTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      const endpoint = id ? `/applications/${id}` : '/applications/draft';
      const data: any = await api.get(endpoint);
      setApplication(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load application status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <Card className="text-center py-12 max-w-lg mx-auto">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-navy-900">Application Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'Unable to retrieve tracking details.'}</p>
        <Link to="/dashboard" className="mt-4 inline-block">
          <Button variant="secondary" className="text-xs">
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    );
  }

  const timelineSteps = [
    { key: 'SUBMITTED', label: 'Application Submitted', desc: 'Online submission received' },
    { key: 'AWAITING_PAYMENT', label: 'Payment Reconciliation', desc: 'Bank receipt or online payment' },
    { key: 'UNDER_REVIEW', label: 'Admissions Review', desc: 'Academic credentials assessment' },
    { key: 'APPROVED', label: 'Admission Decision', desc: 'Offer of admission issued' },
  ];

  const getStepStatus = (stepKey: string) => {
    const status = application.status;
    if (status === 'APPROVED' && stepKey === 'APPROVED') return 'current';
    if (status === 'REJECTED' && stepKey === 'APPROVED') return 'rejected';

    if (stepKey === 'SUBMITTED' && status !== 'DRAFT') return 'completed';
    if (stepKey === 'AWAITING_PAYMENT') {
      if (application.paymentStatus === 'PAID') return 'completed';
      if (status === 'AWAITING_PAYMENT') return 'current';
      if (application.paymentStatus === 'PENDING_VERIFICATION') return 'pending_verification';
    }
    if (stepKey === 'UNDER_REVIEW') {
      if (status === 'UNDER_REVIEW') return 'current';
      if (status === 'APPROVED' || status === 'REJECTED') return 'completed';
    }
    return 'upcoming';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tracking Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-950">Application Status & Progress</h1>
            <Badge variant="navy">{application.applicationReference}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track your admission review timeline and payment verification in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="h-4 w-4" />
            <span>Print Summary</span>
          </Button>
          {application.paymentStatus !== 'PAID' && (
            <Link to={`/payment/${application.id}`}>
              <Button variant="gold" className="gap-1.5 text-xs font-semibold">
                <CreditCard className="h-4 w-4" />
                <span>{application.paymentStatus === 'REJECTED' ? 'Resubmit Payment' : 'Pay Application Fee'}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Verified Token Banner (if verified payment exists) */}
      {application.confirmationToken && (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-xl shadow-md border border-emerald-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Verified College Payment Confirmation Token:
            </span>
            <div className="text-2xl font-mono font-bold tracking-widest text-white">
              {application.confirmationToken.token}
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Issued on {new Date(application.confirmationToken.issuedAt).toLocaleDateString()} by KICTAMC Finance Office.
            </p>
          </div>

          <Link to={`/receipt/${application.payments?.[0]?.id || application.id}`}>
            <Button variant="gold" className="text-xs">
              View Verified Receipt
            </Button>
          </Link>
        </div>
      )}

      {/* Status Progress Timeline */}
      <Card title="Admission Progression Timeline">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          {timelineSteps.map((s, idx) => {
            const st = getStepStatus(s.key);
            return (
              <div
                key={s.key}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  st === 'completed'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : st === 'current'
                    ? 'bg-navy-900 border-navy-800 text-white'
                    : st === 'pending_verification'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold">0{idx + 1}.</span>
                    {st === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                    {st === 'current' && <Clock className="h-4 w-4 text-gold-400 animate-pulse" />}
                  </div>
                  <h4 className="font-bold text-xs mb-1">{s.label}</h4>
                  <p
                    className={`text-[11px] leading-tight ${
                      st === 'current' ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {s.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/40 text-[10px] font-semibold uppercase">
                  {st === 'completed' && 'Completed'}
                  {st === 'current' && 'In Progress'}
                  {st === 'pending_verification' && 'Pending Finance'}
                  {st === 'upcoming' && 'Pending'}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Application Snapshot Dossier */}
      <Card title="Application Snapshot Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-slate-500 block">Candidate Name:</span>
              <span className="font-bold text-sm text-navy-900">
                {application.applicant.firstName} {application.applicant.middleName || ''}{' '}
                {application.applicant.surname}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Enrolled Programme:</span>
              <span className="font-semibold text-slate-800">
                {application.courseNameSnapshot || application.course?.name} (
                {application.courseCodeSnapshot || application.course?.code})
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Qualification Level & Faculty:</span>
              <span className="font-medium text-slate-700">
                {application.courseLevelSnapshot || application.course?.qualificationLevel} •{' '}
                {application.departmentNameSnapshot || application.course?.department?.name}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Intake Session:</span>
              <span className="font-medium text-slate-700">
                {application.academicYear?.name} • {application.intake?.name}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-500 block">Application Status:</span>
              <Badge variant="navy" className="mt-0.5">
                {application.status}
              </Badge>
            </div>

            <div>
              <span className="text-slate-500 block">Payment Status:</span>
              <Badge
                variant={application.paymentStatus === 'PAID' ? 'success' : 'warning'}
                className="mt-0.5"
              >
                {application.paymentStatus}
              </Badge>
            </div>

            <div>
              <span className="text-slate-500 block">Application Fee:</span>
              <span className="font-bold text-emerald-700 text-sm">
                SLE{' '}
                {(
                  (application.applicationFeeMinorSnapshot ||
                    application.course?.applicationFeeMinor ||
                    0) / 100
                ).toFixed(2)}{' '}
                ({application.currencySnapshot || application.course?.currency || 'SLE'})
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Submission Timestamp:</span>
              <span className="font-medium text-slate-700">
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleString()
                  : 'Not yet formally submitted'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
