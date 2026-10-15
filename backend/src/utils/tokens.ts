import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry as any,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry as any,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
}

export function generateApplicationReference(year = new Date().getFullYear()): string {
  // Format: KICTAMC-YYYY-NNNNNN (random 6 digits or sequential formatted)
  const randomSuffix = crypto.randomInt(100000, 999999).toString();
  return `KICTAMC-${year}-${randomSuffix}`;
}

export function generatePaymentConfirmationToken(): string {
  // Format: KICTAMC-PAY-8HEXCHAR
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `KICTAMC-PAY-${randomHex}`;
}

export function generateInternalPaymentRef(): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `PAY-${timestamp}-${randomHex}`;
}

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}
