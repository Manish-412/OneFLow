const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const projectController = require('../controllers/project.controller');

// All routes require authentication
router.use(authenticateToken);

// Get all projects
router.get('/', projectController.getAllProjects);

// Get single project
router.get('/:id', projectController.getProjectById);

// Create new project
router.post('/', projectController.createProject);

// Update project
router.put('/:id', projectController.updateProject);

// Delete project
router.delete('/:id', projectController.deleteProject);

// Get project tasks count
router.get('/:id/tasks-count', projectController.getProjectTasksCount);

module.exports = router;
