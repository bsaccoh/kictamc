import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  Course,
  Faculty,
  Department,
  AcademicYear,
  QualificationLevel,
  DocumentType,
  CourseMetrics,
} from '../../types/academic';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ActionMenu } from '../../components/ui/ActionMenu';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  AlertCircle,
  GraduationCap,
  Clock,
  MapPin,
  Building2,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  X,
  FileCheck,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
} from 'lucide-react';

interface CoursesApiResponse {
  courses: Course[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  metrics: CourseMetrics;
}

export const CourseManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search, Filters & View Mode
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>(
    searchParams.get('facultyId') || 'ALL'
  );
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'qualificationLevel' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'academic' | 'admission' | 'financial' | 'documents'>('basic');

  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    facultyId: '',
    departmentId: '',
    academicYearId: '',
    qualificationLevel: 'DEGREE' as QualificationLevel,
    qualificationAward: 'Bachelor of Science (BSc Honours)',
    duration: 3,
    durationUnit: 'Years',
    description: '',
    detailedDescription: '',
    admissionRequirements: '',
    learningOutcomes: '',
    creditUnits: 120,
    intakeCapacity: 50,
    applicationFeeSLE: '250',
    tuitionFeeSLE: '4500',
    currency: 'SLE',
    studyModes: 'Full-Time,Evening',
    preferredCampuses: 'Kenema Main Campus',
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Document requirement item being drafted in form
  const [docReqs, setDocReqs] = useState<
    Array<{ documentType: DocumentType; name: string; description?: string; isMandatory: boolean }>
  >([]);
  const [newDocReq, setNewDocReq] = useState({
    documentType: 'EXAM_RESULT' as DocumentType,
    name: '',
    description: '',
    isMandatory: true,
  });

  // Delete State
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch Faculties
  const { data: facultiesData } = useQuery<{ faculties: Faculty[] }>({
    queryKey: ['faculties-active'],
    queryFn: () => api.get<{ faculties: Faculty[] }>('/faculties?status=ACTIVE'),
  });
  const faculties = facultiesData?.faculties || [];

