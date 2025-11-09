const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createAdminUser() {
  try {
    // Admin user details
    const admin = {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@oneflow.com',
      password: 'Admin@123',
      role: 'admin',
      approval_status: 'approved'
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(admin.password, salt);

    // Add role column if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'role') 
        THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        END IF;
      END $$;
    `);

    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [admin.email]
    );

    if (existingAdmin.rows.length === 0) {
      // Create admin user
      await pool.query(
        'INSERT INTO users (first_name, last_name, email, password_hash, role, approval_status) VALUES ($1, $2, $3, $4, $5, $6)',
        [admin.first_name, admin.last_name, admin.email, passwordHash, admin.role, admin.approval_status]
      );
      console.log('Admin user created successfully');
      console.log('Email:', admin.email);
      console.log('Password:', admin.password);
    } else {
      console.log('Admin user already exists');
      console.log('Email:', admin.email);
      console.log('Password: (unchanged)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();