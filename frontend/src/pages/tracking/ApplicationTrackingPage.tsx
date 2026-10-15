import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
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
  Calendar,
  Layers,
} from 'lucide-react';

export const ApplicationTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. If explicit valid ID in URL (and not the literal string 'draft')
      if (id && id !== 'draft') {
        const data: any = await api.get(`/applications/${id}`);
        setApplication(data);
        return;
      }

      // 2. Otherwise retrieve applicant's submitted applications
      const myApps: any = await api.get<any[]>('/applications/me');
      if (Array.isArray(myApps) && myApps.length > 0) {
        setAllApplications(myApps);
        const primaryApp = myApps[0];
        try {
          // Fetch full detailed record
          const fullData: any = await api.get(`/applications/${primaryApp.id}`);
          setApplication(fullData);
        } catch {
          setApplication(primaryApp);
        }
        return;
      }

      // 3. If no submitted applications, check if there is an active draft
      try {
        const draftData: any = await api.post('/applications/draft');
        if (draftData && draftData.id) {
          setApplication(draftData);
        } else {
          setApplication(null);
        }
      } catch {
        setApplication(null);
      }
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
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-950 mb-1">No Active Application Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            {error ||
              "You do not have any active applications to track at this time. Start an application to monitor your admissions progress in real-time."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/apply">
              <Button variant="gold" className="text-xs font-semibold w-full sm:w-auto">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Start Admission Application
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary" className="text-xs w-full sm:w-auto">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
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

  const applicantName =
    application.applicant
      ? `${application.applicant.firstName || ''} ${application.applicant.middleName ? application.applicant.middleName + ' ' : ''}${application.applicant.surname || ''}`.trim()
      : user
      ? `${user.firstName || ''} ${user.middleName ? user.middleName + ' ' : ''}${user.surname || ''}`.trim()
      : 'Applicant Candidate';

  const courseName =
    application.courseNameSnapshot ||
    application.course?.name ||
    'Selected Academic Programme';

  const courseCode =
    application.courseCodeSnapshot ||
    application.course?.code ||
    '';

  const deptFaculty =
    application.departmentNameSnapshot ||
    application.course?.department?.name ||
    application.course?.faculty?.name ||
    'Kenema ICT & Management College';

  const intakeSession = `${application.academicYear?.name || '2026/2027'} • ${application.intake?.name || 'Regular Admissions'}`;

  const feeSLE = (
    (application.applicationFeeMinorSnapshot ||
      application.course?.applicationFeeMinor ||
      20000) /
    100
  ).toFixed(2);

  const currency = application.currencySnapshot || application.course?.currency || 'SLE';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Draft Mode Notice if not submitted */}
      {application.status === 'DRAFT' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-sm">
          <div>
            <h4 className="font-bold text-sm">Application Currently in Draft</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              You haven't formally submitted your application yet. Please finish the application wizard to begin formal admissions review.
            </p>
          </div>
          <Link to="/apply">
            <Button variant="gold" className="text-xs whitespace-nowrap">
              Continue Application Wizard <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Multiple Application Switcher if candidate has more than one */}
      {allApplications.length > 1 && (
        <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-slate-600 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-navy-800" />
            Switch Application:
          </span>
          <div className="flex gap-2 overflow-x-auto">
            {allApplications.map((app) => (
              <button
                key={app.id}
                onClick={async () => {
                  try {
                    const full: any = await api.get(`/applications/${app.id}`);
                    setApplication(full);
                  } catch {
                    setApplication(app);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition ${
                  application?.id === app.id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {app.applicationReference || app.id.slice(0, 8)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-950">Application Status &amp; Progress</h1>
            <Badge variant="navy">{application.applicationReference || 'DRAFT'}</Badge>
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
                <span>
                  {application.paymentStatus === 'REJECTED'
                    ? 'Resubmit Payment'
                    : application.paymentStatus === 'PENDING_VERIFICATION'
                    ? 'Review Payment Slip'
                    : 'Pay Application Fee'}
                </span>
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
              Issued on {new Date(application.confirmationToken.issuedAt).toLocaleDateString('en-GB')} by KICTAMC Finance Office.
            </p>
          </div>

          <Link to={`/receipt/${application.id}`}>
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
                {applicantName}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Enrolled Programme:</span>
              <span className="font-semibold text-slate-800">
                {courseName} {courseCode ? `(${courseCode})` : ''}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Qualification Level &amp; Faculty:</span>
              <span className="font-medium text-slate-700">
                {application.courseLevelSnapshot || application.course?.qualificationLevel || 'Undergraduate'} •{' '}
                {deptFaculty}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Intake Session:</span>
              <span className="font-medium text-slate-700">
                {intakeSession}
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
                variant={
                  application.paymentStatus === 'PAID'
                    ? 'success'
                    : application.paymentStatus === 'PENDING_VERIFICATION'
                    ? 'warning'
                    : 'neutral'
                }
                className="mt-0.5"
              >
                {application.paymentStatus}
              </Badge>
            </div>

            <div>
              <span className="text-slate-500 block">Application Fee:</span>
              <span className="font-bold text-emerald-700 text-sm">
                SLE {feeSLE} ({currency})
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Submission Timestamp:</span>
              <span className="font-medium text-slate-700">
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleString('en-GB')
                  : 'Not yet formally submitted'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

