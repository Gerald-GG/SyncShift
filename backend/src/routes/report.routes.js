const router   = require('express').Router();
const ctrl     = require('../controllers/report.controller');
const { authenticate }        = require('../middleware/auth.middleware');
const { requireAdmin }        = require('../middleware/role.middleware');
const { validateReportQuery } = require('../validators/report.validator');

router.use(authenticate, requireAdmin);

router.get('/user/:userId', validateReportQuery, ctrl.getUserReport);

module.exports = router;
