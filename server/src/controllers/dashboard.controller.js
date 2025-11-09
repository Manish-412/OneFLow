const pool = require('../config/db');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Count active projects (not completed or on_hold)
    const activeProjectsResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM projects 
       WHERE status NOT IN ('completed', 'on_hold')`
    );

    // Sum total hours logged from timesheets
    const hoursLoggedResult = await pool.query(
      `SELECT COALESCE(SUM(hours_worked), 0) as total_hours 
       FROM timesheets`
    );

    // Count completed tasks
    const completedTasksResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM tasks 
       WHERE status = 'done'`
    );

    // Count pending tasks (new, in_progress, blocked)
    const pendingTasksResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM tasks 
       WHERE status IN ('new', 'in_progress', 'blocked')`
    );

    res.json({
      activeProjects: parseInt(activeProjectsResult.rows[0].count),
      hoursLogged: parseInt(hoursLoggedResult.rows[0].total_hours),
      completedTasks: parseInt(completedTasksResult.rows[0].count),
      pendingTasks: parseInt(pendingTasksResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Server error while fetching dashboard statistics',
      error: error.message 
    });
  }
};

// Get project-specific task counts
exports.getProjectTaskCounts = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Count total tasks
    const totalTasksResult = await pool.query(
      'SELECT COUNT(*) as count FROM tasks WHERE project_id = $1',
      [projectId]
    );

    // Count completed tasks
    const completedTasksResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM tasks 
       WHERE project_id = $1 AND status = 'done'`,
      [projectId]
    );

    res.json({
      totalTasks: parseInt(totalTasksResult.rows[0].count),
      completedTasks: parseInt(completedTasksResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching project task counts:', error);
    res.status(500).json({ 
      message: 'Server error while fetching task counts',
      error: error.message 
    });
  }
};

// Get all projects with their task counts
exports.getProjectsWithTaskCounts = async (req, res) => {
  try {
    const projectsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.deadline,
        p.tags,
        p.cost,
        p.revenue,
        p.assigned_user,
        p.priority,
        p.image_url,
        p.created_at,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(projectsQuery);

    res.json({
      projects: result.rows
    });
  } catch (error) {
    console.error('Error fetching projects with task counts:', error);
    res.status(500).json({ 
      message: 'Server error while fetching projects',
      error: error.message 
    });
  }
};
