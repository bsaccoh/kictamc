import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { can, canAny, isStaff, type Capability } from '../../lib/permissions';

interface RequireCapabilityProps {
  capability?: Capability;
  anyOf?: Capability[];
  children: React.ReactNode;
}

export const RequireCapability: React.FC<RequireCapabilityProps> = ({
  capability,
  anyOf,
  children,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-navy-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const allowed = capability
    ? can(user, capability)
    : anyOf
      ? canAny(user, anyOf)
      : false;

  if (!allowed) {
    const fallback = isStaff(user) ? '/admin' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
