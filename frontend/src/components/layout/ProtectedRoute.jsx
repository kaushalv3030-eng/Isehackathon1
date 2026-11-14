import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Verifying session...</p>
      </div>
    );
  }

  // Not logged in
  if (!token || !user) {
    const redirectPath = allowedRole === 'faculty' ? '/faculty/login' : '/student/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Role mismatch protection
  if (allowedRole && user.role !== allowedRole) {
    // If student attempts to view faculty routes, send to student overview
    if (user.role === 'student') {
      return <Navigate to="/student/overview" replace />;
    }
    // If faculty attempts to view student routes, send to faculty overview
    if (user.role === 'faculty') {
      return <Navigate to="/faculty/overview" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
