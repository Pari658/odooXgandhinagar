import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { query } from './config/db.js';
import fuelRoutes from './routes/fuel.routes.js';
import expenseRoutes from './routes/expenses.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api/test-db', async (req, res) => {
  try {
    await query('SELECT 1;');
    
    return res.status(200).json({
      success: true,
      message: "🟢 Connection established successfully with Supabase!"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "🔴 Connection handshake failed",
      error: err.message
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TransitOps Engine live on port ${PORT}`);
});