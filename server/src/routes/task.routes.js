const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticateToken } = require('../middleware/auth');

// Get all tasks
router.get('/', authenticateToken, taskController.getAllTasks);

// Get tasks by project ID
router.get('/project/:projectId', authenticateToken, taskController.getProjectTasks);

// Get single task by ID
router.get('/:id', authenticateToken, taskController.getTaskById);

// Create new task
router.post('/', authenticateToken, taskController.createTask);

// Update task
router.put('/:id', authenticateToken, taskController.updateTask);

// Mark task as complete
router.patch('/:id/complete', authenticateToken, taskController.markTaskComplete);

// Delete task
router.delete('/:id', authenticateToken, taskController.deleteTask);

module.exports = router;
