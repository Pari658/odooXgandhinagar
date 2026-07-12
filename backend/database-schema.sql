/**
 * PostgreSQL Database Schema - Fleet Logistics Application
 * 
 * REQUIRED TABLE: trips
 * Status: CRITICAL - Must be created before running the application
 * 
 * Execute this SQL script in your PostgreSQL database to set up the trips table.
 */

-- ============================================================================
-- TABLE: trips
-- ============================================================================
-- Stores all trip records with lifecycle status tracking
-- Status flow: Draft → Dispatched → (Completed | Cancelled)

CREATE TABLE IF NOT EXISTS trips (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Foreign Keys
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,

  -- Trip Details
  source VARCHAR(255) NOT NULL,              -- Starting location
  destination VARCHAR(255) NOT NULL,         -- Ending location
  cargo_weight DECIMAL(10, 2) NOT NULL,      -- Weight in kg
  planned_distance DECIMAL(10, 2) NOT NULL,  -- Distance in km

  -- Status Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes for query optimization
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_driver_id (driver_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC)
);

-- ============================================================================
-- Verify Related Tables Exist
-- ============================================================================
-- The trips table depends on these tables. Ensure they exist:
--
-- 1. vehicles table
--    Required columns: id (PRIMARY KEY), status, updated_at
--    Status values: 'Available', 'On Trip', 'In Shop', 'Retired'
--
-- 2. drivers table
--    Required columns: id (PRIMARY KEY), status, updated_at
--    Status values: 'Available', 'On Trip', 'Off Duty', 'On Leave'

-- ============================================================================
-- Example: Create vehicles table (if not exists)
-- ============================================================================
/*
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  model_name VARCHAR(100),
  type VARCHAR(50),
  region VARCHAR(100),
  max_load_capacity DECIMAL(10, 2),
  odometer DECIMAL(12, 2) DEFAULT 0,
  acquisition_cost DECIMAL(12, 2),
  status VARCHAR(50) DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

-- ============================================================================
-- Example: Create drivers table (if not exists)
-- ============================================================================
/*
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_category VARCHAR(10),
  license_expiry_date DATE,
  contact_number VARCHAR(20),
  status VARCHAR(50) DEFAULT 'Available',
  safety_score DECIMAL(3, 1) DEFAULT 5.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

-- ============================================================================
-- Sample Data (Optional - for testing)
-- ============================================================================
-- Once the tables are created, you can insert sample data:

INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status)
VALUES 
  ('Mumbai, Maharashtra', 'Pune, Maharashtra', 1, 1, 500.00, 150.00, 'Draft'),
  ('Delhi, Delhi', 'Agra, Uttar Pradesh', 2, 2, 1200.00, 230.00, 'Dispatched'),
  ('Bangalore, Karnataka', 'Chennai, Tamil Nadu', 3, 3, 800.00, 350.00, 'Completed')
ON CONFLICT DO NOTHING;
