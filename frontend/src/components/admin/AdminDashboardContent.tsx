import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Coins,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  CreditCard,
  BookOpen,
  FileSpreadsheet,
  Settings,
  UserCheck,
  AlertCircle,
  RotateCw,
  FolderOpen,
  LucideIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import '../../styles/AdminDashboardContent.css';

export interface AdminKPICardData {
  title: string;
  value: number;
  formattedValue?: string;
  trendPercent?: number;
  trendDirection?: 'up' | 'down';
  comparisonLabel?: string;
}

export interface ApplicationTrendPoint {
  month: string;
  totalApplications: number;
  admitted: number;
  rejected: number;
}

export interface FacultyBreakdownItem {
  faculty: string;
  count: number;
  sharePercent: number;
  color?: string;
}

export interface RecentApplicationItem {
  id: string;
  applicationReference: string;
  applicantName: string;
  programme: string;
  status: 'Under Review' | 'Admitted' | 'Paid' | 'Rejected' | 'Pending' | string;
  date: string;
  href?: string;
}

export interface PaymentStatusItem {
  status: string;
  count: number;
  sharePercent: number;
  color?: string;
}

export interface StatSummaryItem {
  value: number;
  trendPercent?: number;
  trendDirection?: 'up' | 'down';
}

export interface RecentActivityItem {
  id: string;
  kind: 'application' | 'payment' | 'admission' | 'document' | 'registration' | string;
  title: string;
  reference?: string;
  timeLabel: string;
  tone?: 'blue' | 'green' | 'emerald' | 'amber' | string;
}

export interface QuickLinkItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
}

export interface AdminDashboardData {
  userName?: string;
  currentDateLabel?: string;
  kpis: {
    totalApplications: AdminKPICardData;
    admittedStudents: AdminKPICardData;
    pendingReview: AdminKPICardData;
    totalPaymentsReceived: AdminKPICardData;
  };
  applicationTrends: ApplicationTrendPoint[];
  applicationsByFaculty: FacultyBreakdownItem[];
  recentApplications: RecentApplicationItem[];
  paymentStatus: PaymentStatusItem[];
  applicationStatistics: {
    totalApplications: StatSummaryItem;
    admittedStudents: StatSummaryItem;
    rejectedApplications: StatSummaryItem;
    pendingReview: StatSummaryItem;
  };
  recentActivity: RecentActivityItem[];
  quickLinks?: QuickLinkItem[];
}

export interface AdminDashboardContentProps {
  data?: AdminDashboardData | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onViewAllApplications?: () => void;
  onViewAllActivity?: () => void;
  onApplicationSelect?: (application: RecentApplicationItem) => void;
  onQuickLinkClick?: (link: QuickLinkItem) => void;
}

const DEFAULT_QUICK_LINKS: QuickLinkItem[] = [
  { id: 'apps', label: 'Manage Applications', icon: 'file', href: '/admin/applications' },
  { id: 'students', label: 'View All Students', icon: 'users', href: '/admin/users' },
  { id: 'programmes', label: 'Academic Programmes', icon: 'book', href: '/admin/courses' },
  { id: 'payments', label: 'Payment Verification', icon: 'credit-card', href: '/admin/payments?status=PENDING_VERIFICATION' },
  { id: 'reports', label: 'Generate Reports', icon: 'chart', href: '/admin/reports' },
  { id: 'settings', label: 'System Settings', icon: 'settings', href: '/admin/document-config' },
];

const QUICK_LINK_ICONS: Record<string, LucideIcon> = {
  file: FileText,
  users: Users,
  book: BookOpen,
  'credit-card': CreditCard,
  chart: FileSpreadsheet,
  settings: Settings,
};

const FACULTY_COLORS = ['#1d4ed8', '#d97706', '#10b981', '#8b5cf6'];
const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Verified: '#10b981',
  Pending: '#f59e0b',
  Rejected: '#ef4444',
  Failed: '#64748b',
};

const chartTooltipStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
  fontSize: '12px',
  color: '#0f172a',
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="admin-empty-state">
      <FolderOpen size={20} className="text-slate-400" />
      <span>{message}</span>
    </div>
  );
}

