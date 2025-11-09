const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.signup = async (req, res) => {
  console.log('Signup request received:', { body: req.body });
  const { firstName, lastName, email, password } = req.body;
  
  try {
    if (!firstName || !lastName || !email || !password) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }
    
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Combine first and last name for the name field
    const fullName = `${firstName} ${lastName}`;
    
    const result = await pool.query(
      "INSERT INTO users (name, first_name, last_name, email, password_hash, role, approval_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role, approval_status",
      [fullName, firstName, lastName, email.toLowerCase(), hashedPassword, "team_member", "pending"]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user
    });
  } catch (error) {
    console.error("Signup error details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed",
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Provide email and password" });
    }
    
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    if (user.approval_status === "pending") {
      return res.status(403).json({ success: false, message: "Account pending approval" });
    }
    
    if (user.approval_status === "rejected") {
      return res.status(403).json({ success: false, message: "Account rejected" });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, approvalStatus: user.approval_status }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, first_name, last_name, email, role, approval_status, created_at FROM users WHERE approval_status = $1", ["pending"]);
    res.json({ success: true, pendingUsers: result.rows });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

exports.updateApprovalStatus = async (req, res) => {
  const { userId, status, role } = req.body;
  
  try {
    if (!userId || !status) {
      return res.status(400).json({ success: false, message: "Provide userId and status" });
    }
    
    // If approving, also update the role if provided
    let result;
    if (status === 'approved' && role) {
      result = await pool.query(
        "UPDATE users SET approval_status = $1, role = $2 WHERE id = $3 RETURNING id, name, email, role, approval_status", 
        [status, role, userId]
      );
    } else {
      result = await pool.query(
        "UPDATE users SET approval_status = $1 WHERE id = $2 RETURNING id, name, email, role, approval_status", 
        [status, userId]
      );
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, message: "User updated", user: result.rows[0] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// Get all approved users (team members)
exports.getApprovedUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, first_name, last_name, email, role FROM users WHERE approval_status = $1 ORDER BY name ASC", 
      ["approved"]
    );
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error("Error fetching approved users:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  
  console.log('Update user role request:', { userId, role, user: req.user });
  
  try {
    if (!userId || !role) {
      console.log('Missing userId or role');
      return res.status(400).json({ success: false, message: "Provide userId and role" });
    }

    // Validate role
    const validRoles = ['team_member', 'project_manager', 'finance', 'admin'];
    if (!validRoles.includes(role)) {
      console.log('Invalid role:', role);
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    console.log('Executing update query...');
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role", 
      [role, userId]
    );
    
    console.log('Query result:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('User not found with id:', userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    console.log('User role updated successfully');
    res.json({ success: true, message: "User role updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ success: false, message: "Failed to update user role", error: error.message });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  
  try {
    if (!userId) {
      return res.status(400).json({ success: false, message: "Provide userId" });
    }

    // Don't allow deleting yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, email", 
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, message: "User deleted successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

// Update user profile (name and password)
exports.updateProfile = async (req, res) => {
  const { firstName, lastName, currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  try {
    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: "First name and last name are required" });
    }

    // Get current user data
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userResult.rows[0];
    const fullName = `${firstName} ${lastName}`;

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Current password is incorrect" });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update both name and password
      const result = await pool.query(
        "UPDATE users SET name = $1, first_name = $2, last_name = $3, password_hash = $4 WHERE id = $5 RETURNING id, name, email, role",
        [fullName, firstName, lastName, hashedPassword, userId]
      );

      res.json({ 
        success: true, 
        message: "Profile and password updated successfully", 
        user: result.rows[0] 
      });
    } else {
      // Update only name
      const result = await pool.query(
        "UPDATE users SET name = $1, first_name = $2, last_name = $3 WHERE id = $4 RETURNING id, name, email, role",
        [fullName, firstName, lastName, userId]
      );

      res.json({ 
        success: true, 
        message: "Profile updated successfully", 
        user: result.rows[0] 
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
};

