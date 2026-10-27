import React from 'react';
import {
  FileText,
  FolderCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ChevronRight,
  FolderOpen,
  RotateCw,
  Edit,
  FileSpreadsheet,
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
import '../../styles/AdmissionsDashboardContent.css';

export interface AdmissionsKPIData {
  title: string;
  value: number;
  formattedValue?: string;
  trendPercent?: number;
  trendDirection?: 'up' | 'down';
  comparisonLabel?: string;
}

export interface AdmissionsTrendPoint {
  month: string;
  submitted: number;
  admitted: number;
  rejected: number;
}

export interface AdmissionStatusItem {
  status: string;
  code: string;
  count: number;
  sharePercent: number;
  color?: string;
}

export interface ReviewQueueItem {
  id: string;
  applicationReference: string;
  applicantName: string;
  programme: string;
  status: string;
  rawStatus: string;
  documentSummary: string;
  date: string;
  href?: string;
}

export interface UpcomingDeadlineToItem {
  id: string;
  name: string;
  academicYear: string;
  deadlineFormatted: string;
  daysRemaining: number;
  status: string;
  applicationsCount: number;
}

export interface IncompleteDocumentItem {
  id: string;
  applicationId: string;
  documentType: string;
  originalFilename: string;
  applicantName: string;
  applicationReference: string;
  programme: string;
  timeAgo: string;
}

export interface RecentActivityItem {
  id: string;
  kind: string;
  title: string;
  reference?: string;
  timeLabel: string;
  tone?: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  href?: string;
}

export interface AdmissionsDashboardData {
  userName?: string;
  currentDateLabel?: string;
  kpis: {
    applicationsRequiringReview: AdmissionsKPIData;
    incompleteDocuments: AdmissionsKPIData;
    admittedStudents: AdmissionsKPIData;
    actionRequired: AdmissionsKPIData;
  };
  admissionsTrends: AdmissionsTrendPoint[];
  admissionStatusDistribution: AdmissionStatusItem[];
  reviewQueue: ReviewQueueItem[];
  upcomingDeadlines: UpcomingDeadlineToItem[];
  incompleteDocumentsList: IncompleteDocumentItem[];
  recentActivity: RecentActivityItem[];
  quickActions?: QuickActionItem[];
}

export interface AdmissionsDashboardContentProps {
  data?: AdmissionsDashboardData | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onViewAllReviewQueue?: () => void;
  onViewAllDocuments?: () => void;
  onViewAllActivity?: () => void;
  onApplicationSelect?: (application: ReviewQueueItem) => void;
  onQuickActionClick?: (action: QuickActionItem) => void;
}

const DEFAULT_QUICK_ACTIONS: QuickActionItem[] = [
  { id: 'review', label: 'Review Applications', description: 'Review candidates awaiting admissions decision', icon: 'file', href: '/admin/applications?status=UNDER_REVIEW' },
  { id: 'documents', label: 'Verify Documents', description: 'Inspect candidate certificates and exam results', icon: 'folder', href: '/admin/documents' },
  { id: 'corrections', label: 'Request Corrections', description: 'Notify candidates of illegible or missing files', icon: 'edit', href: '/admin/applications?status=ACTION_REQUIRED' },
  { id: 'decisions', label: 'Admissions Decisions', description: 'Batch accept, shortlist or reject candidates', icon: 'check', href: '/admin/applications' },
  { id: 'reports', label: 'Admission Reports', description: 'Export enrolment lists and admission tariffs', icon: 'chart', href: '/admin/reports' },
];

const ACTION_ICONS: Record<string, LucideIcon> = {
  file: FileText,
  folder: FolderCheck,
  edit: Edit,
  check: CheckCircle2,
  chart: FileSpreadsheet,
};

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#10b981',
  UNDER_REVIEW: '#1d4ed8',
  SUBMITTED: '#8b5cf6',
  ACTION_REQUIRED: '#f59e0b',
  REJECTED: '#ef4444',
};

const chartTooltipStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
  fontSize: '12px',
  color: '#0f172a',
};

