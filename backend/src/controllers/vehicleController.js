import { query } from '../config/db.js';

/**
 * Register a New Vehicle Asset
 */
export const registerVehicle = async (req, res) => {
  const { 
    registration_number, 
    model_name, 
    type, 
    region,
    max_load_capacity, 
    odometer, 
    acquisition_cost, 
    status 
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO vehicles (
        registration_number, 
        model_name, 
        type, 
        region,
        max_load_capacity, 
        odometer, 
        acquisition_cost, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        registration_number.toUpperCase(), 
        model_name, 
        type, 
        region || null,
        max_load_capacity, 
        odometer || 0.0, 
        acquisition_cost, 
        status || 'Available'
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
      if (err.code === '23505') {
      return res.status(400).json({ error: "Registration number already exists in the registry." });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Fetch All Master Fleet Directory Entries
 */
export const getAllVehicles = async (req, res) => {
  try {
    const result = await query('SELECT * FROM vehicles ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};