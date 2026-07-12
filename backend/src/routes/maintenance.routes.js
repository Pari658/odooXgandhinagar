import express from "express";
import {
  getMaintenanceLogs,
  createMaintenance,
  closeMaintenance,
} from "../controllers/maintenanceController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All maintenance endpoints require authentication
router.use(authMiddleware);

// Get all maintenance logs
router.get("/", getMaintenanceLogs);

// Create maintenance record
router.post("/", createMaintenance);

// Close maintenance
router.put("/:id/close", closeMaintenance);

export default router;