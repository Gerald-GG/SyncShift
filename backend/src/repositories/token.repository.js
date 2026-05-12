const db = require('../config/db');

const save = (data) =>
  db('refresh_tokens').insert(data).returning('*').then(r => r[0]);

const findByToken = (token) =>
  db('refresh_tokens').where({ token, revoked: false }).first();

const revoke = (token) =>
  db('refresh_tokens').where({ token }).update({ revoked: true });

const revokeAllForUser = (user_id) =>
  db('refresh_tokens').where({ user_id }).update({ revoked: true });

module.exports = { save, findByToken, revoke, revokeAllForUser };
