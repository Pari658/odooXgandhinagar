import { pool, query } from '../config/db.js';

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const parsePositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parseNonNegativeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const createTripRecord = async ({ source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue }) => {
  const normalizedSource = String(source ?? '').trim();
  const normalizedDestination = String(destination ?? '').trim();
  const normalizedVehicleId = parsePositiveNumber(vehicle_id);
  const normalizedDriverId = parsePositiveNumber(driver_id);
  const normalizedCargoWeight = parsePositiveNumber(cargo_weight);
  const normalizedPlannedDistance = parsePositiveNumber(planned_distance);
  const normalizedRevenue = revenue == null || revenue === '' ? 0 : parseNonNegativeNumber(revenue);

  if (!normalizedSource || !normalizedDestination) {
    throw createHttpError(400, 'source and destination are required.');
  }

  if (!normalizedVehicleId || !normalizedDriverId) {
    throw createHttpError(400, 'vehicle_id and driver_id must be valid positive numbers.');
  }

  if (!normalizedCargoWeight || !normalizedPlannedDistance) {
    throw createHttpError(400, 'cargo_weight and planned_distance must be greater than 0.');
  }

  if (normalizedRevenue === null) {
    throw createHttpError(400, 'revenue must be a valid non-negative number.');
  }

  const vehicleResult = await query('SELECT id, status, max_load_capacity FROM vehicles WHERE id = $1', [normalizedVehicleId]);
  if (vehicleResult.rows.length === 0) {
    throw createHttpError(404, 'Vehicle not found.');
  }

  const driverResult = await query('SELECT id, status FROM drivers WHERE id = $1', [normalizedDriverId]);
  if (driverResult.rows.length === 0) {
    throw createHttpError(404, 'Driver not found.');
  }

  const vehicle = vehicleResult.rows[0];
  const driver = driverResult.rows[0];

  if (vehicle.status !== 'Available') {
    throw createHttpError(409, 'Vehicle is not available for a new trip.');
  }

  if (driver.status !== 'Available') {
    throw createHttpError(409, 'Driver is not available for a new trip.');
  }

  if (normalizedCargoWeight > Number(vehicle.max_load_capacity)) {
    throw createHttpError(400, 'Cargo weight exceeds vehicle capacity.');
  }

  const tripResult = await query(
    `INSERT INTO trips (
      source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Draft', NOW())
    RETURNING *`,
    [normalizedSource, normalizedDestination, normalizedVehicleId, normalizedDriverId, normalizedCargoWeight, normalizedPlannedDistance, normalizedRevenue]
  );

  return tripResult.rows[0];
};

export const dispatchTripRecord = async (tripId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tripResult = await client.query(
      `SELECT id, status, vehicle_id, driver_id FROM trips WHERE id = $1`,
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      throw createHttpError(404, 'Trip not found.');
    }

    const trip = tripResult.rows[0];
    if (trip.status !== 'Draft') {
      throw createHttpError(409, `Cannot dispatch trip. Current status is "${trip.status}" — only Draft trips can be dispatched.`);
    }

    const vehicleResult = await client.query('SELECT id, status FROM vehicles WHERE id = $1', [trip.vehicle_id]);
    const driverResult = await client.query('SELECT id, status FROM drivers WHERE id = $1', [trip.driver_id]);

    if (vehicleResult.rows.length === 0 || driverResult.rows.length === 0) {
      throw createHttpError(404, 'Associated vehicle or driver no longer exists.');
    }

    if (vehicleResult.rows[0].status !== 'Available') {
      throw createHttpError(409, 'Vehicle is not available for dispatch.');
    }

    if (driverResult.rows[0].status !== 'Available') {
      throw createHttpError(409, 'Driver is not available for dispatch.');
    }

    const updatedTripResult = await client.query(
      `UPDATE trips
       SET status = 'Dispatched', dispatched_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [tripId]
    );

    await client.query("UPDATE vehicles SET status = 'Busy', updated_at = NOW() WHERE id = $1", [trip.vehicle_id]);
    await client.query("UPDATE drivers SET status = 'On Trip', updated_at = NOW() WHERE id = $1", [trip.driver_id]);

    await client.query('COMMIT');

    return updatedTripResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const completeTripRecord = async (tripId, endOdometer, fuelLiters, fuelCost) => {
  const normalizedEndOdometer = parseNonNegativeNumber(endOdometer);
  const normalizedFuelLiters = parseNonNegativeNumber(fuelLiters);
  const normalizedFuelCost = fuelCost == null || fuelCost === '' ? 0 : parseNonNegativeNumber(fuelCost);
  const client = await pool.connect();

  try {
    if (normalizedEndOdometer === null) {
      throw createHttpError(400, 'end_odometer must be a valid non-negative number.');
    }

    if (normalizedFuelLiters === null) {
      throw createHttpError(400, 'fuel_liters must be a valid non-negative number.');
    }

    if (normalizedFuelCost === null) {
      throw createHttpError(400, 'fuel_cost must be a valid non-negative number.');
    }

    await client.query('BEGIN');

    const tripResult = await client.query(
      `SELECT t.id, t.status, t.vehicle_id, t.driver_id, v.start_odometer
       FROM trips t
       LEFT JOIN vehicles v ON v.id = t.vehicle_id
       WHERE t.id = $1`,
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      throw createHttpError(404, 'Trip not found.');
    }

    const trip = tripResult.rows[0];
    if (trip.status !== 'Dispatched') {
      throw createHttpError(409, `Cannot complete trip. Current status is "${trip.status}" — only Dispatched trips can be completed.`);
    }

    const actualDistance = Number(normalizedEndOdometer) - Number(trip.start_odometer ?? 0);
    if (actualDistance < 0) {
      throw createHttpError(400, 'actual_distance cannot be negative.');
    }

    const completedTripResult = await client.query(
      `UPDATE trips
       SET status = 'Completed',
           actual_distance = $2,
           end_odometer = $3,
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [tripId, actualDistance, normalizedEndOdometer]
    );

    await client.query(
      `INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, logged_date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
      [trip.vehicle_id, trip.id, normalizedFuelLiters, normalizedFuelCost]
    );

    await client.query("UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = $1", [trip.vehicle_id]);
    await client.query("UPDATE drivers SET status = 'Available', updated_at = NOW() WHERE id = $1", [trip.driver_id]);

    await client.query('COMMIT');

    return completedTripResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const cancelTripRecord = async (tripId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tripResult = await client.query(
      `SELECT id, status, vehicle_id, driver_id FROM trips WHERE id = $1`,
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      throw createHttpError(404, 'Trip not found.');
    }

    const trip = tripResult.rows[0];
    if (!['Draft', 'Dispatched'].includes(trip.status)) {
      throw createHttpError(409, `Cannot cancel trip. Current status is "${trip.status}" — only Draft or Dispatched trips can be cancelled.`);
    }

    const cancelledTripResult = await client.query(
      `UPDATE trips
       SET status = 'Cancelled', cancelled_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [tripId]
    );

    if (trip.status === 'Dispatched') {
      await client.query("UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = $1", [trip.vehicle_id]);
      await client.query("UPDATE drivers SET status = 'Available', updated_at = NOW() WHERE id = $1", [trip.driver_id]);
    }

    await client.query('COMMIT');

    return cancelledTripResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
