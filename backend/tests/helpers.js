const path = require('path');

// Override ALL env vars with test config before any module loads
const env = require('dotenv').config({
  path:     path.resolve(__dirname, '../.env.test'),
  override: true,
});

// Manually set vars dotenvx might have already clobbered
Object.entries(env.parsed || {}).forEach(([k, v]) => {
  process.env[k] = v;
});

// Now safe to load app modules
const db  = require('../src/config/db');
const app = require('../src/app');

const migrate  = () => db.migrate.latest();
const rollback = () => db.migrate.rollback(null, true);

const truncate = async () => {
  await db('refresh_tokens').del();
  await db('attendance_sessions').del();
  await db('users').del();
  await db('office_locations').del();
  await db('work_schedules').del();
};

const closeDb = () => db.destroy();

module.exports = { app, db, migrate, rollback, truncate, closeDb };
