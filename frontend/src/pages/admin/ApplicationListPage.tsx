import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  GraduationCap,
  Calendar,
  CreditCard,
  User,
  Printer,
  FileCheck,
  Download,
  Building2,
  Layers,
  Award,
  CheckSquare,
  Square,
  Users,
  Send,
  X,
  Sparkles,
  ChevronRight,
  MapPin,
  Video,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ActionMenu } from '../../components/ui/ActionMenu';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination, type PaginatedResponse } from '../../hooks/usePagination';
import { Faculty, Department } from '../../types/academic';
import { AddStudentModal } from '../../components/admin/AddStudentModal';

export const ApplicationListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const canAddStudent =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'ADMISSIONS_OFFICER';

  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get('status') || 'ALL';

  // Add Student Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(urlStatus);
  const [facultyFilter, setFacultyFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [interviewStatusFilter, setInterviewStatusFilter] = useState<string>('ALL');

  // Multi-Select Batch State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals State
  const [isBatchInterviewModalOpen, setIsBatchInterviewModalOpen] = useState(false);
  const [isBatchDecisionModalOpen, setIsBatchDecisionModalOpen] = useState(false);
  const [isBatchPublishModalOpen, setIsBatchPublishModalOpen] = useState(false);

  // Forms State
  const [batchInterviewForm, setBatchInterviewForm] = useState({
    interviewDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    interviewTime: '10:00 AM',
    interviewVenue: 'Main Campus Academic Hall, Kenema',
    interviewMode: 'IN_PERSON',
    interviewNotes: 'Candidates are required to bring original WASSCE certificates, National ID, and payment receipt.',
  });

  const [batchDecisionForm, setBatchDecisionForm] = useState({
    decision: 'APPROVED' as 'APPROVED' | 'REJECTED' | 'SHORTLIST_FOR_INTERVIEW',
    remarks: 'Admissions Board review concluded. Candidate meets required qualifications.',
    publishAcceptanceLetter: true,
  });

  const [batchFeedback, setBatchFeedback] = useState<string | null>(null);

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

  // 1. Fetch Faculties for dropdown filter
  const { data: facultiesRaw = [] } = useQuery({
    queryKey: ['faculties-filter'],
    queryFn: () => api.get<any>('/faculties?limit=100'),
  });
  const faculties: Faculty[] = Array.isArray(facultiesRaw)
    ? facultiesRaw
    : facultiesRaw?.faculties || [];

  // 2. Fetch Departments for dropdown filter
  const { data: departments = [] } = useQuery({
    queryKey: ['departments-filter', facultyFilter],
    queryFn: () => {
      const url = facultyFilter !== 'ALL' ? `/departments?facultyId=${facultyFilter}` : '/departments';
      return api.get<any[]>(url);
    },
  });

  // 3. Fetch courses for dropdown filter
  const { data: courses = [] } = useQuery({
    queryKey: ['courses-filter', facultyFilter, departmentFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (facultyFilter !== 'ALL') params.append('facultyId', facultyFilter);
      if (departmentFilter !== 'ALL') params.append('departmentId', departmentFilter);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return api.get<any[]>(`/courses${qs}`);
    },
  });

  // Pagination (page/limit in URL, defaults 1/15)
  const { page, limit, setPage, reset: resetPagination } = usePagination(15);

  // Reset to page 1 whenever filters/search change
  useEffect(() => {
    resetPagination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, facultyFilter, departmentFilter, courseFilter, interviewStatusFilter, searchTerm]);

  // 4. Fetch Applications with rich filters
  const { data: paginated, isLoading, refetch } = useQuery({
    queryKey: [
      'admin-applications',
      statusFilter,
      facultyFilter,
      departmentFilter,
      courseFilter,
      interviewStatusFilter,
      searchTerm,
      page,
      limit,
    ],
    queryFn: async () => {
      let queryUrl = '/admin/applications';
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (facultyFilter !== 'ALL') params.append('facultyId', facultyFilter);
      if (departmentFilter !== 'ALL') params.append('departmentId', departmentFilter);
      if (courseFilter !== 'ALL') params.append('courseId', courseFilter);
      if (interviewStatusFilter !== 'ALL') params.append('interviewStatus', interviewStatusFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', String(page));
      params.append('limit', String(limit));
      queryUrl += `?${params.toString()}`;

      return api.get<PaginatedResponse<any>>(queryUrl);
    },
  });

  const applications = paginated?.items ?? [];
  const pagination = paginated?.pagination;

  // Multi-select handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(applications.map((app: any) => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Selected applications objects
  const selectedApps = applications.filter((app: any) => selectedIds.includes(app.id));

  // Batch Mutations
  const batchInterviewMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/admin/applications/batch-schedule-interview', payload);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setIsBatchInterviewModalOpen(false);
      setSelectedIds([]);
      setBatchFeedback(res?.message || 'Interviews scheduled successfully.');
      setTimeout(() => setBatchFeedback(null), 5000);
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to schedule batch interviews.');
    },
  });

  const batchDecisionMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/admin/applications/batch-decision', payload);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setIsBatchDecisionModalOpen(false);
      setSelectedIds([]);
      setBatchFeedback(res?.message || 'Batch decisions applied successfully.');
      setTimeout(() => setBatchFeedback(null), 5000);
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to apply batch decisions.');
    },
  });

  const batchPublishMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/admin/applications/batch-publish-acceptance', payload);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      setIsBatchPublishModalOpen(false);
      setSelectedIds([]);
      setBatchFeedback(res?.message || 'Acceptance letters published successfully.');
      setTimeout(() => setBatchFeedback(null), 5000);
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to publish acceptance letters.');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      case 'AWAITING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
            <CreditCard className="w-3 h-3" /> Awaiting Payment
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
            <FileText className="w-3 h-3" /> Submitted
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-orange-100 text-orange-800">
            <AlertCircle className="w-3 h-3" /> Correction Req.
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return;

    const headers = [
      'Application Reference',
      'Applicant Name',
      'Email',
      'Phone',
      'Faculty',
      'Department',
      'Programme',
      'Qualification Level',
      'Submission Date',
      'Fee Status',
      'Interview Status',
      'Acceptance Letter Published',
      'Admissions Status',
    ];

    const rows = applications.map((app: any) => [
      `"${app.applicationReference || app.id}"`,
      `"${app.applicant?.firstName || ''} ${app.applicant?.surname || ''}"`,
      `"${app.applicant?.email || ''}"`,
      `"${app.applicant?.phone || ''}"`,
      `"${app.course?.faculty?.name || ''}"`,
      `"${app.course?.department?.name || ''}"`,
      `"${app.course?.name || app.courseNameSnapshot || ''}"`,
      `"${app.course?.qualificationLevel || app.courseLevelSnapshot || ''}"`,
      `"${app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-GB') : new Date(app.createdAt).toLocaleDateString('en-GB')}"`,
      `"${app.paymentStatus || 'UNPAID'}"`,
      `"${app.interviewStatus || 'NONE'}"`,
      `"${app.acceptanceLetterPublished ? 'YES' : 'NO'}"`,
      `"${app.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KICTAMC_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl pb-24">
      {/* 1. Header with Title & Export Action */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
            <Link to="/admin" className="hover:text-navy-900 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span>Admissions Management</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Applications</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
              Admissions Applications
            </h1>
            <Badge variant="navy">{applications.length} Found</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review submitted student applications, schedule batch interviews, and issue automated acceptance letters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleExportCSV}
            disabled={applications.length === 0}
            variant="secondary"
            size="sm"
            className="gap-2 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-gold-600" />
            <span>Export CSV ({applications.length})</span>
          </Button>

          {canAddStudent && (
            <Button
              onClick={() => setIsAddStudentModalOpen(true)}
              variant="primary"
              size="sm"
              className="gap-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white border-none shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-200" />
              <span>Direct Enrol Student</span>
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Alert */}
      {batchFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{batchFeedback}</span>
          </div>
          <button onClick={() => setBatchFeedback(null)} className="text-emerald-600 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* 2. Comprehensive Filter Bar (Faculty, Department, Course, Status, Search) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by reference, candidate name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 focus:border-navy-800 text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 text-slate-700 font-medium"
            >
              <option value="ALL">All Application Statuses</option>
              <option value="SUBMITTED">Submitted (Pending Review)</option>
              <option value="UNDER_REVIEW">Under Review / Shortlisted</option>
              <option value="APPROVED">Approved & Accepted</option>
              <option value="ACTION_REQUIRED">Action Required / Corrections</option>
              <option value="REJECTED">Rejected</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
            </select>

            {/* Interview Status Filter */}
            <select
              value={interviewStatusFilter}
              onChange={(e) => setInterviewStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 text-slate-700 font-medium"
            >
              <option value="ALL">All Interview Statuses</option>
              <option value="SCHEDULED">Interview Scheduled</option>
              <option value="PASSED">Interview Passed</option>
              <option value="FAILED">Interview Failed</option>
              <option value="NONE">No Interview Scheduled</option>
            </select>
          </div>
        </div>

        {/* Academic Hierarchy Filters (Faculty & Department & Course) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          {/* Faculty Filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={facultyFilter}
              onChange={(e) => {
                setFacultyFilter(e.target.value);
                setDepartmentFilter('ALL');
                setCourseFilter('ALL');
              }}
              className="py-1 px-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 text-slate-700"
            >
              <option value="ALL">All College Faculties</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCourseFilter('ALL');
              }}
              className="py-1 px-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 text-slate-700"
            >
              <option value="ALL">All Collegiate Departments</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Programme / Course Filter */}
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="py-1 px-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 text-slate-700 max-w-[220px]"
            >
              <option value="ALL">All Academic Programmes</option>
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {(facultyFilter !== 'ALL' || departmentFilter !== 'ALL' || courseFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setFacultyFilter('ALL');
                setDepartmentFilter('ALL');
                setCourseFilter('ALL');
                setStatusFilter('ALL');
                setInterviewStatusFilter('ALL');
                setSearchTerm('');
              }}
              className="text-[11px] text-navy-800 font-semibold hover:underline ml-auto"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Applications Table with Multi-Select Checkboxes */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={applications.length > 0 && selectedIds.length === applications.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-3.5 w-3.5 rounded text-navy-900 border-slate-300 focus:ring-navy-800 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Application Ref</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Programme & Faculty</th>
                <th className="py-3 px-4">Interview Schedule</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Decision Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-navy-800 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading application records...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No applications match the current filter criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app: any) => {
                  const isSelected = selectedIds.includes(app.id);
                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-navy-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(app.id)}
                          className="h-3.5 w-3.5 rounded text-navy-900 border-slate-300 focus:ring-navy-800 cursor-pointer"
                        />
                      </td>

                      {/* Application Reference */}
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-900 whitespace-nowrap">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <span>{app.applicationReference}</span>
                        </Link>
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-xs">
                          {app.applicant?.firstName} {app.applicant?.surname}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{app.applicant?.phone}</span>
                          <span>•</span>
                          <span className="truncate max-w-[130px]">{app.applicant?.email}</span>
                        </div>
                      </td>

                      {/* Programme, Faculty & Department */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate" title={app.course?.name}>
                          {app.course?.name || app.courseNameSnapshot}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                          {app.course?.faculty && (
                            <span className="font-semibold text-navy-800">
                              {app.course.faculty.code}
                            </span>
                          )}
                          {app.course?.department && (
                            <span>/ {app.course.department.name}</span>
                          )}
                        </div>
                      </td>

                      {/* Interview Schedule Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {app.interviewStatus === 'SCHEDULED' && app.interviewDate ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                            <Calendar className="h-3 w-3 text-purple-600" />
                            <span>
                              {new Date(app.interviewDate).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })}{' '}
                              {app.interviewTime}
                            </span>
                          </div>
                        ) : app.interviewStatus === 'PASSED' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Passed Interview</span>
                          </div>
                        ) : app.interviewStatus === 'FAILED' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold">
                            <XCircle className="h-3 w-3 text-rose-600" />
                            <span>Interview Failed</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not Scheduled</span>
                        )}
                      </td>

                      {/* Fee Payment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {app.paymentStatus === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Unpaid
                          </span>
                        )}
                      </td>

                      {/* Admissions Decision Status & Letter Indicator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(app.status)}
                          {app.acceptanceLetterPublished && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-navy-800 bg-gold-50 border border-gold-200 px-1.5 py-0.2 rounded">
                              <Award className="w-2.5 h-2.5 text-gold-600" />
                              <span>Letter Published</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <ActionMenu
                          label={`Actions for ${app.applicationReference}`}
                          items={[
                            {
                              label: 'Review Application',
                              icon: <Eye className="w-4 h-4 text-navy-800" />,
                              to: `/admin/applications/${app.id}`,
                            },
                            {
                              label: 'Verify Fee Payment',
                              icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
                              to: `/admin/payments?ref=${encodeURIComponent(app.applicationReference)}`,
                            },
                            {
                              label: 'View Acceptance Letter',
                              icon: <Award className="w-4 h-4 text-gold-600" />,
                              to: `/admin/admission-letter/${app.id}`,
                            },
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

      {/* 4. FLOATING BATCH ACTION BAR (Smooth entrance when selectedIds > 0) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-navy-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-navy-800 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-2 border-r border-navy-800 text-xs">
            <span className="w-6 h-6 rounded-full bg-gold-500 text-navy-950 font-bold flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            <span className="font-semibold text-slate-200">Applications Selected</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Button 1: Schedule Batch Interview */}
            <Button
              size="sm"
              onClick={() => setIsBatchInterviewModalOpen(true)}
              className="gap-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white font-semibold"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Interview</span>
            </Button>

            {/* Button 2: Batch Decision */}
            <Button
              size="sm"
              onClick={() => {
                setBatchDecisionForm({
                  decision: 'APPROVED',
                  remarks: 'Admissions Board review concluded. Candidate meets required qualifications.',
                  publishAcceptanceLetter: true,
                });
                setIsBatchDecisionModalOpen(true);
              }}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Batch Decision</span>
            </Button>

            {/* Button 3: Batch Publish Acceptance Letters */}
            <Button
              size="sm"
              onClick={() => setIsBatchPublishModalOpen(true)}
              className="gap-1.5 text-xs bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Publish Letters</span>
            </Button>

            {/* Deselect All */}
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. BATCH INTERVIEW SCHEDULING MODAL */}
      {isBatchInterviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-navy-950">
                    Schedule Batch Interview
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure interview timetable for {selectedIds.length} candidate(s).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchInterviewModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                batchInterviewMutation.mutate({
                  applicationIds: selectedIds,
                  ...batchInterviewForm,
                });
              }}
              className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs"
            >
              {/* Selected Candidates Summary */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-1">
                  Selected Applicants ({selectedApps.length}):
                </span>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {selectedApps.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-navy-900">
                        {a.applicant?.firstName} {a.applicant?.surname} ({a.applicationReference})
                      </span>
                      <span className="text-slate-500 truncate max-w-[150px]">{a.course?.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Interview Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={batchInterviewForm.interviewDate}
                    onChange={(e) =>
                      setBatchInterviewForm({ ...batchInterviewForm, interviewDate: e.target.value })
                    }
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Interview Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={batchInterviewForm.interviewTime}
                    onChange={(e) =>
                      setBatchInterviewForm({ ...batchInterviewForm, interviewTime: e.target.value })
                    }
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Interview Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${
                      batchInterviewForm.interviewMode === 'IN_PERSON'
                        ? 'border-navy-900 bg-navy-50/50 font-bold text-navy-950'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interviewMode"
                      value="IN_PERSON"
                      checked={batchInterviewForm.interviewMode === 'IN_PERSON'}
                      onChange={() =>
                        setBatchInterviewForm({ ...batchInterviewForm, interviewMode: 'IN_PERSON' })
                      }
                      className="hidden"
                    />
                    <MapPin className="h-4 w-4 text-navy-800" />
                    <span>In-Person On Campus</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${
                      batchInterviewForm.interviewMode === 'ONLINE'
                        ? 'border-navy-900 bg-navy-50/50 font-bold text-navy-950'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interviewMode"
                      value="ONLINE"
                      checked={batchInterviewForm.interviewMode === 'ONLINE'}
                      onChange={() =>
                        setBatchInterviewForm({ ...batchInterviewForm, interviewMode: 'ONLINE' })
                      }
                      className="hidden"
                    />
                    <Video className="h-4 w-4 text-purple-700" />
                    <span>Online / Video Call</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Venue / Location / Meeting Link <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICT Complex Hall B, Main Campus, Kenema"
                  value={batchInterviewForm.interviewVenue}
                  onChange={(e) =>
                    setBatchInterviewForm({ ...batchInterviewForm, interviewVenue: e.target.value })
                  }
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Preparation Instructions & Candidate Requirements
                </label>
                <textarea
                  rows={3}
                  value={batchInterviewForm.interviewNotes}
                  onChange={(e) =>
                    setBatchInterviewForm({ ...batchInterviewForm, interviewNotes: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsBatchInterviewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={batchInterviewMutation.isPending}
                  className="gap-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold"
                >
                  {batchInterviewMutation.isPending ? (
                    'Scheduling...'
                  ) : (
                    <>
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Confirm & Schedule ({selectedIds.length})</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. BATCH ADMISSIONS DECISION MODAL */}
      {isBatchDecisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-navy-950">
                    Batch Admissions Decision
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Apply collective admission board decisions for {selectedIds.length} candidate(s).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchDecisionModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                batchDecisionMutation.mutate({
                  applicationIds: selectedIds,
                  ...batchDecisionForm,
                });
              }}
              className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs"
            >
              {/* Decision Radio Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Board Decision Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`p-3 rounded-lg border cursor-pointer text-center ${
                      batchDecisionForm.decision === 'APPROVED'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="APPROVED"
                      checked={batchDecisionForm.decision === 'APPROVED'}
                      onChange={() =>
                        setBatchDecisionForm({
                          ...batchDecisionForm,
                          decision: 'APPROVED',
                          remarks:
                            'Batch admission approval: Candidate meets all academic entrance criteria. Provisional offer issued.',
                        })
                      }
                      className="hidden"
                    />
                    <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <span>Approve Offer</span>
                  </label>

                  <label
                    className={`p-3 rounded-lg border cursor-pointer text-center ${
                      batchDecisionForm.decision === 'SHORTLIST_FOR_INTERVIEW'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="SHORTLIST_FOR_INTERVIEW"
                      checked={batchDecisionForm.decision === 'SHORTLIST_FOR_INTERVIEW'}
                      onChange={() =>
                        setBatchDecisionForm({
                          ...batchDecisionForm,
                          decision: 'SHORTLIST_FOR_INTERVIEW',
                          remarks: 'Shortlisted for admissions interview and assessment.',
                        })
                      }
                      className="hidden"
                    />
                    <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <span>Shortlist</span>
                  </label>

                  <label
                    className={`p-3 rounded-lg border cursor-pointer text-center ${
                      batchDecisionForm.decision === 'REJECTED'
                        ? 'border-rose-600 bg-rose-50/60 text-rose-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decisionType"
                      value="REJECTED"
                      checked={batchDecisionForm.decision === 'REJECTED'}
                      onChange={() =>
                        setBatchDecisionForm({
                          ...batchDecisionForm,
                          decision: 'REJECTED',
                          remarks:
                            'Application rejected: Candidate does not satisfy collegiate entry benchmark.',
                        })
                      }
                      className="hidden"
                    />
                    <XCircle className="h-4 w-4 text-rose-600 mx-auto mb-1" />
                    <span>Reject</span>
                  </label>
                </div>
              </div>

              {/* Automatic Acceptance Letter Publishing Checkbox */}
              {batchDecisionForm.decision === 'APPROVED' && (
                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-gold-200 bg-gold-50/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batchDecisionForm.publishAcceptanceLetter}
                    onChange={(e) =>
                      setBatchDecisionForm({
                        ...batchDecisionForm,
                        publishAcceptanceLetter: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded text-navy-800 focus:ring-navy-700 border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-navy-950 block">
                      Automatically Generate & Publish Acceptance Letters
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Instantly generates the official letter with tuition fees and makes it available in the applicant portal.
                    </span>
                  </div>
                </label>
              )}

              {/* Remarks Textarea */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Decision Remarks / Board Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={batchDecisionForm.remarks}
                  onChange={(e) =>
                    setBatchDecisionForm({ ...batchDecisionForm, remarks: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsBatchDecisionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={batchDecisionMutation.isPending}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {batchDecisionMutation.isPending ? (
                    'Processing...'
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Apply Decision ({selectedIds.length})</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. BATCH PUBLISH ACCEPTANCE LETTERS MODAL */}
      {isBatchPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center mx-auto">
              <Award className="h-6 w-6" />
            </div>

            <div className="text-center">
              <h3 className="font-serif font-bold text-base text-navy-950">
                Publish Official Acceptance Letters
              </h3>
              <p className="text-xs text-slate-600 mt-1.5">
                Generate and publish provisional admission acceptance letters for{' '}
                <strong>{selectedIds.length} applicant(s)</strong>.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Letters will contain the college crest, matriculation reference, academic specs, and prescribed fee tariffs.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                className="flex-1 text-xs"
                onClick={() => setIsBatchPublishModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 text-xs gap-1.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold"
                disabled={batchPublishMutation.isPending}
                onClick={() => batchPublishMutation.mutate({ applicationIds: selectedIds })}
              >
                {batchPublishMutation.isPending ? 'Publishing...' : 'Confirm & Publish'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
      />
    </div>
  );
};
