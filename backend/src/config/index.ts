import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder or root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres@127.0.0.1:5432/kictamc_portal?schema=public',
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'kictamc-development-access-secret-2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'kictamc-development-refresh-secret-2026',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '24h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  cookie: {
    secret: process.env.COOKIE_SECRET || 'kictamc-cookie-secret-key-32chars',
    sameSite: (process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax')) as 'strict' | 'lax' | 'none',
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production',
  },

  storage: {
    baseDir: path.resolve(process.env.STORAGE_DIR || path.join(__dirname, '../../../storage')),
    maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '5242880', 10), // 5MB default
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },

  notifications: {
    emailProvider: process.env.EMAIL_PROVIDER || 'console',
    smsProvider: process.env.SMS_PROVIDER || 'console',
    collegeEmail: process.env.COLLEGE_EMAIL || 'admissions@kictamc.edu.sl',
    collegePhone: process.env.COLLEGE_PHONE || '+232-76-000000',
  },
};
