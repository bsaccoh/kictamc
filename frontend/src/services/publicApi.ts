import { api } from './api';

export interface PublicCourse {
  id: string;
  name: string;
  code: string;
  qualificationLevel: 'LOWER_DIPLOMA' | 'HIGHER_DIPLOMA' | 'DEGREE';
  qualificationAward?: string;
  duration: number;
  durationUnit: string;
  description?: string;
  detailedDescription?: string;
  admissionRequirements?: string;
  learningOutcomes?: string;
  applicationFeeMinor: number;
  tuitionFeeMinor?: number;
  currency: string;
  studyModes: string;
  preferredCampuses: string;
  isActive: boolean;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  facultyId?: string;
  faculty?: {
    id: string;
    name: string;
    code: string;
  };
  documentRequirements?: Array<{
    id: string;
    documentType: string;
    name: string;
    isMandatory: boolean;
  }>;
}

export interface PublicFaculty {
  id: string;
  name: string;
  code: string;
  description?: string;
  deanName?: string;
  email?: string;
  phone?: string;
  officeLocation?: string;
  departments?: Array<{
    id: string;
    name: string;
    code: string;
    description?: string;
  }>;
  courses?: PublicCourse[];
}

export interface PublicIntake {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  isActive: boolean;
  academicYear?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  featuredImage?: string;
  publishedAt: string;
  author: string;
}

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate?: string;
  timeString?: string;
  category: string;
}

export interface PublicOverviewData {
  academicYear?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  activeIntakes: PublicIntake[];
  coursesCount: number;
  facultiesCount: number;
  featuredCourses: PublicCourse[];
  recentNews: NewsArticle[];
  upcomingEvents: CollegeEvent[];
  collegeInfo: {
    name: string;
    shortName: string;
    motto: string;
    location: string;
    email: string;
    admissionsEmail: string;
    phone: string;
    phoneAlt: string;
    crestUrl: string;
    heroImageUrl: string;
    affiliation?: {
      enabled: boolean;
      partnerName: string;
      partnerShortName: string;
      partnerHistoricalName?: string;
      partnerLocation: string;
      partnerWebsiteUrl: string;
      statement: string;
    };
  };
}

export interface EnquirySubmission {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const publicApi = {
  getOverview: () => api.get<PublicOverviewData>('/public/overview'),
  getFaculties: () => api.get<PublicFaculty[]>('/faculties'),
  getCourses: () => api.get<PublicCourse[]>('/courses'),
  getCourseById: (id: string) => api.get<PublicCourse>(`/courses/${id}`),
  getIntakes: () => api.get<PublicIntake[]>('/intakes'),
  getNews: (category?: string, query?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category);
    if (query) params.append('q', query);
    const queryString = params.toString();
    return api.get<NewsArticle[]>(`/public/news${queryString ? `?${queryString}` : ''}`);
  },
  getNewsArticle: (slug: string) => api.get<NewsArticle>(`/public/news/${slug}`),
  getEvents: (category?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category);
    const queryString = params.toString();
    return api.get<CollegeEvent[]>(`/public/events${queryString ? `?${queryString}` : ''}`);
  },
  submitEnquiry: (data: EnquirySubmission) =>
    api.post<{ referenceId: string; message: string }>('/public/enquiry', data),
};
