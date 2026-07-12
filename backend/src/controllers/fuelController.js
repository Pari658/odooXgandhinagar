import { query } from '../config/db.js';

/**
 * Log a new fuel entry
 * POST /api/fuel
 */
export const logFuel = async (req, res) => {
  try {
    const { vehicle_id, trip_id, liters, cost, logged_date } = req.body;

    // Validation
    if (!vehicle_id) {
      return res.status(400).json({ success: false, message: 'vehicle_id is required' });
    }
    if (liters === undefined || liters === null || parseFloat(liters) <= 0) {
      return res.status(400).json({ success: false, message: 'liters must be greater than 0' });
    }
    if (cost === undefined || cost === null || parseFloat(cost) < 0) {
      return res.status(400).json({ success: false, message: 'cost must be greater than or equal to 0' });
    }

    // Check if vehicle exists
    const vehicleCheck = await query('SELECT id FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicleCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Vehicle with id ${vehicle_id} not found` });
    }

    // Check if trip exists (if provided)
    if (trip_id) {
      const tripCheck = await query('SELECT id, vehicle_id FROM trips WHERE id = $1', [trip_id]);
      if (tripCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: `Trip with id ${trip_id} not found` });
      }
      if (tripCheck.rows[0].vehicle_id !== parseInt(vehicle_id)) {
        return res.status(400).json({
          success: false,
          message: `Trip with id ${trip_id} is associated with vehicle ${tripCheck.rows[0].vehicle_id}, not the requested vehicle ${vehicle_id}`
        });
      }
    }

    // Insert Fuel Log
    const insertQuery = `
      INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, logged_date)
      VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
      RETURNING *
    `;
    const params = [
      vehicle_id,
      trip_id || null,
      parseFloat(liters),
      parseFloat(cost),
      logged_date || null
    ];

    const result = await query(insertQuery, params);
    
    return res.status(201).json({
      success: true,
      message: 'Fuel log recorded successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error logging fuel:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

/**
 * Get all fuel logs
 * GET /api/fuel
 */
export const getFuelLogs = async (req, res) => {
  try {
    const { vehicle_id } = req.query;
    let sql = `
      SELECT 
        fl.id,
        fl.vehicle_id,
        fl.trip_id,
        fl.liters,
        fl.cost,
        to_char(fl.logged_date, 'YYYY-MM-DD') AS logged_date,
        v.registration_number,
        v.model_name,
        t.source,
        t.destination
      FROM fuel_logs fl
      JOIN vehicles v ON fl.vehicle_id = v.id
      LEFT JOIN trips t ON fl.trip_id = t.id
    `;
    const params = [];

    if (vehicle_id) {
      sql += ` WHERE fl.vehicle_id = $1`;
      params.push(vehicle_id);
    }

    sql += ` ORDER BY fl.logged_date DESC, fl.id DESC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching fuel logs:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};