export const AdmissionsDashboardContent: React.FC<AdmissionsDashboardContentProps> = ({
  data,
  isLoading = false,
  error = null,
  onRetry,
  onViewAllReviewQueue,
  onViewAllDocuments,
  onViewAllActivity,
  onApplicationSelect,
  onQuickActionClick,
}) => {
  if (error) {
    return (
      <main className="admissions-dashboard-content" aria-label="Admissions Dashboard">
        <div className="bg-white border border-red-200 rounded-xl p-6 max-w-lg mx-auto shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-red-600">
            <AlertCircle size={22} />
            <h2 className="text-base font-bold text-slate-800">Failed to load admissions dashboard</h2>
          </div>
          <p className="text-xs text-slate-600 mb-4">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#142d4e] hover:bg-[#1c416d] rounded-lg transition"
            >
              <RotateCw size={14} /> Retry Connection
            </button>
          )}
        </div>
      </main>
    );
  }

  if (isLoading && !data) {
    return (
      <main className="admissions-dashboard-content" aria-label="Admissions Dashboard">
        <div className="admissions-loading-strip">
          <div className="admissions-spinner" />
          <span>Synchronizing live admissions records from database...</span>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="admissions-dashboard-content" aria-label="Admissions Dashboard">
        <div className="admissions-empty-state">
          <FolderOpen size={20} className="text-slate-400" />
          <span>No admissions records found in database.</span>
        </div>
      </main>
    );
  }

  const totalStatusCount = data.admissionStatusDistribution.reduce((sum, item) => sum + item.count, 0);

  const statusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('action')) return 'admissions-status-pill admissions-status--action';
    if (s.includes('review')) return 'admissions-status-pill admissions-status--review';
    if (s.includes('admit') || s.includes('approved')) return 'admissions-status-pill admissions-status--approved';
    if (s.includes('new') || s.includes('submitted')) return 'admissions-status-pill admissions-status--new';
    if (s.includes('reject')) return 'admissions-status-pill admissions-status--rejected';
    return 'admissions-status-pill admissions-status--review';
  };

  const quickActionsList = data.quickActions && data.quickActions.length > 0 ? data.quickActions : DEFAULT_QUICK_ACTIONS;

  return (
    <main className="admissions-dashboard-content" aria-label="Admissions Officer Dashboard">
      {/* Header */}
      <header className="admissions-page-heading">
        <div>
          <h1>Admissions Officer Dashboard</h1>
          <p>Application queues, verification reviews, and candidate enrolment progress</p>
        </div>
        <div className="admissions-date-badge">
          <Calendar size={15} className="admissions-date-icon" />
          <span>{data.currentDateLabel || new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </header>

      {/* 4 KPI Cards */}
      <section className="admissions-kpi-grid" aria-label="Admissions Key Metrics">
        {/* Requiring Review */}
        <article className="admissions-kpi-card">
          <div className="admissions-kpi-header">
            <span className="admissions-kpi-icon admissions-kpi-icon--blue">
              <Clock size={22} />
            </span>
            <div className="admissions-kpi-copy">
              <span className="admissions-kpi-title">{data.kpis.applicationsRequiringReview.title}</span>
              <div className="admissions-kpi-value-row">
                <strong className="admissions-kpi-value">{data.kpis.applicationsRequiringReview.formattedValue || data.kpis.applicationsRequiringReview.value}</strong>
                {data.kpis.applicationsRequiringReview.trendPercent !== undefined && (
                  <span className={`admissions-kpi-trend admissions-kpi-trend--${data.kpis.applicationsRequiringReview.trendDirection || 'up'}`}>
                    {data.kpis.applicationsRequiringReview.trendDirection === 'down' ? '↓' : '↑'} {data.kpis.applicationsRequiringReview.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="admissions-kpi-footer">
            <span>{data.kpis.applicationsRequiringReview.comparisonLabel || 'Active review queue'}</span>
          </div>
        </article>

        {/* Pending Documents */}
        <article className="admissions-kpi-card">
          <div className="admissions-kpi-header">
            <span className="admissions-kpi-icon admissions-kpi-icon--amber">
              <FolderCheck size={22} />
            </span>
            <div className="admissions-kpi-copy">
              <span className="admissions-kpi-title">{data.kpis.incompleteDocuments.title}</span>
              <div className="admissions-kpi-value-row">
                <strong className="admissions-kpi-value">{data.kpis.incompleteDocuments.formattedValue || data.kpis.incompleteDocuments.value}</strong>
                {data.kpis.incompleteDocuments.trendPercent !== undefined && (
                  <span className={`admissions-kpi-trend admissions-kpi-trend--${data.kpis.incompleteDocuments.trendDirection || 'down'}`}>
                    {data.kpis.incompleteDocuments.trendDirection === 'up' ? '↑' : '↓'} {data.kpis.incompleteDocuments.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="admissions-kpi-footer">
            <span>{data.kpis.incompleteDocuments.comparisonLabel || 'Awaiting officer verification'}</span>
          </div>
        </article>

        {/* Admitted / Approved */}
        <article className="admissions-kpi-card">
          <div className="admissions-kpi-header">
            <span className="admissions-kpi-icon admissions-kpi-icon--emerald">
              <CheckCircle2 size={22} />
            </span>
            <div className="admissions-kpi-copy">
              <span className="admissions-kpi-title">{data.kpis.admittedStudents.title}</span>
              <div className="admissions-kpi-value-row">
                <strong className="admissions-kpi-value">{data.kpis.admittedStudents.formattedValue || data.kpis.admittedStudents.value}</strong>
                {data.kpis.admittedStudents.trendPercent !== undefined && (
                  <span className={`admissions-kpi-trend admissions-kpi-trend--${data.kpis.admittedStudents.trendDirection || 'up'}`}>
                    {data.kpis.admittedStudents.trendDirection === 'down' ? '↓' : '↑'} {data.kpis.admittedStudents.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="admissions-kpi-footer">
            <span>{data.kpis.admittedStudents.comparisonLabel || 'Official offers issued'}</span>
          </div>
        </article>

        {/* Action Required */}
        <article className="admissions-kpi-card">
          <div className="admissions-kpi-header">
            <span className="admissions-kpi-icon admissions-kpi-icon--purple">
              <AlertCircle size={22} />
            </span>
            <div className="admissions-kpi-copy">
              <span className="admissions-kpi-title">{data.kpis.actionRequired.title}</span>
              <div className="admissions-kpi-value-row">
                <strong className="admissions-kpi-value">{data.kpis.actionRequired.formattedValue || data.kpis.actionRequired.value}</strong>
                {data.kpis.actionRequired.trendPercent !== undefined && (
                  <span className={`admissions-kpi-trend admissions-kpi-trend--${data.kpis.actionRequired.trendDirection || 'down'}`}>
                    {data.kpis.actionRequired.trendDirection === 'up' ? '↑' : '↓'} {data.kpis.actionRequired.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="admissions-kpi-footer">
            <span>{data.kpis.actionRequired.comparisonLabel || 'Candidate corrections pending'}</span>
          </div>
        </article>
      </section>

      {/* Primary Grid: Admissions Trends (Left) & Admission Status Distribution (Right - 330px) */}
      <section className="admissions-dashboard-grid admissions-dashboard-grid--primary" aria-label="Admissions trends and status distribution">
        {/* Admissions Trends Line Chart */}
        <article className="admissions-panel admissions-panel--trends">
          <div className="admissions-panel-heading">
            <div>
              <h2>Admissions Intake Trends</h2>
              <p>Submitted, accepted, and rejected candidates by period</p>
            </div>
            <div className="admissions-chart-legend">
              <span className="admissions-chart-legend-item">
                <span className="admissions-chart-legend-dot" style={{ backgroundColor: '#1d4ed8' }} />
                Submitted
              </span>
              <span className="admissions-chart-legend-item">
                <span className="admissions-chart-legend-dot" style={{ backgroundColor: '#10b981' }} />
                Admitted
              </span>
              <span className="admissions-chart-legend-item">
                <span className="admissions-chart-legend-dot" style={{ backgroundColor: '#ef4444' }} />
                Rejected
              </span>
            </div>
          </div>
          {data.admissionsTrends.length > 0 ? (
            <div className="admissions-line-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.admissionsTrends} margin={{ top: 12, right: 14, left: -14, bottom: 0 }}>
                  <CartesianGrid stroke="#e8eef6" strokeDasharray="3 4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#718198', fontSize: 11 }} axisLine={{ stroke: '#d9e2ee' }} tickLine={false} />
                  <YAxis tick={{ fill: '#718198', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(val: any, name: any) => [`${val} Applications`, name]} />
                  <Line type="monotone" dataKey="submitted" name="Submitted" stroke="#1d4ed8" strokeWidth={2.2} dot={{ r: 3, fill: '#1d4ed8' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="admitted" name="Admitted" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="admissions-empty-state">No trend records recorded for this intake.</div>
          )}
        </article>

        {/* Admission Status Distribution Donut Chart (Right - 330px) */}
        <article className="admissions-panel admissions-panel--distribution">
          <div className="admissions-panel-heading">
            <div>
              <h2>Status Distribution</h2>
              <p>Breakdown of active applicants</p>
            </div>
          </div>
          {data.admissionStatusDistribution.length > 0 && totalStatusCount > 0 ? (
            <div className="admissions-donut-body">
              <div className="admissions-donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.admissionStatusDistribution}
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
                      {data.admissionStatusDistribution.map((item) => (
                        <Cell key={item.code} fill={item.color ?? STATUS_COLORS[item.code] ?? '#10b981'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value: any, name: any) => [`${value} applications`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="admissions-donut-center">
                  <strong>{totalStatusCount.toLocaleString()}</strong>
                  <span>Applicants</span>
                </div>
              </div>
              <div className="admissions-donut-legend">
                {data.admissionStatusDistribution.map((item) => (
                  <div className="admissions-donut-legend-item" key={item.code}>
                    <span
                      className="admissions-donut-swatch"
                      style={{ backgroundColor: item.color ?? STATUS_COLORS[item.code] ?? '#10b981' }}
                    />
                    <div>
                      <strong>{item.status}</strong>
                      <span>
                        {item.count} (
                        {totalStatusCount > 0
                          ? Math.round((item.count / totalStatusCount) * 100)
                          : item.sharePercent}
                        %)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="admissions-empty-state">No status distribution records available.</div>
          )}
        </article>
      </section>

      {/* Secondary Grid: Review Queue Table (Left) & Upcoming Deadlines (Right - 330px) */}
      <section className="admissions-dashboard-grid admissions-dashboard-grid--secondary" aria-label="Review queue and deadlines">
        {/* Review Queue Table */}
        <article className="admissions-panel admissions-panel--queue">
          <div className="admissions-panel-heading admissions-panel-heading--row">
            <div>
              <h2>Review Queue</h2>
              <p>Applications awaiting verification &amp; admissions evaluation</p>
            </div>
            <button
              className="admissions-text-action"
              type="button"
              onClick={onViewAllReviewQueue}
            >
              View All <ChevronRight size={15} />
            </button>
          </div>
          {data.reviewQueue.length > 0 ? (
            <div className="admissions-table-scroll">
              <table className="admissions-table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Application No.</th>
                    <th scope="col">Candidate Name</th>
                    <th scope="col">Programme</th>
                    <th scope="col">Status</th>
                    <th scope="col">Documents</th>
                    <th scope="col">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {data.reviewQueue.slice(0, 5).map((app, idx) => (
                    <tr key={app.id}>
                      <td className="text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td>
                        <button
                          className="admissions-table-link"
                          type="button"
                          onClick={() => onApplicationSelect?.(app)}
                        >
                          {app.applicationReference}
                        </button>
                      </td>
                      <td className="font-semibold text-slate-800">{app.applicantName}</td>
                      <td className="text-slate-600 max-w-[180px] truncate" title={app.programme}>
                        {app.programme}
                      </td>
                      <td>
                        <span className={statusClass(app.status)}>
                          {app.status}
                        </span>
                      </td>
                      <td className="text-xs font-medium text-slate-500">{app.documentSummary}</td>
                      <td className="text-slate-400 text-xs">{app.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admissions-empty-state">No pending applications in the review queue.</div>
          )}
        </article>

        {/* Upcoming Admission Deadlines (Compact 330px panel) */}
        <article className="admissions-panel admissions-panel--deadlines">
          <div className="admissions-panel-heading">
            <div>
              <h2>Admission Deadlines</h2>
              <p>Active intake deadlines</p>
            </div>
          </div>
          {data.upcomingDeadlines.length > 0 ? (
            <div className="admissions-deadline-list">
              {data.upcomingDeadlines.map((dl) => (
                <div className="admissions-deadline-item" key={dl.id}>
                  <div>
                    <strong>{dl.name}</strong>
                    <span>Deadline: {dl.deadlineFormatted}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{dl.academicYear} • {dl.applicationsCount} applicants</span>
                  </div>
                  <span className={`admissions-deadline-tag ${dl.status === 'Closing Soon' ? 'admissions-deadline-tag--warning' : 'admissions-deadline-tag--active'}`}>
                    {dl.daysRemaining} days left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="admissions-empty-state">No active intake deadlines configured.</div>
          )}
        </article>
      </section>

      {/* Tertiary Grid: Quick Actions & Incomplete Documents (Left) + Recent Admissions Activity (Right - 330px) */}
      <section className="admissions-dashboard-grid admissions-dashboard-grid--tertiary" aria-label="Quick actions and admissions activity">
        {/* Left Column: Quick Actions + Pending Documents List */}
        <div className="flex flex-col gap-4">
          {/* Quick Actions Card */}
          <article className="admissions-panel">
            <div className="admissions-panel-heading">
              <div>
                <h2>Admissions Actions</h2>
                <p>Standard operating workflows for admissions officers</p>
              </div>
            </div>
            <div className="admissions-quick-grid">
              {quickActionsList.map((action) => {
                const IconComponent = ACTION_ICONS[action.icon ?? 'file'] || FileText;
                const content = (
                  <>
                    <span className="admissions-quick-icon">
                      <IconComponent size={16} />
                    </span>
                    <span className="admissions-quick-copy">
                      <strong>{action.label}</strong>
                      {action.description && <small>{action.description}</small>}
                    </span>
                    <ChevronRight className="admissions-quick-chevron" size={15} />
                  </>
                );

                return action.href ? (
                  <a className="admissions-quick-item" href={action.href} key={action.id}>
                    {content}
                  </a>
                ) : (
                  <button
                    className="admissions-quick-item"
                    key={action.id}
                    type="button"
                    onClick={() => onQuickActionClick?.(action)}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </article>

          {/* Incomplete / Flagged Documents */}
          <article className="admissions-panel">
            <div className="admissions-panel-heading admissions-panel-heading--row">
              <div>
                <h2>Documents Awaiting Verification</h2>
                <p>Recent candidate certificates requiring inspection</p>
              </div>
              <button
                className="admissions-text-action"
                type="button"
                onClick={onViewAllDocuments}
              >
                View Queue <ChevronRight size={15} />
              </button>
            </div>
            {data.incompleteDocumentsList.length > 0 ? (
              <div className="space-y-2.5">
                {data.incompleteDocumentsList.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <FolderCheck size={16} />
                      </div>
                      <div>
                        <strong className="text-slate-800 block">{doc.documentType} ({doc.originalFilename})</strong>
                        <span className="text-slate-500 text-[11px] block">{doc.applicantName} • {doc.applicationReference} • {doc.programme}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                      {doc.timeAgo}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admissions-empty-state">No pending documents awaiting review.</div>
            )}
          </article>
        </div>

        {/* Right Column: Recent Admissions Activity (Compact 330px panel) */}
        <article className="admissions-panel admissions-panel--activity">
          <div className="admissions-panel-heading admissions-panel-heading--row">
            <div>
              <h2>Admissions Activity</h2>
              <p>Recent evaluations &amp; notices</p>
            </div>
            <button
              className="admissions-text-action"
              type="button"
              onClick={onViewAllActivity}
            >
              View All <ChevronRight size={15} />
            </button>
          </div>
          {data.recentActivity.length > 0 ? (
            <div className="admissions-activity-list">
              {data.recentActivity.map((activity) => (
                <div className="admissions-activity-item" key={activity.id}>
                  <span className={`admissions-activity-icon admissions-tone--${activity.tone || 'blue'}`}>
                    <CheckCircle2 size={16} />
                  </span>
                  <div className="admissions-activity-copy">
                    <strong>{activity.title}</strong>
                    {activity.reference && (
                      <span className="admissions-activity-reference">{activity.reference}</span>
                    )}
                    <time>{activity.timeLabel}</time>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admissions-empty-state">No recent activity logged.</div>
          )}
        </article>
      </section>
    </main>
  );
};
