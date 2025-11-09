const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', authenticateToken, dashboardController.getDashboardStats);

// Get project-specific task counts
router.get('/projects/:projectId/task-counts', authenticateToken, dashboardController.getProjectTaskCounts);

// Get all projects with task counts
router.get('/projects-with-counts', authenticateToken, dashboardController.getProjectsWithTaskCounts);

module.exports = router;
