import { query } from "../config/db.js";

/**
 * GET ALL MAINTENANCE LOGS
 */
export const getMaintenanceLogs = async (req, res) => {
  try {
    const result = await query(
      `SELECT
          ml.id,
          ml.vehicle_id,
          v.registration_number,
          ml.description,
          ml.cost,
          ml.logged_date,
          ml.is_closed
       FROM maintenance_logs ml
       JOIN vehicles v
         ON ml.vehicle_id = v.id
       ORDER BY ml.logged_date DESC`
    );

    return res.json({
      success: true,
      logs: result.rows,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * CREATE MAINTENANCE RECORD
 */
export const createMaintenance = async (req, res) => {
  try {
    const {
      vehicle_id,
      description,
      cost,
      logged_date,
    } = req.body;

    // Insert maintenance record
    await query(
      `INSERT INTO maintenance_logs
      (vehicle_id, description, cost, logged_date)
      VALUES ($1,$2,$3,$4)`,
      [
        vehicle_id,
        description,
        cost,
        logged_date,
      ]
    );

    // Update vehicle status
    await query(
      `UPDATE vehicles
       SET status='In Shop'
       WHERE id=$1`,
      [vehicle_id]
    );

    return res.status(201).json({
      success: true,
      message: "Maintenance record created successfully.",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * CLOSE MAINTENANCE
 */
export const closeMaintenance = async (req, res) => {
  try {

    const { id } = req.params;

    // Find vehicle_id
    const maintenance = await query(
      `SELECT vehicle_id
       FROM maintenance_logs
       WHERE id=$1`,
      [id]
    );

    if (maintenance.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found.",
      });
    }

    const vehicleId = maintenance.rows[0].vehicle_id;

    // Close maintenance
    await query(
      `UPDATE maintenance_logs
       SET is_closed=true
       WHERE id=$1`,
      [id]
    );

    // Make vehicle available again
    await query(
      `UPDATE vehicles
       SET status='Available'
       WHERE id=$1`,
      [vehicleId]
    );

    return res.json({
      success: true,
      message: "Maintenance closed successfully.",
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};