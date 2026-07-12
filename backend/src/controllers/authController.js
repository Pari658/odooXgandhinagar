import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const VALID_ROLES = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];
const JWT_EXPIRES_IN = '24h';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const sanitizeUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body; // Silently ignore any role sent

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    const assignedRole = 'Driver';

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at, updated_at`,
      [email.toLowerCase(), passwordHash, name, assignedRole]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const result = await query(
      'SELECT id, email, name, role, password_hash, created_at, updated_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    // Always respond with the same generic message to prevent email enumeration
    const genericMessage = 'If that email is registered, a reset link has been sent.';

    const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.json({ success: true, message: genericMessage });
    }

    const userId = result.rows[0].id;
    const crypto = await import('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    // Expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60000);

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    const { sendEmail } = await import('../utils/sendEmail.js');
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Please click the link below to reset your password. This link expires in 30 minutes.</p>
             <p><a href="${resetUrl}">Reset Password</a></p>`
    });

    return res.json({
      success: true,
      message: genericMessage,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await query(
      `SELECT id, user_id FROM password_reset_tokens 
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link.',
      });
    }

    const { id: tokenId, user_id: userId } = result.rows[0];

    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Start transaction to update password, mark token used, and invalidate other tokens
    await query('BEGIN');
    try {
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, userId]
      );

      await query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
        [tokenId]
      );
      
      // Invalidate any other unused tokens for this user
      await query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
        [userId]
      );

      await query('COMMIT');
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }

    return res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      data: sanitizeUser(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY name ASC'
    );

    return res.json({
      success: true,
      data: result.rows.map(sanitizeUser),
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${VALID_ROLES.join(', ')}.`,
      });
    }

    const result = await query(
      `UPDATE users SET role = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, name, role, created_at, updated_at`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Role updated successfully.',
      data: sanitizeUser(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};
