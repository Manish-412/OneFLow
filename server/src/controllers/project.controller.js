const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, status, budget, deadline, 
             tags, cost, revenue, assigned_user, image_url, priority, created_at
      FROM projects
      ORDER BY created_at DESC
    `);
    
    res.json({ success: true, projects: result.rows });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
};

// Get single project by ID
exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT id, name, description, status, budget, deadline, 
             tags, cost, revenue, assigned_user, image_url, priority, created_at
      FROM projects
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    
    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project" });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  const { 
    name, 
    description, 
    status = 'planned', 
    deadline, 
    tags = [], 
    cost = 0, 
    revenue = 0, 
    assigned_user,
    priority = 'medium'
  } = req.body;
  
  try {
    if (!name || !assigned_user || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, assigned_user, and deadline"
      });
    }
    
    const result = await pool.query(`
      INSERT INTO projects (name, description, status, deadline, tags, cost, revenue, assigned_user, priority)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, description, status, deadline, tags, cost, revenue, assigned_user, priority, created_at
    `, [name, description, status, deadline, tags, cost, revenue, assigned_user, priority]);
    
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create project",
      error: error.message 
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    status, 
    deadline, 
    tags, 
    cost, 
    revenue, 
    assigned_user,
    priority,
    progress
  } = req.body;
  
  try {
    // Cast progress explicitly to integer to avoid type determination issues
    const progressValue = progress !== undefined && progress !== null ? parseInt(progress) : null;
    
    console.log('=== UPDATE PROJECT DEBUG ===');
    console.log('Project ID:', id);
    console.log('Progress from request:', progress);
    console.log('Progress value (parsed):', progressValue);
    
    const result = await pool.query(`
      UPDATE projects 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          deadline = COALESCE($4, deadline),
          tags = COALESCE($5, tags),
          cost = COALESCE($6, cost),
          revenue = COALESCE($7, revenue),
          assigned_user = COALESCE($8, assigned_user),
          priority = COALESCE($9, priority),
          progress = COALESCE($10::integer, progress)
      WHERE id = $11
      RETURNING id, name, description, status, deadline, tags, cost, revenue, assigned_user, priority, progress, created_at
    `, [name, description, status, deadline, tags, cost, revenue, assigned_user, priority, progressValue, id]);
    
    console.log('Updated project progress:', result.rows[0].progress);
    console.log('========================');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    
    res.json({
      success: true,
      message: "Project updated successfully",
      project: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: "Failed to update project" });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING id", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    
    res.json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ success: false, message: "Failed to delete project" });
  }
};

// Get project tasks count
exports.getProjectTasksCount = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks
      FROM tasks
      WHERE project_id = $1
    `, [id]);
    
    res.json({
      success: true,
      tasks: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching task counts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch task counts" });
  }
};
