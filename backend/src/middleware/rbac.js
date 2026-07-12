/**
 * Role-Based Access Control (RBAC) Middleware
 * Verifies that the authenticated user has one of the required roles.
 */

/**
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 */
export const checkRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication credentials are required.',
      });
    }

    const userRole = req.user.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: User role is not assigned.',
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: ${roles.join(', ')}. Your role is: ${userRole}`,
      });
    }

    next();
  };
};

export default checkRole;
