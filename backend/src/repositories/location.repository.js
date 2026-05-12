const db = require('../config/db');

const findAll = () =>
  db('office_locations').where({ is_active: true });

const findById = (id) =>
  db('office_locations').where({ id }).first();

const create = (data) =>
  db('office_locations').insert(data).returning('*').then(r => r[0]);

const update = (id, data) =>
  db('office_locations').where({ id }).update(data).returning('*').then(r => r[0]);

module.exports = { findAll, findById, create, update };
