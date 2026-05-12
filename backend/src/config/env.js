require('dotenv').config();

const env = {
  NODE_ENV:            process.env.NODE_ENV || 'development',
  PORT:                process.env.PORT || 5000,

  DB_HOST:             process.env.DB_HOST || 'localhost',
  DB_PORT:             process.env.DB_PORT || 5432,
  DB_NAME:             process.env.DB_NAME || 'syncshift',
  DB_USER:             process.env.DB_USER || 'postgres',
  DB_PASSWORD:         process.env.DB_PASSWORD || '',

  JWT_ACCESS_SECRET:   process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET:  process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_TTL:    process.env.ACCESS_TOKEN_TTL  || '15m',
  REFRESH_TOKEN_TTL:   process.env.REFRESH_TOKEN_TTL || '7d',

  COOKIE_DOMAIN:       process.env.COOKIE_DOMAIN || 'localhost',
  CORS_ORIGIN:         process.env.CORS_ORIGIN   || 'http://localhost:3000',

  MAX_CHECK_IN_RADIUS: parseInt(process.env.MAX_CHECK_IN_RADIUS || '100', 10),
};

const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missing  = required.filter(k => !env[k]);
if (missing.length) {
  console.error(`[env] Missing required variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = env;
