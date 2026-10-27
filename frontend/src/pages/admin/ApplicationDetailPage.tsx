import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Building,
  GraduationCap,
  FileText,
  CreditCard,
  ShieldCheck,
  Send,
  ExternalLink,
  MessageSquare,
  Calendar,
  Award,
  Sparkles,
  Check,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { DocumentPreviewModal } from '../../components/ui/DocumentPreviewModal';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [previewDoc, setPreviewDoc] = useState<{ id: string; filename?: string; mimeType?: string; title?: string } | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [decisionModal, setDecisionModal] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [actionError, setActionError] = useState('');

  // Interview Scheduling State
  const [scheduleInterviewModalOpen, setScheduleInterviewModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    interviewTime: '10:00 AM',
    interviewVenue: 'KICTAMC Main Campus, ICT Academic Hall, 19 Bockarie Gbay Street Kenema',
    interviewMode: 'IN_PERSON',
    interviewNotes: 'Candidate must bring original WASSCE / BECE results slips, national ID or passport, and proof of application fee payment.',
  });

  // Interview Decision & Verification State
  const [interviewDecisionModalOpen, setInterviewDecisionModalOpen] = useState(false);
  const [interviewDecisionForm, setInterviewDecisionForm] = useState({
    interviewResult: 'PASSED' as 'PASSED' | 'FAILED',
    interviewScore: '85',
    panelRemarks: 'Candidate demonstrated good analytical skills, communication aptitude, and strong motivation for collegiate study. Recommended for admission.',
  });

  // Fetch application details
  const { data: application, isLoading, error } = useQuery({
    queryKey: ['admin-application-detail', id],
    queryFn: () => api.get<any>(`/admin/applications/${id}`),
    enabled: !!id,
  });

  // Decision Mutation
  const decisionMutation = useMutation({
    mutationFn: async ({
      decision,
      notes,
    }: {
      decision: 'APPROVED' | 'REJECTED';
      notes: string;
    }) => {
      return api.post(`/admin/applications/${id}/decision`, {
        decision,
        decisionNotes: notes,
        rejectionReason: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-application-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setDecisionModal(null);
      setDecisionRemarks('');
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to submit decision.');
    },
  });

  // Schedule Interview Mutation
  const scheduleInterviewMutation = useMutation({
    mutationFn: async (data: typeof interviewForm) => {
      return api.post(`/admin/applications/${id}/schedule-interview`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-application-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setScheduleInterviewModalOpen(false);
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to schedule interview.');
    },
  });

  // Record Interview Decision & Verify Mutation
  const recordInterviewMutation = useMutation({
    mutationFn: async (data: typeof interviewDecisionForm) => {
      return api.post(`/admin/applications/${id}/interview-decision`, {
        interviewResult: data.interviewResult,
        interviewScore: data.interviewScore ? parseInt(data.interviewScore, 10) : undefined,
        panelRemarks: data.panelRemarks,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-application-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setInterviewDecisionModalOpen(false);
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to record interview decision.');
    },
  });

  // Correction Request Mutation
  const correctionMutation = useMutation({
    mutationFn: async (reason: string) => {
      return api.post(`/admin/applications/${id}/request-correction`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-application-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setCorrectionModalOpen(false);
      setCorrectionReason('');
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to request correction.');
    },
  });

  // Issue Matriculation Number Mutation
  const issueMatriculationMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/admin/applications/${id}/issue-matriculation`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-application-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setActionError('');
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to issue matriculation number.');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-navy-950 mb-2">Application Not Found</h2>
        <p className="text-slate-600 mb-6">Unable to load the specified application dossier.</p>
        <Link
          to="/admin/applications"
          className="px-4 py-2 bg-navy-800 text-white rounded-lg text-sm font-semibold"
        >
          Return to Applications List
        </Link>
      </div>
    );
  }

  const profile = application.applicant?.studentProfile;
  const token = application.confirmationToken?.token;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications List
        </Link>
      </div>

      {/* Main Dossier Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src="/kictamc-logo.png"
              alt="KICTAMC Crest"
              className="w-14 h-14 object-contain flex-shrink-0 drop-shadow-sm"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy-950">
                  {application.applicant?.firstName} {application.applicant?.middleName || ''} {application.applicant?.surname}
                </h1>
                <span className="font-mono text-sm px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold">
                  {application.applicationReference}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Program Applied: <strong className="text-navy-900">{application.course?.name || application.courseNameSnapshot}</strong> ({application.course?.qualificationLevel || application.courseLevelSnapshot})
                {' • '}{application.academicYear?.name || '2026/2027'} Intake
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Badge */}
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-navy-100 text-navy-900">
              {application.status.replace(/_/g, ' ')}
            </span>

            {/* Fee badge */}
            {application.paymentStatus === 'PAID' ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Fee Verified
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Fee Pending
              </span>
            )}
          </div>
        </div>

        {/* Token Banner if token issued */}
        {token && (
          <div className="mt-6 p-4 bg-gold-50/60 border border-gold-300 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-gold-600 flex-shrink-0" />
              <div>
                <span className="text-xs uppercase font-bold text-gold-800 block">
                  Cryptographic Payment Confirmation Token
                </span>
                <span className="font-mono font-black text-lg text-navy-950">{token}</span>
              </div>
            </div>
            <Link
              to={`/verify-token/${token}`}
              target="_blank"
              className="text-xs font-semibold text-gold-700 hover:underline flex items-center gap-1"
            >
              Verify Ledger <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Existing Decision Alert if already decided */}
        {application.status === 'APPROVED' && (
          <div className="space-y-4 mt-6">
            <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Application Approved for Admission
                </h4>
                <p className="mt-1 text-xs text-emerald-800">
                  Remarks: {application.decisionRemarks || 'Applicant meets all academic and institutional entry requirements.'}
                </p>
              </div>
              <Link
                to={`/admin/admission-letter/${application.id}`}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm flex-shrink-0"
              >
                <FileText className="w-3.5 h-3.5" /> View / Print Admission Letter
              </Link>
            </div>

            {/* Matriculation & Registry Enrolment Dossier */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-navy-900 text-white rounded-xl border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-navy-950 px-2 py-0.5 rounded-full font-mono">
                      Collegiate Registry
                    </span>
                    {application.matriculationNumber ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Fully Enrolled &amp; Matriculated
                      </span>
                    ) : (
                      <span className="text-xs text-amber-300 font-medium">
                        {application.offerAccepted ? 'Offer Accepted • Awaiting Matriculation' : 'Offer Pending Candidate Acceptance'}
                      </span>
                    )}
                  </div>
                  {application.matriculationNumber ? (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-slate-300">Official Matriculation Number:</span>
                      <span className="font-mono font-black text-gold-400 text-base">{application.matriculationNumber}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 mt-1">
                      Candidate admission offer published. Matriculation number generates automatically upon tuition verification, or can be assigned by Registrar.
                    </p>
                  )}
                </div>
              </div>

              {!application.matriculationNumber && user?.role !== 'COMPLIANCE' && (
                <button
                  type="button"
                  disabled={issueMatriculationMutation.isPending}
                  onClick={() => issueMatriculationMutation.mutate()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {issueMatriculationMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )}
                  Issue Matriculation Number
                </button>
              )}
            </div>
          </div>
        )}

        {application.status === 'REJECTED' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded-xl text-red-900 text-sm">
            <h4 className="font-bold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" /> Application Not Accepted
            </h4>
            <p className="mt-1 text-xs text-red-800">
              Reason: {application.decisionRemarks || 'Entry qualifications do not meet intake criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 1: PERSONAL & GEOGRAPHIC DETAILS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-navy-950 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-navy-800" /> 1. Personal & Sierra Leone Geographic Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">Email Address</span>
            <div className="font-medium text-navy-900 mt-0.5">{application.applicant?.email}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">Phone Number</span>
            <div className="font-medium text-navy-900 mt-0.5">{application.applicant?.phone}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">Gender</span>
            <div className="font-medium text-navy-900 mt-0.5">{profile?.gender || 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">Date of Birth</span>
            <div className="font-medium text-navy-900 mt-0.5">
              {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">Nationality</span>
            <div className="font-medium text-navy-900 mt-0.5">{profile?.nationality || 'Sierra Leonean'}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">Marital Status</span>
            <div className="font-medium text-navy-900 mt-0.5">{profile?.maritalStatus || 'Single'}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">Town / City</span>
            <div className="font-medium text-navy-900 mt-0.5">{profile?.townCity || 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">Chiefdom</span>
            <div className="font-medium text-navy-900 mt-0.5">{profile?.chiefdom || 'N/A'}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block">District & Province</span>
            <div className="font-medium text-navy-900 mt-0.5">
              {profile?.district || 'N/A'}, {profile?.regionProvince || 'Eastern Province'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PARENT / GUARDIAN & EMERGENCY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-navy-950 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-navy-800" /> 2. Parent/Guardian & Emergency Contact
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-navy-900 text-sm border-b border-slate-200 pb-2">Parent / Guardian</h3>
            <div>
              <span className="text-xs text-slate-400 uppercase block">Full Name</span>
              <span className="font-semibold text-slate-800">{profile?.parentFullName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase block">Relationship</span>
              <span className="text-slate-700">{profile?.parentRelationship || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase block">Phone</span>
              <span className="text-slate-700">{profile?.parentPhone || 'N/A'}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-navy-900 text-sm border-b border-slate-200 pb-2">Emergency Contact</h3>
            <div>
              <span className="text-xs text-slate-400 uppercase block">Full Name</span>
              <span className="font-semibold text-slate-800">{profile?.emergencyFullName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase block">Relationship</span>
              <span className="text-slate-700">{profile?.emergencyRelationship || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase block">Phone</span>
              <span className="text-slate-700">{profile?.emergencyPhone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: EDUCATIONAL QUALIFICATIONS & GRADES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-navy-950 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-navy-800" /> 3. Educational Qualifications & Examination Results
        </h2>

        {application.educations && application.educations.length > 0 ? (
          <div className="space-y-4">
            {application.educations.map((edu: any, idx: number) => {
              const grades = Array.isArray(edu.subjectsAndGrades) ? edu.subjectsAndGrades : [];
              return (
                <div key={edu.id || idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="font-bold text-navy-950 text-base">{edu.institutionName}</h3>
                      <p className="text-xs text-slate-500">
                        {edu.institutionLocation} • {edu.examinationType} ({edu.examinationYear})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 uppercase block">Candidate Index Number</span>
                      <span className="font-mono font-bold text-navy-900 text-sm">{edu.candidateNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Subject-by-subject grades table */}
                  {grades.length > 0 && (
                    <div className="mt-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                        Subject Grades:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {grades.map((g: any, gIdx: number) => (
                          <div key={gIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                            <span className="font-medium text-slate-700">{g.subject}</span>
                            <span className="font-mono font-bold text-navy-900 px-1.5 py-0.5 bg-slate-100 rounded">
                              {g.grade}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No educational records attached.</p>
        )}
      </div>

      {/* SECTION 4: UPLOADED DOCUMENTS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-navy-950 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-navy-800" /> 4. Uploaded Verification Documents
        </h2>

        {application.documents && application.documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {application.documents.map((doc: any) => (
              <div key={doc.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-navy-950 text-sm">
                    {doc.documentType.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
                    {doc.originalFilename}
                  </p>
                  <span className={`inline-block text-[11px] font-bold mt-1 ${
                    doc.status === 'VERIFIED' ? 'text-emerald-700' : doc.status === 'REJECTED' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    Status: {doc.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewDoc({
                      id: doc.id,
                      filename: doc.originalFilename,
                      mimeType: doc.mimeType,
                      title: doc.documentType.replace(/_/g, ' '),
                    })
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-navy-800 hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No documents uploaded.</p>
        )}
      </div>

      {/* SECTION 5: ADMISSIONS INTERVIEW SCHEDULING & OUTCOME VERIFICATION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-navy-800" /> 5. Admissions Interview Schedule &amp; Outcome Verification
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure and publish interview schedules to the applicant portal, record interview results, and verify candidates for automatic acceptance letter issuance.
            </p>
          </div>

          <div>
            {application.interviewStatus === 'SCHEDULED' ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Interview Scheduled
              </span>
            ) : application.interviewStatus === 'PASSED' || (application.status === 'APPROVED' && application.acceptanceLetterPublished) ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Interview Verified &amp; Passed
              </span>
            ) : application.interviewStatus === 'FAILED' ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-900 border border-red-200 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-600" /> Interview Unsuccessful
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                Interview Pending
              </span>
            )}
          </div>
        </div>

        {/* Interview State Details */}
        {application.interviewStatus === 'SCHEDULED' ? (
          <div className="mt-5 p-5 bg-gradient-to-br from-blue-50/70 to-slate-50 rounded-xl border border-blue-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Interview Date &amp; Time</span>
                <span className="text-sm font-bold text-navy-950 block mt-0.5">
                  {application.interviewDate
                    ? new Date(application.interviewDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}{' '}
                  at <span className="font-mono text-blue-900">{application.interviewTime || '10:00 AM'}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Campus Venue / Mode</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                  {application.interviewVenue || '19 Bockarie Gbay Street Kenema (KICTAMC Main Campus)'}
                  <span className="block text-[11px] text-slate-500 font-normal">
                    Format: {application.interviewMode === 'ONLINE' ? 'Online Video Interview' : 'In-Person Panel Interview'}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant Portal Visibility</span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Published &amp; Visible to Candidate
                </span>
              </div>
            </div>

            {application.interviewNotes && (
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-0.5">Candidate Preparation Instructions:</span>
                <p className="text-slate-600 italic">{application.interviewNotes}</p>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-blue-100">
              <button
                type="button"
                onClick={() => setScheduleInterviewModalOpen(true)}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Reschedule Interview
              </button>

              <button
                type="button"
                onClick={() => setInterviewDecisionModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-emerald-200" />
                Record &amp; Verify Interview Outcome (Approve Admission)
              </button>
            </div>
          </div>
        ) : application.interviewStatus === 'PASSED' || (application.status === 'APPROVED' && application.acceptanceLetterPublished) ? (
          <div className="mt-5 p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Interview Verified &amp; Admission Offer Approved
                </span>
                <p className="text-xs text-emerald-800 mt-1">
                  Candidate cleared admissions panel assessment. Provisional Acceptance Letter with actual system-configured fees (Tuition + Registration + ICT/Library) was automatically generated and published to the applicant portal.
                </p>
                {application.interviewScore && (
                  <span className="inline-block mt-2 font-mono text-xs font-bold bg-white text-emerald-900 px-2.5 py-1 rounded border border-emerald-300">
                    Interview Evaluation Score: {application.interviewScore}%
                  </span>
                )}
              </div>

              <Link
                to={`/admin/admission-letter/${application.id}`}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm flex-shrink-0"
              >
                <FileText className="w-4 h-4" /> View / Print Acceptance Letter
              </Link>
            </div>
          </div>
        ) : user?.role === 'COMPLIANCE' ? (
          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Auditor Notice: Admissions interview scheduling is administered by the Admissions Office.</span>
          </div>
        ) : (
          <div className="mt-5 p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Schedule Candidate for Admissions Interview</h4>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Configure the interview date, time, campus venue, and instructions. Once published, the interview schedule will immediately display on the verified applicant's dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setScheduleInterviewModalOpen(true)}
              className="px-5 py-2.5 bg-[#0F223D] hover:bg-[#1A3358] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              Configure &amp; Publish Interview Schedule
            </button>
          </div>
        )}
      </div>

      {/* SECTION 6: ADMISSIONS BOARD DECISION ACTION DECK */}
      {user?.role === 'COMPLIANCE' ? (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl p-6 sm:p-8 flex items-start gap-3.5 shadow-sm">
          <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-amber-950 flex items-center gap-2">
              Compliance &amp; Audit Supervisory View
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold uppercase">
                View Only
              </span>
            </h3>
            <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
              You are viewing this candidate's application in Auditor Mode. Compliance personnel possess supervisory viewing rights across all applicant records and activity logs. Application approvals, rejections, and correction requests can only be submitted by authorized Admissions and Executive administration.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
          <h2 className="text-lg font-bold text-gold-400 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> 6. Admissions Officer Direct Override &amp; Board Action
          </h2>
          <p className="text-xs text-navy-200 mb-6">
            Record board recommendations, request applicant clarification or render final acceptance/decline decision.
          </p>

          {actionError && (
            <div className="mb-6 p-3 bg-red-900/80 border border-red-500 text-red-100 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {actionError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setCorrectionModalOpen(true)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Request Applicant Correction
            </button>

            <button
              type="button"
              onClick={() => setDecisionModal('REJECT')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Decline Application
            </button>

            <button
              type="button"
              onClick={() => setDecisionModal('APPROVE')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 ml-auto"
            >
              <CheckCircle className="w-4 h-4" />
              Approve for Admission
            </button>
          </div>
        </div>
      )}

      {/* DECISION CONFIRMATION MODAL */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className={`text-lg font-bold mb-1 ${decisionModal === 'APPROVE' ? 'text-emerald-900' : 'text-red-900'}`}>
              {decisionModal === 'APPROVE' ? 'Approve Application for Admission' : 'Decline Application'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {decisionModal === 'APPROVE'
                ? 'Candidate will receive an official Acceptance Offer notification and move to Approved status.'
                : 'Candidate will receive a notice of non-acceptance with your supplied explanation.'}
            </p>

            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Decision Notes / Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder={
                decisionModal === 'APPROVE'
                  ? 'e.g. Meets WASSCE 5 credits entry criteria. Accepted into Lower Diploma Program.'
                  : 'e.g. Does not meet minimum mathematics credit requirement.'
              }
              value={decisionRemarks}
              onChange={(e) => setDecisionRemarks(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDecisionModal(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={decisionMutation.isPending || !decisionRemarks.trim()}
                onClick={() =>
                  decisionMutation.mutate({
                    decision: decisionModal === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                    notes: decisionRemarks.trim(),
                  })
                }
                className={`px-5 py-2 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 ${
                  decisionModal === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {decisionMutation.isPending ? 'Saving Decision...' : `Confirm ${decisionModal}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORRECTION REQUEST MODAL */}
      {correctionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-900 mb-1">Request Applicant Correction</h3>
            <p className="text-xs text-slate-500 mb-4">
              Application status will change to Action Required and candidate will be instructed to make changes.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Please re-upload clearer WASSCE statement of result showing scratch card pin."
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={correctionMutation.isPending || !correctionReason.trim()}
                onClick={() => correctionMutation.mutate(correctionReason.trim())}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {correctionMutation.isPending ? 'Sending...' : 'Send Correction Notice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {scheduleInterviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0F223D]" /> Configure Admissions Interview Schedule
              </h3>
              <button
                onClick={() => setScheduleInterviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Set the interview schedule for candidate <strong>{application.applicant?.firstName} {application.applicant?.surname}</strong> ({application.applicationReference}). This will immediately publish and display on their applicant dashboard.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                scheduleInterviewMutation.mutate(interviewForm);
              }}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Interview Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewForm.interviewDate}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Interview Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={interviewForm.interviewTime}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewTime: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Interview Format / Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={interviewForm.interviewMode}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewMode: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-slate-800"
                >
                  <option value="IN_PERSON">In-Person Panel Interview (On Campus)</option>
                  <option value="ONLINE">Online Video Conference (Zoom / Microsoft Teams)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Campus Venue / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.interviewVenue}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewVenue: e.target.value })}
                  placeholder="e.g. 19 Bockarie Gbay Street Kenema (KICTAMC Main Campus)"
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Candidate Instructions &amp; Required Documents
                </label>
                <textarea
                  rows={3}
                  value={interviewForm.interviewNotes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewNotes: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-slate-800"
                  placeholder="e.g. Candidate must bring original WASSCE / BECE results slips, birth certificate, and proof of payment."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleInterviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleInterviewMutation.isPending}
                  className="px-5 py-2.5 bg-[#0F223D] hover:bg-[#1A3358] text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {scheduleInterviewMutation.isPending ? 'Publishing Schedule...' : 'Publish Interview Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD INTERVIEW DECISION & VERIFICATION MODAL */}
      {interviewDecisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700" /> Verify Interview &amp; Issue Acceptance Offer
              </h3>
              <button
                onClick={() => setInterviewDecisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ×
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-xs text-emerald-900">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" /> Automatic Acceptance Letter Generation &amp; Publishing
              </p>
              <p className="mt-1 text-[11px] text-emerald-800 leading-relaxed">
                When verified and approved as successful, the official Provisional Acceptance Letter containing the actual configured fees (tuition, registration, laboratory, and library tariffs) will be automatically generated and published directly to the applicant portal.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                recordInterviewMutation.mutate(interviewDecisionForm);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Interview Evaluation Outcome <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInterviewDecisionForm({ ...interviewDecisionForm, interviewResult: 'PASSED' })}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      interviewDecisionForm.interviewResult === 'PASSED'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Interview Successful (Passed)
                  </button>

                  <button
                    type="button"
                    onClick={() => setInterviewDecisionForm({ ...interviewDecisionForm, interviewResult: 'FAILED' })}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      interviewDecisionForm.interviewResult === 'FAILED'
                        ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-red-600" /> Interview Unsuccessful (Failed)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Interview Score (%) (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={interviewDecisionForm.interviewScore}
                  onChange={(e) => setInterviewDecisionForm({ ...interviewDecisionForm, interviewScore: e.target.value })}
                  placeholder="e.g. 85"
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Interview Panel Verification Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={interviewDecisionForm.panelRemarks}
                  onChange={(e) => setInterviewDecisionForm({ ...interviewDecisionForm, panelRemarks: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 text-slate-800"
                  placeholder="e.g. Candidate satisfied interview committee requirements. Cleared for admission."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInterviewDecisionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordInterviewMutation.isPending}
                  className={`px-5 py-2.5 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer ${
                    interviewDecisionForm.interviewResult === 'PASSED'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {recordInterviewMutation.isPending
                    ? 'Processing...'
                    : interviewDecisionForm.interviewResult === 'PASSED'
                    ? 'Verify & Publish Acceptance Letter'
                    : 'Record Unsuccessful Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DocumentPreviewModal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentId={previewDoc?.id ?? null}
        filename={previewDoc?.filename}
        mimeType={previewDoc?.mimeType}
        title={previewDoc?.title ?? 'Document Preview'}
      />
    </div>
  );
};
