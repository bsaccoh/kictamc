import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../../utils/prisma';
import {
  PaymentMethod,
  PaymentStatus,
  ApplicationStatus,
  Role,
} from '@prisma/client';
import {
  generatePaymentConfirmationToken,
  generateInternalPaymentRef,
} from '../../utils/tokens';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config';

export class PaymentsService {
  async submitManualPayment(
    applicationId: string,
    userId: string,
    data: {
      paymentMethod: PaymentMethod;
      providerTransactionReference: string;
      declaredAmountMinor: number;
      paymentType?: 'APPLICATION_FEE' | 'TUITION_MATRICULATION';
      notes?: string;
    },
    file?: Express.Multer.File
  ) {
    const isTuition = data.paymentType === 'TUITION_MATRICULATION';
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { course: true },
    });

    if (!app || app.applicantId !== userId) {
      throw new AppError('Application not found or unauthorized', 404);
    }

    if (!isTuition && app.paymentStatus === PaymentStatus.PAID) {
      throw new AppError('The application fee for this application has already been paid and verified.', 400);
    }

    if (isTuition && app.matriculationFeePaid) {
      throw new AppError('The matriculation fee for this student has already been paid and cleared.', 400);
    }

    // Determine expected amount from snapshot or course
    let expectedAmountMinor =
      app.applicationFeeMinorSnapshot || app.course.applicationFeeMinor;
    if (isTuition) {
      const annualTuition = app.tuitionFeeMinorSnapshot || app.course.tuitionFeeMinor || 450000;
      expectedAmountMinor = data.declaredAmountMinor || Math.round(annualTuition * 0.6);
    }
    const currency = app.currencySnapshot || app.course.currency;

    let receiptPath: string | null = null;
    if (file) {
      const ext = path.extname(file.originalname) || '.jpg';
      const safeFilename = `${crypto.randomUUID()}${ext}`;
      const targetDir = path.join(config.storage.baseDir, 'receipts');

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      receiptPath = path.join(targetDir, safeFilename);
      fs.writeFileSync(receiptPath, file.buffer);
    }

    const internalReference = generateInternalPaymentRef();

    return prisma.$transaction(async (tx) => {
      // Create payment record in PENDING_VERIFICATION state
      const payment = await tx.payment.create({
        data: {
          applicationId,
          internalReference,
          paymentMethod: data.paymentMethod,
          paymentType: isTuition ? 'TUITION_MATRICULATION' : 'APPLICATION_FEE',
          notes: data.notes,
          expectedAmountMinor,
          declaredAmountMinor: data.declaredAmountMinor,
          currency,
          providerTransactionReference: data.providerTransactionReference,
          receiptDocumentPath: receiptPath,
          status: PaymentStatus.PENDING_VERIFICATION,
        },
      });

      // Update application payment status if application fee
      if (!isTuition) {
        await tx.application.update({
          where: { id: applicationId },
          data: {
            paymentStatus: PaymentStatus.PENDING_VERIFICATION,
          },
        });
      }

      // Status history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: app.status,
          toStatus: app.status,
          changedByUserId: userId,
          changeReason: isTuition
            ? `Applicant submitted matriculation & tuition payment proof (${data.paymentMethod}, Ref: ${data.providerTransactionReference})`
            : `Applicant submitted manual payment proof (${data.paymentMethod}, Ref: ${data.providerTransactionReference})`,
        },
      });

      // In-app notification
      await tx.notification.create({
        data: {
          userId,
          title: isTuition ? 'Matriculation Payment Submitted' : 'Payment Proof Submitted',
          message: isTuition
            ? `Your tuition & matriculation payment proof (${data.providerTransactionReference}) of SLE ${(data.declaredAmountMinor / 100).toFixed(2)} has been submitted to the Bursary. Your Matriculation Number will be issued upon clearance.`
            : `Your payment evidence of SLE ${(data.declaredAmountMinor / 100).toFixed(2)} has been submitted. The Finance Office is verifying the transaction against bank records.`,
          type: 'INFO',
        },
      });

      return payment;
    });
  }

  // Simulated Instant Online Payment (Card / Mobile Money)
  async simulateOnlinePayment(
    applicationId: string,
    userId: string,
    options?: {
      paymentType?: 'APPLICATION_FEE' | 'TUITION_MATRICULATION';
      installmentType?: 'FIRST_INSTALLMENT' | 'FULL_SESSION';
    }
  ) {
    const isTuition = options?.paymentType === 'TUITION_MATRICULATION';
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { course: true, applicant: true, academicYear: true },
    });

    if (!app || app.applicantId !== userId) {
      throw new AppError('Application not found or unauthorized', 404);
    }

    if (!isTuition && app.paymentStatus === PaymentStatus.PAID) {
      throw new AppError('This application fee has already been paid and verified.', 400);
    }
    if (isTuition && app.matriculationFeePaid) {
      throw new AppError('This student has already matriculated and paid fees.', 400);
    }

    let expectedAmountMinor =
      app.applicationFeeMinorSnapshot || app.course.applicationFeeMinor;
    if (isTuition) {
      const annualTuition = app.tuitionFeeMinorSnapshot || app.course.tuitionFeeMinor || 450000;
      const isFull = options?.installmentType === 'FULL_SESSION';
      expectedAmountMinor = isFull ? annualTuition : Math.round(annualTuition * 0.6);
    }
    const currency = app.currencySnapshot || app.course.currency;

    const mockRef = `MOCK-${isTuition ? 'TUI' : 'GW'}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const token = generatePaymentConfirmationToken();
    const internalRef = generateInternalPaymentRef();

    return prisma.$transaction(async (tx) => {
      // 1. Create paid Payment record
      const payment = await tx.payment.create({
        data: {
          applicationId,
          internalReference: internalRef,
          paymentMethod: PaymentMethod.ONLINE_MOCK,
          paymentType: isTuition ? 'TUITION_MATRICULATION' : 'APPLICATION_FEE',
          expectedAmountMinor,
          declaredAmountMinor: expectedAmountMinor,
          currency,
          providerTransactionReference: mockRef,
          status: PaymentStatus.PAID,
          submittedAt: new Date(),
          verifiedAt: new Date(),
        },
      });

      // 2. Create or update confirmation token
      const confirmationToken = await tx.paymentConfirmationToken.upsert({
        where: { applicationId },
        update: {
          paymentId: payment.id,
          token,
          isValid: true,
          issuedAt: new Date(),
        },
        create: {
          applicationId,
          paymentId: payment.id,
          token,
          isValid: true,
        },
      });

      let matriculationNumber = app.matriculationNumber;
      if (isTuition && !matriculationNumber) {
        const yearStr = app.academicYear?.name?.match(/\d{4}/)?.[0] || new Date().getFullYear().toString();
        const courseCodeClean = (app.course?.code || 'GEN')
          .replace(/[^a-zA-Z0-9]/g, '')
          .slice(0, 4)
          .toUpperCase();
        const count = await tx.application.count({ where: { isEnrolled: true } });
        const seq = String(count + 1).padStart(4, '0');
        matriculationNumber = `KICTAMC/${yearStr}/${courseCodeClean}/${seq}`;
      }

      // 3. Move application state
      await tx.application.update({
        where: { id: applicationId },
        data: {
          ...(isTuition
            ? {
                matriculationFeePaid: true,
                matriculationFeeMinor: expectedAmountMinor,
                isEnrolled: true,
                enrolledAt: new Date(),
                matriculationNumber,
                offerAccepted: true,
                offerAcceptedAt: new Date(),
              }
            : {
                paymentStatus: PaymentStatus.PAID,
                status:
                  app.status === ApplicationStatus.AWAITING_PAYMENT ||
                  app.status === ApplicationStatus.SUBMITTED
                    ? ApplicationStatus.UNDER_REVIEW
                    : app.status,
              }),
        },
      });

      // 4. Status history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: app.status,
          toStatus: app.status,
          changedByUserId: userId,
          changeReason: isTuition
            ? `Instant matriculation payment of SLE ${(expectedAmountMinor / 100).toFixed(2)} completed online. Official Matriculation No: ${matriculationNumber}.`
            : `Instant online payment completed successfully via Mock Gateway (${mockRef}). Token issued: ${token}`,
        },
      });

      // 5. Notification
      await tx.notification.create({
        data: {
          userId,
          title: isTuition ? 'Official Matriculation Certified!' : 'Payment Successful — Token Issued',
          message: isTuition
            ? `Congratulations! Your matriculation fee of SLE ${(expectedAmountMinor / 100).toFixed(2)} was cleared online. Official Matriculation Number: ${matriculationNumber}. Welcome to KICTAMC as a fully matriculated student!`
            : `Your online payment of SLE ${(expectedAmountMinor / 100).toFixed(2)} was successful! Payment Confirmation Token: ${token}. Your application is now Under Review.`,
          type: 'SUCCESS',
        },
      });

      // 6. Audit log
      await tx.auditLog.create({
        data: {
          userId,
          userEmail: app.applicant.email,
          action: isTuition ? 'MATRICULATION_PAYMENT_SUCCESS' : 'ONLINE_PAYMENT_SUCCESS',
          resource: 'Payment',
          resourceId: payment.id,
          details: {
            applicationReference: app.applicationReference,
            token,
            amount: expectedAmountMinor,
            providerReference: mockRef,
            matriculationNumber,
          },
        },
      });

      return {
        payment,
        token: confirmationToken,
        matriculationNumber,
      };
    });
  }

  // Finance Officer Verification
  async verifyPayment(paymentId: string, staffUserId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        application: {
          include: { applicant: true, course: true, academicYear: true },
        },
      },
    });

    if (!payment) throw new AppError('Payment record not found', 404);

    if (payment.status === PaymentStatus.PAID) {
      throw new AppError('This transaction has already been verified.', 400);
    }

    // Generate unique cryptographic token e.g. KICTAMC-PAY-7F3A9C82
    const token = generatePaymentConfirmationToken();
    const isTuition = payment.paymentType === 'TUITION_MATRICULATION';

    return prisma.$transaction(async (tx) => {
      // 1. Mark payment PAID
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAID,
          verifiedAt: new Date(),
          verifiedByUserId: staffUserId,
          rejectionReason: null,
        },
      });

      // 2. Issue Payment Confirmation Token
      const confirmationToken = await tx.paymentConfirmationToken.upsert({
        where: { applicationId: payment.applicationId },
        update: {
          paymentId: payment.id,
          token,
          isValid: true,
          issuedAt: new Date(),
        },
        create: {
          applicationId: payment.applicationId,
          paymentId: payment.id,
          token,
          isValid: true,
        },
      });

      let matriculationNumber = payment.application.matriculationNumber;
      if (isTuition && !matriculationNumber) {
        const yearStr = payment.application.academicYear?.name?.match(/\d{4}/)?.[0] || new Date().getFullYear().toString();
        const courseCodeClean = (payment.application.course?.code || 'GEN')
          .replace(/[^a-zA-Z0-9]/g, '')
          .slice(0, 4)
          .toUpperCase();
        const count = await tx.application.count({ where: { isEnrolled: true } });
        const seq = String(count + 1).padStart(4, '0');
        matriculationNumber = `KICTAMC/${yearStr}/${courseCodeClean}/${seq}`;
      }

      // 3. Move application state
      const nextAppStatus =
        payment.application.status === ApplicationStatus.APPROVED ||
        payment.application.status === ApplicationStatus.REJECTED
          ? payment.application.status
          : ApplicationStatus.UNDER_REVIEW;

      await tx.application.update({
        where: { id: payment.applicationId },
        data: {
          ...(isTuition
            ? {
                matriculationFeePaid: true,
                matriculationFeeMinor: payment.declaredAmountMinor || payment.expectedAmountMinor,
                isEnrolled: true,
                enrolledAt: new Date(),
                matriculationNumber,
                offerAccepted: true,
                offerAcceptedAt: payment.application.offerAcceptedAt || new Date(),
              }
            : {
                paymentStatus: PaymentStatus.PAID,
                status: nextAppStatus,
              }),
        },
      });

      // 4. Record history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: payment.applicationId,
          fromStatus: payment.application.status,
          toStatus: payment.application.status,
          changedByUserId: staffUserId,
          changeReason: isTuition
            ? `Tuition & Matriculation Payment of SLE ${(payment.expectedAmountMinor / 100).toFixed(2)} verified by Finance Office. Official Matriculation No: ${matriculationNumber}.`
            : `Payment of SLE ${(payment.expectedAmountMinor / 100).toFixed(2)} verified by Finance Office. Token issued: ${token}`,
        },
      });

      // 5. Notify applicant
      await tx.notification.create({
        data: {
          userId: payment.application.applicantId,
          title: isTuition ? 'Official Matriculation Certified & Number Issued!' : 'Payment Confirmed — Token Issued',
          message: isTuition
            ? `Your tuition and matriculation fee payment has been verified by the Bursar! Your official Matriculation Number is: ${matriculationNumber}. Your student enrollment clearance card is now active in your portal.`
            : `Your payment has been successfully confirmed by the Finance Office! Payment Confirmation Token: ${token}. Your application is now Under Review.`,
          type: 'SUCCESS',
        },
      });

      // 6. Audit log
      await tx.auditLog.create({
        data: {
          userId: staffUserId,
          action: isTuition ? 'MATRICULATION_PAYMENT_VERIFIED' : 'PAYMENT_VERIFIED',
          resource: 'Payment',
          resourceId: paymentId,
          details: {
            applicationReference: payment.application.applicationReference,
            token,
            amount: payment.expectedAmountMinor,
            matriculationNumber,
            paymentType: payment.paymentType,
          },
        },
      });

      return {
        payment: updatedPayment,
        token: confirmationToken,
        matriculationNumber,
      };
    });
  }

  // Finance Officer Rejection
  async rejectPayment(paymentId: string, staffUserId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new AppError('A valid rejection reason must be supplied.', 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        application: true,
      },
    });

    if (!payment) throw new AppError('Payment not found', 404);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REJECTED,
          rejectionReason: reason,
          verifiedAt: new Date(),
          verifiedByUserId: staffUserId,
        },
      });

      await tx.application.update({
        where: { id: payment.applicationId },
        data: {
          paymentStatus: PaymentStatus.REJECTED,
        },
      });

      // Notify applicant
      await tx.notification.create({
        data: {
          userId: payment.application.applicantId,
          title: 'Payment Verification Rejected',
          message: `Your submitted payment evidence for application ${payment.application.applicationReference} was rejected by Finance. Reason: ${reason}. Please upload valid bank teller evidence or re-pay.`,
          type: 'ERROR',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'PAYMENT_REJECTED',
          resource: 'Payment',
          resourceId: paymentId,
          details: {
            applicationReference: payment.application.applicationReference,
            reason,
          },
        },
      });

      return updated;
    });
  }

  // Token Lookup
  async lookupToken(token: string) {
    const confirmation = await prisma.paymentConfirmationToken.findUnique({
      where: { token: token.trim().toUpperCase() },
      include: {
        application: {
          include: {
            applicant: { select: { firstName: true, surname: true, email: true } },
            course: true,
          },
        },
        payment: {
          include: {
            verifiedBy: { select: { firstName: true, surname: true } },
          },
        },
      },
    });

    if (!confirmation) {
      throw new AppError('Invalid or unissued Payment Confirmation Token.', 404);
    }

    return {
      token: confirmation.token,
      isValid: confirmation.isValid,
      issuedAt: confirmation.issuedAt,
      applicationReference: confirmation.application.applicationReference,
      applicantName: `${confirmation.application.applicant.firstName} ${confirmation.application.applicant.surname}`,
      courseName: confirmation.application.course.name,
      amountPaidSLE: (confirmation.payment.expectedAmountMinor / 100).toFixed(2),
      currency: confirmation.payment.currency,
      paymentMethod: confirmation.payment.paymentMethod,
      verifiedBy: confirmation.payment.verifiedBy
        ? `${confirmation.payment.verifiedBy.firstName} ${confirmation.payment.verifiedBy.surname}`
        : 'Automated Online System',
    };
  }

  // List payments for Finance Ledger
  async listPayments(params: {
    status?: PaymentStatus;
    paymentType?: string;
    search?: string;
  }) {
    const { status, paymentType, search } = params;

    return prisma.payment.findMany({
      where: {
        ...(status && { status }),
        ...(paymentType && paymentType !== 'ALL' && { paymentType }),
        ...(search && {
          OR: [
            { internalReference: { contains: search, mode: 'insensitive' } },
            { providerTransactionReference: { contains: search, mode: 'insensitive' } },
            { application: { applicationReference: { contains: search, mode: 'insensitive' } } },
            { application: { applicant: { surname: { contains: search, mode: 'insensitive' } } } },
          ],
        }),
      },
      include: {
        application: {
          include: {
            applicant: { select: { firstName: true, surname: true, email: true, phone: true } },
            course: true,
          },
        },
        confirmationToken: true,
        verifiedBy: { select: { firstName: true, surname: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }
}

export const paymentsService = new PaymentsService();
