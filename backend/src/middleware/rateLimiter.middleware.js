const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

/**
 * No-op middleware (used in tests)
 */
const skipLimiter = (req, res, next) => next();

/**
 * Auth limiter (login, refresh, etc.)
 */
const authLimiter = isTest
  ? skipLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        status: 'error',
        message: 'Too many auth attempts. Please try again later.',
      },
    });

/**
 * General API limiter
 */
const generalLimiter = isTest
  ? skipLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        status: 'error',
        message: 'Too many requests. Please try again later.',
      },
    });

module.exports = {
  authLimiter,
  generalLimiter,
};