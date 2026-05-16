const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const cookieParser   = require('cookie-parser');
const logger         = require('./utils/logger');
const errorHandler   = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');
const routes         = require('./routes/index');
const env            = require('./config/env');

const app = express();

const corsOptions = {
  origin:      env.CORS_ORIGIN,
  credentials: true,
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};

// ── CORS must be first — before helmet, before everything
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ── Security
app.use(helmet());

// ── Body + Cookie parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Rate limiting
app.use(generalLimiter);

// ── Request logger
app.use((req, _res, next) => {
  logger.debug(`→ ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes
app.use('/api', routes);

// ── Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'SyncShift API is running' });
});

// ── 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler
app.use(errorHandler);

module.exports = app;
