require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test admin users data
const adminUsers = [
  {
    name: 'System Admin',
    email: 'admin@oneflow.com',
    password: 'Admin@123', // In real scenario, use more secure passwords
    role: 'admin',
    hourly_rate: 100
  },
  {
    name: 'Finance Admin',
    email: 'finance@oneflow.com',
    password: 'Finance@123',
    role: 'finance',
    hourly_rate: 85
  }
];

async function createAdminUsers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('\n🔨 Creating admin users...');
    
    for (const admin of adminUsers) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(admin.password, salt);

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [admin.email]
      );

      if (existingUser.rows.length === 0) {
        // Insert new admin user
        await client.query(`
          INSERT INTO users (name, email, password_hash, role, hourly_rate, approval_status)
          VALUES ($1, $2, $3, $4, $5, 'approved')
        `, [admin.name, admin.email, password_hash, admin.role, admin.hourly_rate]);
        
        console.log(`✅ Created ${admin.role} user: ${admin.email}`);
      } else {
        console.log(`ℹ️ User ${admin.email} already exists`);
      }
    }

    await client.query('COMMIT');
    console.log('\n✨ Admin users setup completed!');
    
    // Display all users
    const result = await client.query(`
      SELECT id, name, email, role, approval_status, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log('\n📋 Current users in database:');
    console.table(result.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating admin users:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUsers();