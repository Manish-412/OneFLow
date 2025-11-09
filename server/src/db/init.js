const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function initializeDatabase() {
  try {
    // Create admin user if it doesn't exist
    const adminEmail = 'admin@oneflow.com';
    
    // Check if admin exists
    const adminExists = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    if (adminExists.rows.length === 0) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await db.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)',
        ['Admin', 'User', adminEmail, hashedPassword]
      );
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run initialization
initializeDatabase().catch(console.error);