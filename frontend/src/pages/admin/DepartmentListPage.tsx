import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  Plus,
  Building2,
  BookOpen,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  AlertTriangle,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  LayoutGrid,
  List,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { api } from '../../services/api';
import { Department, DepartmentMetrics, Faculty } from '../../types/academic';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

interface DepartmentResponse {
  departments: Department[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  metrics: DepartmentMetrics;
}

export const DepartmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    code: '',
    description: '',
    hodName: '',
    hodTitle: 'Head of Department',
    email: '',
    phone: '',
    officeLocation: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Safe Delete State
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);

  // Active Action Menu dropdown state
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // 1. Fetch faculties for dropdown selector
  const { data: facultiesRaw = [] } = useQuery({
    queryKey: ['faculties-dropdown'],
    queryFn: () => api.get<any>('/faculties?limit=100'),
  });
  const faculties: Faculty[] = Array.isArray(facultiesRaw)
    ? facultiesRaw
    : facultiesRaw?.faculties || [];

  // 2. Fetch departments paginated with metrics
  const { data, isLoading, isError, refetch } = useQuery<DepartmentResponse>({
    queryKey: ['departments', { search, selectedFaculty, statusFilter, sortBy, sortOrder, page, limit }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedFaculty !== 'ALL') params.append('facultyId', selectedFaculty);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      params.append('page', String(page));
      params.append('limit', String(limit));
      return api.get<DepartmentResponse>(`/departments?${params.toString()}`);
    },
  });

  const departments = data?.departments || [];
  const metrics: DepartmentMetrics = data?.metrics || {
    totalDepartments: 0,
    activeDepartments: 0,
    inactiveDepartments: 0,
    totalCourses: 0,
    facultiesRepresented: 0,
  };
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Save Department Mutation (Create or Update)
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingDept) {
        return api.patch(`/departments/${editingDept.id}`, payload);
      } else {
        return api.post('/departments', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      setIsModalOpen(false);
      setEditingDept(null);
      resetForm();
    },
    onError: (err: any) => {
      setFormErrors({ form: err.message || 'Failed to save department' });
    },
  });

  // Toggle Active Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return api.patch(`/departments/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  // Delete Department Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setDeleteDept(null);
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete department');
    },
  });

  const resetForm = () => {
    setFormData({
      facultyId: faculties[0]?.id || '',
      name: '',
      code: '',
      description: '',
      hodName: '',
      hodTitle: 'Head of Department',
      email: '',
      phone: '',
      officeLocation: '',
      isActive: true,
    });
    setFormErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    if (selectedFaculty !== 'ALL') {
      setFormData((prev) => ({ ...prev, facultyId: selectedFaculty }));
    } else if (faculties.length > 0) {
      setFormData((prev) => ({ ...prev, facultyId: faculties[0].id }));
    }
    setEditingDept(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      facultyId: dept.facultyId || (dept.faculty?.id ?? ''),
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      hodName: dept.hodName || '',
      hodTitle: dept.hodTitle || 'Head of Department',
      email: dept.email || '',
      phone: dept.phone || '',
      officeLocation: dept.officeLocation || '',
      isActive: dept.isActive,
    });
    setFormErrors({});
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Department name is required.';
    if (!formData.code.trim()) errors.code = 'Department code is required.';
    if (!formData.facultyId) errors.facultyId = 'Please select a parent faculty.';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    saveMutation.mutate({
      facultyId: formData.facultyId || undefined,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || undefined,
      hodName: formData.hodName.trim() || undefined,
      hodTitle: formData.hodTitle.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      officeLocation: formData.officeLocation.trim() || undefined,
      isActive: formData.isActive,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl pb-12">
      {/* 1. Header with Breadcrumbs & Action Button */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
            <Link to="/admin" className="hover:text-navy-900 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span>Academic Management</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Departments</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
              Department Management
            </h1>
            <Badge variant="navy">{metrics.totalDepartments} Registered</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage collegiate departments, assign Heads of Department (HODs), and oversee course distributions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="gap-2 text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Departments
            </span>
            <div className="p-2 rounded-lg bg-navy-50 text-navy-700">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-navy-950">
            {metrics.totalDepartments}
          </div>
          <span className="text-[11px] text-slate-500">Across {metrics.facultiesRepresented} Faculties</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Departments
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-emerald-700">
            {metrics.activeDepartments}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Open for Course Offerings</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Inactive Departments
            </span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-slate-600">
            {metrics.inactiveDepartments}
          </div>
          <span className="text-[11px] text-slate-400">Archived / Suspended</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Associated Courses
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-blue-700">
            {metrics.totalCourses}
          </div>
          <span className="text-[11px] text-slate-500">Degrees & Diplomas</span>
        </Card>
      </div>

      {/* 3. Filters Bar & View Switcher */}
      <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by department name, code, or HOD name..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 focus:border-navy-800 transition-all text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Faculty Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedFaculty}
                onChange={(e) => {
                  setSelectedFaculty(e.target.value);
                  setPage(1);
                }}
                className="py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 text-slate-700 font-medium"
              >
                <option value="ALL">All College Faculties</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Segmented Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80">
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-navy-950 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setStatusFilter('ACTIVE');
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-white text-emerald-800 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => {
                  setStatusFilter('INACTIVE');
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  statusFilter === 'INACTIVE'
                    ? 'bg-white text-slate-800 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inactive
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as 'asc' | 'desc');
              }}
              className="py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 text-slate-700"
            >
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="code-asc">Sort: Code (A-Z)</option>
              <option value="coursesCount-desc">Sort: Most Courses</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80">
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'table' ? 'bg-white text-navy-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Cards Grid View"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-white text-navy-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Main Content: Table or Grid */}
      {isLoading ? (
        <Card className="p-12 text-center border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-navy-900 border-t-transparent mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading collegiate departments...</p>
        </Card>
      ) : departments.length === 0 ? (
        <Card className="p-12 text-center border-slate-200">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-navy-950">No departments found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {search || selectedFaculty !== 'ALL' || statusFilter !== 'ALL'
              ? 'No departments match your filter criteria. Try clearing filters.'
              : 'Start by creating your first collegiate department.'}
          </p>
          <Button onClick={handleOpenCreate} className="gap-2 text-xs">
            <Plus className="h-4 w-4" />
            <span>Create Department</span>
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card className="overflow-hidden border-slate-200/90 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/90 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Parent Faculty</th>
                  <th className="py-3 px-4">Head of Dept (HOD)</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Courses</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => {
                  const coursesCount = dept._count?.courses ?? dept.courses?.length ?? 0;
                  return (
                    <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                          {dept.code}
                        </span>
                      </td>

                      {/* Name & Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          to={`/admin/departments/${dept.id}`}
                          className="font-semibold text-navy-950 hover:text-navy-700 hover:underline block truncate"
                          title={dept.name}
                        >
                          {dept.name}
                        </Link>
                        {dept.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5" title={dept.description}>
                            {dept.description}
                          </p>
                        )}
                      </td>

                      {/* Parent Faculty */}
                      <td className="py-3.5 px-4">
                        {dept.faculty ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <Link
                              to={`/admin/faculties/${dept.faculty.id}`}
                              className="text-slate-700 hover:text-navy-900 font-medium text-[11px] truncate block max-w-[140px]"
                              title={dept.faculty.name}
                            >
                              {dept.faculty.code} — {dept.faculty.name}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* HOD Info */}
                      <td className="py-3.5 px-4">
                        {dept.hodName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              {dept.hodName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="truncate">
                              <span className="font-semibold text-slate-800 block text-[11px] truncate">
                                {dept.hodName}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {dept.hodTitle || 'Head of Department'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No HOD assigned</span>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-600 space-y-0.5">
                        {dept.email && (
                          <div className="flex items-center gap-1.5 truncate max-w-[160px]" title={dept.email}>
                            <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{dept.email}</span>
                          </div>
                        )}
                        {dept.phone && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span>{dept.phone}</span>
                          </div>
                        )}
                        {!dept.email && !dept.phone && (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Courses Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {coursesCount}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleStatusMutation.mutate({ id: dept.id, isActive: !dept.isActive })}
                          title={`Click to ${dept.isActive ? 'deactivate' : 'activate'}`}
                          className="inline-flex items-center gap-1.5 cursor-pointer group/btn"
                        >
                          <Badge variant={dept.isActive ? 'success' : 'neutral'} className="text-[10px] transition-transform group-hover/btn:scale-105">
                            <span className={`w-1.5 h-1.5 rounded-full ${dept.isActive ? 'bg-emerald-500' : 'bg-slate-400'} mr-1`} />
                            {dept.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </td>

                      {/* Actions Dropdown */}
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={() => setOpenActionId(openActionId === dept.id ? null : dept.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openActionId === dept.id && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setOpenActionId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 z-30 py-1 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                                <div className="py-0.5">
                                  <Link
                                    to={`/admin/departments/${dept.id}`}
                                    className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition-colors"
                                    onClick={() => setOpenActionId(null)}
                                  >
                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                    <span>View Details</span>
                                  </Link>
                                  <button
                                    onClick={() => handleOpenEdit(dept)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Edit Department</span>
                                  </button>
                                </div>
                                <div className="py-0.5">
                                  <button
                                    onClick={() => {
                                      toggleStatusMutation.mutate({ id: dept.id, isActive: !dept.isActive });
                                      setOpenActionId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                  >
                                    {dept.isActive ? (
                                      <>
                                        <XCircle className="h-3.5 w-3.5 text-amber-500" />
                                        <span>Deactivate</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Activate</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteDept(dept);
                                      setOpenActionId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const coursesCount = dept._count?.courses ?? dept.courses?.length ?? 0;
            return (
              <Card key={dept.id} className="p-5 border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-xs text-navy-950">
                      {dept.code}
                    </span>
                    <Badge variant={dept.isActive ? 'success' : 'neutral'} className="text-[10px]">
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-serif font-bold text-sm text-navy-950 line-clamp-1">
                    {dept.name}
                  </h3>
                  {dept.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {dept.description}
                    </p>
                  )}

                  {/* Faculty Badge */}
                  {dept.faculty && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-navy-800 bg-navy-50/80 px-2.5 py-1 rounded-md border border-navy-100">
                      <Building2 className="h-3 w-3 text-navy-600 flex-shrink-0" />
                      <span className="font-medium truncate">{dept.faculty.name}</span>
                    </div>
                  )}

                  {/* HOD Card Snippet */}
                  <div className="mt-3.5 p-3 rounded-lg bg-slate-50/80 border border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-[10px]">
                        {dept.hodName
                          ? dept.hodName.split(' ').map((n) => n[0]).join('').slice(0, 2)
                          : 'HOD'}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-semibold text-slate-900 block truncate">
                          {dept.hodName || 'No HOD assigned'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {dept.hodTitle || 'Head of Department'}
                        </span>
                      </div>
                    </div>

                    {(dept.email || dept.phone) && (
                      <div className="text-[10px] text-slate-500 space-y-1 pt-1 border-t border-slate-200/50">
                        {dept.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="truncate">{dept.email}</span>
                          </div>
                        )}
                        {dept.officeLocation && (
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span className="truncate">{dept.officeLocation}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Courses count & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                    <span>{coursesCount} Course{coursesCount === 1 ? '' : 's'}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenEdit(dept)}
                      className="text-xs px-2.5 py-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      <span>Edit</span>
                    </Button>
                    <Link to={`/admin/departments/${dept.id}`}>
                      <Button size="sm" className="text-xs px-2.5 py-1">
                        <span>Details</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} departments
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <span className="px-2 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 6. CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-navy-100 text-navy-800 rounded-lg">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-navy-950">
                    {editingDept ? 'Edit Collegiate Department' : 'Create New Department'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure department specifications, parent faculty, and HOD assignment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {formErrors.form && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{formErrors.form}</span>
                </div>
              )}

              {/* SECTION 1: Basic Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-gold-600" />
                  <span>1. Department Specifications</span>
                </h4>

                {/* Parent Faculty Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent Faculty <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 text-slate-800 font-medium"
                  >
                    <option value="">Select Parent Faculty...</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                  {formErrors.facultyId && (
                    <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.facultyId}</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Department of Computer Science & Software Engineering"
                      className="text-xs"
                    />
                    {formErrors.name && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.name}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Code <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. CSSE"
                      maxLength={10}
                      className="text-xs font-mono font-bold uppercase"
                    />
                    {formErrors.code && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.code}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Scope / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief overview of programmes, focus areas, and laboratories..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-navy-800/20 text-slate-800"
                  />
                </div>
              </div>

              {/* SECTION 2: Head of Department (HOD) Assignment */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-gold-600" />
                  <span>2. Head of Department (HOD) Assignment</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      HOD Full Name
                    </label>
                    <Input
                      value={formData.hodName}
                      onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                      placeholder="e.g. Dr. Joseph M. Koroma"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic / Official Title
                    </label>
                    <Input
                      value={formData.hodTitle}
                      onChange={(e) => setFormData({ ...formData, hodTitle: e.target.value })}
                      placeholder="e.g. Senior Lecturer & HOD"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Department Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="csse@kictamc.edu.sl"
                      className="text-xs"
                    />
                    {formErrors.email && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.email}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+232 76 200011"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Office / Campus Location
                  </label>
                  <Input
                    value={formData.officeLocation}
                    onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                    placeholder="e.g. ICT Block A, Room 102, Main Campus"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* SECTION 3: Active Status Switch */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded text-navy-800 focus:ring-navy-700 border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Active Department Status
                    </span>
                    <span className="text-[11px] text-slate-500">
                      When active, this department can offer courses and admit new applicants.
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saveMutation.isPending}
                  className="gap-1.5"
                >
                  {saveMutation.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingDept ? 'Update Department' : 'Create Department'}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. SAFE DELETE / REFERENTIAL INTEGRITY DIALOG */}
      {deleteDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4">
            {/* If department has attached courses -> PROTECT */}
            {(deleteDept._count?.courses ?? deleteDept.courses?.length ?? 0) > 0 ? (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <h3 className="font-serif font-bold text-base text-navy-950">
                    Referential Protection Active
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5">
                    Cannot delete <strong>{deleteDept.name}</strong>. It currently has{' '}
                    <span className="font-bold text-navy-900">
                      {deleteDept._count?.courses ?? deleteDept.courses?.length} associated course(s)
                    </span>.
                  </p>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-left text-[11px] text-amber-800 mt-3 space-y-1">
                    <span className="font-semibold block flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                      Academic Data Safety Policy:
                    </span>
                    <span>
                      To maintain historical admissions records and curriculum integrity, departments with active or past courses cannot be permanently removed.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="secondary"
                    className="flex-1 text-xs"
                    onClick={() => setDeleteDept(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => {
                      toggleStatusMutation.mutate({ id: deleteDept.id, isActive: false });
                      setDeleteDept(null);
                    }}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Deactivate Instead</span>
                  </Button>
                </div>
              </>
            ) : (
              /* If department has NO courses -> SAFE TO DELETE */
              <>
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <h3 className="font-serif font-bold text-base text-navy-950">
                    Confirm Department Removal
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5">
                    Are you sure you want to delete <strong>{deleteDept.name}</strong> ({deleteDept.code})?
                    This action is permanent and cannot be reversed.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="secondary"
                    className="flex-1 text-xs"
                    onClick={() => setDeleteDept(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1 text-xs gap-1.5"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(deleteDept.id)}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Department'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
