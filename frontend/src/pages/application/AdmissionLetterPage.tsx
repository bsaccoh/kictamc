import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Building,
  GraduationCap,
  Calendar,
  Award,
  ExternalLink,
  AlertCircle,
  FileText,
  Loader2,
  CreditCard,
  Check
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api } from '../../services/api';
import { OfficialSeal } from '../../components/ui/OfficialSeal';

export const AdmissionLetterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  // Fetch document configuration for template customisation
  const { data: letterConfig } = useQuery<any>({
    queryKey: ['document-config-letter'],
    queryFn: async () => {
      try {
        const res = await api.get<any>('/document-config/letter').catch(() => null);
        return res?.data || res || null;
      } catch {
        return null;
      }
    },
  });

  // Fetch application either by ID (staff or direct student link) or current student session
  const { data: application, isLoading, error } = useQuery({
    queryKey: ['admission-letter-application', id],
    queryFn: async () => {
      if (id) {
        return api
          .get<any>(`/admin/applications/${id}`)
          .catch(() => api.get<any>(`/applications/${id}`));
      }
      const myApps = await api.get<any[]>('/applications/me');
      // Prioritize approved and letter published application or approved application
      const approvedApp =
        myApps?.find((a: any) => a.status === 'APPROVED' && a.acceptanceLetterPublished) ||
        myApps?.find((a: any) => a.status === 'APPROVED');
      return approvedApp || myApps?.[0] || null;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0F223D] border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading admission dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#0F223D] mb-2">Application Dossier Not Found</h2>
        <p className="text-slate-600 mb-6 text-sm">
          Unable to locate an application record to generate the admission acceptance letter.
        </p>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-[#0F223D] text-white rounded-lg text-xs font-semibold hover:bg-navy-900 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // If application is not approved yet, display pending status notice
  if (application.status !== 'APPROVED') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 shadow-sm">
          <FileText className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-amber-950 mb-2">Acceptance Letter Pending Approval</h2>
          <p className="text-amber-800 text-sm mb-4 leading-relaxed">
            Application <strong>{application.applicationReference}</strong> is currently in{' '}
            <span className="font-semibold uppercase">{application.status.replace(/_/g, ' ')}</span>{' '}
            status. Official acceptance letters are automatically generated and published once your credentials
            and admissions interview are verified and approved by the Admissions Committee.
          </p>
          {application.interviewStatus === 'SCHEDULED' && application.interviewDate && (
            <div className="mb-5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs text-blue-900 max-w-md mx-auto">
              <span className="font-bold block text-blue-950 mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" /> Admissions Interview Scheduled:
              </span>
              <span>
                Date: {new Date(application.interviewDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} at {application.interviewTime || '10:00 AM'}<br />
                Venue: {application.interviewVenue || '19 Bockarie Gbay Street Kenema (Main Campus)'}
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-white transition"
            >
              Go Back
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-[#0F223D] text-white rounded-lg text-xs font-semibold hover:bg-navy-900 transition"
            >
              View Application Progress
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract application parameters
  const applicant = application.applicant;
  const profile = applicant?.studentProfile;
  const course = application.course;
  const academicYear = application.academicYear?.name || '2026/2027';
  const confirmationToken =
    application.confirmationToken?.token || application.payments?.[0]?.confirmationToken?.token;

  const issueDateFormatted = application.decisionAt
    ? new Date(application.decisionAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : application.updatedAt
    ? new Date(application.updatedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const interviewDateFormatted = application.interviewDate
    ? new Date(application.interviewDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const applicantFullName =
    `${applicant?.firstName || ''} ${applicant?.middleName ? applicant.middleName + ' ' : ''}${
      applicant?.surname || ''
    }`.trim() || 'Candidate';
  const residentialAddress = profile?.residentialAddress || 'Kenema City';
  const townDistrict = `${profile?.townCity || 'Kenema'}, ${
    profile?.district || 'Kenema District'
  }, Eastern Province, Sierra Leone`;

  // Calculate actual system-configured fees
  const tuitionMinor =
    course?.tuitionFeeMinor ||
    application.tuitionFeeMinorSnapshot ||
    (course?.qualificationLevel === 'DEGREE'
      ? 450000
      : course?.qualificationLevel === 'HIGHER_DIPLOMA'
      ? 350000
      : 250000);

  const tuitionSLE = tuitionMinor / 100;
  const registrationSLE = 350;
  const labTechSLE = 300;
  const librarySLE = 200;
  const unionIdSLE = 150;
  const totalAnnualFeesSLE = tuitionSLE + registrationSLE + labTechSLE + librarySLE + unionIdSLE;
  const firstInstallmentSLE = Math.round(totalAnnualFeesSLE * 0.6);
  const secondInstallmentSLE = totalAnnualFeesSLE - firstInstallmentSLE;

  const handleDownloadPDF = async () => {
    const element = letterRef.current;
    if (!element) {
      window.print();
      return;
    }
    setIsDownloading(true);

    try {
      // Small pause to allow UI state to update
      await new Promise((resolve) => setTimeout(resolve, 60));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        ignoreElements: (el) => {
          return el instanceof HTMLElement && el.classList.contains('screen-only');
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const margin = 8;
      const maxWidth = pdfWidth - margin * 2;
      const maxHeight = pdfHeight - margin * 2;

      let renderWidth = maxWidth;
      let renderHeight = (canvas.height * renderWidth) / canvas.width;

      if (renderHeight > maxHeight) {
        renderHeight = maxHeight;
        renderWidth = (canvas.width * renderHeight) / canvas.height;
      }

      const posX = (pdfWidth - renderWidth) / 2;
      const posY = (pdfHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

      const fileName = `KICTAMC-Acceptance-Letter-${application?.applicationReference || '2026'}.pdf`;

      // Trigger download using Blob URL for maximum browser compatibility
      try {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobUrl);
        }, 1500);
      } catch (blobErr) {
        pdf.save(fileName);
      }
    } catch (err) {
      console.error('Failed to generate Acceptance Letter PDF directly:', err);
      // Seamlessly trigger print dialog if canvas capture fails
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-5 px-3 sm:px-6">
      {/* Print Specific CSS to guarantee 1 single A4 page */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .letter-a4-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
          }
          .screen-only {
            display: none !important;
          }
        }
      `}</style>

      {/* =========================================================================
          TOP ACTION BAR (Screen only, hidden on Print)
         ========================================================================= */}
      <div className="flex items-center justify-between mb-5 screen-only print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {confirmationToken && (
            <Link
              to={`/verify-token/${confirmationToken}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> Verify Token
            </Link>
          )}

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-200" /> Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-200" /> Download PDF
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F223D] hover:bg-[#1A3358] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Print Acceptance Letter
          </button>
        </div>
      </div>

      {/* =========================================================================
          OFFICIAL LETTERHEAD SHEET (Single A4 Print / PDF Layout)
         ========================================================================= */}
      <div
        ref={letterRef}
        className="letter-a4-sheet bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-6 sm:p-10 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 text-slate-800 font-sans leading-tight text-[11px] sm:text-[11.5px]"
      >
        {/* Crest Watermark Behind Letter Body */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.035] select-none text-center">
          <img
            src="/kictamc-logo.png"
            alt=""
            className="w-[420px] h-[420px] object-contain"
          />
        </div>

        {/* 1. Official College Header */}
        <div className="text-center pb-3 relative">
          <div className="flex items-center justify-center gap-3 mb-1">
            <img
              src="/kictamc-logo.png"
              alt="KICTAMC Emblem"
              className="w-16 h-16 sm:w-18 sm:h-18 object-contain drop-shadow-sm flex-shrink-0"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-[#0F223D] tracking-tight uppercase leading-tight">
            {letterConfig?.institutionName || 'Kenema ICT & Management College'}
          </h1>
          <p className="text-[10px] sm:text-[11px] font-bold text-amber-700 tracking-wider uppercase mt-0.5">
            Motto: "{letterConfig?.institutionMotto || 'Non Sibi Sed Patriae (Not For Self, But For Country)'}"
          </p>
          <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wide mt-0.5">
            {letterConfig?.officeName || 'Office of the Registrar & Academic Admissions Board'}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
            {letterConfig?.institutionAddress || '19 Bockarie Gbay Street Kenema • Contact: +23272808080'}<br />
            Email: {letterConfig?.institutionEmail || 'admissions@kictamc.edu.sl'} | Website: {letterConfig?.institutionWebsite || 'www.kictamc.edu.sl'}
          </p>

          {/* Double Rule Header Divider */}
          <div className="mt-2.5 pt-0.5 border-t-2 border-[#0F223D]">
            <div className="h-0.5 bg-amber-500 w-full" />
          </div>
        </div>

        {/* 2. Reference & Date Strip */}
        <div className="grid grid-cols-2 gap-2 py-2 text-[10.5px] border-b border-slate-200">
          <div className="space-y-0.5">
            <p>
              <strong className="text-slate-900 font-bold">Our Ref:</strong>{' '}
              <span className="font-mono text-slate-700 font-semibold">{application.applicationReference}</span>
            </p>
            <p>
              <strong className="text-slate-900 font-bold">Academic Session:</strong>{' '}
              <span className="text-slate-700">{academicYear} Academic Year</span>
            </p>
            {confirmationToken && (
              <p className="flex items-center gap-1.5 pt-0.5">
                <strong className="text-slate-900 font-bold">App Fee Token:</strong>{' '}
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                  {confirmationToken}
                </span>
                <span className="text-[9px] text-emerald-600 font-semibold">✓ VERIFIED</span>
              </p>
            )}
          </div>

          <div className="text-right space-y-0.5">
            <p>
              <strong className="text-slate-900 font-bold">Date of Offer:</strong>{' '}
              <span className="text-slate-700">{issueDateFormatted}</span>
            </p>
            <p>
              <strong className="text-slate-900 font-bold">Study Mode:</strong>{' '}
              <span className="text-slate-700">{application.studyMode || 'Full-Time'}</span>
            </p>
            <p>
              <strong className="text-slate-900 font-bold">Campus:</strong>{' '}
              <span className="text-slate-700">{application.preferredCampus || 'Kenema Main Campus'}</span>
            </p>
          </div>
        </div>

        {/* 3. Addressee */}
        <div className="pt-2.5 pb-2 text-[10.5px] space-y-0.5 text-slate-800">
          <p className="font-bold text-xs text-[#0F223D]">{applicantFullName}</p>
          <p className="text-slate-600">{residentialAddress}, {townDistrict}</p>
          <p className="text-slate-500 font-mono text-[10px]">{applicant?.phone || applicant?.email}</p>
        </div>

        {/* 4. Subject Line */}
        <div className="py-1.5 text-center sm:text-left">
          <h2 className="text-xs sm:text-sm font-bold text-[#0F223D] tracking-wide uppercase border-b-2 border-slate-900 inline-block pb-0.5">
            {letterConfig?.title || 'Offer of Admission'} — {academicYear} Session
          </h2>
        </div>

        {/* 5. Letter Content Body */}
        <div className="text-[10.5px] sm:text-[11px] leading-relaxed text-slate-700 space-y-2 text-justify">
          <p>
            Dear <span className="font-bold text-slate-900">{applicant?.firstName || 'Candidate'}</span>,
          </p>

          <p>
            Following the official review of your secondary academic credentials and your{' '}
            <strong className="text-slate-900">
              successful completion and verification of the Admissions Interview
            </strong>
            {interviewDateFormatted ? ` conducted on ${interviewDateFormatted}` : ''}, I have the honour to inform you that you have been offered{' '}
            <strong className="text-slate-900">Provisional Admission</strong> into Kenema ICT &amp; Management College for the programme stated below:
          </p>

          {/* Program Specifications Card */}
          <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-2.5 my-1.5 font-normal text-[10px] text-slate-800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Programme Offered</span>
                <span className="font-bold text-[11px] text-[#0F223D]">{course?.name || application.courseNameSnapshot}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Faculty / Department</span>
                <span className="font-semibold text-slate-800">{course?.department?.name || 'Department of Computing & ICT'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Qualification Level</span>
                <span className="font-semibold text-slate-800">
                  {(course?.qualificationLevel || application.courseLevelSnapshot || 'DEGREE').replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Interview Clearance</span>
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" /> PASSED &amp; APPROVED
                </span>
              </div>
            </div>
          </div>

          {/* 6. ACTUAL SYSTEM-CONFIGURED FEES SCHEDULE TABLE */}
          <div className="my-2 bg-slate-50/95 border border-slate-300 rounded-lg p-2.5 text-[10.5px]">
            <div className="font-bold text-[#0F223D] uppercase text-[10px] mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Approved Collegiate Fee Tariff ({academicYear})
              </span>
              <span className="font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[9px] font-bold">
                System Configured Rates (SLE)
              </span>
            </div>

            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase text-[8.5px]">
                  <th className="py-0.5">Prescribed Fee Item</th>
                  <th className="py-0.5">Billing Period</th>
                  <th className="py-0.5 text-right">Amount (SLE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="py-0.5 font-semibold text-slate-900">
                    {course?.name} Programme Tuition Fee
                  </td>
                  <td className="py-0.5 text-slate-500">Per Academic Year</td>
                  <td className="py-0.5 text-right font-mono font-bold text-slate-900">
                    {tuitionSLE.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5">Institutional Registration &amp; Matriculation Fee</td>
                  <td className="py-0.5 text-slate-500">Once / Annual</td>
                  <td className="py-0.5 text-right font-mono">{registrationSLE.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">ICT Practical Laboratory &amp; Broadband Internet Infrastructure</td>
                  <td className="py-0.5 text-slate-500">Per Academic Year</td>
                  <td className="py-0.5 text-right font-mono">{labTechSLE.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Academic Library &amp; Digital Research Resources</td>
                  <td className="py-0.5 text-slate-500">Per Academic Year</td>
                  <td className="py-0.5 text-right font-mono">{librarySLE.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-0.5">Student Union Government (SUG) &amp; Biometric ID Smart Card</td>
                  <td className="py-0.5 text-slate-500">Once / Annual</td>
                  <td className="py-0.5 text-right font-mono">{unionIdSLE.toFixed(2)}</td>
                </tr>
                <tr className="border-t-2 border-[#0F223D] font-bold text-slate-900 bg-slate-100">
                  <td className="py-1 uppercase text-[9.5px]" colSpan={2}>
                    Total Prescribed Fees Payable (Session):
                  </td>
                  <td className="py-1 text-right font-mono text-[11px] text-[#0F223D] font-extrabold">
                    SLE {totalAnnualFeesSLE.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Installment Payment Breakdown & Bank Details */}
            <div className="mt-1.5 pt-1.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[9.5px] text-slate-600">
              <div>
                <strong className="text-slate-800">1st Installment (60% Minimum):</strong> SLE {firstInstallmentSLE.toLocaleString('en-US', { minimumFractionDigits: 2 })} payable upon acceptance prior to matriculation.
              </div>
              <div>
                <strong className="text-slate-800">2nd Installment (40% Balance):</strong> SLE {secondInstallmentSLE.toLocaleString('en-US', { minimumFractionDigits: 2 })} payable before 2nd Semester examinations.
              </div>
            </div>
          </div>

          <p className="text-[10px] leading-tight text-slate-600">
            <strong>Approved Payment Channels:</strong> Pay directly to <strong>Rokel Commercial Bank (SL) Ltd</strong>, Account No: <span className="font-mono font-bold text-slate-900">01-002-394819-01</span> (Kenema Branch) or <strong>Sierra Leone Commercial Bank</strong>, Account No: <span className="font-mono font-bold text-slate-900">003-010-449102-02</span>, or Orange Money / Afrimoney Merchant Code <span className="font-mono font-bold text-slate-900">728080</span>. Quote Reference: <span className="font-mono font-bold text-[#0F223D]">{application.applicationReference}</span>.
          </p>

          <p className="font-semibold text-slate-900 text-[10.5px]">
            Conditions Governing Offer of Admission:
          </p>

          <ol className="list-decimal pl-4 space-y-1 text-slate-700 text-[10px]">
            <li>
              <strong>Credential Verification:</strong> You must present your original WASSCE / BECE certificates, birth certificate, and national identification to the Academic Registry for final verification during matriculation.
            </li>
            <li>
              <strong>Fee Compliance:</strong> Course registration and issuance of student matriculation number is strictly contingent upon payment of the first installment (60%).
            </li>
            <li>
              <strong>Offer Validity:</strong> This admission offer remains valid for <strong>twenty-one (21) days</strong> from the date of this letter.
            </li>
          </ol>

          <p className="text-[10px]">
            On behalf of the Governing Council and Academic Staff of KICTAMC, congratulations on your admission.
          </p>
        </div>

        {/* 7. Signatures & Official College Stamp */}
        <div className="mt-5 pt-3 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 items-end text-center sm:text-left">
            {/* Primary Signatory (Registrar) */}
            <div>
              <div className="h-8 flex items-center justify-center sm:justify-start">
                <span className="font-serif italic font-bold text-base text-[#0F223D] tracking-wide select-none">
                  {letterConfig?.primarySignatureText || 'S. M. Kallon'}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <p className="font-bold text-[10.5px] text-slate-900">
                  {letterConfig?.primarySignatoryName || 'Mr. S. M. Kallon'}
                </p>
                <p className="text-[9.5px] text-slate-500">
                  {letterConfig?.primarySignatoryTitle || 'Registrar & Secretary to Council'}
                </p>
                <p className="text-[8.5px] text-slate-400">
                  {letterConfig?.primarySignatoryOffice || 'KICTAMC Academic Registry'}
                </p>
              </div>
            </div>

            {/* Professional Official College Seal */}
            <div className="flex flex-col items-center justify-center">
              <OfficialSeal
                size={110}
                type="admission"
                sessionYear={academicYear}
                topText={letterConfig?.sealTopText}
                centerText={letterConfig?.sealCenterText}
                bottomText={letterConfig?.sealBottomText}
              />
            </div>

            {/* Secondary Signatory (Dean) */}
            <div className="text-right">
              <div className="h-8 flex items-center justify-center sm:justify-end">
                <span className="font-serif italic font-bold text-base text-[#0F223D] tracking-wide select-none">
                  {letterConfig?.secondarySignatureText || 'Dr. A. B. Kamara'}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <p className="font-bold text-[10.5px] text-slate-900">
                  {letterConfig?.secondarySignatoryName || 'Dr. A. B. Kamara'}
                </p>
                <p className="text-[9.5px] text-slate-500">
                  {letterConfig?.secondarySignatoryTitle || 'Dean of Academic Affairs'}
                </p>
                <p className="text-[8.5px] text-slate-400">
                  {letterConfig?.secondarySignatoryOffice || 'Admissions Board Chair'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Bottom Security Footer */}
        <div className="mt-4 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-400 gap-1">
          <span>
            Serial: KICTAMC/ADM/{academicYear.replace(/\//g, '-')}/{application.applicationReference.slice(-6)}
          </span>
          <span>
            Verify Token Online: <strong>kictamc.edu.sl/verify-token</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
