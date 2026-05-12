const attendanceRepo     = require('../repositories/attendance.repository');
const userRepo           = require('../repositories/user.repository');
const { resolveDateRange } = require('../utils/date.utils');

const getUserReport = async (userId, { preset, from, to }) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const range   = resolveDateRange(preset, from, to);
  const records = await attendanceRepo.findSessionsByUser(userId, {
    from:   range.from,
    to:     range.to,
    limit:  1000,
    offset: 0,
  });

  const summary = computeSummary(records);

  return {
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
    },
    period: {
      from: range.from,
      to:   range.to,
      preset: preset || 'custom',
    },
    summary,
    records,
  };
};

const computeSummary = (records) => {
  const completed = records.filter(r => r.signed_out_at !== null);
  const missing   = records.filter(r => r.signed_out_at === null);

  const totalHours = completed.reduce((sum, r) => {
    return sum + parseFloat(r.hours_worked || 0);
  }, 0);

  const lateDays = records.filter(r => r.is_late).length;

  const uniqueDays = new Set(
    records.map(r => new Date(r.signed_in_at).toISOString().split('T')[0])
  ).size;

  return {
    total_days_present:    uniqueDays,
    total_hours_worked:    Math.round(totalHours * 100) / 100,
    average_hours_per_day: uniqueDays > 0
      ? Math.round((totalHours / uniqueDays) * 100) / 100
      : 0,
    days_late:             lateDays,
    missing_signout_count: missing.length,
  };
};

module.exports = { getUserReport, computeSummary };
