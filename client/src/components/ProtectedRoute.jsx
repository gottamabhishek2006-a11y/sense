import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ShieldAlert } from 'lucide-react';

/**
 * ProtectedRoute — Client-side route guard (UX layer only).
 *
 * IMPORTANT: This is a secondary UX guard.
 * PRIMARY security is enforced by backend middleware (requireAuth + requireAdmin).
 * Citizen tokens sent to admin API endpoints will ALWAYS be rejected with 403.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // For admin routes, redirect to admin login; for others, citizen login
    const isAdminRoute = allowedRoles?.includes('admin');
    const loginPath = isAdminRoute ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If specific roles are required, check server-verified role from JWT
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Citizen tried to access admin dashboard — redirect to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
