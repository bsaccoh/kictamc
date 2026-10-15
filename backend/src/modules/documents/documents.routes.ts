import { Router } from 'express';
import multer from 'multer';
import { documentsController } from './documents.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';
import { config } from '../../config';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.storage.maxFileSizeBytes, // 5MB
  },
});

// Student document management
router.post(
  '/applications/:id/documents',
  requireAuth,
  upload.single('file'),
  documentsController.uploadDocument
);
router.delete(
  '/applications/:id/documents/:docId',
  requireAuth,
  documentsController.deleteDocument
);

// Secure streaming / download (applicants & authorized staff)
router.get('/documents/:id/file', requireAuth, documentsController.downloadOrStreamDocument);

// Staff document verification (Admissions Officers & Admins)
const staffRoles = [Role.SYSTEM_ADMIN, Role.ADMISSIONS_OFFICER];
router.post(
  '/admin/documents/:id/verify',
  requireAuth,
  requireRole(staffRoles),
  documentsController.verifyDocument
);
router.post(
  '/admin/documents/:id/reject',
  requireAuth,
  requireRole(staffRoles),
  documentsController.rejectDocument
);

export const documentsRoutes = router;
