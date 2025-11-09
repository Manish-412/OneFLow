const db = require('../config/db');

exports.getPendingUsers = async (req, res, next) => {
  try {
    // Get all pending users
    const result = await db.query(
      'SELECT id, first_name, last_name, email, created_at FROM users WHERE approval_status = $1 ORDER BY created_at DESC',
      ['pending']
    );

    res.json({
      pendingUsers: result.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.updateApprovalStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Update user status and role
    const result = await db.query(
      'UPDATE users SET approval_status = $1, role = CASE WHEN $1 = \'approved\' THEN \'user\' ELSE role END WHERE id = $2 RETURNING id, first_name, last_name, email, approval_status, role',
      [status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${status} successfully`,
      user: result.rows[0],
      role: result.rows[0].role
    });
  } catch (error) {
    next(error);
  }
};