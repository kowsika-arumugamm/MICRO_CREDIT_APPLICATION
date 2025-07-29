#!/usr/bin/env node
/**
 * Local Development Startup Script
 * Sets environment variables for local PostgreSQL development
 */

const { spawn } = require('child_process');

// Set environment variables for local development
process.env.DATABASE_URL = 'postgresql://kowsika:testpass@localhost:5432/micro';
process.env.PGHOST = 'localhost';
process.env.PGPORT = '5432';
process.env.PGUSER = 'kowsika';
process.env.PGPASSWORD = 'testpass';
process.env.PGDATABASE = 'micro';
process.env.SESSION_SECRET = 'super-secret-session-key-for-local-development-make-it-long-and-random-123456789';
process.env.LOCAL_AUTH = 'true';
process.env.NODE_ENV = 'development';
process.env.REPL_ID = 'local-development';
process.env.REPLIT_DOMAINS = 'localhost:5000';

console.log('🚀 Starting AI-Powered Micro Loan Application in Local Mode');
console.log('📍 Database: postgresql://kowsika:testpass@localhost:5432/micro');
console.log('🔐 Authentication: Local mode (demo users available)');
console.log('🌐 Server will be available at: http://localhost:5000');
console.log('');

// Start the development server
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down local development server...');
  child.kill('SIGINT');
});