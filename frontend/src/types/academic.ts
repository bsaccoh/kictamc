export type QualificationLevel = 'LOWER_DIPLOMA' | 'HIGHER_DIPLOMA' | 'DEGREE';

export type DocumentType =
  | 'EXAM_RESULT'
  | 'TESTIMONIAL'
  | 'BIRTH_CERTIFICATE'
  | 'ID_DOCUMENT'
  | 'PASSPORT_PHOTO'
  | 'OTHER';

export interface AdmissionIntake {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  isActive: boolean;
  academicYear?: AcademicYear;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  intakes?: AdmissionIntake[];
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  deanName?: string | null;
  email?: string | null;
  phone?: string | null;
  officeLocation?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  departments?: Department[];
  courses?: Course[];
  _count?: {
    departments: number;
    courses: number;
  };
}

export interface Department {
  id: string;
  facultyId?: string | null;
  faculty?: Faculty | null;
  name: string;
  code: string;
  description?: string | null;
  hodName?: string | null;
  hodTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  officeLocation?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  courses?: Course[];
  _count?: {
    courses: number;
  };
}

export interface DepartmentMetrics {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  totalCourses: number;
  facultiesRepresented: number;
}

export interface CourseDocumentRequirement {
  id: string;
  courseId: string;
  documentType: DocumentType;
  name: string;
  description?: string | null;
  isMandatory: boolean;
}

export interface Course {
  id: string;
  facultyId?: string | null;
  faculty?: Faculty | null;
  departmentId?: string | null;
  department?: Department | null;
  academicYearId?: string | null;
  academicYear?: AcademicYear | null;
  name: string;
  code: string;
  qualificationLevel: QualificationLevel;
  qualificationAward?: string | null;
  duration?: number;
  durationUnit?: string;
  description?: string | null;
  detailedDescription?: string | null;
  admissionRequirements?: string | null;
  learningOutcomes?: string | null;
  creditUnits?: number | null;
  intakeCapacity?: number | null;
  applicationFeeMinor: number;
  tuitionFeeMinor?: number;
  currency: string;
  studyModes: string;
  preferredCampuses: string;
  openingDate?: string | null;
  closingDate?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  documentRequirements?: CourseDocumentRequirement[];
  _count?: {
    applications: number;
  };
}

export interface FacultyMetrics {
  totalFaculties: number;
  activeFaculties: number;
  inactiveFaculties: number;
  totalCourses: number;
}

export interface CourseMetrics {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  facultiesOfferingCourses: number;
}
