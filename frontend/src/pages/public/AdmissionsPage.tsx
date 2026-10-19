import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi, PublicIntake } from '../../services/publicApi';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  UserCheck,
} from 'lucide-react';

export const AdmissionsPage: React.FC = () => {
  const { data: intakes, isLoading: intakesLoading } = useQuery({
    queryKey: ['publicIntakes'],
    queryFn: publicApi.getIntakes,
  });

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Enrollment at KICTAMC
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Admissions Overview
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Complete information on admission intakes, minimum academic requirements, required documentation, and application deadlines.
            </p>
          </div>
        </div>
      </section>

      {/* Active Intakes Schedule */}
      <section id="intakes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Admission Intakes
            </span>
            <h2 className="text-2xl font-bold text-[#142D4E]">
              Available Academic Intakes
            </h2>
          </div>

          {intakesLoading ? (
            <div className="h-32 bg-white rounded-xl animate-pulse border border-slate-200" />
          ) : intakes && intakes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {intakes.map((intake: PublicIntake) => {
                const deadline = new Date(intake.applicationDeadline);
                const isDeadlinePast = deadline.getTime() < Date.now();
                return (
                  <div
                    key={intake.id}
                    className="bg-white rounded-xl border border-[#E1E6ED] p-6 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            intake.isActive && !isDeadlinePast
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {intake.isActive && !isDeadlinePast
                            ? 'Currently Open'
                            : 'Closed'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {intake.academicYear?.name || 'Academic Session'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#142D4E]">{intake.name}</h3>
                      <div className="space-y-1 text-xs text-slate-600 pt-2">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C69A43]" />
                          Application Deadline:{' '}
                          <strong className="text-slate-800">
                            {deadline.toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </strong>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#C69A43]" />
                          Commencement:{' '}
                          <span>
                            {new Date(intake.startDate).toLocaleDateString('en-GB', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      {intake.isActive && !isDeadlinePast ? (
                        <Link
                          to="/apply"
                          className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow transition-colors"
                        >
                          <GraduationCap className="w-4 h-4" />
                          Apply for This Intake
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium block text-center">
                          Intake Closed for Applications
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No active intakes currently published.</p>
          )}
        </div>
      </section>

      {/* Entry Requirements by Level */}
      <section className="bg-slate-100/70 py-16 border-y border-[#E1E6ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Academic Qualification Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
              General Entry Requirements
            </h2>
            <p className="text-xs sm:text-sm text-[#697586]">
              Criteria established by the KICTAMC Academic Board for undergraduate admission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Degree */}
            <div className="bg-white rounded-xl border border-[#E1E6ED] p-6 shadow-sm space-y-3">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#142D4E] text-white">
                DEGREE PROGRAMMES
              </span>
              <h3 className="text-base font-bold text-[#142D4E]">Bachelor of Science (BSc)</h3>
              <ul className="text-xs text-[#697586] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Minimum <strong>5 credits in WASSCE/GCE O-Level</strong> in not more than two sittings.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Must include passes in <strong>English Language and Mathematics</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Recognized Higher National Diploma (HND) holders may qualify for direct entry into advanced levels.
                  </span>
                </li>
              </ul>
            </div>

            {/* HND */}
            <div className="bg-white rounded-xl border border-[#E1E6ED] p-6 shadow-sm space-y-3">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#142D4E] text-white">
                HIGHER NATIONAL DIPLOMA
              </span>
              <h3 className="text-base font-bold text-[#142D4E]">HND Programmes</h3>
              <ul className="text-xs text-[#697586] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Minimum <strong>4 credits in WASSCE/GCE O-Level</strong> including relevant subjects.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Or recognized Lower Diploma in a related ICT or Business discipline from an accredited institution.
                  </span>
                </li>
              </ul>
            </div>

            {/* Lower Diploma */}
            <div className="bg-white rounded-xl border border-[#E1E6ED] p-6 shadow-sm space-y-3">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#142D4E] text-white">
                LOWER DIPLOMA
              </span>
              <h3 className="text-base font-bold text-[#142D4E]">Diploma Programmes</h3>
              <ul className="text-xs text-[#697586] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Minimum <strong>3 passes in WASSCE/GCE O-Level</strong> in relevant secondary subjects.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Ideal for school leavers seeking rapid job-ready computing and administrative skills.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Required Documentation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E1E6ED] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Document Checklist
            </span>
            <h2 className="text-2xl font-bold text-[#142D4E]">
              Required Documents for Online Application
            </h2>
            <p className="text-xs sm:text-sm text-[#697586]">
              Please prepare clear, scanned digital copies of the following documents before starting your application:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <FileText className="w-6 h-6 text-[#142D4E]" />
              <h4 className="font-bold text-[#142D4E]">WASSCE / GCE Result Slip</h4>
              <p className="text-slate-500">
                Official statement of examination results or certificate.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <FileText className="w-6 h-6 text-[#142D4E]" />
              <h4 className="font-bold text-[#142D4E]">School Testimonial</h4>
              <p className="text-slate-500">
                Testimonial letter from your secondary school principal.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <FileText className="w-6 h-6 text-[#142D4E]" />
              <h4 className="font-bold text-[#142D4E]">Birth Certificate</h4>
              <p className="text-slate-500">
                Government-issued birth certificate or affidavit.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <FileText className="w-6 h-6 text-[#142D4E]" />
              <h4 className="font-bold text-[#142D4E]">Passport Photograph</h4>
              <p className="text-slate-500">
                Recent color passport-sized photo on a clean background.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
            <Link
              to="/how-to-apply"
              className="text-xs font-bold text-[#142D4E] hover:text-[#C69A43] flex items-center gap-1.5"
            >
              Read our Step-by-Step Application Guide <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/apply"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow"
            >
              Start Application
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
