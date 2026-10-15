import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Activity,
  Receipt,
  Award,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch unread notifications count
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<any[]>('/users/notifications'),
    enabled: !!user,
  });

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Application', path: '/apply', icon: FileText },
    { label: 'Application Fee & Payments', path: '/payment', icon: CreditCard },
    { label: 'Application Tracking', path: '/tracking', icon: Activity },
    { label: 'Receipts & Payment Token', path: '/receipt', icon: Receipt },
    { label: 'Admission Letter', path: '/admission-letter', icon: Award },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotifs > 0 ? String(unreadNotifs) : '2',
      badgeColor: 'bg-red-500 text-white',
    },
    { label: 'Help & Support', path: '/support', icon: HelpCircle },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#10223B] border-r border-[#1B2F4E] select-none text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1B2F4E] flex-shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
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

        {/* Toggle Collapse Button on Desktop */}
        <button
          onClick={onToggle}
          className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Close Button on Mobile Drawer */}
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onMobileClose()}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#1D3D6F] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500 text-white ml-auto flex-shrink-0 min-w-4 text-center">
                  {item.badge}
                </span>
              )}

              {collapsed && item.badge && (
                <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2" />
              )}
            </NavLink>
          );
        })}

        {/* Logout Menu Item */}
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
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out print:hidden ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
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
