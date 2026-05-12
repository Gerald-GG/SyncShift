const app    = require('./src/app');
const env    = require('./src/config/env');
const logger = require('./src/utils/logger');
const db     = require('./src/config/db');

const start = async () => {
  try {
    await db.raw('SELECT 1');
    logger.info('Database connection established');

    app.listen(env.PORT, () => {
      logger.info(`SyncShift API running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Failed to connect to database', { error: err.message });
    process.exit(1);
  }
};

start();
