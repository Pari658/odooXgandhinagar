import express from 'express';
import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTripStatus,
  updateTrip,
  deleteTrip,
} from '../controllers/tripController.js';
import authenticateJWT from '../middleware/auth.js';
import { checkRole } from '../middleware/rbac.js';

const router = express.Router();

/**
 * Trip Routes (Protected by Authentication)
 * All routes require valid JWT authentication.
 * Admin/restricted endpoints also check for 'Fleet Manager' role.
 */

// Protected: All trip endpoints require authentication
router.use(authenticateJWT);

/**
 * POST /api/trips
 * Create a new trip
 * Allows: Any authenticated user
 */
router.post('/', createTrip);

/**
 * GET /api/trips
 * Fetch all trips (with optional filters: status, vehicle_id, driver_id)
 * Allows: Any authenticated user
 * Query params: ?status=Draft&vehicle_id=1&driver_id=2
 */
router.get('/', getAllTrips);

/**
 * GET /api/trips/:id
 * Fetch a single trip by ID
 * Allows: Any authenticated user
 */
router.get('/:id', getTripById);

/**
 * PUT /api/trips/:id/status
 * Update trip status (with automatic vehicle/driver status sync)
 * Allows: Any authenticated user
 * Restricted to: 'Fleet Manager' role
 * Body: { status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled' }
 */
router.put('/:id/status', checkRole('Fleet Manager'), updateTripStatus);

/**
 * PUT /api/trips/:id
 * Update trip details (only for Draft trips)
 * Allows: Any authenticated user
 * Restricted to: 'Fleet Manager' role
 * Body: { source?, destination?, cargo_weight?, planned_distance? }
 */
router.put('/:id', checkRole('Fleet Manager'), updateTrip);

/**
 * DELETE /api/trips/:id
 * Delete a trip (only Draft trips can be deleted)
 * Allows: Any authenticated user
 * Restricted to: 'Fleet Manager' role
 */
router.delete('/:id', checkRole('Fleet Manager'), deleteTrip);

export default router;
