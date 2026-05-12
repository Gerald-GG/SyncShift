const db = require('../config/db');

const findOpenSession = (user_id) =>
  db('attendance_sessions')
    .where({ user_id })
    .whereNull('signed_out_at')
    .first();

const createSession = (data) =>
  db('attendance_sessions').insert(data).returning('*').then(r => r[0]);

const closeSession = (id, data) =>
  db('attendance_sessions').where({ id }).update(data).returning('*').then(r => r[0]);

const findSessionsByUser = (user_id, { from, to, limit = 20, offset = 0 } = {}) => {
  const q = db('attendance_sessions').where({ user_id }).orderBy('signed_in_at', 'desc');
  if (from) q.where('signed_in_at', '>=', from);
  if (to)   q.where('signed_in_at', '<=', to);
  return q.limit(limit).offset(offset);
};

const findSessionById = (id) =>
  db('attendance_sessions').where({ id }).first();

const countSessionsByUser = (user_id, { from, to } = {}) => {
  const q = db('attendance_sessions').where({ user_id }).count('id as count');
  if (from) q.where('signed_in_at', '>=', from);
  if (to)   q.where('signed_in_at', '<=', to);
  return q.first().then(r => parseInt(r.count, 10));
};

module.exports = {
  findOpenSession,
  createSession,
  closeSession,
  findSessionsByUser,
  findSessionById,
  countSessionsByUser,
};
