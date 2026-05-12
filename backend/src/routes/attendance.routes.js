const router              = require('express').Router();
const ctrl                = require('../controllers/attendance.controller');
const { authenticate }    = require('../middleware/auth.middleware');
const { validateGps }     = require('../validators/attendance.validator');

router.use(authenticate);

router.post('/signin',  validateGps, ctrl.signIn);
router.post('/signout', validateGps, ctrl.signOut);
router.get('/status',               ctrl.getStatus);
router.get('/history',              ctrl.getHistory);

module.exports = router;
