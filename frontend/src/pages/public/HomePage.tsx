import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi, PublicCourse, NewsArticle, CollegeEvent } from '../../services/publicApi';
import { siteConfig } from '../../config/siteConfig';
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Briefcase,
  Users,
  Compass,
  Phone,
  Mail,
  Building2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['publicOverview'],
    queryFn: publicApi.getOverview,
  });

  const activeIntake = overview?.activeIntakes?.[0];
  const { affiliation } = siteConfig;

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION (Refined Editorial Layout, Authentic Photo, Affiliation Statement) */}
      <section className="relative bg-[#142D4E] text-white overflow-hidden border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Institutional Copy with refined padding and margins */}
            <div className="lg:col-span-5 z-10 py-2 lg:py-4">
              <div className="mb-5 sm:mb-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3 sm:mb-4">
                  Welcome to <br />
                  <span className="text-[#C69A43]">KICTAM College</span>
                </h1>
                <p className="text-base sm:text-lg font-medium text-slate-200">
                  Kenema ICT &amp; Management College
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                Explore academic opportunities in information and communication technology, management, and related fields. Discover our programmes, review admission requirements, and take your next step with KICTAMC.
              </p>

              {/* University Affiliation Statement (Clean without background card) */}
              <div className="flex items-start gap-3 text-slate-300 mb-6">
                <Building2 className="w-5 h-5 text-[#C69A43] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-white text-xs sm:text-sm block">University Affiliation</span>
                  <span className="text-xs sm:text-sm text-slate-300 block">
                    Affiliated with Eastern Technical University of Sierra Leone (ETU-SL), Kenema.
                  </span>
                </div>
              </div>

              {/* Hero Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  Apply for Admission
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-slate-300/30 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#C69A43]" />
                  Explore Our Courses
                </Link>
              </div>
            </div>

            {/* Right Column: Authentic College Photograph (Unaltered faces, authentic front building) */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-amber-300/30 bg-[#0e2139]">
                <img
                  src="/kictamc-college-front.jpg"
                  alt="Full front view of the KICTAM College building with students in Kenema, Sierra Leone"
                  className="w-full h-auto max-h-[500px] object-cover object-top"
                  loading="eager"
                />
                <div className="p-3 bg-[#0e2139] border-t border-[#1f3c63] text-xs text-slate-300 flex items-center">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-[#C69A43]" />
                    KICTAMC Main Campus &bull; 19 Bockarie Gbay Street, Kenema
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADMISSIONS ANNOUNCEMENT (Restrained, Scannable Banner) */}
      {activeIntake && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
          <div className="bg-white rounded-xl shadow-md border border-[#E1E6ED] p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-[#C69A43] rounded-lg shrink-0 border border-amber-200">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Applications Open
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {overview?.academicYear?.name || '2026/2027 Academic Year'}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#142D4E]">
                  {activeIntake.name} &bull; Application Deadline:{' '}
                  {new Date(activeIntake.applicationDeadline).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-[#697586]">
                  Admissions are currently in progress for Degree, Higher National Diploma, and Lower Diploma programmes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <Link
                to="/admissions"
                className="flex-1 md:flex-none text-center px-3.5 py-2 text-xs font-semibold text-[#142D4E] hover:text-[#C69A43] border border-slate-300 rounded-md transition-colors"
              >
                Requirements
              </Link>
              <Link
                to="/apply"
                className="flex-1 md:flex-none text-center px-4 py-2 text-xs font-bold text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow transition-colors flex items-center justify-center gap-1.5"
              >
                Apply Online
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. ABOUT KICTAMC (Authentic College Photo, Verified DB Counts, Affiliation Statement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Authentic College Photo (kictamc-campus.jpg) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="rounded-xl overflow-hidden shadow-md border border-[#E1E6ED] bg-white">
              <img
                src="/kictamc-campus.jpg"
                alt="KICTAMC students in front of the college building wall"
                className="w-full h-80 sm:h-96 object-cover"
                loading="lazy"
              />
              <div className="p-3 bg-slate-50 border-t border-[#E1E6ED] text-xs text-[#697586] flex items-center justify-between">
                <span>Kenema ICT &amp; Management College</span>
                <span className="font-semibold text-[#142D4E]">Kenema, Sierra Leone</span>
              </div>
            </div>
          </div>

          {/* Institutional Content */}
          <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              About the College
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] tracking-tight">
              Dedicated to Practical ICT &amp; Professional Management Education
            </h2>
            <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
              Kenema ICT &amp; Management College (KICTAMC) provides quality tertiary education combining hands-on computing laboratories, structured management curricula, and professional discipline in Eastern Sierra Leone.
            </p>
            <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
              In formal affiliation with <strong>Eastern Technical University of Sierra Leone (ETU-SL)</strong>, Kenema, KICTAMC ensures its educational offerings benchmark recognized standards while maintaining independent campus governance at 19 Bockarie Gbay Street, Kenema.
            </p>

            <div className="p-3 bg-amber-50/70 border-l-4 border-[#C69A43] rounded-r-lg text-xs text-slate-800">
              <span className="font-bold text-[#142D4E] block">Institutional Motto:</span>
              <p className="italic">
                “NON SIBI SED PATRIAE” &mdash; Not for oneself, but for one's country.
              </p>
            </div>

            {/* Verified Database Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-white rounded-lg border border-[#E1E6ED] shadow-sm">
                <span className="text-xl font-extrabold text-[#142D4E] block">
                  {overview?.coursesCount || 7}
                </span>
                <span className="text-[11px] text-[#697586] font-medium">
                  Active Programmes
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E1E6ED] shadow-sm">
                <span className="text-xl font-extrabold text-[#142D4E] block">
                  {overview?.facultiesCount || 3}
                </span>
                <span className="text-[11px] text-[#697586] font-medium">
                  Academic Faculties
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E1E6ED] shadow-sm col-span-2 sm:col-span-1">
                <span className="text-xl font-extrabold text-[#142D4E] block">
                  {overview?.activeIntakes?.length || 2}
                </span>
                <span className="text-[11px] text-[#697586] font-medium">
                  Active Intakes
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142D4E] hover:text-[#C69A43] transition-colors"
              >
                Read More About KICTAMC <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FACULTIES & COURSES SECTION (Curated from Backend) */}
      <section className="bg-slate-100/70 py-16 border-y border-[#E1E6ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
                Academic Offerings
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] tracking-tight mt-1">
                Explore Our Active Programmes
              </h2>
              <p className="text-xs sm:text-sm text-[#697586] max-w-xl mt-1">
                Programmes offered across our Faculties of ICT, Business Studies, and Financial Studies.
              </p>
            </div>

            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#142D4E] hover:text-[#C69A43] transition-colors"
            >
              View Full Course Catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 bg-white rounded-xl animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : overview?.featuredCourses && overview.featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overview.featuredCourses.map((course: PublicCourse) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[#E1E6ED] p-6 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#142D4E] border border-slate-200">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {course.qualificationLevel.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#142D4E] leading-snug line-clamp-2">
                      {course.name}
                    </h3>

                    <p className="text-xs text-[#697586] line-clamp-3 leading-relaxed">
                      {course.description || 'Comprehensive programme designed for practical skill development and career preparation.'}
                    </p>

                    <div className="pt-2 text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C69A43]" />
                        <span>Duration: {course.duration} {course.durationUnit}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C69A43]" />
                        <span>{course.preferredCampuses || 'Kenema Main Campus'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-[#E1E6ED] flex items-center justify-between gap-3">
                    <Link
                      to={`/courses/${course.id}`}
                      className="text-xs font-semibold text-[#142D4E] hover:text-[#C69A43] transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/apply?courseId=${course.id}`}
                      className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded shadow-sm transition-colors"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E1E6ED]">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">Courses currently being updated</p>
              <p className="text-xs text-slate-400 mt-1">Please check back shortly or contact admissions.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. WHY STUDY AT KICTAMC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
            Institutional Strengths
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] tracking-tight">
            Why Study at KICTAMC?
          </h2>
          <p className="text-xs sm:text-sm text-[#697586]">
            Focused on providing affordable, job-ready education tailored to the developmental needs of Sierra Leone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center font-bold">
              <Laptop className="w-5 h-5 text-[#142D4E]" />
            </div>
            <h3 className="text-base font-bold text-[#142D4E]">Practical ICT Skills</h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Curriculum centered on applied computing, software tools, computer networking, and digital systems in dedicated campus labs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5 text-[#142D4E]" />
            </div>
            <h3 className="text-base font-bold text-[#142D4E]">Management &amp; Business</h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Rigorous grounding in administration, public sector finance, procurement, and commercial leadership.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#142D4E]" />
            </div>
            <h3 className="text-base font-bold text-[#142D4E]">Dedicated Faculty</h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              Experienced lecturers committed to student mentoring, academic discipline, and professional development.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E1E6ED] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5 text-[#142D4E]" />
            </div>
            <h3 className="text-base font-bold text-[#142D4E]">National Service</h3>
            <p className="text-xs text-[#697586] leading-relaxed">
              True to our motto “Non Sibi Sed Patriae”, our graduates are nurtured to contribute positively to the civic and economic growth of Sierra Leone.
            </p>
          </div>
        </div>
      </section>

      {/* 6. OUR AFFILIATION (Dedicated Homepage Summary Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E1E6ED] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E1E6ED] pb-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#C69A43]" />
                Institutional Partnership
              </span>
              <h2 className="text-2xl font-bold text-[#142D4E]">
                Affiliated with Eastern Technical University of Sierra Leone (ETU-SL)
              </h2>
              <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
                {affiliation.summaryStatement}
              </p>
            </div>

            <Link
              to="/affiliation"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#142D4E] hover:bg-[#1a385f] rounded-lg shadow shrink-0 self-start lg:self-auto transition-colors"
            >
              Learn More About Our Affiliation
              <ArrowRight className="w-3.5 h-3.5 text-[#C69A43]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <h4 className="font-bold text-[#142D4E]">Academic Quality Assurance</h4>
              <p className="text-slate-600">
                Instructional frameworks aligned with national technical university benchmarks.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <h4 className="font-bold text-[#142D4E]">Curriculum Alignment</h4>
              <p className="text-slate-600">
                Standardized syllabi in computing and managerial disciplines in Kenema.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <h4 className="font-bold text-[#142D4E]">Independent Governance</h4>
              <p className="text-slate-600">
                KICTAMC retains its dedicated administration and campus operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ADMISSIONS PROCESS WALKTHROUGH */}
      <section className="bg-[#142D4E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Application Procedure
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How to Apply for Admission
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              A clear, straightforward step-by-step admissions journey from registration to final enrollment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative">
              <span className="text-2xl font-black text-[#C69A43]">01</span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">Explore Programmes</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Review available Degree, Higher National Diploma, and Lower Diploma courses and requirements.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative">
              <span className="text-2xl font-black text-[#C69A43]">02</span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">Create Account</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Register on the KICTAMC Student Portal with your email and Sierra Leone phone number.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative">
              <span className="text-2xl font-black text-[#C69A43]">03</span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">Upload Documents</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Attach scans of your WASSCE/GCE results, testimonial, birth certificate, and photo.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative">
              <span className="text-2xl font-black text-[#C69A43]">04</span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">Pay &amp; Track Status</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Pay processing fees and follow your application evaluation on your live portal dashboard.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/how-to-apply"
                className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-colors"
              >
                Detailed Application Guide
              </Link>
              <Link
                to="/apply"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow transition-colors"
              >
                Start Your Online Application
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CAMPUS & STUDENT LIFE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Campus Community
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] tracking-tight mt-1">
              Authentic Student &amp; Campus Life
            </h2>
            <p className="text-xs sm:text-sm text-[#697586] max-w-xl mt-1">
              Photographs of our college facilities, front building, and student cohort at Kenema.
            </p>
          </div>

          <Link
            to="/campus-life"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#142D4E] hover:text-[#C69A43] transition-colors"
          >
            View Campus Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl overflow-hidden shadow-sm border border-[#E1E6ED] bg-white group">
            <div className="overflow-hidden h-72">
              <img
                src="/kictamc-campus.jpg"
                alt="KICTAMC students in front of the college building wall"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-4 bg-white border-t border-[#E1E6ED]">
              <h3 className="text-sm font-bold text-[#142D4E]">Student Cohort at KICTAM College</h3>
              <p className="text-xs text-[#697586] mt-0.5">
                Authentic group photograph of KICTAMC students in front of the college blue wall in Kenema.
              </p>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden shadow-sm border border-[#E1E6ED] bg-white group">
            <div className="overflow-hidden h-72">
              <img
                src="/kictamc-college-front.jpg"
                alt="Full front view of the KICTAM College campus building and students"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-4 bg-white border-t border-[#E1E6ED]">
              <h3 className="text-sm font-bold text-[#142D4E]">College Frontage &amp; Building</h3>
              <p className="text-xs text-[#697586] mt-0.5">
                The main college building with institutional signage at 19 Bockarie Gbay Street, Kenema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. LATEST NEWS & EVENTS */}
      <section className="bg-slate-100/70 py-16 border-y border-[#E1E6ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* News Articles (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
                    Official Notices
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#142D4E]">
                    News &amp; Announcements
                  </h2>
                </div>
                <Link
                  to="/news"
                  className="text-xs font-bold text-[#142D4E] hover:text-[#C69A43] flex items-center gap-1"
                >
                  All News <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {overview?.recentNews && overview.recentNews.length > 0 ? (
                <div className="space-y-4">
                  {overview.recentNews.map((article: NewsArticle) => (
                    <article
                      key={article.id}
                      className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-sm hover:shadow transition-shadow flex flex-col sm:flex-row gap-4"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            {article.category}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#142D4E] hover:text-[#C69A43] transition-colors">
                          <Link to={`/news/${article.slug}`}>{article.title}</Link>
                        </h3>
                        <p className="text-xs text-[#697586] line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>
                        <Link
                          to={`/news/${article.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#142D4E] hover:text-[#C69A43] pt-1"
                        >
                          Read Notice <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No news published currently.</p>
              )}
            </div>

            {/* Upcoming Events (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
                    Academic Schedule
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#142D4E]">
                    College Events
                  </h2>
                </div>
                <Link
                  to="/events"
                  className="text-xs font-bold text-[#142D4E] hover:text-[#C69A43] flex items-center gap-1"
                >
                  All Events <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {overview?.upcomingEvents && overview.upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {overview.upcomingEvents.map((event: CollegeEvent) => {
                    const eventDate = new Date(event.startDate);
                    return (
                      <div
                        key={event.id}
                        className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-sm flex items-start gap-4"
                      >
                        <div className="w-14 h-14 bg-[#142D4E] text-white rounded-lg flex flex-col items-center justify-center shrink-0 border border-[#2b4c77]">
                          <span className="text-xs font-bold uppercase text-[#C69A43]">
                            {eventDate.toLocaleString('en-GB', { month: 'short' })}
                          </span>
                          <span className="text-base font-extrabold leading-none">
                            {eventDate.getDate()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold text-[#142D4E]">
                            {event.title}
                          </h4>
                          <p className="text-[11px] text-[#697586] line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                            <Clock className="w-3 h-3 text-[#C69A43]" />
                            <span>{event.timeString || 'See details'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No scheduled events at this time.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. CONTACT & VERIFIED LOCATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E1E6ED] shadow-sm p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
                Get In Touch
              </span>
              <h2 className="text-2xl font-extrabold text-[#142D4E] tracking-tight">
                Visit or Contact the Admissions Office
              </h2>
              <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
                Have questions about application requirements, course schedules, or fees? Our admissions and registry officers in Kenema are ready to assist you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#142D4E]">
                    <MapPin className="w-4 h-4 text-[#C69A43]" />
                    Physical Campus
                  </div>
                  <p className="text-slate-600">
                    {siteConfig.address}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#142D4E]">
                    <Phone className="w-4 h-4 text-[#C69A43]" />
                    Telephone Lines
                  </div>
                  <p className="text-slate-600">
                    {siteConfig.phonePrimary} / {siteConfig.phoneAlt}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#142D4E]">
                    <Mail className="w-4 h-4 text-[#C69A43]" />
                    Admissions Email
                  </div>
                  <p className="text-slate-600">
                    {siteConfig.admissionsEmail}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#142D4E]">
                    <Clock className="w-4 h-4 text-[#C69A43]" />
                    Registry Hours
                  </div>
                  <p className="text-slate-600">
                    {siteConfig.registryHours}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#142D4E] text-white p-6 sm:p-8 rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-white">Have a General Enquiry?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Send a message directly to our registry team through our online enquiry form.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md transition-colors"
              >
                Send Us a Message
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FINAL ADMISSION CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0e2139] via-[#142D4E] to-[#1e3e68] text-white rounded-2xl p-8 sm:p-12 text-center space-y-5 shadow-lg border border-[#C69A43]/40">
          <div className="w-14 h-14 bg-white rounded-full p-1.5 mx-auto flex items-center justify-center border-2 border-amber-300">
            <img src="/kictamc-logo.png" alt="KICTAMC Crest" className="w-full h-full object-contain" />
          </div>
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Take the Next Step in Your Education
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Join a community committed to digital skills, management excellence, and nation-building. Explore our active programmes and submit your application online.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              Apply for Admission
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#C69A43]" />
              Explore Programmes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
