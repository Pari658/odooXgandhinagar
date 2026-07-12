import { query } from "../config/db.js";

/**
 * Register a New Vehicle
 */
export const registerVehicle = async (req, res) => {
  try {
    const {
      registration_number,
      model_name,
      type,
      region,
      max_load_capacity,
      odometer,
      acquisition_cost,
      status,
    } = req.body;

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
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        registration_number?.toUpperCase(),
        model_name,
        type,
        region || null,
        max_load_capacity,
        odometer || 0,
        acquisition_cost,
        status || "Available",
      ]
    );

    return res.status(201).json({
      success: true,
      vehicle: result.rows[0],
    });
  } catch (err) {
    console.error("========== DATABASE ERROR ==========");
    console.error(err);
    console.error("====================================");

    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Registration number already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
};

/**
 * Get All Vehicles
 */
export const getAllVehicles = async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM vehicles ORDER BY id DESC"
    );

    return res.json({
      success: true,
      vehicles: result.rows,
    });
  } catch (err) {
    console.error("========== DATABASE ERROR ==========");
    console.error(err);
    console.error("====================================");

    return res.status(500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
};