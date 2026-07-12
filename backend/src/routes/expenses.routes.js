import express from 'express';
import { logExpense, getExpenses } from '../controllers/expenseController.js';

const router = express.Router();

router.post('/', logExpense);
router.get('/', getExpenses);

export default router;
