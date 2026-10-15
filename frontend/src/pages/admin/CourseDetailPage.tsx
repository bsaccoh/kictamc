import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Building2,
  GraduationCap,
  Award,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Edit2,
  Trash2,
  AlertCircle,
  FileCheck,
  ShieldAlert,
  Layers,
  ChevronRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, Faculty, Department } from '../../types/academic';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: course, isLoading, isError, error } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: () => api.get<Course>(`/courses/${id}`),
    enabled: !!id,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (isActive: boolean) => api.patch(`/courses/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err: any) => alert(`Error: ${err.message}`),
  });

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading course specifications...</p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Course Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested academic course profile could not be loaded.
        </p>
        <Link to="/admin/courses">
          <Button variant="secondary" className="text-xs gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Course Register
          </Button>
        </Link>
      </div>
    );
  }

  const appFeeSLE = (course.applicationFeeMinor / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
  });
  const tuitionFeeSLE = ((course.tuitionFeeMinor ?? 450000) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
  });

  const levelBadgeClass =
    course.qualificationLevel === 'DEGREE'
      ? 'bg-navy-50 text-navy-800 border-navy-200'
      : course.qualificationLevel === 'HIGHER_DIPLOMA'
      ? 'bg-purple-50 text-purple-800 border-purple-200'
      : 'bg-amber-50 text-amber-800 border-amber-200';

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* 1. Header with Breadcrumb */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
            <Link to="/admin" className="hover:text-navy-900 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/admin/courses" className="hover:text-navy-900 transition-colors">
              Courses
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{course.code}</span>
          </nav>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-navy-900 text-gold-400 font-mono font-bold text-xs rounded-lg">
              {course.code}
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
              {course.name}
            </h1>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${levelBadgeClass}`}
            >
              {course.qualificationLevel.replace(/_/g, ' ')}
            </span>
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
              {course.isActive ? 'Active for Intake' : 'Inactive'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
            {course.faculty && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-navy-800" />
                <Link
                  to={`/admin/faculties/${course.faculty.id}`}
                  className="font-semibold text-navy-900 hover:underline"
                >
                  {course.faculty.name}
                </Link>
              </span>
            )}
            {course.department && (
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.department.name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Link to="/admin/courses">
            <Button variant="secondary" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Course Register
            </Button>
          </Link>

          <Link to={`/admin/fees`}>
            <Button variant="secondary" className="gap-1.5 text-xs border-emerald-300 text-emerald-800">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Fee Tariffs
            </Button>
          </Link>

          <Button
            onClick={() => toggleStatusMutation.mutate(!course.isActive)}
            variant={course.isActive ? 'secondary' : 'primary'}
            className="text-xs gap-1.5"
          >
            {course.isActive ? (
              <>
                <XCircle className="w-3.5 h-3.5 text-amber-600" /> Deactivate Course
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Activate Course
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Award / Qualification
          </span>
          <span className="text-sm font-bold text-navy-950 mt-1 block">
            {course.qualificationAward ||
              (course.qualificationLevel === 'DEGREE'
                ? 'Bachelor of Science (BSc Honours)'
                : 'Higher National Diploma')}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Official credential awarded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Duration & Units
          </span>
          <span className="text-xl font-extrabold text-blue-900 font-mono mt-0.5 block">
            {course.duration || 3} {course.durationUnit || 'Years'}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {course.creditUnits || 120} Total Credit Units
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
            Prescribed Tuition Fee
          </span>
          <span className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5 block">
            SLE {tuitionFeeSLE}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Application Fee: SLE {appFeeSLE}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
            Total Applicants
          </span>
          <span className="text-2xl font-extrabold text-amber-800 font-mono mt-0.5 block">
            {course._count?.applications || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Capacity: {course.intakeCapacity || 50} students/session
          </span>
        </div>
      </div>

      {/* 3. Academic Profile & Specifications Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic Description & Curriculum Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card A: Programme Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-navy-800" />
              <span>Academic Programme Overview & Syllabus</span>
            </h2>

            <div className="mt-4 space-y-4 text-xs text-slate-700 leading-relaxed">
              <div>
                <strong className="text-slate-900 block mb-1">Course Description:</strong>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {course.description || 'No summary description provided.'}
                </p>
              </div>

              {course.detailedDescription && (
                <div>
                  <strong className="text-slate-900 block mb-1">Detailed Academic Syllabus:</strong>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                    {course.detailedDescription}
                  </p>
                </div>
              )}

              {course.learningOutcomes && (
                <div>
                  <strong className="text-slate-900 block mb-1">Target Learning Outcomes:</strong>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                    {course.learningOutcomes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card B: Admission Requirements & Prerequisites */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-navy-800" />
              <span>Admissions Entry Requirements & Criteria</span>
            </h2>

            <div className="mt-4 text-xs text-slate-700">
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                <strong className="text-amber-950 font-bold block mb-1">
                  Minimum Secondary / Collegiate Entry Qualifications:
                </strong>
                <p className="text-amber-900 leading-relaxed">
                  {course.admissionRequirements ||
                    'Standard KICTAMC collegiate requirements: Minimum of 5 WASSCE credits for Degree, 4 credits for Higher Diploma, or 3 credits for Lower Diploma.'}
                </p>
              </div>
            </div>

            {/* Document Requirements List */}
            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Prerequisite Upload Documents Required from Applicant:
              </span>
              <div className="space-y-2">
                {course.documentRequirements && course.documentRequirements.length > 0 ? (
                  course.documentRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-900">{req.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({req.documentType})</span>
                      </div>
                      <Badge variant={req.isMandatory ? 'navy' : 'neutral'}>
                        {req.isMandatory ? 'Mandatory' : 'Optional'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Standard college-wide documentation applies (Result Slip, Testimonial, Birth Certificate).
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Faculty Linkage, Delivery & Financial Terms */}
        <div className="space-y-6">
          {/* Faculty Card */}
          {course.faculty && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-navy-800" />
                <span>Parent Faculty & Administration</span>
              </h2>

              <div className="mt-3 text-xs space-y-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Faculty</span>
                  <Link
                    to={`/admin/faculties/${course.faculty.id}`}
                    className="font-bold text-navy-900 hover:underline text-sm block mt-0.5"
                  >
                    {course.faculty.name} ({course.faculty.code})
                  </Link>
                </div>

                {course.faculty.deanName && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Dean / Academic Head
                    </span>
                    <span className="font-medium text-slate-800 block mt-0.5">
                      {course.faculty.deanName}
                    </span>
                  </div>
                )}

                {course.faculty.email && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Official Contact
                    </span>
                    <span className="font-mono text-slate-700 block mt-0.5">
                      {course.faculty.email}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    to={`/admin/faculties/${course.faculty.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-navy-800 hover:text-navy-950"
                  >
                    <span>View Faculty Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Delivery & Campuses Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-navy-800" />
              <span>Study Modes & Delivery</span>
            </h2>

            <div className="mt-3 text-xs space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Available Study Modes
                </span>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {(course.studyModes || 'Full-Time,Evening').split(',').map((mode) => (
                    <span
                      key={mode}
                      className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]"
                    >
                      {mode.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Campus Locations
                </span>
                <span className="text-slate-800 font-medium block mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-navy-800" />
                  {course.preferredCampuses || 'Kenema Main Campus'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Academic Session / Intake
                </span>
                <span className="text-slate-800 font-medium block mt-0.5">
                  {course.academicYear?.name || '2026/2027 Academic Year'}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Fees & Tariffs Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Collegiate Fee Tariffs</span>
            </h2>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Application Voucher Fee:</span>
                <span className="font-mono font-bold text-amber-900">SLE {appFeeSLE}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Annual Programme Tuition:</span>
                <span className="font-mono font-bold text-emerald-800">SLE {tuitionFeeSLE}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 text-slate-500">
                <span>Tuition Currency:</span>
                <span className="font-bold text-slate-800 font-mono">{course.currency || 'SLE'}</span>
              </div>

              <div className="pt-2">
                <Link
                  to="/admin/fees"
                  className="block text-center text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition"
                >
                  Configure Fee Tariffs & Accounts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
