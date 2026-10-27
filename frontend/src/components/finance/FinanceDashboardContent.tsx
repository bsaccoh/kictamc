import React from 'react';
import {
  Coins,
  CreditCard,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronRight,
  Info,
  BookOpen,
  ShieldCheck,
  Receipt,
  FileSpreadsheet,
  Settings,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import '../../styles/FinanceDashboardContent.css';

export interface KPICardData {
  title: string;
  value: number;
  formattedValue?: string;
  trendPercent?: number;
  trendDirection?: 'up' | 'down';
  comparisonLabel?: string;
  icon?: 'coins' | 'card' | 'clock' | 'alert';
}

export interface PaymentTrendPoint {
  date: string;
  totalReceived: number;
  verified: number;
  pending: number;
  rejected: number;
}

export interface PaymentMethodItem {
  method: string;
  count: number;
  sharePercent: number;
  color?: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  href?: string;
}

export interface RecentTransactionItem {
  id: string;
  applicationReference: string;
  studentName: string;
  amount: number;
  currency?: string;
  method: string;
  status: 'Verified' | 'Pending' | 'Rejected' | 'Failed';
  dateLabel: string;
  href?: string;
  applicationId?: string;
}

export interface PaymentStatusSummaryItem {
  status: string;
  count: number;
}

export interface RecentActivityItem {
  id: string;
  kind: 'verified' | 'receipt' | 'rejected' | 'transaction' | string;
  title: string;
  reference?: string;
  detail?: string;
  timeLabel: string;
}

export interface FinanceDashboardData {
  currencyLabel?: string;
  period?: string;
  dateRangeLabel?: string;
  kpis: {
    totalReceived: KPICardData;
    verified: KPICardData;
    pending: KPICardData;
    rejected: KPICardData;
  };
  paymentTrends: PaymentTrendPoint[];
  paymentMethods: PaymentMethodItem[];
  transactions: RecentTransactionItem[];
  paymentStatusSummary: PaymentStatusSummaryItem[];
  recentActivity: RecentActivityItem[];
}

export interface FinanceDashboardContentProps {
  data?: FinanceDashboardData | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  periods?: { value: string; label: string }[];
  quickActions?: QuickActionItem[];
  onAction?: (actionId: string) => void;
  onViewAllTransactions?: () => void;
  onTransactionSelect?: (transaction: RecentTransactionItem) => void;
}

const DEFAULT_PERIODS = [
  { value: '30d', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'this_year', label: 'This Year' },
  { value: 'all', label: 'All Records' },
];

const DEFAULT_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'verification',
    label: 'Verify Payments',
    description: 'Review manual teller & mobile submissions',
    icon: 'verification',
    href: '/admin/payments?status=PENDING_VERIFICATION',
  },
  {
    id: 'transactions',
    label: 'View Transactions',
    description: 'Search complete payment audit ledger',
    icon: 'transactions',
    href: '/admin/payments',
  },
  {
    id: 'receipts',
    label: 'Generate Receipts',
    description: 'Issue official clearance tokens & vouchers',
    icon: 'receipts',
    href: '/verify-token',
  },
  {
    id: 'reports',
    label: 'Payment Reports',
    description: 'Download CSV and financial audits',
    icon: 'reports',
    href: '/admin/reports',
  },
  {
    id: 'fees',
    label: 'Configure Fees',
    description: 'Update application & course tariffs',
    icon: 'fees',
    href: '/admin/fees',
  },
];

const QUICK_ACTION_ICONS: Record<string, LucideIcon> = {
  verification: ShieldCheck,
  transactions: CreditCard,
  receipts: Receipt,
  reports: FileSpreadsheet,
  fees: Settings,
};


const METHOD_COLORS = ['#1e3a8a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const STATUS_COLORS: Record<string, string> = {
  Verified: '#10b981',
  Pending: '#f59e0b',
  Rejected: '#ef4444',
  Failed: '#2563eb',
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
    <div className="finance-empty-state">
      <FolderOpen size={20} className="text-slate-400" />
      <span>{message}</span>
    </div>
  );
}

