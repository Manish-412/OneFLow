const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
  next();
};

const checkApprovalStatus = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user's approval status
    const result = await pool.query(
      'SELECT approval_status FROM users WHERE id = ',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const { approval_status } = result.rows[0];
    
    if (approval_status === 'pending') {
      return res.status(403).json({ 
        success: false,
        message: 'Your account is pending approval. Please wait for admin approval.',
        approvalStatus: 'pending'
      });
    }

    if (approval_status === 'rejected') {
      return res.status(403).json({ 
        success: false,
        message: 'Your account registration has been rejected. Please contact admin.',
        approvalStatus: 'rejected'
      });
    }

    // If approved, continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

module.exports = { authenticateToken, requireAdmin, checkApprovalStatus };
