import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component that restricts access to authenticated users
 * and optionally validates role permissions
 * 
 * @param {Array<string>} allowedRoles - Roles permitted to view this route
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Verifying security session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user session is missing
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is authorized (if role boundaries are defined)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
