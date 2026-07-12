import express from "express";
import {
  getMaintenanceLogs,
  createMaintenance,
  closeMaintenance,
} from "../controllers/maintenanceController.js";

const router = express.Router();

// Get all maintenance logs
router.get("/", getMaintenanceLogs);

// Create maintenance record
router.post("/", createMaintenance);

// Close maintenance
router.put("/:id/close", closeMaintenance);

export default router;