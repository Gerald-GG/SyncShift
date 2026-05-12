const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/auth.controller');
const attendanceController = require('../controllers/attendance.controller');
const reportController = require('../controllers/report.controller');

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// ==================== AUTH ROUTES ====================
router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.post('/api/auth/refresh', authController.refresh);
router.post('/api/auth/logout', authController.logout);

// ==================== ATTENDANCE ROUTES ====================
router.post('/api/attendance/signin', authenticate, attendanceController.signIn);
router.post('/api/attendance/signout', authenticate, attendanceController.signOut);
router.get('/api/attendance/status', authenticate, attendanceController.getStatus);
router.get('/api/attendance/history', authenticate, attendanceController.getHistory);

// ==================== REPORT ROUTES ====================
router.get('/api/admin/reports/user/:userId', authenticate, requireAdmin, reportController.getUserReport);
router.get('/api/admin/reports/team', authenticate, requireAdmin, reportController.getTeamReport);

// ==================== ADMIN USER ROUTES ====================
router.get('/api/admin/users', authenticate, requireAdmin, adminController.getAllUsers);
router.get('/api/admin/users/:id', authenticate, requireAdmin, adminController.getUserById);
router.patch('/api/admin/users/:id', authenticate, requireAdmin, adminController.updateUser);

// ==================== LOCATION ROUTES ====================
router.post('/api/admin/locations', authenticate, requireAdmin, locationController.createLocation);
router.get('/api/admin/locations', authenticate, requireAdmin, locationController.getAllLocations);
router.patch('/api/admin/locations/:id', authenticate, requireAdmin, locationController.updateLocation);
router.delete('/api/admin/locations/:id', authenticate, requireAdmin, locationController.deleteLocation);

module.exports = router;
