import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { query } from './config/db.js';
import fuelRoutes from './routes/fuel.routes.js';
import expenseRoutes from './routes/expenses.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import vehicleRoutes from './routes/vehicles.routes.js';
import driversRoutes from './routes/drivers.routes.js';
import tripRoutes from './routes/trips.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { clerkMiddleware } from '@clerk/express';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// 🔐 Clerk authentication middleware
app.use(clerkMiddleware());

// 🪝 Clerk Webhook endpoint (must be registered before express.json() raw parsing)
app.use(
  '/api/webhooks',
  express.raw({ type: 'application/json' }),
  webhookRoutes
);

app.use(express.json());

// Register API routes
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', reportsRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);

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