import React from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Building,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const TuitionFeesPage: React.FC = () => {
  const applicationFees = [
    {
      level: 'Degree Programmes (BSc)',
      fee: 'SLE 300.00',
      description: 'Covers administrative scrutiny, credential verification, and entrance evaluation.',
    },
    {
      level: 'Higher National Diploma (HND)',
      fee: 'SLE 250.00',
      description: 'Covers application processing, department review, and document archiving.',
    },
    {
      level: 'Lower Diploma Programmes',
      fee: 'SLE 200.00',
      description: 'Covers foundational evaluation and enrolment registration.',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Financial Information
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Application &amp; Tuition Fees
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Official schedule of application fees, approved payment procedures, and tuition fee guidelines for KICTAMC.
            </p>
          </div>
        </div>
      </section>

      {/* Application Fees Schedule */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
            Non-Refundable Processing Fees
          </span>
          <h2 className="text-2xl font-bold text-[#142D4E]">
            Official Application Fee Schedule
          </h2>
          <p className="text-xs sm:text-sm text-[#697586]">
            Application fees are payable once per academic session during online submission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {applicationFees.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#E1E6ED] p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#142D4E]">
                  Session 2026/2027
                </span>
                <h3 className="text-base font-bold text-[#142D4E]">{item.level}</h3>
                <p className="text-xs text-[#697586] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 block">Processing Fee</span>
                <span className="text-2xl font-black text-[#142D4E]">{item.fee}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Channels */}
      <section className="bg-slate-100/70 py-16 border-y border-[#E1E6ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Approved Channels
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E]">
              Payment Methods &amp; Verification
            </h2>
            <p className="text-xs sm:text-sm text-[#697586]">
              All official payments must be processed through verified institutional accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-[#E1E6ED] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E]">Commercial Bank Deposit</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Pay directly over the counter at any designated commercial bank in Sierra Leone. Retain your stamped bank pay-in slip and upload it in the portal.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E1E6ED] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E]">Mobile Money Transfer</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Pay using Orange Money or Afrimoney using the official merchant code displayed inside your student portal payment view.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E1E6ED] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#142D4E]">Official Verification Token</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Every verified payment automatically generates a cryptographically verifiable confirmation token, safeguarding your financial clearance.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Important Financial Notice:</strong>
              Never pay fees into personal mobile money numbers or to unauthorized individuals. Always initiate payment inside the official KICTAMC Student Portal or at the college finance registry at 19 Bockarie Gbay Street, Kenema.
            </div>
          </div>
        </div>
      </section>

      {/* Tuition Structure Guidance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E1E6ED] p-6 sm:p-10 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#142D4E]">
            Tuition Fees &amp; Flexible Installments
          </h3>
          <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
            Tuition fees vary by programme, qualification level, and study mode. For admitted students, KICTAMC offers a structured semester installment plan (e.g. 60% upon matriculation clearance, 40% before semester examinations) to ensure education remains accessible.
          </p>
          <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
            To view the specific tuition schedule for your intended programme, please contact the Finance Registry or consult your admission offer letter.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142D4E] hover:text-[#C69A43]"
            >
              Contact the Finance Registry <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
