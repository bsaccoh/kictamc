import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';
import { applicationsController } from '../applications/applications.controller';
import { documentsController } from '../documents/documents.controller';
import { prisma } from '../../utils/prisma';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import { hashPassword } from '../../utils/password';

const router = Router();

router.use(requireAuth);

const staffRoles = [Role.SYSTEM_ADMIN, Role.ADMISSIONS_OFFICER, Role.FINANCE_OFFICER];
const admissionsRoles = [Role.SYSTEM_ADMIN, Role.ADMISSIONS_OFFICER];
const financeRoles = [Role.SYSTEM_ADMIN, Role.FINANCE_OFFICER];

// Applications
router.get('/applications', requireRole(staffRoles), applicationsController.listAdminApplications);
router.get('/applications/:id', requireRole(staffRoles), applicationsController.getApplicationById);
router.post('/applications/batch-schedule-interview', requireRole(admissionsRoles), applicationsController.batchScheduleInterview);
router.post('/applications/batch-decision', requireRole(admissionsRoles), applicationsController.batchDecideApplications);
router.post('/applications/batch-publish-acceptance', requireRole(admissionsRoles), applicationsController.batchPublishAcceptance);
router.post('/applications/:id/decision', requireRole(admissionsRoles), applicationsController.decideApplication);
router.post('/applications/:id/request-correction', requireRole(admissionsRoles), applicationsController.requestCorrection);
router.patch('/applications/:id/reviewer-notes', requireRole(staffRoles), applicationsController.updateReviewerNotes);
router.post('/applications/:id/schedule-interview', requireRole(admissionsRoles), applicationsController.scheduleInterview);
router.post('/applications/:id/interview-decision', requireRole(admissionsRoles), applicationsController.recordInterviewDecision);
router.post('/applications/:id/issue-matriculation', requireRole(admissionsRoles), applicationsController.issueMatriculationNumber);

// Document verification
router.post('/documents/:id/verify', requireRole(admissionsRoles), documentsController.verifyDocument);
router.post('/documents/:id/reject', requireRole(admissionsRoles), documentsController.rejectDocument);

// Users Management
router.get('/users', requireRole([Role.SYSTEM_ADMIN]), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        middleName: true,
        surname: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, users, 'Users retrieved.');
  } catch (error) {
    next(error);
  }
});

// Create Staff Member (Admissions Officer, Finance Officer, or System Admin)
router.post('/users', requireRole([Role.SYSTEM_ADMIN]), async (req, res, next) => {
  try {
    const { email, phone, firstName, middleName, surname, role, password } = req.body;
    if (!email || !phone || !firstName || !surname || !password || !role) {
      return sendError(res, 'Email, phone, first name, surname, role, and password are required.', 400);
    }
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { phone }],
      },
    });
    if (existing) {
      return sendError(res, 'A user with this email or phone number already exists.', 409);
    }
    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        phone,
        firstName,
        middleName: middleName || null,
        surname,
        role,
        passwordHash,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        middleName: true,
        surname: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user?.userId,
        action: 'STAFF_CREATED',
        resource: 'User',
        resourceId: newUser.id,
        details: { email: newUser.email, role: newUser.role },
      },
    });

    return sendCreated(res, newUser, 'Staff user created successfully.');
  } catch (error) {
    next(error);
  }
});

// Update User Role or Active Status
router.patch('/users/:id', requireRole([Role.SYSTEM_ADMIN]), async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { role, isActive } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        surname: true,
        role: true,
        isActive: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user?.userId,
        action: 'USER_UPDATED',
        resource: 'User',
        resourceId: updated.id,
        details: { role: updated.role, isActive: updated.isActive },
      },
    });

    return sendSuccess(res, updated, 'User updated successfully.');
  } catch (error) {
    next(error);
  }
});

// Audit logs
router.get('/audit-logs', requireRole([Role.SYSTEM_ADMIN]), async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { email: true, firstName: true, surname: true, role: true } } },
    });
    return sendSuccess(res, logs, 'Audit logs retrieved.');
  } catch (error) {
    next(error);
  }
});

// Operational Dashboard Statistics
router.get('/stats', requireRole(staffRoles), async (req, res, next) => {
  try {
    const [
      totalApplications,
      draftApplications,
      submittedApplications,
      awaitingPayment,
      underReview,
      approvedApplications,
      rejectedApplications,
      paymentsPendingVerification,
      coursesCount,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'DRAFT' } }),
      prisma.application.count({ where: { status: 'SUBMITTED' } }),
      prisma.application.count({ where: { status: 'AWAITING_PAYMENT' } }),
      prisma.application.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.payment.count({ where: { status: 'PENDING_VERIFICATION' } }),
      prisma.course.count({ where: { isActive: true } }),
    ]);

    return sendSuccess(
      res,
      {
        totalApplications,
        draftApplications,
        submittedApplications,
        awaitingPayment,
        underReview,
        approvedApplications,
        rejectedApplications,
        paymentsPendingVerification,
        coursesCount,
      },
      'Operational statistics retrieved.'
    );
  } catch (error) {
    next(error);
  }
});

export const adminRoutes = router;
