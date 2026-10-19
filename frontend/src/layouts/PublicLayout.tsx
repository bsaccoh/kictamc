import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import {
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  LogIn,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Building2,
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentYear = new Date().getFullYear();
  const { affiliation } = siteConfig;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#202B3C] font-sans selection:bg-[#C69A43] selection:text-white">
      {/* 1. SLIM UTILITY BAR (Centered) */}
      <div className="bg-[#0e2139] text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#1f3c63]">
        <div className="max-w-[1440px] w-full mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#C69A43]" />
            Kenema, Sierra Leone
          </span>
          <a
            href={`mailto:${siteConfig.email}`}
            className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#C69A43]" />
            {siteConfig.email}
          </a>
          <a
            href={`tel:${siteConfig.phonePrimary.replace(/\s+/g, '')}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#C69A43]" />
            {siteConfig.phonePrimary}
          </a>
          <div className="hidden md:flex items-center gap-2 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">2026/2027 Admissions Open</span>
          </div>
          <Link
            to="/verify-token"
            className="text-slate-300 hover:text-[#C69A43] transition-colors flex items-center gap-1 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C69A43]" />
            Verify Receipt Token
          </Link>
        </div>
      </div>

      {/* 2. MAIN HEADER & BALANCED NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#142D4E] text-white shadow-md border-b border-[#1d3d66]">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Crest, College Name */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-12 h-12 bg-white rounded-full p-1 shadow flex items-center justify-center shrink-0 border border-amber-300/70 transition-transform group-hover:scale-105">
                <img
                  src="/kictamc-logo.png"
                  alt="KICTAMC Crest"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  KICTAM COLLEGE
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#C69A43] tracking-wide uppercase">
                  Kenema ICT &amp; Management College
                </span>
              </div>
            </Link>

            {/* Center: Desktop Navigation (Clean, single-line labels, no awkward wrapping) */}
            <nav className="hidden xl:flex items-center gap-1 xl:gap-2">
              <Link
                to="/"
                className={`px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive('/')
                    ? 'text-[#C69A43] bg-white/10 font-semibold'
                    : 'text-slate-100 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>

              <Link
                to="/about"
                className={`px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive('/about')
                    ? 'text-[#C69A43] bg-white/10 font-semibold'
                    : 'text-slate-100 hover:text-white hover:bg-white/5'
                }`}
              >
                About Us
              </Link>

              {/* Academics Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive('/courses') || isActive('/faculties')
                      ? 'text-[#C69A43] bg-white/10 font-semibold'
                      : 'text-slate-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Academics
                  <ChevronDown className="w-3.5 h-3.5 opacity-75 group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 mt-0 w-52 py-2 bg-[#142D4E] border border-[#2b4c77] rounded-lg shadow-xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-150 z-50">
                  <Link
                    to="/faculties"
                    className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#1f3c63] hover:text-white"
                  >
                    Faculties &amp; Departments
                  </Link>
                  <Link
                    to="/courses"
                    className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#1f3c63] hover:text-white"
                  >
                    Course Catalogue
                  </Link>
                </div>
              </div>

              {/* Admissions Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive('/admissions') || isActive('/how-to-apply') || isActive('/fees')
                      ? 'text-[#C69A43] bg-white/10 font-semibold'
                      : 'text-slate-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Admissions
                  <ChevronDown className="w-3.5 h-3.5 opacity-75 group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 mt-0 w-56 py-2 bg-[#142D4E] border border-[#2b4c77] rounded-lg shadow-xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-150 z-50">
                  <Link
                    to="/admissions"
                    className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#1f3c63] hover:text-white"
                  >
                    Admission Requirements
                  </Link>
                  <Link
                    to="/how-to-apply"
                    className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#1f3c63] hover:text-white"
                  >
                    How to Apply (Guide)
                  </Link>
                  <Link
                    to="/fees"
                    className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#1f3c63] hover:text-white"
                  >
                    Tuition &amp; Fees Schedule
                  </Link>
                  <Link
                    to="/faq"
                    className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#1f3c63] hover:text-white"
                  >
                    Frequently Asked Questions
                  </Link>
                </div>
              </div>

              {/* Dedicated Affiliation Menu Link */}
              <Link
                to="/affiliation"
                className={`px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive('/affiliation')
                    ? 'text-[#C69A43] bg-white/10 font-semibold'
                    : 'text-slate-100 hover:text-white hover:bg-white/5'
                }`}
              >
                Affiliation
              </Link>

              <Link
                to="/campus-life"
                className={`px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive('/campus-life')
                    ? 'text-[#C69A43] bg-white/10 font-semibold'
                    : 'text-slate-100 hover:text-white hover:bg-white/5'
                }`}
              >
                Campus Life
              </Link>

              {/* News & Events Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive('/news') || isActive('/events')
                      ? 'text-[#C69A43] bg-white/10 font-semibold'
                      : 'text-slate-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  News &amp; Events
                  <ChevronDown className="w-3.5 h-3.5 opacity-75 group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 mt-0 w-48 py-2 bg-[#142D4E] border border-[#2b4c77] rounded-lg shadow-xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-150 z-50">
                  <Link
                    to="/news"
                    className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#1f3c63] hover:text-white"
                  >
                    News &amp; Notices
                  </Link>
                  <Link
                    to="/events"
                    className="block px-4 py-2 text-xs font-medium text-slate-200 hover:bg-[#1f3c63] hover:text-white"
                  >
                    College Events
                  </Link>
                </div>
              </div>

              <Link
                to="/contact"
                className={`px-2.5 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive('/contact')
                    ? 'text-[#C69A43] bg-white/10 font-semibold'
                    : 'text-slate-100 hover:text-white hover:bg-white/5'
                }`}
              >
                Contact Us
              </Link>
            </nav>

            {/* Right: Header Actions */}
            <div className="hidden sm:flex items-center gap-2.5 shrink-0">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:text-white hover:bg-white/10 border border-slate-400/30 rounded-md transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-[#C69A43]" />
                Login
              </Link>
              <Link
                to="/apply"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow transition-all hover:shadow-md whitespace-nowrap"
              >
                <GraduationCap className="w-4 h-4" />
                Apply Now
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#0e2139] border-t border-[#1f3c63] px-4 pt-3 pb-6 space-y-1">
            <div className="flex flex-col gap-1 pb-3 border-b border-[#1f3c63] text-sm">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/about') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                About Us
              </Link>
              <Link
                to="/faculties"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/faculties') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                Faculties &amp; Departments
              </Link>
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/courses') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                Course Catalogue
              </Link>
              <Link
                to="/admissions"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/admissions') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                Admissions Requirements
              </Link>
              <Link
                to="/how-to-apply"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/how-to-apply') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                How to Apply (Guide)
              </Link>
              <Link
                to="/fees"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/fees') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                Tuition &amp; Fees Schedule
              </Link>
              <Link
                to="/affiliation"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/affiliation') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                University Affiliation (ETU-SL)
              </Link>
              <Link
                to="/campus-life"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/campus-life') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                Campus Life
              </Link>
              <Link
                to="/news"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/news') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                News &amp; Notices
              </Link>
              <Link
                to="/events"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/events') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                College Events
              </Link>
              <Link
                to="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/faq') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                FAQ
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded ${
                  isActive('/contact') ? 'bg-[#C69A43] text-white font-bold' : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                Contact Us
              </Link>
            </div>

            <div className="pt-3 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-white border border-[#2b4c77] rounded bg-[#142D4E]"
              >
                Login
              </Link>
              <Link
                to="/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] rounded"
              >
                Apply for Admission
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN PAGE CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 4. REDESIGNED PROFESSIONAL FOOTER */}
      <footer className="bg-[#142D4E] text-slate-300 border-t-4 border-[#C69A43]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Col 1: Brand & Institutional Identity (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-full p-1.5 flex items-center justify-center shrink-0 border border-amber-300">
                  <img
                    src="/kictamc-logo.png"
                    alt="KICTAMC Crest"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-white text-base sm:text-lg font-bold tracking-tight">
                    KENEMA ICT &amp; MANAGEMENT COLLEGE
                  </h3>
                  <p className="text-xs text-[#C69A43] font-semibold tracking-wider uppercase">
                    {siteConfig.motto}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                Kenema ICT &amp; Management College (KICTAMC) provides practical, accredited higher education in computing, technology systems, management, and financial studies, empowering students across Sierra Leone for career excellence and national development.
              </p>

              {/* Affiliation Statement Box */}
              <div className="p-3 bg-[#0e2139] rounded-lg border border-[#2b4c77] text-xs text-slate-300 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C69A43] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#C69A43]" />
                  University Affiliation
                </span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Affiliated with <strong>{affiliation.partnerName}</strong> ({affiliation.partnerShortName}), formerly {affiliation.partnerHistoricalName}, Kenema.
                </p>
                <a
                  href={affiliation.partnerWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#C69A43] hover:underline font-semibold pt-0.5"
                >
                  Visit ETU-SL Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="pt-1 text-xs text-slate-400 space-y-1">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C69A43]" />
                  {siteConfig.address}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C69A43]" />
                  {siteConfig.phonePrimary} / {siteConfig.phoneAlt}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C69A43]" />
                  {siteConfig.email}
                </p>
              </div>
            </div>

            {/* Col 2: Academics */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-b border-[#2b4c77] pb-2">
                Academics
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/faculties" className="hover:text-white transition-colors">
                    Faculties &amp; Departments
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-white transition-colors">
                    Course Catalogue
                  </Link>
                </li>
                <li>
                  <Link to="/courses?level=DEGREE" className="hover:text-white transition-colors">
                    Degree Programmes
                  </Link>
                </li>
                <li>
                  <Link to="/courses?level=HIGHER_DIPLOMA" className="hover:text-white transition-colors">
                    Higher National Diplomas
                  </Link>
                </li>
                <li>
                  <Link to="/courses?level=LOWER_DIPLOMA" className="hover:text-white transition-colors">
                    Lower Diplomas
                  </Link>
                </li>
                <li>
                  <Link to="/fees" className="hover:text-white transition-colors">
                    Tuition &amp; Fees Schedule
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Admissions */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-b border-[#2b4c77] pb-2">
                Admissions
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/admissions" className="hover:text-white transition-colors">
                    Admission Requirements
                  </Link>
                </li>
                <li>
                  <Link to="/how-to-apply" className="hover:text-white transition-colors">
                    How to Apply (Guide)
                  </Link>
                </li>
                <li>
                  <Link to="/apply" className="text-[#C69A43] font-semibold hover:underline">
                    Online Application Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Student Portal Login
                  </Link>
                </li>
                <li>
                  <Link to="/verify-token" className="hover:text-white transition-colors">
                    Verify Receipt Token
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-white transition-colors">
                    Admissions FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Institution & Affiliation */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-b border-[#2b4c77] pb-2">
                Information
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About KICTAMC
                  </Link>
                </li>
                <li>
                  <Link to="/affiliation" className="text-[#C69A43] font-semibold hover:underline flex items-center gap-1">
                    Our Affiliation (ETU-SL)
                  </Link>
                </li>
                <li>
                  <Link to="/campus-life" className="hover:text-white transition-colors">
                    Campus &amp; Student Life
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="hover:text-white transition-colors">
                    News &amp; Notices
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-white transition-colors">
                    College Events
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="mt-12 pt-6 border-t border-[#1f3c63] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>
              &copy; {currentYear} Kenema ICT &amp; Management College (KICTAMC). All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <Link to="/privacy" className="hover:text-slate-200 transition-colors">
                Privacy Policy
              </Link>
              <span>&bull;</span>
              <Link to="/terms" className="hover:text-slate-200 transition-colors">
                Terms of Use
              </Link>
              <span>&bull;</span>
              <Link to="/admin" className="hover:text-slate-200 transition-colors">
                Staff Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
