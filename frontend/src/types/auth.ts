export type Role = 'APPLICANT' | 'ADMISSIONS_OFFICER' | 'FINANCE_OFFICER' | 'SYSTEM_ADMIN';

export interface StudentProfile {
  id?: string;
  userId?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string;
  placeOfBirth?: string | null;
  maritalStatus?: string | null;
  residentialAddress?: string | null;
  townCity?: string | null;
  chiefdom?: string | null;
  district?: string | null;
  regionProvince?: string | null;
  postalAddress?: string | null;
  passportPhotoUrl?: string | null;

  parentFullName?: string | null;
  parentRelationship?: string | null;
  parentPhone?: string | null;
  parentAltPhone?: string | null;
  parentAddress?: string | null;
  parentEmail?: string | null;
  parentOccupation?: string | null;

  emergencyFullName?: string | null;
  emergencyRelationship?: string | null;
  emergencyPhone?: string | null;
  emergencyAddress?: string | null;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  middleName?: string | null;
  surname: string;
  role: Role;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profile?: StudentProfile | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  verificationCode?: string;
}
