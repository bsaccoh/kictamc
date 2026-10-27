import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Receipt,
  Save,
  RotateCcw,
  CheckCircle2,
  Building,
  Shield,
  Award,
  Sparkles,
  CreditCard,
  UserCheck,
  Eye,
  Settings,
  HelpCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { OfficialSeal } from '../../components/ui/OfficialSeal';

export const DocumentConfigPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'letter' | 'receipt'>('letter');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Default Letter State
  const [letterForm, setLetterForm] = useState({
    title: 'Offer of Admission',
    institutionName: 'Kenema ICT & Management College',
    institutionMotto: 'Non Sibi Sed Patriae (Not For Self, But For Country)',
    institutionAddress: '19 Bockarie Gbay Street Kenema • Contact: +23272808080',
    institutionEmail: 'admissions@kictamc.edu.sl',
    institutionWebsite: 'www.kictamc.edu.sl',
    officeName: 'Office of the Registrar & Academic Admissions Board',
    openingText:
      'Following the official review of your secondary academic credentials and your successful completion and verification of the Admissions Interview, the Admissions Board of Kenema ICT & Management College is pleased to offer you admission into the following academic programme for the forthcoming session:',
    closingText:
      'On behalf of the Governing Council and Academic Staff of KICTAMC, congratulations on your admission.',
    validityDays: 21,
    firstInstallmentPercent: 60,
    primarySignatoryName: 'Mr. S. M. Kallon',
    primarySignatoryTitle: 'Registrar & Secretary to Council',
    primarySignatoryOffice: 'KICTAMC Academic Registry',
    primarySignatureText: 'S. M. Kallon',
    secondarySignatoryName: 'Dr. A. B. Kamara',
    secondarySignatoryTitle: 'Dean of Academic Affairs',
    secondarySignatoryOffice: 'Admissions Board Chair',
    secondarySignatureText: 'Dr. A. B. Kamara',
    bankName1: 'Rokel Commercial Bank (SL) Ltd',
    accountNumber1: '01-002-394819-01',
    bankName2: 'Sierra Leone Commercial Bank',
    accountNumber2: '003-010-449102-02',
    mobileMoneyMerchant: '728080',
    sealTopText: 'KENEMA ICT & MANAGEMENT COLLEGE',
    sealCenterText: 'OFFICIALLY SEALED',
    sealBottomText: 'OFFICE OF THE REGISTRAR • SIERRA LEONE',
  });

  // Default Receipt State
  const [receiptForm, setReceiptForm] = useState({
    title: 'Official Bursary Receipt',
    voucherTitle: 'Cryptographic Payment Confirmation Voucher',
    institutionName: 'Kenema ICT & Management College',
    institutionMotto: 'Non Sibi Sed Patriae (Not For Self, But For Country)',
    officeName: 'Office of the Bursar & Financial Services Directorate',
    address: '19 Bockarie Gbay Street Kenema',
    contactNumber: '+23272808080',
    email: 'bursar@kictamc.edu.sl',
    currencySymbol: 'SLE',
    auditorName: 'Internal Audit',
    auditorTitle: 'Admissions Audit Office',
    auditorOffice: 'Internal Audit Directorate • Kenema Campus',
    bursarName: 'Mr. Mohamed S. Koroma',
    bursarTitle: 'Bursar & Chief Financial Officer',
    bursarOffice: 'KICTAMC Finance Office',
    bursarSignatureText: 'M. S. Koroma',
    sealTextTop: 'OFFICE OF THE BURSAR',
    sealTextCenter: 'FEES CLEARED',
    sealTextBottom: 'KICTAMC • KENEMA CAMPUS',
    policyNotice:
      'This official electronic receipt and cryptographic payment token certify that the candidate has satisfied the statutory application fee requirement of Kenema ICT & Management College. This receipt is an official collegiate fiscal instrument. Please present this document along with your Offer of Admission letter during matriculation and physical document verification.',
  });

  // Fetch configs
  const { data: serverLetterConfig } = useQuery<any>({
    queryKey: ['document-config-letter'],
    queryFn: async () => {
      const res = await api.get<any>('/document-config/letter').catch(() => null);
      return res?.data || res || null;
    },
  });

  const { data: serverReceiptConfig } = useQuery<any>({
    queryKey: ['document-config-receipt'],
    queryFn: async () => {
      const res = await api.get<any>('/document-config/receipt').catch(() => null);
      return res?.data || res || null;
    },
  });

  useEffect(() => {
    if (serverLetterConfig && typeof serverLetterConfig === 'object') {
      setLetterForm((prev) => ({ ...prev, ...serverLetterConfig }));
    }
  }, [serverLetterConfig]);

  useEffect(() => {
    if (serverReceiptConfig && typeof serverReceiptConfig === 'object') {
      setReceiptForm((prev) => ({ ...prev, ...serverReceiptConfig }));
    }
  }, [serverReceiptConfig]);

  // Mutations
  const saveLetterMutation = useMutation({
    mutationFn: (data: typeof letterForm) => api.put('/admin/document-config/letter', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-config-letter'] });
      setSaveSuccessMsg('Offer of Admission letter configuration saved successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      alert(`Save failed: ${err.message || 'Unknown error'}`);
    },
  });

  const saveReceiptMutation = useMutation({
    mutationFn: (data: typeof receiptForm) => api.put('/admin/document-config/receipt', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-config-receipt'] });
      setSaveSuccessMsg('Official Payment Receipt configuration saved successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      alert(`Save failed: ${err.message || 'Unknown error'}`);
    },
  });

  const handleSave = () => {
    if (activeTab === 'letter') {
      saveLetterMutation.mutate(letterForm);
    } else {
      saveReceiptMutation.mutate(receiptForm);
    }
  };

  const isSaving = saveLetterMutation.isPending || saveReceiptMutation.isPending;

  return (
    <div className="space-y-6 max-w-7xl pb-24">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Settings className="w-3.5 h-3.5 text-navy-800" /> Institutional Customisation
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-950">
            Document &amp; Template Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure the official Offer of Admission letter, Bursary Receipts, seal typography, and authorized signatories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('letter')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'letter'
              ? 'border-navy-900 text-navy-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-600" /> Offer of Admission Letter
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('receipt')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'receipt'
              ? 'border-navy-900 text-navy-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-600" /> Official Payment Receipt
        </button>
      </div>

      {/* Tab 1: Offer of Admission Letter Settings */}
      {activeTab === 'letter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuration Form Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section A: Document Title & Letterhead */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Building className="w-4 h-4 text-amber-600" /> Header &amp; Document Title
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Offer Document Title
                  </label>
                  <input
                    type="text"
                    value={letterForm.title}
                    onChange={(e) => setLetterForm({ ...letterForm, title: e.target.value })}
                    placeholder="Offer of Admission"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">Defaults to 'Offer of Admission'</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={letterForm.institutionName}
                    onChange={(e) => setLetterForm({ ...letterForm, institutionName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Institutional Motto
                  </label>
                  <input
                    type="text"
                    value={letterForm.institutionMotto}
                    onChange={(e) => setLetterForm({ ...letterForm, institutionMotto: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Issuing Directorate / Office
                  </label>
                  <input
                    type="text"
                    value={letterForm.officeName}
                    onChange={(e) => setLetterForm({ ...letterForm, officeName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Campus Address &amp; Contact
                  </label>
                  <input
                    type="text"
                    value={letterForm.institutionAddress}
                    onChange={(e) => setLetterForm({ ...letterForm, institutionAddress: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Body Content & Terms */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <FileText className="w-4 h-4 text-blue-600" /> Letter Body &amp; Policies
              </h2>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Opening Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={letterForm.openingText}
                    onChange={(e) => setLetterForm({ ...letterForm, openingText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Offer Validity (Days)
                    </label>
                    <input
                      type="number"
                      value={letterForm.validityDays}
                      onChange={(e) => setLetterForm({ ...letterForm, validityDays: Number(e.target.value) || 21 })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Initial Fee Installment (%)
                    </label>
                    <input
                      type="number"
                      value={letterForm.firstInstallmentPercent}
                      onChange={(e) => setLetterForm({ ...letterForm, firstInstallmentPercent: Number(e.target.value) || 60 })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Closing Congratulatory Note
                  </label>
                  <input
                    type="text"
                    value={letterForm.closingText}
                    onChange={(e) => setLetterForm({ ...letterForm, closingText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Official Seal Configuration */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Shield className="w-4 h-4 text-emerald-600" /> Official Seal Customisation
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Seal Top Arc Text
                  </label>
                  <input
                    type="text"
                    value={letterForm.sealTopText}
                    onChange={(e) => setLetterForm({ ...letterForm, sealTopText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Center Stamp Text
                  </label>
                  <input
                    type="text"
                    value={letterForm.sealCenterText}
                    onChange={(e) => setLetterForm({ ...letterForm, sealCenterText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Seal Bottom Arc Text
                  </label>
                  <input
                    type="text"
                    value={letterForm.sealBottomText}
                    onChange={(e) => setLetterForm({ ...letterForm, sealBottomText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section D: Authorized Signatories */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <UserCheck className="w-4 h-4 text-purple-600" /> Authorized Signatories
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Signatory (Registrar) */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                  <span className="text-xs font-bold text-navy-900 block">Primary Signatory (Registrar)</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Full Name</label>
                    <input
                      type="text"
                      value={letterForm.primarySignatoryName}
                      onChange={(e) => setLetterForm({ ...letterForm, primarySignatoryName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Official Title</label>
                    <input
                      type="text"
                      value={letterForm.primarySignatoryTitle}
                      onChange={(e) => setLetterForm({ ...letterForm, primarySignatoryTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Registry / Office</label>
                    <input
                      type="text"
                      value={letterForm.primarySignatoryOffice}
                      onChange={(e) => setLetterForm({ ...letterForm, primarySignatoryOffice: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Signature Calligraphy</label>
                    <input
                      type="text"
                      value={letterForm.primarySignatureText}
                      onChange={(e) => setLetterForm({ ...letterForm, primarySignatureText: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-serif italic"
                    />
                  </div>
                </div>

                {/* Secondary Signatory (Dean) */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                  <span className="text-xs font-bold text-navy-900 block">Secondary Signatory (Dean)</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Full Name</label>
                    <input
                      type="text"
                      value={letterForm.secondarySignatoryName}
                      onChange={(e) => setLetterForm({ ...letterForm, secondarySignatoryName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Official Title</label>
                    <input
                      type="text"
                      value={letterForm.secondarySignatoryTitle}
                      onChange={(e) => setLetterForm({ ...letterForm, secondarySignatoryTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Faculty / Committee</label>
                    <input
                      type="text"
                      value={letterForm.secondarySignatoryOffice}
                      onChange={(e) => setLetterForm({ ...letterForm, secondarySignatoryOffice: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Signature Calligraphy</label>
                    <input
                      type="text"
                      value={letterForm.secondarySignatureText}
                      onChange={(e) => setLetterForm({ ...letterForm, secondarySignatureText: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-serif italic"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-gold-400" /> Live Offer Letter Preview
                </span>
                <span className="text-[10px] text-slate-400">Auto-updating</span>
              </div>

              <div className="bg-white p-5 rounded-b-2xl border border-slate-200 shadow-sm text-slate-800 text-[10px] space-y-3 font-sans">
                {/* Header Preview */}
                <div className="text-center border-b border-slate-200 pb-2">
                  <img src="/kictamc-logo.png" alt="" className="w-10 h-10 mx-auto object-contain mb-1" />
                  <h3 className="font-serif font-bold text-xs uppercase text-navy-950">
                    {letterForm.institutionName}
                  </h3>
                  <p className="text-[9px] text-amber-700 font-bold">{letterForm.institutionMotto}</p>
                  <p className="text-[9px] text-slate-500">{letterForm.officeName}</p>
                </div>

                {/* Subject Preview */}
                <div className="text-center font-bold text-navy-950 uppercase text-[10.5px] border-b border-slate-900 pb-0.5">
                  {letterForm.title} — 2026/2027 Session
                </div>

                {/* Body Preview */}
                <p className="text-slate-600 line-clamp-3 leading-relaxed">
                  {letterForm.openingText}
                </p>

                {/* Simulated Seal & Signatures */}
                <div className="grid grid-cols-3 gap-2 items-center pt-2 border-t border-slate-200">
                  <div className="text-left">
                    <span className="font-serif italic font-bold text-xs text-navy-900 block">
                      {letterForm.primarySignatureText}
                    </span>
                    <span className="font-bold text-[9px] text-slate-800 block">
                      {letterForm.primarySignatoryName}
                    </span>
                    <span className="text-[8px] text-slate-400 block">{letterForm.primarySignatoryTitle}</span>
                  </div>

                  <div className="flex justify-center">
                    <OfficialSeal
                      size={75}
                      type="admission"
                      sessionYear="2026/2027"
                      topText={letterForm.sealTopText}
                      centerText={letterForm.sealCenterText}
                      bottomText={letterForm.sealBottomText}
                    />
                  </div>

                  <div className="text-right">
                    <span className="font-serif italic font-bold text-xs text-navy-900 block">
                      {letterForm.secondarySignatureText}
                    </span>
                    <span className="font-bold text-[9px] text-slate-800 block">
                      {letterForm.secondarySignatoryName}
                    </span>
                    <span className="text-[8px] text-slate-400 block">{letterForm.secondarySignatoryTitle}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Official Payment Receipt Settings */}
      {activeTab === 'receipt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Section A: Receipt Title & Letterhead */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Receipt className="w-4 h-4 text-emerald-600" /> Receipt Header &amp; Titles
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Receipt Badge Title
                  </label>
                  <input
                    type="text"
                    value={receiptForm.title}
                    onChange={(e) => setReceiptForm({ ...receiptForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cryptographic Voucher Label
                  </label>
                  <input
                    type="text"
                    value={receiptForm.voucherTitle}
                    onChange={(e) => setReceiptForm({ ...receiptForm, voucherTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Issuing Bursary Directorate
                  </label>
                  <input
                    type="text"
                    value={receiptForm.officeName}
                    onChange={(e) => setReceiptForm({ ...receiptForm, officeName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={receiptForm.currencySymbol}
                    onChange={(e) => setReceiptForm({ ...receiptForm, currencySymbol: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bursar Contact Phone
                  </label>
                  <input
                    type="text"
                    value={receiptForm.contactNumber}
                    onChange={(e) => setReceiptForm({ ...receiptForm, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bursar Email
                  </label>
                  <input
                    type="text"
                    value={receiptForm.email}
                    onChange={(e) => setReceiptForm({ ...receiptForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Bursary Signatories & Seal */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Bursar &amp; Auditor Signatories
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                  <span className="text-xs font-bold text-navy-900 block">Bursar / Financial Officer</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Bursar Full Name</label>
                    <input
                      type="text"
                      value={receiptForm.bursarName}
                      onChange={(e) => setReceiptForm({ ...receiptForm, bursarName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Official Title</label>
                    <input
                      type="text"
                      value={receiptForm.bursarTitle}
                      onChange={(e) => setReceiptForm({ ...receiptForm, bursarTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Signature Calligraphy</label>
                    <input
                      type="text"
                      value={receiptForm.bursarSignatureText}
                      onChange={(e) => setReceiptForm({ ...receiptForm, bursarSignatureText: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-serif italic"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                  <span className="text-xs font-bold text-navy-900 block">Internal Auditor Verification</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Auditor Name</label>
                    <input
                      type="text"
                      value={receiptForm.auditorName}
                      onChange={(e) => setReceiptForm({ ...receiptForm, auditorName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">Audit Office</label>
                    <input
                      type="text"
                      value={receiptForm.auditorTitle}
                      onChange={(e) => setReceiptForm({ ...receiptForm, auditorTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section C: Bursary Seal Text */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Shield className="w-4 h-4 text-emerald-600" /> Bursary Stamp Seal Customisation
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Seal Top Arc Text
                  </label>
                  <input
                    type="text"
                    value={receiptForm.sealTextTop}
                    onChange={(e) => setReceiptForm({ ...receiptForm, sealTextTop: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Center Stamp Text
                  </label>
                  <input
                    type="text"
                    value={receiptForm.sealTextCenter}
                    onChange={(e) => setReceiptForm({ ...receiptForm, sealTextCenter: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Seal Bottom Arc Text
                  </label>
                  <input
                    type="text"
                    value={receiptForm.sealTextBottom}
                    onChange={(e) => setReceiptForm({ ...receiptForm, sealTextBottom: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-navy-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Receipt Preview Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> Live Receipt Preview
                </span>
                <span className="text-[10px] text-slate-400">Auto-updating</span>
              </div>

              <div className="bg-white p-5 rounded-b-2xl border border-slate-200 shadow-sm text-slate-800 text-[10px] space-y-3 font-sans">
                {/* Header Preview */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="font-serif font-bold text-xs uppercase text-navy-950">
                      {receiptForm.institutionName}
                    </h3>
                    <p className="text-[9px] text-emerald-800 font-bold">{receiptForm.officeName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[9px]">
                    {receiptForm.title}
                  </span>
                </div>

                {/* Voucher Banner */}
                <div className="bg-navy-900 text-white p-2.5 rounded-lg text-center font-mono font-bold text-amber-400 text-xs">
                  KICTAMC-PAY-487EAC26
                </div>

                {/* Simulated Seal & Signatures */}
                <div className="grid grid-cols-3 gap-2 items-center pt-2 border-t border-slate-200">
                  <div className="text-left">
                    <span className="font-bold text-[9px] text-slate-800 block">
                      {receiptForm.auditorName}
                    </span>
                    <span className="text-[8px] text-slate-400 block">{receiptForm.auditorTitle}</span>
                  </div>

                  <div className="flex justify-center">
                    <OfficialSeal
                      size={75}
                      type="bursary"
                      sessionYear="2026/2027"
                      topText={receiptForm.sealTextTop}
                      centerText={receiptForm.sealTextCenter}
                      bottomText={receiptForm.sealTextBottom}
                    />
                  </div>

                  <div className="text-right">
                    <span className="font-serif italic font-bold text-xs text-navy-900 block">
                      {receiptForm.bursarSignatureText}
                    </span>
                    <span className="font-bold text-[9px] text-slate-800 block">
                      {receiptForm.bursarName}
                    </span>
                    <span className="text-[8px] text-slate-400 block">{receiptForm.bursarTitle}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
