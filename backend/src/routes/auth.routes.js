const router   = require('express').Router();
const ctrl     = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', authLimiter, validateRegister, ctrl.register);
router.post('/login',    authLimiter, validateLogin,    ctrl.login);
router.post('/refresh',  authLimiter,                   ctrl.refresh);
router.post('/logout',                                  ctrl.logout);

module.exports = router;
