import express from 'express';
import { getKpis, getVehicleReports, exportCsv } from '../controllers/reportController.js';

const router = express.Router();

router.get('/kpis', getKpis);
router.get('/vehicles', getVehicleReports);
router.get('/export', exportCsv);

export default router;
