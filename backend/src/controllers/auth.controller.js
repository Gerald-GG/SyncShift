const authService = require('../services/auth.service');
const { ok, created, fail, serverError } = require('../utils/response');
const { COOKIE } = require('../config/constants');
const env        = require('../config/env');

const cookieOpts = {
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return created(res, { user }, 'Account created successfully');
  } catch (err) {
    if (err.status === 409) return fail(res, err.message, 409);
    return serverError(res);
  }
};

const login = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie(COOKIE.REFRESH_TOKEN, refreshToken, cookieOpts);
    return ok(res, { user, accessToken }, 'Login successful');
  } catch (err) {
    if (err.status === 401) return fail(res, err.message, 401);
    if (err.status === 403) return fail(res, err.message, 403);
    return serverError(res);
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies[COOKIE.REFRESH_TOKEN];
    if (!token) return fail(res, 'No refresh token', 401);
    const { accessToken, refreshToken } = await authService.refresh(token);
    res.cookie(COOKIE.REFRESH_TOKEN, refreshToken, cookieOpts);
    return ok(res, { accessToken }, 'Token refreshed');
  } catch (err) {
    return fail(res, err.message, err.status || 401);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies[COOKIE.REFRESH_TOKEN];
    await authService.logout(token);
    res.clearCookie(COOKIE.REFRESH_TOKEN);
    return ok(res, {}, 'Logged out successfully');
  } catch {
    return serverError(res);
  }
};

module.exports = { register, login, refresh, logout };
