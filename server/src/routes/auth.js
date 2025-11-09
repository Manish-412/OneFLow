const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Admin routes for user approval
router.get('/pending-users', authenticateToken, requireAdmin, authController.getPendingUsers);
router.post('/update-approval', authenticateToken, requireAdmin, authController.updateApprovalStatus);

// Get approved users (team members) - accessible to all authenticated users
router.get('/users', authenticateToken, authController.getApprovedUsers);

// Admin routes for managing users
router.put('/update-user-role', authenticateToken, requireAdmin, authController.updateUserRole);
router.delete('/user/:userId', authenticateToken, requireAdmin, authController.deleteUser);

// Profile management - accessible to all authenticated users
router.put('/update-profile', authenticateToken, authController.updateProfile);

module.exports = router;
