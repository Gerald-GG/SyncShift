const reportService              = require('../services/report.service');
const { toCSV }                  = require('../services/export.service');
const { ok, fail, serverError }  = require('../utils/response');

const getUserReport = async (req, res) => {
  try {
    const { userId }          = req.params;
    const { preset, from, to, export: fmt } = req.query;

    const report = await reportService.getUserReport(userId, { preset, from, to });

    if (fmt === 'csv') {
      const csv = toCSV(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition',
        `attachment; filename="syncshift_report_${userId}_${Date.now()}.csv"`);
      return res.send(csv);
    }

    return ok(res, report, 'Report generated');
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    return serverError(res);
  }
};

module.exports = { getUserReport };
