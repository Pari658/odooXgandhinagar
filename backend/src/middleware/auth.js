/**
 * Authentication Middleware
 * Verifies that the request contains valid Clerk authentication.
 * Enforces that req.auth.userId is populated before allowing access.
 */

export const authMiddleware = (req, res, next) => {
  // Check if req.auth exists and has userId (set by @clerk/express clerkMiddleware)
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication credentials are required.',
    });
  }

  // Optionally, store userId on req for downstream handlers
  req.userId = req.auth.userId;
  
  next();
};

export default authMiddleware;
