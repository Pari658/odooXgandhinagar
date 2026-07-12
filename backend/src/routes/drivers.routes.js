import express from 'express';
import { getDrivers, createDriver, updateDriver } from '../controllers/driverController.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

// All driver endpoints require authentication
router.use(authenticateJWT);

router.get('/', getDrivers);
router.post('/', createDriver);
router.put('/:id', updateDriver);

export default router;
