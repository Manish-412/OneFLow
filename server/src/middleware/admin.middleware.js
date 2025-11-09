const db = require('../config/db');

const isAdmin = async (req, res, next) => {
  try {
    // Check if user exists and is admin
    const userId = req.user.id;
    const result = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isAdmin };