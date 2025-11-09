const express = require('express');
const router = express.Router();
const timesheetController = require('../controllers/timesheet.controller');
const { authenticateToken } = require('../middleware/auth');

// Get timesheets for a specific task
router.get('/task/:taskId', authenticateToken, timesheetController.getTaskTimesheets);

// Get timesheets for a specific project
router.get('/project/:projectId', authenticateToken, timesheetController.getProjectTimesheets);

// Create a new timesheet entry
router.post('/', authenticateToken, timesheetController.createTimesheet);

// Update a timesheet entry
router.put('/:id', authenticateToken, timesheetController.updateTimesheet);

// Delete a timesheet entry
router.delete('/:id', authenticateToken, timesheetController.deleteTimesheet);

module.exports = router;
