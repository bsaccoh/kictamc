import type { Role, User } from '../types/auth';

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
  | 'audit:view'
  | 'document-config:manage'
  | 'settings:manage';

const APPLICANT_CAPS: Capability[] = [];
const STUDENT_CAPS: Capability[] = [];

const LECTURER_CAPS: Capability[] = [
  'academics:read',
  'reports:view',
];

const ADMISSIONS_CAPS: Capability[] = [
  'applications:read',
  'applications:write',
  'applications:review',
  'documents:verify',
  'admission-letter:issue',
  'academics:read',
  'fees:manage',
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
];

const SUPER_ADMIN_CAPS: Capability[] = [
  ...ADMIN_CAPS,
  'settings:manage',
];

const SYSTEM_ADMIN_CAPS: Capability[] = [
  'users:manage',
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

export function can(
  user: Pick<User, 'role'> | null | undefined,
  capability: Capability,
): boolean {
  if (!user) return false;
  return ROLE_CAPABILITIES[user.role]?.includes(capability) ?? false;
}

export function canAny(
  user: Pick<User, 'role'> | null | undefined,
  capabilities: Capability[],
): boolean {
  return capabilities.some((c) => can(user, c));
}

export const STAFF_ROLES: Role[] = [
  'LECTURER',
  'ADMISSIONS_OFFICER',
  'FINANCE_OFFICER',
  'COMPLIANCE',
  'ADMIN',
  'SUPER_ADMIN',
  'SYSTEM_ADMIN',
];

export function isStaff(user: Pick<User, 'role'> | null | undefined): boolean {
  if (!user) return false;
  return STAFF_ROLES.includes(user.role);
}
