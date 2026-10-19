import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { publicApi, EnquirySubmission } from '../../services/publicApi';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquirySubmission>();

  const [submitSuccess, setSubmitSuccess] = useState<{
    referenceId: string;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: EnquirySubmission) => {
    try {
      setErrorMessage(null);
      const res = await publicApi.submitEnquiry(data);
      setSubmitSuccess(res);
      reset();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit enquiry. Please try again.');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Communication Registry
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Contact KICTAM College
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Get in touch with our Admissions Registry, Faculty Offices, or Finance Directorate in Kenema.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
                Official Contact Directory
              </span>
              <h2 className="text-2xl font-bold text-[#142D4E]">
                Campus Location &amp; Inquiries
              </h2>
              <p className="text-xs sm:text-sm text-[#697586] leading-relaxed">
                We welcome prospective students, parents, and community members to visit our Kenema campus during regular administrative hours.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase text-slate-400">Campus Address</h3>
                  <p className="text-sm font-semibold text-[#142D4E]">
                    19 Bockarie Gbay Street
                  </p>
                  <p className="text-xs text-[#697586]">Kenema City, Eastern Province, Sierra Leone</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase text-slate-400">Telephone Lines</h3>
                  <p className="text-sm font-semibold text-[#142D4E]">
                    +232 76 612 345
                  </p>
                  <p className="text-xs text-[#697586]">Alternative: +232 78 200 010</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase text-slate-400">Official Email</h3>
                  <p className="text-sm font-semibold text-[#142D4E]">
                    info@kictamc.edu.sl
                  </p>
                  <p className="text-xs text-[#697586]">Admissions: admissions@kictamc.edu.sl</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#142D4E]/10 text-[#142D4E] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase text-slate-400">Office Working Hours</h3>
                  <p className="text-sm font-semibold text-[#142D4E]">
                    Monday &ndash; Friday: 8:30 AM &ndash; 4:30 PM
                  </p>
                  <p className="text-xs text-[#697586]">Closed on weekends and public holidays</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-[#E1E6ED] shadow-md p-6 sm:p-10 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
                  Direct Message
                </span>
                <h2 className="text-2xl font-bold text-[#142D4E]">
                  Send an Official Enquiry
                </h2>
                <p className="text-xs text-[#697586]">
                  Complete this form to reach our admissions desk. All submissions are formally logged and answered.
                </p>
              </div>

              {submitSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    Enquiry Submitted Successfully
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    {submitSuccess.message}
                  </p>
                  <div className="p-3 bg-white rounded border border-emerald-200 text-xs">
                    <span className="text-slate-500 block">Enquiry Tracking Reference:</span>
                    <strong className="text-base text-[#142D4E] tracking-wider">
                      {submitSuccess.referenceId}
                    </strong>
                  </div>
                  <button
                    onClick={() => setSubmitSuccess(null)}
                    className="text-xs font-bold text-emerald-800 underline pt-2"
                  >
                    Submit Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#142D4E] mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mariama Koroma"
                        {...register('fullName', { required: 'Full name is required' })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43]"
                      />
                      {errors.fullName && (
                        <p className="text-[10px] text-rose-500 mt-1">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#142D4E] mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. mariama@example.com"
                        {...register('email', {
                          required: 'Email address is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Please enter a valid email address',
                          },
                        })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43]"
                      />
                      {errors.email && (
                        <p className="text-[10px] text-rose-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#142D4E] mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +232 76 000 000"
                        {...register('phone')}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#142D4E] mb-1">
                        Enquiry Subject <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Admissions Inquiry - BSc in IT"
                        {...register('subject', { required: 'Subject is required' })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43]"
                      />
                      {errors.subject && (
                        <p className="text-[10px] text-rose-500 mt-1">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142D4E] mb-1">
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Please provide details of your question or inquiry..."
                      {...register('message', {
                        required: 'Message is required',
                        minLength: { value: 10, message: 'Message must be at least 10 characters' },
                      })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43]"
                    />
                    {errors.message && (
                      <p className="text-[10px] text-rose-500 mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-lg shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Submitting Enquiry...' : 'Submit Official Enquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
