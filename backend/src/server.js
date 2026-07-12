import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { query } from './config/db.js';
import fuelRoutes from './routes/fuel.routes.js';
import expenseRoutes from './routes/expenses.routes.js';
import reportRoutes from './routes/reports.routes.js';
import vehicleRoutes from './routes/vehicles.routes.js';

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

app.use(express.json());

// Register application routes
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', reportRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Helper route for trips selection pool
app.get('/api/trips', async (req, res) => {
  try {
    const result = await query("SELECT t.id, t.source, t.destination, t.vehicle_id, v.registration_number FROM trips t JOIN vehicles v ON t.vehicle_id = v.id ORDER BY t.id DESC;");
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TransitOps Engine live on port ${PORT}`);
});