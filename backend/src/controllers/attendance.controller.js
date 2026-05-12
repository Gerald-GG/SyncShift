const attendanceService              = require('../services/attendance.service');
const { ok, fail, serverError }      = require('../utils/response');

const signIn = async (req, res) => {
  try {
    const result = await attendanceService.signIn(req.user.id, req.body);
    return ok(res, result, 'Signed in successfully');
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    return serverError(res);
  }
};

const signOut = async (req, res) => {
  try {
    const session = await attendanceService.signOut(req.user.id, req.body);
    return ok(res, { session }, 'Signed out successfully');
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    return serverError(res);
  }
};

const getStatus = async (req, res) => {
  try {
    const status = await attendanceService.getStatus(req.user.id);
    return ok(res, status);
  } catch (err) {
    return serverError(res);
  }
};

const getHistory = async (req, res) => {
  try {
    const result = await attendanceService.getHistory(req.user.id, req.query);
    return ok(res, result);
  } catch (err) {
    return serverError(res);
  }
};

module.exports = { signIn, signOut, getStatus, getHistory };
