const request = require('supertest');
const { app, migrate, rollback, truncate, closeDb } = require('./helpers');

beforeAll(async () => await migrate());
afterAll(async () => { await rollback(); await closeDb(); });
beforeEach(async () => await truncate());

const BASE   = '/api/auth';
const USER   = { name: 'Test User', email: 'test@syncshift.dev', password: 'Test1234!', phone: '0712345678' };

describe('POST /api/auth/register', () => {
  it('creates a new user and returns sanitized data', async () => {
    const res = await request(app).post(`${BASE}/register`).send(USER);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(USER.email);
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('rejects duplicate email with 409', async () => {
    await request(app).post(`${BASE}/register`).send(USER);
    const res = await request(app).post(`${BASE}/register`).send(USER);
    expect(res.status).toBe(409);
  });

  it('rejects missing required fields with 400', async () => {
    const res = await request(app).post(`${BASE}/register`).send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('rejects weak password under 8 chars', async () => {
    const res = await request(app).post(`${BASE}/register`).send({ ...USER, password: '123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(USER);
  });

  it('returns accessToken and sets refresh cookie on valid credentials', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: USER.email, password: USER.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: USER.email, password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'nobody@syncshift.dev', password: 'Test1234!',
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('issues a new access token using refresh cookie', async () => {
    await request(app).post(`${BASE}/register`).send(USER);
    const agent = request.agent(app);
    await agent.post(`${BASE}/login`).send({ email: USER.email, password: USER.password });
    const res = await agent.post(`${BASE}/refresh`);
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects refresh with no cookie', async () => {
    const res = await request(app).post(`${BASE}/refresh`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/refresh|token|unauthorized/i);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the refresh cookie and invalidates the token', async () => {
    await request(app).post(`${BASE}/register`).send(USER);
    const agent = request.agent(app);
    await agent.post(`${BASE}/login`).send({ email: USER.email, password: USER.password });
    const logout = await agent.post(`${BASE}/logout`);
    expect(logout.status).toBe(200);
    const refresh = await agent.post(`${BASE}/refresh`);
    expect(refresh.status).toBe(401);
  });
});

describe('Auth middleware', () => {
  it('rejects request with no token', async () => {
    const res = await request(app).get('/api/attendance/status');
    expect(res.status).toBe(401);
  });

  it('rejects request with malformed token', async () => {
    const res = await request(app)
      .get('/api/attendance/status')
      .set('Authorization', 'Bearer notavalidtoken');
    expect(res.status).toBe(401);
  });
});