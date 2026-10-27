import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { RequireCapability } from './components/auth/RequireCapability';
import { isStaff } from './lib/permissions';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { PublicLayout } from './layouts/PublicLayout';

// Public Website Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { FacultiesPage } from './pages/public/FacultiesPage';
import { CourseCataloguePage } from './pages/public/CourseCataloguePage';
import { CourseDetailPage as PublicCourseDetailPage } from './pages/public/CourseDetailPage';
import { AdmissionsPage } from './pages/public/AdmissionsPage';
import { HowToApplyPage } from './pages/public/HowToApplyPage';
import { TuitionFeesPage } from './pages/public/TuitionFeesPage';
import { CampusLifePage } from './pages/public/CampusLifePage';
import { AffiliationPage } from './pages/public/AffiliationPage';
import { NewsPage } from './pages/public/NewsPage';
import { NewsDetailPage } from './pages/public/NewsDetailPage';
import { EventsPage } from './pages/public/EventsPage';
import { ContactPage } from './pages/public/ContactPage';
import { FaqPage } from './pages/public/FaqPage';
import { PoliciesPage } from './pages/public/PoliciesPage';

// Public Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyContactPage } from './pages/auth/VerifyContactPage';
import { TokenLookupPage } from './pages/tracking/TokenLookupPage';

// Student Portal Pages
import { StudentDashboardPage } from './pages/dashboard/StudentDashboardPage';
import { StudentProfilePage } from './pages/profile/StudentProfilePage';
import { ProgrammesCatalogPage } from './pages/application/ProgrammesCatalogPage';
import { ApplicationWizardPage } from './pages/application/ApplicationWizardPage';
import { DocumentUploadPage } from './pages/documents/DocumentUploadPage';
import { ApplicationReviewPage } from './pages/application/ApplicationReviewPage';
import { ApplicationTrackingPage } from './pages/tracking/ApplicationTrackingPage';
import { PaymentOptionsPage } from './pages/payments/PaymentOptionsPage';
import { PaymentReceiptPage } from './pages/payments/PaymentReceiptPage';
import { AdmissionLetterPage } from './pages/application/AdmissionLetterPage';
import { HelpSupportPage } from './pages/dashboard/HelpSupportPage';
import { StudentSettingsPage } from './pages/dashboard/StudentSettingsPage';
import { NotificationsInboxPage } from './pages/dashboard/NotificationsInboxPage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminModulePage } from './pages/admin/AdminModulePage';
import { AdmissionsDashboardPage } from './pages/admin/AdmissionsDashboardPage';
import { ApplicationListPage } from './pages/admin/ApplicationListPage';
import { ApplicationDetailPage } from './pages/admin/ApplicationDetailPage';
import { DocumentVerificationPage } from './pages/admin/DocumentVerificationPage';
import { PaymentLedgerPage } from './pages/admin/PaymentLedgerPage';
import { FinanceDashboardPage } from './pages/admin/FinanceDashboardPage';
import { FacultyListPage } from './pages/admin/FacultyListPage';

