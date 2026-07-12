import express from 'express';
import { registerVehicle, getAllVehicles } from '../controllers/vehicleController.js';

const router = express.Router();

// Route mappings for full CRUD execution pipeline
router.post('/', registerVehicle);
router.get('/', getAllVehicles);

export default router;