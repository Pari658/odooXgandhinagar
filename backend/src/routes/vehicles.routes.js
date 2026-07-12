import express from 'express';
import { registerVehicle, getAllVehicles } from '../controllers/vehicleController.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

// All vehicle endpoints require authentication
router.use(authenticateJWT);

// Route mappings for full CRUD execution pipeline
router.post('/', registerVehicle);
router.get('/', getAllVehicles);

export default router;