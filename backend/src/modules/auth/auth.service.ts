import { Role, TokenType } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOtp,
} from '../../utils/tokens';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

export interface RegisterDTO {
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDTO) {
    // 1. Check duplicate email or phone
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (existingPhone) {
      throw new AppError('An account with this mobile phone number already exists.', 409);
    }

    // 2. Hash password
    const passwordHash = await hashPassword(data.password);

    // 3. Create user and studentProfile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          passwordHash,
          firstName: data.firstName,
          middleName: data.middleName || null,
          surname: data.surname,
          role: Role.APPLICANT,
          studentProfile: {
            create: {},
          },
        },
        include: {
          studentProfile: true,
        },
      });

      // Generate initial verification OTP
      const emailOtp = generateOtp();
      await tx.verificationToken.create({
        data: {
          userId: newUser.id,
          token: emailOtp,
          type: TokenType.EMAIL_VERIFICATION,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // Create welcome in-app notification
      await tx.notification.create({
        data: {
          userId: newUser.id,
          title: 'Welcome to KICTAMC Portal',
          message: `Welcome ${newUser.firstName}! Your application account has been created. Your verification code is ${emailOtp}.`,
          type: 'INFO',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          userEmail: newUser.email,
          action: 'USER_REGISTERED',
          resource: 'User',
          resourceId: newUser.id,
          details: { role: newUser.role, phone: newUser.phone },
        },
      });

      return { ...newUser, verificationCode: emailOtp };
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        middleName: user.middleName,
        surname: user.surname,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      verificationCode: user.verificationCode,
      accessToken,
      refreshToken,
    };
  }

  async login(emailOrPhone: string, plainPass: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
      },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email/phone or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('This account has been deactivated. Please contact admissions.', 403);
    }

    const isValidPassword = await comparePassword(plainPass, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email/phone or password.', 401);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Record login audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'USER_LOGIN',
        resource: 'User',
        resourceId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        middleName: user.middleName,
        surname: user.surname,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenStr: string) {
    try {
      const payload = verifyRefreshToken(refreshTokenStr);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      const newRefreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new AppError('Invalid refresh token. Please sign in again.', 401);
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return safe message without leaking user existence
      return { message: 'If an account exists with that email, instructions have been sent.' };
    }

    const resetOtp = generateOtp();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: resetOtp,
        type: TokenType.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    logger.info(`[DEV PASSWORD RESET] Code for ${user.email}: ${resetOtp}`);

    return {
      message: 'If an account exists with that email, instructions have been sent.',
      devCode: process.env.NODE_ENV !== 'production' ? resetOtp : undefined,
    };
  }

  async resetPassword(token: string, newPasswordPlain: string) {
    const verification = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: TokenType.PASSWORD_RESET,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new AppError('Invalid or expired password reset token.', 400);
    }

    const passwordHash = await hashPassword(newPasswordPlain);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { passwordHash },
      }),
      prisma.verificationToken.delete({
        where: { id: verification.id },
      }),
      prisma.auditLog.create({
        data: {
          userId: verification.userId,
          action: 'PASSWORD_RESET',
          resource: 'User',
          resourceId: verification.userId,
        },
      }),
    ]);

    return { message: 'Password has been successfully reset. Please log in.' };
  }

  async verifyOtp(userId: string, token: string, type: TokenType) {
    const verification = await prisma.verificationToken.findFirst({
      where: {
        userId,
        token,
        type,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new AppError('Invalid or expired verification code.', 400);
    }

    const updateData =
      type === TokenType.EMAIL_VERIFICATION
        ? { isEmailVerified: true }
        : { isPhoneVerified: true };

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: updateData,
      }),
      prisma.verificationToken.delete({
        where: { id: verification.id },
      }),
    ]);

    return { message: 'Contact details verified successfully.' };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
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
    };
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await comparePassword(currentPass, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password provided is incorrect.', 400);
    }

    const passwordHash = await hashPassword(newPass);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully.' };
  }
}

export const authService = new AuthService();