export const FinanceDashboardContent: React.FC<FinanceDashboardContentProps> = ({
  data,
  isLoading = false,
  error = null,
  onRetry,
  selectedPeriod = '30d',
  onPeriodChange,
  periods = DEFAULT_PERIODS,
  quickActions = DEFAULT_QUICK_ACTIONS,
  onAction,
  onViewAllTransactions,
  onTransactionSelect,
}) => {
  if (error) {
    return (
      <main className="finance-dashboard-content" aria-label="Finance Dashboard">
        <div className="finance-error-panel">
          <div className="finance-error-icon">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2>Failed to load finance data</h2>
            <p>{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="finance-button finance-button--primary"
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
      <main className="finance-dashboard-content" aria-label="Finance Dashboard">
        <div className="finance-loading-strip">
          <div className="finance-spinner" />
          <span>Synchronizing live financial ledger from database...</span>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="finance-dashboard-content" aria-label="Finance Dashboard">
        <EmptyState message="No financial records found in database." />
      </main>
    );
  }

  const currencyLabel = data.currencyLabel || 'Le';
  const totalMethodCount = data.paymentMethods.reduce((sum, item) => sum + item.count, 0);

  const formatAmount = (amount: number, curr = currencyLabel) =>
    `${curr} ${Number(amount).toLocaleString('en-US')}`;

  const formatChartY = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const statusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'verified' || s === 'paid') return 'finance-status-pill finance-status--verified';
    if (s === 'pending') return 'finance-status-pill finance-status--pending';
    if (s === 'rejected') return 'finance-status-pill finance-status--rejected';
    return 'finance-status-pill finance-status--failed';
  };

  const activityIcon = (kind: string) => {
    switch (kind) {
      case 'verified':
        return { Icon: ShieldCheck, tone: 'success' };
      case 'receipt':
        return { Icon: Receipt, tone: 'warning' };
      case 'rejected':
        return { Icon: AlertTriangle, tone: 'danger' };
      case 'transaction':
      default:
        return { Icon: CreditCard, tone: 'info' };
    }
  };

  return (
    <main className="finance-dashboard-content" aria-label="Finance Dashboard">
      {/* Top Header */}
      <header className="finance-page-heading">
        <div>
          <h1>Finance Dashboard</h1>
          <p>Payment overview, transactions and financial activity</p>
        </div>
        <div className="finance-period-picker">
          <Calendar size={16} className="finance-period-icon" />
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            aria-label="Select reporting period"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} {data.dateRangeLabel && p.value === selectedPeriod ? `(${data.dateRangeLabel})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="finance-period-chevron" />
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="finance-kpi-grid" aria-label="Key Performance Indicators">
        {/* Total Payments Received */}
        <article className="finance-kpi-card">
          <div className="finance-kpi-header">
            <span className="finance-kpi-icon finance-kpi-icon--gold">
              <Coins size={22} />
            </span>
            <div className="finance-kpi-copy">
              <span className="finance-kpi-title">{data.kpis.totalReceived.title}</span>
              <div className="finance-kpi-value-row">
                <strong className="finance-kpi-value">{data.kpis.totalReceived.formattedValue}</strong>
                {data.kpis.totalReceived.trendPercent !== undefined && (
                  <span
                    className={`finance-kpi-trend finance-kpi-trend--${data.kpis.totalReceived.trendDirection}`}
                  >
                    {data.kpis.totalReceived.trendDirection === 'up' ? '↑' : '↓'}{' '}
                    {data.kpis.totalReceived.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="finance-kpi-footer">
            <span>{data.kpis.totalReceived.comparisonLabel}</span>
          </div>
        </article>

        {/* Verified Payments */}
        <article className="finance-kpi-card">
          <div className="finance-kpi-header">
            <span className="finance-kpi-icon finance-kpi-icon--blue">
              <CreditCard size={22} />
            </span>
            <div className="finance-kpi-copy">
              <span className="finance-kpi-title">{data.kpis.verified.title}</span>
              <div className="finance-kpi-value-row">
                <strong className="finance-kpi-value">{data.kpis.verified.formattedValue}</strong>
                {data.kpis.verified.trendPercent !== undefined && (
                  <span
                    className={`finance-kpi-trend finance-kpi-trend--${data.kpis.verified.trendDirection}`}
                  >
                    {data.kpis.verified.trendDirection === 'up' ? '↑' : '↓'}{' '}
                    {data.kpis.verified.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="finance-kpi-footer">
            <span>{data.kpis.verified.comparisonLabel}</span>
          </div>
        </article>

        {/* Pending Verification */}
        <article className="finance-kpi-card">
          <div className="finance-kpi-header">
            <span className="finance-kpi-icon finance-kpi-icon--amber">
              <Clock size={22} />
            </span>
            <div className="finance-kpi-copy">
              <span className="finance-kpi-title">{data.kpis.pending.title}</span>
              <div className="finance-kpi-value-row">
                <strong className="finance-kpi-value">{data.kpis.pending.formattedValue}</strong>
                {data.kpis.pending.trendPercent !== undefined && (
                  <span
                    className={`finance-kpi-trend finance-kpi-trend--${data.kpis.pending.trendDirection}`}
                  >
                    {data.kpis.pending.trendDirection === 'up' ? '↑' : '↓'}{' '}
                    {data.kpis.pending.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="finance-kpi-footer">
            <span>{data.kpis.pending.comparisonLabel}</span>
          </div>
        </article>

        {/* Rejected Payments */}
        <article className="finance-kpi-card">
          <div className="finance-kpi-header">
            <span className="finance-kpi-icon finance-kpi-icon--red">
              <AlertTriangle size={22} />
            </span>
            <div className="finance-kpi-copy">
              <span className="finance-kpi-title">{data.kpis.rejected.title}</span>
              <div className="finance-kpi-value-row">
                <strong className="finance-kpi-value">{data.kpis.rejected.formattedValue}</strong>
                {data.kpis.rejected.trendPercent !== undefined && (
                  <span
                    className={`finance-kpi-trend finance-kpi-trend--${data.kpis.rejected.trendDirection}`}
                  >
                    {data.kpis.rejected.trendDirection === 'up' ? '↑' : '↓'}{' '}
                    {data.kpis.rejected.trendPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="finance-kpi-footer">
            <span>{data.kpis.rejected.comparisonLabel}</span>
          </div>
        </article>
      </section>

      {/* Primary Grid: Trends, Methods & Quick Actions */}
      <section
        className="finance-dashboard-grid finance-dashboard-grid--primary"
        aria-label="Payment trends and payment methods"
      >
        {/* Payment Trends */}
        <article className="finance-panel finance-panel--trends">
          <div className="finance-panel-heading">
            <div>
              <h2>Payment Trends</h2>
              <p>Income volume and payment status dynamics</p>
            </div>
            <div className="finance-chart-legend">
              <span className="finance-chart-legend-item">
                <span className="finance-chart-legend-dot" style={{ backgroundColor: '#1d3d6f' }} />
                Total Received
              </span>
              <span className="finance-chart-legend-item">
                <span className="finance-chart-legend-dot" style={{ backgroundColor: '#10b981' }} />
                Verified
              </span>
              <span className="finance-chart-legend-item">
                <span className="finance-chart-legend-dot" style={{ backgroundColor: '#f59e0b' }} />
                Pending
              </span>
              <span className="finance-chart-legend-item">
                <span className="finance-chart-legend-dot" style={{ backgroundColor: '#ef4444' }} />
                Rejected
              </span>
            </div>
          </div>
          {data.paymentTrends.length > 0 ? (
            <div className="finance-line-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.paymentTrends} margin={{ top: 12, right: 12, left: -14, bottom: 0 }}>
                  <CartesianGrid stroke="#e8eef6" strokeDasharray="3 4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#718198', fontSize: 11 }} axisLine={{ stroke: '#d9e2ee' }} tickLine={false} />
                  <YAxis tickFormatter={formatChartY} tick={{ fill: '#718198', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(val: any, name: any) => [`${currencyLabel} ${Number(val).toLocaleString()}`, name]}
                  />
                  <Line type="monotone" dataKey="totalReceived" name="Total Received" stroke="#1d3d6f" strokeWidth={2.2} dot={{ r: 3, fill: '#1d3d6f' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="verified" name="Verified" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                  <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No trend data recorded for this period." />
          )}
        </article>

        {/* Payments by Method */}
        <article className="finance-panel finance-panel--methods">
          <div className="finance-panel-heading">
            <div>
              <h2>Payments by Method</h2>
              <p>Breakdown by channel</p>
            </div>
          </div>
          {data.paymentMethods.length > 0 && totalMethodCount > 0 ? (
            <div className="finance-methods-body">
              <div className="finance-donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.paymentMethods}
                      dataKey="count"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {data.paymentMethods.map((item, index) => (
                        <Cell
                          key={item.method}
                          fill={item.color ?? METHOD_COLORS[index % METHOD_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value: any, name: any) => [`${value} transactions`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="finance-donut-center">
                  <strong>{totalMethodCount.toLocaleString()}</strong>
                  <span>Total payments</span>
                </div>
              </div>
              <div className="finance-method-legend">
                {data.paymentMethods.map((method, index) => (
                  <div className="finance-method-legend-item" key={method.method}>
                    <span
                      className="finance-method-swatch"
                      style={{
                        backgroundColor: method.color ?? METHOD_COLORS[index % METHOD_COLORS.length],
                      }}
                    />
                    <div>
                      <strong>{method.method}</strong>
                      <span>
                        {method.sharePercent}% <em>({method.count})</em>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="No payment-method data is available." />
          )}
        </article>
      </section>

      {/* Secondary Grid: Recent Transactions & Payment Status Summary (2 columns) */}
      <section
        className="finance-dashboard-grid finance-dashboard-grid--secondary"
        aria-label="Recent transactions and payment status summary"
      >
        {/* Recent Payment Transactions */}
        <article className="finance-panel finance-panel--transactions">
          <div className="finance-panel-heading finance-panel-heading--row">
            <div>
              <h2>Recent Payment Transactions</h2>
              <p>Latest payment records for the selected period</p>
            </div>
            <button
              className="finance-text-action"
              type="button"
              onClick={() =>
                onViewAllTransactions ? onViewAllTransactions() : onAction?.('transactions')
              }
            >
              View all <ChevronRight size={15} />
            </button>
          </div>
          {data.transactions.length > 0 ? (
            <div className="finance-table-scroll">
              <table className="finance-transactions-table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Application No.</th>
                    <th scope="col">Student Name</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Method</th>
                    <th scope="col">Status</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.slice(0, 5).map((transaction, idx) => (
                    <tr key={transaction.id}>
                      <td className="text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td>
                        {transaction.href ? (
                          <a className="finance-reference-link" href={transaction.href}>
                            {transaction.applicationReference}
                          </a>
                        ) : (
                          <button
                            className="finance-table-link"
                            type="button"
                            onClick={() => onTransactionSelect?.(transaction)}
                          >
                            {transaction.applicationReference}
                          </button>
                        )}
                      </td>
                      <td>
                        <span className="finance-student-name">{transaction.studentName}</span>
                      </td>
                      <td className="finance-amount-cell">
                        {formatAmount(transaction.amount, transaction.currency ?? currencyLabel)}
                      </td>
                      <td>{transaction.method}</td>
                      <td>
                        <span className={statusClass(transaction.status)}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="finance-date-cell">{transaction.dateLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No payment transactions are available for this period." />
          )}
        </article>

        {/* Payment Status Summary */}
        <article className="finance-panel finance-panel--status">
          <div className="finance-panel-heading">
            <div>
              <h2>Payment Status Summary</h2>
              <p>Transaction count by status</p>
            </div>
          </div>
          {data.paymentStatusSummary.length > 0 ? (
            <div className="finance-status-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.paymentStatusSummary}
                  margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
                >
                  <CartesianGrid stroke="#e8eef6" strokeDasharray="3 4" vertical={false} />
                  <XAxis
                    dataKey="status"
                    tick={{ fill: '#718198', fontSize: 11 }}
                    axisLine={{ stroke: '#d9e2ee' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#718198', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: any) => [Number(value).toLocaleString(), 'Transactions']}
                  />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={32}>

                    {data.paymentStatusSummary.map((item) => (
                      <Cell
                        key={item.status}
                        fill={STATUS_COLORS[item.status] || '#1d3d6f'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No payment-status totals are available." />
          )}
          <div className="finance-status-total">
            <span>Transactions in selected period</span>
            <strong>
              {data.paymentStatusSummary
                .reduce((sum, item) => sum + item.count, 0)
                .toLocaleString()}
            </strong>
          </div>
        </article>
      </section>

      {/* Tertiary Grid: Quick Actions & Recent Activity (2 columns) */}
      <section
        className="finance-dashboard-grid finance-dashboard-grid--tertiary"
        aria-label="Quick actions and recent activity"
      >
        {/* Quick Actions */}
        <article className="finance-panel finance-panel--quick-actions">
          <div className="finance-panel-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Common finance tasks</p>
            </div>
          </div>
          <div className="finance-quick-action-list">
            {quickActions.map((action) => {
              const ActionIcon = QUICK_ACTION_ICONS[action.icon ?? 'transactions'] || CreditCard;
              const actionContent = (
                <>
                  <span className="finance-quick-icon">
                    <ActionIcon size={17} />
                  </span>
                  <span className="finance-quick-copy">
                    <strong>{action.label}</strong>
                    {action.description && <small>{action.description}</small>}
                  </span>
                  <ChevronRight className="finance-quick-chevron" size={16} />
                </>
              );
              return action.href ? (
                <a className="finance-quick-action" href={action.href} key={action.id}>
                  {actionContent}
                </a>
              ) : (
                <button
                  className="finance-quick-action"
                  key={action.id}
                  type="button"
                  onClick={() => onAction?.(action.id)}
                >
                  {actionContent}
                </button>
              );
            })}
          </div>
        </article>

        {/* Recent Activity */}
        <article className="finance-panel finance-panel--activity">
          <div className="finance-panel-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest recorded finance events</p>
            </div>
          </div>
          {data.recentActivity.length > 0 ? (
            <div className="finance-activity-list">
              {data.recentActivity.map((activity) => {
                const { Icon, tone } = activityIcon(activity.kind);
                return (
                  <div className="finance-activity-item" key={activity.id}>
                    <span className={`finance-activity-icon finance-tone--${tone}`}>
                      <Icon size={17} />
                    </span>
                    <div className="finance-activity-copy">
                      <strong>{activity.title}</strong>
                      {activity.reference && (
                        <span className="finance-activity-reference">{activity.reference}</span>
                      )}
                      {activity.detail && <span>{activity.detail}</span>}
                      <time>{activity.timeLabel}</time>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState message="No recent finance activity recorded." />
          )}
        </article>
      </section>


      {/* Guidance Banner */}
      <aside className="finance-guidance-banner">
        <span className="finance-guidance-icon">
          <Info size={21} />
        </span>
        <div className="finance-guidance-copy">
          <strong>Need to verify a payment?</strong>
          <p>
            Check the payment reference, confirm with the bank or mobile money provider, and update
            the status accordingly. Uploaded receipts alone do not confirm that funds have been received.
          </p>
        </div>
        <button
          className="finance-button finance-button--navy"
          type="button"
          onClick={() => onAction?.('payment-guide')}
        >
          <BookOpen size={16} /> View Payment Guide <ChevronRight size={15} />
        </button>
      </aside>

      <p className="finance-dashboard-note">
        <ShieldCheck size={14} /> Financial summaries are calculated directly from persisted
        transaction records and reflect verified payment states.
      </p>
    </main>
  );
};
