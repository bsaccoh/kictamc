import { Router } from 'express';
import multer from 'multer';
import { paymentsController } from './payments.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';
import { config } from '../../config';
import { validateRequest } from '../../middleware/validator';
import { rejectPaymentSchema } from './payments.schemas';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.storage.maxFileSizeBytes,
  },
});

// Public Token lookup verification (for public/employer/student validation)
router.get('/tokens/:token', paymentsController.lookupToken);

router.use(requireAuth);

const financeRoles = [Role.SYSTEM_ADMIN, Role.FINANCE_OFFICER];

// Student manual payment submission
router.post(
  '/applications/:id/payments',
  upload.single('receipt'),
  paymentsController.submitManualPayment
);

// Student instant simulated online payment
router.post(
  '/applications/:id/payments/simulate-online',
  paymentsController.simulateOnlinePayment
);

// Preview receipt file
router.get('/payments/:id/receipt-file', paymentsController.streamReceiptImage);

// Finance Administration
router.get('/admin/payments', requireRole(financeRoles), paymentsController.listPayments);
router.post(
  '/admin/payments/:id/verify',
  requireRole(financeRoles),
  paymentsController.verifyPayment
);
router.post(
  '/admin/payments/:id/reject',
  requireRole(financeRoles),
  validateRequest(rejectPaymentSchema),
  paymentsController.rejectPayment
);

export const paymentsRoutes = router;
