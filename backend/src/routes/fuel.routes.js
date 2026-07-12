import express from 'express';
import { logFuel, getFuelLogs } from '../controllers/fuelController.js';

const router = express.Router();

router.post('/', logFuel);
router.get('/', getFuelLogs);

export default router;
