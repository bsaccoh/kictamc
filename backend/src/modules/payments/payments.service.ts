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

      if (isTuition) {
        await tx.user.update({
          where: { id: app.applicantId },
          data: { role: Role.STUDENT },
        });
      }

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

      if (isTuition) {
        await tx.user.update({
          where: { id: payment.application.applicantId },
          data: { role: Role.STUDENT },
        });
      }

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
    skip?: number;
    take?: number;
  }) {
    const { status, paymentType, search, skip, take } = params;

    const where = {
      ...(status && { status }),
      ...(paymentType && paymentType !== 'ALL' && { paymentType }),
      ...(search && {
        OR: [
          { internalReference: { contains: search, mode: 'insensitive' as const } },
          { providerTransactionReference: { contains: search, mode: 'insensitive' as const } },
          { application: { applicationReference: { contains: search, mode: 'insensitive' as const } } },
          { application: { applicant: { surname: { contains: search, mode: 'insensitive' as const } } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
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
        ...(typeof skip === 'number' && { skip }),
        ...(typeof take === 'number' && { take }),
      }),
      prisma.payment.count({ where }),
    ]);

    return { items, total };
  }

  // Finance Dashboard Aggregations
  async getFinanceDashboardData(period = '30d') {
    const now = new Date();
    let start: Date;
    let end: Date = now;
    let prevStart: Date;
    let prevEnd: Date;
    let dateRangeLabel: string;
    let comparisonLabel = 'vs. previous 30 days';

    switch (period) {
      case 'this_month': {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const monthName = start.toLocaleString('en-US', { month: 'short' });
        dateRangeLabel = `01 ${monthName} ${start.getFullYear()} – ${now.getDate().toString().padStart(2, '0')} ${monthName} ${now.getFullYear()}`;
        comparisonLabel = 'vs. previous month';
        break;
      }
      case 'last_month': {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
        const monthName = start.toLocaleString('en-US', { month: 'short' });
        dateRangeLabel = `01 ${monthName} ${start.getFullYear()} – ${end.getDate().toString().padStart(2, '0')} ${monthName} ${end.getFullYear()}`;
        comparisonLabel = 'vs. prior month';
        break;
      }
      case '90d': {
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        prevStart = new Date(start.getTime() - 90 * 24 * 60 * 60 * 1000);
        prevEnd = start;
        const sMonth = start.toLocaleString('en-US', { month: 'short' });
        const eMonth = end.toLocaleString('en-US', { month: 'short' });
        dateRangeLabel = `${start.getDate().toString().padStart(2, '0')} ${sMonth} ${start.getFullYear()} – ${end.getDate().toString().padStart(2, '0')} ${eMonth} ${end.getFullYear()}`;
        comparisonLabel = 'vs. previous 90 days';
        break;
      }
      case 'this_year': {
        start = new Date(now.getFullYear(), 0, 1);
        prevStart = new Date(now.getFullYear() - 1, 0, 1);
        prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 23, 59, 59, 999);
        dateRangeLabel = `01 Jan ${now.getFullYear()} – ${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;
        comparisonLabel = 'vs. previous year';
        break;
      }
      case 'all': {
        start = new Date(2020, 0, 1);
        prevStart = new Date(2019, 0, 1);
        prevEnd = start;
        dateRangeLabel = 'All Available Records';
        comparisonLabel = 'all-time record';
        break;
      }
      case '30d':
      default: {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        prevStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
        prevEnd = start;
        const sMonth = start.toLocaleString('en-US', { month: 'short' });
        const eMonth = end.toLocaleString('en-US', { month: 'short' });
        dateRangeLabel = `${start.getDate().toString().padStart(2, '0')} ${sMonth} ${start.getFullYear()} – ${end.getDate().toString().padStart(2, '0')} ${eMonth} ${end.getFullYear()}`;
        comparisonLabel = 'vs. previous 30 days';
        break;
      }
    }

    // Query current period payments
    const currentPayments = await prisma.payment.findMany({
      where: {
        submittedAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        application: {
          include: {
            applicant: { select: { firstName: true, surname: true } },
          },
        },
        confirmationToken: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Query previous period payments for trends comparison
    const previousPayments = await prisma.payment.findMany({
      where: {
        submittedAt: {
          gte: prevStart,
          lte: prevEnd,
        },
      },
    });

    const sumMinor = (
      list: { status: PaymentStatus; declaredAmountMinor?: number | null; expectedAmountMinor: number }[],
      status?: PaymentStatus
    ) =>
      list
        .filter((p) => (status ? p.status === status : true))
        .reduce((sum, p) => sum + (p.declaredAmountMinor || p.expectedAmountMinor || 0), 0);


    // Minor to major currency (e.g. 250000 -> 2500)
    const currentTotalReceivedMinor = sumMinor(currentPayments, PaymentStatus.PAID);
    const prevTotalReceivedMinor = sumMinor(previousPayments, PaymentStatus.PAID);

    const currentVerifiedMinor = currentTotalReceivedMinor;
    const prevVerifiedMinor = prevTotalReceivedMinor;

    const currentPendingMinor = sumMinor(currentPayments, PaymentStatus.PENDING_VERIFICATION);
    const prevPendingMinor = sumMinor(previousPayments, PaymentStatus.PENDING_VERIFICATION);

    const currentRejectedMinor = sumMinor(currentPayments, PaymentStatus.REJECTED);
    const prevRejectedMinor = sumMinor(previousPayments, PaymentStatus.REJECTED);

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) {
        return {
          trendPercent: current > 0 ? 100 : 0,
          trendDirection: 'up' as const,
        };
      }
      const diff = current - previous;
      const percent = Math.round(Math.abs((diff / previous) * 100));
      return {
        trendPercent: percent,
        trendDirection: (diff >= 0 ? 'up' : 'down') as 'up' | 'down',
      };
    };

    const currencyLabel = 'Le';
    const formatMoney = (minor: number) =>
      `${currencyLabel} ${Math.round(minor / 100).toLocaleString('en-US')}`;

    const totalTrend = calcTrend(currentTotalReceivedMinor, prevTotalReceivedMinor);
    const verifiedTrend = calcTrend(currentVerifiedMinor, prevVerifiedMinor);
    const pendingTrend = calcTrend(currentPendingMinor, prevPendingMinor);
    const rejectedTrend = calcTrend(currentRejectedMinor, prevRejectedMinor);

    // Multi-series Line Chart: Generate 7 date bucket points across [start, end]
    const numBuckets = 7;
    const bucketDurationMs = (end.getTime() - start.getTime()) / (numBuckets - 1 || 1);
    const paymentTrends: {
      date: string;
      totalReceived: number;
      verified: number;
      pending: number;
      rejected: number;
    }[] = [];

    for (let i = 0; i < numBuckets; i++) {
      const bucketDate = new Date(start.getTime() + i * bucketDurationMs);
      const bucketNext = new Date(start.getTime() + (i + 1) * bucketDurationMs);
      const isLast = i === numBuckets - 1;

      const inBucket = currentPayments.filter((p) => {
        const time = new Date(p.submittedAt).getTime();
        return isLast
          ? time >= bucketDate.getTime() && time <= end.getTime()
          : time >= bucketDate.getTime() && time < bucketNext.getTime();
      });

      const dayMonth = bucketDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });

      const bPaid = sumMinor(inBucket, PaymentStatus.PAID) / 100;
      const bPending = sumMinor(inBucket, PaymentStatus.PENDING_VERIFICATION) / 100;
      const bRejected = sumMinor(inBucket, PaymentStatus.REJECTED) / 100;

      paymentTrends.push({
        date: dayMonth,
        totalReceived: bPaid,
        verified: bPaid,
        pending: bPending,
        rejected: bRejected,
      });
    }

    // Payments by Method (Donut Chart)
    const methodCounts: Record<string, number> = {
      'Online Payment': 0,
      'Bank Transfer': 0,
      'Mobile Money': 0,
      'Cash / Other': 0,
    };

    for (const p of currentPayments) {
      if (p.paymentMethod === PaymentMethod.ONLINE_MOCK) {
        methodCounts['Online Payment']++;
      } else if (p.paymentMethod === PaymentMethod.MANUAL_BANK_DEPOSIT) {
        methodCounts['Bank Transfer']++;
      } else if (
        p.paymentMethod === PaymentMethod.MANUAL_ORANGE_MONEY ||
        p.paymentMethod === PaymentMethod.MANUAL_AFRIMONEY
      ) {
        methodCounts['Mobile Money']++;
      } else {
        methodCounts['Cash / Other']++;
      }
    }

    const totalMethods = currentPayments.length;
    const METHOD_PALETTE: Record<string, string> = {
      'Online Payment': '#1e3a8a',
      'Bank Transfer': '#10b981',
      'Mobile Money': '#f59e0b',
      'Cash / Other': '#ef4444',
    };

    const paymentMethods = Object.entries(methodCounts)
      .map(([method, count]) => ({
        method,
        count,
        sharePercent: totalMethods > 0 ? Math.round((count / totalMethods) * 100) : 0,
        color: METHOD_PALETTE[method],
      }))
      .filter((m) => totalMethods === 0 || m.count > 0);

    // Payment Status Summary (Bar Chart)
    const statusCounts = {
      Verified: currentPayments.filter((p) => p.status === PaymentStatus.PAID).length,
      Pending: currentPayments.filter((p) => p.status === PaymentStatus.PENDING_VERIFICATION).length,
      Rejected: currentPayments.filter((p) => p.status === PaymentStatus.REJECTED).length,
      Failed: currentPayments.filter(
        (p) => p.status === PaymentStatus.REFUNDED || p.status === PaymentStatus.UNPAID
      ).length,
    };

    const paymentStatusSummary = [
      { status: 'Verified', count: statusCounts.Verified },
      { status: 'Pending', count: statusCounts.Pending },
      { status: 'Rejected', count: statusCounts.Rejected },
      { status: 'Failed', count: statusCounts.Failed },
    ];

    // Method formatter helper for table
    const formatMethodName = (pm: PaymentMethod) => {
      switch (pm) {
        case PaymentMethod.ONLINE_MOCK:
          return 'Online';
        case PaymentMethod.MANUAL_BANK_DEPOSIT:
          return 'Bank Transfer';
        case PaymentMethod.MANUAL_ORANGE_MONEY:
          return 'Orange Money';
        case PaymentMethod.MANUAL_AFRIMONEY:
          return 'Afrimoney';
        default:
          return 'Manual Payment';
      }
    };

    // Format table status
    const formatStatusName = (status: PaymentStatus): 'Verified' | 'Pending' | 'Rejected' | 'Failed' => {
      switch (status) {
        case PaymentStatus.PAID:
          return 'Verified';
        case PaymentStatus.PENDING_VERIFICATION:
          return 'Pending';
        case PaymentStatus.REJECTED:
          return 'Rejected';
        default:
          return 'Failed';
      }
    };

    const formatTableDate = (d: Date) => {
      const date = new Date(d);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year} ${hours}:${mins}`;
    };

    // 5-10 Recent Payment Transactions
    const transactions = currentPayments.slice(0, 10).map((p) => ({
      id: p.id,
      applicationReference: p.application.applicationReference,
      studentName: `${p.application.applicant.firstName} ${p.application.applicant.surname}`,
      amount: Math.round((p.declaredAmountMinor || p.expectedAmountMinor || 0) / 100),
      currency: currencyLabel,
      method: formatMethodName(p.paymentMethod),
      status: formatStatusName(p.status),
      dateLabel: formatTableDate(p.submittedAt),
      href: `/admin/payments?ref=${encodeURIComponent(p.application.applicationReference)}`,
      applicationId: p.applicationId,
    }));

    // Time ago helper
    const timeAgo = (date: Date) => {
      const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-GB');
    };

    // Recent Activity Feed
    const recentActivity: {
      id: string;
      kind: 'verified' | 'receipt' | 'rejected' | 'transaction';
      title: string;
      reference?: string;
      detail?: string;
      timeLabel: string;
    }[] = [];

    for (const p of currentPayments.slice(0, 10)) {
      const amountStr = `${currencyLabel} ${Math.round((p.declaredAmountMinor || p.expectedAmountMinor || 0) / 100).toLocaleString('en-US')}`;
      if (p.status === PaymentStatus.PAID && p.verifiedAt) {
        recentActivity.push({
          id: `act-ver-${p.id}`,
          kind: 'verified',
          title: 'Payment verified',
          reference: `${p.application.applicationReference} • ${amountStr}`,
          timeLabel: timeAgo(p.verifiedAt),
        });
      }
      if (p.confirmationToken) {
        recentActivity.push({
          id: `act-tok-${p.confirmationToken.id}`,
          kind: 'receipt',
          title: 'Receipt generated',
          reference: `${p.application.applicationReference} • ${p.confirmationToken.token}`,
          timeLabel: timeAgo(p.confirmationToken.issuedAt),
        });
      }
      if (p.status === PaymentStatus.REJECTED && p.updatedAt) {
        recentActivity.push({
          id: `act-rej-${p.id}`,
          kind: 'rejected',
          title: 'Payment rejected',
          reference: `${p.application.applicationReference} • ${amountStr}`,
          detail: p.rejectionReason || undefined,
          timeLabel: timeAgo(p.updatedAt),
        });
      }
      recentActivity.push({
        id: `act-sub-${p.id}`,
        kind: 'transaction',
        title: 'New transaction',
        reference: `${p.application.applicationReference} • ${amountStr}`,
        timeLabel: timeAgo(p.submittedAt),
      });
    }

    return {
      currencyLabel,
      period,
      dateRangeLabel,
      kpis: {
        totalReceived: {
          title: 'Total Payments Received',
          value: Math.round(currentTotalReceivedMinor / 100),
          formattedValue: formatMoney(currentTotalReceivedMinor),
          trendPercent: totalTrend.trendPercent,
          trendDirection: totalTrend.trendDirection,
          comparisonLabel,
          icon: 'coins' as const,
        },
        verified: {
          title: 'Verified Payments',
          value: Math.round(currentVerifiedMinor / 100),
          formattedValue: formatMoney(currentVerifiedMinor),
          trendPercent: verifiedTrend.trendPercent,
          trendDirection: verifiedTrend.trendDirection,
          comparisonLabel,
          icon: 'card' as const,
        },
        pending: {
          title: 'Pending Verification',
          value: Math.round(currentPendingMinor / 100),
          formattedValue: formatMoney(currentPendingMinor),
          trendPercent: pendingTrend.trendPercent,
          trendDirection: pendingTrend.trendDirection,
          comparisonLabel,
          icon: 'clock' as const,
        },
        rejected: {
          title: 'Rejected Payments',
          value: Math.round(currentRejectedMinor / 100),
          formattedValue: formatMoney(currentRejectedMinor),
          trendPercent: rejectedTrend.trendPercent,
          trendDirection: rejectedTrend.trendDirection,
          comparisonLabel,
          icon: 'alert' as const,
        },
      },
      paymentTrends,
      paymentMethods,
      transactions,
      paymentStatusSummary,
      recentActivity: recentActivity.slice(0, 5),
    };
  }
}

export const paymentsService = new PaymentsService();

