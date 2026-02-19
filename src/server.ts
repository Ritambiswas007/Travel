import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} (${config.nodeEnv})`);
  logger.info(`API prefix: ${config.apiPrefix}`);
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
