import express from 'express';
import { getDashboardStats } from '../controllers/reportController.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateJWT);

import { 
  getKpis, 
  getVehicleReports, 
  exportCsv, 
  getDashboardStats 
} from '../controllers/reportController.js';

const router = express.Router();

// Landing Page Dashboard Stats
router.get('/stats', getDashboardStats);

// Operational reports and exports
router.get('/kpis', getKpis);
router.get('/vehicles', getVehicleReports);
router.get('/export', exportCsv);

export default router;
