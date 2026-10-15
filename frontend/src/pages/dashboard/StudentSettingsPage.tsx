import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Settings,
  Lock,
  ShieldCheck,
  Bell,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const StudentSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preference state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/auth/change-password', data),
    onSuccess: () => {
      setSuccessMsg('Your security password has been updated successfully.');
      setErrorMsg(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update password. Please check your current password.');
      setSuccessMsg(null);
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg('New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-navy-950 font-serif">
          Account Settings & Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your credentials, verify contact channels, and configure admissions notification alerts.
        </p>
      </div>

      {/* Contact Verification Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-navy-700" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
            Contact Verification Badges
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-950">Email Address</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
            </div>
            {user?.isEmailVerified ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Verified
              </span>
            ) : (
              <Link to="/verify-contact">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200">
                  Verify Now →
                </span>
              </Link>
            )}
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-950">Mobile Phone</p>
                <p className="text-[11px] text-slate-500">{user?.phone || 'Not recorded'}</p>
              </div>
            </div>
            {user?.isPhoneVerified ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Verified
              </span>
            ) : (
              <Link to="/verify-contact">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200">
                  Verify Now →
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-navy-700" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
            Change Password
          </h2>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (min 8 chars)</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-navy-600 focus:border-navy-600"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={changePasswordMutation.isPending}
            className="text-xs py-2 bg-navy-600 hover:bg-navy-700 font-semibold"
          >
            {changePasswordMutation.isPending ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-navy-700" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
            Admissions Alert Preferences
          </h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-navy-950">Email Status Alerts</p>
              <p className="text-[11px] text-slate-500">
                Receive notifications when your documents are verified or application decision changes.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 text-navy-600 rounded border-slate-300 focus:ring-navy-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-navy-950">SMS Instant Notifications</p>
              <p className="text-[11px] text-slate-500">
                Receive SMS alerts for fee verification tokens and admission offers to your Sierra Leone line.
              </p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="h-4 w-4 text-navy-600 rounded border-slate-300 focus:ring-navy-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
