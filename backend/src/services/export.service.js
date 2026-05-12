const { stringify } = require('csv-stringify/sync');

const toCSV = (report) => {
  const rows = report.records.map(r => ({
    Date:         new Date(r.signed_in_at).toISOString().split('T')[0],
    'Sign In':    new Date(r.signed_in_at).toISOString(),
    'Sign Out':   r.signed_out_at ? new Date(r.signed_out_at).toISOString() : 'Missing',
    'Hours':      r.hours_worked ?? '—',
    'Late':       r.is_late ? 'Yes' : 'No',
    'Note':       r.note ?? '',
  }));

  const header = [
    `SyncShift Attendance Report`,
    `Employee: ${report.user.name} (${report.user.email})`,
    `Period: ${new Date(report.period.from).toDateString()} — ${new Date(report.period.to).toDateString()}`,
    `Total Days: ${report.summary.total_days_present} | Total Hours: ${report.summary.total_hours_worked} | Late Days: ${report.summary.days_late} | Missing Sign-out: ${report.summary.missing_signout_count}`,
    '',
  ].join('\n');

  const csv = stringify(rows, { header: true });
  return header + csv;
};

module.exports = { toCSV };
