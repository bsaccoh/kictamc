import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Shield,
  Bell,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Clock,
  Search
} from 'lucide-react';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<any[]>('/users/notifications'),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/users/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-navy-900 border-b border-navy-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/kictamc-logo.png"
              alt="KICTAMC Crest"
              className="h-10 w-10 object-contain drop-shadow-sm flex-shrink-0"
            />
            <div>
              <div className="font-bold text-base tracking-wide flex items-center gap-1.5">
                <span>KICTAMC</span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-navy-800 text-gold-400 border border-gold-500/30">
                  SIERRA LEONE
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal">
                Kenema ICT & Management College
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Public Token Verification Link */}
            <Link
              to="/verify-token"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-md hover:bg-navy-800 transition"
            >
              <Search className="w-3.5 h-3.5 text-gold-400" />
              <span>Verify Token</span>
            </Link>

            {user ? (
              <>
                {user.role === 'APPLICANT' ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:text-white rounded-md hover:bg-navy-800 transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gold-400" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <Link
                      to="/tracking"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:text-white rounded-md hover:bg-navy-800 transition"
                    >
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span>Tracking</span>
                    </Link>
                    <Link
                      to="/payment"
                      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:text-white rounded-md hover:bg-navy-800 transition"
                    >
                      <CreditCard className="h-4 w-4 text-gold-400" />
                      <span>Pay Fee</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-gold-300 hover:text-white rounded-md hover:bg-navy-800 transition"
                  >
                    <Shield className="h-4 w-4 text-gold-400" />
                    <span>Staff Portal</span>
                  </Link>
                )}

                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 text-slate-800 overflow-hidden">
                      <div className="p-3.5 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
                        <span className="font-bold text-xs uppercase tracking-wider">
                          Notifications ({notifications.length})
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllReadMutation.mutate()}
                            className="text-[11px] text-gold-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (!n.isRead) markReadMutation.mutate(n.id);
                              }}
                              className={`p-3 text-xs cursor-pointer transition-colors ${
                                n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/70 hover:bg-blue-50'
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold text-slate-900 mb-0.5">
                                <span className="flex items-center gap-1.5">
                                  {n.type === 'SUCCESS' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                  {n.type === 'ERROR' && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-600 leading-relaxed mt-1">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-4 w-[1px] bg-navy-700 mx-1" />

                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <div className="h-8 w-8 rounded-full bg-navy-800 border border-slate-600 flex items-center justify-center text-gold-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <span className="hidden md:inline font-medium text-slate-100">
                    {user.firstName} {user.surname}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-md transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm text-slate-200 hover:text-white font-medium hover:bg-navy-800 rounded-md transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm bg-gold-500 hover:bg-gold-600 text-navy-950 font-semibold rounded-md shadow-sm transition"
                >
                  Apply Now
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
