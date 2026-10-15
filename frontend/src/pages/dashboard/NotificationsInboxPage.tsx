import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  CheckCheck,
  Filter,
  FileText,
  CreditCard,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const NotificationsInboxPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<any[]>('/users/notifications'),
    refetchInterval: 15000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/users/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'READ') return n.isRead;
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
      case 'WARNING':
        return <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-navy-600 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy-950 font-serif">
            Notifications & Official Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with real-time institutional notices, document verifications, and payment receipts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            className="text-xs flex items-center gap-1.5 border-slate-300"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-3.5 h-3.5 text-navy-700" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-navy-600 text-white'
                : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filter === 'UNREAD'
                ? 'bg-navy-600 text-white'
                : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('READ')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filter === 'READ'
                ? 'bg-navy-600 text-white'
                : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        <span className="text-[11px] text-slate-400">Auto-refreshed every 15s</span>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Retrieving notification feed...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Notifications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            You do not have any notifications matching this filter at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((notif: any) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.isRead) markReadMutation.mutate(notif.id);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                !notif.isRead
                  ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/70 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              {getNotifIcon(notif.type)}

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-xs font-bold text-navy-950 truncate">{notif.title}</h3>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleDateString()} •{' '}
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                {!notif.isRead && (
                  <span className="inline-block mt-2 text-[10px] font-semibold text-navy-700 bg-navy-100/60 px-2 py-0.5 rounded">
                    Unread Alert
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
