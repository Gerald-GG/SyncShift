const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const { v4: uuid} = require('uuid');
const { addDays } = require('date-fns');
const env         = require('../config/env');
const userRepo    = require('../repositories/user.repository');
const tokenRepo   = require('../repositories/token.repository');

const SALT_ROUNDS = 12;

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

const generateAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_TTL }
  );

const generateRefreshToken = async (userId) => {
  const token     = uuid();
  const expiresAt = addDays(new Date(), 7);
  await tokenRepo.save({ user_id: userId, token, expires_at: expiresAt });
  return token;
};

const register = async ({ name, email, phone, password }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const password_hash = await hashPassword(password);
  const user = await userRepo.create({
    id: uuid(),
    name,
    email,
    phone,
    password_hash,
  });

  return sanitize(user);
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw unauthorized();

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw unauthorized();

  if (!user.is_active) {
    const err = new Error('Account is deactivated');
    err.status = 403;
    throw err;
  }

  const accessToken  = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  return { user: sanitize(user), accessToken, refreshToken };
};

const refresh = async (token) => {
  const stored = await tokenRepo.findByToken(token);
  if (!stored || new Date(stored.expires_at) < new Date()) {
    const err = new Error('Invalid or expired refresh token');
    err.status = 401;
    throw err;
  }

  const user = await userRepo.findById(stored.user_id);
  if (!user || !user.is_active) {
    const err = new Error('User not found or inactive');
    err.status = 401;
    throw err;
  }

  await tokenRepo.revoke(token);
  const accessToken  = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  return { accessToken, refreshToken };
};

const logout = async (token) => {
  if (token) await tokenRepo.revoke(token);
};

const sanitize = (user) => {
  const { password_hash, ...safe } = user;
  return safe;
};

const unauthorized = () => {
  const err = new Error('Invalid email or password');
  err.status = 401;
  return err;
};

module.exports = { register, login, refresh, logout };
