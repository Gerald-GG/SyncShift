module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: [], // ✅ fixed
  verbose: true,
  forceExit: true,
  clearMocks: true,
};