const request = require('supertest');
const { app, migrate, rollback, truncate, closeDb, createAdminToken } = require('./helpers');

beforeAll(async () => await migrate());
afterAll(async () => { await rollback(); await closeDb(); });
beforeEach(async () => await truncate('office_locations', 'users', 'refresh_tokens'));

describe('Office Locations API', () => {
  let adminToken;
  let locationId;

  beforeEach(async () => {
    adminToken = await createAdminToken();
  });

  describe('POST /api/admin/locations', () => {
    it('creates a new office location', async () => {
      const res = await request(app)
        .post('/api/admin/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'HQ Nairobi',
          latitude: -1.286389,
          longitude: 36.817223,
          radius_m: 100
        });
      
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('HQ Nairobi');
      locationId = res.body.data.id;
    });
  });

  describe('GET /api/admin/locations', () => {
    it('lists all office locations', async () => {
      // Create a location first
      await request(app)
        .post('/api/admin/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Mombasa Office',
          latitude: -4.043477,
          longitude: 39.668206,
          radius_m: 150
        });
      
      const res = await request(app)
        .get('/api/admin/locations')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/admin/locations/:id', () => {
    it('updates location radius', async () => {
      // Create location
      const createRes = await request(app)
        .post('/api/admin/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Location',
          latitude: -1.286389,
          longitude: 36.817223,
          radius_m: 100
        });
      
      const id = createRes.body.data.id;
      
      const res = await request(app)
        .patch(`/api/admin/locations/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ radius_m: 200 });
      
      expect(res.status).toBe(200);
      expect(res.body.data.radius_m).toBe(200);
    });
  });

  describe('DELETE /api/admin/locations/:id', () => {
    it('deactivates a location', async () => {
      const createRes = await request(app)
        .post('/api/admin/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'To Delete',
          latitude: -1.286389,
          longitude: 36.817223,
          radius_m: 100
        });
      
      const id = createRes.body.data.id;
      
      const res = await request(app)
        .delete(`/api/admin/locations/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.is_active).toBe(false);
    });
  });
});
