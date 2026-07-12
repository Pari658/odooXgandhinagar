import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { clerkMiddleware } from '@clerk/express';

// import authRoutes from './routes/auth.routes.js';
// import vehicleRoutes from './routes/vehicles.routes.js';
// import driverRoutes from './routes/drivers.routes.js';
// import tripRoutes from './routes/trips.routes.js';
// import maintenanceRoutes from './routes/maintenance.routes.js';
// import fuelRoutes from './routes/fuel.routes.js';
// import expenseRoutes from './routes/expenses.routes.js';
// import reportRoutes from './routes/reports.routes.js';

// import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true,
  })
);

app.use(clerkMiddleware());

app.use(
  '/api/webhooks',
  express.raw({ type: 'application/json' }),
  // webhookRoutes
);

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// app.use('/api/auth', authRoutes);
// app.use('/api/vehicles', vehicleRoutes);
// app.use('/api/drivers', driverRoutes);
// app.use('/api/trips', tripRoutes);
// app.use('/api/maintenance', maintenanceRoutes);
// app.use('/api/fuel', fuelRoutes);
// app.use('/api/expenses', expenseRoutes);
// app.use('/api/reports', reportRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TransitOps Engine live on port ${PORT}`);
});