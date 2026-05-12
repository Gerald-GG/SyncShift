const request = require('supertest');
const app = require('../src/app');

async function debugLogin() {
  // Register a test user
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Debug User',
      email: 'debug@syncshift.dev',
      password: 'Debug123!',
      phone: '0712345678'
    });
  
  // Login
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'debug@syncshift.dev',
      password: 'Debug123!'
    });
  
  console.log('Login Response Status:', res.status);
  console.log('Login Response Body:', JSON.stringify(res.body, null, 2));
  console.log('Headers:', res.headers['set-cookie']);
  
  process.exit(0);
}

debugLogin();
