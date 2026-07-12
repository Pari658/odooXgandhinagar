import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';

/**
 * Route guard that requires authentication and optionally specific roles.
 *
 * @param {object} props
 * @param {string[]} [props.allowedRoles] - Roles permitted to access this route
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAppAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-sm text-gray-500">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
