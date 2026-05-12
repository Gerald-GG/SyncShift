/**
 * Computes hours worked between two Date objects.
 * Returns a decimal rounded to 2 places e.g. 8.50
 */
const computeHoursWorked = (signInAt, signOutAt) => {
  const ms = new Date(signOutAt) - new Date(signInAt);
  if (ms <= 0) return 0;
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100;
};

/**
 * Returns true if signInAt time exceeds shiftStart + graceMinutes.
 * shiftStart format: 'HH:MM:SS'
 */
const isLateArrival = (signInAt, shiftStart, graceMinutes = 0) => {
  const signIn   = new Date(signInAt);
  const [h, m]   = shiftStart.split(':').map(Number);

  const deadline = new Date(signIn);
  deadline.setHours(h, m + graceMinutes, 0, 0);

  return signIn > deadline;
};

module.exports = { computeHoursWorked, isLateArrival };
