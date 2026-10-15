import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  AlertCircle,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { Faculty, FacultyMetrics } from '../../types/academic';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ActionMenu } from '../../components/ui/ActionMenu';

interface FacultiesApiResponse {
  faculties: Faculty[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  metrics: FacultyMetrics;
}

export const FacultyListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    deanName: '',
    email: '',
    phone: '',
    officeLocation: '',
    description: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete State
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch faculties with metrics and pagination
  const { data, isLoading, isError, error, refetch } = useQuery<FacultiesApiResponse>({
    queryKey: ['faculties', search, statusFilter, sortBy, sortOrder, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', String(page));
      params.append('limit', String(limit));

      return api.get<FacultiesApiResponse>(`/faculties?${params.toString()}`);
    },
  });

  const faculties = data?.faculties || [];
  const metrics = data?.metrics || {
    totalFaculties: 0,
    activeFaculties: 0,
    inactiveFaculties: 0,
    totalCourses: 0,
  };
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Save Faculty Mutation (Create or Update)
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingFaculty) {
        return api.patch(`/faculties/${editingFaculty.id}`, payload);
      } else {
        return api.post('/faculties', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      setIsModalOpen(false);
      setEditingFaculty(null);
      resetForm();
    },
    onError: (err: any) => {
      setFormErrors({ form: err.message || 'Failed to save faculty' });
    },
  });

  // Toggle Active Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return api.patch(`/faculties/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
    },
    onError: (err: any) => {
      alert(`Failed to update status: ${err.message}`);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/faculties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      setFacultyToDelete(null);
      setDeleteError(null);
    },
    onError: (err: any) => {
      setDeleteError(err.message || 'Cannot delete faculty.');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      deanName: '',
      email: '',
      phone: '',
      officeLocation: '',
      description: '',
      isActive: true,
    });
    setFormErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingFaculty(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      code: faculty.code,
      deanName: faculty.deanName || '',
      email: faculty.email || '',
      phone: faculty.phone || '',
      officeLocation: faculty.officeLocation || '',
      description: faculty.description || '',
      isActive: faculty.isActive,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Faculty name is required.';
    if (!formData.code.trim()) errors.code = 'Faculty code is required.';
    else if (formData.code.trim().length < 2) errors.code = 'Code must be at least 2 characters.';
    else if (formData.code.trim().length > 15) errors.code = 'Code must not exceed 15 characters.';

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
      ...formData,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      deanName: formData.deanName.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      officeLocation: formData.officeLocation.trim() || undefined,
      description: formData.description.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl pb-12">
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
            <span className="text-slate-700 font-semibold">Faculties</span>
          </nav>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
              Faculty Management
            </h1>
            <Badge variant="navy">{metrics.totalFaculties} Registered</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage college faculties and their academic offerings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="gap-2 text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Add Faculty</span>
          </Button>
        </div>
      </div>

      {/* 2. Summary KPI Metric Cards (Loaded from backend) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Faculties
            </span>
            <span className="text-2xl font-extrabold text-navy-950 font-mono mt-0.5 block">
              {metrics.totalFaculties}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
              Active Faculties
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5 block">
              {metrics.activeFaculties}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Inactive Faculties
            </span>
            <span className="text-2xl font-extrabold text-slate-700 font-mono mt-0.5 block">
              {metrics.inactiveFaculties}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
              Associated Courses
            </span>
            <span className="text-2xl font-extrabold text-blue-800 font-mono mt-0.5 block">
              {metrics.totalCourses}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search by faculty name, code (e.g. FICT), or dean..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto">
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
                className={`px-3 py-1.5 rounded-md font-medium text-xs transition whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-navy-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Faculties' : st === 'ACTIVE' ? 'Active Only' : 'Inactive'}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:ring-1 focus:ring-navy-800"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="code-asc">Code (A-Z)</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Faculty Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Faculty Code</th>
                <th className="py-3 px-4">Faculty Name</th>
                <th className="py-3 px-4 text-center">Departments</th>
                <th className="py-3 px-4 text-center">Courses</th>
                <th className="py-3 px-4">Dean / Head</th>
                <th className="py-3 px-4">Contact Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-3 border-navy-800 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-medium">Loading faculties...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-rose-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-xs">Failed to load faculties.</p>
                    <p className="text-[11px] text-slate-400 mt-1">{(error as any)?.message}</p>
                    <Button variant="secondary" onClick={() => refetch()} className="mt-3 text-xs">
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : faculties.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-700 font-bold text-sm">No faculties found.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search || statusFilter !== 'ALL'
                        ? 'Try clearing your search keyword or filters.'
                        : 'Get started by creating the first college faculty.'}
                    </p>
                    {!search && statusFilter === 'ALL' && (
                      <Button onClick={handleOpenCreate} className="mt-4 text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Faculty
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                faculties.map((f, index) => {
                  const deptCount = f._count?.departments ?? f.departments?.length ?? 0;
                  const courseCount = f._count?.courses ?? f.courses?.length ?? 0;

                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Faculty Code */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-navy-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                          {f.code}
                        </span>
                      </td>

                      {/* Faculty Name */}
                      <td className="py-3 px-4">
                        <Link
                          to={`/admin/faculties/${f.id}`}
                          className="font-bold text-navy-950 hover:text-navy-700 block transition-colors leading-tight"
                        >
                          {f.name}
                        </Link>
                        {f.description && (
                          <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {f.description}
                          </p>
                        )}
                      </td>

                      {/* Department Count */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full font-mono text-xs font-bold bg-slate-100 text-slate-700">
                          {deptCount}
                        </span>
                      </td>

                      {/* Course Count */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {courseCount}
                        </span>
                      </td>

                      {/* Dean / Head */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{f.deanName || '—'}</span>
                        </div>
                      </td>

                      {/* Contact Email */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {f.email ? (
                          <a
                            href={`mailto:${f.email}`}
                            className="hover:text-navy-900 hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{f.email}</span>
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                            f.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              f.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {f.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-400">
                        {f.createdAt
                          ? new Date(f.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end">
                          <ActionMenu
                            label={`Actions for ${f.code}`}
                            direction={index < 3 ? 'down' : 'auto'}
                            items={[
                              {
                                label: 'View Faculty Profile',
                                icon: <Eye className="w-3.5 h-3.5 text-navy-800" />,
                                to: `/admin/faculties/${f.id}`,
                              },
                              {
                                label: 'Edit Faculty Information',
                                icon: <Edit2 className="w-3.5 h-3.5 text-emerald-600" />,
                                onClick: () => handleOpenEdit(f),
                              },
                              {
                                label: f.isActive ? 'Deactivate Faculty' : 'Activate Faculty',
                                icon: f.isActive ? (
                                  <XCircle className="w-3.5 h-3.5 text-amber-600" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                ),
                                onClick: () => {
                                  toggleStatusMutation.mutate({
                                    id: f.id,
                                    isActive: !f.isActive,
                                  });
                                },
                              },
                              {
                                label: 'Delete Faculty',
                                icon: <Trash2 className="w-3.5 h-3.5 text-rose-600" />,
                                variant: 'danger',
                                onClick: () => {
                                  setDeleteError(null);
                                  setFacultyToDelete(f);
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

        {/* 5. Server-Side Pagination Bar */}
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
              of <strong className="text-slate-800 font-mono">{pagination.total}</strong> faculties
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

      {/* 6. ADD / EDIT FACULTY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-navy-800" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-navy-950">
                    {editingFaculty ? 'Edit Faculty Details' : 'Register New Faculty'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingFaculty
                      ? `Updating records for ${editingFaculty.code}`
                      : 'Create a new collegiate faculty and configure administration.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.form && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formErrors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Code and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faculty Code <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. FICT"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className={`font-mono text-xs uppercase ${
                      formErrors.code ? 'border-rose-500 focus:ring-rose-500' : ''
                    }`}
                  />
                  {formErrors.code && (
                    <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                      {formErrors.code}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faculty Official Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Faculty of Information & Communication Technology"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`text-xs ${
                      formErrors.name ? 'border-rose-500 focus:ring-rose-500' : ''
                    }`}
                  />
                  {formErrors.name && (
                    <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                      {formErrors.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Dean / Head Name & Office Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dean / Head of Faculty
                  </label>
                  <Input
                    placeholder="e.g. Dr. Patrick Conteh"
                    value={formData.deanName}
                    onChange={(e) => setFormData({ ...formData, deanName: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Office Location
                  </label>
                  <Input
                    placeholder="e.g. ICT Complex, 2nd Floor, Main Campus"
                    value={formData.officeLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, officeLocation: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Row 3: Official Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Contact Email
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. fict@kictamc.edu.sl"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`text-xs ${
                      formErrors.email ? 'border-rose-500 focus:ring-rose-500' : ''
                    }`}
                  />
                  {formErrors.email && (
                    <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                      {formErrors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Telephone
                  </label>
                  <Input
                    placeholder="e.g. +232 76 100010"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Description & Mission
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize the faculty's mandate, academic fields, and key research areas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-navy-600 focus:border-navy-600 text-slate-800"
                />
              </div>

              {/* Row 5: Status Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Faculty Status</span>
                  <span className="text-[11px] text-slate-500 block">
                    Active faculties are visible to applicants and eligible for course offerings.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
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
                      <span>Saving Faculty...</span>
                    </>
                  ) : (
                    <span>{editingFaculty ? 'Update Faculty' : 'Save Faculty'}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. SAFE DELETE CONFIRMATION DIALOG */}
      {facultyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-navy-950 mb-1">
              Delete Faculty: {facultyToDelete.code}?
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              You are attempting to delete{' '}
              <strong className="text-slate-800">{facultyToDelete.name}</strong>.
            </p>

            {/* Check dependencies */}
            {(facultyToDelete._count?.courses ?? 0) > 0 ||
            (facultyToDelete._count?.departments ?? 0) > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Referential Protection Active
                </div>
                <p>
                  This faculty currently has{' '}
                  <strong>{facultyToDelete._count?.courses ?? 0} associated course(s)</strong> and{' '}
                  <strong>{facultyToDelete._count?.departments ?? 0} department(s)</strong>.
                </p>
                <p className="text-[11px] text-amber-800">
                  Permanent deletion is prohibited to safeguard academic curriculum and student application history.
                  We recommend deactivating this faculty instead.
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
                  setFacultyToDelete(null);
                  setDeleteError(null);
                }}
                className="text-xs"
              >
                Cancel
              </Button>

              {(facultyToDelete._count?.courses ?? 0) > 0 ||
              (facultyToDelete._count?.departments ?? 0) > 0 ? (
                <Button
                  onClick={() => {
                    toggleStatusMutation.mutate({
                      id: facultyToDelete.id,
                      isActive: false,
                    });
                    setFacultyToDelete(null);
                  }}
                  className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Deactivate Instead
                </Button>
              ) : (
                <Button
                  onClick={() => deleteMutation.mutate(facultyToDelete.id)}
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
