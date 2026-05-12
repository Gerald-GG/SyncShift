const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error(`[${req.method}] ${req.originalUrl} — ${status}: ${message}`, {
    stack: err.stack,
  });

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
