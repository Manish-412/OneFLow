const express = require('express');
const { getPendingUsers, updateApprovalStatus, getUsers } = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin.middleware');
const db = require('../config/db');

const router = express.Router();

// Admin routes
router.get('/pending-users', authenticateToken, isAdmin, getPendingUsers);
router.post('/update-status', authenticateToken, isAdmin, updateApprovalStatus);
router.get('/users', authenticateToken, getUsers);

module.exports = router;