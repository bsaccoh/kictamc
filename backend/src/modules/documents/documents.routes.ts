import { Router } from 'express';
import multer from 'multer';
import { documentsController } from './documents.controller';
import { requireAuth } from '../../middleware/auth';
import { requireCapability } from '../../middleware/capabilities';
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

// Staff document verification (Admissions Officers, Compliance & Admins)
router.post(
  '/admin/documents/:id/verify',
  requireAuth,
  requireCapability('documents:verify'),
  documentsController.verifyDocument
);
router.post(
  '/admin/documents/:id/reject',
  requireAuth,
  requireCapability('documents:verify'),
  documentsController.rejectDocument
);

export const documentsRoutes = router;
