import { query } from '../config/db.js';

const validateLicenseFormat = (licenseNumber) => {
  const cleanDL = licenseNumber.replace(/\s+/g, '').toUpperCase();
  
  // 1. Strict formatting check (2 letters, 2 numbers, 11 numbers)
  const dlRegex = /^[A-Z]{2}[0-9]{2}[0-9]{11}$/;
  if (!dlRegex.test(cleanDL)) return false;

  // 2. Exact validation of Indian State/UT Codes
  const validStates = new Set([
    'AP', 'AR', 'AS', 'BR', 'CG', 'GA', 'GJ', 'HR', 'HP', 'JH', 'KA', 'KL', 
    'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD', 'PB', 'RJ', 'SK', 'TN', 'TG', 
    'TR', 'UP', 'UK', 'WB', // 28 States
    'AN', 'CH', 'DN', 'DD', 'DL', 'JK', 'LA', 'LD', 'PY' // Union Territories
  ]);

  const stateCode = cleanDL.substring(0, 2);
  return validStates.has(stateCode);
};

// GET /api/drivers
export const getDrivers = async (req, res) => {
  try {
    const result = await query('SELECT * FROM drivers ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching drivers:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch drivers' });
  }
};

// POST /api/drivers
export const createDriver = async (req, res) => {
  const { name, license_number, license_category, license_expiry_date, contact_number } = req.body;
  
  // Custom Indian License Validation
  if (!validateLicenseFormat(license_number)) {
    return res.status(400).json({ success: false, error: 'Invalid Indian Driving License format or State Code.' });
  }

  try {
    const result = await query(
      `INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, license_number.toUpperCase(), license_category, license_expiry_date, contact_number]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating driver:', err);
    // Unique violation error code in Postgres
    if (err.code === '23505') {
      return res.status(400).json({ success: false, error: 'A driver with this license number already exists.' });
    }
    res.status(400).json({ success: false, error: 'Failed to create driver' });
  }
};

// PUT /api/drivers/:id
export const updateDriver = async (req, res) => {
  const { id } = req.params;
  const { name, license_number, license_category, license_expiry_date, contact_number, status, safety_score } = req.body;
  
  if (license_number && !validateLicenseFormat(license_number)) {
    return res.status(400).json({ success: false, error: 'Invalid Indian Driving License format or State Code.' });
  }

  try {
    const result = await query(
      `UPDATE drivers 
       SET name = $1, license_number = $2, license_category = $3, license_expiry_date = $4, 
           contact_number = $5, status = $6, safety_score = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, license_number.toUpperCase(), license_category, license_expiry_date, contact_number, status, safety_score, id]
    );
    
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Driver not found' });
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating driver:', err);
    if (err.code === '23505') {
      return res.status(400).json({ success: false, error: 'A driver with this license number already exists.' });
    }
    res.status(400).json({ success: false, error: err.message || 'Failed to update driver' });
  }
};
