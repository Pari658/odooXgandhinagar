/**
 * Global Error Handler Middleware
 * Catches errors from all routes and returns consistent JSON responses.
 * Must be registered AFTER all other middleware and routes.
 */

export const errorHandler = (err, req, res, next) => {
  console.error('========== ERROR ==========');
  console.error(err);
  console.error('==========================');

  // Database-specific errors
  if (err.code && err.code.startsWith('23')) {
    // PostgreSQL constraint violations
    if (err.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry: A record with this value already exists.',
        code: err.code,
      });
    }
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: Required field is missing.',
        code: err.code,
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Foreign key violation: Referenced record does not exist.',
        code: err.code,
      });
    }
  }

  // Validation errors
  if (err.message && err.message.includes('validation')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Generic error fallback
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
