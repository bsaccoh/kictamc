import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import {
  FileText,
  CreditCard,
  BookOpen,
  Calendar,
  Users,
  ShieldAlert,
  BarChart3,
  CheckSquare,
} from 'lucide-react';

export const StaffLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Verifying staff credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role === 'APPLICANT') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Admin Dashboard', path: '/admin', icon: BarChart3, roles: ['SYSTEM_ADMIN', 'ADMISSIONS_OFFICER', 'FINANCE_OFFICER'] },
    { label: 'Applications', path: '/admin/applications', icon: FileText, roles: ['SYSTEM_ADMIN', 'ADMISSIONS_OFFICER'] },
    { label: 'Document Verification', path: '/admin/documents', icon: CheckSquare, roles: ['SYSTEM_ADMIN', 'ADMISSIONS_OFFICER'] },
    { label: 'Payments Ledger', path: '/admin/payments', icon: CreditCard, roles: ['SYSTEM_ADMIN', 'FINANCE_OFFICER'] },
    { label: 'Academic Courses', path: '/admin/courses', icon: BookOpen, roles: ['SYSTEM_ADMIN'] },
    { label: 'Academic Years', path: '/admin/academic-years', icon: Calendar, roles: ['SYSTEM_ADMIN'] },
    { label: 'Staff Management', path: '/admin/users', icon: Users, roles: ['SYSTEM_ADMIN'] },
    { label: 'Audit Logs', path: '/admin/audit', icon: ShieldAlert, roles: ['SYSTEM_ADMIN'] },
  ];

  const permittedNav = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      {/* Staff Secondary Nav Header */}
      <div className="bg-navy-800 border-b border-navy-700 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-gold-400">
              <span>KICTAMC Administrative Console</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-slate-300 font-medium lowercase">
                Role: <span className="text-white font-semibold">{user.role}</span>
              </span>
            </div>
            <div className="text-xs text-slate-300">
              Logged in as <span className="font-semibold text-white">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {permittedNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-navy-950 text-gold-400 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
