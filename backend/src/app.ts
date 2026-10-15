import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { academicRoutes } from './modules/academic/academic.routes';
import { applicationsRoutes } from './modules/applications/applications.routes';
import { documentsRoutes } from './modules/documents/documents.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { paymentsRoutes } from './modules/payments/payments.routes';
import { publicRoutes } from './modules/public/public.routes';

const app = express();

// Security and utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',').map((s) => s.trim()) : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, curl, health checks, or same-origin requests with no origin header
      if (!origin) return callback(null, true);

      try {
        const url = new URL(origin);
        if (
          allowedOrigins.includes(origin) ||
          url.hostname.endsWith('.onrender.com') ||
          url.hostname === 'localhost' ||
          url.hostname === '127.0.0.1'
        ) {
          return callback(null, true);
        }
      } catch {
        // invalid URL string, check direct match
        if (allowedOrigins.includes(origin)) return callback(null, true);
      }

      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(cookieParser(config.cookie.secret));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiRateLimiter);

// Root status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KICTAMC Portal Backend API',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      publicApi: '/api/v1/public',
    },
  });
});

// Health check endpoint (supports both /health and /api/health)
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'KICTAMC Portal API',
  });
});

// API v1 Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/applications', applicationsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', academicRoutes);
app.use('/api/v1', documentsRoutes);
app.use('/api/v1', paymentsRoutes);

// Catch 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
