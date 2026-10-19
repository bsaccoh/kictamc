import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  LogIn,
  BookOpen,
  FileText,
  Upload,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const HowToApplyPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create Your Applicant Account',
      description:
        'Visit the Student Portal registration page. Enter your full legal name, active email address, and Sierra Leone mobile phone number, then set a secure password.',
      actionText: 'Register Account',
      actionPath: '/register',
      icon: UserPlus,
    },
    {
      num: '02',
      title: 'Select Programme & Intake',
      description:
        'Log in to your dashboard and select your desired programme (Degree, Higher National Diploma, or Lower Diploma), academic intake, and preferred study mode (Full-Time or Evening).',
      actionText: 'Browse Programmes',
      actionPath: '/courses',
      icon: BookOpen,
    },
    {
      num: '03',
      title: 'Complete Personal & Education History',
      description:
        'Fill in your biodata, residential address, parent/guardian details, and secondary school examination results (WASSCE / GCE subjects and grades).',
      actionText: null,
      actionPath: null,
      icon: FileText,
    },
    {
      num: '04',
      title: 'Upload Supporting Documents',
      description:
        'Attach clear scans or photos of your examination result slip, school testimonial, birth certificate, and passport-size photograph.',
      actionText: null,
      actionPath: null,
      icon: Upload,
    },
    {
      num: '05',
      title: 'Review Declaration & Submit',
      description:
        'Review your entered application details carefully, confirm the institutional truth declaration, and submit your application to receive your unique Application Reference Number.',
      actionText: null,
      actionPath: null,
      icon: CheckCircle2,
    },
    {
      num: '06',
      title: 'Pay Application Processing Fee',
      description:
        'Follow official payment instructions using Bank Deposit, Orange Money, Afrimoney, or online payment simulation. Upload your payment slip for finance verification.',
      actionText: 'View Fee Schedule',
      actionPath: '/fees',
      icon: CreditCard,
    },
    {
      num: '07',
      title: 'Track Application Status Online',
      description:
        'Log in anytime to view real-time updates as our Admissions Registry reviews your credentials and issues your official admission decision.',
      actionText: 'Applicant Login',
      actionPath: '/login',
      icon: Search,
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Step-by-Step Guide
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How to Apply for Admission
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Follow this practical guide to complete your online application successfully through the KICTAMC Student Portal.
            </p>
          </div>
        </div>
      </section>

      {/* Steps List */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-xl border border-[#E1E6ED] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start gap-5"
              >
                <div className="w-12 h-12 bg-[#142D4E] text-[#C69A43] rounded-xl flex items-center justify-center font-bold text-lg shrink-0 border border-[#2b4c77]">
                  {step.num}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#142D4E]" />
                    <h3 className="text-base font-bold text-[#142D4E]">{step.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
                    {step.description}
                  </p>

                  {step.actionText && step.actionPath && (
                    <div className="pt-2">
                      <Link
                        to={step.actionPath}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142D4E] hover:text-[#C69A43]"
                      >
                        {step.actionText} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Help Box */}
        <div className="mt-10 p-6 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Need Help Completing Your Form?</h4>
            <p className="text-xs text-slate-600">
              Visit the Admissions Desk at 19 Bockarie Gbay Street, Kenema, or contact <strong className="text-slate-800">admissions@kictamc.edu.sl</strong>.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow shrink-0"
          >
            Contact Admissions
          </Link>
        </div>
      </section>
    </div>
  );
};
