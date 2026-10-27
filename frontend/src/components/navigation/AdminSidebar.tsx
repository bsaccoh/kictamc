import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  FolderCheck,
  CheckSquare,
  CreditCard,
  BookOpen,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  Bell,
  Users,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  GraduationCap,
  Building2,
  Layers
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { can } from '../../lib/permissions';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [adminExpanded, setAdminExpanded] = useState(true);
  const [financeExpanded, setFinanceExpanded] = useState(true);

  // Check if current route is part of Admin section
  const isAdminActive =
    location.pathname === '/admin/module' ||
    location.pathname.startsWith('/admin/admissions') ||
    location.pathname.startsWith('/admin/applications') ||
    location.pathname.startsWith('/admin/documents') ||
    location.pathname.startsWith('/admin/faculties') ||
    location.pathname.startsWith('/admin/departments') ||
    location.pathname.startsWith('/admin/courses') ||
    location.pathname.startsWith('/admin/fees') ||
    location.pathname.startsWith('/admin/academic-years');

  // Fetch admin stats for pending badges
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<any>('/admin/stats'),
    enabled: !!user && user.role !== 'APPLICANT',
    refetchInterval: 30000,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = can(user, 'academic-years:manage');
  const isAdmissions = can(user, 'applications:review');
  const isFinance = can(user, 'payments:write');

  const canViewApplications = can(user, 'applications:read');
  const canViewFinance = can(user, 'payments:read');
  const canViewAcademics = can(user, 'academics:read');
  const canViewAdminSection = isAdmissions || canViewAcademics || canViewApplications;
  const canViewAuditLogs = can(user, 'audit:view');
  const canViewUsers = can(user, 'users:manage');
  const canViewSettings = can(user, 'settings:manage');
  const canViewDocumentConfig = can(user, 'document-config:manage');

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#10223B] border-r border-[#1B2F4E] select-none text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1B2F4E] flex-shrink-0">
        <NavLink to="/admin" className="flex items-center gap-3 overflow-hidden">
          <img
            src="/kictamc-logo.png"
            alt="KICTAMC Crest"
            className="w-9 h-9 object-contain flex-shrink-0 drop-shadow-sm"
          />
          {!collapsed && (
            <div className="truncate">
              <span className="font-bold text-sm tracking-wider text-white block leading-tight">
                KICTAMC
              </span>
              <span className="text-[10px] text-slate-400 block truncate leading-tight mt-0.5">
                Kenema ICT & Management College
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggle}
          className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links with RBAC */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
        {/* 1. Dashboard */}
        <NavLink
          to="/admin"
          end
          onClick={() => onMobileClose()}
          title={collapsed ? 'Dashboard' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#1D3D6F] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0 text-slate-400" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* 2. Admin (Admissions & Academic Management) */}
        {canViewAdminSection && (
          <div>
            {!collapsed ? (
              <div>
                <button
                  type="button"
                  onClick={() => setAdminExpanded(!adminExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isAdminActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Admin</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {stats?.underReview > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                        {stats.underReview}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        adminExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {adminExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-white/10 ml-4 my-1">
                    {/* Admin Hub */}
                    <NavLink
                      to="/admin/module"
                      end
                      onClick={() => onMobileClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                          isActive
                            ? 'text-white font-semibold bg-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Admin Hub</span>
                    </NavLink>

                    {/* 1. Admission Dashboard */}
                    {isAdmissions && (
                      <NavLink
                        to="/admin/admissions"
                        end
                        onClick={() => onMobileClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            isActive
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <FolderCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Admission Dashboard</span>
                      </NavLink>
                    )}

                    {/* 2. Applications */}
                    {canViewApplications && (
                      <NavLink
                        to="/admin/applications"
                        end
                        onClick={() => onMobileClose()}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            isActive && location.search === ''
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>Applications</span>
                        </div>
                        {stats?.totalApplications > 0 && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {stats.totalApplications}
                          </span>
                        )}
                      </NavLink>
                    )}

                    {/* 3. Admission Review */}
                    {isAdmissions && (
                      <NavLink
                        to="/admin/applications?status=UNDER_REVIEW"
                        onClick={() => onMobileClose()}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            location.search.includes('UNDER_REVIEW')
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>Admission Review</span>
                        </div>
                        {stats?.underReview > 0 && (
                          <span className="px-1.5 py-0.2 bg-blue-400/20 text-blue-300 rounded font-bold text-[9px]">
                            {stats.underReview}
                          </span>
                        )}
                      </NavLink>
                    )}

                    {/* 4. Applicant Documents */}
                    {isAdmissions && (
                      <NavLink
                        to="/admin/documents"
                        onClick={() => onMobileClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            isActive
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <FolderCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Applicant Documents</span>
                      </NavLink>
                    )}

                    {/* 5. Faculties */}
                    {canViewAcademics && (
                      <NavLink
                        to="/admin/faculties"
                        onClick={() => onMobileClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            isActive
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Faculties</span>
                      </NavLink>
                    )}

                    {/* 6. Departments */}
                    {canViewAcademics && (
                      <NavLink
                        to="/admin/departments"
                        onClick={() => onMobileClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            isActive
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Departments</span>
                      </NavLink>
                    )}

                    {/* 7. Courses */}
                    {canViewAcademics && (
                      <NavLink
                        to="/admin/courses"
                        onClick={() => onMobileClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            isActive
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Courses &amp; Programmes</span>
                      </NavLink>
                    )}

                    {/* 8. Admission Years / Intakes */}
                    {isAdmin && (
                      <NavLink
                        to="/admin/academic-years"
                        onClick={() => onMobileClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            isActive
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Admission Years / Intakes</span>
                      </NavLink>
                    )}

                    {/* 9. Application Fees */}
                    {(isFinance || isAdmissions) && (
                      <NavLink
                        to="/admin/fees"
                        onClick={() => onMobileClose()}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            isActive
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <DollarSign className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Application Fees</span>
                      </NavLink>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/admin/module"
                onClick={() => onMobileClose()}
                title="Admin"
                className={`flex items-center justify-center p-2.5 rounded-lg text-xs font-medium transition-all ${
                  isAdminActive
                    ? 'bg-[#1D3D6F] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
              </NavLink>
            )}
          </div>
        )}

        {/* 3. Finance & Payments */}
        {canViewFinance && (
          <div>
            {!collapsed ? (
              <div>
                <button
                  type="button"
                  onClick={() => setFinanceExpanded(!financeExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Finance & Payments</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {stats?.paymentsPendingVerification > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        {stats.paymentsPendingVerification}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        financeExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {financeExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-white/10 ml-4 my-1">
                    <NavLink
                      to="/admin/finance"
                      onClick={() => onMobileClose()}
                      className={({ isActive }) =>
                        `block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                          isActive
                            ? 'text-white font-semibold bg-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      Finance Dashboard
                    </NavLink>
                    <NavLink
                      to="/admin/payments?status=PENDING_VERIFICATION"
                      onClick={() => onMobileClose()}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                          location.search.includes('PENDING_VERIFICATION')
                            ? 'text-white font-semibold bg-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <span>Pending Verification</span>
                      {stats?.paymentsPendingVerification > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-bold text-[9px]">
                          {stats.paymentsPendingVerification}
                        </span>
                      )}
                    </NavLink>
                    <NavLink
                      to="/admin/payments?status=PAID"
                      onClick={() => onMobileClose()}
                      className={({ isActive }) =>
                        `block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                          location.search.includes('PAID')
                            ? 'text-white font-semibold bg-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      Approved & Paid
                    </NavLink>
                    <NavLink
                      to="/admin/payments"
                      onClick={() => onMobileClose()}
                      className={({ isActive }) =>
                        `block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                          location.pathname === '/admin/payments' && !location.search
                            ? 'text-white font-semibold bg-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      All Transactions
                    </NavLink>
                    <NavLink
                      to="/verify-token"
                      onClick={() => onMobileClose()}
                      className={({ isActive }) =>
                        `block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                          isActive
                            ? 'text-white font-semibold bg-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      Receipts & Tokens
                    </NavLink>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/admin/payments"
                onClick={() => onMobileClose()}
                title="Finance & Payments"
                className={({ isActive }) =>
                  `flex items-center justify-center p-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1D3D6F] text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <CreditCard className="w-4 h-4" />
              </NavLink>
            )}
          </div>
        )}

        {/* 9. Reports & Exports */}
        <NavLink
          to="/admin/reports"
          onClick={() => onMobileClose()}
          title={collapsed ? 'Reports & Exports' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#1D3D6F] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <FileSpreadsheet className="w-4 h-4 flex-shrink-0 text-slate-400" />
          {!collapsed && <span>Reports & Exports</span>}
        </NavLink>

        {/* 10. Notifications */}
        <NavLink
          to="/admin/notifications"
          onClick={() => onMobileClose()}
          title={collapsed ? 'Notifications' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#1D3D6F] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Bell className="w-4 h-4 flex-shrink-0 text-slate-400" />
          {!collapsed && <span>Notifications</span>}
        </NavLink>

        {/* 11. User & Staff Management */}
        {canViewUsers && (
          <NavLink
            to="/admin/users"
            onClick={() => onMobileClose()}
            title={collapsed ? 'User & Staff Management' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#1D3D6F] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Users className="w-4 h-4 flex-shrink-0 text-slate-400" />
            {!collapsed && <span>User & Staff Management</span>}
          </NavLink>
        )}

        {/* 12. Audit Logs */}
        {canViewAuditLogs && (
          <NavLink
            to="/admin/audit"
            onClick={() => onMobileClose()}
            title={collapsed ? 'Audit Logs' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#1D3D6F] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-slate-400" />
            {!collapsed && <span>Audit Logs</span>}
          </NavLink>
        )}

        {/* 13. Document & Letter Configuration */}
        {canViewDocumentConfig && (
          <NavLink
            to="/admin/document-config"
            onClick={() => onMobileClose()}
            title={collapsed ? 'Document & Letter Config' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#1D3D6F] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <FileText className="w-4 h-4 flex-shrink-0 text-slate-400" />
            {!collapsed && <span>Document &amp; Letter Config</span>}
          </NavLink>
        )}

        {/* 14. System Settings (Super Admin Only) */}
        {canViewSettings && (
          <NavLink
            to="/admin/settings"
            onClick={() => onMobileClose()}
            title={collapsed ? 'System Settings' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#1D3D6F] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Settings className="w-4 h-4 flex-shrink-0 text-slate-400" />
            {!collapsed && <span>System Settings</span>}
          </NavLink>
        )}

        {/* 14. Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-slate-400" />
          {!collapsed && <span className="flex-1 text-left truncate">Logout</span>}
        </button>
      </nav>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
