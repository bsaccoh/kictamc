import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';

async function bootstrap() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database successfully.');

    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`KICTAMC Backend API server running on port ${config.port} in ${config.env} mode.`);
      logger.info(`Health check: http://127.0.0.1:${config.port}/api/health`);
      logger.info(`API v1 Base: http://127.0.0.1:${config.port}/api/v1`);
    });
  } catch (error: any) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
