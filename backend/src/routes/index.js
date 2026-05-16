const router = require('express').Router();

router.use('/auth',          require('./auth.routes'));
router.use('/attendance',    require('./attendance.routes'));
router.use('/admin/reports', require('./report.routes'));
router.use('/admin',         require('./admin.routes'));

module.exports = router;
