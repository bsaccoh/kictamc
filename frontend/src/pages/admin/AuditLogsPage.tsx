import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Code,
  Calendar,
  Download
} from 'lucide-react';
import { api } from '../../services/api';

export const AuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => api.get<any[]>('/admin/audit-logs'),
  });

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handleExportAuditCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'Timestamp',
      'User Name',
      'User Email',
      'Role',
      'Action',
      'Resource',
      'Resource ID',
      'Details',
    ];

    const rows = filteredLogs.map((log: any) => [
      `"${new Date(log.createdAt).toISOString()}"`,
      `"${log.user ? `${log.user.firstName || ''} ${log.user.surname || ''}`.trim() : ''}"`,
      `"${log.user?.email || log.userEmail || ''}"`,
      `"${log.user?.role || ''}"`,
      `"${log.action || ''}"`,
      `"${log.resource || ''}"`,
      `"${log.resourceId || ''}"`,
      `"${log.details ? JSON.stringify(log.details).replace(/"/g, '""') : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KICTAMC_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionColor = (action: string) => {
    if (action.includes('APPROVED') || action.includes('SUCCESS') || action.includes('VERIFIED')) {
      return 'bg-emerald-100 text-emerald-800';
    }
    if (action.includes('REJECTED') || action.includes('ERROR')) {
      return 'bg-red-100 text-red-800';
    }
    if (action.includes('LOGIN') || action.includes('SUBMIT')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-950">System Audit Trail</h1>
          <p className="text-sm text-slate-500">
            Immutable audit log tracking all admissions actions, payment verifications, and security events.
          </p>
        </div>
        <button
          onClick={handleExportAuditCSV}
          disabled={filteredLogs.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-gold-400" /> Export Audit Trail (CSV)
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, email, resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-navy-800"
        >
          <option value="ALL">All Actions</option>
          <option value="PAYMENT_VERIFIED">Payment Verified</option>
          <option value="PAYMENT_REJECTED">Payment Rejected</option>
          <option value="DOCUMENT_VERIFIED">Document Verified</option>
          <option value="DOCUMENT_REJECTED">Document Rejected</option>
          <option value="APPLICATION_APPROVED">Application Approved</option>
          <option value="APPLICATION_REJECTED">Application Rejected</option>
          <option value="APPLICATION_SUBMITTED">Application Submitted</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Resource</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-navy-800 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records match criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap text-slate-500">
                      {new Date(log.createdAt).toLocaleString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-xs">
                        {log.user ? `${log.user.firstName} ${log.user.surname}` : log.userEmail || 'System'}
                      </div>
                      <div className="text-[11px] text-slate-400">{log.user?.role || log.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700 whitespace-nowrap">
                      {log.resource} {log.resourceId ? `(${log.resourceId.slice(0, 8)}...)` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 max-w-md truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
