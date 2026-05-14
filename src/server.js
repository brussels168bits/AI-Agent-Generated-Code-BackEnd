import 'dotenv/config';
import { connectDatabase } from './config/database.js';
import { logger } from './config/logger.js';
import app from './app.js';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  await connectDatabase();
  logger.info('[Database] Connected successfully');

  app.listen(PORT, () => {
    logger.info(`[Server] Running on port ${PORT} | ENV: ${process.env.NODE_ENV}`);
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, '[Server] Failed to start');
  process.exit(1);
});
