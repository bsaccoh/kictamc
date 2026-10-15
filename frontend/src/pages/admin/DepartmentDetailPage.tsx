import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Building2,
  BookOpen,
  ArrowLeft,
  Edit,
  Plus,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Award,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { Department, Faculty } from '../../types/academic';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const DepartmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // 1. Fetch department details
  const { data: department, isLoading, isError } = useQuery<Department>({
    queryKey: ['department-detail', id],
    queryFn: () => api.get<Department>(`/departments/${id}`),
    enabled: !!id,
  });

  // 2. Fetch faculties for edit modal dropdown
  const { data: facultiesRaw = [] } = useQuery({
    queryKey: ['faculties-dropdown'],
    queryFn: () => api.get<any>('/faculties?limit=100'),
    enabled: isEditModalOpen,
  });
  const faculties: Faculty[] = Array.isArray(facultiesRaw)
    ? facultiesRaw
    : facultiesRaw?.faculties || [];

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.patch(`/departments/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      setFormErrors({ form: err.message || 'Failed to update department' });
    },
  });

  const handleOpenEdit = () => {
    if (!department) return;
    setFormData({
      facultyId: department.facultyId || department.faculty?.id || '',
      name: department.name,
      code: department.code,
      description: department.description || '',
      hodName: department.hodName || '',
      hodTitle: department.hodTitle || 'Head of Department',
      email: department.email || '',
      phone: department.phone || '',
      officeLocation: department.officeLocation || '',
      isActive: department.isActive,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Department name is required' });
      return;
    }
    updateMutation.mutate({
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

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-navy-900 border-t-transparent mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading department profile...</p>
      </div>
    );
  }

  if (isError || !department) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto my-12 border-rose-200">
        <h3 className="text-sm font-semibold text-rose-900">Department not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested department does not exist or may have been deleted.
        </p>
        <Link to="/admin/departments">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Departments</span>
          </Button>
        </Link>
      </Card>
    );
  }

  const courses = department.courses || [];
  const activeCoursesCount = courses.filter((c) => c.isActive).length;
  const totalApplications = courses.reduce(
    (acc, curr) => acc + (curr._count?.applications ?? 0),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl pb-12">
      {/* 1. Header with Breadcrumb and Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
            <Link to="/admin" className="hover:text-navy-900 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/admin/departments" className="hover:text-navy-900 transition-colors">
              Departments
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">{department.code}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-md bg-navy-900 font-mono font-bold text-xs text-gold-400">
              {department.code}
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
              {department.name}
            </h1>
            <Badge variant={department.isActive ? 'success' : 'neutral'} className="text-[10px]">
              {department.isActive ? 'Active Department' : 'Inactive'}
            </Badge>
          </div>

          {department.description && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl">
              {department.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/departments')}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </Button>
          <Button
            size="sm"
            onClick={handleOpenEdit}
            className="gap-1.5 text-xs font-semibold"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Edit Department</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Academic Courses
          </div>
          <div className="mt-1.5 text-2xl font-bold font-serif text-navy-950">
            {courses.length}
          </div>
          <span className="text-[11px] text-slate-500">Degree & Diploma offerings</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Admissions
          </div>
          <div className="mt-1.5 text-2xl font-bold font-serif text-emerald-700">
            {activeCoursesCount}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Courses open for intake</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Student Applications
          </div>
          <div className="mt-1.5 text-2xl font-bold font-serif text-amber-700">
            {totalApplications}
          </div>
          <span className="text-[11px] text-slate-500">Total historical applicants</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Parent Faculty
          </div>
          <div className="mt-1.5 text-base font-bold font-serif text-navy-900 truncate" title={department.faculty?.name}>
            {department.faculty?.name || 'Unassigned'}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Code: {department.faculty?.code || 'N/A'}
          </span>
        </Card>
      </div>

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Courses Offered Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-navy-800" />
                <h3 className="font-serif font-bold text-sm text-navy-950">
                  Programmes & Courses Offered ({courses.length})
                </h3>
              </div>
              <Link to="/admin/courses">
                <Button size="sm" className="gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Course</span>
                </Button>
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <span>No courses have been affiliated with this department yet.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Programme Title</th>
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3 text-center">Applicants</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-navy-900">
                          {course.code}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 max-w-xs truncate" title={course.name}>
                          {course.name}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700">
                            {course.qualificationLevel.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {course.duration ? `${course.duration} ${course.durationUnit || 'Years'}` : '3 Years'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-700">
                          {course._count?.applications ?? 0}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={course.isActive ? 'success' : 'neutral'} className="text-[10px]">
                            {course.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/admin/courses/${course.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-800 hover:text-navy-950 hover:underline"
                          >
                            <span>Profile</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Leadership & Faculty Affiliation */}
        <div className="space-y-6">
          {/* Head of Department (HOD) Card */}
          <Card className="p-5 border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <UserCheck className="h-4 w-4 text-gold-600" />
              <h3 className="font-serif font-bold text-sm text-navy-950">
                Department Leadership (HOD)
              </h3>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm">
                {department.hodName
                  ? department.hodName.split(' ').map((n) => n[0]).join('').slice(0, 2)
                  : 'HD'}
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-navy-950">
                  {department.hodName || 'No HOD currently assigned'}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {department.hodTitle || 'Head of Department'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">
                  {department.email ? (
                    <a href={`mailto:${department.email}`} className="hover:underline text-navy-800">
                      {department.email}
                    </a>
                  ) : (
                    'No official email provided'
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span>{department.phone || 'No direct phone provided'}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{department.officeLocation || 'Main Campus'}</span>
              </div>
            </div>
          </Card>

          {/* Parent Faculty Card */}
          {department.faculty && (
            <Card className="p-5 border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
                <Building2 className="h-4 w-4 text-navy-700" />
                <h3 className="font-serif font-bold text-sm text-navy-950">
                  Collegiate Parent Faculty
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-navy-100 font-mono font-bold text-[11px] text-navy-900">
                    {department.faculty.code}
                  </span>
                  <span className="font-semibold text-xs text-navy-950">
                    {department.faculty.name}
                  </span>
                </div>

                {department.faculty.deanName && (
                  <p className="text-[11px] text-slate-500">
                    Dean: <span className="font-medium text-slate-700">{department.faculty.deanName}</span>
                  </p>
                )}

                {department.faculty.officeLocation && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{department.faculty.officeLocation}</span>
                  </p>
                )}

                <div className="pt-2">
                  <Link to={`/admin/faculties/${department.faculty.id}`}>
                    <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5 justify-center">
                      <span>View Faculty Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 4. EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-serif font-bold text-base text-navy-950">
                Edit Department Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {formErrors.form && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formErrors.form}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Faculty
                </label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  <option value="">Select Parent Faculty...</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Code
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HOD Name
                  </label>
                  <Input
                    value={formData.hodName}
                    onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HOD Title
                  </label>
                  <Input
                    value={formData.hodTitle}
                    onChange={(e) => setFormData({ ...formData, hodTitle: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Office Location
                </label>
                <Input
                  value={formData.officeLocation}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded text-navy-800 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-800">Active Department Status</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
