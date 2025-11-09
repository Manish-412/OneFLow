require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const timesheetRoutes = require('./routes/timesheet.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user');
const { errorHandler } = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.connect()
  .then(() => {
    console.log('Successfully connected to PostgreSQL database');
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL database:', err);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', userRoutes);

// Error handling
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log('Server running on http://127.0.0.1:' + PORT);
  console.log('Health check: http://127.0.0.1:' + PORT + '/health');
}).on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process or use a different port.`);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