  // Fetch Departments
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments', selectedFaculty],
    queryFn: () => {
      const q = selectedFaculty !== 'ALL' ? `?facultyId=${selectedFaculty}` : '';
      return api.get<Department[]>(`/departments${q}`);
    },
  });

  // Fetch Academic Years
  const { data: academicYears = [] } = useQuery<AcademicYear[]>({
    queryKey: ['academic-years-active'],
    queryFn: () => api.get<AcademicYear[]>('/academic-years?activeOnly=true'),
  });

  // Fetch Courses with metrics and filters
  const { data, isLoading, isError, error, refetch } = useQuery<CoursesApiResponse>({
    queryKey: [
      'courses-admin',
      search,
      selectedFaculty,
      selectedDept,
      selectedLevel,
      statusFilter,
      sortBy,
      sortOrder,
      page,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedFaculty !== 'ALL') params.append('facultyId', selectedFaculty);
      if (selectedDept !== 'ALL') params.append('departmentId', selectedDept);
      if (selectedLevel !== 'ALL') params.append('qualificationLevel', selectedLevel);
      if (statusFilter !== 'ALL') params.append('isActive', statusFilter === 'ACTIVE' ? 'true' : 'false');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', String(page));
      params.append('limit', String(limit));

      return api.get<CoursesApiResponse>(`/courses?${params.toString()}`);
    },
  });

  const courses = data?.courses || [];
  const metrics = data?.metrics || {
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0,
    facultiesOfferingCourses: 0,
  };
  const pagination = data?.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 };

  // Save Course Mutation (Create or Update)
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: courseForm.name.trim(),
        code: courseForm.code.trim().toUpperCase(),
        facultyId: courseForm.facultyId || undefined,
        departmentId: courseForm.departmentId || undefined,
        academicYearId: courseForm.academicYearId || undefined,
        qualificationLevel: courseForm.qualificationLevel,
        qualificationAward: courseForm.qualificationAward.trim() || undefined,
        duration: Number(courseForm.duration) || 3,
        durationUnit: courseForm.durationUnit,
        description: courseForm.description.trim() || undefined,
        detailedDescription: courseForm.detailedDescription.trim() || undefined,
        admissionRequirements: courseForm.admissionRequirements.trim() || undefined,
        learningOutcomes: courseForm.learningOutcomes.trim() || undefined,
        creditUnits: Number(courseForm.creditUnits) || 120,
        intakeCapacity: Number(courseForm.intakeCapacity) || 50,
        applicationFeeMinor: Math.round(parseFloat(courseForm.applicationFeeSLE || '0') * 100),
        tuitionFeeMinor: Math.round(parseFloat(courseForm.tuitionFeeSLE || '0') * 100),
        currency: courseForm.currency,
        studyModes: courseForm.studyModes,
        preferredCampuses: courseForm.preferredCampuses,
        isActive: courseForm.isActive,
        documentRequirements: docReqs,
      };

      if (editingCourse) {
        return api.patch(`/courses/${editingCourse.id}`, payload);
      } else {
        return api.post('/courses', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses-admin'] });
      setIsModalOpen(false);
      setEditingCourse(null);
    },
    onError: (err: any) => {
      setFormErrors({ form: err.message || 'Failed to save course.' });
    },
  });

  // Toggle Active Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return api.patch(`/courses/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses-admin'] });
    },
    onError: (err: any) => {
      alert(`Failed to update status: ${err.message}`);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses-admin'] });
      setCourseToDelete(null);
      setDeleteError(null);
    },
    onError: (err: any) => {
      setDeleteError(err.message || 'Cannot delete course.');
    },
  });

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setCourseForm({
      name: '',
      code: '',
      facultyId: faculties[0]?.id || '',
      departmentId: departments[0]?.id || '',
      academicYearId: academicYears[0]?.id || '',
      qualificationLevel: 'DEGREE',
      qualificationAward: 'Bachelor of Science (BSc Honours)',
      duration: 3,
      durationUnit: 'Years',
      description: '',
      detailedDescription: '',
      admissionRequirements: '',
      learningOutcomes: '',
      creditUnits: 120,
      intakeCapacity: 50,
      applicationFeeSLE: '250',
      tuitionFeeSLE: '4500',
      currency: 'SLE',
      studyModes: 'Full-Time,Evening',
      preferredCampuses: 'Kenema Main Campus',
      isActive: true,
    });
    setDocReqs([
      { documentType: 'EXAM_RESULT', name: 'WASSCE / GCE Result Slip or Certificate', isMandatory: true },
      { documentType: 'TESTIMONIAL', name: 'Secondary School Testimonial', isMandatory: true },
      { documentType: 'BIRTH_CERTIFICATE', name: 'Birth Certificate', isMandatory: true },
      { documentType: 'PASSPORT_PHOTO', name: 'Recent Passport-size Photograph', isMandatory: true },
    ]);
    setFormErrors({});
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      code: course.code,
      facultyId: course.facultyId || '',
      departmentId: course.departmentId || '',
      academicYearId: course.academicYearId || '',
      qualificationLevel: course.qualificationLevel,
      qualificationAward:
        course.qualificationAward ||
        (course.qualificationLevel === 'DEGREE'
          ? 'Bachelor of Science (BSc Honours)'
          : 'Diploma'),
      duration: course.duration || 3,
      durationUnit: course.durationUnit || 'Years',
      description: course.description || '',
      detailedDescription: course.detailedDescription || '',
      admissionRequirements: course.admissionRequirements || '',
      learningOutcomes: course.learningOutcomes || '',
      creditUnits: course.creditUnits || 120,
      intakeCapacity: course.intakeCapacity || 50,
      applicationFeeSLE: (course.applicationFeeMinor / 100).toFixed(2),
      tuitionFeeSLE: ((course.tuitionFeeMinor ?? 450000) / 100).toFixed(2),
      currency: course.currency || 'SLE',
      studyModes: course.studyModes || 'Full-Time,Evening',
      preferredCampuses: course.preferredCampuses || 'Kenema Main Campus',
      isActive: course.isActive,
    });
    setDocReqs(
      (course.documentRequirements || []).map((req) => ({
        documentType: req.documentType,
        name: req.name,
        description: req.description || undefined,
        isMandatory: req.isMandatory,
      }))
    );
    setFormErrors({});
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!courseForm.name.trim()) errors.name = 'Programme title is required.';
    if (!courseForm.code.trim()) errors.code = 'Programme code is required.';
    if (!courseForm.facultyId) errors.facultyId = 'Please select a parent faculty.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    saveMutation.mutate();
  };

  const handleAddDocReq = () => {
    if (!newDocReq.name.trim()) return;
    setDocReqs([
      ...docReqs,
      {
        documentType: newDocReq.documentType,
        name: newDocReq.name.trim(),
        description: newDocReq.description.trim() || undefined,
        isMandatory: newDocReq.isMandatory,
      },
    ]);
    setNewDocReq({
      documentType: 'EXAM_RESULT',
      name: '',
      description: '',
      isMandatory: true,
    });
  };

  const handleRemoveDocReq = (index: number) => {
    setDocReqs(docReqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* 1. Page Header with Breadcrumb */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
            <Link to="/admin" className="hover:text-navy-900 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span>Academic Management</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Courses</span>
          </nav>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
              Course Management
            </h1>
            <Badge variant="navy">{metrics.totalCourses} Programmes</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage academic programmes offered by the college.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Link to="/admin/fees">
            <Button
              variant="secondary"
              className="gap-2 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
            >
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span>Configure Fee Tariffs</span>
            </Button>
          </Link>

          <Button onClick={handleOpenCreate} className="gap-2 text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Add Course</span>
          </Button>
        </div>
      </div>

      {/* 2. Summary KPI Metric Cards (Loaded from backend) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Courses
            </span>
            <span className="text-2xl font-extrabold text-navy-950 font-mono mt-0.5 block">
              {metrics.totalCourses}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
              Active Courses
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5 block">
              {metrics.activeCourses}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Inactive Courses
            </span>
            <span className="text-2xl font-extrabold text-slate-700 font-mono mt-0.5 block">
              {metrics.inactiveCourses}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
              Offering Faculties
            </span>
            <span className="text-2xl font-extrabold text-blue-800 font-mono mt-0.5 block">
              {metrics.facultiesOfferingCourses}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Search by course title, code (e.g. BIT-301), or keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-navy-950 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-navy-950 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-md font-medium text-xs transition whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-navy-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Second Filter Row: Faculty, Department, Level */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Filter by Faculty
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-navy-800"
            >
              <option value="ALL">All College Faculties</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Filter by Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-navy-800"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Academic Qualification Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-navy-800"
            >
              <option value="ALL">All Qualification Levels</option>
              <option value="DEGREE">Degree Programmes</option>
              <option value="HIGHER_DIPLOMA">Higher Diploma (HND)</option>
              <option value="LOWER_DIPLOMA">Lower Diploma (Cert)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Course Table / Cards View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto min-h-[380px]">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Course Code</th>
                  <th className="py-3 px-4">Course Name</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Academic Level</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <div className="w-7 h-7 border-3 border-navy-800 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs font-medium">Loading courses...</p>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-rose-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold text-xs">Failed to load courses.</p>
                      <p className="text-[11px] text-slate-400 mt-1">{(error as any)?.message}</p>
                      <Button variant="secondary" onClick={() => refetch()} className="mt-3 text-xs">
                        Retry
                      </Button>
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-700 font-bold text-sm">No courses found matching filter.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try resetting keywords, faculty selection, or qualification level.
                      </p>
                    </td>
                  </tr>
                ) : (
                  courses.map((course, index) => {
                    const levelBadgeClass =
                      course.qualificationLevel === 'DEGREE'
                        ? 'bg-navy-50 text-navy-800 border-navy-200'
                        : course.qualificationLevel === 'HIGHER_DIPLOMA'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200';

                    return (
                      <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Course Code */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-navy-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                            {course.code}
                          </span>
                        </td>

                        {/* Course Name */}
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <Link
                            to={`/admin/courses/${course.id}`}
                            className="hover:text-navy-700 hover:underline block leading-tight"
                          >
                            {course.name}
                          </Link>
                          {course.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {course.description}
                            </p>
                          )}
                        </td>

                        {/* Faculty */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {course.faculty ? (
                            <Link
                              to={`/admin/faculties/${course.faculty.id}`}
                              className="font-medium text-navy-900 hover:underline flex items-center gap-1"
                            >
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{course.faculty.code}</span>
                            </Link>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {course.department?.code || '—'}
                        </td>

                        {/* Academic Level */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelBadgeClass}`}
                          >
                            {course.qualificationLevel.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Qualification Award */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                          {course.qualificationAward ||
                            (course.qualificationLevel === 'DEGREE'
                              ? 'BSc (Hons)'
                              : 'Diploma')}
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {course.duration || 3} {course.durationUnit || 'Yrs'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                              course.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                course.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {course.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex justify-end">
                            <ActionMenu
                              label={`Actions for ${course.code}`}
                              direction={index < 3 ? 'down' : 'auto'}
                              items={[
                                {
                                  label: 'View Course Profile',
                                  icon: <Eye className="w-3.5 h-3.5 text-navy-800" />,
                                  to: `/admin/courses/${course.id}`,
                                },
                                {
                                  label: 'Edit Course Details',
                                  icon: <Edit2 className="w-3.5 h-3.5 text-emerald-600" />,
                                  onClick: () => handleOpenEdit(course),
                                },
                                {
                                  label: 'Configure Fee Tariff',
                                  icon: <DollarSign className="w-3.5 h-3.5 text-amber-600" />,
                                  to: '/admin/fees',
                                },
                                {
                                  label: course.isActive ? 'Deactivate Course' : 'Activate Course',
                                  icon: course.isActive ? (
                                    <XCircle className="w-3.5 h-3.5 text-amber-600" />
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  ),
                                  onClick: () => {
                                    toggleStatusMutation.mutate({
                                      id: course.id,
                                      isActive: !course.isActive,
                                    });
                                  },
                                },
                                {
                                  label: 'Delete Course',
                                  icon: <Trash2 className="w-3.5 h-3.5 text-rose-600" />,
                                  variant: 'danger',
                                  onClick: () => {
                                    setDeleteError(null);
                                    setCourseToDelete(course);
                                  },
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing{' '}
                <strong className="text-slate-800 font-mono">
                  {(pagination.page - 1) * pagination.limit + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-800 font-mono">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </strong>{' '}
                of <strong className="text-slate-800 font-mono">{pagination.total}</strong> courses
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>

                <div className="px-2 font-mono font-bold text-slate-700">
                  {pagination.page} / {pagination.totalPages}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-2.5 text-xs"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const feeInSLE = (course.applicationFeeMinor / 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
            });
            const tuitionSLE = ((course.tuitionFeeMinor ?? 450000) / 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
            });

            const levelBadgeClass =
              course.qualificationLevel === 'DEGREE'
                ? 'bg-navy-50 text-navy-800 border-navy-200'
                : course.qualificationLevel === 'HIGHER_DIPLOMA'
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : 'bg-amber-50 text-amber-800 border-amber-200';

            return (
              <Card
                key={course.id}
                className="flex flex-col justify-between hover:shadow-md transition border-slate-200/90 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono tracking-wide">
                      {course.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelBadgeClass}`}>
                        {course.qualificationLevel.replace(/_/g, ' ')}
                      </span>
                      <Badge variant={course.isActive ? 'success' : 'neutral'}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-navy-950 mb-1 leading-snug group-hover:text-navy-700 transition">
                    <Link to={`/admin/courses/${course.id}`}>{course.name}</Link>
                  </h3>

                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{course.faculty?.name || course.department?.name || 'Department of ICT'}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {course.description || 'No detailed academic description specified.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs mb-3 border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">App Voucher</span>
                      <span className="font-bold text-navy-900 font-mono">SLE {feeInSLE}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Annual Tuition</span>
                      <span className="font-bold text-emerald-800 font-mono">SLE {tuitionSLE}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-mono font-bold">
                    {course._count?.applications || 0} Applicants
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Link to={`/admin/courses/${course.id}`}>
                      <Button size="sm" variant="secondary" className="h-7 text-xs px-2.5">
                        Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => handleOpenEdit(course)}
                      className="h-7 text-xs px-2.5"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. ADD / EDIT COURSE FORM MODAL (5-Sections) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5 text-navy-800" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-navy-950">
                    {editingCourse ? 'Edit Academic Course' : 'Create New Course / Programme'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingCourse
                      ? `Updating specifications for ${editingCourse.code}`
                      : 'Configure course curriculum, faculty linkage, entry requirements, and fee tariff.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Section Navigation Tabs */}
            <div className="flex border-b border-slate-200 mb-4 overflow-x-auto flex-shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setActiveFormTab('basic')}
                className={`px-3 py-2 border-b-2 font-bold whitespace-nowrap cursor-pointer transition ${
                  activeFormTab === 'basic'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Section A: Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('academic')}
                className={`px-3 py-2 border-b-2 font-bold whitespace-nowrap cursor-pointer transition ${
                  activeFormTab === 'academic'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Section B: Academic Specs
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('admission')}
                className={`px-3 py-2 border-b-2 font-bold whitespace-nowrap cursor-pointer transition ${
                  activeFormTab === 'admission'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Section C: Admission Config
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('financial')}
                className={`px-3 py-2 border-b-2 font-bold whitespace-nowrap cursor-pointer transition ${
                  activeFormTab === 'financial'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Section D: Fees & Finance
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('documents')}
                className={`px-3 py-2 border-b-2 font-bold whitespace-nowrap cursor-pointer transition ${
                  activeFormTab === 'documents'
                    ? 'border-navy-900 text-navy-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Section E: Prerequisites ({docReqs.length})
              </button>
            </div>

            {formErrors.form && (
              <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.form}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* SECTION A: BASIC INFORMATION */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Course Code <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        placeholder="e.g. BIT-301"
                        value={courseForm.code}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })
                        }
                        className="font-mono text-xs uppercase"
                      />
                      {formErrors.code && (
                        <span className="text-[10px] text-rose-600 block mt-0.5">
                          {formErrors.code}
                        </span>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        Course / Programme Title <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        placeholder="e.g. BSc in Information Technology & Systems"
                        value={courseForm.name}
                        onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                        className="text-xs"
                      />
                      {formErrors.name && (
                        <span className="text-[10px] text-rose-600 block mt-0.5">
                          {formErrors.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Parent Faculty <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={courseForm.facultyId}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, facultyId: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                      >
                        <option value="">-- Select Active Faculty --</option>
                        {faculties.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.code})
                          </option>
                        ))}
                      </select>
                      {formErrors.facultyId && (
                        <span className="text-[10px] text-rose-600 block mt-0.5">
                          {formErrors.facultyId}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Department (Optional)
                      </label>
                      <select
                        value={courseForm.departmentId}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, departmentId: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                      >
                        <option value="">-- Select Department --</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Short Programme Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief overview of programme curriculum and career focus..."
                      value={courseForm.description}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, description: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Detailed Academic Syllabus / Curriculum
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Comprehensive module breakdown and semester course specifications..."
                      value={courseForm.detailedDescription}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, detailedDescription: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Course Offering Status
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Active courses are available for selection in student applicant portal.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseForm.isActive}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, isActive: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION B: ACADEMIC INFORMATION */}
              {activeFormTab === 'academic' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Qualification Level <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={courseForm.qualificationLevel}
                        onChange={(e) => {
                          const lvl = e.target.value as QualificationLevel;
                          setCourseForm({
                            ...courseForm,
                            qualificationLevel: lvl,
                            qualificationAward:
                              lvl === 'DEGREE'
                                ? 'Bachelor of Science (BSc Honours)'
                                : lvl === 'HIGHER_DIPLOMA'
                                ? 'Higher National Diploma (HND)'
                                : 'National Certificate / Lower Diploma',
                            duration: lvl === 'DEGREE' ? 3 : lvl === 'HIGHER_DIPLOMA' ? 2 : 1,
                          });
                        }}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="DEGREE">Degree</option>
                        <option value="HIGHER_DIPLOMA">Higher Diploma</option>
                        <option value="LOWER_DIPLOMA">Lower Diploma</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        Award / Title on Completion
                      </label>
                      <Input
                        placeholder="e.g. Bachelor of Science (BSc Honours)"
                        value={courseForm.qualificationAward}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, qualificationAward: e.target.value })
                        }
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duration</label>
                      <Input
                        type="number"
                        min={1}
                        max={6}
                        value={courseForm.duration}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, duration: Number(e.target.value) })
                        }
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duration Unit</label>
                      <select
                        value={courseForm.durationUnit}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, durationUnit: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Years">Years</option>
                        <option value="Semesters">Semesters</option>
                        <option value="Months">Months</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Credit Units</label>
                      <Input
                        type="number"
                        value={courseForm.creditUnits}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, creditUnits: Number(e.target.value) })
                        }
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Seat Capacity</label>
                      <Input
                        type="number"
                        value={courseForm.intakeCapacity}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, intakeCapacity: Number(e.target.value) })
                        }
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Admission Entry Requirements
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Minimum 5 WASSCE credits including English Language and Mathematics..."
                      value={courseForm.admissionRequirements}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, admissionRequirements: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Programme Learning Outcomes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Key competencies and skills graduates will master..."
                      value={courseForm.learningOutcomes}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, learningOutcomes: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* SECTION C: ADMISSION CONFIGURATION */}
              {activeFormTab === 'admission' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Eligible Academic Year
                    </label>
                    <select
                      value={courseForm.academicYearId}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, academicYearId: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="">-- Select Academic Year --</option>
                      {academicYears.map((ay) => (
                        <option key={ay.id} value={ay.id}>
                          {ay.name} ({ay.isActive ? 'Active' : 'Archived'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Study Modes</label>
                      <Input
                        placeholder="e.g. Full-Time,Evening,Weekend"
                        value={courseForm.studyModes}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, studyModes: e.target.value })
                        }
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Campus Delivery Location
                      </label>
                      <Input
                        placeholder="e.g. Kenema Main Campus"
                        value={courseForm.preferredCampuses}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, preferredCampuses: e.target.value })
                        }
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION D: FEES & FINANCIAL INFORMATION */}
              {activeFormTab === 'financial' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950">
                    <strong className="block mb-0.5">Financial Tariff Notice:</strong>
                    <p className="text-[11px] leading-relaxed">
                      Application fees represent the cost of the admission application voucher.
                      Annual tuition fees represent the academic programme tariff automatically reflected
                      in admission acceptance letters.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Application Voucher Fee (SLE)
                      </label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        value={courseForm.applicationFeeSLE}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, applicationFeeSLE: e.target.value })
                        }
                        className="text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Annual Programme Tuition (SLE)
                      </label>
                      <Input
                        type="number"
                        step="10"
                        min="0"
                        value={courseForm.tuitionFeeSLE}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, tuitionFeeSLE: e.target.value })
                        }
                        className="text-xs font-mono font-bold text-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Currency</label>
                      <Input
                        value={courseForm.currency}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, currency: e.target.value.toUpperCase() })
                        }
                        className="text-xs font-mono font-bold uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION E: PREREQUISITE DOCUMENTS */}
              {activeFormTab === 'documents' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800 block">
                      Add Prerequisite Upload Document
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={newDocReq.documentType}
                        onChange={(e) =>
                          setNewDocReq({ ...newDocReq, documentType: e.target.value as any })
                        }
                        className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="EXAM_RESULT">Examination Result</option>
                        <option value="TESTIMONIAL">Testimonial</option>
                        <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                        <option value="ID_DOCUMENT">National ID Document</option>
                        <option value="PASSPORT_PHOTO">Passport Photograph</option>
                        <option value="OTHER">Other Academic Credential</option>
                      </select>

                      <Input
                        placeholder="Document label e.g. WASSCE Certificate"
                        value={newDocReq.name}
                        onChange={(e) => setNewDocReq({ ...newDocReq, name: e.target.value })}
                        className="text-xs sm:col-span-2"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={newDocReq.isMandatory}
                          onChange={(e) =>
                            setNewDocReq({ ...newDocReq, isMandatory: e.target.checked })
                          }
                          className="rounded text-navy-800"
                        />
                        <span>Mandatory for Submission</span>
                      </label>

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddDocReq}
                        className="h-7 text-xs px-3"
                      >
                        Add Prerequisite
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-700 block">
                      Required Applicant Documents ({docReqs.length}):
                    </span>
                    {docReqs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No specific document prerequisites defined.</p>
                    ) : (
                      docReqs.map((req, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-slate-800">{req.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({req.documentType})</span>
                            <Badge variant={req.isMandatory ? 'navy' : 'neutral'}>
                              {req.isMandatory ? 'Mandatory' : 'Optional'}
                            </Badge>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocReq(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Form Footer Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-shrink-0">
                <div className="text-[11px] text-slate-400">
                  Step:{' '}
                  <span className="font-bold text-slate-700 uppercase">{activeFormTab}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                    disabled={saveMutation.isPending}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="text-xs font-bold gap-1.5"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Programme...</span>
                      </>
                    ) : (
                      <span>{editingCourse ? 'Save Changes' : 'Create Course'}</span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. SAFE DELETE CONFIRMATION DIALOG */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-navy-950 mb-1">
              Delete Course: {courseToDelete.code}?
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              You are attempting to delete{' '}
              <strong className="text-slate-800">{courseToDelete.name}</strong>.
            </p>

            {/* Check referential integrity */}
            {(courseToDelete._count?.applications ?? 0) > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Referential Protection Active
                </div>
                <p>
                  This course currently has{' '}
                  <strong>{courseToDelete._count?.applications} student application(s)</strong> attached.
                </p>
                <p className="text-[11px] text-amber-800">
                  Permanent deletion is prohibited to protect historical applicant records and payment logs.
                  We recommend deactivating this course instead.
                </p>
              </div>
            ) : null}

            {deleteError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setCourseToDelete(null);
                  setDeleteError(null);
                }}
                className="text-xs"
              >
                Cancel
              </Button>

              {(courseToDelete._count?.applications ?? 0) > 0 ? (
                <Button
                  onClick={() => {
                    toggleStatusMutation.mutate({
                      id: courseToDelete.id,
                      isActive: false,
                    });
                    setCourseToDelete(null);
                  }}
                  className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Deactivate Instead
                </Button>
              ) : (
                <Button
                  onClick={() => deleteMutation.mutate(courseToDelete.id)}
                  disabled={deleteMutation.isPending}
                  className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
