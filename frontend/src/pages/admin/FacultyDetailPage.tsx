import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  BookOpen,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  Edit2,
  CheckCircle,
  XCircle,
  Plus,
  Layers,
  GraduationCap,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { Faculty, Course } from '../../types/academic';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const FacultyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const { data: faculty, isLoading, isError, error } = useQuery<Faculty>({
    queryKey: ['faculty', id],
    queryFn: () => api.get<Faculty>(`/faculties/${id}`),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: typeof formData) => api.patch(`/faculties/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', id] });
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      setFormErrors({ form: err.message || 'Failed to update faculty' });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (isActive: boolean) => api.patch(`/faculties/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', id] });
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
    },
    onError: (err: any) => alert(`Error: ${err.message}`),
  });

  const handleOpenEdit = () => {
    if (!faculty) return;
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
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Faculty name is required' });
      return;
    }
    if (!formData.code.trim()) {
      setFormErrors({ code: 'Faculty code is required' });
      return;
    }

    updateMutation.mutate({
      ...formData,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading faculty details...</p>
      </div>
    );
  }

  if (isError || !faculty) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Faculty Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested collegiate faculty profile could not be loaded.
        </p>
        <Link to="/admin/faculties">
          <Button variant="secondary" className="text-xs gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Faculties
          </Button>
        </Link>
      </div>
    );
  }

  const courses = faculty.courses || [];
  const departments = faculty.departments || [];
  const totalApps = courses.reduce((acc, c) => acc + (c._count?.applications || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* 1. Header with Breadcrumb & Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
            <Link to="/admin" className="hover:text-navy-900 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/admin/faculties" className="hover:text-navy-900 transition-colors">
              Faculties
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{faculty.code}</span>
          </nav>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-navy-900 text-gold-400 font-mono font-bold text-xs rounded-lg">
              {faculty.code}
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
              {faculty.name}
            </h1>
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                faculty.isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  faculty.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {faculty.isActive ? 'Active Faculty' : 'Inactive'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {faculty.description || 'Collegiate academic faculty at Kenema ICT & Management College.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Link to="/admin/faculties">
            <Button variant="secondary" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>

          <Button onClick={handleOpenEdit} className="gap-1.5 text-xs">
            <Edit2 className="w-3.5 h-3.5" /> Edit Faculty
          </Button>

          <Link to={`/admin/courses?facultyId=${faculty.id}`}>
            <Button variant="secondary" className="gap-1.5 text-xs text-navy-800">
              <Plus className="w-3.5 h-3.5" /> Add Course
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Academic Courses
          </span>
          <span className="text-2xl font-extrabold text-navy-950 font-mono mt-0.5 block">
            {courses.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Degree & Diploma offerings</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Departments
          </span>
          <span className="text-2xl font-extrabold text-blue-800 font-mono mt-0.5 block">
            {departments.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Collegiate sub-divisions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
            Active Admissions
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5 block">
            {courses.filter((c) => c.isActive).length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Courses open for intake</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
            Student Applications
          </span>
          <span className="text-2xl font-extrabold text-amber-800 font-mono mt-0.5 block">
            {totalApps}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Total historical applicants</span>
        </div>
      </div>

      {/* 3. Faculty Administrative Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-navy-800" />
          <span>Faculty Administration & Leadership</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Dean / Academic Head
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <User className="w-3.5 h-3.5 text-navy-800" />
              <span>{faculty.deanName || 'Unassigned / Acting Dean'}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Official Email
            </span>
            <div className="flex items-center gap-1.5 font-mono text-slate-800 truncate">
              <Mail className="w-3.5 h-3.5 text-navy-800" />
              {faculty.email ? (
                <a href={`mailto:${faculty.email}`} className="hover:underline">
                  {faculty.email}
                </a>
              ) : (
                '—'
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Contact Telephone
            </span>
            <div className="flex items-center gap-1.5 font-mono text-slate-800">
              <Phone className="w-3.5 h-3.5 text-navy-800" />
              <span>{faculty.phone || '—'}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              Campus Office Location
            </span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-navy-800" />
              <span>{faculty.officeLocation || 'Main Campus, Kenema'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Associated Courses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-navy-800" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Programmes & Courses Offered ({courses.length})
            </h2>
          </div>

          <Link to={`/admin/courses?facultyId=${faculty.id}`}>
            <Button size="sm" className="h-8 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Course
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Programme Title</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Award / Qualification</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Applications</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-xs text-slate-700">
                      No courses currently assigned to this faculty.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Use the "Add Course" button to create or assign courses under {faculty.code}.
                    </p>
                  </td>
                </tr>
              ) : (
                courses.map((c) => {
                  const levelBadgeClass =
                    c.qualificationLevel === 'DEGREE'
                      ? 'bg-navy-50 text-navy-800 border-navy-200'
                      : c.qualificationLevel === 'HIGHER_DIPLOMA'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-navy-950 whitespace-nowrap">
                        {c.code}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <Link
                          to={`/admin/courses/${c.id}`}
                          className="hover:text-navy-700 hover:underline block"
                        >
                          {c.name}
                        </Link>
                        {c.department && (
                          <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                            {c.department.name}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelBadgeClass}`}
                        >
                          {c.qualificationLevel.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {c.qualificationAward ||
                          (c.qualificationLevel === 'DEGREE'
                            ? 'Bachelor of Science'
                            : 'Diploma')}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {c.duration || (c.qualificationLevel === 'DEGREE' ? 3 : 2)}{' '}
                        {c.durationUnit || 'Years'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {c._count?.applications || 0}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/courses/${c.id}`}
                          className="inline-flex items-center gap-1 font-bold text-navy-800 hover:text-navy-950 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md text-[11px] transition"
                        >
                          <span>Course Profile</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Associated Departments Card (If supported) */}
      {departments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-navy-800" />
            <span>Associated Collegiate Departments ({departments.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {departments.map((d) => (
              <Link
                key={d.id}
                to={`/admin/departments/${d.id}`}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] text-navy-900 bg-slate-200 px-1.5 py-0.5 rounded">
                      {d.code}
                    </span>
                    <span className="text-[10px] text-navy-700 font-semibold group-hover:underline flex items-center gap-0.5">
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 mt-1.5 group-hover:text-navy-900">{d.name}</h3>
                  {d.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{d.description}</p>
                  )}
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Courses: {d._count?.courses ?? 0}</span>
                  <span
                    className={`font-semibold ${
                      d.isActive ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {d.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 6. EDIT FACULTY MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-navy-800" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-navy-950">Edit Faculty Profile</h3>
                  <p className="text-xs text-slate-400">
                    Modifying {faculty.code} — {faculty.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.form && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faculty Code <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faculty Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dean / Head of Faculty
                  </label>
                  <Input
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
                    value={formData.officeLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, officeLocation: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Contact Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Academic Focus
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Faculty Status</span>
                  <span className="text-[11px] text-slate-500 block">
                    Active faculties allow programme offerings and applicant enrollments.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} className="text-xs">
                  {updateMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
