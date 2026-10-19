import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/siteConfig';
import {
  Building2,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Award,
  CheckCircle2,
  ArrowRight,
  Info,
  MapPin,
  FileCheck,
} from 'lucide-react';

export const AffiliationPage: React.FC = () => {
  const { affiliation } = siteConfig;

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C69A43] text-xs font-semibold tracking-wider uppercase border border-amber-400/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Institutional Partnership</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Our University Affiliation
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {affiliation.formalStatement}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Partner Institution Profile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E1E6ED] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E1E6ED] pb-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
                Affiliated University
              </span>
              <h2 className="text-2xl font-bold text-[#142D4E]">
                {affiliation.partnerName} ({affiliation.partnerShortName})
              </h2>
              <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
                Formerly renowned as <strong>{affiliation.partnerHistoricalName}</strong>, the institution was upgraded by the Government of Sierra Leone to full university status as Eastern Technical University of Sierra Leone, based in Kenema.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#C69A43]" />
                <span>{affiliation.partnerLocation}</span>
              </div>
            </div>

            <div className="shrink-0">
              <a
                href={affiliation.partnerWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#142D4E] hover:bg-[#1a385f] rounded-lg shadow transition-colors"
              >
                <span>Visit Official ETU-SL Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C69A43]" />
              </a>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-slate-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#C69A43] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-[#142D4E]">Institutional Distinction Notice:</strong>
              <p className="text-[#697586] leading-relaxed">
                Kenema ICT &amp; Management College (KICTAMC) retains its distinct institutional identity, collegiate governance, admissions registry, and independent campus administration at 19 Bockarie Gbay Street, Kenema, while collaborating under approved academic affiliation protocols with ETU-SL.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Nature of the Affiliation */}
      <section className="bg-slate-100/70 py-16 border-y border-[#E1E6ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Academic Collaboration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
              Nature &amp; Pillars of the Affiliation
            </h2>
            <p className="text-xs sm:text-sm text-[#697586]">
              How the institutional relationship supports educational quality and student outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-[#142D4E]" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E]">Quality Assurance</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Benchmarking educational standards, instructional assessments, and laboratory requirements against national university quality assurance benchmarks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5 text-[#142D4E]" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E]">Curriculum Benchmarking</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Syllabi in Computer Science, Information Technology, and Business Management are reviewed to align with modern higher education curricula.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-[#142D4E]" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E]">Standardized Evaluation</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Structured examination moderation, continuous assessment oversight, and credible grading criteria that guarantee academic integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. What This Means for Students */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
            Student Value
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
            What the Affiliation Means for Students
          </h2>
          <p className="text-xs sm:text-sm text-[#697586]">
            Clear, honest information regarding your credentials, academic standing, and collegiate experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#142D4E] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Recognized &amp; Respected Qualifications
            </h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Programmes delivered at KICTAMC adhere to verified collegiate curricula, providing graduates with recognized diplomas and degree qualifications valued by employers across public and private sectors in Sierra Leone.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#142D4E] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Academic Progression Opportunities
            </h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Graduates of KICTAMC Higher National Diploma (HND) and Diploma programmes possess accredited credits facilitating advanced placement, degree top-ups, and postgraduate trajectories in recognized higher institutions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#142D4E] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Access to Regional Academic Excellence
            </h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Students benefit from Eastern Province’s educational heritage, learning under lecturers trained in contemporary technological pedagogy and rigorous continuous assessment.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#142D4E] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              Official Verification &amp; Clearance
            </h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Every completed programme and clearance is registered on the collegiate database with digital verification tokens for transparent third-party employer verification.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Contact & Further Information */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#142D4E] text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Have Questions About Admissions or Affiliation?</h3>
            <p className="text-xs text-slate-300">
              The KICTAMC Registry and Admissions Office at 19 Bockarie Gbay Street, Kenema, are available to assist you.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/courses"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-colors"
            >
              Browse Programmes
            </Link>
            <Link
              to="/apply"
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow transition-colors"
            >
              Apply for Admission
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
