import express from 'express';
import { registerVehicle, getAllVehicles } from '../controllers/vehicleController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All vehicle endpoints require authentication
router.use(authMiddleware);

// Route mappings for full CRUD execution pipeline
router.post('/', registerVehicle);
router.get('/', getAllVehicles);

export default router;