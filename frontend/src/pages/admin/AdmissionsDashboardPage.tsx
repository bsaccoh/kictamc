import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import {
  AdmissionsDashboardContent,
  AdmissionsDashboardData,
  ReviewQueueItem,
  QuickActionItem,
} from '../../components/admissions/AdmissionsDashboardContent';

export const AdmissionsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<AdmissionsDashboardData>({
    queryKey: ['admissions-dashboard-overview'],
    queryFn: async () => {
      return api.get<AdmissionsDashboardData>('/admin/admissions/dashboard-overview');
    },
    staleTime: 30000,
  });

  const formattedData: AdmissionsDashboardData | undefined = data
    ? {
        ...data,
        userName: user?.firstName ? `${user.firstName} ${user.surname || ''}`.trim() : 'Admissions Officer',
      }
    : undefined;

  const handleApplicationSelect = (app: ReviewQueueItem) => {
    if (app.href) {
      navigate(app.href);
    } else {
      navigate(`/admin/applications/${app.id}`);
    }
  };

  const handleQuickActionClick = (action: QuickActionItem) => {
    if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <AdmissionsDashboardContent
      data={formattedData}
      isLoading={isLoading}
      error={error ? (error as Error).message || 'Unable to connect to admissions server.' : null}
      onRetry={() => refetch()}
      onViewAllReviewQueue={() => navigate('/admin/applications?status=UNDER_REVIEW')}
      onViewAllDocuments={() => navigate('/admin/documents')}
      onViewAllActivity={() => navigate('/admin/applications')}
      onApplicationSelect={handleApplicationSelect}
      onQuickActionClick={handleQuickActionClick}
    />
  );
};
