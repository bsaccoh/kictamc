import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  Edit2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Layers,
  GraduationCap,
  Sparkles,
  Save,
  X,
  CreditCard,
  Building,
  Check,
  XCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types/academic';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ActionMenu } from '../../components/ui/ActionMenu';

export const ApplicationFeesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [feeInputSLE, setFeeInputSLE] = useState('');
  const [tuitionInputSLE, setTuitionInputSLE] = useState('');
  const [modalError, setModalError] = useState('');

  // Batch update state
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchLevel, setBatchLevel] = useState<'DEGREE' | 'HIGHER_DIPLOMA' | 'LOWER_DIPLOMA'>('DEGREE');
  const [batchFeeSLE, setBatchFeeSLE] = useState('250');
  const [batchSuccess, setBatchSuccess] = useState(false);

  // Fetch courses with full fee data
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get<Course[]>('/courses'),
  });

  // Fetch payments for revenue metric
  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments-fees'],
    queryFn: () => api.get<any[]>('/admin/payments'),
  });

  // Mutation to update course application and tuition fee
  const updateFeeMutation = useMutation({
    mutationFn: async ({
      courseId,
      feeMinor,
      tuitionMinor,
    }: {
      courseId: string;
      feeMinor: number;
      tuitionMinor?: number;
    }) => {
      return api.patch(`/courses/${courseId}`, {
        applicationFeeMinor: feeMinor,
        ...(tuitionMinor !== undefined && { tuitionFeeMinor: tuitionMinor }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingCourse(null);
      setFeeInputSLE('');
      setTuitionInputSLE('');
      setModalError('');
    },
    onError: (err: any) => {
      setModalError(err.message || 'Failed to update fee.');
    },
  });

  // Batch update mutation
  const batchUpdateMutation = useMutation({
    mutationFn: async ({ level, feeMinor }: { level: string; feeMinor: number }) => {
      const targetCourses = courses.filter((c) => c.qualificationLevel === level);
      const promises = targetCourses.map((c) =>
        api.patch(`/courses/${c.id}`, { applicationFeeMinor: feeMinor })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setBatchSuccess(true);
      setTimeout(() => {
        setBatchSuccess(false);
        setBatchModalOpen(false);
      }, 1500);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ courseId, isActive }: { courseId: string; isActive: boolean }) => {
      return api.patch(`/courses/${courseId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err: any) => {
      alert(`Failed to update status: ${err.message}`);
    },
  });

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFeeInputSLE((course.applicationFeeMinor / 100).toString());
    const tuitionSLE = course.tuitionFeeMinor
      ? course.tuitionFeeMinor / 100
      : course.qualificationLevel === 'DEGREE'
      ? 4500
      : course.qualificationLevel === 'HIGHER_DIPLOMA'
      ? 3500
      : 2500;
    setTuitionInputSLE(tuitionSLE.toString());
    setModalError('');
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedFee = parseFloat(feeInputSLE);
    const parsedTuition = parseFloat(tuitionInputSLE);
    if (isNaN(parsedFee) || parsedFee < 0) {
      setModalError('Please enter a valid application fee amount.');
      return;
    }
    const minorFee = Math.round(parsedFee * 100);
    const minorTuition = !isNaN(parsedTuition) && parsedTuition >= 0 ? Math.round(parsedTuition * 100) : undefined;
    if (editingCourse) {
      updateFeeMutation.mutate({
        courseId: editingCourse.id,
        feeMinor: minorFee,
        tuitionMinor: minorTuition,
      });
    }
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(batchFeeSLE);
    if (isNaN(parsed) || parsed < 0) return;
    const minor = Math.round(parsed * 100);
    batchUpdateMutation.mutate({ level: batchLevel, feeMinor: minor });
  };

  const filteredCourses = courses.filter((c) => {
    const matchesLevel = levelFilter === 'ALL' || c.qualificationLevel === levelFilter;
    const matchesSearch =
      search.trim() === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Calculate high-level fee stats
  const degreeCourses = courses.filter((c) => c.qualificationLevel === 'DEGREE');
  const higherDipCourses = courses.filter((c) => c.qualificationLevel === 'HIGHER_DIPLOMA');
  const lowerDipCourses = courses.filter((c) => c.qualificationLevel === 'LOWER_DIPLOMA');

  const avgDegreeFee = degreeCourses.length
    ? Math.round(degreeCourses.reduce((sum, c) => sum + c.applicationFeeMinor, 0) / degreeCourses.length / 100)
    : 250;
  const avgHigherDipFee = higherDipCourses.length
    ? Math.round(higherDipCourses.reduce((sum, c) => sum + c.applicationFeeMinor, 0) / higherDipCourses.length / 100)
    : 200;
  const avgLowerDipFee = lowerDipCourses.length
    ? Math.round(lowerDipCourses.reduce((sum, c) => sum + c.applicationFeeMinor, 0) / lowerDipCourses.length / 100)
    : 150;

  const totalCollectedMinor = payments
    .filter((p: any) => p.status === 'PAID')
    .reduce((sum: number, p: any) => sum + (p.declaredAmountMinor || p.expectedAmountMinor || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
              Application Fee Configuration
            </h1>
            <Badge variant="navy">{courses.length} Programmes</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure application fee tariffs per programme and qualification level. These fees connect directly to the student portal application checkout.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-navy-950 text-xs font-semibold hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5 text-navy-700" />
            <span>Academic Programmes</span>
          </Link>

          <button
            onClick={() => {
              setBatchModalOpen(true);
              setBatchSuccess(false);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition shadow-xs self-start sm:self-auto"
          >
            <Layers className="w-3.5 h-3.5 text-gold-400" />
            <span>Batch Configure by Level</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Fee rates by academic level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Degree */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Degree Programmes</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-navy-950">
              SLE {avgDegreeFee.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {degreeCourses.length} active undergraduate courses
            </span>
          </div>
        </div>

        {/* Higher Diploma */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Higher Diplomas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-navy-950">
              SLE {avgHigherDipFee.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {higherDipCourses.length} professional diploma courses
            </span>
          </div>
        </div>

        {/* Lower Diploma */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Lower Diplomas</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-navy-950">
              SLE {avgLowerDipFee.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {lowerDipCourses.length} foundational diploma courses
            </span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-emerald-800">
              SLE {(totalCollectedMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Across verified payments</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programme or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'DEGREE', 'HIGHER_DIPLOMA', 'LOWER_DIPLOMA'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                levelFilter === lvl
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl === 'ALL' ? 'All Qualifications' : lvl.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Fees Configuration Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Programme Title</th>
                <th className="py-3.5 px-4">Faculty / Department</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">App Fee</th>
                <th className="py-3.5 px-4">Annual Programme Tuition</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-navy-800 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading fee structure...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No programmes found matching search.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c, index) => {
                  const feeSLE = (c.applicationFeeMinor / 100).toFixed(2);
                  const tuitionSLE = c.tuitionFeeMinor
                    ? c.tuitionFeeMinor / 100
                    : c.qualificationLevel === 'DEGREE'
                    ? 4500
                    : c.qualificationLevel === 'HIGHER_DIPLOMA'
                    ? 3500
                    : 2500;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-900 whitespace-nowrap">
                        {c.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {c.department?.name || 'Department of ICT'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-slate-100 text-slate-700">
                          {c.qualificationLevel.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-sm font-serif font-black text-amber-900">
                          SLE {Number(feeSLE).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-bold text-emerald-800">
                          SLE {tuitionSLE.toLocaleString('en-US', { minimumFractionDigits: 2 })}/yr
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end">
                          <ActionMenu
                            label={`Actions for ${c.code}`}
                            direction={index < 3 ? 'down' : 'auto'}
                            items={[
                              {
                                label: 'Configure Fee Tariff',
                                icon: <Edit2 className="w-4 h-4 text-emerald-600" />,
                                onClick: () => handleOpenEdit(c),
                              },
                              {
                                label: 'Academic Specifications',
                                icon: <BookOpen className="w-4 h-4 text-navy-800" />,
                                to: '/admin/courses',
                              },
                              {
                                label: c.isActive ? 'Deactivate Programme' : 'Activate Programme',
                                icon: c.isActive ? (
                                  <XCircle className="w-4 h-4 text-rose-600" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                ),
                                variant: c.isActive ? 'danger' : 'default',
                                onClick: () => {
                                  toggleStatusMutation.mutate({
                                    courseId: c.id,
                                    isActive: !c.isActive,
                                  });
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
      </div>

      {/* EDIT SINGLE FEE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  SLE
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950">Configure Application Fee</h3>
                  <p className="text-xs text-slate-500 font-mono">{editingCourse.code}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 mb-4 font-medium leading-relaxed">
              Updating application tariff for <strong>{editingCourse.name}</strong> ({editingCourse.qualificationLevel.replace(/_/g, ' ')}).
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveFee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Fee (in Sierra Leone Leones / SLE) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    SLE
                  </span>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    required
                    value={feeInputSLE}
                    onChange={(e) => setFeeInputSLE(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 text-sm font-bold text-navy-950 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                    placeholder="e.g. 250"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Stored as {Math.round((parseFloat(feeInputSLE) || 0) * 100)} minor currency units.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Programme Tuition Fee (in Sierra Leone Leones / SLE) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    SLE
                  </span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    required
                    value={tuitionInputSLE}
                    onChange={(e) => setTuitionInputSLE(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 text-sm font-bold text-emerald-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                    placeholder="e.g. 4500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This tuition fee is printed in official candidate Acceptance Letters published upon successful interview verification.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateFeeMutation.isPending}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updateFeeMutation.isPending ? 'Saving...' : 'Save Fee Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH CONFIGURE MODAL */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950">Batch Fee Configuration</h3>
                  <p className="text-xs text-slate-500">Apply standard rate to all courses in level</p>
                </div>
              </div>
              <button
                onClick={() => setBatchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {batchSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>All programmes updated successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Qualification Level *
                  </label>
                  <select
                    value={batchLevel}
                    onChange={(e: any) => setBatchLevel(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-800 font-medium"
                  >
                    <option value="DEGREE">All Degree Programmes (BSc / BA)</option>
                    <option value="HIGHER_DIPLOMA">All Higher Diploma Programmes (HND)</option>
                    <option value="LOWER_DIPLOMA">All Lower Diploma Programmes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Uniform Fee Amount (in SLE) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      SLE
                    </span>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      required
                      value={batchFeeSLE}
                      onChange={(e) => setBatchFeeSLE(e.target.value)}
                      className="w-full pl-12 pr-4 py-2 text-sm font-bold text-navy-950 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                      placeholder="e.g. 200"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                  This will update all programmes matching <strong>{batchLevel.replace(/_/g, ' ')}</strong> to <strong>SLE {batchFeeSLE}</strong> simultaneously.
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBatchModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={batchUpdateMutation.isPending}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800 transition disabled:opacity-50"
                  >
                    {batchUpdateMutation.isPending ? 'Updating All...' : 'Apply Tariff to Level'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