import { FacultyDetailPage } from './pages/admin/FacultyDetailPage';
import { DepartmentListPage } from './pages/admin/DepartmentListPage';
import { DepartmentDetailPage } from './pages/admin/DepartmentDetailPage';
import { CourseManagementPage } from './pages/admin/CourseManagementPage';
import { CourseDetailPage } from './pages/admin/CourseDetailPage';
import { ApplicationFeesPage } from './pages/admin/ApplicationFeesPage';
import { AcademicYearPage } from './pages/admin/AcademicYearPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { DocumentConfigPage } from './pages/admin/DocumentConfigPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'APPLICANT' || user.role === 'STUDENT') {
    return <Navigate to="/dashboard" replace />;
  }
  if (isStaff(user)) return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth & Token Verification (Simplified Layout, No Authenticated Sidebar) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-contact" element={<VerifyContactPage />} />
            <Route path="/verify-token" element={<TokenLookupPage />} />
            <Route path="/verify-token/:token" element={<TokenLookupPage />} />

            {/* Authenticated Student Portal Routes (With Persistent Left Sidebar) */}
            <Route element={<StudentLayout />}>
              <Route path="/dashboard" element={<StudentDashboardPage />} />
              <Route path="/profile" element={<StudentProfilePage />} />
              <Route path="/apply" element={<ApplicationWizardPage />} />
              <Route path="/programmes" element={<ProgrammesCatalogPage />} />
              <Route path="/documents" element={<DocumentUploadPage />} />
              <Route path="/review" element={<ApplicationReviewPage />} />
              <Route path="/payment" element={<PaymentOptionsPage />} />
              <Route path="/payment/:id" element={<PaymentOptionsPage />} />
              <Route path="/receipt" element={<PaymentReceiptPage />} />
              <Route path="/receipt/:id" element={<PaymentReceiptPage />} />
              <Route path="/admission-letter" element={<AdmissionLetterPage />} />
              <Route path="/admission-letter/:id" element={<AdmissionLetterPage />} />
              <Route path="/tracking" element={<ApplicationTrackingPage />} />
              <Route path="/tracking/:id" element={<ApplicationTrackingPage />} />
              <Route path="/notifications" element={<NotificationsInboxPage />} />
              <Route path="/support" element={<HelpSupportPage />} />
              <Route path="/settings" element={<StudentSettingsPage />} />
            </Route>

            {/* Authenticated Admin & Staff Portal Routes (With Persistent Left Sidebar & RBAC) */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/module" element={<AdminModulePage />} />
              <Route path="/admin/admissions" element={<AdmissionsDashboardPage />} />
              <Route path="/admin/applications" element={<RequireCapability capability="applications:read"><ApplicationListPage /></RequireCapability>} />
              <Route path="/admin/applications/:id" element={<RequireCapability capability="applications:read"><ApplicationDetailPage /></RequireCapability>} />
              <Route path="/admin/admission-letter/:id" element={<RequireCapability capability="admission-letter:issue"><AdmissionLetterPage /></RequireCapability>} />
              <Route path="/admin/documents" element={<RequireCapability capability="documents:verify"><DocumentVerificationPage /></RequireCapability>} />
              <Route path="/admin/finance" element={<RequireCapability capability="payments:read"><FinanceDashboardPage /></RequireCapability>} />
              <Route path="/admin/payments" element={<RequireCapability capability="payments:read"><PaymentLedgerPage /></RequireCapability>} />
              <Route path="/admin/faculties" element={<RequireCapability capability="academics:read"><FacultyListPage /></RequireCapability>} />

              <Route path="/admin/faculties/:id" element={<RequireCapability capability="academics:read"><FacultyDetailPage /></RequireCapability>} />
              <Route path="/admin/departments" element={<RequireCapability capability="academics:read"><DepartmentListPage /></RequireCapability>} />
              <Route path="/admin/departments/:id" element={<RequireCapability capability="academics:read"><DepartmentDetailPage /></RequireCapability>} />
              <Route path="/admin/courses" element={<RequireCapability capability="academics:read"><CourseManagementPage /></RequireCapability>} />
              <Route path="/admin/courses/:id" element={<RequireCapability capability="academics:read"><CourseDetailPage /></RequireCapability>} />
              <Route path="/admin/fees" element={<RequireCapability capability="fees:manage"><ApplicationFeesPage /></RequireCapability>} />
              <Route path="/admin/academic-years" element={<RequireCapability capability="academic-years:manage"><AcademicYearPage /></RequireCapability>} />
              <Route path="/admin/reports" element={<RequireCapability capability="reports:view"><ReportsPage /></RequireCapability>} />
              <Route path="/admin/notifications" element={<NotificationsInboxPage />} />
              <Route path="/admin/users" element={<RequireCapability capability="users:manage"><UserManagementPage /></RequireCapability>} />
              <Route path="/admin/audit" element={<RequireCapability capability="audit:view"><AuditLogsPage /></RequireCapability>} />
              <Route path="/admin/settings" element={<RequireCapability capability="settings:manage"><AdminSettingsPage /></RequireCapability>} />
              <Route path="/admin/document-config" element={<RequireCapability capability="document-config:manage"><DocumentConfigPage /></RequireCapability>} />
            </Route>

            {/* Public Institutional Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faculties" element={<FacultiesPage />} />
              <Route path="/courses" element={<CourseCataloguePage />} />
              <Route path="/courses/:id" element={<PublicCourseDetailPage />} />
              <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="/how-to-apply" element={<HowToApplyPage />} />
              <Route path="/fees" element={<TuitionFeesPage />} />
              <Route path="/affiliation" element={<AffiliationPage />} />
              <Route path="/campus-life" element={<CampusLifePage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/privacy" element={<PoliciesPage />} />
              <Route path="/terms" element={<PoliciesPage />} />
            </Route>

            {/* Portal Bridge */}
            <Route path="/portal" element={<RootRedirect />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
