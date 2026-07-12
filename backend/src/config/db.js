import pkg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first'); 
dns.setServers(['8.8.8.8', '8.8.8.4']);

const { Pool } = pkg;
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL ERROR: DATABASE_URL is missing in your .env file!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  },
  max: 20,                   
  idleTimeoutMillis: 30000,  
  connectionTimeoutMillis: 2000, 
});

pool.on('connect', () => {
  console.log('📡 Dynamic database client checked out from the pool.');
});

pool.on('error', (err) => {
  console.error('⚠️ Unexpected error on idle database client:', err.message);
});

/**
 * Global Query Execution Wrapper
 * Abstracts the client check-out/check-in lifecycle away from controllers.
 * @param {string} text - SQL Query statement string
 * @param {Array} params - Dynamic query parameters
 */
export const query = (text, params) => pool.query(text, params);