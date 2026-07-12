/**
 * Trip Management Controller
 * Handles CRUD operations and business logic for trips.
 * 
 * Business Logic Rules:
 * - When creating a trip, verify vehicle and driver exist and are 'Available'
 * - When a trip transitions to 'Dispatched', set vehicle and driver to 'On Trip'
 * - When a trip transitions to 'Completed' or 'Cancelled', set vehicle and driver to 'Available'
 */

import { query } from '../config/db.js';

/**
 * CREATE - Register a new trip (initial status: 'Draft')
 */
export const createTrip = async (req, res) => {
  try {
    const { source, destination, vehicle_id, driver_id, cargo_weight, planned_distance } = req.body;

    // Validate required fields
    if (!source || !destination || !vehicle_id || !driver_id || !cargo_weight || !planned_distance) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: source, destination, vehicle_id, driver_id, cargo_weight, planned_distance.',
      });
    }

    // Verify vehicle exists and is available
    const vehicleResult = await query(
      'SELECT * FROM vehicles WHERE id = $1',
      [vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Vehicle with ID ${vehicle_id} not found.`,
      });
    }

    const vehicle = vehicleResult.rows[0];
    if (vehicle.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Vehicle is currently '${vehicle.status}' and cannot be assigned to a trip. Only 'Available' vehicles can be used.`,
      });
    }

    // Verify driver exists and is available
    const driverResult = await query(
      'SELECT * FROM drivers WHERE id = $1',
      [driver_id]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Driver with ID ${driver_id} not found.`,
      });
    }

    const driver = driverResult.rows[0];
    if (driver.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Driver is currently '${driver.status}' and cannot be assigned to a trip. Only 'Available' drivers can be used.`,
      });
    }

    // Insert trip with 'Draft' status
    const tripResult = await query(
      `INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, 'Draft']
    );

    return res.status(201).json({
      success: true,
      trip: tripResult.rows[0],
      message: 'Trip created successfully in Draft status.',
    });
  } catch (err) {
    console.error('========== DATABASE ERROR ==========');
    console.error(err);
    console.error('====================================');

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create trip.',
      code: err.code,
    });
  }
};

/**
 * READ - Fetch all trips with optional filters
 */
export const getAllTrips = async (req, res) => {
  try {
    const { status, vehicle_id, driver_id } = req.query;

    let sqlQuery = 'SELECT * FROM trips WHERE 1=1';
    const params = [];

    if (status) {
      sqlQuery += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (vehicle_id) {
      sqlQuery += ` AND vehicle_id = $${params.length + 1}`;
      params.push(vehicle_id);
    }

    if (driver_id) {
      sqlQuery += ` AND driver_id = $${params.length + 1}`;
      params.push(driver_id);
    }

    sqlQuery += ' ORDER BY created_at DESC';

    const result = await query(sqlQuery, params);

    return res.json({
      success: true,
      trips: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('========== DATABASE ERROR ==========');
    console.error(err);
    console.error('====================================');

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch trips.',
      code: err.code,
    });
  }
};

/**
 * READ - Fetch a single trip by ID
 */
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM trips WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Trip with ID ${id} not found.`,
      });
    }

    return res.json({
      success: true,
      trip: result.rows[0],
    });
  } catch (err) {
    console.error('========== DATABASE ERROR ==========');
    console.error(err);
    console.error('====================================');

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch trip.',
      code: err.code,
    });
  }
};

/**
 * UPDATE - Change trip status with business logic
 * Valid transitions:
 * - Draft → Dispatched (vehicle & driver → 'On Trip')
 * - Dispatched → Completed (vehicle & driver → 'Available')
 * - Dispatched → Cancelled (vehicle & driver → 'Available')
 * - Draft → Cancelled (no status changes to vehicles/drivers)
 */
export const updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status is provided
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required for updating trip.',
      });
    }

    // Validate status is in allowed enum
    const validStatuses = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    // Fetch current trip
    const tripResult = await query(
      'SELECT * FROM trips WHERE id = $1',
      [id]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Trip with ID ${id} not found.`,
      });
    }

    const currentTrip = tripResult.rows[0];
    const previousStatus = currentTrip.status;

    // Business Logic: Handle vehicle & driver status updates based on trip status transition
    try {
      if (status === 'Dispatched' && previousStatus === 'Draft') {
        // Transition: Draft → Dispatched
        // Action: Set vehicle and driver to 'On Trip'
        
        await query(
          'UPDATE vehicles SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['On Trip', currentTrip.vehicle_id]
        );

        await query(
          'UPDATE drivers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['On Trip', currentTrip.driver_id]
        );
      } else if (
        (status === 'Completed' || status === 'Cancelled') &&
        previousStatus === 'Dispatched'
      ) {
        // Transitions: Dispatched → Completed OR Dispatched → Cancelled
        // Action: Set vehicle and driver back to 'Available'
        
        await query(
          'UPDATE vehicles SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['Available', currentTrip.vehicle_id]
        );

        await query(
          'UPDATE drivers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['Available', currentTrip.driver_id]
        );
      }
      // Note: Draft → Cancelled doesn't change vehicle/driver status (they remain Available)
    } catch (updateErr) {
      console.error('Error updating vehicle/driver status:', updateErr);
      // Don't fail the trip status update if vehicle/driver updates fail, but log it
    }

    // Update trip status
    const updatedTripResult = await query(
      `UPDATE trips
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return res.json({
      success: true,
      trip: updatedTripResult.rows[0],
      message: `Trip status updated from '${previousStatus}' to '${status}'.`,
    });
  } catch (err) {
    console.error('========== DATABASE ERROR ==========');
    console.error(err);
    console.error('====================================');

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update trip status.',
      code: err.code,
    });
  }
};

/**
 * UPDATE - Update trip details (only allowed for 'Draft' trips)
 */
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, destination, cargo_weight, planned_distance } = req.body;

    // Fetch current trip
    const tripResult = await query(
      'SELECT * FROM trips WHERE id = $1',
      [id]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Trip with ID ${id} not found.`,
      });
    }

    const trip = tripResult.rows[0];

    // Only allow updates to 'Draft' trips
    if (trip.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot update trip with status '${trip.status}'. Only 'Draft' trips can be modified.`,
      });
    }

    // Update trip details
    const updatedResult = await query(
      `UPDATE trips
       SET source = $1, destination = $2, cargo_weight = $3, planned_distance = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [source || trip.source, destination || trip.destination, cargo_weight || trip.cargo_weight, planned_distance || trip.planned_distance, id]
    );

    return res.json({
      success: true,
      trip: updatedResult.rows[0],
      message: 'Trip details updated successfully.',
    });
  } catch (err) {
    console.error('========== DATABASE ERROR ==========');
    console.error(err);
    console.error('====================================');

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update trip.',
      code: err.code,
    });
  }
};

/**
 * DELETE - Remove a trip (only 'Draft' trips can be deleted)
 */
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch trip to verify status
    const tripResult = await query(
      'SELECT * FROM trips WHERE id = $1',
      [id]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Trip with ID ${id} not found.`,
      });
    }

    const trip = tripResult.rows[0];

    if (trip.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete trip with status '${trip.status}'. Only 'Draft' trips can be deleted.`,
      });
    }

    // Delete trip
    await query('DELETE FROM trips WHERE id = $1', [id]);

    return res.json({
      success: true,
      message: 'Trip deleted successfully.',
    });
  } catch (err) {
    console.error('========== DATABASE ERROR ==========');
    console.error(err);
    console.error('====================================');

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete trip.',
      code: err.code,
    });
  }
};
