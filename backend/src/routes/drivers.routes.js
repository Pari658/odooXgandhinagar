import express from 'express';
import { getDrivers, createDriver, updateDriver } from '../controllers/driverController.js';

const router = express.Router();

router.get('/', getDrivers);
router.post('/', createDriver);
router.put('/:id', updateDriver);

export default router;
