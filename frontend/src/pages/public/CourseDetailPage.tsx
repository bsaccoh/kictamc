import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi, PublicCourse } from '../../services/publicApi';
import {
  GraduationCap,
  Clock,
  MapPin,
  BookOpen,
  CheckCircle2,
  FileText,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['publicCourse', id],
    queryFn: () => publicApi.getCourseById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 bg-white rounded-xl animate-pulse border border-slate-200" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#142D4E]">Programme Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          The requested course record could not be found or is not currently active for public display.
        </p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#142D4E] rounded-md"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Catalogue
        </Link>
      </div>
    );
  }

  const feeFormatted = (course.applicationFeeMinor / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-12 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-xs text-[#C69A43] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Programmes
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-white/20 text-white">
                  {course.code}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-400 text-slate-900">
                  {course.qualificationLevel.replace('_', ' ')}
                </span>
                {course.faculty && (
                  <span className="text-xs text-slate-300 font-medium">
                    &bull; {course.faculty.name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {course.name}
              </h1>
            </div>

            <Link
              to={`/apply?courseId=${course.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow-lg shrink-0 self-start md:self-auto transition-transform hover:scale-105"
            >
              <GraduationCap className="w-4 h-4" />
              Apply for This Course
            </Link>
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Info (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Programme Overview */}
            <div className="bg-white rounded-xl border border-[#E1E6ED] p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#142D4E] border-b border-[#E1E6ED] pb-3">
                Programme Overview
              </h2>
              <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
                {course.description ||
                  'This programme equips students with technical mastery, analytical capacity, and practical problem-solving methods required in competitive work environments.'}
              </p>
              {course.detailedDescription && (
                <p className="text-xs sm:text-sm text-[#697586] leading-relaxed pt-2">
                  {course.detailedDescription}
                </p>
              )}
            </div>

            {/* Admission Requirements */}
            <div className="bg-white rounded-xl border border-[#E1E6ED] p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#142D4E] border-b border-[#E1E6ED] pb-3">
                Admission &amp; Entry Requirements
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                {course.admissionRequirements ||
                  'Minimum of 3 to 5 WASSCE/GCE O-Level passes in relevant subjects including English Language.'}
              </p>

              {course.documentRequirements && course.documentRequirements.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Required Supporting Documents
                  </h3>
                  <ul className="space-y-2">
                    {course.documentRequirements.map((doc) => (
                      <li key={doc.id} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{doc.name}</span>
                        {doc.isMandatory && (
                          <span className="text-[10px] text-rose-500 font-semibold">(Mandatory)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Quick Facts Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-[#E1E6ED] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#142D4E] border-b border-[#E1E6ED] pb-2">
                Key Information
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Qualification Level</span>
                  <span className="font-bold text-[#142D4E]">
                    {course.qualificationLevel.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Duration</span>
                  <span className="font-bold text-[#142D4E]">
                    {course.duration} {course.durationUnit}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Study Mode(s)</span>
                  <span className="font-bold text-[#142D4E]">
                    {course.studyModes || 'Full-Time, Evening'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Campus Venue</span>
                  <span className="font-bold text-[#142D4E]">
                    {course.preferredCampuses || 'Kenema Main Campus'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Application Processing Fee</span>
                  <span className="text-base font-extrabold text-[#C69A43]">
                    {course.currency} {feeFormatted}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E1E6ED]">
                <Link
                  to={`/apply?courseId=${course.id}`}
                  className="w-full text-center py-3 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow block transition-colors"
                >
                  Apply Online Now
                </Link>
              </div>
            </div>

            <div className="bg-[#142D4E] text-white rounded-xl p-5 space-y-2 text-xs">
              <span className="font-bold text-[#C69A43] block">Need Admissions Guidance?</span>
              <p className="text-slate-300">
                Contact our admissions team at <span className="text-white font-medium">admissions@kictamc.edu.sl</span> or telephone <span className="text-white font-medium">+232 76 612 345</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
