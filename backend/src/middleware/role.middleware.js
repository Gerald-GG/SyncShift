const { forbidden } = require('../utils/response');
const { ROLES }     = require('../config/constants');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return forbidden(res, 'Insufficient permissions');
  }
  next();
};

const requireAdmin = requireRole(ROLES.ADMIN, ROLES.SUPERADMIN);

module.exports = { requireRole, requireAdmin };
