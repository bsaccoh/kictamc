import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap,
  FolderCheck,
  FileText,
  CheckSquare,
  Building2,
  Layers,
  BookOpen,
  Calendar,
  DollarSign,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const AdminModulePage: React.FC = () => {
  const { user } = useAuth();

  // 1. Fetch Admin Stats
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<any>('/admin/stats'),
    staleTime: 30000,
  });

  // 2. Fetch Admissions Overview for deadlines & queues
  const {
    data: admissionsOverview,
    isLoading: admissionsLoading,
    refetch: refetchAdmissions
  } = useQuery({
    queryKey: ['admissions-overview'],
    queryFn: () => api.get<any>('/admin/admissions/dashboard-overview'),
    staleTime: 30000,
  });

  // 3. Fetch Academic Years / Intakes
  const {
    data: academicYears = [],
    isLoading: yearsLoading,
    refetch: refetchYears
  } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => api.get<any[]>('/academic-years'),
    staleTime: 60000,
  });

  // 4. Fetch Faculties count
  const {
    data: facultiesData,
    isLoading: facultiesLoading,
    refetch: refetchFaculties
  } = useQuery({
    queryKey: ['faculties-summary'],
    queryFn: () => api.get<any>('/faculties?limit=1'),
    staleTime: 60000,
  });

  // 5. Fetch Departments count
  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    refetch: refetchDepartments
  } = useQuery({
    queryKey: ['departments-summary'],
    queryFn: () => api.get<any>('/departments?limit=1'),
    staleTime: 60000,
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchAdmissions();
    refetchYears();
    refetchFaculties();
    refetchDepartments();
  };

  const isLoading = statsLoading || admissionsLoading;

  // Active Intake
  const activeYear = academicYears.find((y: any) => y.isActive);
  const activeIntake = activeYear?.intakes?.find((i: any) => i.isActive) || academicYears[0]?.intakes?.[0];

  const totalApplications = stats?.totalApplications ?? 0;
  const underReview = stats?.underReview ?? 0;
  const approved = stats?.approvedApplications ?? 0;
  const rejected = stats?.rejectedApplications ?? 0;
  const totalCourses = stats?.coursesCount ?? 0;
  const totalFaculties = facultiesData?.pagination?.total ?? (Array.isArray(facultiesData) ? facultiesData.length : 0);
  const totalDepartments = departmentsData?.pagination?.total ?? (Array.isArray(departmentsData) ? departmentsData.length : 0);

  const role = user?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'SYSTEM_ADMIN';
  const isCollegeAdmin = role === 'ADMIN';
  const isAdmin = isSuperAdmin || isCollegeAdmin;
  const isAdmissions = isSuperAdmin || isCollegeAdmin || role === 'ADMISSIONS_OFFICER';

  return (
    <div className="space-y-6 max-w-7xl pb-10">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#10223B] via-[#162F53] to-[#1F3E6D] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-[#224375] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Administrative Command Hub
              </span>
              <span className="text-xs text-slate-300">
                KICTAMC Portal v2.0
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
              Admin
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consolidated administration center for admissions workflows, application queues, application fees, applicant documentation, faculties, departments, courses, and intake cycles.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={handleRefreshAll}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Module Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {isAdmissions && (
              <Link
                to="/admin/admissions"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E5B95C] hover:bg-[#D4A648] text-[#10223B] text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <FolderCheck className="w-4 h-4 text-[#10223B]" />
                <span>Admission Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Applications
            </span>
            <span className="text-xl font-bold text-slate-900 font-sans">
              {totalApplications.toLocaleString()}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-emerald-600 font-semibold">
                {approved} Accepted
              </span>
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Pending Review
            </span>
            <span className="text-xl font-bold text-amber-600 font-sans">
              {underReview.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Awaiting Decision
            </span>
          </div>
        </div>

        {/* Faculties & Depts */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Academic Structure
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 font-sans">
                {totalFaculties > 0 ? totalFaculties : 4}
              </span>
              <span className="text-xs text-slate-500">Faculties</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {totalDepartments > 0 ? totalDepartments : 8} Departments &middot; {totalCourses > 0 ? totalCourses : 12} Courses
            </span>
          </div>
        </div>

        {/* Active Intake */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Active Intake
            </span>
            <span className="text-xs font-bold text-slate-900 block truncate" title={activeIntake?.name || 'Active Intake'}>
              {activeIntake?.name || '2026/2027 Main Intake'}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold inline-flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Open for Submissions
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Admin Navigation Grid (The 9 management components) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Admin Sections &amp; Operations
          </h2>
          <span className="text-xs text-slate-500">9 Management Workspaces</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Admission Dashboard */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FolderCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Admissions
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Admission Dashboard
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Real-time admissions KPI metrics, intake target tracker, status distributions, and admissions timeline.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Analytics &amp; KPI</span>
              <Link
                to="/admin/admissions"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>Launch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Applications */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {totalApplications} Total
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Applications
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Authoritative master roster of all student applications across degree, diploma, and certificate programs.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">All Programmes</span>
              <Link
                to="/admin/applications"
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
              >
                <span>Browse Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Admission Review */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-5 h-5" />
                </div>
                {underReview > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                    {underReview} Action Required
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Queue Clear
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Admission Review
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Fast-track evaluation portal for applications awaiting admissions decisions and document reviews.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-amber-600 font-semibold">
                {underReview} Pending Review
              </span>
              <Link
                to="/admin/applications?status=UNDER_REVIEW"
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                <span>Review Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Applicant Documents */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FolderCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Verification
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  Applicant Documents
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Inspect academic certificates, transcripts, identity documents, and verify applicant file compliance.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Compliance Desk</span>
              <Link
                to="/admin/documents"
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>Inspect Files</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 5: Faculties */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {totalFaculties > 0 ? totalFaculties : 4} Registered
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Faculties
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Oversee institutional faculties, appointed deans, active status, and academic faculty governance.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Faculty Structure</span>
              <Link
                to="/admin/faculties"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>Configure</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 6: Departments */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {totalDepartments > 0 ? totalDepartments : 8} Departments
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  Departments
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Manage academic departments, assign Heads of Department (HODs), and link curriculum offerings.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">HOD &amp; Programs</span>
              <Link
                to="/admin/departments"
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 7: Courses & Programmes */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {totalCourses > 0 ? totalCourses : 12} Active
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Courses &amp; Programmes
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Configure degree, diploma, and certificate courses, entry requirements, prerequisites, and syllabi.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Curriculum Catalog</span>
              <Link
                to="/admin/courses"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>View Courses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 8: Admission Years / Intakes */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-gold-500 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Cycles &amp; Dates
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Admission Year / Intake
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Schedule academic years, open/close application windows, and set application deadlines.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Intake Windows</span>
              <Link
                to="/admin/academic-years"
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                <span>Configure</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 9: Application Fees */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Fee Policy
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Application Fees
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Configure mandatory application fee tariffs, currency parameters, payment instructions, and waiver policies.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Fee Structures</span>
              <Link
                to="/admin/fees"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>Configure Fees</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Academic Lifecycle Workflow Map */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>KICTAMC Academic &amp; Admissions Operational Lifecycle</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mx-auto mb-2">
              1
            </span>
            <h4 className="text-xs font-bold text-slate-800">Academic Intake</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Configure Academic Year, set Intake start &amp; application deadlines.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mx-auto mb-2">
              2
            </span>
            <h4 className="text-xs font-bold text-slate-800">Faculties &amp; Courses</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Verify Faculty &amp; Department structures and active course requirements.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mx-auto mb-2">
              3
            </span>
            <h4 className="text-xs font-bold text-slate-800">Document Checks</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Inspect applicant WASSCE slips, transcripts, and identify defects.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mx-auto mb-2">
              4
            </span>
            <h4 className="text-xs font-bold text-slate-800">Admissions Review</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Admissions Committee evaluates criteria and records decisions.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-center">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center mx-auto mb-2">
              5
            </span>
            <h4 className="text-xs font-bold text-emerald-950">Letter Issuance</h4>
            <p className="text-[11px] text-slate-600 mt-1">
              Generate official admission letters with verified token authenticity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
