const path   = require('path');
const dotenv = require('dotenv');

const result = dotenv.config({
  path:     path.resolve(__dirname, '../.env.test'),
  override: true,
});

Object.entries(result.parsed || {}).forEach(([k, v]) => {
  process.env[k] = v;
});
