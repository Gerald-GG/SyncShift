const request = require('supertest');
const { app, db, migrate, rollback, truncate, closeDb } = require('./helpers');
const { v4: uuid } = require('uuid');
const bcrypt       = require('bcryptjs');

beforeAll(async () => await migrate());
afterAll(async () => { await rollback(); await closeDb(); });
beforeEach(async () => {
  await truncate('refresh_tokens', 'attendance_sessions', 'users', 'work_schedules', 'office_locations');
});

const seedAdminAndLogin = async () => {
  const hash = await bcrypt.hash('Test1234!', 12);
  const [user] = await db('users').insert({
    id: uuid(), name: 'Admin', email: 'admin@syncshift.dev',
    password_hash: hash, role: 'admin',
  }).returning('*');

  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@syncshift.dev', password: 'Test1234!',
  });
  return { token: res.body.data.accessToken, userId: user.id };
};

const seedSessions = async (userId) => {
  const rows = [0, 1, 2, 3, 4].map(i => ({
    id:            uuid(),
    user_id:       userId,
    signed_in_at:  new Date(Date.now() - (i + 1) * 86400000),
    signed_in_lat: -1.0250,
    signed_in_lng: 36.9450,
    signed_out_at: new Date(Date.now() - (i + 1) * 86400000 + 8 * 3600000),
    signed_out_lat:-1.0250,
    signed_out_lng:36.9450,
    hours_worked:  8.00,
    is_late:       i % 2 === 0,
  }));
  await db('attendance_sessions').insert(rows);
  return rows;
};

describe('GET /api/admin/reports/user/:userId', () => {
  it('returns report with correct summary for preset=week', async () => {
    const { token, userId } = await seedAdminAndLogin();
    await seedSessions(userId);

    const res = await request(app)
      .get(`/api/admin/reports/user/${userId}?preset=week`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.total_days_present).toBe(5);
    expect(res.body.data.summary.total_hours_worked).toBe(40);
    expect(res.body.data.summary.average_hours_per_day).toBe(8);
    expect(res.body.data.summary.days_late).toBe(3);
    expect(res.body.data.summary.missing_signout_count).toBe(0);
  });

  it('returns 403 for employee role', async () => {
    const hash = await bcrypt.hash('Test1234!', 12);
    await db('users').insert({
      id: uuid(), name: 'Emp', email: 'emp@syncshift.dev',
      password_hash: hash, role: 'employee',
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'emp@syncshift.dev', password: 'Test1234!',
    });
    const empToken = loginRes.body.data.accessToken;
    const { userId } = await seedAdminAndLogin();

    const res = await request(app)
      .get(`/api/admin/reports/user/${userId}?preset=week`)
      .set('Authorization', `Bearer ${empToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 404 for unknown userId', async () => {
    const { token } = await seedAdminAndLogin();
    const res = await request(app)
      .get(`/api/admin/reports/user/${uuid()}?preset=week`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('returns CSV when export=csv', async () => {
    const { token, userId } = await seedAdminAndLogin();
    await seedSessions(userId);

    const res = await request(app)
      .get(`/api/admin/reports/user/${userId}?preset=week&export=csv`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('SyncShift Attendance Report');
    expect(res.text).toContain('admin@syncshift.dev');
  });

  it('rejects query with no preset or from date', async () => {
    const { token, userId } = await seedAdminAndLogin();
    const res = await request(app)
      .get(`/api/admin/reports/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
