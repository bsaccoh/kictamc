import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Shield,
  FileCheck,
  Save,
  CheckCircle2,
  Database,
  Server,
  Lock,
  Mail,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminSettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    institutionName: 'Kenema ICT & Management College',
    acronym: 'KICTAMC',
    campusAddress: '19 Bockarie Gbay Street Kenema, Eastern Province, Sierra Leone',
    registrarEmail: 'admissions@kictamc.edu.sl',
    financeHotline: '+23272808080',
    defaultApplicationFee: '150',
    currencyCode: 'SLE (Leones)',
    maxFileSizeMb: '5',
    allowedFileTypes: 'PDF, JPG, PNG',
    sessionTimeoutMinutes: '60',
    requireTwoFactor: false,
    autoGenerateToken: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
            System Administration
          </span>
          <h1 className="text-xl font-bold text-navy-950 font-serif">
            Portal Configuration & System Parameters
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure institutional identities, admission policies, fees, and operational security settings.
          </p>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully.</span>
          </div>
        )}
      </div>

      {/* System Engine Health Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950 mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-navy-700" />
          Infrastructure & Database Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <div>
              <p className="font-bold text-navy-950">PostgreSQL Database</p>
              <p className="text-[11px] text-slate-500 font-mono">127.0.0.1:5432 (kictamc_portal)</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <div>
              <p className="font-bold text-navy-950">API Backend Gateway</p>
              <p className="text-[11px] text-slate-500 font-mono">Port 5000 (Node.js/Express)</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-navy-950">Cryptographic Tokens</p>
              <p className="text-[11px] text-slate-500 font-mono">SHA-256 HMAC Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Institutional Identity Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold-600" />
            Institutional Identity & Contacts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Full Name</label>
              <input
                type="text"
                value={settings.institutionName}
                onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Acronym / Short Code</label>
              <input
                type="text"
                value={settings.acronym}
                onChange={(e) => setSettings({ ...settings, acronym: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kenema Campus Address</label>
            <input
              type="text"
              value={settings.campusAddress}
              onChange={(e) => setSettings({ ...settings, campusAddress: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registrar / Admissions Email</label>
              <input
                type="email"
                value={settings.registrarEmail}
                onChange={(e) => setSettings({ ...settings, registrarEmail: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Finance Office Hotline</label>
              <input
                type="text"
                value={settings.financeHotline}
                onChange={(e) => setSettings({ ...settings, financeHotline: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>
          </div>
        </div>

        {/* Admissions & Finance Parameters */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950 pb-2 border-b border-slate-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-gold-600" />
            Admissions & Fees Policy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Application Fee (NLe)</label>
              <input
                type="number"
                value={settings.defaultApplicationFee}
                onChange={(e) => setSettings({ ...settings, defaultApplicationFee: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Upload File Size (MB)</label>
              <input
                type="number"
                value={settings.maxFileSizeMb}
                onChange={(e) => setSettings({ ...settings, maxFileSizeMb: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Allowed File Formats</label>
              <input
                type="text"
                value={settings.allowedFileTypes}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoGenerateToken}
                onChange={(e) => setSettings({ ...settings, autoGenerateToken: e.target.checked })}
                className="h-4 w-4 text-navy-600 rounded border-slate-300 focus:ring-navy-500"
              />
              <div>
                <p className="text-xs font-semibold text-navy-950">
                  Auto-Issue Cryptographic Payment Token on Verification
                </p>
                <p className="text-[11px] text-slate-500">
                  When a finance officer verifies a bank slip, automatically generate a unique verification token for public validation.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Security Policies */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold-600" />
            Security & Session Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Inactivity Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Logging Level</label>
              <select
                disabled
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600"
              >
                <option>ALL_MUTATIONS (Strict Institutional Compliance)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            className="text-xs py-2.5 px-6 bg-navy-600 hover:bg-navy-700 flex items-center gap-2 font-semibold"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
