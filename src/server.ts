import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} (${config.nodeEnv})`);
  logger.info(`API prefix: ${config.apiPrefix}`);
  if (config.supabase.enabled) {
    logger.info('Supabase storage: enabled (document uploads will use Supabase)');
  } else {
    logger.warn('Supabase storage: disabled (set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env to enable document uploads)');
  }
});

const shutdown = () => {
  logger.info('Shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
