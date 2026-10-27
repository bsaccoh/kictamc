import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from './auth';
import { AppError } from './errorHandler';

export type Capability =
  | 'applications:read'
  | 'applications:write'
  | 'applications:review'
  | 'documents:verify'
  | 'admission-letter:issue'
  | 'payments:read'
  | 'payments:write'
  | 'fees:manage'
  | 'academics:read'
  | 'academics:write'
  | 'academic-years:manage'
  | 'reports:view'
  | 'users:manage'
  | 'users:create-staff'
  | 'students:enroll'
  | 'audit:view'
  | 'document-config:manage'
  | 'settings:manage';

const APPLICANT_CAPS: Capability[] = [];
const STUDENT_CAPS: Capability[] = [];

const LECTURER_CAPS: Capability[] = [
  'academics:read',
  'applications:read',
  'reports:view',
];

const ADMISSIONS_CAPS: Capability[] = [
  'applications:read',
  'applications:write',
  'applications:review',
  'documents:verify',
  'admission-letter:issue',
  'academics:read',
  'academics:write',
  'fees:manage',
  'students:enroll',
  'reports:view',
];

const FINANCE_CAPS: Capability[] = [
  'applications:read',
  'payments:read',
  'payments:write',
  'fees:manage',
  'reports:view',
];

const COMPLIANCE_CAPS: Capability[] = [
  'applications:read',
  'documents:verify',
  'payments:read',
  'audit:view',
  'users:manage',
  'reports:view',
];

const ADMIN_CAPS: Capability[] = [
  'applications:read',
  'applications:write',
  'applications:review',
  'documents:verify',
  'admission-letter:issue',
  'payments:read',
  'payments:write',
  'fees:manage',
  'academics:read',
  'academics:write',
  'academic-years:manage',
  'reports:view',
  'users:manage',
  'audit:view',
  'document-config:manage',
  'students:enroll',
];

const SUPER_ADMIN_CAPS: Capability[] = [
  ...ADMIN_CAPS,
  'users:create-staff',
  'settings:manage',
];

const SYSTEM_ADMIN_CAPS: Capability[] = [
  'users:manage',
  'users:create-staff',
  'audit:view',
  'settings:manage',
  'reports:view',
];

export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  APPLICANT: APPLICANT_CAPS,
  STUDENT: STUDENT_CAPS,
  LECTURER: LECTURER_CAPS,
  ADMISSIONS_OFFICER: ADMISSIONS_CAPS,
  FINANCE_OFFICER: FINANCE_CAPS,
  COMPLIANCE: COMPLIANCE_CAPS,
  ADMIN: ADMIN_CAPS,
  SUPER_ADMIN: SUPER_ADMIN_CAPS,
  SYSTEM_ADMIN: SYSTEM_ADMIN_CAPS,
};

export function roleHas(role: Role, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
}

export function requireCapability(capability: Capability) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!roleHas(req.user.role, capability)) {
      return next(
        new AppError(
          `Access forbidden: missing capability '${capability}'.`,
          403
        )
      );
    }
    next();
  };
}

export function requireAnyCapability(capabilities: Capability[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    const allowed = capabilities.some((c) => roleHas(req.user!.role, c));
    if (!allowed) {
      return next(
        new AppError(
          `Access forbidden: missing one of [${capabilities.join(', ')}].`,
          403
        )
      );
    }
    next();
  };
}
