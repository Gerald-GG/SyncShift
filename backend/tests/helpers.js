process.env.DOTENV_CONFIG_PATH = '.env.test';
require('dotenv').config({ path: '.env.test', override: true });

const request = require('supertest');
const db = require('../src/config/db');
const app = require('../src/app');

/**
 * Run latest migrations
 */
const migrate = async () => {
  try {
    await db.migrate.latest();
  } catch (err) {
    console.error('Migration error:', err.message);
  }
};

/**
 * Rollback all migrations (clean slate)
 */
const rollback = async () => {
  try {
    await db.migrate.rollback(null, true);
  } catch (err) {
    console.error('Rollback error:', err.message);
  }
};

/**
 * Truncate specific tables safely (FK-aware)
 */
const truncate = async (...tables) => {
  if (!tables.length) return;

  const tableList = tables.join(', ');

  try {
    await db.raw(`
      TRUNCATE ${tableList}
      RESTART IDENTITY CASCADE;
    `);
  } catch (err) {
    // Ignore errors for non-existent tables
  }
};

/**
 * Truncate ALL tables in public schema
 */
const truncateAll = async () => {
  const result = await db.raw(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `);

  const tables = result.rows
    .map(row => `"${row.tablename}"`)
    .filter(name => name !== '"knex_migrations"' && name !== '"knex_migrations_lock"');

  if (tables.length === 0) return;

  await db.raw(`
    TRUNCATE ${tables.join(', ')}
    RESTART IDENTITY CASCADE;
  `);
};

/**
 * Close DB connection
 */
const closeDb = async () => {
  try {
    await db.destroy();
  } catch (err) {
    // Ignore
  }
};

/**
 * Create an admin token for testing
 */
async function createAdminToken() {
  const adminEmail = `admin_${Date.now()}@syncshift.dev`;
  
  // Register admin
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Admin',
      email: adminEmail,
      password: 'Admin123!',
      phone: '0712345678',
      role: 'admin'
    });
  
  if (!registerRes.body.success) {
    console.error('Admin registration failed:', registerRes.body);
    return null;
  }
  
  // Login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: adminEmail,
      password: 'Admin123!'
    });
  
  if (!loginRes.body.data || !loginRes.body.data.accessToken) {
    console.error('Admin login failed:', loginRes.body);
    return null;
  }
  
  return loginRes.body.data.accessToken;
}

/**
 * Create an employee token for testing
 */
async function createEmployeeToken() {
  const employeeEmail = `employee_${Date.now()}@syncshift.dev`;
  
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Employee',
      email: employeeEmail,
      password: 'Employee123!',
      phone: '0712345678'
    });
  
  if (!registerRes.body.success) {
    console.error('Employee registration failed:', registerRes.body);
    return null;
  }
  
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: employeeEmail,
      password: 'Employee123!'
    });
  
  if (!loginRes.body.data || !loginRes.body.data.accessToken) {
    console.error('Employee login failed:', loginRes.body);
    return null;
  }
  
  return loginRes.body.data.accessToken;
}

// Export all functions
module.exports = { 
  app, 
  db, 
  migrate, 
  rollback, 
  truncate, 
  truncateAll, 
  closeDb,
  createAdminToken,
  createEmployeeToken
};
