const request = require('supertest');
const { app, db, migrate, rollback, truncate, closeDb } = require('./helpers');

beforeAll(async () => await migrate());
afterAll(async () => { await rollback(); await closeDb(); });
beforeEach(async () => {
  await truncate('refresh_tokens', 'attendance_sessions', 'users', 'work_schedules', 'office_locations');
});

const BASE  = '/api/attendance';
const USER  = { name: 'Falcon', email: 'falcon@syncshift.dev', password: 'Test1234!' };
const COORDS = { lat: -1.0250, lng: 36.9450 };
const OUTSIDE = { lat: 51.5074, lng: -0.1278 };

const registerAndLogin = async () => {
  await request(app).post('/api/auth/register').send(USER);
  const res = await request(app).post('/api/auth/login').send({
    email: USER.email, password: USER.password,
  });
  return res.body.data.accessToken;
};

const seedLocation = async (radiusM = 5000) => {
  await db('office_locations').insert({
    id:        require('uuid').v4(),
    name:      'Tatu City, Kiambu',
    latitude:  -1.0250,
    longitude: 36.9450,
    radius_m:  radiusM,
  });
};

describe('GET /api/attendance/status', () => {
  it('returns clocked_in: false when no open session', async () => {
    const token = await registerAndLogin();
    const res   = await request(app)
      .get(`${BASE}/status`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.clocked_in).toBe(false);
    expect(res.body.data.session).toBeNull();
  });
});

describe('POST /api/attendance/signin', () => {
  it('creates session when within radius', async () => {
    const token = await registerAndLogin();
    await seedLocation();
    const res = await request(app)
      .post(`${BASE}/signin`)
      .set('Authorization', `Bearer ${token}`)
      .send(COORDS);
    expect(res.status).toBe(200);
    expect(res.body.data.session.signed_out_at).toBeNull();
    expect(res.body.data.location).toBe('Tatu City, Kiambu');
  });

  it('rejects sign in from outside radius with 403', async () => {
    const token = await registerAndLogin();
    await seedLocation(100);
    const res = await request(app)
      .post(`${BASE}/signin`)
      .set('Authorization', `Bearer ${token}`)
      .send(OUTSIDE);
    expect(res.status).toBe(403);
  });

  it('rejects double sign in with 409', async () => {
    const token = await registerAndLogin();
    await seedLocation();
    await request(app).post(`${BASE}/signin`).set('Authorization', `Bearer ${token}`).send(COORDS);
    const res = await request(app)
      .post(`${BASE}/signin`)
      .set('Authorization', `Bearer ${token}`)
      .send(COORDS);
    expect(res.status).toBe(409);
  });

  it('rejects invalid GPS payload with 400', async () => {
    const token = await registerAndLogin();
    const res   = await request(app)
      .post(`${BASE}/signin`)
      .set('Authorization', `Bearer ${token}`)
      .send({ lat: 'bad', lng: 'data' });
    expect(res.status).toBe(400);
  });

  it('rejects when no office locations configured with 503', async () => {
    const token = await registerAndLogin();
    const res   = await request(app)
      .post(`${BASE}/signin`)
      .set('Authorization', `Bearer ${token}`)
      .send(COORDS);
    expect(res.status).toBe(503);
  });
});

describe('POST /api/attendance/signout', () => {
  it('closes session and computes hours_worked', async () => {
    const token = await registerAndLogin();
    await seedLocation();
    await request(app).post(`${BASE}/signin`).set('Authorization', `Bearer ${token}`).send(COORDS);
    const res = await request(app)
      .post(`${BASE}/signout`)
      .set('Authorization', `Bearer ${token}`)
      .send(COORDS);
    expect(res.status).toBe(200);
    expect(res.body.data.session.signed_out_at).not.toBeNull();
    expect(res.body.data.session.hours_worked).toBeDefined();
  });

  it('rejects signout when not clocked in with 409', async () => {
    const token = await registerAndLogin();
    const res   = await request(app)
      .post(`${BASE}/signout`)
      .set('Authorization', `Bearer ${token}`)
      .send(COORDS);
    expect(res.status).toBe(409);
  });
});

describe('GET /api/attendance/history', () => {
  it('returns paginated session history for the user', async () => {
    const token = await registerAndLogin();
    const res   = await request(app)
      .get(`${BASE}/history`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.records).toBeDefined();
    expect(res.body.data.total).toBeDefined();
  });
});
