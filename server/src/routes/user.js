const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

// Get all users (for team member selection)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        username,
        email,
        full_name,
        role as user_role,
        created_at
      FROM users
      WHERE id != $1
      ORDER BY full_name, username
    `, [req.user.id]); // Exclude the current user

    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        id,
        username,
        email,
        full_name,
        role as user_role,
        created_at
      FROM users
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

module.exports = router;
