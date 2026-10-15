import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { generateAccessToken } from '../src/utils/tokens';
import { Role, ApplicationStatus, PaymentStatus } from '@prisma/client';

describe('Admissions Administration, Decisions & Reporting Tests', () => {
  let admissionsToken = '';
  let applicantToken = '';
  let applicationId = '';

  beforeAll(async () => {
    const admissionsUser = await prisma.user.findFirst({
      where: { role: Role.ADMISSIONS_OFFICER },
    });
    const applicantUser = await prisma.user.findFirst({
      where: { role: Role.APPLICANT },
    });

    if (admissionsUser) {
      admissionsToken = generateAccessToken({
        userId: admissionsUser.id,
        email: admissionsUser.email,
        role: admissionsUser.role,
      });
    }

    if (applicantUser) {
      applicantToken = generateAccessToken({
        userId: applicantUser.id,
        email: applicantUser.email,
        role: applicantUser.role,
      });

      // Find or create an application to test decisions on
      const activeIntake = await prisma.admissionIntake.findFirst({ where: { isActive: true } });
      const activeCourse = await prisma.course.findFirst({ where: { isActive: true } });

      if (activeIntake && activeCourse) {
        const appRecord = await prisma.application.create({
          data: {
            applicantId: applicantUser.id,
            academicYearId: activeIntake.academicYearId,
            intakeId: activeIntake.id,
            courseId: activeCourse.id,
            applicationReference: `KICTAMC-ADM-${Date.now().toString().slice(-6)}`,
            status: ApplicationStatus.UNDER_REVIEW,
            paymentStatus: PaymentStatus.PAID,
          },
        });
        applicationId = appRecord.id;
      }
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Admissions Applications List & Detail', () => {
    it('should list applications for admissions officer with status filter', async () => {
      const res = await request(app)
        .get('/api/v1/admin/applications?status=UNDER_REVIEW')
        .set('Authorization', `Bearer ${admissionsToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should disallow applicant from accessing admin applications list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/applications')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Applicant Correction Request', () => {
    it('should allow admissions officer to request applicant correction', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/applications/${applicationId}/request-correction`)
        .set('Authorization', `Bearer ${admissionsToken}`)
        .send({
          reason: 'Please upload clearer copy of birth certificate.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ApplicationStatus.ACTION_REQUIRED);
      expect(res.body.data.correctionNotes).toContain('clearer copy');
    });
  });

  describe('Admissions Board Decision Engine', () => {
    it('should issue an APPROVED admission offer with decision remarks', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/applications/${applicationId}/decision`)
        .set('Authorization', `Bearer ${admissionsToken}`)
        .send({
          decision: 'APPROVED',
          decisionNotes: 'Applicant meets entry criteria with 5 WASSCE credits. Recommended for Lower Diploma in IT.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ApplicationStatus.APPROVED);
      expect(res.body.data.decisionRemarks).toContain('Recommended for Lower Diploma');
      expect(res.body.data).toHaveProperty('decisionAt');
    });

    it('should issue a REJECTED admission decision with remarks', async () => {
      // Create a second application to test rejection
      const activeIntake = await prisma.admissionIntake.findFirst({ where: { isActive: true } });
      const activeCourse = await prisma.course.findFirst({ where: { isActive: true } });
      const applicantUser = await prisma.user.findFirst({ where: { role: Role.APPLICANT } });

      const secondApp = await prisma.application.create({
        data: {
          applicantId: applicantUser!.id,
          academicYearId: activeIntake!.academicYearId,
          intakeId: activeIntake!.id,
          courseId: activeCourse!.id,
          applicationReference: `KICTAMC-REJ-${Date.now().toString().slice(-6)}`,
          status: ApplicationStatus.UNDER_REVIEW,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      const res = await request(app)
        .post(`/api/v1/admin/applications/${secondApp.id}/decision`)
        .set('Authorization', `Bearer ${admissionsToken}`)
        .send({
          decision: 'REJECTED',
          rejectionReason: 'Does not satisfy mathematics prerequisite.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ApplicationStatus.REJECTED);
      expect(res.body.data.decisionRemarks).toContain('mathematics prerequisite');
    });
  });

  describe('Operational Dashboard Statistics', () => {
    it('should return operational dashboard metrics to staff', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${admissionsToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalApplications');
      expect(res.body.data).toHaveProperty('approvedApplications');
      expect(res.body.data).toHaveProperty('underReview');
      expect(res.body.data).toHaveProperty('paymentsPendingVerification');
    });
  });
});