export const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  data,
  isLoading = false,
  error = null,
  onRetry,
  onViewAllApplications,
  onViewAllActivity,
  onApplicationSelect,
  onQuickLinkClick,
}) => {
  if (error) {
    return (
      <main className="admin-dashboard-content" aria-label="Admin Dashboard">
        <div className="admin-error-panel">
          <div className="admin-error-icon">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2>Failed to load admissions dashboard</h2>
            <p>{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#142d4e] hover:bg-[#1c416d] rounded-lg transition"
              >
                <RotateCw size={14} /> Retry Connection
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (isLoading && !data) {
    return (
      <main className="admin-dashboard-content" aria-label="Admin Dashboard">
        <div className="admin-loading-strip">
          <div className="admin-spinner" />
          <span>Synchronizing live admissions ledger from database...</span>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="admin-dashboard-content" aria-label="Admin Dashboard">
        <EmptyState message="No dashboard data found in database." />
      </main>
    );
  }

  const totalFacultyCount = data.applicationsByFaculty.reduce((sum, item) => sum + item.count, 0);
  const totalPaymentCount = data.paymentStatus.reduce((sum, item) => sum + item.count, 0);

  const statusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('under review')) return 'admin-status-pill admin-status--under-review';
    if (s.includes('admit') || s.includes('approved')) return 'admin-status-pill admin-status--admitted';
    if (s.includes('paid')) return 'admin-status-pill admin-status--paid';
    if (s.includes('reject')) return 'admin-status-pill admin-status--rejected';
    return 'admin-status-pill admin-status--pending';
  };

  const activityBadge = (kind: string, tone?: string) => {
    switch (kind) {
      case 'payment':
        return { Icon: CreditCard, toneClass: 'admin-tone--green' };
      case 'admission':
        return { Icon: CheckCircle2, toneClass: 'admin-tone--emerald' };
      case 'document':
        return { Icon: FileText, toneClass: 'admin-tone--amber' };
      case 'registration':
        return { Icon: UserCheck, toneClass: 'admin-tone--blue' };
      case 'application':
      default:
        return { Icon: FileText, toneClass: tone ? `admin-tone--${tone}` : 'admin-tone--blue' };
    }
  };

  const quickLinksList = data.quickLinks && data.quickLinks.length > 0 ? data.quickLinks : DEFAULT_QUICK_LINKS;

  return (
    <main className="admin-dashboard-content" aria-label="Admin Admissions Dashboard">
      {/* Page Heading & Date Indicator */}
      <header className="admin-page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {data.userName || 'Admin User'}. Here's what's happening at KICTAM College.</p>
        </div>
        <div className="admin-date-picker">
          <Calendar size={15} className="admin-date-icon" />
          <span>{data.currentDateLabel || new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <ChevronDown size={14} className="admin-date-chevron" />
        </div>
      </header>

      {/* 4 KPI Cards Grid */}
      <section className="admin-kpi-grid" aria-label="Key Admissions Performance Indicators">
        {/* Total Applications */}
        <article className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-icon admin-kpi-icon--blue">
              <Users size={22} />
            </span>
            <div className="admin-kpi-copy">
              <span className="admin-kpi-title">{data.kpis.totalApplications.title}</span>
              <div className="admin-kpi-value-row">
                <strong className="admin-kpi-value">{data.kpis.totalApplications.formattedValue || data.kpis.totalApplications.value}</strong>
                {data.kpis.totalApplications.trendPercent !== undefined && (
                  <span className={`admin-kpi-trend admin-kpi-trend--${data.kpis.totalApplications.trendDirection || 'up'}`}>
                    {data.kpis.totalApplications.trendDirection === 'down' ? '↓' : '↑'} {data.kpis.totalApplications.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer">
            <span>{data.kpis.totalApplications.comparisonLabel || 'vs. last semester'}</span>
          </div>
        </article>

        {/* Admitted Students */}
        <article className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-icon admin-kpi-icon--emerald">
              <CheckCircle2 size={22} />
            </span>
            <div className="admin-kpi-copy">
              <span className="admin-kpi-title">{data.kpis.admittedStudents.title}</span>
              <div className="admin-kpi-value-row">
                <strong className="admin-kpi-value">{data.kpis.admittedStudents.formattedValue || data.kpis.admittedStudents.value}</strong>
                {data.kpis.admittedStudents.trendPercent !== undefined && (
                  <span className={`admin-kpi-trend admin-kpi-trend--${data.kpis.admittedStudents.trendDirection || 'up'}`}>
                    {data.kpis.admittedStudents.trendDirection === 'down' ? '↓' : '↑'} {data.kpis.admittedStudents.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer">
            <span>{data.kpis.admittedStudents.comparisonLabel || 'vs. last semester'}</span>
          </div>
        </article>

        {/* Pending Review */}
        <article className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-icon admin-kpi-icon--amber">
              <Clock size={22} />
            </span>
            <div className="admin-kpi-copy">
              <span className="admin-kpi-title">{data.kpis.pendingReview.title}</span>
              <div className="admin-kpi-value-row">
                <strong className="admin-kpi-value">{data.kpis.pendingReview.formattedValue || data.kpis.pendingReview.value}</strong>
                {data.kpis.pendingReview.trendPercent !== undefined && (
                  <span className={`admin-kpi-trend admin-kpi-trend--${data.kpis.pendingReview.trendDirection || 'down'}`}>
                    {data.kpis.pendingReview.trendDirection === 'up' ? '↑' : '↓'} {data.kpis.pendingReview.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer">
            <span>{data.kpis.pendingReview.comparisonLabel || 'vs. last semester'}</span>
          </div>
        </article>

        {/* Total Payments Received */}
        <article className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-icon admin-kpi-icon--purple">
              <Coins size={22} />
            </span>
            <div className="admin-kpi-copy">
              <span className="admin-kpi-title">{data.kpis.totalPaymentsReceived.title}</span>
              <div className="admin-kpi-value-row">
                <strong className="admin-kpi-value">{data.kpis.totalPaymentsReceived.formattedValue || `Le ${data.kpis.totalPaymentsReceived.value.toLocaleString()}`}</strong>
                {data.kpis.totalPaymentsReceived.trendPercent !== undefined && (
                  <span className={`admin-kpi-trend admin-kpi-trend--${data.kpis.totalPaymentsReceived.trendDirection || 'up'}`}>
                    {data.kpis.totalPaymentsReceived.trendDirection === 'down' ? '↓' : '↑'} {data.kpis.totalPaymentsReceived.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="admin-kpi-footer">
            <span>{data.kpis.totalPaymentsReceived.comparisonLabel || 'vs. last semester'}</span>
          </div>
        </article>
      </section>

      {/* Primary Grid: Application Trends (Left) & Applications by Faculty (Right - 330px) */}
      <section className="admin-dashboard-grid admin-dashboard-grid--primary" aria-label="Application trends and faculty breakdown">
        {/* Application Trends Line Chart */}
        <article className="admin-panel admin-panel--trends">
          <div className="admin-panel-heading">
            <div>
              <h2>Application Trends</h2>
            </div>
            <div className="admin-chart-legend">
              <span className="admin-chart-legend-item">
                <span className="admin-chart-legend-dot" style={{ backgroundColor: '#1e3a8a' }} />
                Total Applications
              </span>
              <span className="admin-chart-legend-item">
                <span className="admin-chart-legend-dot" style={{ backgroundColor: '#f59e0b' }} />
                Admitted
              </span>
              <span className="admin-chart-legend-item">
                <span className="admin-chart-legend-dot" style={{ backgroundColor: '#ef4444' }} />
                Rejected
              </span>
            </div>
          </div>
          {data.applicationTrends.length > 0 ? (
            <div className="admin-line-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.applicationTrends} margin={{ top: 12, right: 14, left: -14, bottom: 0 }}>
                  <CartesianGrid stroke="#e8eef6" strokeDasharray="3 4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#718198', fontSize: 11 }} axisLine={{ stroke: '#d9e2ee' }} tickLine={false} />
                  <YAxis tick={{ fill: '#718198', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(val: any, name: any) => [`${val} Applications`, name]} />
                  <Line type="monotone" dataKey="totalApplications" name="Total Applications" stroke="#1e3a8a" strokeWidth={2.2} dot={{ r: 3, fill: '#1e3a8a' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="admitted" name="Admitted" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                  <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No trend records available." />
          )}
        </article>

        {/* Applications by Faculty Donut Chart */}
        <article className="admin-panel admin-panel--faculty">
          <div className="admin-panel-heading">
            <div>
              <h2>Applications by Faculty</h2>
            </div>
          </div>
          {data.applicationsByFaculty.length > 0 && totalFacultyCount > 0 ? (
            <div className="admin-donut-body">
              <div className="admin-donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.applicationsByFaculty}
                      dataKey="count"
                      nameKey="faculty"
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {data.applicationsByFaculty.map((item, index) => (
                        <Cell key={item.faculty} fill={item.color ?? FACULTY_COLORS[index % FACULTY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value: any, name: any) => [`${value} applications`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="admin-donut-center">
                  <strong>{totalFacultyCount.toLocaleString()}</strong>
                  <span>Total Applications</span>
                </div>
              </div>
              <div className="admin-donut-legend">
                {data.applicationsByFaculty.map((item, index) => (
                  <div className="admin-donut-legend-item" key={item.faculty}>
                    <span
                      className="admin-donut-swatch"
                      style={{ backgroundColor: item.color ?? FACULTY_COLORS[index % FACULTY_COLORS.length] }}
                    />
                    <div>
                      <strong>{item.faculty}</strong>
                      <span>{item.count} ({item.sharePercent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="No faculty breakdown data available." />
          )}
        </article>
      </section>

      {/* Secondary Grid: Recent Applications (Left) & Payment Status (Right - 330px) */}
      <section className="admin-dashboard-grid admin-dashboard-grid--secondary" aria-label="Recent applications and payment status">
        {/* Recent Applications Table */}
        <article className="admin-panel admin-panel--applications">
          <div className="admin-panel-heading admin-panel-heading--row">
            <div>
              <h2>Recent Applications</h2>
            </div>
            <button
              className="admin-text-action"
              type="button"
              onClick={onViewAllApplications}
            >
              View All <ChevronRight size={15} />
            </button>
          </div>
          {data.recentApplications.length > 0 ? (
            <div className="admin-table-scroll">
              <table className="admin-applications-table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Applicant Name</th>
                    <th scope="col">Programme</th>
                    <th scope="col">Status</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.slice(0, 5).map((app, idx) => (
                    <tr key={app.id}>
                      <td className="text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td>
                        {app.href ? (
                          <a className="admin-reference-link" href={app.href}>
                            {app.applicantName}
                          </a>
                        ) : (
                          <button
                            className="admin-table-link"
                            type="button"
                            onClick={() => onApplicationSelect?.(app)}
                          >
                            <span className="admin-applicant-name">{app.applicantName}</span>
                          </button>
                        )}
                      </td>
                      <td className="admin-programme-cell" title={app.programme}>
                        {app.programme}
                      </td>
                      <td>
                        <span className={statusClass(app.status)}>
                          {app.status}
                        </span>
                      </td>
                      <td className="admin-date-cell">{app.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No recent applications recorded." />
          )}
        </article>

        {/* Payment Status Donut Chart (Compact 330px panel with align-self: start) */}
        <article className="admin-panel admin-panel--status">
          <div className="admin-panel-heading">
            <div>
              <h2>Payment Status</h2>
            </div>
          </div>
          {data.paymentStatus.length > 0 && totalPaymentCount > 0 ? (
            <div className="admin-donut-body">
              <div className="admin-donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.paymentStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {data.paymentStatus.map((item) => (
                        <Cell key={item.status} fill={item.color ?? PAYMENT_STATUS_COLORS[item.status] ?? '#10b981'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value: any, name: any) => [`${value} payments`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="admin-donut-center">
                  <strong>{totalPaymentCount.toLocaleString()}</strong>
                  <span>Total Payments</span>
                </div>
              </div>
              <div className="admin-donut-legend">
                {data.paymentStatus.map((item) => (
                  <div className="admin-donut-legend-item" key={item.status}>
                    <span
                      className="admin-donut-swatch"
                      style={{ backgroundColor: item.color ?? PAYMENT_STATUS_COLORS[item.status] ?? '#10b981' }}
                    />
                    <div>
                      <strong>{item.status}</strong>
                      <span>{item.count} ({item.sharePercent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="No payment status data available." />
          )}
        </article>
      </section>

      {/* Tertiary Grid: Application Statistics & Quick Links (Left) + Recent Activity (Right - 330px) */}
      <section className="admin-dashboard-grid admin-dashboard-grid--tertiary" aria-label="Application statistics, quick links and recent activity">
        {/* Left Column: Application Statistics + Quick Links */}
        <div className="flex flex-col gap-4">
          {/* Application Statistics Summary Card */}
          <article className="admin-stats-summary-card">
            <h3 className="admin-stats-summary-heading">Application Statistics</h3>
            <div className="admin-stats-summary-grid">
              {/* Stat 1: Total Applications */}
              <div className="admin-stat-summary-item">
                <span className="admin-stat-summary-icon admin-stat-summary-icon--gold">
                  <Users size={18} />
                </span>
                <div className="admin-stat-summary-info">
                  <strong>{data.applicationStatistics.totalApplications.value}</strong>
                  <span>Total Applications</span>
                  {data.applicationStatistics.totalApplications.trendPercent !== undefined && (
                    <small className="text-emerald-600">
                      ↑ {data.applicationStatistics.totalApplications.trendPercent}%
                    </small>
                  )}
                </div>
              </div>

              {/* Stat 2: Admitted Students */}
              <div className="admin-stat-summary-item">
                <span className="admin-stat-summary-icon admin-stat-summary-icon--emerald">
                  <CheckCircle2 size={18} />
                </span>
                <div className="admin-stat-summary-info">
                  <strong>{data.applicationStatistics.admittedStudents.value}</strong>
                  <span>Admitted Students</span>
                  {data.applicationStatistics.admittedStudents.trendPercent !== undefined && (
                    <small className="text-emerald-600">
                      ↑ {data.applicationStatistics.admittedStudents.trendPercent}%
                    </small>
                  )}
                </div>
              </div>

              {/* Stat 3: Rejected Applications */}
              <div className="admin-stat-summary-item">
                <span className="admin-stat-summary-icon admin-stat-summary-icon--red">
                  <AlertCircle size={18} />
                </span>
                <div className="admin-stat-summary-info">
                  <strong>{data.applicationStatistics.rejectedApplications.value}</strong>
                  <span>Rejected Applications</span>
                  {data.applicationStatistics.rejectedApplications.trendPercent !== undefined && (
                    <small className="text-red-500">
                      ↓ {data.applicationStatistics.rejectedApplications.trendPercent}%
                    </small>
                  )}
                </div>
              </div>

              {/* Stat 4: Pending Review */}
              <div className="admin-stat-summary-item">
                <span className="admin-stat-summary-icon admin-stat-summary-icon--amber">
                  <Clock size={18} />
                </span>
                <div className="admin-stat-summary-info">
                  <strong>{data.applicationStatistics.pendingReview.value}</strong>
                  <span>Pending Review</span>
                  {data.applicationStatistics.pendingReview.trendPercent !== undefined && (
                    <small className="text-amber-600">
                      ↓ {data.applicationStatistics.pendingReview.trendPercent}%
                    </small>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Quick Links Card */}
          <article className="admin-panel admin-panel--quick-links">
            <div className="admin-panel-heading">
              <div>
                <h2>Quick Links</h2>
              </div>
            </div>
            <div className="admin-quick-links-grid">
              {quickLinksList.map((link) => {
                const IconComponent = QUICK_LINK_ICONS[link.icon ?? 'file'] || FileText;
                const linkContent = (
                  <>
                    <span className="admin-quick-link-icon">
                      <IconComponent size={16} />
                    </span>
                    <span className="admin-quick-link-copy">
                      <strong>{link.label}</strong>
                    </span>
                    <ChevronRight className="admin-quick-link-chevron" size={15} />
                  </>
                );

                return link.href ? (
                  <a className="admin-quick-link-item" href={link.href} key={link.id}>
                    {linkContent}
                  </a>
                ) : (
                  <button
                    className="admin-quick-link-item"
                    key={link.id}
                    type="button"
                    onClick={() => onQuickLinkClick?.(link)}
                  >
                    {linkContent}
                  </button>
                );
              })}
            </div>
          </article>
        </div>

        {/* Right Column: Recent Activity (Compact 330px panel) */}
        <article className="admin-panel admin-panel--activity">
          <div className="admin-panel-heading admin-panel-heading--row">
            <div>
              <h2>Recent Activity</h2>
            </div>
            <button
              className="admin-text-action"
              type="button"
              onClick={onViewAllActivity || onViewAllApplications}
            >
              View All <ChevronRight size={15} />
            </button>
          </div>
          {data.recentActivity.length > 0 ? (
            <div className="admin-activity-list">
              {data.recentActivity.map((activity) => {
                const { Icon, toneClass } = activityBadge(activity.kind, activity.tone);
                return (
                  <div className="admin-activity-item" key={activity.id}>
                    <span className={`admin-activity-icon ${toneClass}`}>
                      <Icon size={16} />
                    </span>
                    <div className="admin-activity-copy">
                      <strong>{activity.title}</strong>
                      {activity.reference && (
                        <span className="admin-activity-reference">{activity.reference}</span>
                      )}
                      <time>{activity.timeLabel}</time>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState message="No recent activity logged." />
          )}
        </article>
      </section>
    </main>
  );
};
