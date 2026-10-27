import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import {
  AdminDashboardContent,
  AdminDashboardData,
  RecentApplicationItem,
  QuickLinkItem,
} from '../../components/admin/AdminDashboardContent';
import { AdmissionsDashboardPage } from './AdmissionsDashboardPage';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user?.role === 'ADMISSIONS_OFFICER') {
    return <AdmissionsDashboardPage />;
  }

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<AdminDashboardData>({
    queryKey: ['admin-dashboard-overview'],
    queryFn: async () => {
      return api.get<AdminDashboardData>('/admin/dashboard-overview');
    },
    staleTime: 30000,
  });

  const formattedData: AdminDashboardData | undefined = data
    ? {
        ...data,
        userName: user?.firstName ? `${user.firstName} ${user.surname || ''}`.trim() : 'Admin User',
      }
    : undefined;

  const handleApplicationSelect = (app: RecentApplicationItem) => {
    if (app.href) {
      navigate(app.href);
    } else {
      navigate(`/admin/applications/${app.id}`);
    }
  };

  const handleQuickLinkClick = (link: QuickLinkItem) => {
    if (link.href) {
      navigate(link.href);
    }
  };

  return (
    <AdminDashboardContent
      data={formattedData}
      isLoading={isLoading}
      error={error ? (error as Error).message || 'Unable to connect to admissions server.' : null}
      onRetry={() => refetch()}
      onViewAllApplications={() => navigate('/admin/applications')}
      onViewAllActivity={() => navigate('/admin/applications')}
      onApplicationSelect={handleApplicationSelect}
      onQuickLinkClick={handleQuickLinkClick}
    />
  );
};
