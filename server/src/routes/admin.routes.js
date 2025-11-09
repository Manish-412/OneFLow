const express = require('express');
const { getPendingUsers, updateApprovalStatus } = require('../controllers/admin.controller');
const { auth } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');
const db = require('../config/db');

const router = express.Router();

// Admin routes
router.get('/pending-users', auth, isAdmin, getPendingUsers);
router.post('/update-status', auth, isAdmin, updateApprovalStatus);

module.exports = router;