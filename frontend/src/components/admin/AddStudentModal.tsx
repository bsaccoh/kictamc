import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  X,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  MapPin,
  CheckCircle,
  Copy,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (student: any) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'academic' | 'guardian'>('details');

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    courseId: '',
    academicYearId: '',
    intakeId: '',
    studyMode: 'Full-Time',
    preferredCampus: 'Kenema Main Campus',
    matriculationNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    residentialAddress: '',
    townCity: 'Kenema',
    district: 'Kenema',
    parentFullName: '',
    parentPhone: '',
  });

  const [formError, setFormError] = useState('');
  const [createdStudent, setCreatedStudent] = useState<any | null>(null);
  const [copiedMatric, setCopiedMatric] = useState(false);

  // Fetch Courses
  const { data: coursesData = [] } = useQuery<any[]>({
    queryKey: ['active-courses-modal'],
    queryFn: async () => {
      const res = await api.get<any>('/courses');
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.courses)) return res.courses;
      return [];
    },
    enabled: isOpen,
  });

  // Fetch Academic Years
  const { data: academicYears = [] } = useQuery<any[]>({
    queryKey: ['academic-years-modal'],
    queryFn: async () => {
      const res = await api.get<any>('/academic-years?activeOnly=true');
      return Array.isArray(res) ? res : [];
    },
    enabled: isOpen,
  });

  // Fetch Intakes
  const { data: intakes = [] } = useQuery<any[]>({
    queryKey: ['intakes-modal'],
    queryFn: async () => {
      const res = await api.get<any>('/intakes');
      return Array.isArray(res) ? res : [];
    },
    enabled: isOpen,
  });

  const enrollMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/admin/students', data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setCreatedStudent(res.data || res);
      setFormError('');
      if (onSuccess) onSuccess(res.data || res);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to enroll student. Please check input details.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.surname || !formData.email || !formData.phone || !formData.courseId) {
      setFormError('First Name, Surname, Email, Phone Number, and Enrolled Program are required.');
      return;
    }
    enrollMutation.mutate(formData);
  };

  const handleReset = () => {
    setCreatedStudent(null);
    setFormData({
      firstName: '',
      middleName: '',
      surname: '',
      email: '',
      phone: '',
      password: '',
      courseId: '',
      academicYearId: '',
      intakeId: '',
      studyMode: 'Full-Time',
      preferredCampus: 'Kenema Main Campus',
      matriculationNumber: '',
      gender: 'Male',
      dateOfBirth: '',
      residentialAddress: '',
      townCity: 'Kenema',
      district: 'Kenema',
      parentFullName: '',
      parentPhone: '',
    });
    setFormError('');
    onClose();
  };

  const handleCopyMatric = (mat: string) => {
    navigator.clipboard.writeText(mat);
    setCopiedMatric(true);
    setTimeout(() => setCopiedMatric(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                Direct Student Enrolment
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Admissions Clearance
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Directly admit and register an enrolled collegiate student with an active matriculation record
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {createdStudent ? (
          <div className="p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">Student Enrolled Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1">
                The student account has been created with role <strong>STUDENT</strong> and an official matriculated record has been established.
              </p>
            </div>

            {/* Matriculation Dossier Box */}
            <div className="p-5 bg-gradient-to-br from-navy-900 via-navy-950 to-slate-900 text-white rounded-xl border border-gold-500/40 text-left max-w-md mx-auto shadow-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400">
                  Collegiate Matriculation Badge
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Fully Enrolled
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Student Name:</span>
                  <span className="font-bold text-sm text-white">
                    {createdStudent.user?.firstName} {createdStudent.user?.surname}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Official Matriculation Number:</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono text-base font-black text-gold-400 tracking-wider">
                      {createdStudent.matriculationNumber}
                    </span>
                    <button
                      onClick={() => handleCopyMatric(createdStudent.matriculationNumber)}
                      className="px-2 py-1 text-[10px] bg-white/10 hover:bg-white/20 text-slate-200 rounded flex items-center gap-1 transition"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedMatric ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Program Enrolled:</span>
                  <span className="text-slate-200 font-medium">
                    {createdStudent.application?.course?.name || 'Selected Program'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Login Email &amp; Phone:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {createdStudent.user?.email} • {createdStudent.user?.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition shadow-sm"
              >
                Close &amp; View User Directory
              </button>
            </div>
          </div>
        ) : (
          /* Enrollment Form */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* Tab navigation */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'details'
                    ? 'border-navy-900 text-navy-950 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" /> 1. Personal Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('academic')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'academic'
                    ? 'border-navy-900 text-navy-950 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> 2. Academic Program *
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('guardian')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'guardian'
                    ? 'border-navy-900 text-navy-950 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> 3. Address &amp; Guardian
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* TAB 1: PERSONAL DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                        placeholder="e.g. Sahr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                        placeholder="e.g. Francis"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Surname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.surname}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                        placeholder="e.g. Mansaray"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                        placeholder="e.g. s.mansaray@kictamc.edu.sl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                        placeholder="e.g. +23278123456"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Temporary Student Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-navy-800"
                      placeholder="Default if left blank: Student@123!"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Student will use this credential to log into the Student Portal.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMIC & PROGRAMME */}
              {activeTab === 'academic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Programme / Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-navy-800"
                    >
                      <option value="">-- Select Course / Programme --</option>
                      {coursesData.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code}) • {c.qualificationLevel?.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Session</label>
                      <select
                        value={formData.academicYearId}
                        onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                      >
                        <option value="">Default (Active Academic Year)</option>
                        {academicYears.map((ay: any) => (
                          <option key={ay.id} value={ay.id}>
                            {ay.name} {ay.isActive ? '(Active)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Intake</label>
                      <select
                        value={formData.intakeId}
                        onChange={(e) => setFormData({ ...formData, intakeId: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                      >
                        <option value="">Default (Active Intake)</option>
                        {intakes.map((it: any) => (
                          <option key={it.id} value={it.id}>
                            {it.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Study Mode</label>
                      <select
                        value={formData.studyMode}
                        onChange={(e) => setFormData({ ...formData, studyMode: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                      >
                        <option value="Full-Time">Full-Time (Regular)</option>
                        <option value="Evening">Evening Modular</option>
                        <option value="Weekend">Weekend Executive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Campus</label>
                      <input
                        type="text"
                        value={formData.preferredCampus}
                        onChange={(e) => setFormData({ ...formData, preferredCampus: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800 flex items-center justify-between">
                      <span>Custom Matriculation Number (Optional)</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Auto-Generated by Default
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.matriculationNumber}
                      onChange={(e) => setFormData({ ...formData, matriculationNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-navy-800 bg-white"
                      placeholder="e.g. KICTAMC/2026/BIT/0025 (leave blank to auto-generate)"
                    />
                    <p className="text-[11px] text-slate-500">
                      If left blank, the system automatically assigns the next official matriculation sequence.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: GUARDIAN & RESIDENTIAL */}
              {activeTab === 'guardian' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Town / City</label>
                      <input
                        type="text"
                        value={formData.townCity}
                        onChange={(e) => setFormData({ ...formData, townCity: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                        placeholder="e.g. Kenema City"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                        placeholder="e.g. Kenema District"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={formData.residentialAddress}
                      onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                      placeholder="e.g. 15 Hangha Road, Kenema"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Parent / Guardian Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.parentFullName}
                        onChange={(e) => setFormData({ ...formData, parentFullName: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                        placeholder="e.g. Pa Mohamed Mansaray"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Parent / Guardian Phone
                      </label>
                      <input
                        type="text"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                        placeholder="e.g. +23276111222"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeTab !== 'details' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'guardian' ? 'academic' : 'details')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    ← Previous Step
                  </button>
                )}
                {activeTab !== 'guardian' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'details' ? 'academic' : 'guardian')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Next Step →
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrollMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {enrollMutation.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enrolling Student...</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4 text-emerald-300" />
                      <span>Complete Direct Enrolment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
