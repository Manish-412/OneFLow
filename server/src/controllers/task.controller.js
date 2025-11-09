const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `);
    
    console.log('=== FETCHING ALL TASKS ===');
    console.log('Total tasks:', result.rows.length);
    console.log('Sample progress values:', result.rows.slice(0, 3).map(t => ({ id: t.id, title: t.title, progress: t.progress })));
    console.log('========================');
    
    res.json({ success: true, tasks: result.rows });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// Get tasks by project ID
exports.getProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `, [projectId]);
    
    res.json({ success: true, tasks: result.rows });
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project tasks" });
  }
};

// Get single task by ID
exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    
    res.json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ success: false, message: "Failed to fetch task" });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  const { 
    project_id,
    title,
    description,
    assigned_user,
    priority = 'medium',
    status = 'new',
    due_date,
    tags = [],
    cover_image,
    assignee_image,
    progress = 0,
    priority_stars = 2
  } = req.body;
  
  try {
    if (!project_id || !title || !assigned_user) {
      return res.status(400).json({
        success: false,
        message: "Please provide project_id, title, and assigned_user"
      });
    }
    
    const result = await pool.query(`
      INSERT INTO tasks (project_id, title, description, assigned_user, priority, status, due_date, tags, cover_image, assignee_image, progress, priority_stars)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [project_id, title, description, assigned_user, priority, status, due_date, tags, cover_image, assignee_image, progress, priority_stars]);
    
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create task",
      error: error.message 
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { 
    title,
    description,
    assigned_user,
    priority,
    status,
    due_date,
    tags,
    cover_image,
    assignee_image,
    progress,
    priority_stars
  } = req.body;
  
  try {
    // Cast progress explicitly to integer to avoid type determination issues
    const progressValue = progress !== undefined && progress !== null ? parseInt(progress) : null;
    
    console.log('=== UPDATE TASK DEBUG ===');
    console.log('Task ID:', id);
    console.log('Progress from request:', progress);
    console.log('Progress value (parsed):', progressValue);
    console.log('Full request body:', req.body);
    
    const result = await pool.query(`
      UPDATE tasks 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          assigned_user = COALESCE($3, assigned_user),
          priority = COALESCE($4, priority),
          status = COALESCE($5, status),
          due_date = COALESCE($6, due_date),
          tags = COALESCE($7, tags),
          cover_image = COALESCE($8, cover_image),
          assignee_image = COALESCE($9, assignee_image),
          progress = COALESCE($10::integer, progress),
          priority_stars = COALESCE($11, priority_stars)
      WHERE id = $12
      RETURNING *
    `, [title, description, assigned_user, priority, status, due_date, tags, cover_image, assignee_image, progressValue, priority_stars, id]);
    
    console.log('Updated task progress:', result.rows[0].progress);
    console.log('========================');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    
    res.json({
      success: true,
      message: "Task updated successfully",
      task: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

// Mark task as complete
exports.markTaskComplete = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      UPDATE tasks 
      SET status = 'done'
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    
    res.json({
      success: true,
      message: "Task marked as complete",
      task: result.rows[0]
    });
  } catch (error) {
    console.error("Error marking task complete:", error);
    res.status(500).json({ success: false, message: "Failed to mark task as complete" });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    
    res.json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};
