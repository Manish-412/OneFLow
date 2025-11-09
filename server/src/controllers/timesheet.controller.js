const pool = require('../config/db');

// Get all timesheets for a task
exports.getTaskTimesheets = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await pool.query(
      `SELECT 
        t.id,
        t.hours_worked as hours,
        t.date_worked as date,
        t.billable,
        u.name as employee,
        u.id as user_id
      FROM timesheets t
      JOIN users u ON t.user_id = u.id
      WHERE t.task_id = $1
      ORDER BY t.date_worked DESC`,
      [taskId]
    );

    res.json({
      timesheets: result.rows
    });
  } catch (error) {
    console.error('Error fetching task timesheets:', error);
    res.status(500).json({ 
      message: 'Server error while fetching timesheets',
      error: error.message 
    });
  }
};

// Get all timesheets for a project
exports.getProjectTimesheets = async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      `SELECT 
        t.id,
        t.hours_worked as hours,
        t.date_worked as date,
        t.billable,
        u.name as employee,
        u.id as user_id,
        tk.title as task_title,
        tk.id as task_id
      FROM timesheets t
      JOIN users u ON t.user_id = u.id
      JOIN tasks tk ON t.task_id = tk.id
      WHERE t.project_id = $1
      ORDER BY t.date_worked DESC`,
      [projectId]
    );

    res.json({
      timesheets: result.rows
    });
  } catch (error) {
    console.error('Error fetching project timesheets:', error);
    res.status(500).json({ 
      message: 'Server error while fetching timesheets',
      error: error.message 
    });
  }
};

// Create a new timesheet entry
exports.createTimesheet = async (req, res) => {
  try {
    const { taskId, projectId, hours, date, billable = true } = req.body;
    const userId = req.user.id; // From authentication middleware

    // Validate required fields
    if (!taskId || !projectId || !hours || !date) {
      return res.status(400).json({ 
        message: 'Task ID, project ID, hours, and date are required' 
      });
    }

    // Validate hours
    if (hours <= 0 || hours > 24) {
      return res.status(400).json({ 
        message: 'Hours must be between 0 and 24' 
      });
    }

    // Insert timesheet
    const result = await pool.query(
      `INSERT INTO timesheets (user_id, task_id, project_id, date_worked, hours_worked, billable, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, user_id, task_id, project_id, date_worked as date, hours_worked as hours, billable`,
      [userId, taskId, projectId, date, hours, billable]
    );

    // Get employee name
    const userResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [userId]
    );

    const timesheet = {
      ...result.rows[0],
      employee: userResult.rows[0].name
    };

    res.status(201).json({
      message: 'Timesheet created successfully',
      timesheet
    });
  } catch (error) {
    console.error('Error creating timesheet:', error);
    res.status(500).json({ 
      message: 'Server error while creating timesheet',
      error: error.message 
    });
  }
};

// Update a timesheet entry
exports.updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours, date, billable } = req.body;

    // Validate hours if provided
    if (hours !== undefined && (hours <= 0 || hours > 24)) {
      return res.status(400).json({ 
        message: 'Hours must be between 0 and 24' 
      });
    }

    const result = await pool.query(
      `UPDATE timesheets 
       SET hours_worked = COALESCE($1, hours_worked),
           date_worked = COALESCE($2, date_worked),
           billable = COALESCE($3, billable)
       WHERE id = $4
       RETURNING id, user_id, task_id, project_id, date_worked as date, hours_worked as hours, billable`,
      [hours, date, billable, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    // Get employee name
    const userResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [result.rows[0].user_id]
    );

    const timesheet = {
      ...result.rows[0],
      employee: userResult.rows[0].name
    };

    res.json({
      message: 'Timesheet updated successfully',
      timesheet
    });
  } catch (error) {
    console.error('Error updating timesheet:', error);
    res.status(500).json({ 
      message: 'Server error while updating timesheet',
      error: error.message 
    });
  }
};

// Delete a timesheet entry
exports.deleteTimesheet = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM timesheets WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting timesheet:', error);
    res.status(500).json({ 
      message: 'Server error while deleting timesheet',
      error: error.message 
    });
  }
};
