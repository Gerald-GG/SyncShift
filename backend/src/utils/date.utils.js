const { subDays, startOfDay, endOfDay, parseISO, isValid } = require('date-fns');

const resolveDateRange = (preset, from, to) => {
  const now = new Date();

  if (preset === 'week')    return { from: subDays(now, 7),  to: now };
  if (preset === '2weeks')  return { from: subDays(now, 14), to: now };
  if (preset === 'month')   return { from: subDays(now, 30), to: now };

  const parsedFrom = parseISO(from);
  const parsedTo   = parseISO(to);

  if (!isValid(parsedFrom) || !isValid(parsedTo)) {
    throw new Error('Invalid date range. Use YYYY-MM-DD format or a valid preset.');
  }

  return { from: startOfDay(parsedFrom), to: endOfDay(parsedTo) };
};

module.exports = { resolveDateRange };
