const db = require('../config/db');

const findByEmail = (email) =>
  db('users').where({ email }).first();

const findById = (id) =>
  db('users').where({ id }).first();

const create = (data) =>
  db('users').insert(data).returning('*').then(r => r[0]);

const update = (id, data) =>
  db('users').where({ id }).update(data).returning('*').then(r => r[0]);

module.exports = { findByEmail, findById, create, update };
