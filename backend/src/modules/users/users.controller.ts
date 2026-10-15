import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { prisma } from '../../utils/prisma';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

export class UsersController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { studentProfile: true },
      });

      if (!user) throw new AppError('User not found', 404);

      return sendSuccess(res, {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        middleName: user.middleName,
        surname: user.surname,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        profile: user.studentProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const {
        firstName,
        middleName,
        surname,
        dateOfBirth,
        ...profileFields
      } = req.body;

      // Update user base fields if present
      if (firstName || surname || middleName !== undefined) {
        await prisma.user.update({
          where: { id: req.user!.userId },
          data: {
            ...(firstName && { firstName }),
            ...(middleName !== undefined && { middleName: middleName || null }),
            ...(surname && { surname }),
          },
        });
      }

      // Upsert studentProfile
      const updatedProfile = await prisma.studentProfile.upsert({
        where: { userId: req.user!.userId },
        update: {
          ...profileFields,
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        },
        create: {
          userId: req.user!.userId,
          ...profileFields,
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        },
      });

      return sendSuccess(res, updatedProfile, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
      return sendSuccess(res, notifications, 'Notifications retrieved.');
    } catch (error) {
      next(error);
    }
  }

  async markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await prisma.notification.updateMany({
        where: { id, userId: req.user!.userId },
        data: { isRead: true },
      });
      return sendSuccess(res, { success: true }, 'Notification marked as read.');
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user!.userId },
        data: { isRead: true },
      });
      return sendSuccess(res, { success: true }, 'All notifications marked as read.');
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
