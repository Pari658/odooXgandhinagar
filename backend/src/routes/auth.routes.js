import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  getUsers,
  updateUserRole,
} from '../controllers/authController.js';
import authenticateJWT from '../middleware/auth.js';
import { checkRole } from '../middleware/rbac.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', authenticateJWT, getMe);

router.get('/users', authenticateJWT, checkRole('Fleet Manager'), getUsers);
router.patch('/users/:id/role', authenticateJWT, checkRole('Fleet Manager'), updateUserRole);

export default router;
