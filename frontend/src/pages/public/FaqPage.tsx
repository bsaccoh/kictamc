import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  CreditCard,
  FileText,
  UserCheck,
  Search,
  ArrowRight,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FaqItem[] = [
    {
      category: 'ADMISSIONS',
      question: 'What are the minimum requirements for a Degree programme?',
      answer:
        'For Bachelor of Science (BSc) degree programmes, candidates must possess a minimum of five (5) WASSCE/GCE O-Level credit passes in not more than two sittings, including English Language and Mathematics.',
    },
    {
      category: 'ADMISSIONS',
      question: 'Can I apply with awaiting WASSCE results?',
      answer:
        'Yes. Applicants awaiting their official WASSCE results may submit a provisional application by uploading their candidate examination slip. Full admission confirmation is contingent upon submission of verified results.',
    },
    {
      category: 'COURSES',
      question: 'What study modes are offered at KICTAMC?',
      answer:
        'KICTAMC offers Full-Time daytime classes as well as flexible Evening classes to accommodate working adult professionals and non-traditional students.',
    },
    {
      category: 'COURSES',
      question: 'Are practical computer laboratory sessions included in diploma courses?',
      answer:
        'Yes. Hands-on practical computer laboratory work is a core requirement across all ICT and business courses at KICTAMC, ensuring students gain applied digital mastery.',
    },
    {
      category: 'APPLICATION',
      question: 'How do I submit my supporting documents?',
      answer:
        'Documents (WASSCE result slip, testimonial, birth certificate, and passport photograph) are scanned and uploaded directly in PDF, JPG, or PNG format through Step 4 of the online Application Wizard.',
    },
    {
      category: 'APPLICATION',
      question: 'How can I track the progress of my application?',
      answer:
        'You can log in to your Student Portal account anytime to see the live status indicator on your dashboard (e.g. Under Review, Action Required, Approved, or Matriculated).',
    },
    {
      category: 'FEES',
      question: 'What are the approved application processing fees?',
      answer:
        'The non-refundable application fee is SLE 200.00 for Lower Diploma programmes, SLE 250.00 for Higher National Diplomas, and SLE 300.00 for Degree programmes.',
    },
    {
      category: 'FEES',
      question: 'How do I pay and verify my fees?',
      answer:
        'Fees can be paid through commercial bank deposit or mobile money (Orange Money / Afrimoney). After paying, upload your deposit slip or transaction reference in the portal. Upon approval, an official digital clearance token is issued.',
    },
    {
      category: 'FEES',
      question: 'How do I verify a payment confirmation token?',
      answer:
        'Anyone &mdash; including sponsors or employers &mdash; can verify official KICTAMC payment receipts by entering the unique clearance token into our public verification tool at /verify-token.',
    },
  ];

  const categories = ['ALL', 'ADMISSIONS', 'COURSES', 'APPLICATION', 'FEES'];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'ALL' || faq.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Help &amp; Clarifications
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Frequently Asked Questions (FAQ)
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Find authoritative answers regarding KICTAMC admissions, academic requirements, documents, and fees.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-xl border border-[#E1E6ED] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#142D4E] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Questions' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43]"
            />
          </div>
        </div>

        {/* Accordion Items */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-[#E1E6ED] shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      {faq.category}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#142D4E]">
                      {faq.question}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#697586] leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Assistance Box */}
        <div className="p-6 bg-[#142D4E] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Still have an unanswered question?</h3>
            <p className="text-xs text-slate-300">
              Our registry staff are available to assist you Monday through Friday.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow shrink-0"
          >
            Contact Admissions
          </Link>
        </div>
      </section>
    </div>
  );
};
