import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { paymentsService } from './payments.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { parsePagination, buildPaginatedResult } from '../../utils/pagination';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import fs from 'fs';
import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';

export class PaymentsController {
  async submitManualPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applicationId = String(req.params.id);
      const { paymentMethod, providerTransactionReference, declaredAmountMinor, paymentType, notes } = req.body;

      const payment = await paymentsService.submitManualPayment(
        applicationId,
        req.user!.userId,
        {
          paymentMethod: paymentMethod as PaymentMethod,
          providerTransactionReference,
          declaredAmountMinor: parseInt(declaredAmountMinor, 10),
          paymentType: paymentType as any,
          notes,
        },
        req.file
      );

      return sendCreated(
        res,
        payment,
        'Payment evidence submitted. Verification pending with Finance Office.'
      );
    } catch (error) {
      next(error);
    }
  }

  async simulateOnlinePayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const applicationId = String(req.params.id);
      const { paymentType, installmentType } = req.body;
      const result = await paymentsService.simulateOnlinePayment(applicationId, req.user!.userId, {
        paymentType,
        installmentType,
      });
      return sendCreated(
        res,
        result,
        'Simulated online payment processed successfully and confirmation token generated.'
      );
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const paymentId = String(req.params.id);
      const result = await paymentsService.verifyPayment(paymentId, req.user!.userId);
      return sendSuccess(res, result, 'Payment verified and confirmation token generated.');
    } catch (error) {
      next(error);
    }
  }

  async rejectPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const paymentId = String(req.params.id);
      const { reason } = req.body;
      const result = await paymentsService.rejectPayment(paymentId, req.user!.userId, reason);
      return sendSuccess(res, result, 'Payment rejected with remarks.');
    } catch (error) {
      next(error);
    }
  }

  async lookupToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const token = String(req.params.token);
      const details = await paymentsService.lookupToken(token);
      return sendSuccess(res, details, 'Token lookup verified.');
    } catch (error) {
      next(error);
    }
  }

  async listPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, paymentType, search } = req.query;
      const pagination = parsePagination(req);
      const { items, total } = await paymentsService.listPayments({
        status: status as PaymentStatus,
        paymentType: paymentType as string,
        search: search as string,
        skip: pagination.skip,
        take: pagination.take,
      });
      return sendSuccess(
        res,
        buildPaginatedResult(items, total, pagination),
        'Payments ledger retrieved.'
      );
    } catch (error) {
      next(error);
    }
  }

  async getFinanceDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as string) || '30d';
      const dashboard = await paymentsService.getFinanceDashboardData(period);
      return sendSuccess(res, dashboard, 'Finance dashboard retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  async streamReceiptImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const paymentId = String(req.params.id);
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { application: true },
      });

      if (!payment || !payment.receiptDocumentPath) {
        throw new AppError('Receipt document not found', 404);
      }

      // Authorization check
      if (
        (req.user!.role === 'APPLICANT' || req.user!.role === 'STUDENT') &&
        payment.application.applicantId !== req.user!.userId
      ) {
        throw new AppError('Access forbidden', 403);
      }

      if (!fs.existsSync(payment.receiptDocumentPath)) {
        throw new AppError('Receipt file missing on storage', 404);
      }

      res.setHeader('Content-Type', 'image/jpeg');
      fs.createReadStream(payment.receiptDocumentPath).pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentsController = new PaymentsController();

