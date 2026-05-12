const request = require('supertest');
const { app, migrate, rollback, truncate, closeDb } = require('./helpers');

beforeAll(async () => await migrate());
afterAll(async () => { await rollback(); await closeDb(); });

describe('Middleware Tests', () => {
  describe('Rate Limiting', () => {
    it('should rate limit auth endpoints', async () => {
      // Make many rapid requests
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: 'wrong' })
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
  
  describe('CORS Headers', () => {
    it('should include CORS headers for allowed origins', async () => {
      const res = await request(app)
        .get('/api/attendance/status')
        .set('Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
      
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });
  
  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const res = await request(app).get('/api/attendance/status');
      
      // Common security headers
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['x-content-type-options']).toBeDefined();
      expect(res.headers['x-xss-protection']).toBeDefined();
    });
  });
});
