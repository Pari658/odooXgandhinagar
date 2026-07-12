/**
 * Role-Based Access Control (RBAC) Middleware
 * Verifies that the authenticated user has the required role(s).
 * Role is stored in req.auth.sessionClaims.metadata.role
 */

/**
 * Factory function to create a role-checking middleware
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 */
export const checkRole = (allowedRoles) => {
  // Normalize to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Ensure authentication was already performed (by authMiddleware)
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication credentials are required.',
      });
    }

    // Extract user role from Clerk session metadata
    const userRole = req.auth.sessionClaims?.metadata?.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: User role is not assigned.',
      });
    }

    // Check if user role is in allowed roles list
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: ${roles.join(', ')}. Your role is: ${userRole}`,
      });
    }

    // Store role on request for downstream handlers
    req.userRole = userRole;

    next();
  };
};

export default checkRole;
