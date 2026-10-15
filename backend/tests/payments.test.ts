import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { generateAccessToken } from '../src/utils/tokens';
import { Role, ApplicationStatus, PaymentStatus } from '@prisma/client';

describe('Payment Submission, Verification & Token Engine Tests', () => {
  let applicantToken = '';
  let financeToken = '';
  let admissionsToken = '';
  let applicantUserId = '';
  let applicationId = '';
  let testPaymentId = '';
  let generatedToken = '';

  beforeAll(async () => {
    const applicantUser = await prisma.user.findFirst({
      where: { role: Role.APPLICANT },
    });
    const financeUser = await prisma.user.findFirst({
      where: { role: Role.FINANCE_OFFICER },
    });
    const admissionsUser = await prisma.user.findFirst({
      where: { role: Role.ADMISSIONS_OFFICER },
    });

    if (applicantUser) {
      applicantUserId = applicantUser.id;
      applicantToken = generateAccessToken({
        userId: applicantUser.id,
        email: applicantUser.email,
        role: applicantUser.role,
      });

      // Get or create draft application for applicant
      const draftRes = await request(app)
        .post('/api/v1/applications/draft')
        .set('Authorization', `Bearer ${applicantToken}`);
      applicationId = draftRes.body.data.id;

      await prisma.paymentConfirmationToken.deleteMany({
        where: { applicationId },
      });
      await prisma.payment.deleteMany({
        where: { applicationId },
      });
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          paymentStatus: PaymentStatus.UNPAID,
          status: ApplicationStatus.AWAITING_PAYMENT,
        },
      });
    }

    if (financeUser) {
      financeToken = generateAccessToken({
        userId: financeUser.id,
        email: financeUser.email,
        role: financeUser.role,
      });
    }

    if (admissionsUser) {
      admissionsToken = generateAccessToken({
        userId: admissionsUser.id,
        email: admissionsUser.email,
        role: admissionsUser.role,
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Manual Payment Submission (Bank / Mobile Money)', () => {
    it('should submit manual payment evidence with valid bank teller slip', async () => {
      // Valid dummy PDF buffer starting with %PDF-
      const fakePdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

      const res = await request(app)
        .post(`/api/v1/applications/${applicationId}/payments`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .field('paymentMethod', 'MANUAL_BANK_DEPOSIT')
        .field('providerTransactionReference', 'SLCB-TX-TEST-9988')
        .field('declaredAmountMinor', '20000')
        .attach('receipt', fakePdfBuffer, {
          filename: 'bank_teller_slip.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe(PaymentStatus.PENDING_VERIFICATION);
      expect(res.body.data.providerTransactionReference).toBe('SLCB-TX-TEST-9988');

      testPaymentId = res.body.data.id;
    });

    it('should disallow admissions officer from verifying payment (RBAC finance check)', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/payments/${testPaymentId}/verify`)
        .set('Authorization', `Bearer ${admissionsToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow Finance Officer to verify payment and issue cryptographic token', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/payments/${testPaymentId}/verify`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.status).toBe(PaymentStatus.PAID);
      expect(res.body.data.token).toHaveProperty('token');
      expect(res.body.data.token.token).toMatch(/^KICTAMC-PAY-[A-Z0-9]+$/);

      generatedToken = res.body.data.token.token;

      // Verify application status updated to UNDER_REVIEW
      const appRecord = await prisma.application.findUnique({
        where: { id: applicationId },
      });
      expect(appRecord?.paymentStatus).toBe(PaymentStatus.PAID);
      expect(appRecord?.status).toBe(ApplicationStatus.UNDER_REVIEW);
    });

    it('should disallow verifying the same payment twice', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/payments/${testPaymentId}/verify`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already been verified');
    });
  });

  describe('Cryptographic Payment Token Lookup', () => {
    it('should allow public verification of issued payment token', async () => {
      const res = await request(app).get(`/api/v1/tokens/${generatedToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBe(generatedToken);
      expect(res.body.data.isValid).toBe(true);
      expect(res.body.data).toHaveProperty('applicationReference');
      expect(res.body.data).toHaveProperty('applicantName');
      expect(res.body.data).toHaveProperty('courseName');
      expect(res.body.data.currency).toBe('SLE');
    });

    it('should return 404 for nonexistent or invalid token', async () => {
      const res = await request(app).get('/api/v1/tokens/KICTAMC-PAY-INVALID999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Finance Officer Payment Rejection', () => {
    let secondPaymentId = '';

    beforeAll(async () => {
      // Create another test payment record directly
      const payment = await prisma.payment.create({
        data: {
          applicationId,
          internalReference: `PAYREF-REJ-${Date.now()}`,
          paymentMethod: 'MANUAL_ORANGE_MONEY',
          expectedAmountMinor: 20000,
          declaredAmountMinor: 15000,
          currency: 'SLE',
          providerTransactionReference: 'OM-BAD-1234',
          status: PaymentStatus.PENDING_VERIFICATION,
        },
      });
      secondPaymentId = payment.id;
    });

    it('should reject payment with mandatory reason', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/payments/${secondPaymentId}/reject`)
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          reason: 'Declared amount of SLE 150 does not match fee requirement of SLE 200.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(PaymentStatus.REJECTED);
      expect(res.body.data.rejectionReason).toContain('Declared amount');
    });
  });

  describe('Simulated Instant Online Payment Gateway (Milestone 7)', () => {
    let newAppId = '';

    beforeAll(async () => {
      // Create a fresh submitted application
      const activeIntake = await prisma.admissionIntake.findFirst({ where: { isActive: true } });
      const activeCourse = await prisma.course.findFirst({ where: { isActive: true } });

      if (activeIntake && activeCourse) {
        const appRecord = await prisma.application.create({
          data: {
            applicantId: applicantUserId,
            academicYearId: activeIntake.academicYearId,
            intakeId: activeIntake.id,
            courseId: activeCourse.id,
            applicationReference: `KICTAMC-SIM-${Date.now().toString().slice(-6)}`,
            status: ApplicationStatus.AWAITING_PAYMENT,
            paymentStatus: PaymentStatus.UNPAID,
            applicationFeeMinorSnapshot: activeCourse.applicationFeeMinor,
          },
        });
        newAppId = appRecord.id;
      }
    });

    it('should process simulated instant online checkout and issue token automatically', async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${newAppId}/payments/simulate-online`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.status).toBe(PaymentStatus.PAID);
      expect(res.body.data.token.token).toMatch(/^KICTAMC-PAY-[A-Z0-9]+$/);

      // Verify application updated
      const updatedApp = await prisma.application.findUnique({
        where: { id: newAppId },
      });
      expect(updatedApp?.paymentStatus).toBe(PaymentStatus.PAID);
      expect(updatedApp?.status).toBe(ApplicationStatus.UNDER_REVIEW);
    });
  });
});
