import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import driversRoutes from './routes/drivers.routes.js';
import vehicleRoutes from './routes/vehicles.routes.js';
import tripRoutes from './routes/trips.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import reportRoutes from './routes/reports.routes.js';
import { query } from './config/db.js';
import fuelRoutes from './routes/fuel.routes.js';
import expenseRoutes from './routes/expenses.routes.js';
import reportRoutes from './routes/reports.routes.js';
import vehicleRoutes from './routes/vehicles.routes.js';
import driversRoutes from './routes/drivers.routes.js';
import tripRoutes from './routes/trips.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { clerkMiddleware } from '@clerk/express';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET is missing in your .env file!');
  process.exit(1);
}

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', reportsRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TransitOps Engine live on port ${PORT}`);
});
