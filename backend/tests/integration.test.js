const request = require('supertest');
const { app, migrate, rollback, truncate, closeDb } = require('./helpers');

beforeAll(async () => await migrate());
afterAll(async () => { await rollback(); await closeDb(); });
beforeEach(async () => await truncate('refresh_tokens', 'attendance_sessions', 'users', 'work_schedules', 'office_locations'));

describe('Full User Journey', () => {
  let userToken;
  let userId;
  let locationId;
  
  beforeEach(async () => {
    // Setup: Create office location first
    const locationRes = await request(app)
      .post('/api/admin/locations')
      .set('Authorization', `Bearer ${await createAdminToken()}`)
      .send({
        name: 'Test Office',
        latitude: -1.286389,
        longitude: 36.817223,
        radius_m: 100
      });
    locationId = locationRes.body.data.id;
    
    // Register user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Journey User',
        email: 'journey@syncshift.dev',
        password: 'Journey123!',
        phone: '0712345678'
      });
    userId = registerRes.body.data.user.id;
    
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'journey@syncshift.dev',
        password: 'Journey123!'
      });
    userToken = loginRes.body.data.accessToken;
  });
  
  it('completes full day attendance workflow', async () => {
    // 1. Initially not clocked in
    const statusRes = await request(app)
      .get('/api/attendance/status')
      .set('Authorization', `Bearer ${userToken}`);
    expect(statusRes.body.data.clocked_in).toBe(false);
    
    // 2. Clock in (within geofence)
    const signinRes = await request(app)
      .post('/api/attendance/signin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        latitude: -1.286389,
        longitude: 36.817223
      });
    expect(signinRes.status).toBe(201);
    expect(signinRes.body.data.session.signed_in_at).toBeDefined();
    
    // 3. Verify clocked in status
    const statusAfterRes = await request(app)
      .get('/api/attendance/status')
      .set('Authorization', `Bearer ${userToken}`);
    expect(statusAfterRes.body.data.clocked_in).toBe(true);
    
    // 4. Clock out
    const signoutRes = await request(app)
      .post('/api/attendance/signout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        latitude: -1.286389,
        longitude: 36.817223
      });
    expect(signoutRes.status).toBe(200);
    expect(signoutRes.body.data.session.hours_worked).toBeDefined();
    
    // 5. Verify history has the session
    const historyRes = await request(app)
      .get('/api/attendance/history?page=1&limit=10')
      .set('Authorization', `Bearer ${userToken}`);
    expect(historyRes.body.data.sessions.length).toBe(1);
  });
  
  it('prevents duplicate clock-in', async () => {
    // Clock in first time
    await request(app)
      .post('/api/attendance/signin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        latitude: -1.286389,
        longitude: 36.817223
      });
    
    // Try to clock in again
    const secondSignin = await request(app)
      .post('/api/attendance/signin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        latitude: -1.286389,
        longitude: 36.817223
      });
    
    expect(secondSignin.status).toBe(409);
  });
});

// Helper function (duplicate from what would be in helpers.js)
async function createAdminToken() {
  // Register admin
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin User',
      email: 'admin@syncshift.dev',
      password: 'Admin123!',
      phone: '0712345678',
      role: 'admin'
    });
  
  // Login and get token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@syncshift.dev',
      password: 'Admin123!'
    });
  
  return loginRes.body.data.accessToken;
}
