import pkg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

// 1. CRITICAL: Initialize environment variables FIRST thing!
dotenv.config();

// Override Node's DNS lookup order to bypass common local network resolution hangs
dns.setDefaultResultOrder('ipv4first'); 
dns.setServers(['8.8.8.8', '8.8.8.4']);

const { Pool } = pkg;

let pool;
let inMemoryMode = false;
let inMemoryData = {
  vehicles: [],
  nextId: 1
};

// Try to connect to the database, fallback to in-memory if connection fails
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false 
      },
      max: 20,                   
      idleTimeoutMillis: 30000,  
      connectionTimeoutMillis: 5000, // Slightly increased to prevent quick timeouts over wireless connections
    });

    pool.on('connect', () => {
      console.log('📡 Database connected successfully to Supabase.');
    });

    pool.on('error', (err) => {
      console.error('⚠️ Database error:', err.message);
      console.warn('⚠️ Falling back to in-memory mode...');
      inMemoryMode = true;
    });
  } catch (err) {
    console.error('⚠️ Database connection setup failed:', err.message);
    console.warn('⚠️ Using in-memory mode for development...');
    inMemoryMode = true;
  }
} else {
  console.warn('⚠️ DATABASE_URL not configured in environment. Using in-memory fallback...');
  inMemoryMode = true;
}

/**
 * Global Query Execution Wrapper
 * Tries real database first, falls back to in-memory seamlessly
 */
export const query = async (text, params) => {
  if (!inMemoryMode && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('❌ Database Query error, falling back to in-memory:', err.message);
      // Don't permanently lock into in-memory unless the pool itself is broken
      // returning the error allows you to see what Postgres rejected
      throw err; 
    }
  }

  // In-memory fallback (for local development/testing)
  if (inMemoryMode) {
    console.log('⚠️ WARNING: Interacting with IN-MEMORY database layer (Non-persistent).');
    
    // Simple in-memory query handler for GET /api/vehicles
    if (text.includes('SELECT * FROM vehicles')) {
      return {
        rows: inMemoryData.vehicles,
        rowCount: inMemoryData.vehicles.length
      };
    }
    
    // Simple in-memory query handler for POST /api/vehicles
    if (text.includes('INSERT INTO vehicles')) {
      const newVehicle = {
        id: inMemoryData.nextId++,
        registration_number: params[0],
        model_name: params[1],
        type: params[2],
        region: params[3],
        max_load_capacity: params[4],
        odometer: params[5],
        acquisition_cost: params[6],
        status: params[7],
        created_at: new Date()
      };
      inMemoryData.vehicles.push(newVehicle);
      return {
        rows: [newVehicle],
        rowCount: 1
      };
    }
  }

  throw new Error('Database query failed and in-memory engine unavailable.');
};