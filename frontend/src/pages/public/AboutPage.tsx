import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/siteConfig';
import {
  Compass,
  Target,
  Award,
  BookOpen,
  GraduationCap,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { affiliation } = siteConfig;

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              About the College
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Kenema ICT &amp; Management College
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Motto: <span className="text-[#C69A43] font-serif italic">“{siteConfig.motto}”</span> &mdash; {siteConfig.mottoTranslation}.
            </p>
          </div>
        </div>
      </section>

      {/* Institutional Overview & Authentic College Building Photo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Institutional Background
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
              Equipping Tomorrow's Leaders in Kenema and Beyond
            </h2>
            <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
              Kenema ICT &amp; Management College (KICTAMC) was established in Kenema, Eastern Province, Sierra Leone, to provide high-quality tertiary education bridging technical computing competencies and professional managerial leadership.
            </p>
            <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
              Recognizing the rapid digitisation of business, public administration, and civil society, KICTAMC equips students with practical, industry-aligned skills. We prepare our graduates not just to seek employment, but to drive innovation and civic responsibility across Sierra Leone.
            </p>

            {/* University Affiliation Highlight */}
            <div className="p-4 bg-slate-50 border border-[#E1E6ED] rounded-xl space-y-1.5 text-xs text-slate-700">
              <span className="font-bold text-[#142D4E] flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#C69A43]">
                <Building2 className="w-4 h-4 text-[#C69A43]" />
                University Affiliation
              </span>
              <p className="text-[#697586] leading-relaxed">
                KICTAMC is officially affiliated with <strong>{affiliation.partnerName}</strong> ({affiliation.partnerShortName}), Kenema (formerly {affiliation.partnerHistoricalName}), fostering curriculum alignment and quality assurance benchmarks.
              </p>
              <Link
                to="/affiliation"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#142D4E] hover:text-[#C69A43] pt-1"
              >
                Read Details of Our Affiliation <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 bg-amber-50/70 border-l-4 border-[#C69A43] rounded-r-lg">
              <p className="text-xs text-slate-800 italic">
                “Education is the foundation of national renewal. At KICTAMC, our purpose is encapsulated in our pledge: Non Sibi Sed Patriae &mdash; dedicating knowledge to the service of our motherland.”
              </p>
            </div>
          </div>

          {/* Authentic College Building (Blue building with gold signage) */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-[#E1E6ED] bg-white">
              <img
                src="/kictamc-college-front.jpg"
                alt="Kenema ICT & Management College main blue building and students in Kenema"
                className="w-full h-80 sm:h-96 object-cover object-top"
              />
              <div className="p-4 bg-slate-50 border-t border-[#E1E6ED] flex items-center text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-[#142D4E]">
                  <MapPin className="w-3.5 h-3.5 text-[#C69A43]" />
                  Main Campus Building &bull; 19 Bockarie Gbay St, Kenema
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="bg-slate-100/70 py-16 border-y border-[#E1E6ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Our Guiding Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
              Mission, Vision &amp; Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Vision */}
            <div className="bg-white rounded-xl p-6 border border-[#E1E6ED] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#142D4E] text-[#C69A43] flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142D4E]">Our Vision</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                To be a premier higher-education institution in West Africa, recognized for excellence in practical information technology, innovative management studies, and ethical leadership development.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-xl p-6 border border-[#E1E6ED] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#142D4E] text-[#C69A43] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142D4E]">Our Mission</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                To empower diverse learners through rigorous academic curricula, practical digital laboratories, and values-based mentorship, producing adaptable graduates who serve their communities with distinction.
              </p>
            </div>

            {/* Values */}
            <div className="bg-white rounded-xl p-6 border border-[#E1E6ED] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#142D4E] text-[#C69A43] flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#142D4E]">Core Values</h3>
              <ul className="text-xs text-[#697586] space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C69A43]" />
                  <strong>Integrity:</strong> Uncompromising ethical standards.
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C69A43]" />
                  <strong>Practicality:</strong> Hands-on technical proficiency.
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C69A43]" />
                  <strong>Service:</strong> Dedication to national development.
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C69A43]" />
                  <strong>Excellence:</strong> Continuous pursuit of quality.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Academic Governance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
            Administration &amp; Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
            College Leadership &amp; Administration
          </h2>
          <p className="text-xs sm:text-sm text-[#697586]">
            The institution is guided by dedicated administrative leadership and academic boards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#C69A43] tracking-wider">
              Registry
            </span>
            <h3 className="text-base font-bold text-[#142D4E]">Office of the Registrar</h3>
            <p className="text-xs text-[#697586]">
              Oversees admissions, academic records, examinations, and official student certification.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#C69A43] tracking-wider">
              Academic Affairs
            </span>
            <h3 className="text-base font-bold text-[#142D4E]">Academic Board</h3>
            <p className="text-xs text-[#697586]">
              Formulates curricula, oversees faculty instruction, and ensures quality assurance across all programmes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#C69A43] tracking-wider">
              Student Welfare
            </span>
            <h3 className="text-base font-bold text-[#142D4E]">Student Affairs Directorate</h3>
            <p className="text-xs text-[#697586]">
              Manages student mentorship, orientation, extracurricular life, and campus discipline.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#142D4E] text-white rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Ready to Join KICTAM College?</h3>
            <p className="text-xs text-slate-300">
              Explore our programmes or begin your online application today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-md"
            >
              Browse Courses
            </Link>
            <Link
              to="/apply"
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow"
            >
              Apply Online
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
