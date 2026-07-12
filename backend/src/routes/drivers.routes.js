import express from 'express';
import { getDrivers, createDriver, updateDriver } from '../controllers/driverController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All driver endpoints require authentication
router.use(authMiddleware);

router.get('/', getDrivers);
router.post('/', createDriver);
router.put('/:id', updateDriver);

export default router;
