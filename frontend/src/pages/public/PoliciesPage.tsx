import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const location = useLocation();
  const isTerms = location.pathname.includes('/terms');
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(isTerms ? 'terms' : 'privacy');

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Institutional Governance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Use & Admissions Regulations'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Official policies governing data protection, student applications, and digital portal usage at Kenema ICT &amp; Management College.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs & Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-[#E1E6ED] pb-3">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-[#142D4E] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'bg-[#142D4E] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms of Use &amp; Academic Declaration
          </button>
        </div>

        {/* Tab 1: Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-2xl border border-[#E1E6ED] p-6 sm:p-10 shadow-sm space-y-6 text-xs sm:text-sm text-[#202B3C] leading-relaxed">
            <div className="border-b border-[#E1E6ED] pb-4">
              <h2 className="text-lg font-bold text-[#142D4E]">
                Institutional Privacy Statement
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Last reviewed by the KICTAMC Registry: Academic Session 2026/2027
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#142D4E]">1. Scope of Personal Data Collected</h3>
              <p className="text-[#697586]">
                Kenema ICT &amp; Management College (KICTAMC) collects personal identification data from applicants and students exclusively for admissions processing, identity verification, and collegiate administration. This includes full legal names, contact telephone numbers, email addresses, national identification data, secondary educational results (WASSCE / GCE), and scanned supporting documents.
              </p>

              <h3 className="text-sm font-bold text-[#142D4E]">2. Purpose of Data Processing</h3>
              <ul className="text-[#697586] list-disc list-inside space-y-1">
                <li>Evaluating eligibility against published departmental entry requirements.</li>
                <li>Generating verifiable collegiate matriculation registers and clearance records.</li>
                <li>Issuing official student identification cards and matriculation certificates.</li>
                <li>Communicating admission decisions, fee schedules, and academic timetables.</li>
              </ul>

              <h3 className="text-sm font-bold text-[#142D4E]">3. Data Security &amp; Confidentiality</h3>
              <p className="text-[#697586]">
                All student records are stored in secure relational databases with restricted role-based administrative access. Passwords and sensitive session tokens are cryptographically hashed. KICTAMC does not sell, lease, or distribute applicant data to third-party commercial marketing entities.
              </p>

              <h3 className="text-sm font-bold text-[#142D4E]">4. Public Verification Tokens</h3>
              <p className="text-[#697586]">
                Official digital receipts and matriculation records generate public verification tokens to enable legitimate employers and sponsors to confirm institutional standing without disclosing private student contact data.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Terms of Use */}
        {activeTab === 'terms' && (
          <div className="bg-white rounded-2xl border border-[#E1E6ED] p-6 sm:p-10 shadow-sm space-y-6 text-xs sm:text-sm text-[#202B3C] leading-relaxed">
            <div className="border-b border-[#E1E6ED] pb-4">
              <h2 className="text-lg font-bold text-[#142D4E]">
                Terms of Use &amp; Academic Integrity Declaration
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Binding agreement for all portal users, applicants, and enrolled students
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#142D4E]">1. Accuracy of Submitted Credentials</h3>
              <p className="text-[#697586]">
                By submitting an application through the KICTAMC portal, applicants solemnly affirm that all information, examination candidate numbers, and uploaded certificates are authentic and issued by recognized examination authorities (e.g. WAEC).
              </p>

              <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg text-rose-800 text-xs">
                <strong>Zero Tolerance for Forgery:</strong> The submission of forged, altered, or impersonated academic result slips will result in immediate disqualification, nullification of any admission offer, revocation of matriculation status, and formal notification to law enforcement and regulatory authorities.
              </div>

              <h3 className="text-sm font-bold text-[#142D4E]">2. Application Fees &amp; Non-Refundability</h3>
              <p className="text-[#697586]">
                Application processing fees cover the administrative cost of credential scrutiny and archiving. Application fees are strictly non-refundable regardless of the final admission decision.
              </p>

              <h3 className="text-sm font-bold text-[#142D4E]">3. Institutional Motto &amp; Student Code of Conduct</h3>
              <p className="text-[#697586]">
                All matriculated students are required to conduct themselves in alignment with the institutional motto <strong className="text-[#142D4E]">“NON SIBI SED PATRIAE”</strong>, upholding academic discipline, mutual respect, and the collegiate reputation of KICTAMC in Kenema and throughout Sierra Leone.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
