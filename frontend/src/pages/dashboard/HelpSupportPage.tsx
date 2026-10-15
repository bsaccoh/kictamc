import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FileQuestion
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Payments',
    question: 'How do I pay the application fee via Bank or Mobile Money?',
    answer:
      'You can pay at Sierra Leone Commercial Bank (SLCB) or Rokel Commercial Bank into the official KICTAMC Admissions account, or use Orange Money / Afrimoney. Afterwards, upload a clear photo or PDF scan of your bank deposit slip or transaction screenshot in the Application Fee & Payments tab.',
  },
  {
    category: 'Payments',
    question: 'How long does payment verification take?',
    answer:
      'Our Finance Office in Kenema verifies all manual bank slips and mobile money transfers within 24 to 48 business hours. Once verified, a unique cryptographic Payment Token and downloadable Official Receipt will appear in your Receipts tab.',
  },
  {
    category: 'Applications',
    question: 'What documents are required for admission consideration?',
    answer:
      'All candidates must provide: (1) WASSCE or BECE results slip/certificate; (2) Sierra Leone National Identity Card or certified Birth Certificate; (3) Recent passport-sized photograph with plain white background; and (4) Any previous academic transcripts or recommendation letters.',
  },
  {
    category: 'Applications',
    question: 'Can I edit my application after submission?',
    answer:
      'Once submitted, applications are locked for official review by admissions officers. If additional information or clearer documents are required, an Admissions Officer will flag your dossier with an "ACTION REQUIRED" status, reopening the specific section for revision.',
  },
  {
    category: 'Admissions',
    question: 'When will admission decisions be released?',
    answer:
      'Admissions decisions are made on a rolling basis. Candidates will receive SMS and email notifications, and an official Admission Offer Letter will become downloadable directly through the Application Tracking portal.',
  },
];

export const HelpSupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [inquirySent, setInquirySent] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'ADMISSIONS_INQUIRY',
    message: '',
  });

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setFormData({ subject: '', category: 'ADMISSIONS_INQUIRY', message: '' });
    setTimeout(() => setInquirySent(false), 6000);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Hero Support Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 bg-gold-50 border border-gold-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Student Helpdesk & Admissions Service
          </span>
          <h1 className="text-xl font-bold text-navy-950 font-serif">
            Kenema ICT & Management College — Help & Support Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Need guidance with your admission application, document uploads, or fee payment verification? Our Kenema campus
            admissions and finance team is here to assist.
          </p>
        </div>
      </div>

      {/* Campus Contact & Payment Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Contact info card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-navy-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Kenema Campus Location
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-900 block">Physical Address:</span>
              <p className="text-slate-500 mt-0.5">
                KICTAMC Campus, 19 Bockarie Gbay Street Kenema, Eastern Province, Sierra Leone
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-900 block">Admissions Helplines:</span>
              <p className="text-slate-500 mt-0.5 flex flex-col gap-0.5">
                <span className="font-medium text-slate-800">+23272808080 (Official Helpline)</span>
                <span>+232 76 990011 (WhatsApp / Africell)</span>
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-900 block">Email Inquiries:</span>
              <p className="text-slate-500 mt-0.5">admissions@kictamc.edu.sl</p>
            </div>

            <div>
              <span className="font-semibold text-slate-900 block">Working Hours:</span>
              <p className="text-slate-500 mt-0.5">
                Monday – Friday: 8:00 AM – 5:00 PM GMT<br />
                Saturday: 9:00 AM – 1:00 PM GMT
              </p>
            </div>
          </div>
        </div>

        {/* Banking channels card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-gold-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Bank Deposit Accounts
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-bold text-navy-950 block">Sierra Leone Commercial Bank (SLCB)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Account Name: KICTAMC Admissions</p>
              <p className="text-[11px] font-mono font-bold text-navy-800">Account No: 0030010928374</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Kenema Branch or Any Nationwide Branch</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-bold text-navy-950 block">Rokel Commercial Bank (RCBank)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Account Name: KICTAMC College Fund</p>
              <p className="text-[11px] font-mono font-bold text-navy-800">Account No: 012004928172</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Kenema Hangha Road Branch</p>
            </div>
          </div>
        </div>

        {/* Mobile Money channels */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Mobile Money Merchants
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
              <span className="font-bold text-amber-900 block">Orange Money</span>
              <p className="text-[11px] text-slate-600 mt-0.5">Dial *144*4*1#</p>
              <p className="text-[11px] font-mono font-bold text-amber-800">Merchant Code: 49201</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Enter Candidate Phone as Reference</p>
            </div>

            <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-200/60">
              <span className="font-bold text-purple-900 block">Africell Afrimoney</span>
              <p className="text-[11px] text-slate-600 mt-0.5">Dial *161*2#</p>
              <p className="text-[11px] font-mono font-bold text-purple-800">Merchant / Till: 772910</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Enter Candidate Name as Reference</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support FAQ & Inquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ Accordion */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileQuestion className="w-4 h-4 text-navy-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Frequently Asked Questions (FAQ)
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-3 text-left flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-navy-950 leading-snug">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Send message to admissions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Send className="w-4 h-4 text-navy-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Submit Helpdesk Ticket
            </h2>
          </div>

          {inquirySent && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Inquiry logged successfully (Ticket #KIC-70291). An admissions support officer will follow up with you.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitInquiry} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              >
                <option value="ADMISSIONS_INQUIRY">Admissions Eligibility & Selection</option>
                <option value="PAYMENT_VERIFICATION">Payment Slip & Token Verification</option>
                <option value="DOCUMENT_UPLOAD">Document Upload Issue</option>
                <option value="TECHNICAL_SUPPORT">Portal Access & Account Support</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Brief summary of your question or issue..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message Details</label>
              <textarea
                required
                rows={4}
                placeholder="Explain your situation in detail. Include payment receipt number or course name if applicable..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-xs py-2.5 bg-navy-600 hover:bg-navy-700 font-semibold flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-gold-400" />
              <span>Submit Support Ticket</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
