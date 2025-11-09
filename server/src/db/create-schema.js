require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createTables() {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('\n🔨 Creating tables...');

    // Drop existing tables if they exist (in reverse order of dependencies)
    console.log('Cleaning up existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS 
        expenses,
        vendor_bills,
        customer_invoices,
        purchase_orders,
        sales_orders,
        timesheets,
        tasks,
        projects,
        users
      CASCADE;
    `);

    // Create Users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(120) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role VARCHAR(50) CHECK (role IN ('admin', 'project_manager', 'team_member', 'finance')) DEFAULT 'team_member',
          hourly_rate NUMERIC(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Projects table
    console.log('Creating projects table...');
    await client.query(`
      CREATE TABLE projects (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          description TEXT,
          status VARCHAR(50) CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold')) DEFAULT 'planned',
          budget NUMERIC(12,2),
          deadline DATE,
          project_manager_id INT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Tasks table
    console.log('Creating tasks table...');
    await client.query(`
      CREATE TABLE tasks (
          id SERIAL PRIMARY KEY,
          project_id INT REFERENCES projects(id) ON DELETE CASCADE,
          assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
          title VARCHAR(150) NOT NULL,
          description TEXT,
          status VARCHAR(50) CHECK (status IN ('new', 'in_progress', 'blocked', 'done')) DEFAULT 'new',
          priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
          due_date DATE,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Timesheets table
    console.log('Creating timesheets table...');
    await client.query(`
      CREATE TABLE timesheets (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
          project_id INT REFERENCES projects(id) ON DELETE CASCADE,
          date_worked DATE NOT NULL,
          hours_worked NUMERIC(5,2) CHECK (hours_worked > 0),
          billable BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Sales Orders table
    console.log('Creating sales_orders table...');
    await client.query(`
      CREATE TABLE sales_orders (
          id SERIAL PRIMARY KEY,
          project_id INT REFERENCES projects(id) ON DELETE CASCADE,
          customer_name VARCHAR(150),
          description TEXT,
          total_amount NUMERIC(12,2),
          status VARCHAR(50) CHECK (status IN ('draft', 'confirmed', 'invoiced', 'completed')) DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Purchase Orders table
    console.log('Creating purchase_orders table...');
    await client.query(`
      CREATE TABLE purchase_orders (
          id SERIAL PRIMARY KEY,
          project_id INT REFERENCES projects(id) ON DELETE CASCADE,
          vendor_name VARCHAR(150),
          description TEXT,
          total_amount NUMERIC(12,2),
          status VARCHAR(50) CHECK (status IN ('draft', 'confirmed', 'billed', 'completed')) DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Customer Invoices table
    console.log('Creating customer_invoices table...');
    await client.query(`
      CREATE TABLE customer_invoices (
          id SERIAL PRIMARY KEY,
          project_id INT REFERENCES projects(id) ON DELETE CASCADE,
          sales_order_id INT REFERENCES sales_orders(id) ON DELETE SET NULL,
          invoice_number VARCHAR(50) UNIQUE,
          amount NUMERIC(12,2),
          status VARCHAR(50) CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')) DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Vendor Bills table
    console.log('Creating vendor_bills table...');
    await client.query(`
      CREATE TABLE vendor_bills (
          id SERIAL PRIMARY KEY,
          project_id INT REFERENCES projects(id) ON DELETE CASCADE,
          purchase_order_id INT REFERENCES purchase_orders(id) ON DELETE SET NULL,
          bill_number VARCHAR(50) UNIQUE,
          amount NUMERIC(12,2),
          status VARCHAR(50) CHECK (status IN ('draft', 'received', 'paid', 'cancelled')) DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Expenses table
    console.log('Creating expenses table...');
    await client.query(`
      CREATE TABLE expenses (
          id SERIAL PRIMARY KEY,
          project_id INT REFERENCES projects(id) ON DELETE CASCADE,
          user_id INT REFERENCES users(id) ON DELETE SET NULL,
          description TEXT,
          amount NUMERIC(10,2),
          billable BOOLEAN DEFAULT FALSE,
          status VARCHAR(50) CHECK (status IN ('submitted', 'approved', 'reimbursed', 'rejected')) DEFAULT 'submitted',
          receipt_url TEXT,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Commit transaction
    await client.query('COMMIT');
    console.log('✅ All tables created successfully!');

  } catch (err) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error creating tables:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();