const db = require('../config/db');

const findAll = () => db('work_schedules');
const findById = (id) => db('work_schedules').where({ id }).first();
const create = (data) =>
  db('work_schedules').insert(data).returning('*').then(r => r[0]);
const update = (id, data) =>
  db('work_schedules').where({ id }).update(data).returning('*').then(r => r[0]);

module.exports = { findAll, findById, create, update };
