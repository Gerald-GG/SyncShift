const request = require('supertest');
const { app, migrate, rollback, truncate, closeDb, createAdminToken, createEmployeeToken } = require('./helpers');

beforeAll(async () => await migrate());
afterAll(async () => { await rollback(); await closeDb(); });
beforeEach(async () => await truncate('refresh_tokens', 'attendance_sessions', 'users', 'work_schedules'));

describe('Admin Routes', () => {
  let adminToken;
  let employeeToken;
  let testUserId;

  beforeEach(async () => {
    adminToken = await createAdminToken();
    employeeToken = await createEmployeeToken();
    
    // Create a test user to manage
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@syncshift.dev',
        password: 'Test123!',
        phone: '0712345678'
      });
    testUserId = userRes.body.data.user.id;
  });

  describe('GET /api/admin/users', () => {
    it('allows admin to list all users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('blocks employee from listing users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${employeeToken}`);
      
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('returns specific user details', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('testuser@syncshift.dev');
    });

    it('returns 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/admin/users/:id', () => {
    it('updates user role', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('admin');
    });

    it('deactivates user account', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: false });
      
      expect(res.status).toBe(200);
      expect(res.body.data.user.is_active).toBe(false);
    });
  });
});
