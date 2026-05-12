const { v4: uuid }        = require('uuid');
const attendanceRepo      = require('../repositories/attendance.repository');
const locationRepo        = require('../repositories/location.repository');
const userRepo            = require('../repositories/user.repository');
const scheduleRepo        = require('../repositories/schedule.repository');
const { isWithinRadius }  = require('../utils/geo.utils');
const { computeHoursWorked, isLateArrival } = require('../utils/time.utils');
const env                 = require('../config/env');

const validateLocation = async (lat, lng) => {
  const locations = await locationRepo.findAll();
  if (!locations.length) {
    const err = new Error('No active office locations configured');
    err.status = 503;
    throw err;
  }

  for (const loc of locations) {
    const { allowed, distance } = isWithinRadius(
      lat, lng,
      parseFloat(loc.latitude),
      parseFloat(loc.longitude),
      loc.radius_m || env.MAX_CHECK_IN_RADIUS
    );
    if (allowed) return { location: loc, distance };
  }

  const err = new Error('You are not within range of any office location');
  err.status = 403;
  throw err;
};

const signIn = async (userId, { lat, lng }) => {
  // Check for open session
  const open = await attendanceRepo.findOpenSession(userId);
  if (open) {
    const err = new Error('You are already clocked in');
    err.status = 409;
    throw err;
  }

  // Validate GPS server-side
  const { location } = await validateLocation(lat, lng);

  // Determine if late
  const user     = await userRepo.findById(userId);
  let late       = false;
  if (user.schedule_id) {
    const schedule = await scheduleRepo.findById(user.schedule_id);
    if (schedule) {
      late = isLateArrival(new Date(), schedule.shift_start, schedule.grace_minutes);
    }
  }

  const session = await attendanceRepo.createSession({
    id:            uuid(),
    user_id:       userId,
    signed_in_at:  new Date(),
    signed_in_lat: lat,
    signed_in_lng: lng,
    is_late:       late,
  });

  return { session, location: location.name };
};

const signOut = async (userId, { lat, lng }) => {
  const open = await attendanceRepo.findOpenSession(userId);
  if (!open) {
    const err = new Error('You are not clocked in');
    err.status = 409;
    throw err;
  }

  const signedOutAt  = new Date();
  const hoursWorked  = computeHoursWorked(open.signed_in_at, signedOutAt);

  const session = await attendanceRepo.closeSession(open.id, {
    signed_out_at:  signedOutAt,
    signed_out_lat: lat,
    signed_out_lng: lng,
    hours_worked:   hoursWorked,
  });

  return session;
};

const getStatus = async (userId) => {
  const session = await attendanceRepo.findOpenSession(userId);
  return { clocked_in: !!session, session: session || null };
};

const getHistory = async (userId, query = {}) => {
  const limit  = parseInt(query.limit  || 20, 10);
  const offset = parseInt(query.offset || 0,  10);
  const from   = query.from || null;
  const to     = query.to   || null;

  const [records, total] = await Promise.all([
    attendanceRepo.findSessionsByUser(userId, { from, to, limit, offset }),
    attendanceRepo.countSessionsByUser(userId, { from, to }),
  ]);

  return { records, total, limit, offset };
};

module.exports = { signIn, signOut, getStatus, getHistory };
