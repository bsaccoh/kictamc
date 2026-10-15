import { Router } from 'express';
import { usersController } from './users.controller';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validator';
import { updateProfileSchema } from './users.schemas';

const router = Router();

router.get('/me', requireAuth, usersController.getProfile);
router.patch('/me', requireAuth, validateRequest(updateProfileSchema), usersController.updateProfile);

// In-app Notifications
router.get('/notifications', requireAuth, usersController.getNotifications);
router.patch('/notifications/read-all', requireAuth, usersController.markAllNotificationsRead);
router.patch('/notifications/:id/read', requireAuth, usersController.markNotificationRead);

export const usersRoutes = router;
